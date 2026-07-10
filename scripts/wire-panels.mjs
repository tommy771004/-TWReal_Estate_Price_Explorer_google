import fs from "fs";

let src = fs.readFileSync("src/App.tsx", "utf8").replace(/\r\n/g, "\n");
const orig = src.length;

function must(label, re, rep) {
  const next = src.replace(re, rep);
  if (next === src) {
    console.error("FAIL", label);
    process.exit(1);
  }
  src = next;
  console.log("OK", label);
}

// imports
if (!src.includes("MarketHeader")) {
  must(
    "imports",
    'import { TrendDistrictDialog } from "./components/explorer/TrendDistrictDialog";\n',
    `import { TrendDistrictDialog } from "./components/explorer/TrendDistrictDialog";
import { MarketHeader } from "./components/explorer/MarketHeader";
import { SearchFilterPanel } from "./components/explorer/SearchFilterPanel";
import { ResultsWorkspace } from "./components/explorer/ResultsWorkspace";
import { ExplorerUiProvider } from "./components/explorer/ExplorerUiContext";
`
  );
}

// Build explorerUi bag just before return of App - find "return (" of main component
// Insert useMemo for explorerUi after marketKpis definition

if (!src.includes("const explorerUi =")) {
  // after marketKpis array
  if (src.includes("const marketKpis = [")) {
    // find end of marketKpis array closing ];
    must(
      "insert explorerUi after marketKpis",
      /(  const marketKpis = \[[\s\S]*?\n  \];\n)/,
      `$1
  const explorerUi = {
    cityName, setCityName, typeName, setTypeName, district, setDistrict,
    search, setSearch, propertyTypes, setPropertyTypes,
    period, setPeriod, unitPrice, setUnitPrice, area, setArea, age, setAge,
    roomsMin, setRoomsMin, hasManagement, setHasManagement,
    parkingFilter, setParkingFilter, excludeSpecial, setExcludeSpecial,
    totalPriceMaxWan, setTotalPriceMaxWan, activePresetId, setActivePresetId,
    nearbyKm, setNearbyKm, nearbyAnchor, setNearbyAnchor,
    focusBuildCase, setFocusBuildCase, userLocation,
    isSearchExpanded, setIsSearchExpanded, isAdvancedSearchOpen, setIsAdvancedSearchOpen,
    isLocationModalOpen, setIsLocationModalOpen, showLocationModal, setShowLocationModal,
    showSuggestions, setShowSuggestions, loading, robotStatus,
    appTexts, viewMode, setViewMode,
    data, filteredData, paginatedData, dataSource, dataCachedAt,
    error, fetchData, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    totalPages, sortConfig, setSortConfig, handleSort, scrollSort, sortScrollRef,
    resultsContainerRef,
    addressSuggestions, recentSearches, clearRecentSearches, trendingSearches,
    handleTrendingClick, savedSearches, applySavedSearch, deleteSavedSearch,
    isSavingSearch, setIsSavingSearch, newSearchName, setNewSearchName, saveCurrentSearch,
    applyQueryPreset, applyBudgetWan,
    marketSnapshot, marketKpis, pinCurrentMarket, pinnedKpis, setPinnedKpis,
    priceDistribution, priceTrend, aggregatedPreSaleData, showChartsMobile, setShowChartsMobile,
    resultDelta, setResultDelta, isGeocoding, geocodedCount, totalToGeocode,
    districtAveragePrices, historyCounts, globalFacilities,
    favorites, toggleFavorite, compareList, toggleCompare,
    setSelectedItem, setTrendDistrict, setNearbyFromItem,
    mapLayer, setMapLayer, showFacilities, setShowFacilities,
    shareStatus, copyShareLink, handleExportCsv, districts,
  };

`
    );
  } else {
    console.error("marketKpis not found");
    process.exit(1);
  }
}

// Replace market header block
must(
  "MarketHeader",
  /\n          <div className="max-w-\[1600px\] mx-auto w-full flex flex-col gap-3 px-1 pt-1 pb-2">[\s\S]*?熱門查詢城市[\s\S]*?<\/section>\n          <\/div>\n\n          \{\/\* 手機也看得到釘選比價/,
  `
          <MarketHeader
            cityName={cityName}
            district={district}
            typeName={typeName}
            filteredCount={filteredData.length}
            dataSource={dataSource}
            dataCachedAt={dataCachedAt}
            excludeSpecial={excludeSpecial}
            marketSnapshotCount={marketSnapshot.count}
            marketKpis={marketKpis}
            pinCurrentMarket={pinCurrentMarket}
            onSelectCity={(city) => {
              setCityName(city);
              setDistrict("全部");
              setIsSearchExpanded(true);
            }}
          />

          {/* 手機也看得到釘選比價`
);

// Replace filter section
must(
  "SearchFilterPanel",
  /\n          \{\/\* Quick Access Saved Searches \*\/\}[\s\S]*?\{\/\* Save Search Modal \*\/\}/,
  `
          <SearchFilterPanel />

          {/* Save Search Modal */}`
);

// Replace results workspace (Content through before SeoAbout)
must(
  "ResultsWorkspace",
  /\n        \{\/\* Content \*\/\}[\s\S]*?\n        <SeoAboutSection \/>/,
  `
        <ResultsWorkspace />

        <SeoAboutSection />`
);

// Wrap main motion content with provider - find return of App
// Wrap from after opening of main structure
// Easier: wrap explorerUi usage area only around the three components by wrapping from MarketHeader through Results

// Add Provider around the three sections
if (!src.includes("<ExplorerUiProvider")) {
  must(
    "ExplorerUiProvider open",
    "<MarketHeader\n",
    `<ExplorerUiProvider value={explorerUi}>
          <MarketHeader
`
  );
  must(
    "ExplorerUiProvider close",
    "<ResultsWorkspace />\n\n        <SeoAboutSection />",
    `<ResultsWorkspace />
          </ExplorerUiProvider>

        <SeoAboutSection />`
  );
}

fs.writeFileSync("src/App.tsx", src);
console.log(`Done ${orig} -> ${src.length}`);
