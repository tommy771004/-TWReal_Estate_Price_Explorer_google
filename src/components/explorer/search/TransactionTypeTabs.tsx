import { TRANSACTION_TYPES } from "../../../constants";
import { transactionTypeLabel } from "../../../constants/filterLabels";

type Props = {
  value: string;
  onChange: (name: string) => void;
};

/** 交易型態分段控制：買賣 / 預售屋 / 租屋（state 仍存「租賃」）。 */
export function TransactionTypeTabs({ value, onChange }: Props) {
  return (
    <div className="flex bg-white/40 dark:bg-black/20 p-1.5 rounded-[1rem] shadow-inner border border-white/60 dark:border-white/5">
      {TRANSACTION_TYPES.map((t) => (
        <button
          key={t.name}
          type="button"
          onClick={() => onChange(t.name)}
          className={`px-4 xl:px-6 h-9 font-bold text-xs sm:text-[13px] rounded-xl whitespace-nowrap transition-all ${
            value === t.name
              ? "bg-white dark:bg-slate-800 text-coral-600 dark:text-coral-400 shadow-sm border border-slate-100 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          {transactionTypeLabel(t.name)}
        </button>
      ))}
    </div>
  );
}
