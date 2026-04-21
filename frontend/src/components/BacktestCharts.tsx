"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Asset, BacktestResponse } from "@/lib/api";

interface Props {
  result: BacktestResponse;
  assets: Asset[];
}

const PIE_COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e", "#a78bfa"];

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-100">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function pct(n: number) {
  return `${(n * 100).toFixed(2)}%`;
}

// Down-sample to at most maxPoints to keep recharts fast
function sample<T>(arr: T[], maxPoints = 300): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.floor(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0);
}

export default function BacktestCharts({ result, assets }: Props) {
  const portfolioData = sample(result.portfolio_values);
  const drawdownData = sample(result.drawdown_series);
  const pieData = assets.map((a) => ({ name: a.ticker, value: +(a.weight * 100).toFixed(1) }));

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="CAGR" value={pct(result.cagr)} />
        <MetricCard label="Max Drawdown" value={pct(result.mdd)} />
        <MetricCard label="Sharpe Ratio" value={result.sharpe_ratio.toFixed(2)} />
        <MetricCard label="Volatility" value={pct(result.volatility)} />
        <MetricCard label="Best Year" value={pct(result.best_year)} />
        <MetricCard
          label="Worst Year"
          value={pct(result.worst_year)}
          sub={result.benchmark_cagr != null ? `Benchmark CAGR: ${pct(result.benchmark_cagr)}` : undefined}
        />
      </div>

      {/* Portfolio Growth */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Portfolio Growth</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={portfolioData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickFormatter={(d: string) => d.slice(0, 7)}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              width={70}
            />
            <Tooltip
              formatter={(v: number) => [`$${v.toLocaleString()}`, "Portfolio"]}
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="value" stroke="#6366f1" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Drawdown */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Drawdown</h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={drawdownData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickFormatter={(d: string) => d.slice(0, 7)}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 10 }}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              width={50}
            />
            <Tooltip
              formatter={(v: number) => [`${(v * 100).toFixed(2)}%`, "Drawdown"]}
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8 }}
            />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#f43f5e"
              fill="#f43f5e"
              fillOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Asset Allocation */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Asset Allocation</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }: { name: string; value: number }) => `${name} ${value}%`}
              labelLine={false}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number) => [`${v}%`]}
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
