import { CITIES, TRANSACTION_TYPES, CITY_DISTRICTS } from "../constants";
import {
  DEFAULT_CITY,
  DEFAULT_DISTRICT,
  DEFAULT_TYPE,
  buildSelectionPath,
  parseSelectionPath,
} from "./seoRoutes";
import { getDefaultPeriod, type PeriodRange } from "../utils/real-estate-helpers";

export { buildSelectionPath };

export type Selection = {
  cityName: string;
  typeName: string;
  district: string;
};

export const DEFAULT_PROPERTY_TYPES = ["房地", "建物", "土地"] as const;

export type ManagementFilter = "any" | "yes" | "no";
export type ParkingFilter = "any" | "with" | "without";

export type QueryFilters = {
  search: string;
  propertyTypes: string[];
  period: PeriodRange;
  unitPrice: { min: string; max: string; unit: string };
  area: { min: string; max: string; unit: string };
  age: { min: string; max: string };
  /** 最少房數；空字串 = 不限 */
  roomsMin: string;
  hasManagement: ManagementFilter;
  parking: ParkingFilter;
};

export const DEFAULT_EXTRA_FILTERS = {
  roomsMin: "",
  hasManagement: "any" as ManagementFilter,
  parking: "any" as ParkingFilter,
};

const ALL_PROPERTY_TYPE_OPTIONS = ["房地", "房地(車)", "建物", "車位", "土地"] as const;

const sameStringArray = (a: string[], b: readonly string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

/**
 * Read city / type / district from the current URL, validating each value
 * against the known constants. Unknown or missing values fall back to defaults.
 */
export const parseSelectionFromUrl = (): Selection => {
  const fallback: Selection = {
    cityName: DEFAULT_CITY,
    typeName: DEFAULT_TYPE,
    district: DEFAULT_DISTRICT,
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  const pathSelection = parseSelectionPath(window.location.pathname);
  const params = new URLSearchParams(window.location.search);
  const selected = pathSelection ?? {
    cityName: params.get("city")?.trim() || DEFAULT_CITY,
    typeName: params.get("type")?.trim() || DEFAULT_TYPE,
    district: params.get("district")?.trim() || DEFAULT_DISTRICT,
  };
  const cityRaw = selected.cityName;
  const typeRaw = selected.typeName;
  const districtRaw = selected.district;

  const cityName = cityRaw && CITIES.some((c) => c.name === cityRaw) ? cityRaw : DEFAULT_CITY;
  const typeName =
    typeRaw && TRANSACTION_TYPES.some((t) => t.name === typeRaw) ? typeRaw : DEFAULT_TYPE;
  const district =
    districtRaw && (CITY_DISTRICTS[cityName] || []).some((d) => d.name === districtRaw)
      ? districtRaw
      : DEFAULT_DISTRICT;

  return { cityName, typeName, district };
};

const pickYear = (raw: string | null, fallback: string): string => {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 101 || n > 115) return fallback;
  return String(n);
};

const pickMonth = (raw: string | null, fallback: string): string => {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1 || n > 12) return fallback;
  return String(n);
};

/** 解析 query string 中的進階篩選；缺省時使用近 12 個月預設。 */
export const parseQueryFiltersFromUrl = (): QueryFilters => {
  const defaultPeriod = getDefaultPeriod();
  const fallback: QueryFilters = {
    search: "",
    propertyTypes: [...DEFAULT_PROPERTY_TYPES],
    period: defaultPeriod,
    unitPrice: { min: "", max: "", unit: "1" },
    area: { min: "", max: "", unit: "2" },
    age: { min: "", max: "" },
    ...DEFAULT_EXTRA_FILTERS,
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  const params = new URLSearchParams(window.location.search);

  const search = params.get("q")?.trim() || "";

  let propertyTypes: string[] = [...DEFAULT_PROPERTY_TYPES];
  const ptsRaw = params.get("pts")?.trim();
  if (ptsRaw) {
    const parsed = ptsRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => (ALL_PROPERTY_TYPE_OPTIONS as readonly string[]).includes(s));
    if (parsed.length > 0) propertyTypes = parsed;
  }

  const period: PeriodRange = {
    startY: pickYear(params.get("sy"), defaultPeriod.startY),
    startM: pickMonth(params.get("sm"), defaultPeriod.startM),
    endY: pickYear(params.get("ey"), defaultPeriod.endY),
    endM: pickMonth(params.get("em"), defaultPeriod.endM),
  };

  const unit = params.get("upu") === "2" ? "2" : "1";
  const areaUnit = params.get("au") === "1" ? "1" : "2";

  const mg = params.get("mg");
  const hasManagement: ManagementFilter =
    mg === "yes" || mg === "no" ? mg : "any";
  const pk = params.get("pk");
  const parking: ParkingFilter =
    pk === "with" || pk === "without" ? pk : "any";
  const roomsMinRaw = params.get("rm")?.trim() || "";
  const roomsMin =
    roomsMinRaw && !Number.isNaN(parseInt(roomsMinRaw, 10)) ? roomsMinRaw : "";

  return {
    search,
    propertyTypes,
    period,
    unitPrice: {
      min: params.get("upmin")?.trim() || "",
      max: params.get("upmax")?.trim() || "",
      unit,
    },
    area: {
      min: params.get("amin")?.trim() || "",
      max: params.get("amax")?.trim() || "",
      unit: areaUnit,
    },
    age: {
      min: params.get("agemin")?.trim() || "",
      max: params.get("agemax")?.trim() || "",
    },
    roomsMin,
    hasManagement,
    parking,
  };
};

/** 將篩選條件編成 query string（僅寫入非預設值，保持 URL 精簡）。 */
export const buildFilterQueryString = (filters: QueryFilters): string => {
  const params = new URLSearchParams();
  const defaultPeriod = getDefaultPeriod();

  if (filters.search.trim()) {
    params.set("q", filters.search.trim());
  }

  if (!sameStringArray(filters.propertyTypes, DEFAULT_PROPERTY_TYPES)) {
    params.set("pts", filters.propertyTypes.join(","));
  }

  const p = filters.period;
  if (
    p.startY !== defaultPeriod.startY ||
    p.startM !== defaultPeriod.startM ||
    p.endY !== defaultPeriod.endY ||
    p.endM !== defaultPeriod.endM
  ) {
    params.set("sy", p.startY);
    params.set("sm", p.startM);
    params.set("ey", p.endY);
    params.set("em", p.endM);
  }

  if (filters.unitPrice.min) params.set("upmin", filters.unitPrice.min);
  if (filters.unitPrice.max) params.set("upmax", filters.unitPrice.max);
  if (filters.unitPrice.unit !== "1") params.set("upu", filters.unitPrice.unit);

  if (filters.area.min) params.set("amin", filters.area.min);
  if (filters.area.max) params.set("amax", filters.area.max);
  if (filters.area.unit !== "2") params.set("au", filters.area.unit);

  if (filters.age.min) params.set("agemin", filters.age.min);
  if (filters.age.max) params.set("agemax", filters.age.max);

  if (filters.roomsMin) params.set("rm", filters.roomsMin);
  if (filters.hasManagement !== "any") params.set("mg", filters.hasManagement);
  if (filters.parking !== "any") params.set("pk", filters.parking);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

/** 組合可分享的 path + query（不含 hash）。 */
export const buildShareableUrl = (
  selection: Selection,
  filters: QueryFilters,
  origin?: string
): string => {
  const path = buildSelectionPath(selection);
  const query = buildFilterQueryString(filters);
  if (origin) return `${origin}${path}${query}`;
  return `${path}${query}`;
};
