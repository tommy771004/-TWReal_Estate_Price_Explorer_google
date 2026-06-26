import { buildSelectionPath, buildSeoCopy } from "./seoRoutes";
import {
  buildSeoContentStructuredData,
  buildSeoContentTitle,
} from "./seoContent";
import type { SeoContentPage } from "../content/seoPages";

const SITE_NAME = "實價登錄查詢";
const SITE_ALT_NAME = "Taiwan Real Estate Price Explorer";
const DEFAULT_DESCRIPTION =
  "免費查詢台灣各縣市買賣、預售屋與租賃的實價登錄成交紀錄，支援地圖檢視、單價篩選、坪數比較與歷史交易資料。";
const CONTENT_LAST_MODIFIED = __SEO_LAST_MODIFIED__;

type SeoInput = {
  cityName: string;
  district: string;
  typeName: string;
};

const getTrimmedEnv = (value?: string) => value?.trim() ?? "";

const getSiteOrigin = () => {
  const envUrl = getTrimmedEnv(import.meta.env.VITE_SITE_URL);

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "";
};

const buildAbsoluteUrl = (pathname: string) => {
  const origin = getSiteOrigin();

  if (!origin) {
    return pathname;
  }

  return new URL(pathname, `${origin}/`).toString();
};

const upsertMetaTag = (selector: string, attributes: Record<string, string>) => {
  if (typeof document === "undefined") {
    return;
  }

  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

const upsertLinkTag = (rel: string, href: string) => {
  if (typeof document === "undefined") {
    return;
  }

  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
};

const upsertStructuredData = (id: string, payload: Record<string, unknown>) => {
  if (typeof document === "undefined") {
    return;
  }

  let element = document.head.querySelector<HTMLScriptElement>(`script[data-seo-id="${id}"]`);

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.seoId = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(payload);
};

export const syncSeoMetadata = (input: SeoInput) => {
  if (typeof document === "undefined") {
    return;
  }

  const { title, description } = buildSeoCopy(input);
  const canonicalUrl = buildAbsoluteUrl(buildSelectionPath(input));
  const imageUrl = buildAbsoluteUrl("/og-image.png");
  const origin = getSiteOrigin();

  document.title = title;
  document.documentElement.lang = "zh-Hant-TW";

  upsertMetaTag('meta[name="description"]', { name: "description", content: description });
  upsertMetaTag('meta[name="robots"]', {
    name: "robots",
    content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
  });
  upsertMetaTag('meta[property="og:type"]', { property: "og:type", content: "website" });
  upsertMetaTag('meta[property="og:locale"]', { property: "og:locale", content: "zh_TW" });
  upsertMetaTag('meta[property="og:site_name"]', {
    property: "og:site_name",
    content: SITE_NAME,
  });
  upsertMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMetaTag('meta[property="og:description"]', {
    property: "og:description",
    content: description,
  });
  upsertMetaTag('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
  upsertMetaTag('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  upsertMetaTag('meta[property="og:image:type"]', {
    property: "og:image:type",
    content: "image/png",
  });
  upsertMetaTag('meta[property="og:image:width"]', {
    property: "og:image:width",
    content: "1200",
  });
  upsertMetaTag('meta[property="og:image:height"]', {
    property: "og:image:height",
    content: "630",
  });
  upsertMetaTag('meta[property="og:image:alt"]', {
    property: "og:image:alt",
    content: "實價登錄查詢的台灣房價地圖與成交資料預覽圖",
  });
  upsertMetaTag('meta[name="twitter:card"]', {
    name: "twitter:card",
    content: "summary_large_image",
  });
  upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMetaTag('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: description,
  });
  upsertMetaTag('meta[name="twitter:image"]', {
    name: "twitter:image",
    content: imageUrl,
  });
  upsertLinkTag("canonical", canonicalUrl);

  if (!origin) {
    return;
  }

  upsertStructuredData("website", {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "zh-Hant-TW",
      },
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: SITE_NAME,
        url: `${origin}/`,
        description: "整合內政部實價登錄開放資料的台灣房價查詢工具。",
      },
      {
        "@type": "WebApplication",
        "@id": `${origin}/#webapp`,
        name: SITE_NAME,
        url: canonicalUrl,
        applicationCategory: "BusinessApplication",
        browserRequirements: "Requires JavaScript",
        operatingSystem: "All",
        inLanguage: "zh-Hant-TW",
        isAccessibleForFree: true,
        dateModified: CONTENT_LAST_MODIFIED,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "TWD",
        },
        featureList: [
          "查詢台灣各縣市實價登錄成交紀錄",
          "支援買賣、預售屋與租賃資料",
          "依總價、單價、坪數與屋齡篩選",
          "提供地圖檢視與聚合統計",
        ],
        provider: {
          "@id": `${origin}/#organization`,
        },
      },
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: "zh-Hant-TW",
        dateModified: CONTENT_LAST_MODIFIED,
        isPartOf: {
          "@id": `${origin}/#website`,
        },
        about: {
          "@type": "Thing",
          name: "台灣房地產成交紀錄",
        },
      },
    ],
  });
};

export const syncSeoContentMetadata = (page: SeoContentPage) => {
  if (typeof document === "undefined") {
    return;
  }

  const title = buildSeoContentTitle(page);
  const canonicalUrl = buildAbsoluteUrl(page.path);
  const imageUrl = buildAbsoluteUrl("/og-image.png");
  const origin = getSiteOrigin();

  document.title = title;
  document.documentElement.lang = "zh-Hant-TW";

  upsertMetaTag('meta[name="description"]', { name: "description", content: page.description });
  upsertMetaTag('meta[name="robots"]', {
    name: "robots",
    content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1",
  });
  upsertMetaTag('meta[property="og:type"]', { property: "og:type", content: "article" });
  upsertMetaTag('meta[property="og:locale"]', { property: "og:locale", content: "zh_TW" });
  upsertMetaTag('meta[property="og:site_name"]', {
    property: "og:site_name",
    content: SITE_NAME,
  });
  upsertMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMetaTag('meta[property="og:description"]', {
    property: "og:description",
    content: page.description,
  });
  upsertMetaTag('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
  upsertMetaTag('meta[property="og:image"]', { property: "og:image", content: imageUrl });
  upsertMetaTag('meta[property="og:image:alt"]', {
    property: "og:image:alt",
    content: "實價登錄查詢的台灣房價地圖與成交資料預覽圖",
  });
  upsertMetaTag('meta[name="twitter:card"]', {
    name: "twitter:card",
    content: "summary_large_image",
  });
  upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMetaTag('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: page.description,
  });
  upsertMetaTag('meta[name="twitter:image"]', {
    name: "twitter:image",
    content: imageUrl,
  });
  upsertLinkTag("canonical", canonicalUrl);

  if (!origin) {
    return;
  }

  upsertStructuredData(
    "webpage",
    buildSeoContentStructuredData(page, origin, CONTENT_LAST_MODIFIED),
  );
};
