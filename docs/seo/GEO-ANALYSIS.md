# GEO Analysis

## Implementation update

AI-readable coverage is now materially stronger in the local build: semantic city/type pages have unique initial HTML and CollectionPage data; methodology, sources, publisher-positioning, privacy and three explanatory guides are prerendered; `/llms.txt` has an explicit text response header. Original quarterly statistics and third-party authority signals remain future work.

Heuristic GEO readiness: **62/100**. This is not a measured citation-share score.

| Dimension | Score | Finding |
|---|---:|---|
| Citability | 66 | Direct answers and official attribution exist; original analysis is limited |
| Structural readability | 82 | Clear headings, lists, FAQ content and interactive data |
| Multimodal usefulness | 75 | Maps and charts are strong; little indexable explanatory media |
| Authority signals | 45 | No named maintainer, methodology page or third-party entity presence documented |
| Technical accessibility | 44 | Homepage fallback is readable; location/type pages require JavaScript for unique meaning |

Platform estimates: Google AI Overviews 68, ChatGPT 58, Perplexity 60.

## Crawler and machine-readable status

- Wildcard robots policy allows GPTBot, OAI-SearchBot, ClaudeBot and PerplexityBot.
- Local `public/llms.txt` is valid and concise.
- The repository now configures `/llms.txt` as `text/plain`; deployment and `npm run seo:verify-live -- <origin>` are required to confirm the live response.
- No RSL policy is present. This is optional and should follow a licensing decision.

## Highest-impact changes

1. Prerender unique city/type pages.
2. Publish a transparent data methodology with dated citations.
3. Add original quarterly city-level statistics and comparison tables.
4. Add responsible publisher/maintainer identity and credentials.
5. Earn third-party mentions through Taiwan housing-data and civic-tech communities.
