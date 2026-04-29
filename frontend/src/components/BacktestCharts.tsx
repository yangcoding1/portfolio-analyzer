"use client";

import React, { useState } from "react";
import {
  AreaChart, Area,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Activity, BarChart2,
  Star, CloudRain, Zap, GitBranch,
} from "lucide-react";
import { Asset, BacktestResponse } from "@/lib/api";

interface Props {
  result: BacktestResponse;
  assets: Asset[];
}

// 자산 라인 차트 — 각 자산이 시각적으로 구분되는 다채로운 팔레트
const ASSET_COLORS = [
  "#34d399",  // emerald
  "#a78bfa",  // violet
  "#fbbf24",  // amber
  "#60a5fa",  // blue
  "#fb7185",  // rose
  "#2dd4bf",  // teal
  "#84cc16",  // lime
  "#f472b6",  // pink
];

// 파이 차트 — 8개 계열 모두 완전히 다른 색상 (녹색 중복 제거)
const PIE_COLORS = [
  "#10b981",  // emerald
  "#6366f1",  // indigo
  "#f59e0b",  // amber
  "#3b82f6",  // blue
  "#ef4444",  // red
  "#ec4899",  // pink
  "#f97316",  // orange
  "#a855f7",  // purple
];

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(148,163,184,0.15)",
  borderRadius: "12px",
  color: "#e2e8f0",
  fontSize: "12px",
  padding: "8px 12px",
};

function pct(n: number, signed = false) {
  const val = (n * 100).toFixed(2);
  if (signed && n > 0) return `+${val}%`;
  return `${val}%`;
}

function sample<T>(arr: T[], max = 300): T[] {
  if (arr.length <= max) return arr;
  const step = Math.floor(arr.length / max);
  return arr.filter((_, i) => i % step === 0);
}

function fmtDate(d: string) { return d.slice(0, 7); }
function fmtDollar(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

// ── KPI 카드 ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label:       string;
  korLabel:    string;
  value:       string;
  icon:        React.ElementType;
  accentHex:   string;
  valueColor?: string;
  sub?:        string;
}

function KpiCard({ label, korLabel, value, icon: Icon, accentHex, valueColor, sub }: KpiCardProps) {
  return (
    <div
      className="rounded-3xl p-4 flex flex-col gap-3"
      style={{
        background:           "rgba(15, 23, 42, 0.6)",
        backdropFilter:       "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop:    `1px solid ${accentHex}55`,
        borderRight:  "1px solid rgba(148,163,184,0.07)",
        borderBottom: "1px solid rgba(148,163,184,0.07)",
        borderLeft:   "1px solid rgba(148,163,184,0.07)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        {/* 아이콘 박스 */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accentHex}1f`, color: accentHex }}
        >
          <Icon className="w-5 h-5" />
        </div>
        {/* 라벨 — 아이콘과 같은 계열 색상으로 자연스러운 연결 */}
        <div className="text-right min-w-0">
          <p
            className="text-xs font-semibold uppercase tracking-wider truncate"
            style={{ color: `${accentHex}cc` }}
          >
            {label}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 truncate">{korLabel}</p>
        </div>
      </div>

      {/* 핵심 수치 — 가장 크고 밝게 */}
      <p
        className="text-3xl font-extrabold tabular-nums tracking-tight"
        style={{ color: valueColor ?? "#f8fafc" }}
      >
        {value}
      </p>

      {sub && (
        <p className="text-[10px] text-slate-500 leading-tight">{sub}</p>
      )}
    </div>
  );
}

// ── 차트 카드 래퍼 ──────────────────────────────────────────────────────────
function ChartCard({
  label, korLabel, children,
}: {
  label: string; korLabel: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background:           "rgba(15, 23, 42, 0.6)",
        backdropFilter:       "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border:               "1px solid rgba(148,163,184,0.08)",
      }}
    >
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-200 mt-0.5">{korLabel}</p>
      </div>
      {children}
    </div>
  );
}

// ── 상관계수 셀 색상 ─────────────────────────────────────────────────────────
function corrCellStyle(r: number): { bg: string; color: string } {
  if (r >  0.7) return { bg: "rgba(16,185,129,0.55)",  color: "#f8fafc" };
  if (r >  0.3) return { bg: "rgba(16,185,129,0.25)",  color: "#34d399" };
  if (r > -0.3) return { bg: "rgba(148,163,184,0.08)", color: "#64748b" };
  if (r > -0.7) return { bg: "rgba(251,113,133,0.25)", color: "#fb7185" };
  return                { bg: "rgba(251,113,133,0.55)", color: "#f8fafc" };
}

