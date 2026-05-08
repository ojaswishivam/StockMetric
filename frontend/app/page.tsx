"use client";

import { useState, useEffect, useRef } from "react";
import AnalysisResult from "@/components/AnalysisResult";
import ScreenerTable from "@/components/ScreenerTable";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const [screenerData, setScreenerData] = useState<any[]>([]);
  const [resultRows, setResultRows] = useState<any[]>([]);
  const [manualCheckRows, setManualCheckRows] = useState<any[]>([]);
  const [screenerScrapedRows, setScreenerScrapedRows] = useState<any[]>([]);
  const [watchlists, setWatchlists] = useState<Record<string, any[]>>({ "Default": [] });
  const [tickerWatchlists, setTickerWatchlists] = useState<Record<string, Set<string>>>({});
  const [activeWatchlistName, setActiveWatchlistName] = useState<string>("Default");
  const [activeWatchlistMenu, setActiveWatchlistMenu] = useState<string | null>(null);
  const [resultScanProgress, setResultScanProgress] = useState({ done: 0, total: 0 });
  const [scanningResults, setScanningResults] = useState(false);
  const [activeScreenerTab, setActiveScreenerTab] = useState<'overview' | 'result' | 'manual' | 'screener' | 'watchlist'>('overview');
  const [loadingList, setLoadingList] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState({ done: 0, total: 0 });

  const [analyzingTicker, setAnalyzingTicker] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loadingAnal, setLoadingAnal] = useState(false);
  const [error, setError] = useState("");

  // EV/EBITDA filter range (defaults)
  const evMin = 4;
  const evMax = 8;

  const fetchScreenerList = () => {
    setLoadingList(true);
    fetch(`${apiUrl}/screener-list`)
      .then(res => res.json())
      .then(data => {
        setScreenerData(data);
        setLoadingList(false);
      })
      .catch(err => {
        setError("Failed to load screener list");
        setLoadingList(false);
      });
  };

  const fetchWatchlists = async () => {
    try {
      const res = await fetch(`${apiUrl}/watchlists`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error("Invalid data format");
      }

      setWatchlists(data);
      
      const newTickerMap: Record<string, Set<string>> = {};
      Object.entries(data).forEach(([listName, items]: [string, any]) => {
        if (Array.isArray(items)) {
          items.forEach((item: any) => {
            if (item && item.ticker) {
              if (!newTickerMap[item.ticker]) newTickerMap[item.ticker] = new Set();
              newTickerMap[item.ticker].add(listName);
            }
          });
        }
      });
      setTickerWatchlists(newTickerMap);
    } catch (err: any) {
      console.error("Failed to load watchlists:", err);
    }
  };

  const toggleWatchlist = async (ticker: string, listName: string, isWatched: boolean) => {
    // Optimistic update
    const currentSet = tickerWatchlists[ticker] || new Set();
    const newSet = new Set(currentSet);
    if (isWatched) newSet.add(listName);
    else newSet.delete(listName);
    setTickerWatchlists({ ...tickerWatchlists, [ticker]: newSet });

    try {
      const method = isWatched ? 'POST' : 'DELETE';
      const res = await fetch(`${apiUrl}/watchlists/${encodeURIComponent(listName)}/${encodeURIComponent(ticker)}`, { method });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }
      fetchWatchlists();
    } catch (err) {
      console.error("Failed to toggle watchlist:", err);
      fetchWatchlists(); // Revert on error
    }
  };

  const createWatchlist = async (listName: string) => {
    if (!listName.trim() || watchlists[listName]) return;
    try {
      const res = await fetch(`${apiUrl}/watchlists/${encodeURIComponent(listName.trim())}`, { method: 'POST' });
      if (!res.ok) throw new Error("Failed to create watchlist");
      fetchWatchlists();
      setActiveWatchlistName(listName.trim());
    } catch (err) {
      console.error("Failed to create watchlist:", err);
    }
  };

  const deleteWatchlist = async (listName: string) => {
    if (listName === 'Default') return;
    try {
      const res = await fetch(`${apiUrl}/watchlists/${encodeURIComponent(listName)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete watchlist");
      if (activeWatchlistName === listName) setActiveWatchlistName('Default');
      fetchWatchlists();
    } catch (err) {
      console.error("Failed to delete watchlist:", err);
    }
  };

  useEffect(() => {
    fetchScreenerList();
    fetchWatchlists();
  }, [apiUrl]);

  const scanController = useRef<AbortController | null>(null);
  const [scanPausedCountdown, setScanPausedCountdown] = useState<number | null>(null);

  const TRANSIENT_PAUSE_SECS = 30;

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const startScan = async () => {
    if (scanningResults || !screenerData.length) return;

    scanController.current = new AbortController();
    const scoredTickers = new Set<string>();

    setResultRows([]);
    setManualCheckRows([]);
    setResultScanProgress({ done: 0, total: screenerData.length });
    setScanningResults(true);
    setScanPausedCountdown(null);

    let retryCount = 0;
    const MAX_RETRIES = 2;

    let index = 0;
    while (index < screenerData.length) {
      if (scanController.current?.signal.aborted) break;

      const row = screenerData[index];

      try {
        const response = await fetch(`${apiUrl}/analyze-score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker: row.ticker, ev_min: evMin, ev_max: evMax }),
          signal: scanController.current.signal,
        });

        // Transient error (503) — pause scan and retry the same ticker
        if (response.status === 503) {
          retryCount++;
          if (retryCount > MAX_RETRIES) {
            // Too many retries for this ticker — skip to manual check
            setManualCheckRows(current => [...current, row]);
            scoredTickers.add(row.ticker);
            retryCount = 0;
            index++;
            continue;
          }
          for (let secs = TRANSIENT_PAUSE_SECS; secs > 0; secs--) {
            if (scanController.current?.signal.aborted) break;
            setScanPausedCountdown(secs);
            await sleep(1000);
          }
          setScanPausedCountdown(null);
          // Do NOT increment index — retry same stock
          continue;
        }

        retryCount = 0; // Reset on success

        if (!response.ok) {
          setManualCheckRows(current => [...current, row]);
          scoredTickers.add(row.ticker);
          index++;
          continue;
        }

        const analysis = await response.json();
        
        // Manual Check is ONLY for fetching failures or insufficient data
        if (analysis.status === "insufficient_data" || analysis.status === "manual_check" || analysis.status === "error") {
          setManualCheckRows(current => [...current, row]);
          scoredTickers.add(row.ticker);
          index++;
          continue;
        }

        scoredTickers.add(row.ticker);

        // Score >= 5 goes to Results tab
        if (Number(analysis.score) >= 5) {
          setResultRows(current => [...current, row]);
        }
        // Stocks with score < 5 simply remain in Overview (not moved anywhere else)
        index++;
      } catch (err: any) {
        if (err?.name === "AbortError") break;
        setManualCheckRows(current => [...current, row]);
        scoredTickers.add(row.ticker);
        index++;
      } finally {
        if (!scanController.current?.signal.aborted) {
          setResultScanProgress({ done: scoredTickers.size, total: screenerData.length });
        }
      }
    }

    setScanPausedCountdown(null);
    if (!scanController.current?.signal.aborted) setScanningResults(false);
  };

  const stopScan = () => {
    if (scanController.current) {
      scanController.current.abort();
      setScanningResults(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scanController.current) {
        scanController.current.abort();
      }
    };
  }, []);

  const handleAnalyze = async (ticker: string) => {
    // ── Screener.in result click-through (no API call needed) ──
    if (ticker.endsWith('__screener')) {
      const cached = screenerResultCache.current[ticker];
      if (cached) {
        setAnalyzingTicker(ticker);
        setResult(cached);
      }
      return;
    }

    setAnalyzingTicker(ticker);
    setLoadingAnal(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, ev_min: evMin, ev_max: evMax }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze stock");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAnal(false);
    }
  };

  const handleBack = () => {
    setAnalyzingTicker(null);
    setResult(null);
  };

  // ── Screener.in scraper ─────────────────────────────────────
  // Cache scraped results by ticker so clicking a row re-uses them
  const screenerResultCache = useRef<Record<string, any>>({});

  const handleScrapeScreener = async () => {
    if (isScraping || manualCheckRows.length === 0) return;
    setIsScraping(true);
    setScrapeProgress({ done: 0, total: manualCheckRows.length });
    setActiveScreenerTab('screener');

    const tickers = manualCheckRows.map(r => r.ticker);
    try {
      const response = await fetch(`${apiUrl}/scrape-screener-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers, ev_min: evMin, ev_max: evMax }),
      });
      if (!response.ok) throw new Error('Scrape batch request failed');
      const data = await response.json();
      const rows = data.results || [];
      // Cache successful results by ticker for click-through display
      rows.forEach((r: any) => {
        if (r.status === 'ok') screenerResultCache.current[r.ticker + '__screener'] = r;
      });
      setScreenerScrapedRows(rows);
    } catch (err: any) {
      setError(err.message || 'Screener scrape failed');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <>
      <div className="terminal-top-bar">
        {analyzingTicker ? (
          <button className="back-btn" onClick={handleBack}>← Back to Screener</button>
        ) : (
          <div className="table-stats-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <span>TICKER <br/> <strong style={{color:'var(--fg)'}}>{screenerData.length} matches</strong></span>
            {scanPausedCountdown !== null && (
              <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>
                ⏸ Rate limit hit — resuming in {scanPausedCountdown}s…
              </div>
            )}
            {!scanningResults ? (
              <button className="back-btn" onClick={startScan}>Start Auto-Scan</button>
            ) : (
              <button className="back-btn" style={{ background: '#ff4444', color: 'white', border: 'none' }} onClick={stopScan}>Stop Scan</button>
            )}
            
            <button
              className={`back-btn ${activeScreenerTab === 'watchlist' ? 'active' : ''}`}
              onClick={() => setActiveScreenerTab('watchlist')}
              style={{ 
                color: activeScreenerTab === 'watchlist' ? '#fbbf24' : '#e4e4e7',
                border: activeScreenerTab === 'watchlist' ? '1px solid rgba(251, 191, 36, 0.5)' : undefined,
                background: activeScreenerTab === 'watchlist' ? 'rgba(251, 191, 36, 0.1)' : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ★ Watchlist
              <span style={{ 
                background: activeScreenerTab === 'watchlist' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.1)', 
                padding: '2px 6px', 
                borderRadius: '12px', 
                fontSize: '0.7rem' 
              }}>
                {watchlists[activeWatchlistName]?.length || 0}
              </span>
            </button>

            {/* EV/EBITDA Filter removed per user request */}
          </div>
        )}
      </div>

      <div className="terminal-workspace">
        {error && <div className="terminal-error">{error}</div>}
        
        {!analyzingTicker && (
          loadingList ? (
            <div className="terminal-loading">Loading market data...</div>
          ) : (
            <ScreenerTable
              data={screenerData}
              resultData={resultRows}
              manualCheckData={manualCheckRows}
              screenerData={screenerScrapedRows}
              resultScanProgress={resultScanProgress}
              scanningResults={scanningResults}
              isScraping={isScraping}
              scrapeProgress={scrapeProgress}
              activeTab={activeScreenerTab}
              onActiveTabChange={setActiveScreenerTab}
              onSelectRow={handleAnalyze}
              onScrapeScreener={handleScrapeScreener}
              onUploadSuccess={fetchScreenerList}
              watchlistData={watchlists[activeWatchlistName] || []}
              watchlists={watchlists}
              tickerWatchlists={tickerWatchlists}
              activeWatchlistName={activeWatchlistName}
              onActiveWatchlistChange={setActiveWatchlistName}
              activeWatchlistMenu={activeWatchlistMenu}
              onOpenWatchlistMenu={setActiveWatchlistMenu}
              onToggleWatchlist={toggleWatchlist}
              onCreateWatchlist={createWatchlist}
              onDeleteWatchlist={deleteWatchlist}
            />
          )
        )}

        {analyzingTicker && (
          loadingAnal ? (
            <div className="terminal-loading">Analyzing {analyzingTicker}...</div>
          ) : (
            result && (
              <div className="analysis-grid-wrapper">
                <AnalysisResult 
                  result={result} 
                  isWatched={(tickerWatchlists[result.ticker]?.size || 0) > 0}
                  watchlists={watchlists}
                  tickerWatchlists={tickerWatchlists}
                  activeWatchlistMenu={activeWatchlistMenu}
                  onOpenWatchlistMenu={setActiveWatchlistMenu}
                  onToggleWatchlist={toggleWatchlist}
                  onCreateWatchlist={createWatchlist}
                />
              </div>
            )
          )
        )}
      </div>
    </>
  );
}
