import type { Transaction } from "../types/real-estate";
import { formatDate, median } from "./real-estate-helpers";

export type MarketSnapshot = {
  count: number;
  avgUnitPrice: number | null;
  medianUnitPrice: number | null;
  avgTotalPrice: number | null;
  medianTotalPrice: number | null;
  latestDate: string;
  topDistrict: string;
  sampleN: number;
  sampleHint: string;
};

export type PinnedMarketSnapshot = MarketSnapshot & {
  id: string;
  label: string;
  cityName: string;
  district: string;
  typeName: string;
  pinnedAt: number;
};

export function computeMarketSnapshot(rows: Transaction[]): MarketSnapshot {
  const unitPrices = rows
    .map((item) => parseFloat(item.unitPrice || ""))
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => (value * 3.30578) / 10000);
  const totalPrices = rows
    .map((item) => parseFloat(item.totalPrice || ""))
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => value / 10000);
  const districtCounts = rows.reduce((acc, item) => {
    if (item.district) acc.set(item.district, (acc.get(item.district) || 0) + 1);
    return acc;
  }, new Map<string, number>());
  const topDistrict = [...districtCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const latestDate = rows
    .map((item) => item.date)
    .filter(Boolean)
    .sort()
    .at(-1);

  const sampleN = unitPrices.length;
  const sampleHint =
    sampleN === 0 ? "尚無樣本" : sampleN < 10 ? `樣本偏少 n=${sampleN}` : `n=${sampleN}`;

  return {
    count: rows.length,
    avgUnitPrice: unitPrices.length
      ? unitPrices.reduce((sum, value) => sum + value, 0) / unitPrices.length
      : null,
    medianUnitPrice: median(unitPrices),
    avgTotalPrice: totalPrices.length
      ? totalPrices.reduce((sum, value) => sum + value, 0) / totalPrices.length
      : null,
    medianTotalPrice: median(totalPrices),
    latestDate: latestDate ? formatDate(latestDate) : "待查詢",
    topDistrict: topDistrict ? `${topDistrict[0]} ${topDistrict[1]}筆` : "尚無熱區",
    sampleN,
    sampleHint,
  };
}

export function formatSnapshotLabel(cityName: string, district: string, typeName: string): string {
  return `${cityName}${district !== "全部" ? ` · ${district}` : ""} / ${typeName}`;
}

/** 比較兩區中位單價：回傳 A 相對 B 的百分比差（正值 = A 較高） */
export function medianUnitPriceDeltaPct(
  a: number | null,
  b: number | null
): number | null {
  if (a == null || b == null || b === 0) return null;
  return ((a - b) / b) * 100;
}
