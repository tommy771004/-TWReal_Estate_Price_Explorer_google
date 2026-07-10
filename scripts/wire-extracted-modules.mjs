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
if (!src.includes("useFetchRealEstate")) {
  must(
    "import fetch + dialogs",
    'import { FeedbackModal } from "./components/explorer/FeedbackModal";\n',
    `import { FeedbackModal } from "./components/explorer/FeedbackModal";
import { TransactionDetailDialog } from "./components/explorer/TransactionDetailDialog";
import { TrendDistrictDialog } from "./components/explorer/TrendDistrictDialog";
import { useFetchRealEstate } from "./hooks/useFetchRealEstate";
`
  );
}

// Remove Papa import if only used by fetch
// Keep for now if still referenced

// Replace fetchData block with hook - find from "const fetchData = React.useCallback" to before handleTrendingClick
if (src.includes("const fetchData = React.useCallback(async (")) {
  must(
    "fetchData -> useFetchRealEstate",
    /  const fetchData = React\.useCallback\(async \([\s\S]*?  \}, \[cityName, typeName, district, propertyTypes, period, unitPrice, area, age, search, fetchTrendingSearches\]\);\n\n\n  const handleTrendingClick/,
    `  const { fetchData } = useFetchRealEstate({
    cityName,
    typeName,
    district,
    search,
    propertyTypes,
    period,
    unitPrice,
    area,
    age,
    setCityName,
    setDistrict,
    setSearch,
    setData,
    setLoading,
    setError,
    setDataSource,
    setDataCachedAt,
    setRobotStatus,
    setIsSearchExpanded,
    addRecentSearch,
    addAuditLog,
    fetchTrendingSearches,
  });

  const handleTrendingClick`
  );
}

// Replace Trend + Detail dialogs
if (src.includes("{/* District Volume Trend Dialog */}")) {
  must(
    "TrendDistrictDialog",
    /\n\s*\{\/\* District Volume Trend Dialog \*\/\}[\s\S]*?\n\s*\{\/\* Detail Dialog \*\/\}[\s\S]*?\n\s*<SettingsDialog/,
    `
      <TrendDistrictDialog
        trendDistrict={trendDistrict}
        onClose={() => setTrendDistrict(null)}
        data={data}
      />

      <TransactionDetailDialog
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        cityName={cityName}
        typeName={typeName}
        buildingImages={buildingImages}
        isBuildingImagesLoading={isBuildingImagesLoading}
        imageSliderRef={imageSliderRef}
        detailShowTopMask={detailShowTopMask}
        detailShowBottomMask={detailShowBottomMask}
        onDetailShowTopMask={setDetailShowTopMask}
        onDetailShowBottomMask={setDetailShowBottomMask}
        communityItems={communityItems}
        communityChartData={communityChartData}
        mortgageLtv={mortgageLtv}
        mortgageYears={mortgageYears}
        mortgageRate={mortgageRate}
        onMortgageLtvChange={setMortgageLtv}
        onMortgageYearsChange={setMortgageYears}
        onMortgageRateChange={setMortgageRate}
        compareList={compareList}
        toggleCompare={toggleCompare}
        setNearbyFromItem={setNearbyFromItem}
        focusBuildCase={focusBuildCase}
        onFocusBuildCase={setFocusBuildCase}
        onSearch={setSearch}
      />

      <SettingsDialog`
  );
}

// Remove unused isFetchingRef / abortController if only used by old fetch
// Leave if still declared - might cause unused var errors

// Remove Papa import if unused
if (!src.includes("Papa.")) {
  src = src.replace(/import Papa from "papaparse";\n/, "");
  console.log("removed Papa import");
}

// Remove getLatestThreeMonthsForDistrict if only used in trend dialog
// Leave tsc to tell us

fs.writeFileSync("src/App.tsx", src);
console.log(`Done ${orig} -> ${src.length}`);
