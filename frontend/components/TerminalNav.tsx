"use client";

import React from 'react';

export default function TerminalNav() {
  return (
    <nav className="terminal-nav">
      <div className="nav-left">
        <div className="nav-brand">
          <span className="brand-icon"></span>
          STOCK <span className="brand-highlight">METRIC</span>
        </div>
      </div>
      <div className="nav-right">
        <div className="nav-icon bell-icon"></div>
        <div className="nav-icon user-icon"></div>
      </div>
    </nav>
  );
}
