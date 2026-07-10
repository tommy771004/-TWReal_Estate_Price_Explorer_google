import React, { useEffect, useMemo, useState } from "react";
import { Home, KeyRound, TrendingUp, Train, Wallet } from "lucide-react";
import {
  QUERY_PRESETS,
  type QueryPreset,
  type QueryPresetId,
  stationsForCity,
  estimateMaxTotalWanFromMonthly,
  type MetroStation,
} from "../constants/queryPresets";

export type QueryAssistBarProps = {
  cityName: string;
  activePresetId: QueryPresetId | null;
  onApplyPreset: (preset: QueryPreset) => void;
  /** 預算：總價上限（萬元） */
  onApplyBudgetWan: (maxWan: number) => void;
  onPickStation: (station: MetroStation, km: number) => void;
  nearbyLabel?: string | null;
  /** 目前預算上限（萬），用於顯示已套用狀態 */
  totalPriceMaxWan?: string;
  /** 套用後可關閉彈窗 */
  onDone?: () => void;
};

const PRESET_ICONS: Record<QueryPresetId, React.ReactNode> = {
  "first-home": <Home size={14} strokeWidth={2.25} />,
  rent: <KeyRound size={14} strokeWidth={2.25} />,
  invest: <TrendingUp size={14} strokeWidth={2.25} />,
};

/**
 * 查詢加速內容（場景 / 預算 / 捷運），供彈窗內使用。
 */
export function QueryAssistBar({
  cityName,
  activePresetId,
  onApplyPreset,
  onApplyBudgetWan,
  onPickStation,
  nearbyLabel,
  totalPriceMaxWan = "",
  onDone,
}: QueryAssistBarProps) {
  const [budgetMode, setBudgetMode] = useState<"total" | "monthly">("total");
  const [budgetInput, setBudgetInput] = useState(totalPriceMaxWan || "");
  const [stationKm, setStationKm] = useState(1);
  const stations = useMemo(() => stationsForCity(cityName), [cityName]);

  useEffect(() => {
    if (totalPriceMaxWan) setBudgetInput(totalPriceMaxWan);
  }, [totalPriceMaxWan]);

  const applyBudget = () => {
    const n = parseFloat(budgetInput);
    if (!Number.isFinite(n) || n <= 0) return;
    if (budgetMode === "total") {
      onApplyBudgetWan(Math.round(n));
      onDone?.();
      return;
    }
    const wan = estimateMaxTotalWanFromMonthly(n);
    if (wan != null) {
      setBudgetInput(String(wan));
      onApplyBudgetWan(wan);
      onDone?.();
    }
  };

  const chipBase =
    "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold transition-all whitespace-nowrap";
  const chipIdle =
    "border-slate-200/90 bg-white text-slate-600 hover:border-coral-300/60 hover:text-coral-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-coral-300";
  const chipOn =
    "border-coral-400/55 bg-coral-500/12 text-coral-700 shadow-sm dark:border-coral-500/40 dark:text-coral-300";

  return (
    <div className="flex flex-col gap-5">
      {/* 場景 */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          場景預設
        </h3>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          一鍵帶入常用條件（房數、屋齡、標的等），仍可再手動調整。
        </p>
        <div className="flex flex-wrap gap-2">
          {QUERY_PRESETS.map((p) => {
            const active = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                title={p.hint}
                onClick={() => {
                  onApplyPreset(p);
                  onDone?.();
                }}
                className={`${chipBase} ${active ? chipOn : chipIdle}`}
              >
                <span className={active ? "text-coral-500" : "text-slate-400"}>
                  {PRESET_ICONS[p.id]}
                </span>
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 預算 */}
      <section className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h3 className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          <Wallet size={13} className="text-emerald-500" />
          預算篩選
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-slate-200/90 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950/50">
            <button
              type="button"
              onClick={() => setBudgetMode("total")}
              className={`h-8 rounded-full px-3 text-[11px] font-bold transition ${
                budgetMode === "total"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300"
                  : "text-slate-400"
              }`}
            >
              總價上限
            </button>
            <button
              type="button"
              onClick={() => setBudgetMode("monthly")}
              className={`h-8 rounded-full px-3 text-[11px] font-bold transition ${
                budgetMode === "monthly"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300"
                  : "text-slate-400"
              }`}
            >
              月付反推
            </button>
          </div>
          <div className="inline-flex h-9 items-center overflow-hidden rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <input
              type="number"
              min={1}
              placeholder={budgetMode === "total" ? "1500" : "40000"}
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyBudget()}
              className="h-full w-[6.5rem] border-0 bg-transparent px-3 text-sm font-bold outline-none placeholder:text-slate-300 dark:text-white"
            />
            <span className="pr-3 text-[11px] font-bold text-slate-400">
              {budgetMode === "total" ? "萬" : "元/月"}
            </span>
          </div>
          <button
            type="button"
            onClick={applyBudget}
            className="h-9 rounded-full bg-emerald-600 px-4 text-[12px] font-bold text-white shadow-sm hover:bg-emerald-500"
          >
            套用
          </button>
        </div>
        <p className="text-[10px] font-medium text-slate-400">
          {budgetMode === "monthly"
            ? "依 8 成貸、年利率 2.1%、30 年等額本息反推總價上限（僅供參考）"
            : "以總價（萬元）上限篩選成交"}
          {totalPriceMaxWan ? ` · 目前 ≤${totalPriceMaxWan} 萬` : ""}
        </p>
      </section>

      {/* 捷運 */}
      <section className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            <Train size={13} className="text-sky-500" />
            捷運生活圈
          </h3>
          <div className="inline-flex rounded-full border border-slate-200/90 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-950/50">
            {[0.5, 1, 2].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setStationKm(km)}
                className={`h-7 rounded-full px-2.5 text-[10px] font-bold transition ${
                  stationKm === km
                    ? "bg-white text-sky-700 shadow-sm dark:bg-slate-800 dark:text-sky-300"
                    : "text-slate-400"
                }`}
              >
                {km < 1 ? `${km * 1000}m` : `${km}km`}
              </button>
            ))}
          </div>
        </div>
        {nearbyLabel && (
          <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
            目前中心：{nearbyLabel}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {stations.map((s) => {
            const active = nearbyLabel?.startsWith(s.name);
            return (
              <button
                key={s.id}
                type="button"
                title={s.lines ? `${s.name}（${s.lines}）` : s.name}
                onClick={() => {
                  onPickStation(s, stationKm);
                  onDone?.();
                }}
                className={`${chipBase} ${
                  active
                    ? "border-sky-400/55 bg-sky-500/12 text-sky-800 dark:text-sky-200"
                    : chipIdle
                }`}
              >
                <Train size={12} className={active ? "text-sky-500" : "text-slate-400"} />
                {s.name}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
