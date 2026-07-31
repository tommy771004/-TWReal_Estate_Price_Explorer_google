import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

const OVERRIDE_DATE = "2031-12-24";
test("SEO modification dates use page dates with a build-time fallback", async () => {
  execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
    cwd: new URL("..", import.meta.url),
    env: { ...process.env, SEO_LAST_MODIFIED: OVERRIDE_DATE },
    stdio: "ignore",
  });

  const [builtHtml, builtSitemap, appSource, seoSource, sourceHtml, sourceSitemap] =
    await Promise.all([
      readFile(new URL("../dist/index.html", import.meta.url), "utf8"),
      readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8"),
      readFile(new URL("../src/App.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/lib/seo.ts", import.meta.url), "utf8"),
      readFile(new URL("../index.html", import.meta.url), "utf8"),
      readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    ]);

  assert.match(builtHtml, new RegExp(`"dateModified": "${OVERRIDE_DATE}"`));

  const lastModifiedValues = [
    ...builtSitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g),
  ].map((match) => match[1]);
  assert.equal(lastModifiedValues.length, 100);
  assert.ok(lastModifiedValues.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)));
  assert.match(
    builtSitemap,
    new RegExp(`<loc>https://tw-realestate-price\\.vercel\\.app/</loc>\\s*<lastmod>${OVERRIDE_DATE}</lastmod>`),
  );
  assert.match(
    builtSitemap,
    /<loc>https:\/\/tw-realestate-price\.vercel\.app\/methodology\/<\/loc>\s*<lastmod>2026-06-26<\/lastmod>/,
  );

  for (const source of [appSource, seoSource, sourceHtml, sourceSitemap]) {
    assert.doesNotMatch(source, /2026-06-20/);
  }
});
