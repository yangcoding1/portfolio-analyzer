import pandas as pd

from domain.entities import BacktestConfig, BacktestResult, Asset
from domain.calculations import (
    calculate_cagr,
    calculate_mdd,
    calculate_sharpe,
    calculate_volatility,
    calculate_drawdown_series,
    calculate_alpha_beta,
)
from application.interfaces import PriceRepository


class RunBacktestUseCase:
    def __init__(self, price_repo: PriceRepository):
        self._price_repo = price_repo

    def execute(self, config: BacktestConfig) -> BacktestResult:
        asset_tickers = [a.ticker for a in config.assets]
        all_tickers = list(dict.fromkeys(asset_tickers + [config.benchmark]))

        prices = self._price_repo.fetch_prices(all_tickers, config.start_date, config.end_date)
        prices = prices.dropna()

        weights = {a.ticker: a.weight for a in config.assets}
        portfolio_values = self._buy_and_hold(prices[asset_tickers], weights, config.initial_amount)
        benchmark_values = prices[config.benchmark].tolist()

        dates = prices.index.strftime("%Y-%m-%d").tolist()
        daily_returns = pd.Series(portfolio_values).pct_change().dropna().tolist()
        benchmark_daily_returns = pd.Series(benchmark_values).pct_change().dropna().tolist()
        years = len(portfolio_values) / 252

        yearly = (
            pd.Series(portfolio_values, index=prices.index)
            .resample("YE")
            .last()
            .pct_change()
            .dropna()
        )

        alpha, beta = calculate_alpha_beta(daily_returns, benchmark_daily_returns)

        return BacktestResult(
            cagr=calculate_cagr(portfolio_values[0], portfolio_values[-1], years),
            mdd=calculate_mdd(portfolio_values),
            sharpe_ratio=calculate_sharpe(daily_returns),
            volatility=calculate_volatility(daily_returns),
            best_year=float(yearly.max()) if len(yearly) else 0.0,
            worst_year=float(yearly.min()) if len(yearly) else 0.0,
            benchmark_cagr=calculate_cagr(benchmark_values[0], benchmark_values[-1], years),
            alpha=alpha,
            beta=beta,
            portfolio_values=[
                {"date": d, "value": round(v, 2)} for d, v in zip(dates, portfolio_values)
            ],
            drawdown_series=[
                {"date": d, "drawdown": round(dd, 4)}
                for d, dd in zip(dates, calculate_drawdown_series(portfolio_values))
            ],
        )

    def _buy_and_hold(
        self, prices: pd.DataFrame, weights: dict[str, float], initial: float
    ) -> list[float]:
        """Simple buy-and-hold (no rebalancing). Rebalancing logic to be added in Phase 2."""
        normalized = prices / prices.iloc[0]
        weight_array = [weights[t] for t in prices.columns]
        return (normalized.dot(weight_array) * initial).tolist()
