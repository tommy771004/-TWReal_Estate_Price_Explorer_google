# Image SEO Audit

| Item | Result |
|---|---|
| Local social image | `og-image.svg`, 2.7 KB, 1200×630 |
| Social preview fallback | `og-image.png`, 1200×630, referenced by Open Graph and Twitter metadata |
| Runtime `<img>` patterns | One building-photo carousel pattern |
| Alt text | Descriptive address-based alt text present |
| CLS prevention | Width and height added |
| Loading | Lazy loading and async decoding added |

Runtime building images are third-party URLs, so their file sizes and formats cannot be guaranteed locally. The PNG social-card compatibility improvement is complete; the SVG remains the favicon source.
