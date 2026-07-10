import type { PeriodRange } from "../utils/real-estate-helpers";

export type ViewMode = "list" | "table" | "map" | "aggregated";

export type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

export type NearbyAnchor = {
  lat: number;
  lng: number;
  label: string;
};

export type UserLocation = {
  latitude: number | null;
  longitude: number | null;
  county?: string;
  district?: string;
  location_method?: string;
};

export interface SavedSearch {
  id: string;
  name: string;
  cityName: string;
  typeName: string | null;
  district: string;
  search: string;
  propertyTypes: string[];
  period: PeriodRange;
  unitPrice: { min: string; max: string; unit: string };
  area: { min: string; max: string; unit: string };
  age: { min: string; max: string };
  timestamp: number;
}
