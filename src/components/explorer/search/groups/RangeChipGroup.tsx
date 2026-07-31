import { groupChip, groupNumberInput } from "../FilterGroupShell";
import type { RangePreset } from "../../../../constants/filterLabels";

type RangeValue = { min: string; max: string };

type Props = {
  presets: RangePreset[];
  value: RangeValue;
  onChange: (next: RangeValue) => void;
  unitSuffix: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
};

/** 常用區間 chip + 自訂上下限，供價格／坪數／屋齡共用。 */
export function RangeChipGroup({
  presets,
  value,
  onChange,
  unitSuffix,
  minPlaceholder = "最低",
  maxPlaceholder = "最高",
}: Props) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => {
          const active = value.min === p.min && value.max === p.max;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(active ? { min: "", max: "" } : { min: p.min, max: p.max })}
              className={groupChip(active)}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          placeholder={minPlaceholder}
          className={groupNumberInput}
          value={value.min}
          onChange={(e) => onChange({ ...value, min: e.target.value })}
        />
        <span className="text-slate-300">–</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder={maxPlaceholder}
          className={groupNumberInput}
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
        />
        <span className="shrink-0 text-[11px] font-bold text-slate-400">{unitSuffix}</span>
      </div>
    </div>
  );
}
