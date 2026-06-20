import { CITIES, TRANSACTION_TYPES } from "../constants";

export const DEFAULT_CITY = "臺北市";
export const DEFAULT_TYPE = "買賣";
export const DEFAULT_DISTRICT = "全部";

export type SeoSelection = {
  cityName: string;
  typeName: string;
  district?: string;
};

export const INDEXABLE_SELECTIONS: SeoSelection[] = CITIES.flatMap(({ name: cityName }) =>
  TRANSACTION_TYPES.map(({ name: typeName }) => ({ cityName, typeName })),
);

export const buildSelectionPath = ({ cityName, typeName, district }: SeoSelection) => {
  if (district && district !== DEFAULT_DISTRICT) {
    return `/districts/${encodeURIComponent(cityName)}/${encodeURIComponent(district)}/${encodeURIComponent(typeName)}/`;
  }

  if (cityName === DEFAULT_CITY && typeName === DEFAULT_TYPE) {
    return "/";
  }

  return `/prices/${encodeURIComponent(cityName)}/${encodeURIComponent(typeName)}/`;
};

export const parseSelectionPath = (pathname: string): SeoSelection | null => {
  const segments = pathname.split("/").filter(Boolean).map(decodeURIComponent);

  if (segments.length === 0) {
    return { cityName: DEFAULT_CITY, typeName: DEFAULT_TYPE, district: DEFAULT_DISTRICT };
  }

  if (segments[0] === "prices" && segments.length === 3) {
    return { cityName: segments[1], typeName: segments[2], district: DEFAULT_DISTRICT };
  }

  if (segments[0] === "districts" && segments.length === 4) {
    return { cityName: segments[1], district: segments[2], typeName: segments[3] };
  }

  return null;
};

export const buildSeoCopy = ({ cityName, district = DEFAULT_DISTRICT, typeName }: SeoSelection) => {
  const scopeLabel = district !== DEFAULT_DISTRICT ? `${cityName}${district}` : cityName;
  return {
    scopeLabel,
    title: `${scopeLabel}${typeName}實價登錄查詢 | 台灣房價地圖與成交紀錄`,
    description:
      district !== DEFAULT_DISTRICT
        ? `查詢${scopeLabel}${typeName}實價登錄成交紀錄，快速查看成交總價、單價、坪數、屋齡與地圖位置，資料串接內政部開放資料。`
        : `免費查詢${cityName}${typeName}實價登錄成交紀錄，快速查看成交總價、單價、坪數、屋齡與地圖位置，資料串接內政部開放資料。`,
  };
};
