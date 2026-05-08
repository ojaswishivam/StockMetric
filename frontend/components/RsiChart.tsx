"use client";

import React from "react";
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";

interface RsiDataPoint {
  date: string;
  rsi: number;
  volume: number;
}

interface RsiChartProps {
  data: RsiDataPoint[];
}

export default function RsiChart({ data }: RsiChartProps) {
  if (!data || data.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--muted)' }}>{formatDate(p.date)}</p>
          <p style={{ margin: '0', fontSize: '0.85rem', fontWeight: 600, color: '#d97706' }}>RSI: {p.rsi.toFixed(1)}</p>
          <p style={{ margin: '0', fontSize: '0.75rem', color: 'var(--muted)' }}>Vol: {p.volume.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card">
      <h4 className="chart-card-title">Monthly RSI (14)</h4>
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            minTickGap={40}
            tick={{ fontSize: 10, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            domain={[0, 100]} 
            ticks={[30, 50, 70]}
            tick={{ fontSize: 10, fill: 'var(--muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            hide
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine y={70} yAxisId="left" stroke="#dc2626" strokeDasharray="3 3" opacity={0.5} />
          <ReferenceLine y={30} yAxisId="left" stroke="#2563eb" strokeDasharray="3 3" opacity={0.5} />
          
          <Bar yAxisId="right" dataKey="volume" fill="#9ca3af" opacity={0.3} maxBarSize={15} />
          <Line yAxisId="left" type="monotone" dataKey="rsi" stroke="#d97706" strokeWidth={2} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
