# Portfolio-Analyzer

Personalized portfolio backtesting web app — configure assets, run backtests, and visualize results with a Midnight Forest glass morphism dashboard.

**Metrics:** CAGR · MDD · Sharpe Ratio · Volatility · Alpha · Beta · Best/Worst Year · Correlation Matrix

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker (optional, for full stack with TimescaleDB)

### Run locally (two terminals)

**Terminal 1 — Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e .
uvicorn main:app --reload
# → http://localhost:8000/docs
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Run with Docker (full stack)
```bash
docker compose up --build
```

---

## Project Structure

```
backend/
├── domain/          # Pure business logic (calculations, entities)
├── application/     # Use cases + repository interfaces
├── infrastructure/  # yfinance adapter, DB adapter
└── presentation/    # FastAPI routers + Pydantic schemas

frontend/
└── src/
    ├── app/         # Next.js App Router pages
    ├── components/  # PortfolioForm, BacktestCharts
    └── lib/api.ts   # Typed API client
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + Tailwind CSS + Recharts + Shadcn UI |
| Backend | FastAPI (Python) |
| Database | TimescaleDB |
| Data | yfinance |
| Infrastructure | Docker + WSL2 |
