import { motion } from "motion/react";
import type { ManagementFilter, ParkingFilter } from "../../../lib/urlState";
import type { PeriodRange } from "../../../utils/real-estate-helpers";
import {
  YEARS,
  MONTHS,
  getPeriodForMonths,
  isPeriodForMonths,
} from "../../../utils/real-estate-helpers";
import { AGE_PRESETS } from "../../../constants/filterLabels";

type Props = {
  period: PeriodRange;
  setPeriod: (v: PeriodRange) => void;
  unitPrice: { min: string; max: string; unit: string };
  setUnitPrice: (v: { min: string; max: string; unit: string }) => void;
  area: { min: string; max: string; unit: string };
  setArea: (v: { min: string; max: string; unit: string }) => void;
  age: { min: string; max: string };
  setAge: (v: { min: string; max: string }) => void;
  roomsMin: string;
  setRoomsMin: (v: string) => void;
  hasManagement: ManagementFilter;
  setHasManagement: (v: ManagementFilter) => void;
  parkingFilter: ParkingFilter;
  setParkingFilter: (v: ParkingFilter) => void;
  excludeSpecial: boolean;
  setExcludeSpecial: (updater: (v: boolean) => boolean) => void;
};

const PERIOD_QUICK = [
  { label: "近12月", months: 12 },
  { label: "近24月", months: 24 },
  { label: "近3年", months: 36 },
];

