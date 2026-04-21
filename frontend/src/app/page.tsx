"use client";

import { useState } from "react";
import PortfolioForm from "@/components/PortfolioForm";
import BacktestCharts from "@/components/BacktestCharts";
import { Asset, BacktestRequest, BacktestResponse, runBacktest } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<BacktestResponse | null>(null);
  const [submittedAssets, setSubmittedAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (request: BacktestRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await runBacktest(request);
      setResult(data);
      setSubmittedAssets(request.assets);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Backtest failed. Check ticker symbols and date range.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-400 tracking-tight">Neo-Visualizer</h1>
        <p className="text-gray-400 mt-1 text-sm">Portfolio Backtesting Dashboard</p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <PortfolioForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-900/30 border border-red-600/50 rounded-xl p-4 mb-4 text-red-300 text-sm">
              {error}
            </div>
          )}
          {result ? (
            <BacktestCharts result={result} assets={submittedAssets} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 bg-gray-800 rounded-xl text-sm">
              Configure your portfolio and run a backtest
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
