from pydantic import BaseModel, field_validator


class AssetInput(BaseModel):
    ticker: str
    weight: float  # 0.0 to 1.0


class BacktestRequest(BaseModel):
    assets: list[AssetInput]
    initial_amount: float = 10_000.0
    start_date: str
    end_date: str
    rebalance_period: str = "annually"
    reinvest_dividends: bool = False
    benchmark: str = "SPY"

    @field_validator("assets")
    @classmethod
    def weights_must_sum_to_one(cls, assets: list[AssetInput]) -> list[AssetInput]:
        total = sum(a.weight for a in assets)
        if not (0.999 <= total <= 1.001):
            raise ValueError(f"Asset weights must sum to 1.0, got {total:.4f}")
        return assets


class PortfolioPoint(BaseModel):
    date: str
    value: float


class DrawdownPoint(BaseModel):
    date: str
    drawdown: float


class BacktestResponse(BaseModel):
    cagr: float
    mdd: float
    sharpe_ratio: float
    volatility: float
    best_year: float
    worst_year: float
    benchmark_cagr: float | None
    alpha: float
    beta: float
    portfolio_values: list[PortfolioPoint]
    drawdown_series: list[DrawdownPoint]
    asset_series: list[dict] = []   # [{"date": "YYYY-MM-DD", "SPY": 6000.0, "TLT": 4000.0}]
    correlation: dict = {}          # {"tickers": ["SPY","TLT"], "matrix": [[1.0,-0.3],[-0.3,1.0]]}


class TickerResult(BaseModel):
    ticker: str
    name: str
