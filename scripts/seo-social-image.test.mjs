import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("social metadata uses a valid 1200x630 PNG", async () => {
  const [png, html, seoSource] = await Promise.all([
    readFile(new URL("../public/og-image.png", import.meta.url)).catch(() => Buffer.alloc(0)),
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/seo.ts", import.meta.url), "utf8"),
  ]);

  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  assert.match(html, /property="og:image" content="\/og-image\.png"/);
  assert.match(seoSource, /buildAbsoluteUrl\("\/og-image\.png"\)/);
});
