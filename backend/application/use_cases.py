import pandas as pd

from domain.entities import BacktestConfig, BacktestResult, Asset
from domain.calculations import (
    calculate_cagr,
    calculate_mdd,
    calculate_sharpe,
    calculate_volatility,
    calculate_drawdown_series,
    calculate_alpha_beta,
    calculate_correlation_matrix,
)
from application.interfaces import PriceRepository


class RunBacktestUseCase:
    def __init__(self, price_repo: PriceRepository):
        self._price_repo = price_repo

    def execute(self, config: BacktestConfig) -> BacktestResult:
        asset_tickers = [a.ticker for a in config.assets]
        all_tickers = list(dict.fromkeys(asset_tickers + [config.benchmark]))

        prices_raw = self._price_repo.fetch_prices(all_tickers, config.start_date, config.end_date)

        # 유효하지 않은 티커 감지 — 데이터가 전혀 없으면 잘못된 티커
        invalid = [t for t in all_tickers if t not in prices_raw.columns or prices_raw[t].isna().all()]
        if invalid:
            raise ValueError(f"유효하지 않은 티커입니다: {', '.join(invalid)}")

        prices = prices_raw.dropna()
        if prices.empty:
            raise ValueError("선택한 기간에 가격 데이터가 없습니다. 날짜 범위를 확인해주세요.")

        weights = {a.ticker: a.weight for a in config.assets}

        # 리밸런싱 주기에 따라 포트폴리오 시뮬레이션
        portfolio_values = self._rebalanced(
            prices[asset_tickers], weights, config.initial_amount, config.rebalance_period
        )
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
        correlation = calculate_correlation_matrix(prices[asset_tickers])

        # 자산별 일별 달러 가치 (각 자산의 초기 배분금액 기준)
        asset_series = []
        for i, d in enumerate(dates):
            row: dict = {"date": d}
            for ticker in asset_tickers:
                ratio = float(prices[ticker].iloc[i] / prices[ticker].iloc[0])
                row[ticker] = round(ratio * weights[ticker] * config.initial_amount, 2)
            asset_series.append(row)

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
            asset_series=asset_series,
            correlation=correlation,
        )

    def _rebalanced(
        self,
        prices: pd.DataFrame,
        weights: dict[str, float],
        initial: float,
        period: str,
    ) -> list[float]:
        """
        리밸런싱 시뮬레이션.
        각 리밸런싱 시점에 목표 비중으로 자산을 재배분합니다.

        예) 월별 리밸런싱: 매월 말 종가 기준으로 SPY 60% / TLT 40% 비중 복원
        """
        tickers = list(prices.columns)

        # 첫 날 종가로 초기 주식 수 계산
        shares = {t: (weights[t] * initial) / float(prices[t].iloc[0]) for t in tickers}

        rebalance_dates = self._get_rebalance_dates(prices.index, period)
        portfolio_values: list[float] = []

        for date, row in prices.iterrows():
            total_value = sum(shares[t] * float(row[t]) for t in tickers)
            portfolio_values.append(total_value)

            # 리밸런싱 날짜에 목표 비중으로 주식 수 재조정
            if date in rebalance_dates:
                for t in tickers:
                    shares[t] = (weights[t] * total_value) / float(row[t])

        return portfolio_values

    def _get_rebalance_dates(self, index: pd.DatetimeIndex, period: str) -> set:
        """
        리밸런싱 날짜 집합 반환 — 실제 거래일 기준 (각 기간의 마지막 거래일).
        monthly → 매월 말 / quarterly → 매분기 말 / annually → 매년 말
        """
        freq_map = {"monthly": "ME", "quarterly": "QE", "annually": "YE"}
        freq = freq_map.get(period, "YE")
        rebalance_series = pd.Series(index=index, dtype=float).resample(freq).last()
        return set(rebalance_series.index)
