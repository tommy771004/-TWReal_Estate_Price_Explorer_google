import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FilterGroupShell, groupChip } from "../FilterGroupShell";
import {
  PERIOD_PRESETS,
  formatRocMonthShort,
  formatRocYearLabel,
} from "../../../../constants/filterLabels";
import type { PeriodRange } from "../../../../utils/real-estate-helpers";
import {
  YEARS,
  MONTHS,
  getPeriodForMonths,
  isPeriodForMonths,
  isDefaultPeriod,
  getDefaultPeriod,
} from "../../../../utils/real-estate-helpers";

type Props = {
  value: PeriodRange;
  onChange: (next: PeriodRange) => void;
};

export const isPeriodActive = (v: PeriodRange) => !isDefaultPeriod(v);

export const periodSummary = (v: PeriodRange): string | null => {
  const preset = PERIOD_PRESETS.find((p) => isPeriodForMonths(v, p.months));
  if (preset) return isDefaultPeriod(v) ? null : preset.label;
  return `${formatRocMonthShort(v.startY, v.startM)}起`;
};

/**
 * 交易期間：以 chip 為主，民國年月下拉收在「自訂期間」後面。
 */
export function PeriodFilterGroup({ value, onChange }: Props) {
  const matchedPreset = PERIOD_PRESETS.find((p) => isPeriodForMonths(value, p.months));
  const [customOpen, setCustomOpen] = useState(!matchedPreset);

  return (
    <FilterGroupShell
      title="交易期間"
      active={isPeriodActive(value)}
      onClear={() => onChange(getDefaultPeriod())}
    >
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {PERIOD_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                onChange(getPeriodForMonths(p.months));
                setCustomOpen(false);
              }}
              className={groupChip(isPeriodForMonths(value, p.months))}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[12px] font-bold text-slate-600 transition-colors hover:border-coral-300 dark:border-slate-700 dark:text-slate-300"
          aria-expanded={customOpen}
        >
          自訂期間
          <ChevronDown
            size={14}
            className={`transition-transform ${customOpen ? "rotate-180" : ""}`}
          />
        </button>

        {customOpen && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <label className="w-6 shrink-0 text-[11px] font-bold text-slate-400">起</label>
              <select
                className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-900"
                value={value.startY}
                onChange={(e) => onChange({ ...value, startY: e.target.value })}
                aria-label="起始年"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{formatRocYearLabel(y)}</option>
                ))}
              </select>
              <select
                className="h-9 w-20 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-900"
                value={value.startM}
                onChange={(e) => onChange({ ...value, startM: e.target.value })}
                aria-label="起始月"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m} 月</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="w-6 shrink-0 text-[11px] font-bold text-slate-400">迄</label>
              <select
                className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-900"
                value={value.endY}
                onChange={(e) => onChange({ ...value, endY: e.target.value })}
                aria-label="結束年"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{formatRocYearLabel(y)}</option>
                ))}
              </select>
              <select
                className="h-9 w-20 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-900"
                value={value.endM}
                onChange={(e) => onChange({ ...value, endM: e.target.value })}
                aria-label="結束月"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m} 月</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              目前：{formatRocMonthShort(value.startY, value.startM)} ~{" "}
              {formatRocMonthShort(value.endY, value.endM)}
            </p>
          </div>
        )}
      </div>
    </FilterGroupShell>
  );
}
