import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("..", import.meta.url);

test("production build emits crawlable trust and guide pages", async () => {
  execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
    cwd: ROOT,
    env: { ...process.env, SEO_LAST_MODIFIED: "2031-12-24" },
    stdio: "ignore",
  });

  const paths = [
    "prices",
    "guides",
    "methodology",
    "data-sources",
    "about",
    "contact",
    "privacy",
    "guides/transaction-records",
    "guides/presale-vs-resale",
    "guides/map-location-limitations",
    "guides/mortgage-calculator",
    "guides/first-home-loan-subsidy",
    "guides/mortgage-approval-factors",
    "guides/refinance-mortgage",
    "guides/moving-in-checklist",
    "guides/renovation-budget",
    "guides/small-space-furnishing",
  ];

  for (const pathname of paths) {
    const html = await readFile(
      new URL(`../dist/${pathname}/index.html`, import.meta.url),
      "utf8",
    ).catch(() => "");
    assert.match(html, /<main[^>]*data-seo-content-page/);
    assert.match(html, /<h1>[^<]+<\/h1>/);
    assert.ok(html.includes(`https://tw-real-estate-price-explorer-googl.vercel.app/${pathname}/`));
    assert.match(html, /"@type": "WebPage"/);
  }

  const homepage = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(homepage, /href="\/methodology\/"/);
  assert.match(homepage, /href="\/privacy\/"/);
  assert.match(homepage, /href="\/prices\/"/);
  assert.match(homepage, /href="\/guides\/"/);

  const pricesHub = await readFile(new URL("../dist/prices/index.html", import.meta.url), "utf8");
  assert.match(pricesHub, /href="\/prices\/%E9%AB%98%E9%9B%84%E5%B8%82\/%E9%A0%90%E5%94%AE%E5%B1%8B\/"/);

  const guidesHub = await readFile(new URL("../dist/guides/index.html", import.meta.url), "utf8");
  assert.match(guidesHub, /href="\/guides\/transaction-records\/"/);

  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locations.length, 83);
});
