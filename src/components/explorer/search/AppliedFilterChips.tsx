import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { DEFAULT_PROPERTY_TYPES } from "../../../lib/urlState";
import type { ManagementFilter, ParkingFilter } from "../../../lib/urlState";
import type { PeriodRange } from "../../../utils/real-estate-helpers";
import {
  formatPeriodLabel,
  getDefaultPeriod,
  isDefaultPeriod,
} from "../../../utils/real-estate-helpers";
import { QUERY_PRESETS, type QueryPresetId } from "../../../constants/queryPresets";
import type { NearbyAnchor } from "../../../types/app";

export type AppliedFilterValues = {
  cityName: string;
  district: string;
  typeName: string;
  period: PeriodRange;
  search: string;
  propertyTypes: string[];
  unitPrice: { min: string; max: string; unit: string };
  area: { min: string; max: string; unit: string };
  age: { min: string; max: string };
  roomsMin: string;
  hasManagement: ManagementFilter;
  parkingFilter: ParkingFilter;
  nearbyKm: number | null;
  nearbyAnchor: NearbyAnchor | null;
  focusBuildCase: string | null;
  excludeSpecial: boolean;
  totalPriceMinWan: string;
  totalPriceMaxWan: string;
  activePresetId: QueryPresetId | null;
};

export type AppliedFilterActions = {
  setDistrict: (v: string) => void;
  setTypeName: (v: string) => void;
  setViewMode: (v: string) => void;
  setPeriod: (v: PeriodRange) => void;
  setSearch: (v: string) => void;
  setPropertyTypes: (v: string[]) => void;
  setUnitPrice: (v: { min: string; max: string; unit: string }) => void;
  setArea: (v: { min: string; max: string; unit: string }) => void;
  setAge: (v: { min: string; max: string }) => void;
  setRoomsMin: (v: string) => void;
  setHasManagement: (v: ManagementFilter) => void;
  setParkingFilter: (v: ParkingFilter) => void;
  setNearbyKm: (v: number | null) => void;
  setNearbyAnchor: (v: NearbyAnchor | null) => void;
  setFocusBuildCase: (v: string | null) => void;
  setExcludeSpecial: (v: boolean) => void;
  setTotalPriceMinWan: (v: string) => void;
  setTotalPriceMaxWan: (v: string) => void;
  setActivePresetId: (v: QueryPresetId | null) => void;
};

type Chip = { id: string; label: string; onClear?: () => void; muted?: boolean };

