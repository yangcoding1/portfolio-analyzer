import numpy as np
from typing import Sequence


def calculate_cagr(initial: float, final: float, years: float) -> float:
    if years <= 0 or initial <= 0:
        return 0.0
    return (final / initial) ** (1 / years) - 1


def calculate_mdd(values: Sequence[float]) -> float:
    """Returns max drawdown as a negative fraction (e.g. -0.35 = -35%)."""
    peak = values[0]
    max_dd = 0.0
    for v in values:
        if v > peak:
            peak = v
        dd = (v - peak) / peak
        if dd < max_dd:
            max_dd = dd
    return max_dd


def calculate_sharpe(daily_returns: Sequence[float], risk_free_rate: float = 0.02) -> float:
    arr = np.array(daily_returns)
    annual_return = float(np.mean(arr)) * 252
    annual_vol = float(np.std(arr)) * np.sqrt(252)
    if annual_vol == 0:
        return 0.0
    return (annual_return - risk_free_rate) / annual_vol


def calculate_volatility(daily_returns: Sequence[float]) -> float:
    return float(np.std(daily_returns)) * np.sqrt(252)


def calculate_drawdown_series(values: Sequence[float]) -> list[float]:
    result, peak = [], values[0]
    for v in values:
        if v > peak:
            peak = v
        result.append((v - peak) / peak)
    return result


def calculate_alpha_beta(
    portfolio_returns: Sequence[float],
    benchmark_returns: Sequence[float],
    risk_free_rate: float = 0.02,
) -> tuple[float, float]:
    """
    공식: R_p = R_f + β(R_m - R_f) + α
    → β = Cov(R_p, R_m) / Var(R_m)
    → α = 연환산(R_p) - R_f - β × (연환산(R_m) - R_f)

    β > 1 이면 시장보다 변동이 크고, β < 1 이면 방어적인 포트폴리오.
    α > 0 이면 시장 초과 수익, α < 0 이면 시장 대비 부진.

    반환값: (alpha, beta) — 모두 연환산 기준
    """
    rp = np.array(portfolio_returns)
    rm = np.array(benchmark_returns)

    # 분모(시장 분산)가 0이면 계산 불가
    var_m = float(np.var(rm))
    if var_m == 0:
        return 0.0, 0.0

    # β = 포트폴리오와 시장의 공분산 / 시장 분산
    beta = float(np.cov(rp, rm)[0, 1] / var_m)

    # 일간 평균 수익률 × 252 거래일 → 연환산 수익률
    annual_rp = float(np.mean(rp)) * 252
    annual_rm = float(np.mean(rm)) * 252

    # α = 내 수익 - 무위험 수익 - β × 시장 초과분
    alpha = annual_rp - risk_free_rate - beta * (annual_rm - risk_free_rate)

    return alpha, beta
