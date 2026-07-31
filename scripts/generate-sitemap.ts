import { writeFile } from "node:fs/promises";

import { buildSitemapRecords, renderSitemapXml } from "../src/lib/seoSitemap";

const SITE_ORIGIN = (
  process.env.VITE_SITE_URL || "https://tw-realestate-price.vercel.app"
).replace(/\/+$/, "");

const records = buildSitemapRecords(SITE_ORIGIN, "")
  .map(({ loc }) => ({ loc }));

await writeFile(
  new URL("../public/sitemap.xml", import.meta.url),
  renderSitemapXml(records),
  "utf8",
);

console.log(`Generated public/sitemap.xml with ${records.length} canonical URLs.`);
