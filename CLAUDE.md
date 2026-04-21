# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Neo-Visualizer** — a personalized portfolio backtesting web application. Users configure asset portfolios with tickers and weights, run backtests, and view results (CAGR, MDD, Sharpe Ratio, Volatility, Best/Worst Year) on an interactive dashboard.

## Developer Context

The developer is a beginner coder using AI-assisted (Vibe Coding) development. When writing code:
- Always provide complete code blocks with file paths so they can be copied directly.
- Explain complex concepts with intuitive analogies.
- Write modular, non-hardcoded implementations designed for future extension.
- leave the kind comments for beginner coder

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | FastAPI (Python, async) |
| Database | TimescaleDB (time-series optimized) |
| Data source | yfinance (external price API) |
| Infrastructure | Docker + WSL2 |

## Architecture: Clean Architecture

Dependency rule: `Presentation → Application → Domain ← Infrastructure`

- **Domain** — Zero external dependencies. Pure business logic: `Portfolio`, `Asset` models; pure functions for CAGR, MDD, Sharpe Ratio, Volatility calculations.
- **Application** — Use cases that orchestrate domain objects (e.g., "run portfolio backtest" pipeline). Defines repository interfaces that Infrastructure implements.
- **Presentation** — Next.js UI components/charts; FastAPI routers/controllers. Depends only on Application layer.
- **Infrastructure** — Implements Application interfaces. TimescaleDB adapters, yfinance API clients.

Never let Infrastructure import from Presentation, and never let Domain import from any other layer.

## MVP Features

1. **Portfolio setup** — ticker search/autocomplete, per-asset weight input (validated to sum to 100%), initial amount, rebalancing period (monthly/quarterly/annually), dividend reinvestment toggle.
2. **Backtest engine** — CAGR, MDD, Sharpe Ratio, Volatility, Best/Worst Year; benchmark comparison (e.g., SPY).
3. **Dashboard** — portfolio growth line chart (zoom/pan), drawdown chart, asset allocation pie chart.

## Commands

### Backend (from `backend/`)
```bash
pip install -e .                        # install dependencies
uvicorn main:app --reload               # dev server → http://localhost:8000
```
API docs auto-generated at `http://localhost:8000/docs`.

### Frontend (from `frontend/`)
```bash
npm install                             # install dependencies
npm run dev                             # dev server → http://localhost:3000
npm run build && npm start              # production build
npm run lint                            # ESLint
npm run typecheck                       # TypeScript check (no emit)
```

### Docker (full stack)
```bash
docker compose up --build              # start all services (db, backend, frontend)
docker compose down                    # stop all services
docker compose down -v                 # stop and delete database volume
```

## Phase 2 (Future Scope)

- Macro-economic indicators (interest rates, FX) integration.
- LLM-generated investment insight reports from backtest results.
- Multi-portfolio save and simultaneous comparison.
