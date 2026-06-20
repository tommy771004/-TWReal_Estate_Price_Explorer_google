# Schema Report

Implementation status: WebPage schema is emitted for 10 trust, guide and hub pages; CollectionPage schema is prerendered for each semantic city/type route. FAQPage, LocalBusiness and rating markup remain intentionally absent.

## Current local graph

| Type | Status | Notes |
|---|---|---|
| WebSite | Pass | Name, URL, language and description present |
| Organization | Pass with opportunity | Valid, but lacks a dedicated logo and verified `sameAs` profiles |
| WebApplication | Pass | Category, platform, free offer, features and provider present |
| CollectionPage | Pass (prerendered + runtime) | Selection-specific name, URL and description |
| FAQPage | Removed | Restricted rich-result type for this non-government/non-health website |

JSON-LD parses successfully. All schema URLs should remain absolute in production via `VITE_SITE_URL`.

Do not add LocalBusiness, RealEstateAgent, AggregateRating, HowTo or Article markup unless the visible page truthfully supports that entity and its required properties.
