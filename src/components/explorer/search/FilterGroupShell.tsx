import type { ReactNode } from "react";

type Props = {
  title: string;
  /** 有值時顯示「清除」 */
  active?: boolean;
  onClear?: () => void;
  hint?: string;
  children: ReactNode;
};

/** 篩選群組的共用外殼：桌機 popover 與手機抽屜都用同一份。 */
export function FilterGroupShell({ title, active, onClear, hint, children }: Props) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          {title}
        </h3>
        {active && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] font-bold text-slate-400 transition-colors hover:text-coral-500"
          >
            清除
          </button>
        )}
      </div>
      {children}
      {hint && (
        <p className="text-[10px] font-medium leading-relaxed text-slate-400">{hint}</p>
      )}
    </section>
  );
}

/** 群組內共用的 chip 樣式。 */
export const groupChip = (active: boolean) =>
  `h-9 rounded-xl border px-3 text-[12px] font-bold transition-all ${
    active
      ? "border-coral-400/55 bg-coral-500/12 text-coral-700 dark:border-coral-500/40 dark:text-coral-300"
      : "border-slate-200 bg-white text-slate-600 hover:border-coral-300 hover:text-coral-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
  }`;

/** 群組內共用的數字輸入樣式。 */
export const groupNumberInput =
  "h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-sm font-bold outline-none focus:border-coral-400 dark:border-slate-700 dark:bg-slate-950/40";
