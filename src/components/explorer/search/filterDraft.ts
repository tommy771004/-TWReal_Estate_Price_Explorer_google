/**
 * 篩選草稿：桌機 popover 直接寫回 context setter，手機抽屜先存 local draft 再一次套用。
 * 兩者共用同一份型別與摘要／計數邏輯，避免行為分歧。
 */

import type { ManagementFilter, ParkingFilter } from "../../../lib/urlState";
import { DEFAULT_PROPERTY_TYPES } from "../../../lib/urlState";
import type { PeriodRange } from "../../../utils/real-estate-helpers";
import { getDefaultPeriod } from "../../../utils/real-estate-helpers";
import type { NearbyAnchor } from "../../../types/app";
import type { FilterGroupId } from "../../../constants/filterLabels";
import { isPriceActive, priceSummary } from "./groups/PriceFilterGroup";
import { isAreaActive, areaSummary } from "./groups/AreaFilterGroup";
import { isLayoutActive, layoutSummary } from "./groups/LayoutFilterGroup";
import { isAgeActive, ageSummary } from "./groups/AgeFilterGroup";
import { isPropertyTypeActive, propertyTypeSummary } from "./groups/PropertyTypeFilterGroup";
import { isPeriodActive, periodSummary } from "./groups/PeriodFilterGroup";
import { isMoreActive, moreSummary } from "./groups/MoreFilterGroup";

export type FilterDraft = {
  propertyTypes: string[];
  totalPriceMinWan: string;
  totalPriceMaxWan: string;
  unitPrice: { min: string; max: string; unit: string };
  area: { min: string; max: string; unit: string };
  age: { min: string; max: string };
  roomsMin: string;
  hasManagement: ManagementFilter;
  parkingFilter: ParkingFilter;
  period: PeriodRange;
  excludeSpecial: boolean;
  nearbyKm: number | null;
  nearbyAnchor: NearbyAnchor | null;
};

export const emptyDraft = (): FilterDraft => ({
  propertyTypes: [...DEFAULT_PROPERTY_TYPES],
  totalPriceMinWan: "",
  totalPriceMaxWan: "",
  unitPrice: { min: "", max: "", unit: "1" },
  area: { min: "", max: "", unit: "2" },
  age: { min: "", max: "" },
  roomsMin: "",
  hasManagement: "any",
  parkingFilter: "any",
  period: getDefaultPeriod(),
  excludeSpecial: true,
  nearbyKm: null,
  nearbyAnchor: null,
});

const nearbyLabelOf = (d: FilterDraft): string | null =>
  d.nearbyKm == null
    ? null
    : d.nearbyAnchor
      ? `${d.nearbyAnchor.label} · ${d.nearbyKm}km`
      : `我的位置 · ${d.nearbyKm}km`;

/** 每個群組是否有偏離預設的條件。 */
export const isGroupActive = (id: FilterGroupId, d: FilterDraft): boolean => {
  switch (id) {
    case "price":
      return isPriceActive(d);
    case "area":
      return isAreaActive(d.area);
    case "layout":
      return isLayoutActive(d);
    case "age":
      return isAgeActive(d.age);
    case "propertyType":
      return isPropertyTypeActive(d.propertyTypes);
    case "period":
      return isPeriodActive(d.period);
    case "more":
      return isMoreActive({
        excludeSpecial: d.excludeSpecial,
        nearbyKm: d.nearbyKm,
        nearbyLabel: nearbyLabelOf(d),
      });
  }
};

/** 膠囊上顯示的摘要文字，null 代表沒套用。 */
export const groupSummary = (id: FilterGroupId, d: FilterDraft): string | null => {
  switch (id) {
    case "price":
      return priceSummary(d);
    case "area":
      return areaSummary(d.area);
    case "layout":
      return layoutSummary(d);
    case "age":
      return ageSummary(d.age);
    case "propertyType":
      return propertyTypeSummary(d.propertyTypes);
    case "period":
      return periodSummary(d.period);
    case "more":
      return moreSummary({
        excludeSpecial: d.excludeSpecial,
        nearbyKm: d.nearbyKm,
        nearbyLabel: nearbyLabelOf(d),
      });
  }
};

export const ALL_GROUP_IDS: FilterGroupId[] = [
  "price",
  "area",
  "layout",
  "age",
  "propertyType",
  "period",
  "more",
];

/** 已套用的群組數（膠囊列尾與手機 badge 用）。 */
export const activeGroupCount = (d: FilterDraft): number =>
  ALL_GROUP_IDS.filter((id) => isGroupActive(id, d)).length;

export const draftNearbyLabel = nearbyLabelOf;
