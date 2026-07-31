/**
 * 判斷「草稿條件」能否用已抓下來的資料即時算出筆數，還是必須重新向後端取資料。
 *
 * 背景：api/index.ts 的 applyRowFilters 只在伺服器端過濾 district / keyword / period，
 * 其餘條件全在前端 useFilteredTransactions 算。因此：
 *  - 收窄 district / keyword / period → 現有資料是超集合，可即時算出精準筆數
 *  - 放寬任一項，或換城市／交易型態 → 現有資料不足，必須重新查詢
 */

import type { PeriodRange } from "../utils/real-estate-helpers";
import { getPeriodValue } from "../utils/real-estate-helpers";
import { DEFAULT_PROPERTY_TYPES } from "./urlState";
import type { ManagementFilter, ParkingFilter } from "./urlState";

export type FetchScope = {
  cityName: string;
  typeName: string;
  district: string;
  search: string;
  period: PeriodRange;
};

/** 草稿條件是否需要重新向內政部取資料（而非只在前端重篩）。 */
export const needsRefetch = (applied: FetchScope, draft: FetchScope): boolean => {
  // 換城市或交易型態：後端快取是以 city + type 為 key，一定要重抓
  if (applied.cityName !== draft.cityName) return true;
  if (applied.typeName !== draft.typeName) return true;

  // 行政區：只有「維持同一區」才是收窄；改成全部或改成別區都可能需要新資料
  if (applied.district !== draft.district && applied.district !== "全部") return true;

  // 關鍵字：草稿必須是已套用關鍵字的延伸（越打越長）才算收窄
  const appliedSearch = applied.search.trim();
  const draftSearch = draft.search.trim();
  if (appliedSearch && !draftSearch.startsWith(appliedSearch)) return true;

  // 期間：草稿起點早於已套用起點，或迄點晚於已套用迄點，都是放寬
  const appliedStart = getPeriodValue(applied.period.startY, applied.period.startM);
  const appliedEnd = getPeriodValue(applied.period.endY, applied.period.endM);
  const draftStart = getPeriodValue(draft.period.startY, draft.period.startM);
  const draftEnd = getPeriodValue(draft.period.endY, draft.period.endM);
  if (draftStart < appliedStart) return true;
  if (draftEnd > appliedEnd) return true;

  return false;
};

/* ---------- 已套用條件計數 ---------- */

export type CountableFilters = {
  propertyTypes: string[];
  unitPrice: { min: string; max: string };
  area: { min: string; max: string };
  age: { min: string; max: string };
  roomsMin: string;
  hasManagement: ManagementFilter;
  parkingFilter: ParkingFilter;
  totalPriceMinWan: string;
  totalPriceMaxWan: string;
  nearbyKm: number | null;
  excludeSpecial: boolean;
  period: PeriodRange;
  isDefaultPeriod: boolean;
};

export type FilterGroupCounts = {
  price: number;
  area: number;
  layout: number;
  age: number;
  propertyType: number;
  period: number;
  more: number;
};

const isDefaultPropertyTypes = (propertyTypes: string[]): boolean =>
  propertyTypes.length === DEFAULT_PROPERTY_TYPES.length &&
  DEFAULT_PROPERTY_TYPES.every((pt) => propertyTypes.includes(pt));

/** 每個群組有幾個偏離預設值的條件，以及總數。 */
export const countActiveFilters = (
  f: CountableFilters
): { total: number; byGroup: FilterGroupCounts } => {
  const byGroup: FilterGroupCounts = {
    price: 0,
    area: 0,
    layout: 0,
    age: 0,
    propertyType: 0,
    period: 0,
    more: 0,
  };

  if (f.totalPriceMinWan || f.totalPriceMaxWan) byGroup.price += 1;
  if (f.unitPrice.min || f.unitPrice.max) byGroup.price += 1;

  if (f.area.min || f.area.max) byGroup.area += 1;

  if (f.roomsMin) byGroup.layout += 1;
  if (f.hasManagement !== "any") byGroup.layout += 1;
  if (f.parkingFilter !== "any") byGroup.layout += 1;

  if (f.age.min || f.age.max) byGroup.age += 1;

  if (!isDefaultPropertyTypes(f.propertyTypes)) byGroup.propertyType += 1;

  if (!f.isDefaultPeriod) byGroup.period += 1;

  if (f.nearbyKm != null) byGroup.more += 1;
  // 排除特殊交易預設為開啟，只有「關閉」才算使用者主動改過
  if (!f.excludeSpecial) byGroup.more += 1;

  const total = Object.values(byGroup).reduce((sum, n) => sum + n, 0);
  return { total, byGroup };
};
