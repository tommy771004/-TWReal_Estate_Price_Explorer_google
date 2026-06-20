# Full SEO Audit — Taiwan Real Estate Price Explorer

Audit date: 2026-06-20  
Scope: repository production build plus read-only checks of the deployed Vercel site.

## Post-audit implementation update

The score and findings below are the historical audit snapshot. Since that audit, the repository has replaced parameter sitemap URLs with 66 semantic city/type selections, added 10 trust/guide/hub pages, prerendered unique metadata and visible copy, removed restricted FAQ schema, added a PNG social card, local font delivery, Search Console verification scaffolding and deployment regression checks. A new score requires deploying and rerunning live checks; it is not inferred from local code alone.

## Executive summary

SEO health score: **74/100**. The application has a sound metadata baseline, crawlable static fallback content, a valid sitemap, and useful WebApplication schema. The main constraint is architectural: 65 of 66 sitemap URLs use query parameters and return identical initial HTML. Search engines that render JavaScript can discover the selected location, but non-rendering AI crawlers cannot reliably distinguish those pages.

| Category | Score | Weight | Evidence |
|---|---:|---:|---|
| Technical SEO | 80 | 22% | HTTPS, robots, sitemap, canonicals present; parameter/CSR architecture remains |
| Content quality | 65 | 23% | Useful answer content and official source; limited methodology and publisher identity |
| On-page SEO | 82 | 20% | One H1, logical H2/H3 hierarchy, dynamic title/description/H1 |
| Schema | 90 | 10% | WebSite, Organization, WebApplication and dynamic CollectionPage; restricted FAQ removed locally |
| Performance | 60 | 10% | Code splitting exists; no CrUX/PSI credentials, large optional JS chunks |
| AI search readiness | 62 | 10% | Static content and llms.txt locally; query pages depend on JavaScript |
| Images | 90 | 5% | Small SVG social asset; dynamic images now have alt, dimensions and lazy decoding |

## Highest-priority findings

1. **Deploy the current repository.** The live site still exposes FAQPage schema, while `/llms.txt` returns homepage HTML instead of plain text.
2. **Move indexable landing pages to semantic SSR/SSG routes.** The live homepage and a Kaohsiung presale query returned byte-identical HTML.
3. **Add publisher trust pages.** Publish methodology, data limitations, privacy, contact and responsible maintainer information.
4. **Configure Google APIs.** No Google SEO configuration was found, so GSC index coverage, CrUX, GA4 and URL Inspection could not be measured.
5. **Authenticate DataForSEO if live keyword/AI visibility data is required.** Installed endpoints returned HTTP 401.

## Verified strengths

- Deployed homepage, robots.txt and sitemap.xml return HTTP 200.
- Local sitemap contains 66 unique canonical URLs.
- The local static document contains one H1, four H2s and five H3s.
- Local JSON-LD parses successfully and contains no deprecated schema types.
- `robots.txt` permits public crawling and blocks `/api/`.
- Official Ministry of the Interior source attribution is visible in static and rendered content.

## Limitations

No authenticated Search Console, GA4, PageSpeed/CrUX or DataForSEO data was available. Performance and visibility scores are therefore repository-based diagnostic scores, not field measurements.
