import type { ReactNode } from "react";
import { Home, KeyRound, TrendingUp } from "lucide-react";
import { QUERY_PRESETS, type QueryPreset, type QueryPresetId } from "../../../constants/queryPresets";

const PRESET_ICONS: Record<QueryPresetId, ReactNode> = {
  "first-home": <Home size={13} strokeWidth={2.25} />,
  rent: <KeyRound size={13} strokeWidth={2.25} />,
  invest: <TrendingUp size={13} strokeWidth={2.25} />,
};

type Props = {
  onApplyPreset: (preset: QueryPreset) => void;
};

/** 「快速開始」場景 chip，只在完全沒套用篩選時出現。 */
export function ScenarioPresetChips({ onApplyPreset }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-0.5 text-[10px] font-black tracking-wide text-slate-400">快速開始</span>
      {QUERY_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          title={p.hint}
          onClick={() => onApplyPreset(p)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 text-[12px] font-bold text-slate-600 transition-all hover:border-coral-300/60 hover:text-coral-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-coral-300"
        >
          <span className="text-slate-400">{PRESET_ICONS[p.id]}</span>
          {p.label}
        </button>
      ))}
    </div>
  );
}
