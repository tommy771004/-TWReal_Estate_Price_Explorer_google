// Shared Schema.org node builders used by both runtime (lib/seo.ts) and
// build-time prerender (vite.config.ts). Keeping them here avoids drift between
// the JavaScript-rendered graph and the static prerendered graph; the static
// baseline in index.html mirrors the same shape for no-JS crawlers.

const SITE_NAME = "實價登錄查詢";
const LOGO_PATH = "/og-image.png";

// 內政部公開資料採政府資料開放授權條款；來源與下載入口為官方網站。
const OFFICIAL_SOURCE_URL = "https://lvr.land.moi.gov.tw/";
const OFFICIAL_DOWNLOAD_URL = "https://plvr.land.moi.gov.tw/";
const OPEN_DATA_LICENSE_URL = "https://data.gov.tw/license";

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
  inLanguage: "zh-Hant-TW",
  isAccessibleForFree: true,
  license: OPEN_DATA_LICENSE_URL,
  dateModified,
  temporalCoverage: TEMPORAL_COVERAGE,
  variableMeasured: DATASET_VARIABLES,
  spatialCoverage: {
    "@type": "Place",
    name: scopeLabel,
  },
  creator: {
    "@type": "GovernmentOrganization",
    name: "內政部",
    url: OFFICIAL_SOURCE_URL,
  },
  isBasedOn: OFFICIAL_DOWNLOAD_URL,
  distribution: {
    "@type": "DataDownload",
    encodingFormat: "text/html",
    contentUrl: OFFICIAL_DOWNLOAD_URL,
  },
  publisher: { "@id": `${origin}/#organization` },
  isPartOf: { "@id": `${origin}/#website` },
});
