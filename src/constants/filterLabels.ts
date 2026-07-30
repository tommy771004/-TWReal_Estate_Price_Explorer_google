/**
 * 篩選介面的「顯示層」字典。
 *
 * 重要：這裡只負責把 state 值翻成白話中文。
 * `propertyTypes` 的 state 值必須維持內政部官方字串（房地 / 房地(車) / 建物 / 車位 / 土地），
 * 因為 useFilteredTransactions、urlState、useFetchRealEstate 都以這些字串比對。
 */

import type { ManagementFilter, ParkingFilter } from "../lib/urlState";

/* ---------- 交易型態 ---------- */

/** state 仍存「租賃」，畫面顯示「租屋」較口語。 */
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  買賣: "買賣",
  預售屋: "預售屋",
  租賃: "租屋",
};

export const transactionTypeLabel = (name: string): string =>
  TRANSACTION_TYPE_LABELS[name] ?? name;

/* ---------- 標的種類 ---------- */

export type PropertyTypeOption = {
  /** 必須與官方字串一致 */
  value: string;
  label: string;
  hint: string;
};

export const PROPERTY_TYPE_OPTIONS: PropertyTypeOption[] = [
  { value: "房地", label: "房屋＋土地", hint: "一般成屋，含土地持分" },
  { value: "房地(車)", label: "房屋＋土地＋車位", hint: "含車位一併成交" },
  { value: "建物", label: "僅建物", hint: "只登記建物，不含土地" },
  { value: "車位", label: "車位", hint: "單獨買賣的停車位" },
  { value: "土地", label: "土地", hint: "素地、建地" },
];

export const propertyTypeLabel = (value: string): string =>
  PROPERTY_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

/* ---------- 區間預設（chip） ---------- */

export type RangePreset = {
  label: string;
  /** 空字串代表不限 */
  min: string;
  max: string;
};

/** 總價（萬元） */
export const TOTAL_PRICE_PRESETS: RangePreset[] = [
  { label: "1000萬以下", min: "", max: "1000" },
  { label: "1000–1500萬", min: "1000", max: "1500" },
  { label: "1500–2000萬", min: "1500", max: "2000" },
  { label: "2000–3000萬", min: "2000", max: "3000" },
  { label: "3000萬以上", min: "3000", max: "" },
];

/** 坪數 */
export const AREA_PRESETS: RangePreset[] = [
  { label: "15坪以下", min: "", max: "15" },
  { label: "15–25坪", min: "15", max: "25" },
  { label: "25–35坪", min: "25", max: "35" },
  { label: "35–50坪", min: "35", max: "50" },
  { label: "50坪以上", min: "50", max: "" },
];

/** 屋齡（年） */
export const AGE_PRESETS: RangePreset[] = [
  { label: "5年內", min: "", max: "5" },
  { label: "10年內", min: "", max: "10" },
  { label: "10–20年", min: "10", max: "20" },
  { label: "20–40年", min: "20", max: "40" },
  { label: "40年以上", min: "40", max: "" },
];

/** 屋齡是以建物完成年份推估，沒有完工資料的物件會被 useFilteredTransactions 排除。 */
export const AGE_FILTER_NOTE = "以建物完成年份推估；沒有完工資料的物件會被排除";

/* ---------- 交易期間 ---------- */

export type PeriodPreset = { label: string; months: number };

export const PERIOD_PRESETS: PeriodPreset[] = [
  { label: "近半年", months: 6 },
  { label: "近1年", months: 12 },
  { label: "近2年", months: 24 },
  { label: "近3年", months: 36 },
  { label: "近5年", months: 60 },
];

/** 民國年月 → 「113年8月（2024/08）」 */
export const formatRocMonthLabel = (y: string | number, m: string | number): string => {
  const rocYear = Number(y);
  const month = Number(m);
  if (!Number.isFinite(rocYear) || !Number.isFinite(month)) return `${y}年${m}月`;
  const adYear = rocYear + 1911;
  return `${rocYear}年${month}月（${adYear}/${String(month).padStart(2, "0")}）`;
};

/** 民國年月 → 「113年8月」（摘要用的短版） */
export const formatRocMonthShort = (y: string | number, m: string | number): string =>
  `${y}年${m}月`;

/* ---------- 格局 / 車位 / 管理 ---------- */

export type ChoiceOption<T extends string> = { value: T; label: string };

export const ROOMS_OPTIONS: ChoiceOption<string>[] = [
  { value: "", label: "不限" },
  { value: "1", label: "1房以上" },
  { value: "2", label: "2房以上" },
  { value: "3", label: "3房以上" },
  { value: "4", label: "4房以上" },
];

export const PARKING_OPTIONS: ChoiceOption<ParkingFilter>[] = [
  { value: "any", label: "不限" },
  { value: "with", label: "要有車位" },
  { value: "without", label: "不要車位" },
];

export const MANAGEMENT_OPTIONS: ChoiceOption<ManagementFilter>[] = [
  { value: "any", label: "不限" },
  { value: "yes", label: "有管理員／管委會" },
  { value: "no", label: "無管理" },
];

export const EXCLUDE_SPECIAL_NOTE = "排除親友、關係人等可能偏離行情的交易（建議開啟）";

/* ---------- 排序 ---------- */

export type SortOptionValue =
  | "default"
  | "totalPrice-desc"
  | "totalPrice-asc"
  | "unitPrice-desc"
  | "unitPrice-asc";

export const SORT_OPTIONS: ChoiceOption<SortOptionValue>[] = [
  { value: "default", label: "最新成交" },
  { value: "totalPrice-desc", label: "總價：高→低" },
  { value: "totalPrice-asc", label: "總價：低→高" },
  { value: "unitPrice-desc", label: "單價：高→低" },
  { value: "unitPrice-asc", label: "單價：低→高" },
];

/* ---------- 群組 ---------- */

export type FilterGroupId =
  | "price"
  | "area"
  | "layout"
  | "age"
  | "propertyType"
  | "period"
  | "more";

export const FILTER_GROUP_LABELS: Record<FilterGroupId, string> = {
  price: "價格",
  area: "坪數",
  layout: "房型",
  age: "屋齡",
  propertyType: "類型",
  period: "期間",
  more: "更多",
};
