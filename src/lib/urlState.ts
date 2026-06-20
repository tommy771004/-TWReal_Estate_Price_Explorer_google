import { CITIES, TRANSACTION_TYPES, CITY_DISTRICTS } from "../constants";
import {
  DEFAULT_CITY,
  DEFAULT_DISTRICT,
  DEFAULT_TYPE,
  buildSelectionPath,
  parseSelectionPath,
} from "./seoRoutes";

export { buildSelectionPath };

export type Selection = {
  cityName: string;
  typeName: string;
  district: string;
};

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
