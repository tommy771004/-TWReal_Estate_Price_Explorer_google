/** 任務導向查詢預設與常用捷運站（前端快捷，不依賴後端）。 */

export type QueryPresetId = "first-home" | "rent" | "invest";

export type QueryPreset = {
  id: QueryPresetId;
  label: string;
  hint: string;
  /** 交易型態 */
  typeName: "買賣" | "預售屋" | "租賃";
  propertyTypes: string[];
  roomsMin: string;
  age: { min: string; max: string };
  unitPrice: { min: string; max: string; unit: string };
  area: { min: string; max: string; unit: string };
  hasManagement: "any" | "yes" | "no";
  parking: "any" | "with" | "without";
  excludeSpecial: boolean;
};

export const QUERY_PRESETS: QueryPreset[] = [
  {
    id: "first-home",
    label: "首購自住",
    hint: "買賣 · ≥2房 · 屋齡≤30 · 排除特殊交易",
    typeName: "買賣",
    propertyTypes: ["房地", "建物"],
    roomsMin: "2",
    age: { min: "", max: "30" },
    unitPrice: { min: "", max: "", unit: "1" },
    area: { min: "15", max: "45", unit: "2" },
    hasManagement: "any",
    parking: "any",
    excludeSpecial: true,
  },
  {
    id: "rent",
    label: "租屋行情",
    hint: "租賃 · 排除特殊 · 適合先看區域租金水準",
    typeName: "租賃",
    propertyTypes: ["房地", "建物"],
    roomsMin: "",
    age: { min: "", max: "" },
    unitPrice: { min: "", max: "", unit: "1" },
    area: { min: "", max: "", unit: "2" },
    hasManagement: "any",
    parking: "any",
    excludeSpecial: true,
  },
  {
    id: "invest",
    label: "投資置產",
    hint: "買賣 · 有管理 · 含車位優先 · 排除特殊",
    typeName: "買賣",
    propertyTypes: ["房地", "房地(車)"],
    roomsMin: "",
    age: { min: "", max: "25" },
    unitPrice: { min: "", max: "", unit: "1" },
    area: { min: "10", max: "50", unit: "2" },
    hasManagement: "yes",
    parking: "with",
    excludeSpecial: true,
  },
];

export type MetroStation = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  lines?: string;
};

/** 雙北／桃園常用站（座標約為站體中心，供 nearby 錨點）。 */
export const POPULAR_METRO_STATIONS: MetroStation[] = [
  { id: "tp-taipei-main", name: "台北車站", city: "臺北市", lat: 25.0478, lng: 121.5170, lines: "淡水信義/板南" },
  { id: "tp-zhongxiao-fuxing", name: "忠孝復興", city: "臺北市", lat: 25.0416, lng: 121.5438, lines: "板南/文湖" },
  { id: "tp-daan", name: "大安", city: "臺北市", lat: 25.0331, lng: 121.5436, lines: "淡水信義/文湖" },
  { id: "tp-guting", name: "古亭", city: "臺北市", lat: 25.0264, lng: 121.5229, lines: "松山新店/中和" },
  { id: "tp-shilin", name: "士林", city: "臺北市", lat: 25.0935, lng: 121.5264, lines: "淡水信義" },
  { id: "tp-nangang", name: "南港", city: "臺北市", lat: 25.0520, lng: 121.6066, lines: "板南/文湖" },
  { id: "ntp-banqiao", name: "板橋", city: "新北市", lat: 25.0144, lng: 121.4630, lines: "板南/環狀" },
  { id: "ntp-fuzhong", name: "府中", city: "新北市", lat: 25.0085, lng: 121.4592, lines: "板南" },
  { id: "ntp-sanchong", name: "三重", city: "新北市", lat: 25.0556, lng: 121.4845, lines: "中和新蘆" },
  { id: "ntp-yonghe", name: "永安市場", city: "新北市", lat: 25.0027, lng: 121.5113, lines: "中和新蘆" },
  { id: "ntp-xinzhuang", name: "新莊", city: "新北市", lat: 25.0362, lng: 121.4523, lines: "中和新蘆" },
  { id: "ty-a18", name: "桃園高鐵", city: "桃園市", lat: 25.0129, lng: 121.2147, lines: "機場捷運" },
  { id: "ty-a21", name: "環北", city: "桃園市", lat: 25.0001, lng: 121.3063, lines: "機場捷運" },
  { id: "tc-taichung", name: "台中車站", city: "臺中市", lat: 24.1369, lng: 120.6850, lines: "台鐵" },
  { id: "kh-formosa", name: "美麗島", city: "高雄市", lat: 22.6314, lng: 120.3019, lines: "紅橘" },
  { id: "kh-zuoying", name: "左營/高鐵", city: "高雄市", lat: 22.6870, lng: 120.3075, lines: "紅線" },
];

export const stationsForCity = (cityName: string): MetroStation[] => {
  const inCity = POPULAR_METRO_STATIONS.filter((s) => s.city === cityName);
  if (inCity.length > 0) return inCity;
  // 其他縣市：給幾個跨區熱門站作示意錨點（使用者可改定位）
  return POPULAR_METRO_STATIONS.slice(0, 6);
};

/**
 * 由「可負擔月付」反推建議總價上限（萬元）。
 * 假設：八成貸款、指定年利率、等額本息。
 */
export const estimateMaxTotalWanFromMonthly = (
  monthlyPay: number,
  annualRatePct = 2.1,
  years = 30,
  ltv = 0.8
): number | null => {
  if (!Number.isFinite(monthlyPay) || monthlyPay <= 0) return null;
  if (!Number.isFinite(ltv) || ltv <= 0) return null;
  const months = years * 12;
  const r = annualRatePct / 100 / 12;
  let principal: number;
  if (r <= 0) {
    principal = monthlyPay * months;
  } else {
    const factor = Math.pow(1 + r, months);
    principal = (monthlyPay * (factor - 1)) / (r * factor);
  }
  const total = principal / ltv;
  return Math.round(total / 10000); // 萬
};
