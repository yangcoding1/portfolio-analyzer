"use client";

import { useState } from "react";
import PortfolioForm from "@/components/PortfolioForm";
import BacktestCharts from "@/components/BacktestCharts";
import { Asset, BacktestRequest, BacktestResponse, runBacktest } from "@/lib/api";
import { Leaf, TrendingUp, Shield, PieChart } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<BacktestResponse | null>(null);
  const [submittedAssets, setSubmittedAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidTickers, setInvalidTickers] = useState<string[]>([]);

  const handleSubmit = async (request: BacktestRequest) => {
    setIsLoading(true);
    setError(null);
    setInvalidTickers([]);
    try {
      const data = await runBacktest(request);
      setResult(data);
      setSubmittedAssets(request.assets);
    } catch (e: unknown) {
      const axiosErr = e as { response?: { status?: number; data?: { detail?: string } } };
      const status = axiosErr?.response?.status;
      const detail = axiosErr?.response?.data?.detail ?? "";

      if (status === 422 && detail) {
        setError(detail);
        // "유효하지 않은 티커입니다: ZMZN, XYZ" 형태에서 티커 파싱
        const colonIdx = detail.lastIndexOf(":");
        if (colonIdx !== -1) {
          const parsed = detail.slice(colonIdx + 1).trim()
            .split(",")
            .map((t) => t.trim().toUpperCase())
            .filter(Boolean);
          setInvalidTickers(parsed);
        }
      } else {
        setError(
          e instanceof Error ? e.message : "백테스트 실패. 티커 심볼과 날짜 범위를 확인해주세요."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* Midnight Forest — slate-950 배경 + 미세 emerald/teal 방사형 그라디언트 */
    <div className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "#020617",
        backgroundImage:
          "radial-gradient(ellipse at 20% 10%, rgba(16,185,129,0.05) 0%, transparent 55%), " +
          "radial-gradient(ellipse at 80% 85%, rgba(20,184,166,0.04) 0%, transparent 55%)",
      }}
    >
      {/* ── 상단 네비게이션 ── */}
      <header
        className="shrink-0 px-6 h-14 flex items-center justify-between"
        style={{
          background: "rgba(2, 6, 23, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(148,163,184,0.07)",
        }}
      >
        {/* 로고 */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <Leaf className="w-4 h-4" style={{ color: "#34d399" }} />
          </div>
          <span className="font-bold text-lg tracking-tight text-gradient-forest">
            Portfolio-Analyzer
          </span>
          <span className="hidden sm:block text-[11px] text-slate-600 ml-1">
            나의 숲을 설계하다
          </span>
        </div>

        {/* 분석 완료 뱃지 */}
        {result && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            분석 완료
          </div>
        )}
      </header>

      {/* ── 본문 ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* 사이드바 — 글래스모피즘 */}
        <aside
          className="w-full lg:w-[340px] lg:min-w-[340px] overflow-y-auto"
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(148,163,184,0.06)",
          }}
        >
          <div className="p-5">
            <PortfolioForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              invalidTickers={invalidTickers}
              onClearErrors={() => setInvalidTickers([])}
              submitError={error}
            />
          </div>
        </aside>

        {/* 메인 결과 패널 */}
        <main className="flex-1 overflow-y-auto p-5">
          {error && result && (
            <div
              className="mb-4 rounded-2xl px-4 py-3 text-sm animate-fade-up"
              style={{
                background: "rgba(251,113,133,0.08)",
                border: "1px solid rgba(251,113,133,0.2)",
                color: "#fda4af",
              }}
            >
              {error}
            </div>
          )}

          {result ? (
            <BacktestCharts result={result} assets={submittedAssets} />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}

/* ── 초기 화면 (백테스트 실행 전) ── */
function EmptyState() {
  const features = [
    {
      icon: TrendingUp,
      title: "수익률 분석",
      desc: "CAGR · Alpha · Beta",
      color: "#34d399",
      bg: "rgba(52,211,153,0.08)",
      border: "rgba(52,211,153,0.15)",
    },
    {
      icon: Shield,
      title: "리스크 지표",
      desc: "MDD · Sharpe · Volatility",
      color: "#fb7185",
      bg: "rgba(251,113,133,0.08)",
      border: "rgba(251,113,133,0.15)",
    },
    {
      icon: PieChart,
      title: "자산 배분",
      desc: "성장 차트 · 낙폭 분석",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.08)",
      border: "rgba(251,191,36,0.15)",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center select-none animate-fade-up">
      {/* 숲 아이콘 */}
      <div className="relative mb-10">
        <div
          className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl"
          style={{
            background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(52,211,153,0.15)",
            boxShadow: "0 0 40px rgba(16,185,129,0.08), 0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          🌲
        </div>
        <div
          className="absolute -top-3 -right-5 w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.2)",
          }}
        >
          🌿
        </div>
        <div
          className="absolute -bottom-3 -left-5 w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: "rgba(251,113,133,0.08)",
            border: "1px solid rgba(251,113,133,0.2)",
          }}
        >
          🌸
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-100 mb-2">나의 숲을 설계하세요</h2>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
        왼쪽 패널에서 포트폴리오를 구성하고
        <br />백테스트를 실행해보세요
      </p>

      {/* 기능 힌트 */}
      <div className="mt-10 flex gap-4">
        {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
          <div
            key={title}
            className="w-36 rounded-2xl p-4 text-left"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(12px)", border: `1px solid ${border}` }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: bg }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-xs font-semibold text-slate-200 mb-0.5">{title}</p>
            <p className="text-[10px] text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
