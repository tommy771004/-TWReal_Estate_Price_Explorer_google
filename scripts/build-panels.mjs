/**
 * Build SearchFilterPanel + ResultsWorkspace using ExplorerUiContext
 * with a curated list of App state keys (no junk identifiers).
 */
import fs from "fs";

const filterRaw = fs.readFileSync("tmp-filter-raw.txt", "utf8").replace(/\r\n/g, "\n");
const resultsRaw = fs.readFileSync("tmp-results-raw.txt", "utf8").replace(/\r\n/g, "\n");

/** Keys provided by App via ExplorerUiProvider */
const APP_KEYS = [
  // selection / filters
  "cityName", "setCityName", "typeName", "setTypeName", "district", "setDistrict",
  "search", "setSearch", "propertyTypes", "setPropertyTypes",
  "period", "setPeriod", "unitPrice", "setUnitPrice", "area", "setArea", "age", "setAge",
  "roomsMin", "setRoomsMin", "hasManagement", "setHasManagement",
  "parkingFilter", "setParkingFilter", "excludeSpecial", "setExcludeSpecial",
  "totalPriceMaxWan", "setTotalPriceMaxWan", "activePresetId", "setActivePresetId",
  "nearbyKm", "setNearbyKm", "nearbyAnchor", "setNearbyAnchor",
  "focusBuildCase", "setFocusBuildCase", "userLocation",
  // ui chrome
  "isSearchExpanded", "setIsSearchExpanded", "isAdvancedSearchOpen", "setIsAdvancedSearchOpen",
  "isLocationModalOpen", "setIsLocationModalOpen", "showLocationModal", "setShowLocationModal",
  "showSuggestions", "setShowSuggestions", "loading", "robotStatus",
  "appTexts", "viewMode", "setViewMode",
  // data / derived
  "data", "filteredData", "paginatedData", "dataSource", "dataCachedAt",
  "error", "fetchData", "currentPage", "setCurrentPage", "itemsPerPage", "setItemsPerPage",
  "totalPages", "sortConfig", "setSortConfig", "handleSort", "scrollSort", "sortScrollRef",
  "resultsContainerRef",
  // search extras
  "addressSuggestions", "recentSearches", "clearRecentSearches", "trendingSearches",
  "handleTrendingClick", "savedSearches", "applySavedSearch", "deleteSavedSearch",
  "isSavingSearch", "setIsSavingSearch", "newSearchName", "setNewSearchName", "saveCurrentSearch",
  "applyQueryPreset", "applyBudgetWan",
  // market / results
  "marketSnapshot", "marketKpis", "pinCurrentMarket", "pinnedKpis", "setPinnedKpis",
  "priceDistribution", "priceTrend", "aggregatedPreSaleData", "showChartsMobile", "setShowChartsMobile",
  "resultDelta", "setResultDelta", "isGeocoding", "geocodedCount", "totalToGeocode",
  "districtAveragePrices", "historyCounts", "globalFacilities",
  "favorites", "toggleFavorite", "compareList", "toggleCompare",
  "setSelectedItem", "setTrendDistrict", "setNearbyFromItem",
  "mapLayer", "setMapLayer", "showFacilities", "setShowFacilities",
  "shareStatus", "copyShareLink", "handleExportCsv", "districts",
];

const HEADER = `import React, { Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MapPin, Filter, ArrowUpDown, X, ChevronRight, ChevronLeft, Bookmark, Trash2,
  Clock, List, Table2, BarChart3, Map as MapIcon, Download, Share2, CheckCircle2,
  Compass, Crosshair, Pin, SlidersHorizontal, ArrowUp, ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { QueryAssistBar } from "../QueryAssistBar";
import { TransactionCard } from "../TransactionCard";
import { ResultDeltaBanner } from "../ResultDeltaBanner";
import { GeocodeProgress } from "../GeocodeProgress";
import { PinnedKpiCompare } from "../PinnedKpiCompare";
import { AffiliateMarquee } from "../AffiliateMarquee";
import { DEFAULT_PROPERTY_TYPES } from "../../lib/urlState";
import { TRANSACTION_TYPES } from "../../constants";
import {
  YEARS, MONTHS, getPeriodValue, getPeriodFromValue,
  getDefaultPeriod, formatPeriodLabel, isDefaultPeriod, formatPrice, formatDate,
} from "../../utils/real-estate-helpers";
import { useExplorerUi } from "./ExplorerUiContext";

const ResultsCharts = React.lazy(() => import("../ResultsCharts"));
const ResultsMap = React.lazy(() => import("../MapViews"));
`;

function buildPanel(name, raw) {
  const used = APP_KEYS.filter((k) => new RegExp(`\\\\b${k}\\\\b`).test(raw) || raw.includes(k));
  // always include full APP_KEYS to avoid missing - simpler
  const keys = APP_KEYS.join(",\n    ");
  return `${HEADER}
export function ${name}() {
  const {
    ${keys}
  } = useExplorerUi();

  return (
    <>
${raw
  .split("\n")
  .map((l) => "      " + l)
  .join("\n")}
    </>
  );
}
`;
}

fs.writeFileSync("src/components/explorer/SearchFilterPanel.tsx", buildPanel("SearchFilterPanel", filterRaw));
fs.writeFileSync("src/components/explorer/ResultsWorkspace.tsx", buildPanel("ResultsWorkspace", resultsRaw));
console.log("Rewrote SearchFilterPanel + ResultsWorkspace with curated keys");
console.log("keys", APP_KEYS.length);
