import React from "react";

export function DetailRow({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`flex flex-col p-3 sm:p-4 bg-white/80 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group ${
        fullWidth ? "col-span-2" : ""
      }`}
    >
      <span className="text-slate-500 dark:text-slate-400 font-bold group-hover:text-coral-500 transition-colors uppercase text-[9px] sm:text-[10px] tracking-widest mb-0.5">
        {label}
      </span>
      <div className="text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm tracking-tight break-all select-text">
        {value || "-"}
      </div>
    </div>
  );
}
