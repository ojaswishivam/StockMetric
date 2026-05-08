"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, ComposedChart } from "recharts";

interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  data: Record<string, PricePoint[]>;
}

export default function PriceChart({ data }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<string>("1Y");
  const chartData = data[timeframe] || [];

  if (!chartData.length) return null;

  // Format date for X-axis based on timeframe
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (timeframe === "1M" || timeframe === "3M") return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (timeframe === "6M" || timeframe === "1Y") return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return d.getFullYear().toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '10px', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: 'var(--muted)' }}>{p.date}</p>
          <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: 600 }}>₹{p.close.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--muted)' }}>Vol: {p.volume.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 className="chart-card-title" style={{ margin: 0 }}>Price History</h4>
        <div className="timeframe-selector" style={{ display: 'flex', gap: '4px' }}>
          {["1M", "3M", "6M", "1Y", "5Y"].map(tf => (
            <button 
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? 'var(--fg)' : 'transparent',
                color: timeframe === tf ? 'var(--bg)' : 'var(--muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            minTickGap={30}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={['auto', 'auto']}
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v}`}
          />
          <YAxis 
            yAxisId="volume"
            orientation="left"
            hide
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Volume bars behind price */}
          <Bar yAxisId="volume" dataKey="volume" fill="#9ca3af" opacity={0.2} maxBarSize={20} />
          
          {/* Price area chart front */}
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="close" 
            stroke="#2563eb" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorClose)" 
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
