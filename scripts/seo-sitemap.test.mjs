import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSitemapRecords,
  renderSitemapXml,
} from "../src/lib/seoSitemap.ts";

const SITE_ORIGIN = "https://tw-realestate-price.vercel.app";

test("sitemap generator emits the complete canonical URL inventory", () => {
  const records = buildSitemapRecords(SITE_ORIGIN, "2031-12-24");
  const locations = records.map(({ loc }) => loc);

  assert.equal(records.length, 100);
  assert.equal(new Set(locations).size, records.length);
  assert.equal(locations.filter((url) => url.includes("/prices/")).length, 66);
  assert.ok(locations.every((url) => url.startsWith(`${SITE_ORIGIN}/`)));
  assert.ok(locations.every((url) => !url.includes("?")));
  assert.ok(locations.every((url) => !new URL(url).pathname.startsWith("/districts/")));
});

test("sitemap renderer emits valid supported fields only", () => {
  const xml = renderSitemapXml([
    {
      loc: `${SITE_ORIGIN}/prices/?type=buy&city=臺北市`,
      lastmod: "2031-12-24",
    },
  ]);

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<loc>.*\?type=buy&amp;city=臺北市<\/loc>/);
  assert.match(xml, /<lastmod>2031-12-24<\/lastmod>/);
  assert.doesNotMatch(xml, /<priority>|<changefreq>/);
});
