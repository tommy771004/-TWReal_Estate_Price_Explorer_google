import { FilterGroupShell } from "../FilterGroupShell";
import { RangeChipGroup } from "./RangeChipGroup";
import { AGE_PRESETS, AGE_FILTER_NOTE } from "../../../../constants/filterLabels";

export type AgeValue = { min: string; max: string };

type Props = {
  value: AgeValue;
  onChange: (next: AgeValue) => void;
};

export const isAgeActive = (v: AgeValue) => Boolean(v.min || v.max);

export const ageSummary = (v: AgeValue): string | null => {
  if (v.min && v.max) return `${v.min}–${v.max}年`;
  if (v.max) return `${v.max}年內`;
  if (v.min) return `${v.min}年以上`;
  return null;
};

export function AgeFilterGroup({ value, onChange }: Props) {
  return (
    <FilterGroupShell
      title="屋齡"
      active={isAgeActive(value)}
      onClear={() => onChange({ min: "", max: "" })}
      hint={AGE_FILTER_NOTE}
    >
      <RangeChipGroup
        presets={AGE_PRESETS}
        value={value}
        onChange={onChange}
        unitSuffix="年"
      />
    </FilterGroupShell>
  );
}
