# Google SEO API Report

Credential status: **unconfigured**.

Implementation status: the site now accepts `VITE_GOOGLE_SITE_VERIFICATION` at build time without storing the token in source, emits a canonical sitemap, and includes `npm run seo:verify-live`. Search Console ownership, sitemap submission and API querying still require credentials and production authority.

No `~/.config/codex-seo/google-api.json` was found, and the plugin package does not include the referenced `google_auth.py` helper. Therefore Search Console, URL Inspection, sitemap status, CrUX, PageSpeed API and GA4 data were not queried.

Recommended setup order:

1. Verify the domain in Google Search Console.
2. Submit `/sitemap.xml`.
3. Configure a service account with read access for GSC URL Inspection and Search Analytics.
4. Add a PageSpeed/CrUX API key.
5. Add GA4 only if the site has an analytics property and an explicit privacy policy.

Do not use the Indexing API for these pages; Google officially limits it to supported job and broadcast/live-stream page types.
