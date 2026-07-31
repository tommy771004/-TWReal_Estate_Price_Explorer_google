import { useState } from "react";
import { Wallet } from "lucide-react";
import { estimateMaxTotalWanFromMonthly } from "../../../../constants/queryPresets";

type Props = {
  /** 目前總價上限（萬），空字串為不限 */
  totalPriceMaxWan: string;
  onApplyBudgetWan: (maxWan: number) => void;
};

/** 月付反推總價上限。由原 QueryAssistBar「預算篩選」段落搬來。 */
export function BudgetPicker({ totalPriceMaxWan, onApplyBudgetWan }: Props) {
  const [monthly, setMonthly] = useState("");

  const apply = () => {
    const n = parseFloat(monthly);
    if (!Number.isFinite(n) || n <= 0) return;
    const wan = estimateMaxTotalWanFromMonthly(n);
    if (wan != null) onApplyBudgetWan(wan);
  };

  return (
    <div className="space-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-2.5 dark:border-slate-700/70 dark:bg-slate-950/30">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-500 dark:text-slate-400">
        <Wallet size={12} className="text-emerald-500" />
        用月付能力反推
      </span>
      <div className="flex items-center gap-1.5">
        <div className="inline-flex h-9 flex-1 items-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="40000"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                apply();
              }
            }}
            className="h-full w-full border-0 bg-transparent px-3 text-sm font-bold outline-none placeholder:text-slate-300 dark:text-white"
          />
          <span className="pr-3 text-[11px] font-bold text-slate-400">元/月</span>
        </div>
        <button
          type="button"
          onClick={apply}
          className="h-9 shrink-0 rounded-xl bg-emerald-600 px-3.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-emerald-500"
        >
          換算
        </button>
      </div>
      <p className="text-[10px] font-medium text-slate-400">
        依 8 成貸、年利率 2.1%、30 年等額本息估算（僅供參考）
        {totalPriceMaxWan ? ` · 目前 ≤${totalPriceMaxWan} 萬` : ""}
      </p>
    </div>
  );
}
