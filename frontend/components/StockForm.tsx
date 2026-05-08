"use client";

import React, { useState } from 'react';

export default function StockForm({ onAnalyze }: { onAnalyze: (ticker: string) => void }) {
  const [ticker, setTicker] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onAnalyze(ticker.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stock-form">
      <input 
        type="text" 
        placeholder="Enter Stock Ticker (e.g. RELIANCE, TCS)" 
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        className="stock-input"
        required
      />
      <button type="submit" className="stock-btn">Analyze</button>
    </form>
  );
}
