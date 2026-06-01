const SITE_NAME = "實價登錄查詢";
const SITE_ALT_NAME = "Taiwan Real Estate Price Explorer";
const DEFAULT_DESCRIPTION =
  "免費查詢台灣各縣市買賣、預售屋與租賃的實價登錄成交紀錄，支援地圖檢視、單價篩選、坪數比較與歷史交易資料。";
const DEFAULT_KEYWORDS = [
  "實價登錄",
  "實價登錄查詢",
  "台灣房價",
  "房價查詢",
  "成交價查詢",
  "預售屋實價登錄",
  "租屋實價登錄",
];

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

const buildSeoCopy = ({ cityName, district, typeName }: SeoInput) => {
  const scopeLabel = district !== "全部" ? `${cityName}${district}` : cityName;
  const title = `${scopeLabel}${typeName}實價登錄查詢 | 台灣房價地圖與成交紀錄`;
  const description =
    district !== "全部"
      ? `查詢${scopeLabel}${typeName}實價登錄成交紀錄，快速查看成交總價、單價、坪數、屋齡與地圖位置，資料串接內政部開放資料。`
      : `免費查詢${cityName}${typeName}實價登錄成交紀錄，快速查看成交總價、單價、坪數、屋齡與地圖位置，資料串接內政部開放資料。`;

  const keywords = Array.from(
    new Set([
      ...DEFAULT_KEYWORDS,
      `${cityName}實價登錄`,
      `${cityName}房價`,
      `${typeName}實價登錄`,
      district !== "全部" ? `${cityName}${district}實價登錄` : "",
      district !== "全部" ? `${cityName}${district}房價` : "",
    ].filter(Boolean))
  ).join(", ");

  return { title, description, keywords };
};

export const syncSeoMetadata = (input: SeoInput) => {
  if (typeof document === "undefined") {
    return;
  }

  const { title, description, keywords } = buildSeoCopy(input);
  const canonicalUrl = buildAbsoluteUrl("/");
  const imageUrl = buildAbsoluteUrl("/og-image.svg");
  const origin = getSiteOrigin();
  const verificationToken = getTrimmedEnv(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION);

  document.title = title;
  document.documentElement.lang = "zh-Hant-TW";

  upsertMetaTag('meta[name="description"]', { name: "description", content: description });
  upsertMetaTag('meta[name="keywords"]', { name: "keywords", content: keywords });
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

  if (verificationToken) {
    upsertMetaTag('meta[name="google-site-verification"]', {
      name: "google-site-verification",
      content: verificationToken,
    });
  }

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
