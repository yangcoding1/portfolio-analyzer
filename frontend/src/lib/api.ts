import axios from "axios";

// Requests go through Next.js rewrites → backend (see next.config.ts)
const api = axios.create({ baseURL: "" });

export interface Asset {
  ticker: string;
  weight: number; // 0.0 to 1.0
}

export interface BacktestRequest {
  assets: Asset[];
  initial_amount: number;
  start_date: string;
  end_date: string;
  rebalance_period: string;
  reinvest_dividends?: boolean;
  benchmark: string;
}

export interface PortfolioPoint {
  date: string;
  value: number;
}

export interface DrawdownPoint {
  date: string;
  drawdown: number;
}

export interface BacktestResponse {
  cagr: number;
  mdd: number;
  sharpe_ratio: number;
  volatility: number;
  best_year: number;
  worst_year: number;
  benchmark_cagr: number | null;
  // 백엔드에서 계산 가능할 때 포함됨 (없으면 카드에 "—" 표시)
  alpha?: number | null;  // 시장 초과 수익률 (벤치마크 대비)
  beta?:  number | null;  // 시장 민감도 (1.0 = 시장과 동일)
  portfolio_values: PortfolioPoint[];
  drawdown_series: DrawdownPoint[];
  // 자산별 일별 달러 가치: [{"date":"2015-01-02","SPY":6000,"TLT":4000}, ...]
  asset_series?: Record<string, number | string>[];
  // 자산 간 상관계수 매트릭스
  correlation?: {
    tickers: string[];
    matrix: number[][];
  };
}

export async function runBacktest(request: BacktestRequest): Promise<BacktestResponse> {
  const { data } = await api.post<BacktestResponse>("/api/v1/backtest", request);
  return data;
}

export async function searchTicker(q: string): Promise<{ ticker: string; name: string }[]> {
  const { data } = await api.get("/api/v1/search", { params: { q } });
  return data;
}
