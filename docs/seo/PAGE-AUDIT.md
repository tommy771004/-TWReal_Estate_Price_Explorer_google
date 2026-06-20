# Homepage SEO Page Audit

## Implementation update

The former parameter/CSR issue is resolved in the local production build: 66 semantic selection pages receive unique title, description, H1, introduction, canonical and CollectionPage JSON-LD. Dedicated `/prices/`, `/guides/`, methodology, data-source, about, contact and privacy pages close the documented trust and internal-link gaps.

Overall diagnostic score: **82/100**.

- Title: 20 characters, focused on 實價登錄查詢 and Taiwan housing prices.
- Description: 52 Chinese characters, specific and aligned with the tool.
- Headings: one H1, four H2s, five H3s in static HTML.
- Canonical: present; runtime selection canonicals use stable parameter ordering.
- Social metadata: Open Graph and Twitter cards use a tested 1200×630 PNG; the SVG is retained for the favicon.
- Content: official source, coverage, use cases and visible FAQ answers are present.
- Main issue: 65 parameter URLs share the same initial server HTML and only become unique after hydration.
- Trust gap: no dedicated methodology, author/publisher, privacy or contact page.
