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
    "buying-guides",
    "buying-guides/taipei",
    "buying-guides/new-taipei",
    "buying-guides/taoyuan",
    "buying-guides/taichung",
    "buying-guides/tainan",
    "buying-guides/kaohsiung",
    "renting-guides",
    "renting-guides/rent-market",
    "renting-guides/deposit-and-lease",
    "renting-guides/tenant-rights",
    "buying-guides/taipei/districts",
    "buying-guides/new-taipei/districts",
    "buying-guides/taoyuan/districts",
    "buying-guides/taichung/districts",
    "buying-guides/tainan/districts",
    "buying-guides/kaohsiung/districts",
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
    assert.match(html, /"@type": "BreadcrumbList"/);
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
  assert.match(guidesHub, /"@type": "ItemList"/);

  const transactionGuide = await readFile(
    new URL("../dist/guides/transaction-records/index.html", import.meta.url),
    "utf8",
  );
  assert.match(transactionGuide, /"@type": "Article"/);
  assert.match(transactionGuide, /"publisher": \{\s+"@id": "https:\/\/tw-real-estate-price-explorer-googl\.vercel\.app\/#organization"\s+\}/);

  const methodology = await readFile(new URL("../dist/methodology/index.html", import.meta.url), "utf8");
  assert.match(methodology, /欄位與計算保守原則/);
  assert.match(methodology, /內容與資料處理說明查核日期：2026-06-26/);

  const contact = await readFile(new URL("../dist/contact/index.html", import.meta.url), "utf8");
  assert.match(contact, /本頁意見回饋表單/);
  assert.match(contact, /官方資料更正/);

  const subsidyGuide = await readFile(
    new URL("../dist/guides/first-home-loan-subsidy/index.html", import.meta.url),
    "utf8",
  );
  assert.match(subsidyGuide, /本頁內容查核日期：2026-06-26/);
  assert.match(subsidyGuide, /住宅補貼線上申請系統/);

  const tenantRights = await readFile(
    new URL("../dist/renting-guides/tenant-rights/index.html", import.meta.url),
    "utf8",
  );
  assert.match(tenantRights, /財政部稅務入口網/);
  assert.match(tenantRights, /全國法規資料庫/);

  const taipeiDistricts = await readFile(
    new URL("../dist/buying-guides/taipei/districts/index.html", import.meta.url),
    "utf8",
  );
  assert.match(taipeiDistricts, /捷運生活圈與屋齡差異/);

  const kaohsiungDistricts = await readFile(
    new URL("../dist/buying-guides/kaohsiung/districts/index.html", import.meta.url),
    "utf8",
  );
  assert.match(kaohsiungDistricts, /港灣與重劃區生活圈/);

  const collectionPage = await readFile(
    new URL("../dist/prices/新北市/買賣/index.html", import.meta.url),
    "utf8",
  );
  assert.match(collectionPage, /"@type": "Dataset"/);
  assert.match(collectionPage, /"@type": "CollectionPage"/);

  const presaleGuide = await readFile(
    new URL("../dist/guides/presale-vs-resale/index.html", import.meta.url),
    "utf8",
  );
  assert.match(presaleGuide, /data-answer-first/);
  assert.match(presaleGuide, /<table>/);
  assert.match(presaleGuide, /"abstract":/);
  assert.match(presaleGuide, /預售屋 vs 成屋實價登錄判讀差異/);
  assert.match(presaleGuide, /aria-label="breadcrumb"/);
  assert.match(presaleGuide, /aria-current="page"/);
  assert.match(presaleGuide, /href="\/guides\/"/);

  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  // Per-page dateModified overrides the build date; methodology declares 2026-06-26.
  assert.match(
    sitemap,
    /<loc>https:\/\/tw-real-estate-price-explorer-googl\.vercel\.app\/methodology\/<\/loc>\s*<lastmod>2026-06-26<\/lastmod>/,
  );
  // Pages without an explicit date fall back to the build date.
  assert.match(sitemap, /<lastmod>2031-12-24<\/lastmod>/);
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locations.length, 100);
});
