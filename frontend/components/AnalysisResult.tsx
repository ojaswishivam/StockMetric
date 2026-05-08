"use client";

import React from "react";
import FilterCard from "./FilterCard";
import MarketInfoPanel from "./MarketInfoPanel";
import PBChart from "./PBChart";
import ShareholderChart from "./ShareholderChart";
import PriceChart from "./PriceChart";
import RsiChart from "./RsiChart";

const VALUATION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "Undervalued":   { label: "Undervalued ✓",       color: "#16a34a", bg: "rgba(34,197,94,0.1)"   },
  "Manual Check":  { label: "Manual Review ⚠",      color: "#d97706", bg: "rgba(251,191,36,0.1)"  },
  "Rejected":      { label: "Rejected ✕",            color: "#dc2626", bg: "rgba(239,68,68,0.1)"   },
};

const RATING_CONFIG: Record<string, { color: string; bg: string }> = {
  "Strong Buy": { color: "#16a34a", bg: "rgba(34,197,94,0.12)"  },
  "Moderate":   { color: "#d97706", bg: "rgba(251,191,36,0.12)" },
  "Weak":       { color: "#dc2626", bg: "rgba(239,68,68,0.12)"  },
};

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  let color = "#dc2626";
  if (pct >= 77) color = "#16a34a";
  else if (pct >= 44) color = "#d97706";

  return (
    <div className="score-bar-wrapper">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="score-bar-label" style={{ color }}>{score} / {maxScore}</span>
    </div>
  );
}

import WatchlistMenu from "./WatchlistMenu";

export default function AnalysisResult({ 
  result, 
  isWatched,
  watchlists,
  tickerWatchlists,
  activeWatchlistMenu,
  onOpenWatchlistMenu,
  onToggleWatchlist,
  onCreateWatchlist
}: { 
  result: any;
  isWatched?: boolean;
  watchlists?: Record<string, any[]>;
  tickerWatchlists?: Record<string, Set<string>>;
  activeWatchlistMenu?: string | null;
  onOpenWatchlistMenu?: (ticker: string | null) => void;
  onToggleWatchlist?: (ticker: string, listName: string, isWatched: boolean) => void;
  onCreateWatchlist?: (listName: string) => void;
}) {
  if (!result) return null;

  const valCfg  = VALUATION_CONFIG[result.valuation_status] ?? VALUATION_CONFIG["Rejected"];
  const rateCfg = RATING_CONFIG[result.rating]              ?? RATING_CONFIG["Weak"];
  const vf       = result.valuation_flags ?? {};

  return (
    <div className="analysis-widget-grid">

      {/* ── Header ────────────────────────────────────── */}
      <div className="result-header">
        <div className="title-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <h2 className="result-ticker" style={{ margin: 0, lineHeight: 1 }}>{result.ticker}</h2>
            {onToggleWatchlist && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenWatchlistMenu) {
                      onOpenWatchlistMenu(activeWatchlistMenu === result.ticker ? null : result.ticker);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    color: isWatched ? '#fbbf24' : '#52525b',
                    padding: '0 4px',
                    lineHeight: 1,
                    outline: 'none'
                  }}
                  title="Manage Watchlists"
                >
                  {isWatched ? '★' : '☆'}
                </button>
                {activeWatchlistMenu === result.ticker && watchlists && tickerWatchlists && onCreateWatchlist && (
                  <WatchlistMenu 
                    ticker={result.ticker}
                    watchlists={watchlists}
                    tickerWatchlists={tickerWatchlists}
                    onToggleWatchlist={onToggleWatchlist}
                    onCreateWatchlist={onCreateWatchlist}
                    onClose={() => onOpenWatchlistMenu && onOpenWatchlistMenu(null)}
                  />
                )}
              </>
            )}
          </div>
          {result.company_name && (
            <div style={{ color: '#a1a1aa', fontSize: '1rem', fontWeight: 500 }}>
              {result.company_name}
            </div>
          )}
          {(result.industry_group || result.industry) && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
              {result.industry_group && (
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#3f3f46', color: '#e4e4e7', fontSize: '0.75rem', fontWeight: 500 }}>
                  {result.industry_group}
                </span>
              )}
              {result.industry && result.industry !== result.industry_group && (
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#27272a', color: '#d4d4d8', fontSize: '0.75rem', border: '1px solid #3f3f46' }}>
                  {result.industry}
                </span>
              )}
            </div>
          )}
          <div style={{ marginTop: '8px' }}>
            <span className="valuation-badge" style={{ color: valCfg.color, background: valCfg.bg, display: 'inline-block' }}>
              {valCfg.label}
            </span>
          </div>
        </div>
        <div className="rating-block" style={{ background: rateCfg.bg }}>
          <div className="rating-label" style={{ color: rateCfg.color }}>{result.rating}</div>
          <ScoreBar score={result.score} maxScore={result.max_score} />
        </div>
      </div>

      {/* ── Valuation flags ───────────────────────────── */}
      <div className="valuation-flags-row">
        <div className={`val-flag ${vf.ev_ebitda_ok ? "flag-ok" : "flag-fail"}`}>
                    EV/EBITDA: {vf.ev_ebitda_value ?? "N/A"} {vf.ev_ebitda_ok ? `✓ (${vf.ev_min ?? 4}–${vf.ev_max ?? 8})` : "✗ out of range"}
        </div>
        


        <div className={`val-flag ${vf.pe_ok ? "flag-ok" : "flag-fail"}`}>
          PE: {vf.pe_value ?? "N/A"} vs Industry {vf.industry_pe_value ?? "N/A"} {vf.pe_ok ? "✓" : "✗"}
        </div>
      </div>

      {/* ── Market Data Group (Overview + Charts) ─────── */}
      <div className="market-data-group">
        {result.market_info && (
          <div className="market-overview-col">
            <MarketInfoPanel info={result.market_info} />
          </div>
        )}
        
        <div className="market-charts-col">
          {result.price_chart && <PriceChart data={result.price_chart} />}
          {result.rsi_history && <RsiChart data={result.rsi_history} />}
        </div>
      </div>

      {/* ── Analysis Summary (Structured) ─────────────── */}
      <div className="explanation-box">
        <h4>Analysis Summary</h4>
        <ul className="explanation-list">
          {Array.isArray(result.explanation) ? result.explanation.map((item: any, idx: number) => (
            <li key={idx}>
              <strong>{item.category}:</strong> {item.text}
            </li>
          )) : (
            <li>{result.explanation}</li>
          )}
        </ul>
      </div>

      {/* ── Filter Results ────────────────────────────── */}
      {result.filter_results && result.filter_results.length > 0 && (
        <section className="filters-section">
          <h3 className="section-title">Fundamental Trends
            <span className="equity-years-note">
              Equity Capital data: {result.equity_capital_years_available} year(s)
              {result.equity_capital_years_available < 10 && " (< 10 yrs — incomplete data)"}
            </span>
          </h3>
          


          <div className="filter-grid">
            {result.filter_results.map((f: any) => (
              <FilterCard key={f.name} {...f} />
            ))}
          </div>
        </section>
      )}

      <div className="bottom-metrics-grid">
        {/* ── P/B Chart ─────────────────────────────────── */}
        {result.pb_history && result.pb_history.length > 0 && (
          <PBChart data={result.pb_history} />
        )}

        {/* ── Shareholder Pattern ───────────────────────── */}
        {result.shareholder_pattern && (
          <ShareholderChart data={result.shareholder_pattern} />
        )}
      </div>

    </div>
  );
}
