# FamilyLook — shopping discovery, release 6

The public static application now searches 3,177 distinct real product variants from nine merchants: H&M, C&A, Decathlon, Reserved, Sinsay, Cropp, House, Mohito and bonprix. Every record includes an exact official purchase URL, a retailer image and the original price observation timestamp. 1,257 records include explicitly observed size availability. The catalog is a dated observation of official public product/listing pages, not a live merchant inventory feed or a claimed merchant partnership.

## Customer workflow

- Choose a family member and their clothing size and shoe size separately. Child height hints can select an explicitly listed height size; no adult letter/EU conversion or shoe-size-from-age assumption is made.
- Search Polish product names and colors, use category/fason/store/color/price/size filters and sort results. Six merchandise categories cover tops, bottoms, dresses/sets, footwear, outerwear and accessories. Official external searches cover all nine stores.
- Open the product gallery, inspect the source and recorded sizes, compare up to four products, save favorites, select replacements or add an HTTPS offer from any other store with an entered price and optional image.
- Generate three actual shopping proposals: matching the project, lower cost and fewer merchants. Each has real product photos, its delivery-inclusive total, coverage status and an explicit indication when it repeats another proposal. Selecting a proposal opens the family board with the chosen products per person.
- Set a family budget, individual merchandise caps, maximum merchant count, allowed merchants, occasion and optional outerwear/accessories. Known delivery prices replace the per-merchant reserve, including a genuine zero delivery cost. Clothing already owned has zero new purchase cost; purchased and locked rows are preserved during a new proposal.
- Save up to six looks in the project, reopen them, and export a CSV or illustrated printable purchase list with per-person products and retailer links. Guest persistence is session-local; JSON exports preserve the complete project. The optional authenticated Next.js/Supabase path validates the same shopping schema before saving.

## Correctness

Amounts use integer minor units. Foreign exchange supports PLN/EUR/DKK through the dated NBP snapshot. An unknown exchange rate never becomes a zero-price product. Per-person limits apply to merchandise; delivery is counted once per merchant in the family total. Partial outfits, unavailable offers and missing sizes remain visible as distinct issues.

A complete shopping scope requires clothing and adult/child footwear; infant footwear remains a manual choice. Optional outerwear/accessories introduce actual additional slots. Two-piece clothing sets can cover top and bottom only when their product name explicitly describes that combination. Accessory kits, body multipacks, underwear, nightwear, ambiguous sets and unclassified products cannot silently complete a clothing outfit. Product nouns take precedence over a broad merchant listing: leggings or ski trousers found under outerwear remain bottoms. Slippers are not automatically selected as outdoor footwear, and open shoes are excluded with outerwear/cold/sport/smart preferences.

Size matching strips parenthetical age descriptions (`110 (4–5 l)`) and accepts explicit retailer ranges (`68/74`). It does not treat age numbers as clothing sizes. Unknown sizes can be excluded in automatic selection; explicit mismatches and out-of-stock observations are excluded. The optimizer uses dated offers no more than 14 whole elapsed days old and never claims a global internet-wide optimum. Bounded candidate and beam selection retains inexpensive and merchant-diverse continuations, so an expensive early match does not discard every affordable complete path. Fixed rows can themselves exceed a limit; the UI reports that condition rather than altering those purchases.

## Source and data flow

`site/data/retail-catalog.json` preserves per-offer `checkedAt`, `sourcePage`, image galleries, actual available sizes, audience, category and price. The release retains 44 source-page observations plus the original exact product-page references. SKU and URL duplicates are removed; explicitly shared adult/child departments are recorded without creating extra fictional products. Galleries deduplicate the same image served at multiple cache resolutions.

`tools/build-observed-catalog.mjs` accepts an existing catalog, normalized source observations and observed Reserved DOM batches, validates official merchant hosts, positive prices, dates and image URLs, then atomically replaces the output. It classifies actual product names using `tools/catalog-classification.mjs`. `checkedAt` is the newest actual offer observation; `builtAt` records packaging time. Rebuilding does not re-date product prices.

```
node familylook/tools/build-observed-catalog.mjs BASE.json OBSERVATIONS.json DOM-BATCHES.json OUTPUT.json
```

No unattended scraping job or unapproved partner feed is enabled. Authorized merchant feeds can use the existing `import-retail-feed.mjs` workflow. Public records remain searchable after aging, with their price date; expired prices do not enter new automatic proposals. Images are retailer assets and may become unavailable; the UI retains the exact merchant link as fallback. It does not recolor a retailer photo and present it as an available product variant.

## Components and persistence

- `shopping-core.mjs`: version-2 normalization, size matching, search, totals, proposals and catalog quote synchronization.
- `shopping-studio.mjs` / CSS: responsive catalog, detail dialog, comparisons, favorites, proposals, saved looks and family product board. The mobile budget folds above the catalog; desktop controls scroll inside the sticky budget panel so exports remain reachable.
- `shopping-exports.mjs`: formula-safe, 13-column UTF-8/BOM CSV and escaped printable HTML with product photos, dates and hyperlinks.
- `shopping-catalog.mjs`: paginated catalog queries, bounded to 100 records per response, with store/category facets.
- Next.js `ShoppingStudio.tsx`, `shopping-types.ts`, `/api/offers`: shared React adapter, expanded TypeScript contract and filtered catalog API. `sync-studio.mjs` copies runtime modules and catalog data before tests/builds.
- The shared normalizer migrates version-1 plans, bounds cart rows/favorites/saved looks, rejects unsafe URLs and removes invalid person references and prototype keys. Ownership, credentials and approvals are not imported from project data.

The deployed Render service remains static. The Next.js API and authenticated Supabase persistence are source-ready optional deployment paths; this release does not claim they are active on the static service. No checkout, payment or merchant order dispatch is performed.

## Validation

Automated tests exercise real-catalog completeness, budget feasibility with the project palette, clothing/shoe size separation, age-labelled ranges, category/set classification, cold-weather footwear, fixed rows, caps, merchant restrictions, schema migration, public API pagination, quote synchronization, CSV totals and HTML escaping. Existing measurements, photo layers and fulfillment contracts remain covered.

Browser QA covers 3,177-offer loading, actual retailer images, family selection, three proposals, product detail galleries, comparison, favorites, saved looks across reload, CSV/print parity, desktop sidebar reachability and a 375px content viewport with no horizontal overflow. Official Cropp/House searches were corrected to the native homepage query route; Mohito and bonprix use verified retailer search formats. Cloud browser extension logging is not treated as an application error.

## 6.1 startup hardening

The static app loads shopping as an independent dynamic module, so a delayed retailer module does not prevent the family configurator or measurement workspace from starting. The app, project importer, shopping modules and CSS use a consistent release query in the browser dependency graph and offline cache. Initial module failure has an explicit reload action. The React shopping entry uses the same release query.
