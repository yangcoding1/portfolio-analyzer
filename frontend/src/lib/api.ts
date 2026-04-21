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
  portfolio_values: PortfolioPoint[];
  drawdown_series: DrawdownPoint[];
}

export async function runBacktest(request: BacktestRequest): Promise<BacktestResponse> {
  const { data } = await api.post<BacktestResponse>("/api/v1/backtest", request);
  return data;
}

export async function searchTicker(q: string): Promise<{ ticker: string; name: string }[]> {
  const { data } = await api.get("/api/v1/search", { params: { q } });
  return data;
}
