import { useDeferredValue, useMemo } from "react";
import type { Transaction } from "../types/real-estate";
import type { UserLocation } from "../types/app";
import { filterTransactions } from "./useFilteredTransactions";
import type { FilterDraft } from "../components/explorer/search/filterDraft";

type Params = {
  data: Transaction[];
  draft: FilterDraft;
  /** 已套用（非草稿）的取資料範圍條件 */
  search: string;
  district: string;
  focusBuildCase: string | null;
  userLocation: UserLocation;
  /** 需要重新向後端取資料時不算數字 */
  skip: boolean;
};

/**
 * 篩選抽屜的「顯示 N 筆結果」即時預覽。
 *
 * 直接重用 filterTransactions，確保預覽數字與套用後的實際結果一致。
 * 只有在 skip=false（草稿相對已套用條件是收窄）時才有意義。
 */
export function useDraftFilterCount({
  data,
  draft,
  search,
  district,
  focusBuildCase,
  userLocation,
  skip,
}: Params): { count: number | null; pending: boolean } {
  const deferredDraft = useDeferredValue(draft);
  const pending = deferredDraft !== draft;

  const count = useMemo(() => {
    if (skip) return null;
    return filterTransactions({
      data,
      search,
      district,
      propertyTypes: deferredDraft.propertyTypes,
      period: deferredDraft.period,
      unitPrice: deferredDraft.unitPrice,
      area: deferredDraft.area,
      age: deferredDraft.age,
      roomsMin: deferredDraft.roomsMin,
      hasManagement: deferredDraft.hasManagement,
      parkingFilter: deferredDraft.parkingFilter,
      focusBuildCase,
      excludeSpecial: deferredDraft.excludeSpecial,
      totalPriceMinWan: deferredDraft.totalPriceMinWan,
      totalPriceMaxWan: deferredDraft.totalPriceMaxWan,
      nearbyKm: deferredDraft.nearbyKm,
      nearbyAnchor: deferredDraft.nearbyAnchor,
      userLocation,
      sortConfig: null,
    }).length;
  }, [data, deferredDraft, search, district, focusBuildCase, userLocation, skip]);

  return { count, pending };
}
