# StockMetric: Professional Trading Terminal

StockMetric is a high-density, professional-grade stock analysis platform. It provides deep fundamental insights, strict trend-based analysis, and technical indicators via an interactive terminal-style dashboard.

## 🚀 Project Vision
To provide a "Screener.in" style analytical depth combined with a "Crypto Exchange" style high-density UI. The application is designed for serious fundamental investors who need to quickly filter through large CSV-based stock lists and perform deep dives into individual company health.

---

## 🛠 Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Vanilla CSS (for custom terminal components).
- **Backend**: FastAPI (Python), uvicorn.
- **Charts**: Recharts (Interactive Price, RSI, Volume, and Shareholder patterns).
- **Data Integration**:
  - **yfinance**: Primary source for full financial statements, market data, and technical indicators.
  - **Screener.in Scraper**: Custom fallback scraper for full financial data (P&L, Balance Sheet) and quarterly shareholding patterns.

---

## 🧠 Analysis Engine (Scorer Logic)
The core of StockMetric is its strict, rule-based analysis engine, which evaluates stocks across **8 critical financial metrics**. It requires a **minimum of 2 completed financial years** (excluding TTM) to generate trend analysis.

### 1. Valuation States
- **Undervalued**: Both EV/EBITDA and PE checks pass.
- **Manual Check**: Strictly reserved for technical data fetch failures or insufficient historical data.
- **Rejected**: Both EV/EBITDA and PE checks fail. 
*Note: Fundamentals (Score ≥ 5) now override valuation state for Result tab placement.*

### 2. The 8 Metric Filters (Max Score: 8.0)
| # | Metric | Direction | Rule |
|---|--------|-----------|------|
| 1 | Sales | ↑ Up | At least one YoY increase, no YoY decline |
| 2 | Material Cost | ↑ Up | Growing raw material spend signals business growth |
| 3 | Employee Cost | ↑ Up | Growing headcount/wages signal expansion |
| 4 | Interest Expense | ↓ Down | At least one YoY decrease, no YoY increase |
| 5 | Net Profit | ↑ Up | At least one YoY increase, no YoY decline |
| 6 | Equity Capital | — Stagnant | Must be **exactly** unchanged from base year (zero tolerance) |
| 7 | Reserves | ↑ Up | At least one YoY increase, no YoY decline |
| 8 | Borrowings | ↓ Down | Must trend down, OR reserves must be growing to compensate |

### 3. Scoring Thresholds
- **6.0–8.0** → Strong Buy
- **4.0–5.9** → Moderate (Note: **≥ 5.0** is the threshold for the "Result" tab)
- **0.0–3.9** → Weak

---

## 🛡️ Resiliency & Fallback Architecture

### Multi-Tier Data Flow
1. **Auto-Scan (yfinance + Screener Fallback)**: The system attempts yfinance first. If annual reports are missing, it falls back to a full Screener.in scrape.
2. **Hybrid Shareholding**: Historical quarterly shareholding data is fetched from Screener.in for ALL stocks to supplement missing yfinance data.
3. **Smart Ticker Mapping**: When triggering a Screener scrape, the system uses a 3-tier identifier search:
    - **Suffix Stripping**: Removing `.NS` / `.BO` / `-SM` suffixes.
    - **CSV Code Lookup**: Using **NSE Code** or **BSE Code** from the local CSV to find the correct company page if ticker names differ.
    - **Fallback**: Cleaned ticker symbol search.
4. **Manual Scrape (Screener.in)**: The user can trigger a batch scrape of the "Check Manually" list. Results are moved to the **Screener** tab after full analysis.

### Stability & Error Handling
- **Skeleton Standardization**: All data sources (yfinance, Screener, and Failure Skeletons) return a standardized, nested dictionary structure to prevent frontend crashes (`KeyError`).
- **Transient Error Detection**: The frontend's Auto-Scan loop detects HTTP `503` (Service Unavailable/Rate Limit) and:
- **Pauses** with a visible 30-second countdown.
- **Retries** the same ticker (up to 2 times).
- **Graceful Failure**: If retries fail, the stock moves to "Check Manually" so the scan can continue.

### Polite Scraping & Rate Limiting
- **Fixed Delays**: A **4-second delay** is enforced between individual Screener.in requests during batch scraping to prevent IP blocks.
- **Stealth Headers**: Rotation of User-Agents and browser-like headers for all scraping activity.

---

## ⚡ Performance Optimizations
- **Global Caching**: Backend implements an in-memory `global_cache` to store scraped data and API responses, reducing redundant network calls and speeding up dashboard re-renders.

---

## 🖥 User Interface

### High-Density Dashboard
- **Panel-Based Layout**: A modular grid system mirroring professional trading terminals.
- **CSV Data Management**: Users can directly upload new Screener.in CSV exports via the UI to seamlessly update the terminal's dataset without server restarts.
- **Five-Tab Screener Table**:
  - **Overview**: Entire CSV stock list.
  - **Result**: Every stock with a fundamental **Score ≥ 5.0** and successful data.
  - **Check Manually**: Only technical failures, network timeouts, or missing reports.
  - **Screener**: Deep-analysis results sourced via the dedicated batch Screener scraper.
  - **Watchlist**: A dedicated view of user-starred stocks, powered by persistent server-side JSON storage containing full data rows resilient to CSV updates.

---

## 📁 Directory Structure
```text
StockMetric/
├── backend/                  # FastAPI Service
│   ├── routes/               # API Endpoints (analyze, analyze-score, scrape-screener-batch, watchlist)
│   ├── services/
│   │   ├── orchestrator.py   # Primary data coordinator (skip_fallback logic)
│   │   ├── yfinance_fetcher.py     # Primary data source
│   │   ├── screener_scraper.py     # Multi-identifier scraper (NSE/BSE/Ticker)
│   │   ├── analyzer.py      # Core 8-metric trend engine
│   │   ├── scorer.py         # Score aggregation & rating
│   │   └── industry_pe.py   # Industry PE benchmarks
│   ├── models/schemas.py    # Pydantic response models
│   ├── utils/                # Shared Utilities (cache, technical indicators)
│   ├── watchlist.json        # Persistent Watchlist Data
│   └── main.py              # Entry Point
├── frontend/                 # Next.js Application
│   ├── app/                  # Pages & Global Styles
│   ├── components/           # UI Components (Charts, Tables, Panels)
│   └── next.config.ts        # Performance configuration
└── undervalued-and-discounted.csv  # Primary Local Data Source
```

---

## 🚧 Recent Milestones
1. **Watchlist System**: Built robust server-side JSON persistence for starred stocks, enabling a universal toggle across all tables and maintaining stock data independent of the source CSV.
2. **UI Automation**: Integrated UI-based CSV uploading to seamlessly refresh the stock universe without restarting the backend.
3. **Legacy Architecture Purge**: Completely removed deprecated Alpha Vantage fetchers and legacy "Fincrux" branding to ensure a clean, yfinance/Screener-first pipeline.
4. **Simplified Tab Routing**: Transitioned "Manual Check" from a valuation-based flag to a strictly technical-failure flag, ensuring high-quality stocks aren't hidden by valuation noise.
5. **Historical Shareholding Patterns**: Integrated 12-quarter historical shareholder tracking with interactive charts for all stocks.

---

## 📋 Running the Project
- **Backend**: `cd backend && python main.py` (Port 8000)
- **Frontend**: `cd frontend && npm run dev` (Port 3000)
