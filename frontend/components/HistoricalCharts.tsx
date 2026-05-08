"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function HistoricalCharts({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="charts-container">
      <h3>Financial Trends (Last 4 Years)</h3>
      <div className="charts-grid">
        <div className="chart-wrapper">
          <h4>Revenue & Profit</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#333" />
              <YAxis yAxisId="left" stroke="#333" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #000' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#000" strokeWidth={2} activeDot={{ r: 8 }} />
              <Line yAxisId="left" type="monotone" dataKey="profit" name="Net Profit" stroke="#666" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-wrapper">
          <h4>Debt Levels</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #000' }} />
              <Legend />
              <Bar dataKey="debt" name="Total Debt" fill="#333" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
