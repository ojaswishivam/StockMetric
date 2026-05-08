"use client";

import React from "react";

interface MarketInfo {
  market_cap?: number;
  current_price?: number;
  shares_outstanding?: number;
  book_value?: number;
  ma_20?: number;
  ma_50?: number;
  ma_100?: number;
  rsi?: number;
}

function fmt(v: number | undefined | null, prefix = "", suffix = ""): string {
  if (v == null) return "N/A";
  if (prefix === "₹" || prefix === "$") {
    if (v >= 1e12) return `${prefix}${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9)  return `${prefix}${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6)  return `${prefix}${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3)  return `${prefix}${(v / 1e3).toFixed(2)}K`;
    
    // International comma separation (e.g. 12,345,678)
    return `${prefix}${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(v)}`;
  }
  return `${prefix}${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(v)}${suffix}`;
}

function MaIndicator({ label, ma, price }: { label: string; ma?: number; price?: number }) {
  if (!ma || !price) return <div className="ma-item"><span className="ma-label">{label}</span><span className="ma-value">N/A</span></div>;
  const bull = price >= ma;
  return (
    <div className="ma-item">
      <span className="ma-label">{label}</span>
      <span className="ma-value" style={{ color: bull ? "#16a34a" : "#dc2626" }}>
        {ma.toFixed(2)} {bull ? "▲" : "▼"}
      </span>
    </div>
  );
}

function RsiGauge({ rsi }: { rsi?: number }) {
  if (!rsi) return <span className="rsi-value">N/A</span>;
  let color = "#16a34a";
  let label = "Neutral";
  if (rsi > 70) { color = "#dc2626"; label = "Overbought"; }
  else if (rsi < 30) { color = "#2563eb"; label = "Oversold"; }
  else if (rsi > 60) { color = "#d97706"; label = "Bullish"; }

  return (
    <div className="rsi-container">
      <span className="rsi-value" style={{ color }}>{rsi.toFixed(1)}</span>
      <span className="rsi-label" style={{ color }}>{label}</span>
    </div>
  );
}

export default function MarketInfoPanel({ info }: { info: MarketInfo }) {
  return (
    <div className="market-panel">
      <h3 className="panel-title">Market Overview</h3>

      {/* Key numbers grid */}
      <div className="market-grid">
        <div className="market-item">
          <div className="market-item-label">Market Cap</div>
          <div className="market-item-value">{fmt(info.market_cap, "₹")}</div>
        </div>
        <div className="market-item">
          <div className="market-item-label">Current Price</div>
          <div className="market-item-value">{fmt(info.current_price, "₹")}</div>
        </div>
        <div className="market-item">
          <div className="market-item-label">Shares Outstanding</div>
          <div className="market-item-value">
            {info.shares_outstanding != null
              ? (info.shares_outstanding >= 1e9
                ? `${(info.shares_outstanding / 1e9).toFixed(2)}B`
                : info.shares_outstanding >= 1e6
                ? `${(info.shares_outstanding / 1e6).toFixed(2)}M`
                : new Intl.NumberFormat('en-US').format(info.shares_outstanding))
              : "N/A"}
          </div>
        </div>
        <div className="market-item">
          <div className="market-item-label">Book Value / Share</div>
          <div className="market-item-value">{fmt(info.book_value, "₹")}</div>
        </div>
      </div>

      {/* Technical indicators */}
      <div className="technicals-row">
        <div className="ma-group">
          <span className="tech-section-title">Moving Averages</span>
          <MaIndicator label="20D MA"  ma={info.ma_20}  price={info.current_price} />
          <MaIndicator label="50D MA"  ma={info.ma_50}  price={info.current_price} />
          <MaIndicator label="100D MA" ma={info.ma_100} price={info.current_price} />
        </div>
        <div className="rsi-group">
          <span className="tech-section-title">RSI (14)</span>
          <RsiGauge rsi={info.rsi} />
        </div>
      </div>
    </div>
  );
}
