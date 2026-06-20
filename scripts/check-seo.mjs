import { readFile } from "node:fs/promises";

const SITE_ORIGIN = "https://tw-real-estate-price-explorer-googl.vercel.app";

const [indexHtml, robots, sitemap, llms] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
  readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
  readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
]);

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(/<html lang="zh-Hant-TW">/.test(indexHtml), "HTML language must be zh-Hant-TW");
assert((indexHtml.match(/<h1\b/g) ?? []).length === 1, "Static HTML must contain exactly one H1");
assert(/<link rel="canonical" href="\/"/.test(indexHtml), "Static canonical link is missing");
assert(/name="description"/.test(indexHtml), "Meta description is missing");
assert(!/name="keywords"/.test(indexHtml), "Obsolete meta keywords tag should not be present");
assert(/property="og:image" content="\/og-image\.png"/.test(indexHtml), "Open Graph PNG image is missing");
assert(/"@type": "WebApplication"/.test(indexHtml), "WebApplication structured data is missing");
assert(/"isAccessibleForFree": true/.test(indexHtml), "Free-access structured data signal is missing");
assert(!/"@type": "FAQPage"/.test(indexHtml), "FAQPage schema is restricted and must not be used on this site");

const jsonLdBlocks = [...indexHtml.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
assert(jsonLdBlocks.length > 0, "JSON-LD is missing");
for (const [, payload] of jsonLdBlocks) {
  try {
    JSON.parse(payload);
  } catch (error) {
    failures.push(`Invalid JSON-LD: ${error.message}`);
  }
}

assert(/User-agent: \*/.test(robots), "robots.txt must define the wildcard crawler group");
assert(/Allow: \/(?:\r?\n|$)/.test(robots), "robots.txt must allow public pages");
assert(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`), "robots.txt sitemap URL is incorrect");

const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
assert(locations.length > 0, "Sitemap contains no URLs");
assert(new Set(locations).size === locations.length, "Sitemap contains duplicate URLs");
assert(locations.every((url) => url.startsWith(`${SITE_ORIGIN}/`)), "Sitemap contains a non-canonical origin");
assert(locations.every((url) => URL.canParse(url)), "Sitemap contains an invalid URL");
assert(locations.every((url) => !/[?&](city|type)=/.test(url)), "Sitemap must not contain legacy query routes");
assert(!/<lastmod>/.test(sitemap), "Source sitemap dates must be injected at build time");

assert(llms.includes("內政部不動產交易實價查詢服務網"), "llms.txt must identify the official data source");
assert(llms.includes(`${SITE_ORIGIN}/sitemap.xml`), "llms.txt must link to the sitemap");

if (failures.length > 0) {
  console.error(`SEO checks failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SEO checks passed: ${locations.length} canonical URLs, valid JSON-LD, robots.txt, and llms.txt.`);
