# Stock Metric Application

A full-stack web application designed to analyze stocks based on a predefined set of rules.
It evaluates Valuation, Growth, Profitability, and Debt Health, assigning a final rating (Strong Buy, Moderate, Weak) along with a generated explanation.

## Architecture
- **Backend:** FastAPI, Python. Fetches data from yfinance, cleans it, scores the stock, and generates an explanation. 
- **Frontend:** Next.js, React. Provides a clean, minimalist UI (Black & White theme) with Recharts for historical data visualization.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the root directory (you can copy `.env.example`):
```env
USE_MOCK_DATA=false
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the FastAPI server:
   ```bash
   python main.py
   ```
   The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # install chart dependencies as well
   npm install recharts lucide-react
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

### 4. Running with Docker Compose (Optional)
If you prefer Docker, you can run both services via Docker Compose:
```bash
docker-compose up --build
```
