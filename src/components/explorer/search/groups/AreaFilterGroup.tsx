import { FilterGroupShell } from "../FilterGroupShell";
import { RangeChipGroup } from "./RangeChipGroup";
import { AREA_PRESETS } from "../../../../constants/filterLabels";

export type AreaValue = { min: string; max: string; unit: string };

type Props = {
  value: AreaValue;
  onChange: (next: AreaValue) => void;
};

export const isAreaActive = (v: AreaValue) => Boolean(v.min || v.max);

export const areaSummary = (v: AreaValue): string | null => {
  if (v.min && v.max) return `${v.min}–${v.max}坪`;
  if (v.max) return `≤${v.max}坪`;
  if (v.min) return `≥${v.min}坪`;
  return null;
};

/** 坪數，單位固定「坪」（unit 恆為 "2"）。 */
export function AreaFilterGroup({ value, onChange }: Props) {
  return (
    <FilterGroupShell
      title="坪數"
      active={isAreaActive(value)}
      onClear={() => onChange({ min: "", max: "", unit: "2" })}
    >
      <RangeChipGroup
        presets={AREA_PRESETS}
        value={{ min: value.min, max: value.max }}
        onChange={(r) => onChange({ min: r.min, max: r.max, unit: "2" })}
        unitSuffix="坪"
      />
    </FilterGroupShell>
  );
}
