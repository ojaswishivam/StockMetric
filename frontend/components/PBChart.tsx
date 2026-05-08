"use client";

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";

interface PBDataPoint { year: string; pb_ratio: number; }

export default function PBChart({ data }: { data: PBDataPoint[] }) {
  if (!data || data.length === 0) return null;

  const avg = data.reduce((s, d) => s + d.pb_ratio, 0) / data.length;

  return (
    <div className="chart-card">
      <h4 className="chart-card-title">Price-to-Book Ratio (Historical)</h4>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(2)}×`, "P/B Ratio"]}
            contentStyle={{ fontSize: 12, border: "1px solid #d4d4d4" }}
          />
          <ReferenceLine y={avg} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: `Avg ${avg.toFixed(2)}×`, position: "insideTopRight", fontSize: 11, fill: "#64748b" }} />
          <Line
            type="monotone"
            dataKey="pb_ratio"
            stroke="#4f46e5"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "#4f46e5" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
