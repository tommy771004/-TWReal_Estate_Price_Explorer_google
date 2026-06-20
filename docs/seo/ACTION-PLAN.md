# SEO Action Plan

## Implementation status

- Local implementation complete: semantic city/type routes, unique prerendered HTML, 76-URL build sitemap, trust pages, guide hubs, PNG social card, local fonts, schema and regression tests.
- Deployment support complete: optional Search Console verification token, Vercel content-type headers and `npm run seo:verify-live`.
- External action remains: deploy, verify the Search Console property, submit the sitemap and collect field data. These require production access or credentials and are not hardcoded into the repository.

## Critical — deploy now

- Deploy the current branch so `/llms.txt` is served as text and restricted FAQPage markup disappears from production. The repository configuration is ready; production deployment remains external.
- After deployment, verify `/`, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and one query URL with `curl` or Search Console URL Inspection.

## High — next 1–4 weeks

- Replace indexable query URLs with prerendered routes such as `/prices/kaohsiung/presale/`.
- Give every indexable route unique initial HTML: title, description, H1, answer-first introduction, canonical and CollectionPage schema.
- Add `/methodology`, `/data-sources`, `/about`, `/contact`, and `/privacy` pages.
- Configure Google Search Console and submit the canonical sitemap.

## Medium — next 1–3 months

- Build content clusters for city price trends, presale-vs-resale explanations, and transaction-data methodology.
- Keep the build-time `SEO_LAST_MODIFIED` override connected to the deployment's content-change timestamp.
- Replace the social SVG with a tested 1200×630 PNG while retaining SVG for the favicon.
- Measure and reduce main-thread work; audit the vendor, charts and maps chunks with Lighthouse.

## Low / experimental

- Consider RSL licensing only after choosing an explicit AI reuse policy.
- Monitor AI citations monthly; do not treat `llms.txt` as a ranking factor.
