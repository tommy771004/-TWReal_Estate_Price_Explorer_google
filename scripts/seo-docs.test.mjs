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

test("SEO strategy reports document sitemap, audit, competitor, and programmatic gates", async () => {
  const [sitemapReport, auditReport, actionPlan, competitorPlan, programmaticPlan] = await Promise.all([
    readFile(new URL("../SEODoc-main/SITEMAP_VALIDATION_REPORT.md", import.meta.url), "utf8"),
    readFile(new URL("../SEODoc-main/FULL_SEO_AUDIT_REPORT.md", import.meta.url), "utf8"),
    readFile(new URL("../SEODoc-main/SEO_ACTION_PLAN.md", import.meta.url), "utf8"),
    readFile(new URL("../SEODoc-main/COMPETITOR_COMPARISON_PAGE_PLAN.md", import.meta.url), "utf8"),
    readFile(new URL("../SEODoc-main/PROGRAMMATIC_SEO_PLAN.md", import.meta.url), "utf8"),
  ]);

  assert.match(sitemapReport, /100/);
  assert.match(sitemapReport, /66/);
  assert.match(sitemapReport, /live crawl/i);
  assert.match(auditReport, /SEO Health Score/);
  assert.match(auditReport, /83\/100/);
  assert.match(actionPlan, /Critical|High|Medium|Low/);
  assert.match(competitorPlan, /發布閘門/);
  assert.match(competitorPlan, /不得發布/);
  assert.match(programmaticPlan, /Programmatic SEO Score/);
  assert.match(programmaticPlan, /行政區深度頁/);
  assert.match(programmaticPlan, /30%/);
  assert.match(programmaticPlan, /40%/);
});
