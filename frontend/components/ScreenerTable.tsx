"use client";

import React, { useState, useRef } from 'react';

type ScreenerRow = {
  ticker: string;
  name: string;
  current_price: number | null;
  ev_ebitda: number | null;
  pe: number | null;
  industry_pe: number | null;
  market_cap: number | null;
};

type ScraperResult = {
  status: string;
  ticker: string;
  company_name?: string;
  score?: number;
  max_score?: number;
  rating?: string;
  valuation_status?: string;
  market_info?: { current_price?: number; market_cap?: number };
  detail?: string;
};

type ScanProgress = {
  done: number;
  total: number;
};

type ScreenerTab = 'overview' | 'result' | 'manual' | 'screener' | 'watchlist';

type ScreenerTableProps = {
  data: ScreenerRow[];
  resultData: ScreenerRow[];
  manualCheckData: ScreenerRow[];
  screenerData: ScraperResult[];
  resultScanProgress: ScanProgress;
  scanningResults: boolean;
  isScraping: boolean;
  scrapeProgress: { done: number; total: number };
  activeTab: ScreenerTab;
  onActiveTabChange: (tab: ScreenerTab) => void;
  onSelectRow: (ticker: string) => void;
  onScrapeScreener: () => void;
  onUploadSuccess?: () => void;
  watchlistData?: ScreenerRow[];
  watchlists?: Record<string, any[]>;
  tickerWatchlists?: Record<string, Set<string>>;
  activeWatchlistName?: string;
  onActiveWatchlistChange?: (name: string) => void;
  activeWatchlistMenu?: string | null;
  onOpenWatchlistMenu?: (ticker: string | null) => void;
  onToggleWatchlist?: (ticker: string, listName: string, isWatched: boolean) => void;
  onCreateWatchlist?: (listName: string) => void;
  onDeleteWatchlist?: (listName: string) => void;
};

import WatchlistMenu from "./WatchlistMenu";

const RATING_COLOR: Record<string, string> = {
  "Strong Buy": "var(--green)",
  "Moderate":   "var(--amber)",
  "Weak":       "var(--red)",
};

const VALUATION_COLOR: Record<string, string> = {
  "Undervalued":  "var(--green)",
  "Manual Check": "var(--amber)",
  "Rejected":     "var(--red)",
};

