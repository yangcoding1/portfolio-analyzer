from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Asset:
    ticker: str
    weight: float  # 0.0 to 1.0


@dataclass
class BacktestConfig:
    assets: list[Asset]
    initial_amount: float
    start_date: str
    end_date: str
    rebalance_period: str  # "monthly" | "quarterly" | "annually"
    reinvest_dividends: bool = False
    benchmark: str = "SPY"


@dataclass
class BacktestResult:
    cagr: float
    mdd: float
    sharpe_ratio: float
    volatility: float
    best_year: float
    worst_year: float
    benchmark_cagr: Optional[float]
    alpha: float          # 시장 대비 초과 수익 (연환산)
    beta: float           # 시장 민감도 (1.0 = 시장과 동일한 움직임)
    portfolio_values: list[dict]   # [{"date": "YYYY-MM-DD", "value": float}]
    drawdown_series: list[dict]    # [{"date": "YYYY-MM-DD", "drawdown": float}]
