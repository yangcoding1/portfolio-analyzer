"use client";

import { useState } from "react";
import { BacktestRequest } from "@/lib/api";

interface AssetRow {
  ticker: string;
  weight: string;
}

interface Props {
  onSubmit: (req: BacktestRequest) => void;
  isLoading: boolean;
}

export default function PortfolioForm({ onSubmit, isLoading }: Props) {
  const [assets, setAssets] = useState<AssetRow[]>([
    { ticker: "SPY", weight: "60" },
    { ticker: "TLT", weight: "40" },
  ]);
  const [initialAmount, setInitialAmount] = useState("10000");
  const [startDate, setStartDate] = useState("2015-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [rebalancePeriod, setRebalancePeriod] = useState("annually");
  const [benchmark, setBenchmark] = useState("SPY");

  const totalWeight = assets.reduce((s, a) => s + (parseFloat(a.weight) || 0), 0);
  const weightValid = Math.abs(totalWeight - 100) < 0.1;

  const updateAsset = (i: number, field: keyof AssetRow, value: string) =>
    setAssets((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));

  const addAsset = () => setAssets((prev) => [...prev, { ticker: "", weight: "0" }]);
  const removeAsset = (i: number) => setAssets((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightValid) return;
    onSubmit({
      assets: assets.map((a) => ({
        ticker: a.ticker.toUpperCase().trim(),
        weight: parseFloat(a.weight) / 100,
      })),
      initial_amount: parseFloat(initialAmount),
      start_date: startDate,
      end_date: endDate,
      rebalance_period: rebalancePeriod,
      benchmark: benchmark.toUpperCase().trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-100">Portfolio Config</h2>

      {/* Asset rows */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Assets</span>
          <span className={`text-sm font-medium ${weightValid ? "text-green-400" : "text-red-400"}`}>
            Total: {totalWeight.toFixed(1)}%
          </span>
        </div>

        {assets.map((asset, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm uppercase placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="TICKER"
              value={asset.ticker}
              onChange={(e) => updateAsset(i, "ticker", e.target.value)}
              required
            />
            <div className="relative w-24">
              <input
                type="number"
                className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm pr-6 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="0"
                value={asset.weight}
                min="0"
                max="100"
                step="0.1"
                onChange={(e) => updateAsset(i, "weight", e.target.value)}
                required
              />
              <span className="absolute right-2 top-2 text-gray-400 text-sm">%</span>
            </div>
            {assets.length > 1 && (
              <button
                type="button"
                onClick={() => removeAsset(i)}
                className="text-gray-500 hover:text-red-400 text-lg leading-none px-1"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addAsset}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          + Add asset
        </button>
      </div>

      {/* Settings grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Initial Amount ($)</label>
          <input
            type="number"
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            min="1"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Benchmark</label>
          <input
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={benchmark}
            onChange={(e) => setBenchmark(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Start Date</label>
          <input
            type="date"
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">End Date</label>
          <input
            type="date"
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-400 block mb-1">Rebalance Period</label>
          <select
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={rebalancePeriod}
            onChange={(e) => setRebalancePeriod(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!weightValid || isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg py-2.5 font-semibold transition-colors"
      >
        {isLoading ? "Running..." : "Run Backtest"}
      </button>
    </form>
  );
}
