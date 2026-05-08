"use client";

import React from "react";

interface ShareholderPattern {
  quarters: string[];
  promoters: string[];
  fiis: string[];
  diis: string[];
  public: string[];
  num_shareholders: string[];
}

export default function ShareholderChart({ data }: { data: ShareholderPattern }) {
  if (!data || !data.quarters || data.quarters.length === 0) return null;

  return (
    <div className="chart-card" style={{ gridColumn: '1 / -1' }}> 
      <h4 className="chart-card-title">Shareholding Pattern (Historical Quarters)</h4>
      <div className="shareholder-table-container">
        <table className="screener-table">
          <thead>
            <tr>
              <th className="sticky-col"></th>
              {data.quarters.map((q, i) => (
                <th key={i}>{q}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.promoters.length > 0 && (
              <tr>
                <td className="sticky-col label">Promoters <span className="blue-plus">+</span></td>
                {data.promoters.map((val, i) => <td key={i}>{val}</td>)}
              </tr>
            )}
            {data.fiis.length > 0 && (
              <tr>
                <td className="sticky-col label">FIIs <span className="blue-plus">+</span></td>
                {data.fiis.map((val, i) => <td key={i}>{val}</td>)}
              </tr>
            )}
            {data.diis.length > 0 && (
              <tr>
                <td className="sticky-col label">DIIs <span className="blue-plus">+</span></td>
                {data.diis.map((val, i) => <td key={i}>{val}</td>)}
              </tr>
            )}
            {data.public.length > 0 && (
              <tr>
                <td className="sticky-col label">Public <span className="blue-plus">+</span></td>
                {data.public.map((val, i) => <td key={i}>{val}</td>)}
              </tr>
            )}
            {data.num_shareholders.length > 0 && (
              <tr className="sub-row">
                <td className="sticky-col label sub-label">No. of Shareholders</td>
                {data.num_shareholders.map((val, i) => <td key={i}>{val}</td>)}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
