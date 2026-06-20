const configuredOrigin = process.argv[2] || process.env.VITE_SITE_URL;

if (!configuredOrigin) {
  console.error("Usage: npm run seo:verify-live -- https://example.com");
  process.exit(1);
}

const origin = new URL(configuredOrigin).origin;
const failures = [];

const request = async (pathname, expectedType) => {
  const url = new URL(pathname, `${origin}/`);
  const response = await fetch(url, { redirect: "follow" });
  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) failures.push(`${url} returned HTTP ${response.status}`);
  if (!contentType.includes(expectedType)) {
    failures.push(`${url} returned ${contentType || "no content type"}; expected ${expectedType}`);
  }
  return { body, url: url.toString() };
};

try {
  const [homepage, sitemap, llms, semanticPage] = await Promise.all([
    request("/", "text/html"),
    request("/sitemap.xml", "xml"),
    request("/llms.txt", "text/plain"),
    request("/prices/%E9%AB%98%E9%9B%84%E5%B8%82/%E9%A0%90%E5%94%AE%E5%B1%8B/", "text/html"),
  ]);

  if (!/<link rel="canonical" href="https?:\/\//.test(homepage.body)) {
    failures.push("Homepage does not expose an absolute canonical URL.");
  }
  if (!/<loc>https?:\/\//.test(sitemap.body) || /[?&](city|type)=/.test(sitemap.body)) {
    failures.push("Sitemap is empty or still contains query-parameter SEO routes.");
  }
  if (!llms.body.includes("內政部不動產交易實價查詢服務網")) {
    failures.push("llms.txt does not identify the official data source.");
  }
  if (!semanticPage.body.includes("高雄市預售屋實價登錄查詢")) {
    failures.push("Semantic city/type route was not served as prerendered HTML.");
  }
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

if (failures.length) {
  console.error(`Live SEO verification failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Live SEO verification passed for ${origin}.`);
