# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Portfolio-Analyzer** — a personalized portfolio backtesting web application. Users configure asset portfolios with tickers and weights, run backtests, and view results (CAGR, MDD, Sharpe Ratio, Volatility, Alpha, Beta, Best/Worst Year, Correlation Matrix) on an interactive dashboard.

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

## Implemented Features

1. **Portfolio setup** — per-asset weight input (validated to sum to 100%, step=1), initial amount, rebalancing period (monthly/quarterly/annually), benchmark ticker. Save/load presets via JSON file download/upload.
2. **Backtest engine** — CAGR, MDD, Sharpe Ratio, Volatility, Best/Worst Year, Alpha, Beta; benchmark comparison; per-asset daily value series; rebalancing simulation (monthly/quarterly/annually).
3. **Dashboard (Midnight Forest glass morphism UI)**
   - 8-card KPI bento grid (4×2)
   - Portfolio growth AreaChart (emerald gradient)
   - Individual asset lines chart (toggle per asset via legend click)
   - Drawdown AreaChart (rose gradient)
   - Asset allocation donut pie (diverse color palette)
   - Correlation matrix heatmap (asset × asset, color-coded)

## Pending / Phase 2

- Ticker search/autocomplete
- Dividend reinvestment toggle
- Macro-economic indicators (interest rates, FX) integration
- LLM-generated investment insight reports
- Multi-portfolio simultaneous comparison

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

## Frontend Design Philosophy — "Midnight Forest"

우리의 UI는 **깊은 숲 속 새벽**을 시각화한다. 아래 원칙들이 모든 디자인 결정의 기준이다.

### 핵심 원칙

1. **Depth over Flatness** — 단순한 평면이 아닌 레이어감. 카드는 `backdrop-blur` + 반투명 배경으로 공간감을 만든다.
2. **Signal over Noise** — 수치(숫자)가 가장 먼저 눈에 들어와야 한다. KPI 값은 항상 가장 크고 밝게.
3. **Calm Confidence** — 형광색·과도한 채도 지양. Emerald(수익), Rose(리스크), Amber(안정성) 3색 체계를 벗어나지 않는다.
4. **Breathing Room** — 요소 간 여백은 아깝지 않게. 정보 밀도보다 읽기 쉬움을 우선한다.
5. **Consistent Motion** — 애니메이션은 `fade-up` + `pulse-glow` 두 가지만 사용. 불필요한 움직임은 노이즈다.

### 색상 체계

| 의미 | 색상 | 사용처 |
|---|---|---|
| 수익 · 성장 | Emerald `#10b981 / #34d399` | CAGR, Best Year, Alpha(+), 차트 기본선 |
| 리스크 · 손실 | Rose `#fb7185 / #f43f5e` | MDD, Worst Year, Alpha(-), 낙폭 차트 |
| 안정 · 중립 | Amber `#fbbf24 / #f59e0b` | Volatility, Beta(>1), 경고 |
| 배경 | Slate `#020617` (slate-950) | 페이지 배경 |
| 카드 | `rgba(15,23,42,0.6)` | 글래스 카드 표면 |
| 텍스트 라벨 | Slate-500 `#64748b` | 보조 텍스트, 축 레이블 |

### 금지 사항

- `bg-white`, `bg-gray-100` 등 밝은 배경 입력 필드 금지
- 왼쪽 굵은 컬러 보더(left-border accent) 금지 — 상단 얇은 라인(top accent)으로 대체
- 툴팁·모달에 밝은 배경 금지
- 그라디언트 텍스트에 `@apply from-*` 금지 — 반드시 raw `linear-gradient()` 사용

---

## Phase 2 (Future Scope)

- Macro-economic indicators (interest rates, FX) integration.
- LLM-generated investment insight reports from backtest results.
- Multi-portfolio save and simultaneous comparison.
