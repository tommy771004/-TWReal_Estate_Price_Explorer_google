import type { SeoContentPage } from "../content/seoPages";

const SITE_NAME = "實價登錄查詢";

const CONTENT_HUB_PATHS = new Set([
  "/prices/",
  "/guides/",
  "/buying-guides/",
  "/renting-guides/",
]);

const PARENT_PAGES: Record<string, { path: string; name: string }> = {
  "/guides/": { path: "/guides/", name: "實價登錄使用指南" },
  "/buying-guides/": { path: "/buying-guides/", name: "各縣市購屋指南" },
  "/renting-guides/": { path: "/renting-guides/", name: "租屋族指南" },
};

const isHubPage = (page: SeoContentPage) =>
  CONTENT_HUB_PATHS.has(page.path) || page.path.endsWith("/districts/");

const getParentPage = (page: SeoContentPage) =>
  Object.entries(PARENT_PAGES)
    .filter(([prefix]) => page.path.startsWith(prefix) && page.path !== prefix)
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1];

export const buildSeoContentTitle = (page: SeoContentPage) => `${page.title} | ${SITE_NAME}`;

export const buildSeoContentUrl = (siteOrigin: string, path: string) => `${siteOrigin}${path}`;

export const buildSeoContentStructuredData = (
  page: SeoContentPage,
  siteOrigin: string,
  dateModified: string,
) => {
  const canonicalUrl = buildSeoContentUrl(siteOrigin, page.path);
  const parentPage = getParentPage(page);
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: SITE_NAME,
      item: `${siteOrigin}/`,
    },
    ...(parentPage
      ? [
          {
            "@type": "ListItem",
            position: 2,
            name: parentPage.name,
            item: buildSeoContentUrl(siteOrigin, parentPage.path),
          },
        ]
      : []),
    {
      "@type": "ListItem",
      position: parentPage ? 3 : 2,
      name: page.title,
      item: canonicalUrl,
    },
  ];

  const relatedLinks = page.links?.map((link, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: link.label,
    url: buildSeoContentUrl(siteOrigin, link.href),
  }));

  const mainEntity = isHubPage(page)
    ? {
        "@type": "ItemList",
        name: page.title,
        itemListElement: relatedLinks ?? [],
      }
    : {
        "@type": "Article",
        headline: page.title,
        description: page.description,
        dateModified,
        inLanguage: "zh-Hant-TW",
        author: {
          "@id": `${siteOrigin}/#organization`,
        },
        publisher: {
          "@id": `${siteOrigin}/#organization`,
        },
      };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: page.title,
        description: page.description,
        inLanguage: "zh-Hant-TW",
        dateModified,
        isPartOf: { "@id": `${siteOrigin}/#website` },
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
        mainEntity,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ],
  };
};