/** 進階篩選：期間 · 單價 · 面積 · 屋齡 · 格局 · 管理 · 車位 · 排除特殊交易。 */
export function AdvancedFilterBlock({
  period,
  setPeriod,
  unitPrice,
  setUnitPrice,
  area,
  setArea,
  age,
  setAge,
  roomsMin,
  setRoomsMin,
  hasManagement,
  setHasManagement,
  parkingFilter,
  setParkingFilter,
  excludeSpecial,
  setExcludeSpecial,
}: Props) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0, y: -8 }}
      animate={{ height: "auto", opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden mt-2"
    >
      <div className="relative space-y-4 rounded-[1.5rem] border border-slate-200/50 bg-white p-4 shadow-none dark:border-slate-800/60 dark:bg-slate-900 sm:p-5">
        {/* 列 1：期間 · 單價 · 面積 · 屋齡 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* 期間：快捷為主 + 年月微調 */}
          <div className="space-y-2">
            <label className="ml-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              交易期間
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PERIOD_QUICK.map((preset) => {
                const isActive = isPeriodForMonths(period, preset.months);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPeriod(getPeriodForMonths(preset.months))}
                    className={`h-8 rounded-lg border px-2.5 text-[11px] font-bold transition-colors ${
                      isActive
                        ? "border-coral-400/50 bg-coral-500/12 text-coral-700 dark:text-coral-300"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-coral-300 hover:text-coral-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-950/40">
              <select
                className="h-9 min-w-0 flex-1 appearance-none rounded-lg bg-transparent text-center text-xs font-bold outline-none"
                value={period.startY}
                onChange={(e) => setPeriod({ ...period, startY: e.target.value })}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                className="h-9 w-12 appearance-none rounded-lg bg-transparent text-center text-xs font-bold outline-none"
                value={period.startM}
                onChange={(e) => setPeriod({ ...period, startM: e.target.value })}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <span className="text-slate-300 dark:text-slate-600">–</span>
              <select
                className="h-9 min-w-0 flex-1 appearance-none rounded-lg bg-transparent text-center text-xs font-bold outline-none"
                value={period.endY}
                onChange={(e) => setPeriod({ ...period, endY: e.target.value })}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select
                className="h-9 w-12 appearance-none rounded-lg bg-transparent text-center text-xs font-bold outline-none"
                value={period.endM}
                onChange={(e) => setPeriod({ ...period, endM: e.target.value })}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 單價 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                單價
              </label>
              <div className="flex rounded-full border border-slate-200/80 bg-slate-50 p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-950/50">
                <button
                  type="button"
                  onClick={() => setUnitPrice({ ...unitPrice, unit: "1" })}
                  className={`rounded-full px-2 py-0.5 ${unitPrice.unit === "1" ? "bg-white text-coral-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                >
                  萬/坪
                </button>
                <button
                  type="button"
                  onClick={() => setUnitPrice({ ...unitPrice, unit: "2" })}
                  className={`rounded-full px-2 py-0.5 ${unitPrice.unit === "2" ? "bg-white text-coral-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                >
                  元/㎡
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="最低"
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                value={unitPrice.min}
                onChange={(e) => setUnitPrice({ ...unitPrice, min: e.target.value })}
              />
              <span className="text-slate-300">–</span>
              <input
                type="number"
                placeholder="最高"
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                value={unitPrice.max}
                onChange={(e) => setUnitPrice({ ...unitPrice, max: e.target.value })}
              />
            </div>
          </div>

          {/* 面積 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                面積
              </label>
              <div className="flex rounded-full border border-slate-200/80 bg-slate-50 p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-950/50">
                <button
                  type="button"
                  onClick={() => setArea({ ...area, unit: "2" })}
                  className={`rounded-full px-2 py-0.5 ${area.unit === "2" ? "bg-white text-coral-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                >
                  坪
                </button>
                <button
                  type="button"
                  onClick={() => setArea({ ...area, unit: "1" })}
                  className={`rounded-full px-2 py-0.5 ${area.unit === "1" ? "bg-white text-coral-600 shadow-sm dark:bg-slate-800" : "text-slate-400"}`}
                >
                  ㎡
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="最低"
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                value={area.min}
                onChange={(e) => setArea({ ...area, min: e.target.value })}
              />
              <span className="text-slate-300">–</span>
              <input
                type="number"
                placeholder="最高"
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                value={area.max}
                onChange={(e) => setArea({ ...area, max: e.target.value })}
              />
            </div>
          </div>

          {/* 屋齡 */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              屋齡（年）
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="最低"
                min={0}
                max={80}
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                value={age.min}
                onChange={(e) => setAge({ ...age, min: e.target.value })}
              />
              <span className="text-slate-300">–</span>
              <input
                type="number"
                placeholder="最高"
                min={0}
                max={80}
                className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40"
                value={age.max}
                onChange={(e) => setAge({ ...age, max: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {AGE_PRESETS.slice(0, 3).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAge({ min: p.min, max: p.max })}
                  className="h-7 rounded-md border border-slate-200 px-2 text-[10px] font-bold text-slate-500 hover:border-coral-300 hover:text-coral-600 dark:border-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 列 2：格局 · 管理 · 車位 · 排除特殊 */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/80 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-slate-400">格局</span>
            {["", "1", "2", "3", "4"].map((n) => (
              <button
                key={n || "any"}
                type="button"
                onClick={() => setRoomsMin(n)}
                className={`h-8 rounded-lg border px-2.5 text-[11px] font-bold transition-all ${
                  roomsMin === n
                    ? "border-coral-400/50 bg-coral-500/12 text-coral-700 dark:text-coral-300"
                    : "border-slate-200 text-slate-500 dark:border-slate-700"
                }`}
              >
                {n === "" ? "不限" : `≥${n}房`}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-slate-400">管理</span>
            {(
              [
                { v: "any" as const, label: "不限" },
                { v: "yes" as const, label: "有" },
                { v: "no" as const, label: "無" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setHasManagement(opt.v)}
                className={`h-8 rounded-lg border px-2.5 text-[11px] font-bold transition-all ${
                  hasManagement === opt.v
                    ? "border-coral-400/50 bg-coral-500/12 text-coral-700 dark:text-coral-300"
                    : "border-slate-200 text-slate-500 dark:border-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-slate-400">車位</span>
            {(
              [
                { v: "any" as const, label: "不限" },
                { v: "with" as const, label: "含" },
                { v: "without" as const, label: "不含" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setParkingFilter(opt.v)}
                className={`h-8 rounded-lg border px-2.5 text-[11px] font-bold transition-all ${
                  parkingFilter === opt.v
                    ? "border-coral-400/50 bg-coral-500/12 text-coral-700 dark:text-coral-300"
                    : "border-slate-200 text-slate-500 dark:border-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={excludeSpecial}
            title="排除親友／關係人等特殊交易"
            onClick={() => setExcludeSpecial((v: boolean) => !v)}
            className={`ml-auto inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[11px] font-bold transition-all ${
              excludeSpecial
                ? "border-rose-300/50 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "border-slate-200 text-slate-500 dark:border-slate-700"
            }`}
          >
            <span
              className={`relative h-3.5 w-6 rounded-full transition-colors ${
                excludeSpecial ? "bg-rose-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white shadow transition-transform ${
                  excludeSpecial ? "left-3" : "left-0.5"
                }`}
              />
            </span>
            排除特殊交易
          </button>
        </div>

        <p className="text-[10px] font-medium leading-relaxed text-slate-400">
          附近距離請用上方「捷運／地標附近」；物件詳情也可「以此為中心找附近」。
        </p>
      </div>
    </motion.div>
  );
}
