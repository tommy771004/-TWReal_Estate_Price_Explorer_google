import { FilterGroupShell, groupChip } from "../FilterGroupShell";
import {
  ROOMS_OPTIONS,
  PARKING_OPTIONS,
  MANAGEMENT_OPTIONS,
} from "../../../../constants/filterLabels";
import type { ManagementFilter, ParkingFilter } from "../../../../lib/urlState";

export type LayoutValue = {
  roomsMin: string;
  parkingFilter: ParkingFilter;
  hasManagement: ManagementFilter;
};

type Props = {
  value: LayoutValue;
  onChange: (next: LayoutValue) => void;
};

export const isLayoutActive = (v: LayoutValue) =>
  Boolean(v.roomsMin) || v.parkingFilter !== "any" || v.hasManagement !== "any";

export const layoutSummary = (v: LayoutValue): string | null => {
  const parts: string[] = [];
  if (v.roomsMin) parts.push(`${v.roomsMin}房以上`);
  if (v.parkingFilter === "with") parts.push("有車位");
  else if (v.parkingFilter === "without") parts.push("無車位");
  if (v.hasManagement === "yes") parts.push("有管理");
  else if (v.hasManagement === "no") parts.push("無管理");
  return parts.length ? parts.join("·") : null;
};

/** 房型：房數 / 車位 / 管理。 */
export function LayoutFilterGroup({ value, onChange }: Props) {
  return (
    <FilterGroupShell
      title="房型"
      active={isLayoutActive(value)}
      onClear={() => onChange({ roomsMin: "", parkingFilter: "any", hasManagement: "any" })}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">房數</span>
          <div className="flex flex-wrap gap-1.5">
            {ROOMS_OPTIONS.map((opt) => (
              <button
                key={opt.value || "any"}
                type="button"
                onClick={() => onChange({ ...value, roomsMin: opt.value })}
                className={groupChip(value.roomsMin === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">車位</span>
          <div className="flex flex-wrap gap-1.5">
            {PARKING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...value, parkingFilter: opt.value })}
                className={groupChip(value.parkingFilter === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">管理</span>
          <div className="flex flex-wrap gap-1.5">
            {MANAGEMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ ...value, hasManagement: opt.value })}
                className={groupChip(value.hasManagement === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </FilterGroupShell>
  );
}
