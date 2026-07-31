import { Switch } from "@/components/ui/switch";
import { FilterGroupShell } from "../FilterGroupShell";
import { MetroPicker } from "./MetroPicker";
import { EXCLUDE_SPECIAL_NOTE } from "../../../../constants/filterLabels";
import type { MetroStation } from "../../../../constants/queryPresets";

export type MoreValue = {
  excludeSpecial: boolean;
  nearbyKm: number | null;
  nearbyLabel: string | null;
};

type Props = {
  cityName: string;
  value: MoreValue;
  onChangeExcludeSpecial: (v: boolean) => void;
  onPickStation: (station: MetroStation, km: number) => void;
  onClearNearby: () => void;
};

export const isMoreActive = (v: MoreValue) => v.nearbyKm != null || !v.excludeSpecial;

export const moreSummary = (v: MoreValue): string | null => {
  const parts: string[] = [];
  if (v.nearbyKm != null) parts.push(v.nearbyLabel ? v.nearbyLabel.split(" · ")[0] : `${v.nearbyKm}km`);
  if (!v.excludeSpecial) parts.push("含特殊交易");
  return parts.length ? parts.join("·") : null;
};

/** 更多：捷運生活圈 + 排除特殊交易。 */
export function MoreFilterGroup({
  cityName,
  value,
  onChangeExcludeSpecial,
  onPickStation,
  onClearNearby,
}: Props) {
  return (
    <FilterGroupShell title="更多">
      <div className="space-y-3">
        <MetroPicker
          cityName={cityName}
          nearbyLabel={value.nearbyLabel}
          onPickStation={onPickStation}
          onClear={onClearNearby}
        />

        <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
              排除特殊交易
            </span>
            <Switch
              checked={value.excludeSpecial}
              onCheckedChange={onChangeExcludeSpecial}
            />
          </label>
          <p className="text-[10px] font-medium leading-relaxed text-slate-400">
            {EXCLUDE_SPECIAL_NOTE}
          </p>
        </div>
      </div>
    </FilterGroupShell>
  );
}
