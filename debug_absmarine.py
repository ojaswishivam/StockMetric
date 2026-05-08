import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from services.yfinance_fetcher import fetch_scoring_data, fetch_all_data
import json

ticker = "ABSMARINE.NS"
print(f"--- SCORING DATA FOR {ticker} ---")
try:
    score_data = fetch_scoring_data(ticker)
    print(f"History years: {[h['year'] for h in score_data['history']]}")
    print(f"Length: {len(score_data['history'])}")
except Exception as e:
    print(f"Error: {e}")

print(f"\n--- ALL DATA FOR {ticker} ---")
try:
    all_data = fetch_all_data(ticker)
    print(f"History years: {[h['year'] for h in all_data['cleaned']['history']]}")
    print(f"Length: {len(all_data['cleaned']['history'])}")
except Exception as e:
    print(f"Error: {e}")