function buildChips(f: AppliedFilterValues, a: AppliedFilterActions): Chip[] {
  const chips: Chip[] = [];

  if (f.district !== "全部") {
    chips.push({ id: "district", label: f.district, onClear: () => a.setDistrict("全部") });
  }

  if (f.typeName !== "買賣") {
    chips.push({
      id: "typeName",
      label: f.typeName,
      onClear: () => {
        a.setTypeName("買賣");
        a.setViewMode("list");
      },
    });
  }

  // 期間：只有偏離預設（近 12 個月）時才佔版面
  if (!isDefaultPeriod(f.period)) {
    chips.push({
      id: "period",
      label: `期間 ${formatPeriodLabel(f.period)}`,
      onClear: () => a.setPeriod(getDefaultPeriod()),
    });
  }

  if (f.search.trim()) {
    chips.push({ id: "search", label: `關鍵字: ${f.search}`, onClear: () => a.setSearch("") });
  }

  // 僅在標的種類偏離預設時顯示（避免預設三種永遠佔版面）
  const isDefaultPts =
    f.propertyTypes.length === DEFAULT_PROPERTY_TYPES.length &&
    DEFAULT_PROPERTY_TYPES.every((pt) => f.propertyTypes.includes(pt));
  if (!isDefaultPts) {
    if (f.propertyTypes.length === 0) {
      chips.push({
        id: "pt-none",
        label: "種類: 未選",
        onClear: () => a.setPropertyTypes([...DEFAULT_PROPERTY_TYPES]),
      });
    } else if (f.propertyTypes.length <= 3) {
      f.propertyTypes.forEach((pt) => {
        chips.push({
          id: `pt-${pt}`,
          label: pt,
          onClear: () => {
            const next = f.propertyTypes.filter((p) => p !== pt);
            a.setPropertyTypes(next.length ? next : [...DEFAULT_PROPERTY_TYPES]);
          },
        });
      });
    } else {
      chips.push({
        id: "pt-many",
        label: `種類 ${f.propertyTypes.length} 項`,
        onClear: () => a.setPropertyTypes([...DEFAULT_PROPERTY_TYPES]),
      });
    }
  }

  if (f.unitPrice.min || f.unitPrice.max) {
    chips.push({
      id: "unitPrice",
      label: `單價 ${f.unitPrice.min || "0"}–${f.unitPrice.max || "∞"} ${
        f.unitPrice.unit === "1" ? "萬/坪" : "元/㎡"
      }`,
      onClear: () => a.setUnitPrice({ min: "", max: "", unit: "1" }),
    });
  }

  if (f.area.min || f.area.max) {
    chips.push({
      id: "area",
      label: `坪數 ${f.area.min || "0"}–${f.area.max || "∞"} ${f.area.unit === "2" ? "坪" : "㎡"}`,
      onClear: () => a.setArea({ min: "", max: "", unit: "2" }),
    });
  }

  if (f.age.min || f.age.max) {
    chips.push({
      id: "age",
      label: `屋齡 ${f.age.min || "0"}–${f.age.max || "∞"} 年`,
      onClear: () => a.setAge({ min: "", max: "" }),
    });
  }

  if (f.roomsMin) {
    chips.push({ id: "rooms", label: `≥${f.roomsMin} 房`, onClear: () => a.setRoomsMin("") });
  }

  if (f.hasManagement !== "any") {
    chips.push({
      id: "mgmt",
      label: f.hasManagement === "yes" ? "有管理" : "無管理",
      onClear: () => a.setHasManagement("any"),
    });
  }

  if (f.parkingFilter !== "any") {
    chips.push({
      id: "parking",
      label: f.parkingFilter === "with" ? "含車位" : "不含車位",
      onClear: () => a.setParkingFilter("any"),
    });
  }

  if (f.nearbyKm != null) {
    chips.push({
      id: "nearby",
      label: f.nearbyAnchor
        ? `附近 ${f.nearbyKm}km · ${f.nearbyAnchor.label.slice(0, 12)}${
            f.nearbyAnchor.label.length > 12 ? "…" : ""
          }`
        : `附近 ${f.nearbyKm}km（我的位置）`,
      onClear: () => {
        a.setNearbyKm(null);
        a.setNearbyAnchor(null);
      },
    });
  }

  if (f.focusBuildCase) {
    chips.push({
      id: "focus-bc",
      label: `建案: ${f.focusBuildCase}`,
      onClear: () => a.setFocusBuildCase(null),
    });
  }

  // 排除特殊交易預設開啟，只有使用者關掉時才需要提示
  if (!f.excludeSpecial) {
    chips.push({
      id: "include-special",
      label: "含特殊交易",
      onClear: () => a.setExcludeSpecial(true),
    });
  }

  if (f.totalPriceMinWan || f.totalPriceMaxWan) {
    const label =
      f.totalPriceMinWan && f.totalPriceMaxWan
        ? `總價 ${f.totalPriceMinWan}–${f.totalPriceMaxWan} 萬`
        : f.totalPriceMaxWan
          ? `總價 ≤ ${f.totalPriceMaxWan} 萬`
          : `總價 ≥ ${f.totalPriceMinWan} 萬`;
    chips.push({
      id: "budget",
      label,
      onClear: () => {
        a.setTotalPriceMinWan("");
        a.setTotalPriceMaxWan("");
      },
    });
  }

  if (f.activePresetId) {
    const preset = QUERY_PRESETS.find((p) => p.id === f.activePresetId);
    chips.push({
      id: "preset",
      label: `預設: ${preset?.label ?? f.activePresetId}`,
      onClear: () => a.setActivePresetId(null),
      muted: true,
    });
  }

  return chips;
}

/** 收合前顯示的 chip 上限，其餘折成「其他 N 項」 */
const MAX_VISIBLE_CHIPS = 4;

/**
 * 已套用條件 chip 列，每顆可單獨清除。
 * 只顯示偏離預設值的條件；完全沒有條件時改渲染 fallback（快速開始）。
 */
export function AppliedFilterChips({
  values,
  actions,
  fallback = null,
}: {
  values: AppliedFilterValues;
  actions: AppliedFilterActions;
  fallback?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const chips = buildChips(values, actions);

  if (chips.length === 0) return <>{fallback}</>;

  const overflow = chips.length - MAX_VISIBLE_CHIPS;
  const visible = expanded || overflow <= 0 ? chips : chips.slice(0, MAX_VISIBLE_CHIPS);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: "auto", marginTop: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-wrap items-center gap-1.5 overflow-hidden"
    >
      <span className="mr-0.5 text-[10px] font-black tracking-wide text-slate-400">已套用</span>
      <AnimatePresence>
        {visible.map((chip) => (
          <motion.span
            key={chip.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
              chip.muted
                ? "border-slate-200/80 bg-slate-100/80 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-slate-300"
                : "border-coral-200/60 bg-coral-500/10 text-coral-600 dark:border-coral-500/30 dark:bg-coral-500/15 dark:text-coral-400"
            }`}
          >
            {chip.label}
            {chip.onClear && (
              <button
                type="button"
                onClick={chip.onClear}
                className="w-3.5 h-3.5 rounded-full hover:bg-coral-500 hover:text-white flex items-center justify-center transition-colors shrink-0"
                aria-label={`清除 ${chip.label}`}
              >
                <X size={10} strokeWidth={3} />
              </button>
            )}
          </motion.span>
        ))}
      </AnimatePresence>
      {overflow > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-full border border-slate-200/80 bg-slate-100/80 px-2.5 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:text-coral-600 dark:border-slate-700/50 dark:bg-slate-800/60 dark:text-slate-300"
        >
          {expanded ? "收合" : `其他 ${overflow} 項`}
        </button>
      )}
    </motion.div>
  );
}
