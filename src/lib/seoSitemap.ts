import { SEO_CONTENT_PAGES } from "../content/seoPages";
import { INDEXABLE_SELECTIONS, buildSelectionPath } from "./seoRoutes";

export type SitemapRecord = {
  loc: string;
  lastmod?: string;
};

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const buildSitemapRecords = (
  siteOrigin: string,
  fallbackLastModified: string,
): SitemapRecord[] => {
  const origin = siteOrigin.replace(/\/+$/, "");

  return [
    ...INDEXABLE_SELECTIONS.map((selection) => ({
      loc: `${origin}${buildSelectionPath(selection)}`,
      lastmod: fallbackLastModified,
    })),
    ...SEO_CONTENT_PAGES.map((page) => ({
      loc: `${origin}${page.path}`,
      lastmod: page.dateModified ?? fallbackLastModified,
    })),
  ];
};

export const renderSitemapXml = (records: SitemapRecord[]) => {
  const entries = records.map(({ loc, lastmod }) => {
    const date = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>${date}\n  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};
