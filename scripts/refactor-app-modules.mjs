/**
 * Strip extracted blocks from App.tsx and wire hooks / components.
 * Run from repo root: node scripts/refactor-app-modules.mjs
 */
import fs from "fs";
import path from "path";

const appPath = path.resolve("src/App.tsx");
let src = fs.readFileSync(appPath, "utf8").replace(/\r\n/g, "\n");
const originalLen = src.length;

function mustReplace(label, pattern, replacement) {
  const next = typeof pattern === "string" ? src.replace(pattern, replacement) : src.replace(pattern, replacement);
  if (next === src) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }
  src = next;
  console.log(`OK: ${label} (Δ ${next.length - (next === src ? 0 : originalLen)})`.replace(/Δ.*/, `chars now ${src.length}`));
}

// 1) Add imports once
if (!src.includes('from "./hooks/useFilteredTransactions"')) {
  mustReplace(
    "add module imports",
    '} from "./lib/userDataPortability";\n',
    `} from "./lib/userDataPortability";
import { useFilteredTransactions } from "./hooks/useFilteredTransactions";
import { useMarketAnalytics } from "./hooks/useMarketAnalytics";
import { DetailRow } from "./components/DetailRow";
import { SeoAboutSection } from "./components/explorer/SeoAboutSection";
import { SettingsDialog } from "./components/explorer/SettingsDialog";
import { FeedbackModal } from "./components/explorer/FeedbackModal";
import type { SavedSearch, SortConfig, UserLocation, ViewMode } from "./types/app";
import {
  FEATURED_CITY_NAMES,
  modalContainerVariants,
  modalItemVariants,
} from "./constants/app-ui";
`
  );
} else {
  console.log("skip: imports already present");
}

// 2) Remove local SavedSearch + constants + variants
if (src.includes("interface SavedSearch")) {
  mustReplace(
    "remove SavedSearch + constants + variants",
    /interface SavedSearch \{[\s\S]*?timestamp: number;\n\}\n\nconst FEATURED_CITY_NAMES[\s\S]*?const modalItemVariants = \{[\s\S]*?\n\};\n\nexport default function App/,
    "export default function App"
  );
} else {
  console.log("skip: SavedSearch block already removed");
}

// 3) filteredData hook
if (src.includes("const filteredData = useMemo(() => {")) {
  mustReplace(
    "filteredData -> hook",
    /  const filteredData = useMemo\(\(\) => \{[\s\S]*?userLocation\.longitude,\n  \]\);\n\n  const districtAveragePrices = useMemo\(\(\) => \{[\s\S]*?return averages;\n  \}, \[data\]\);\n\n  const historyCounts = useMemo\(\(\) => \{[\s\S]*?return \{ buildCaseMap, addressMap \};\n  \}, \[data\]\);\n/,
    `  const filteredData = useFilteredTransactions({
    data,
    search,
    district,
    propertyTypes,
    period,
    unitPrice,
    area,
    age,
    roomsMin,
    hasManagement,
    parkingFilter,
    focusBuildCase,
    excludeSpecial,
    totalPriceMaxWan,
    nearbyKm,
    nearbyAnchor,
    userLocation,
    sortConfig,
  });

  const {
    districtAveragePrices,
    historyCounts,
    priceDistribution,
    priceTrend,
    aggregatedPreSaleData,
    marketSnapshot: marketSnapshotFromHook,
  } = useMarketAnalytics(data, filteredData, typeName);

`
  );
} else {
  console.log("skip: filteredData already hooked");
}

// 4) Remove chart useMemos if still present
if (src.includes("const priceDistribution = useMemo")) {
  mustReplace(
    "remove priceDistribution/trend/aggregated",
    /  const priceDistribution = useMemo\(\(\) => \{[\s\S]*?\.sort\(\(a, b\) => a\.sortValue - b\.sortValue\);\n  \}, \[filteredData\]\);\n\n  const priceTrend = useMemo\(\(\) => \{[\s\S]*?\.sort\(\(a, b\) => a\.sortKey - b\.sortKey\);\n  \}, \[filteredData\]\);\n\n  const aggregatedPreSaleData = useMemo\(\(\) => \{[\s\S]*?\.sort\(\(a, b\) => b\.count - a\.count\);\n\n  \}, \[filteredData, typeName\]\);\n\n/,
    "\n"
  );
}

