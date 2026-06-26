import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("SEO documentation identifies duplicate source files", async () => {
  const index = await readFile(new URL("../SEODoc-main/README.md", import.meta.url), "utf8");

  assert.match(index, /SEO3\.md/);
  assert.match(index, /SEO4\.md/);
  assert.match(index, /完全重複/);
  assert.match(index, /SHA256/);
});

test("monthly SEO smoke checklist captures recurring verification commands", async () => {
  const checklist = await readFile(
    new URL("../SEODoc-main/MONTHLY_SEO_SMOKE_CHECKLIST.md", import.meta.url),
    "utf8",
  );

  for (const command of [
    "npm run seo:check",
    "npm run test:seo-content",
    "npm run test:seo-routes",
    "npm run lint",
    "npm run build",
    "npm run seo:verify-live",
  ]) {
    assert.match(checklist, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(checklist, /每月/);
  assert.match(checklist, /Search Console/);
});