export default function ScreenerTable({
  data,
  resultData,
  manualCheckData,
  screenerData,
  resultScanProgress,
  scanningResults,
  isScraping,
  scrapeProgress,
  activeTab,
  onActiveTabChange,
  onSelectRow,
  onScrapeScreener,
  onUploadSuccess,
  watchlistData = [],
  watchlists = {},
  tickerWatchlists = {},
  activeWatchlistName = "Default",
  onActiveWatchlistChange,
  activeWatchlistMenu = null,
  onOpenWatchlistMenu,
  onToggleWatchlist,
  onCreateWatchlist,
  onDeleteWatchlist,
}: ScreenerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload-screener", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        if (onUploadSuccess) onUploadSuccess();
      } else {
        const errorData = await res.json();
        alert(`Upload failed: ${errorData.detail}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const activeData =
    activeTab === 'result'   ? resultData :
    activeTab === 'manual'   ? manualCheckData :
    activeTab === 'screener' ? [] :  // screener has its own table
    activeTab === 'watchlist'? watchlistData :
    data;

  const filtered = activeData.filter(r =>
    r.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredScreener = screenerData.filter(r =>
    r.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="table-container">
      <div className="table-header-band">
        <div className="table-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => onActiveTabChange('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'result' ? 'active' : ''}
            onClick={() => onActiveTabChange('result')}
          >
            Result
            <span className="tab-count">{resultData.length}</span>
          </button>
          <button
            className={activeTab === 'manual' ? 'active' : ''}
            onClick={() => onActiveTabChange('manual')}
          >
            Check Manually
            <span className="tab-count">{manualCheckData.length}</span>
          </button>
          <button
            className={activeTab === 'screener' ? 'active' : ''}
            onClick={() => onActiveTabChange('screener')}
          >
            Screener
            <span className="tab-count">{screenerData.filter(r => r.status === 'ok').length}</span>
          </button>
        </div>

        <div className="table-filters" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeTab === 'watchlist' && onActiveWatchlistChange && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '10px', overflowX: 'auto', padding: '2px 0' }}>
              {Object.keys(watchlists).map(name => (
                <button
                  key={name}
                  onClick={() => onActiveWatchlistChange(name)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    fontWeight: activeWatchlistName === name ? 600 : 400,
                    backgroundColor: activeWatchlistName === name ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: activeWatchlistName === name ? '#60a5fa' : '#a1a1aa',
                    border: `1px solid ${activeWatchlistName === name ? '#3b82f6' : '#3f3f46'}`,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {name}
                  <span style={{ 
                    opacity: 0.6, 
                    fontSize: '0.7rem',
                    background: activeWatchlistName === name ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                    padding: '1px 5px',
                    borderRadius: '8px'
                  }}>
                    {watchlists[name]?.length || 0}
                  </span>
                </button>
              ))}
              {!isCreatingList ? (
                <button 
                  onClick={() => setIsCreatingList(true)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    backgroundColor: 'transparent',
                    color: '#a1a1aa',
                    border: '1px dashed #52525b',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  + New List
                </button>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newListName.trim() && onCreateWatchlist) {
                      onCreateWatchlist(newListName.trim());
                      setNewListName('');
                      setIsCreatingList(false);
                    }
                  }}
                  style={{ display: 'flex', gap: '4px' }}
                >
                  <input 
                    autoFocus
                    type="text" 
                    value={newListName}
                    onChange={e => setNewListName(e.target.value)}
                    placeholder="Name..."
                    style={{
                      padding: '2px 8px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      backgroundColor: '#27272a',
                      color: '#e4e4e7',
                      border: '1px solid #3b82f6',
                      width: '100px',
                      outline: 'none'
                    }}
                    onBlur={() => {
                      if (!newListName.trim()) setIsCreatingList(false);
                    }}
                  />
                </form>
              )}

              {activeWatchlistName !== 'Default' && onDeleteWatchlist && (
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', paddingLeft: '12px' }}>
                  <div style={{ borderLeft: '1px solid #3f3f46', height: '16px', marginRight: '12px' }} />
                  <button 
                    onClick={() => onDeleteWatchlist(activeWatchlistName)}
                    title={`Delete ${activeWatchlistName} watchlist`}
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.05)', 
                      border: '1px solid rgba(239, 68, 68, 0.3)', 
                      color: '#ef4444', 
                      borderRadius: '4px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer', 
                      fontSize: '0.75rem',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Delete List
                  </button>
                </div>
              )}
            </div>
          )}
          {(activeTab === 'result' || activeTab === 'manual') && scanningResults && (
            <span className="result-scan-status">
              Scanning {resultScanProgress.done}/{resultScanProgress.total}
            </span>
          )}

          {/* Scrape Screener button — visible on Check Manually tab */}
          {activeTab === 'manual' && !scanningResults && (
            <button
              id="scrape-screener-btn"
              className={`scrape-screener-btn ${isScraping ? 'scraping' : ''}`}
              onClick={onScrapeScreener}
              disabled={isScraping || manualCheckData.length === 0}
            >
              {isScraping
                ? `⏳ Scraping ${scrapeProgress.done}/${scrapeProgress.total}…`
                : '🔎 Scrape Screener'}
            </button>
          )}

          {activeTab === 'screener' && isScraping && (
            <span className="result-scan-status scrape-amber">
              ⏳ Scraping {scrapeProgress.done}/{scrapeProgress.total}
            </span>
          )}

          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mini-search"
          />
          <button 
            className="back-btn" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload CSV"}
          </button>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            style={{ display: "none" }} 
          />
        </div>
      </div>

      <div className="table-scroll">
        {activeTab !== 'screener' ? (
          /* ── Standard overview / result / manual table ── */
          <table className="terminal-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '30px' }}></th>
                <th style={{ textAlign: 'left' }}>TICKER</th>
                <th style={{ textAlign: 'left' }}>NAME</th>
                <th>LAST</th>
                <th>EV/EBITDA</th>
                <th>P/E</th>
                <th>IND P/E</th>
                <th>MKT CAP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const peOk = row.pe && row.industry_pe && row.pe < row.industry_pe;
                const evOk = row.ev_ebitda && row.ev_ebitda >= 4 && row.ev_ebitda <= 8;

                return (
                  <tr key={row.ticker} onClick={() => onSelectRow(row.ticker)}>
                    <td style={{ textAlign: 'center', position: 'relative' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenWatchlistMenu) onOpenWatchlistMenu(activeWatchlistMenu === row.ticker ? null : row.ticker);
                        }} 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: (tickerWatchlists[row.ticker]?.size || 0) > 0 ? '#fbbf24' : '#52525b', 
                          fontSize: '1.2rem',
                          userSelect: 'none',
                          padding: 0,
                          outline: 'none'
                        }}
                        title="Manage Watchlists"
                      >
                        {(tickerWatchlists[row.ticker]?.size || 0) > 0 ? '★' : '☆'}
                      </button>
                      {activeWatchlistMenu === row.ticker && onToggleWatchlist && onCreateWatchlist && (
                        <WatchlistMenu 
                          ticker={row.ticker}
                          watchlists={watchlists}
                          tickerWatchlists={tickerWatchlists}
                          onToggleWatchlist={onToggleWatchlist}
                          onCreateWatchlist={onCreateWatchlist}
                          onClose={() => onOpenWatchlistMenu && onOpenWatchlistMenu(null)}
                        />
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }} className="blue-text">{row.ticker.split('.')[0]}</td>
                    <td style={{ textAlign: 'left', color: 'var(--muted)' }}>{row.name.substring(0, 25)}</td>
                    <td>{row.current_price ? Number(row.current_price).toFixed(2) : '-'}</td>
                    <td className={evOk ? 'green-text' : 'red-text'}>
                      {row.ev_ebitda !== null ? Number(row.ev_ebitda).toFixed(2) : '-'}
                    </td>
                    <td className={peOk ? 'green-text' : 'red-text'}>
                      {row.pe !== null ? Number(row.pe).toFixed(2) : '-'}
                    </td>
                    <td>{row.industry_pe !== null ? Number(row.industry_pe).toFixed(2) : '-'}</td>
                    <td>{row.market_cap ? (row.market_cap / 10000000).toFixed(2) + ' Cr' : '-'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table-message">
                    {activeTab === 'result' && scanningResults
                      ? 'Finding stocks with score ≥5/8…'
                      : activeTab === 'manual' && scanningResults
                      ? 'Finding stocks that need manual checking…'
                      : activeTab === 'manual'
                      ? 'No failed stocks yet — run the Auto-Scan first'
                      : 'No stocks found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          /* ── Screener tab — analysis results from Screener.in ── */
          <table className="terminal-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '30px' }}></th>
                <th style={{ textAlign: 'left' }}>TICKER</th>
                <th style={{ textAlign: 'left' }}>NAME</th>
                <th>PRICE</th>
                <th>SCORE</th>
                <th>RATING</th>
                <th>VALUATION</th>
                <th>MKT CAP</th>
              </tr>
            </thead>
            <tbody>
              {filteredScreener.map(row => (
                <tr
                  key={row.ticker}
                  onClick={() => row.status === 'ok' && onSelectRow(row.ticker + '__screener')}
                  style={{ opacity: row.status === 'failed' ? 0.45 : 1 }}
                >
                  <td style={{ textAlign: 'center', position: 'relative' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenWatchlistMenu) onOpenWatchlistMenu(activeWatchlistMenu === row.ticker ? null : row.ticker);
                      }} 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: (tickerWatchlists[row.ticker]?.size || 0) > 0 ? '#fbbf24' : '#52525b', 
                        fontSize: '1.2rem',
                        userSelect: 'none',
                        padding: 0,
                        outline: 'none'
                      }}
                      title="Manage Watchlists"
                    >
                      {(tickerWatchlists[row.ticker]?.size || 0) > 0 ? '★' : '☆'}
                    </button>
                    {activeWatchlistMenu === row.ticker && onToggleWatchlist && onCreateWatchlist && (
                      <WatchlistMenu 
                        ticker={row.ticker}
                        watchlists={watchlists}
                        tickerWatchlists={tickerWatchlists}
                        onToggleWatchlist={onToggleWatchlist}
                        onCreateWatchlist={onCreateWatchlist}
                        onClose={() => onOpenWatchlistMenu && onOpenWatchlistMenu(null)}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: 'left' }} className="blue-text">
                    {row.ticker.split('.')[0]}
                  </td>
                  <td style={{ textAlign: 'left', color: 'var(--muted)' }}>
                    {row.status === 'ok'
                      ? (row.company_name || row.ticker).substring(0, 25)
                      : <span style={{ color: 'var(--red)', fontSize: '0.72rem' }}>✗ {row.detail?.substring(0, 35)}</span>}
                  </td>
                  <td>
                    {row.market_info?.current_price
                      ? Number(row.market_info.current_price).toFixed(2)
                      : '-'}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {row.status === 'ok' ? `${row.score}/${row.max_score}` : '-'}
                  </td>
                  <td style={{ color: RATING_COLOR[row.rating || ''] || 'var(--muted)', fontWeight: 600 }}>
                    {row.rating || '-'}
                  </td>
                  <td style={{ color: VALUATION_COLOR[row.valuation_status || ''] || 'var(--muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                    {row.valuation_status || '-'}
                  </td>
                  <td>
                    {row.market_info?.market_cap
                      ? (row.market_info.market_cap / 10000000).toFixed(2) + ' Cr'
                      : '-'}
                  </td>
                </tr>
              ))}
              {filteredScreener.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table-message">
                    {isScraping
                      ? 'Scraping Screener.in… please wait.'
                      : 'No data yet — go to "Check Manually" tab and click "Scrape Screener"'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