// ── 상관계수 히트맵 ──────────────────────────────────────────────────────────
function CorrelationHeatmap({ data }: { data: { tickers: string[]; matrix: number[][] } }) {
  const { tickers, matrix } = data;
  const n = tickers.length;

  return (
    <ChartCard label="Correlation Matrix" korLabel="자산 간 상관계수 (r) — 값이 낮을수록 분산 효과↑">
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1.5 min-w-full"
          style={{ gridTemplateColumns: `56px repeat(${n}, minmax(64px, 1fr))` }}
        >
          {/* 헤더 행 */}
          <div />
          {tickers.map((t) => (
            <div key={t} className="text-[10px] font-bold uppercase text-slate-400 text-center py-1 truncate">
              {t}
            </div>
          ))}

          {/* 데이터 행 */}
          {matrix.map((row, ri) => (
            <React.Fragment key={`row-${ri}`}>
              <div
                className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-end pr-2 truncate"
              >
                {tickers[ri]}
              </div>
              {row.map((r, ci) => {
                const { bg, color } = corrCellStyle(r);
                return (
                  <div
                    key={`${ri}-${ci}`}
                    className="rounded-xl py-2.5 flex items-center justify-center"
                    style={{ background: bg }}
                    title={`${tickers[ri]} vs ${tickers[ci]}: ${r.toFixed(4)}`}
                  >
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color }}
                    >
                      {r.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* 색상 범례 */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-3"
          style={{ borderTop: "1px solid rgba(148,163,184,0.06)" }}
        >
          <span className="text-[9px] text-slate-600 shrink-0">범례</span>
          {[
            { bg: "rgba(251,113,133,0.55)", color: "#f8fafc",  label: "강한 음의 상관 (−1)" },
            { bg: "rgba(251,113,133,0.25)", color: "#fb7185",  label: "약한 음의 상관" },
            { bg: "rgba(148,163,184,0.08)", color: "#64748b",  label: "무상관 (0)" },
            { bg: "rgba(16,185,129,0.25)",  color: "#34d399",  label: "약한 양의 상관" },
            { bg: "rgba(16,185,129,0.55)",  color: "#f8fafc",  label: "강한 양의 상관 (+1)" },
          ].map(({ bg, color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-4 h-3.5 rounded" style={{ background: bg }} />
              <span className="text-[9px]" style={{ color }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────────
export default function BacktestCharts({ result, assets }: Props) {
  const portfolioData  = sample(result.portfolio_values);
  const drawdownData   = sample(result.drawdown_series);
  const assetSeriesData = result.asset_series ? sample(result.asset_series, 300) : [];
  const assetTickers   = assets.map((a) => a.ticker);

  // 개별 자산 라인 토글
  const [hiddenAssets, setHiddenAssets] = useState<Set<string>>(new Set());
  const toggleAsset = (ticker: string) =>
    setHiddenAssets((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });

  const pieData = assets.map((a) => ({
    name:  a.ticker,
    value: +(a.weight * 100).toFixed(1),
  }));

  const alphaValue  = result.alpha == null ? "—" : pct(result.alpha, true);
  const alphaColor  =
    result.alpha == null ? "#64748b" : result.alpha >= 0 ? "#34d399" : "#fb7185";

  const betaValue   = result.beta == null ? "—" : result.beta.toFixed(2);
  const betaColor   =
    result.beta == null ? "#64748b" : result.beta > 1 ? "#fbbf24" : "#34d399";

  const sharpeHex        = result.sharpe_ratio >= 1 ? "#10b981" : result.sharpe_ratio >= 0 ? "#fbbf24" : "#fb7185";
  const sharpeValueColor = result.sharpe_ratio >= 1 ? "#34d399" : result.sharpe_ratio >= 0 ? "#fbbf24" : "#fb7185";
  const cagrValueColor   = result.cagr >= 0 ? "#34d399" : "#fb7185";

  const axisStyle = { fill: "#64748b", fontSize: 10 };
  const gridProps = { strokeDasharray: "3 3", stroke: "rgba(148,163,184,0.06)" };
  const axisLine  = { stroke: "rgba(148,163,184,0.1)" };

  return (
    <div className="space-y-4 animate-fade-up">

      {/* ── 8-KPI 벤토 그리드 (4 × 2) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="CAGR"         korLabel="연평균 복합 성장률"  value={pct(result.cagr, true)}          icon={TrendingUp}  accentHex="#10b981"  valueColor={cagrValueColor} />
        <KpiCard label="Max Drawdown" korLabel="최대 낙폭"          value={pct(result.mdd)}                 icon={TrendingDown} accentHex="#fb7185"  valueColor="#fb7185" />
        <KpiCard label="Sharpe Ratio" korLabel="위험 조정 수익률"   value={result.sharpe_ratio.toFixed(2)}  icon={BarChart2}   accentHex={sharpeHex} valueColor={sharpeValueColor} />
        <KpiCard label="Volatility"   korLabel="연간 변동성"        value={pct(result.volatility)}          icon={Activity}    accentHex="#fbbf24"  valueColor="#fbbf24" />
        <KpiCard label="Best Year"    korLabel="최고 연간 수익률"   value={pct(result.best_year, true)}     icon={Star}        accentHex="#10b981"  valueColor="#34d399" />
        <KpiCard
          label="Worst Year" korLabel="최저 연간 수익률"
          value={pct(result.worst_year)}
          icon={CloudRain} accentHex="#fb7185" valueColor="#fb7185"
          sub={result.benchmark_cagr != null ? `벤치마크 CAGR: ${pct(result.benchmark_cagr, true)}` : undefined}
        />
        <KpiCard label="Alpha" korLabel="시장 초과 수익률" value={alphaValue} icon={Zap}       accentHex={alphaColor === "#64748b" ? "#475569" : alphaColor} valueColor={alphaColor} />
        <KpiCard label="Beta"  korLabel="시장 민감도"     value={betaValue}  icon={GitBranch}  accentHex={betaColor === "#64748b" ? "#475569" : betaColor}   valueColor={betaColor} />
      </div>

      {/* ── 포트폴리오 합산 성장 ── */}
      <ChartCard label="Portfolio Growth" korLabel="포트폴리오 성장 추이">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={portfolioData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="date" tick={axisStyle} tickFormatter={fmtDate} axisLine={axisLine} tickLine={false} />
            <YAxis tick={axisStyle} tickFormatter={fmtDollar} width={60} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "포트폴리오"]} labelFormatter={(l: string) => l} contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#growthGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── 자산별 개별 주가 차트 (범례 클릭으로 토글) ── */}
      {assetSeriesData.length > 0 && (
        <ChartCard label="Individual Assets" korLabel="자산별 성과 추이 — 범례를 클릭해 켜고 끌 수 있어요">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={assetSeriesData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" tick={axisStyle} tickFormatter={fmtDate} axisLine={axisLine} tickLine={false} />
              <YAxis tick={axisStyle} tickFormatter={fmtDollar} width={60} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]}
                labelFormatter={(l: string) => l}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend
                onClick={(data) => {
                  if (typeof data.dataKey === "string") toggleAsset(data.dataKey);
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: string, entry: any) => {
                  const key = typeof entry.dataKey === "string" ? entry.dataKey : "";
                  const hidden = hiddenAssets.has(key);
                  return (
                    <span
                      style={{
                        color:           hidden ? "#475569" : (entry.color ?? "#94a3b8"),
                        textDecoration:  hidden ? "line-through" : "none",
                        cursor:          "pointer",
                        fontSize:        11,
                        userSelect:      "none",
                      }}
                    >
                      {value}
                    </span>
                  );
                }}
              />
              {assetTickers.map((ticker, i) => (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={ASSET_COLORS[i % ASSET_COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  hide={hiddenAssets.has(ticker)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── 낙폭 추이 + 자산 배분 ── */}
      <div className="grid grid-cols-5 gap-4">

        <div className="col-span-3">
          <ChartCard label="Drawdown" korLabel="낙폭 추이">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={drawdownData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
                <defs>
                  <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#fb7185" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="date" tick={axisStyle} tickFormatter={fmtDate} axisLine={axisLine} tickLine={false} />
                <YAxis tick={axisStyle} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} width={44} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`${(v * 100).toFixed(2)}%`, "낙폭"]} labelFormatter={(l: string) => l} contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="drawdown" stroke="#fb7185" strokeWidth={1.5} fill="url(#ddGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* 자산 배분 파이 — 다채로운 색상 */}
        <div className="col-span-2">
          <ChartCard label="Allocation" korLabel="자산 배분">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={36}
                  outerRadius={62}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={TOOLTIP_STYLE} />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: string, entry: any) => (
                    <span style={{ color: entry.color ?? "#94a3b8", fontSize: 10, fontWeight: 600 }}>
                      {v}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* ── 상관계수 히트맵 (자산이 2개 이상일 때만 표시) ── */}
      {result.correlation && result.correlation.tickers.length >= 2 && (
        <CorrelationHeatmap data={result.correlation} />
      )}
    </div>
  );
}
