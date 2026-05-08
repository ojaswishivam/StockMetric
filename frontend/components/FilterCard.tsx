"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

interface FilterCardProps {
  name: string;
  score: number;       // 0 | 0.5 | 1
  status: string;      // "pass" | "fail" | "partial"
  values: number[];
  years: string[];
  direction: string;   // "up" | "down" | "stable"
}

const STATUS_CONFIG: Record<string, { label: string; color: string; stroke: string; bg: string; border: string }> = {
  pass:    { label: "PASS",    color: "#16a34a", stroke: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.35)"  },
  fail:    { label: "FAIL",    color: "#dc2626", stroke: "#ef4444", bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.35)"  },
  partial: { label: "PARTIAL", color: "#d97706", stroke: "#f59e0b", bg: "rgba(251,191,36,0.08)",   border: "rgba(251,191,36,0.35)" },
};

const DIRECTION_ICON: Record<string, string> = {
  up:     "↑",
  down:   "↓",
  stable: "—",
};

function formatValue(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `${(v / 1_000).toFixed(1)}K`;
  return v.toFixed(1);
}

export default function FilterCard({ name, score, status, values, years, direction }: FilterCardProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.fail;
  const chartData = years.map((y, i) => ({ year: y, value: values[i] }));

  return (
    <div className="filter-card" style={{ background: cfg.bg, borderColor: cfg.border }}>
      {/* Header */}
      <div className="filter-card-header">
        <div className="filter-card-title">
          <span className="filter-direction-icon">{DIRECTION_ICON[direction]}</span>
          <span className="filter-name">{name}</span>
        </div>
        <span className="filter-badge" style={{ color: cfg.color, borderColor: cfg.border }}>
          {cfg.label}
        </span>
      </div>

      {/* Score pip */}
      <div className="filter-score" style={{ color: cfg.color }}>
        {score} <span className="filter-score-denom">/ 1</span>
      </div>

      {/* Mini sparkline */}
      <div className="filter-sparkline">
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${name.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={cfg.stroke} stopOpacity={0.35} />
                <stop offset="95%" stopColor={cfg.stroke} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis dataKey="year" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ fontSize: 11, padding: "4px 8px", border: `1px solid ${cfg.border}`, background: "#fff" }}
              formatter={(v: number) => [formatValue(v), name]}
              labelStyle={{ fontSize: 10, color: "#555" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={cfg.stroke}
              strokeWidth={2}
              fill={`url(#grad-${name.replace(/\s/g, "")})`}
              dot={{ r: 3, fill: cfg.stroke }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Latest value */}
      <div className="filter-latest" style={{ color: cfg.color }}>
        Latest: {formatValue(values[values.length - 1])}
      </div>
    </div>
  );
}
