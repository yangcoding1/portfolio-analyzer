"use client";

import { useState } from "react";
import { BacktestRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, Trash2, TreePine, Settings2, Sprout,
  ChevronDown, Zap, BookmarkPlus, FolderOpen, Download, Upload,
} from "lucide-react";

// ── 타입 ──────────────────────────────────────────────────────────────────
interface AssetRow {
  ticker: string;
  weight: string;
}

// JSON 파일로 저장되는 포트폴리오 프리셋 구조
interface PortfolioPreset {
  version:         "1.0";           // 파일 포맷 버전 (호환성 관리용)
  name:            string;
  assets:          AssetRow[];
  initialAmount:   string;
  startDate:       string;
  endDate:         string;
  rebalancePeriod: string;
  benchmark:       string;
  savedAt:         string;
}

// 내부 목록 관리용 (id 포함)
interface SavedPreset extends PortfolioPreset {
  id: string;
}

interface Props {
  onSubmit: (req: BacktestRequest) => void;
  isLoading: boolean;
  invalidTickers?: string[];
  onClearErrors?: () => void;
  submitError?: string | null;
}

// ── JSON 파일 I/O 헬퍼 ───────────────────────────────────────────────────

/** 현재 포트폴리오 설정을 .json 파일로 다운로드 */
function downloadPreset(preset: PortfolioPreset) {
  const json = JSON.stringify(preset, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${preset.name.replace(/\s+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** 업로드된 JSON 파일을 읽어 PortfolioPreset으로 파싱 */
function readPresetFile(file: File): Promise<PortfolioPreset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as PortfolioPreset;
        // 최소 유효성 검사
        if (!data.assets || !data.startDate || !data.endDate) {
          reject(new Error("올바른 포트폴리오 파일이 아닙니다."));
        } else {
          resolve(data);
        }
      } catch {
        reject(new Error("JSON 파싱 실패. 파일을 확인해주세요."));
      }
    };
    reader.readAsText(file);
  });
}

