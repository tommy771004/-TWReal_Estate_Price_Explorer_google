# Proposed Site Structure

## Implementation status

Implemented locally: `/prices/`, 66 `/prices/{city}/{transaction-type}/` selections, `/guides/` and its three children, plus methodology, sources, about, contact and privacy. The build sitemap contains 76 canonical URLs. District routes are understood by the application but are excluded from the sitemap until transaction volume and unique analysis can be validated. Quarterly reports remain unpublished rather than shipping unsupported statistics.

```text
/
├── /prices/
│   └── /prices/{city}/{transaction-type}/
├── /districts/{city}/{district}/{transaction-type}/
├── /guides/
│   ├── transaction-records/
│   ├── presale-vs-resale/
│   └── map-location-limitations/
├── /reports/{year}/{quarter}/
├── /methodology/
├── /data-sources/
├── /about/
├── /contact/
└── /privacy/
```

Only create district routes when they contain sufficient transaction data and unique analysis. Redirect legacy parameter URLs to their semantic equivalent and keep one canonical URL per intent.
