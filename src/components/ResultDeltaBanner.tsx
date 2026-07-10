import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, Minus, X, History } from "lucide-react";
import type { SnapshotDelta } from "../lib/userDataPortability";

type Props = {
  delta: SnapshotDelta | null;
  onDismiss: () => void;
};

export function ResultDeltaBanner({ delta, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {delta && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="mx-1.5 mb-3 overflow-hidden sm:mx-6"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-sky-200/70 bg-sky-50/90 px-3.5 py-3 shadow-sm dark:border-sky-500/25 dark:bg-sky-950/40">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
              <History size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-sky-900 dark:text-sky-100">
                與此條件上次查詢相比
              </div>
              <p className="mt-0.5 text-[11px] font-bold leading-relaxed text-sky-800/90 dark:text-sky-200/90">
                <span className="opacity-70">{delta.previous.label}</span>
                {" · "}
                上次 {delta.previous.count.toLocaleString()} 筆
                {delta.previous.medianUnitWan != null && (
                  <>（中位約 {delta.previous.medianUnitWan.toFixed(1)} 萬/坪）</>
                )}
                {" → "}
                目前 {delta.current.count.toLocaleString()} 筆
                {delta.current.medianUnitWan != null && (
                  <>（中位約 {delta.current.medianUnitWan.toFixed(1)} 萬/坪）</>
                )}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                    delta.countDelta > 0
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : delta.countDelta < 0
                        ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                        : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {delta.countDelta > 0 ? (
                    <TrendingUp size={11} />
                  ) : delta.countDelta < 0 ? (
                    <TrendingDown size={11} />
                  ) : (
                    <Minus size={11} />
                  )}
                  筆數 {delta.countDelta > 0 ? "+" : ""}
                  {delta.countDelta.toLocaleString()}
                </span>
                {delta.newSampleCount > 0 && (
                  <span className="text-[10px] font-bold text-sky-700/80 dark:text-sky-300/80">
                    樣本中約有 {delta.newSampleCount} 筆為上次未見
                  </span>
                )}
                <span className="text-[10px] font-medium text-sky-600/70 dark:text-sky-400/70">
                  本地比對，非官方推播
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-full p-1.5 text-sky-500 hover:bg-sky-500/10"
              aria-label="關閉摘要"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
