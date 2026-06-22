import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("..", import.meta.url);
const SITE_ORIGIN = "https://tw-real-estate-price-explorer-googl.vercel.app";

test("production build prerenders semantic city and transaction routes", async () => {
  execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
    cwd: ROOT,
    env: { ...process.env, SEO_LAST_MODIFIED: "2031-12-24" },
    stdio: "ignore",
  });

  const [page, sitemap] = await Promise.all([
    readFile(
      new URL("../dist/prices/高雄市/預售屋/index.html", import.meta.url),
      "utf8",
    ).catch(() => ""),
    readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8"),
  ]);

  const canonical = `${SITE_ORIGIN}/prices/${encodeURIComponent("高雄市")}/${encodeURIComponent("預售屋")}/`;
  assert.match(page, /<title>高雄市預售屋實價登錄查詢 \| 台灣房價地圖與成交紀錄<\/title>/);
  assert.match(page, /<h1>高雄市預售屋實價登錄查詢<\/h1>/);
  assert.ok(page.includes(`<link rel="canonical" href="${canonical}"`));
  assert.match(page, /"@type": "CollectionPage"/);

  const homepage = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(homepage, /data-legacy-seo-redirect/);
  assert.match(homepage, /window\.location\.replace/);

  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locations.length, 100);
  assert.equal(locations.filter((url) => url.includes("/prices/")).length, 66);
  assert.ok(locations.every((url) => !url.includes("?")));
  assert.ok(locations.includes(canonical));
});