// ── 컴포넌트 ──────────────────────────────────────────────────────────────
export default function PortfolioForm({ onSubmit, isLoading, invalidTickers = [], onClearErrors, submitError }: Props) {
  // 폼 상태
  const [assets, setAssets] = useState<AssetRow[]>([
    { ticker: "SPY", weight: "60" },
    { ticker: "TLT", weight: "40" },
  ]);
  const [initialAmount, setInitialAmount]   = useState("10000");
  const [startDate, setStartDate]           = useState("2015-01-01");
  const [endDate, setEndDate]               = useState("2024-12-31");
  const [rebalancePeriod, setRebalancePeriod] = useState("annually");
  const [benchmark, setBenchmark]           = useState("SPY");

  // 저장/불러오기 상태
  const [presetName, setPresetName]         = useState("");
  const [loadError, setLoadError]           = useState<string | null>(null);

  // ── 비중 계산 ──────────────────────────────────────────────────────────
  const totalWeight  = assets.reduce((s, a) => s + (parseFloat(a.weight) || 0), 0);
  const weightValid  = Math.abs(totalWeight - 100) < 0.1;

  const weightColor =
    weightValid         ? "#34d399"
    : totalWeight > 100 ? "#fb7185"
                        : "#fbbf24";

  const barGradient =
    weightValid
      ? "linear-gradient(90deg, #10b981, #34d399)"
      : totalWeight > 100
      ? "linear-gradient(90deg, #f43f5e, #fb7185)"
      : "linear-gradient(90deg, #d97706, #fbbf24)";

  // ── 자산 행 조작 ────────────────────────────────────────────────────────
  const updateAsset = (i: number, field: keyof AssetRow, value: string) => {
    if (field === "ticker") onClearErrors?.();
    setAssets((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  };

  const addAsset     = () => setAssets((prev) => [...prev, { ticker: "", weight: "0" }]);
  const removeAsset  = (i: number) => setAssets((prev) => prev.filter((_, idx) => idx !== i));

  // ── 저장/불러오기 ────────────────────────────────────────────────────────

  /** 현재 폼 설정을 JSON 파일로 다운로드 */
  const handleDownload = () => {
    const name = presetName.trim() || `portfolio_${new Date().toISOString().slice(0, 10)}`;
    const preset: PortfolioPreset = {
      version:         "1.0",
      name,
      assets:          assets.map((a) => ({ ...a })),
      initialAmount,
      startDate,
      endDate,
      rebalancePeriod,
      benchmark,
      savedAt:         new Date().toLocaleDateString("ko-KR"),
    };
    downloadPreset(preset);
    setPresetName("");
  };

  /** JSON 파일을 선택해 폼에 불러오기 */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadError(null);
    try {
      const preset = await readPresetFile(file);
      setAssets(preset.assets.map((a) => ({ ...a })));
      setInitialAmount(preset.initialAmount);
      setStartDate(preset.startDate);
      setEndDate(preset.endDate);
      setRebalancePeriod(preset.rebalancePeriod);
      setBenchmark(preset.benchmark ?? "SPY");
      setPresetName(preset.name);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "파일 불러오기 실패");
    }
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = "";
  };

  // ── 폼 제출 ──────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightValid) return;
    onSubmit({
      assets: assets.map((a) => ({
        ticker: a.ticker.toUpperCase().trim(),
        weight: parseFloat(a.weight) / 100,
      })),
      initial_amount:   parseFloat(initialAmount),
      start_date:       startDate,
      end_date:         endDate,
      rebalance_period: rebalancePeriod,
      benchmark:        benchmark.toUpperCase().trim(),
    });
  };

  // ── 공통 헬퍼 컴포넌트 ───────────────────────────────────────────────────
  const SectionHeader = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-3 h-3 text-slate-500" />
      <span className="label-section">{label}</span>
    </div>
  );

  const selectClass =
    "flex h-10 w-full appearance-none rounded-xl px-3 pr-9 py-2 text-sm " +
    "bg-slate-900/50 border border-slate-700/30 text-slate-100 " +
    "focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/30 " +
    "transition-all duration-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* 폼 헤더 */}
      <div
        className="flex items-center gap-3 pb-4"
        style={{ borderBottom: "1px solid rgba(148,163,184,0.07)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <TreePine className="w-4 h-4" style={{ color: "#34d399" }} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100">포트폴리오 구성</p>
          <p className="text-[10px] text-slate-600">자산을 배분하고 백테스트를 실행하세요</p>
        </div>
      </div>

      {/* ── 자산 구성 ── */}
      <div>
        <SectionHeader icon={Sprout} label="자산 구성" />

        {/* 비중 합계 + 진행 바 */}
        <div className="mb-3 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-600">비중 합계</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: weightColor }}>
              {totalWeight.toFixed(1)}% / 100%
            </span>
          </div>
          <div className="h-1 rounded-full" style={{ background: "rgba(148,163,184,0.1)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(totalWeight, 100)}%`, background: barGradient }}
            />
          </div>
        </div>

        {/* 자산 행 */}
        <div className="space-y-2">
          {assets.map((asset, i) => {
            const normalized = asset.ticker.toUpperCase().trim();
            const isInvalid = normalized !== "" && invalidTickers.includes(normalized);
            return (
              <div key={i}>
                <div className="flex gap-2 items-center group">
                  <Input
                    className="flex-1 uppercase text-xs font-semibold tracking-wider"
                    style={isInvalid ? {
                      borderColor: "rgba(251,113,133,0.55)",
                      background:  "rgba(251,113,133,0.05)",
                      color:       "#fda4af",
                    } : undefined}
                    placeholder="TICKER"
                    value={asset.ticker}
                    onChange={(e) => updateAsset(i, "ticker", e.target.value)}
                    required
                  />
                  <div className="relative w-24">
                    <Input
                      type="number"
                      className="w-full pr-6 text-xs"
                      placeholder="0"
                      value={asset.weight}
                      min="0" max="100" step="1"
                      onChange={(e) => updateAsset(i, "weight", e.target.value)}
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 pointer-events-none">
                      %
                    </span>
                  </div>
                  {assets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAsset(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {isInvalid && (
                  <p className="mt-0.5 pl-1 text-[10px]" style={{ color: "#fb7185" }}>
                    유효하지 않은 티커입니다
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addAsset}
          className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-400 transition-colors py-1"
        >
          <Plus className="w-3.5 h-3.5" />
          자산 추가
        </button>
      </div>

      <div style={{ height: "1px", background: "rgba(148,163,184,0.07)" }} />

      {/* ── 포트폴리오 저장/불러오기 ── */}
      <div>
        <SectionHeader icon={FolderOpen} label="포트폴리오 저장 / 불러오기" />

        {/* 파일명(포트폴리오 이름) 입력 */}
        <div className="mb-2">
          <Input
            className="text-xs"
            placeholder="파일 이름 (비워두면 날짜 자동 생성)"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
          />
        </div>

        {/* 저장(다운로드) + 불러오기(업로드) 버튼 */}
        <div className="flex gap-2">
          {/* JSON 파일로 저장 */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: "rgba(16,185,129,0.1)",
              border:     "1px solid rgba(16,185,129,0.2)",
              color:      "#34d399",
            }}
          >
            <Download className="w-3.5 h-3.5" />
            JSON 저장
          </button>

          {/* JSON 파일 불러오기 */}
          <label
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: "rgba(96,165,250,0.08)",
              border:     "1px solid rgba(96,165,250,0.2)",
              color:      "#60a5fa",
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            JSON 불러오기
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* 업로드 에러 메시지 */}
        {loadError && (
          <p className="mt-1.5 text-[10px]" style={{ color: "#fb7185" }}>{loadError}</p>
        )}

        <p className="mt-2 text-[10px] text-slate-700">
          저장된 .json 파일을 불러오면 폼이 자동으로 채워져요
        </p>
      </div>

      <div style={{ height: "1px", background: "rgba(148,163,184,0.07)" }} />

      {/* ── 백테스트 설정 ── */}
      <div>
        <SectionHeader icon={Settings2} label="백테스트 설정" />
        <div className="space-y-3">

          <div className="space-y-1.5">
            <Label htmlFor="initialAmount">초기 투자금 ($)</Label>
            <Input
              id="initialAmount"
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">종료일</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rebalancePeriod">리밸런싱 주기</Label>
            <div className="relative">
              <select
                id="rebalancePeriod"
                value={rebalancePeriod}
                onChange={(e) => setRebalancePeriod(e.target.value)}
                className={selectClass}
              >
                <option value="monthly">월별 (Monthly)</option>
                <option value="quarterly">분기별 (Quarterly)</option>
                <option value="annually">연별 (Annually)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="benchmark">벤치마크 티커</Label>
            <Input
              id="benchmark"
              className="uppercase"
              style={invalidTickers.includes(benchmark.toUpperCase().trim()) ? {
                borderColor: "rgba(251,113,133,0.55)",
                background:  "rgba(251,113,133,0.05)",
                color:       "#fda4af",
              } : undefined}
              value={benchmark}
              onChange={(e) => { setBenchmark(e.target.value); onClearErrors?.(); }}
              placeholder="SPY"
            />
            {invalidTickers.includes(benchmark.toUpperCase().trim()) && (
              <p className="pl-1 text-[10px]" style={{ color: "#fb7185" }}>
                유효하지 않은 벤치마크 티커입니다
              </p>
            )}
          </div>
        </div>
      </div>

      {/* API 에러 메시지 */}
      {submitError && (
        <div
          className="rounded-xl px-3 py-2.5 text-[11px] text-center leading-relaxed"
          style={{
            background: "rgba(251,113,133,0.08)",
            border:     "1px solid rgba(251,113,133,0.2)",
            color:      "#fda4af",
          }}
        >
          {submitError}
        </div>
      )}

      {/* 실행 버튼 */}
      <Button
        type="submit"
        disabled={!weightValid || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            분석 중...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            백테스트 실행
          </>
        )}
      </Button>

      {!weightValid && (
        <p className="text-[10px] text-center" style={{ color: "#fb7185" }}>
          {totalWeight > 100 ? "비중 합계가 100%를 초과했습니다" : "비중 합계를 100%로 맞춰주세요"}
        </p>
      )}
    </form>
  );
}
