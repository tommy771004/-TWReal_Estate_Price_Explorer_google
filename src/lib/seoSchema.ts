// Shared Schema.org node builders used by both runtime (lib/seo.ts) and
// build-time prerender (vite.config.ts). Keeping them here avoids drift between
// the JavaScript-rendered graph and the static prerendered graph; the static
// baseline in index.html mirrors the same shape for no-JS crawlers.

const SITE_NAME = "實價登錄查詢";
const LOGO_PATH = "/og-image.png";

// 內政部公開資料採政府資料開放授權條款；來源與下載入口為官方網站。
const MOI_HOMEPAGE_URL = "https://www.moi.gov.tw/";
const OFFICIAL_SOURCE_URL = "https://lvr.land.moi.gov.tw/";
const OFFICIAL_DOWNLOAD_URL = "https://plvr.land.moi.gov.tw/";
const OPEN_DATA_LICENSE_URL = "https://data.gov.tw/license";
const OPEN_DATA_CATALOG_URL = "https://data.gov.tw/";

// 實價登錄制度自 2012 年 8 月起實施；以開放式區間表示資料的時間涵蓋範圍。
const TEMPORAL_COVERAGE = "2012-08/..";

const DATASET_VARIABLES = [
  "成交總價",
  "每坪單價",
  "建物坪數",
  "屋齡",
  "樓層",
  "交易年月",
];

const DATASET_KEYWORDS = [
  "實價登錄",
  "房價查詢",
  "不動產成交行情",
  "預售屋",
  "租屋行情",
  "台灣房地產",
];

// Optional real social / profile URLs, injected by the maintainer via env so we
// never invent entity profiles that may not exist.
const parseSameAs = (raw?: string) =>
  (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^https?:\/\//.test(value));

export const buildOrganizationNode = (origin: string, sameAsRaw?: string) => {
  const sameAs = parseSameAs(sameAsRaw);

  return {
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: SITE_NAME,
    url: `${origin}/`,
    description: "整合內政部實價登錄開放資料的台灣房價查詢工具。",
    logo: {
      "@type": "ImageObject",
      url: `${origin}${LOGO_PATH}`,
      width: 1200,
      height: 630,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${origin}/contact/`,
      availableLanguage: ["zh-Hant"],
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
};

type DatasetInput = {
  origin: string;
  canonicalUrl: string;
  name: string;
  description: string;
  scopeLabel: string;
  dateModified: string;
};

export const buildDatasetNode = ({
  origin,
  canonicalUrl,
  name,
  description,
  scopeLabel,
  dateModified,
}: DatasetInput) => ({
  "@type": "Dataset",
  "@id": `${canonicalUrl}#dataset`,
  name,
  description,
  url: canonicalUrl,
  identifier: `${canonicalUrl}#dataset`,
  // 指向可驗證資料集身分的官方查詢網站。
  sameAs: OFFICIAL_SOURCE_URL,
  keywords: DATASET_KEYWORDS,
  inLanguage: "zh-Hant-TW",
  isAccessibleForFree: true,
  license: OPEN_DATA_LICENSE_URL,
  dateModified,
  temporalCoverage: TEMPORAL_COVERAGE,
  variableMeasured: DATASET_VARIABLES,
  measurementTechnique: "不動產買賣、預售屋與租賃成交案件之實價申報登錄",
  spatialCoverage: {
    "@type": "Place",
    name: scopeLabel,
  },
  // Google Dataset 富摘要的 creator 僅接受 Person/Organization；
  // GovernmentOrganization 子類型會被 Rich Results Test 標記。
  creator: {
    "@type": "Organization",
    name: "內政部",
    url: MOI_HOMEPAGE_URL,
  },
  isBasedOn: OFFICIAL_DOWNLOAD_URL,
  includedInDataCatalog: {
    "@type": "DataCatalog",
    name: "政府資料開放平臺",
    url: OPEN_DATA_CATALOG_URL,
  },
  distribution: {
    "@type": "DataDownload",
    encodingFormat: "text/html",
    contentUrl: OFFICIAL_DOWNLOAD_URL,
  },
  publisher: { "@id": `${origin}/#organization` },
  // Dataset 的 isPartOf 依 Google 規範必須指向另一個 Dataset，
  // 不能指向 WebSite，故網站關聯僅以 publisher 表達。
});