// 5) marketSnapshot
if (src.includes("const marketSnapshot = useMemo(() => computeMarketSnapshot")) {
  mustReplace(
    "marketSnapshot from hook",
    /  const marketSnapshot = useMemo\(\(\) => computeMarketSnapshot\(filteredData\), \[filteredData\]\);/,
    "  const marketSnapshot = marketSnapshotFromHook;"
  );
} else if (src.includes("marketSnapshotFromHook") && !src.includes("const marketSnapshot = marketSnapshotFromHook")) {
  // insert after analytics if needed - search for pinCurrentMarket and ensure marketSnapshot exists
  if (!src.includes("const marketSnapshot =")) {
    mustReplace(
      "insert marketSnapshot alias",
      "  const pinCurrentMarket = React.useCallback",
      "  const marketSnapshot = marketSnapshotFromHook;\n\n  const pinCurrentMarket = React.useCallback"
    );
  }
}

// 6) SEO block
if (src.includes("About & FAQ")) {
  mustReplace(
    "SeoAboutSection",
    /\n\s*\{\/\* About & FAQ[\s\S]*?<div className="mt-10">\s*<SiteFooterNav \/>\s*<\/div>\s*<\/div>\n\n      <\/motion\.div>/,
    `\n\n        <SeoAboutSection />\n\n      </motion.div>`
  );
}

// 7) Settings dialog block → component
if (src.includes("Settings Dialog (Font size")) {
  mustReplace(
    "SettingsDialog component",
    /\n\s*\{\/\* Settings Dialog \(Font size & customizable texts\) \*\/\}[\s\S]*?<\/Dialog>\n\n\s*\{\/\* Location Sharing Dialog \*\/\}/,
    `
      <SettingsDialog
        open={isSettingsModalOpen}
        onOpenChange={setIsSettingsModalOpen}
        appTexts={appTexts}
        updateAppTexts={updateAppTexts}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onExport={exportLocalUserData}
        onImportClick={() => importFileRef.current?.click()}
        importFileRef={importFileRef}
        onImportFile={(f) => void importLocalUserData(f)}
        importStatus={importStatus}
      />

      {/* Location Sharing Dialog */}`
  );
}

// 8) Feedback modal → component
if (src.includes("Feedback Form Modal") || src.includes("系統改進與意見回饋")) {
  // Prefer comment anchor
  if (src.includes("{/* Feedback Form Modal */}")) {
    mustReplace(
      "FeedbackModal component",
      /\n\s*\{\/\* Feedback Form Modal \*\/\}[\s\S]*?<\/AnimatePresence>\n\n\s*<CompareBar/,
      `
      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        category={feedbackCategory}
        setCategory={setFeedbackCategory}
        content={feedbackContent}
        setContent={setFeedbackContent}
        contact={feedbackContact}
        setContact={setFeedbackContact}
        status={feedbackStatus}
        setStatus={setFeedbackStatus}
        errorMsg={feedbackErrorMsg}
        userLocation={userLocation}
        addAuditLog={addAuditLog}
      />

      <CompareBar`
    );
  }
}

// 9) Remove trailing DetailRow function
if (src.includes("function DetailRow(")) {
  mustReplace(
    "remove DetailRow fn",
    /\nfunction DetailRow\([\s\S]*$/,
    "\n"
  );
}

// 10) Type annotations for viewMode if still inline - optional
src = src.replace(
  /useState<"list" \| "table" \| "map" \| "aggregated">\("list"\)/,
  'useState<ViewMode>("list")'
);

fs.writeFileSync(appPath, src);
console.log(`Done. ${originalLen} -> ${src.length} chars (${((1 - src.length / originalLen) * 100).toFixed(1)}% smaller)`);
