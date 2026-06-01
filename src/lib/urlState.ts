import { CITIES, TRANSACTION_TYPES, CITY_DISTRICTS } from "../constants";

export const DEFAULT_CITY = "臺北市";
export const DEFAULT_TYPE = "買賣";
export const DEFAULT_DISTRICT = "全部";

export type Selection = {
  cityName: string;
  typeName: string;
  district: string;
};

/**
 * Build the canonical query string for a selection, e.g. "?city=高雄市&type=租賃".
 * Defaults are omitted so the homepage stays at a clean "/".
 * Used by both the URL sync effect and the SEO canonical/og:url so they always match.
 */
export const buildSelectionSearch = ({ cityName, typeName, district }: Partial<Selection>) => {
  const params = new URLSearchParams();

  if (cityName && cityName !== DEFAULT_CITY) params.set("city", cityName);
  if (typeName && typeName !== DEFAULT_TYPE) params.set("type", typeName);
  if (district && district !== DEFAULT_DISTRICT) params.set("district", district);

  const query = params.toString();
  return query ? `?${query}` : "";
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

  const params = new URLSearchParams(window.location.search);
  const cityRaw = params.get("city")?.trim();
  const typeRaw = params.get("type")?.trim();
  const districtRaw = params.get("district")?.trim();

  const cityName = cityRaw && CITIES.some((c) => c.name === cityRaw) ? cityRaw : DEFAULT_CITY;
  const typeName =
    typeRaw && TRANSACTION_TYPES.some((t) => t.name === typeRaw) ? typeRaw : DEFAULT_TYPE;
  const district =
    districtRaw && (CITY_DISTRICTS[cityName] || []).some((d) => d.name === districtRaw)
      ? districtRaw
      : DEFAULT_DISTRICT;

  return { cityName, typeName, district };
};
