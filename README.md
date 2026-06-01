<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3c9080c0-846d-4850-a7c7-ac9562c7bc55

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## SEO and Google Search Console

This project now includes:

- initial HTML metadata for title, description, Open Graph, Twitter cards, and canonical URL
- dynamic structured data for `WebSite`, `WebApplication`, and `CollectionPage`
- `robots.txt` and `sitemap.xml` endpoints
- `X-Robots-Tag: noindex, nofollow` on API responses so search engines don't index search endpoints

Recommended deployment settings:

1. Set `VITE_SITE_URL` to the final production origin, for example `https://your-domain.com`
2. Redeploy so canonical tags, sitemap URLs, and structured data use the correct domain
3. Add the site to Google Search Console
4. If using HTML tag verification, set `VITE_GOOGLE_SITE_VERIFICATION` to the token from Search Console and redeploy
5. Submit `https://your-domain.com/sitemap.xml` in Google Search Console

Google Search Central references used for this setup:

- JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Build and submit a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- robots.txt creation: https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt
- Search Console ownership verification: https://support.google.com/webmasters/answer/9008080
