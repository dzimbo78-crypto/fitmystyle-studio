# FamilyLook shopping and family budget

The existing public static Render application now includes a shopping planner. It searches a curated catalog of 32 real offers from official H&M, C&A and Decathlon product pages, links to each exact product, and provides direct search links to H&M, C&A, Reserved, Sinsay and Decathlon. All 32 offers have official product image URLs. The catalog records the date of the observed retail price and does not claim live inventory or a merchant partnership.

## Customer workflow

1. Select a family member. Offers are filtered by adult woman/man, child or infant.
2. Search by product name and filter category, store, color and maximum price. Each offer includes an official purchase link and its price date. Size availability is unknown unless the catalog explicitly lists a size.
3. Add an offer, choose a size and quantity, or add a manual product URL and price. A wardrobe item has zero new purchase cost and no invented merchant URL.
4. Choose the selected garment per person or a top/bottom outfit. Automatic suggestions use the selected garment type, palette, budget and per-store delivery reserve. Locked, owned and purchased items remain fixed. Suggestions are bounded heuristics over the available catalog, not a claim of the cheapest option across the whole internet.
5. Replace individual rows, mark purchased items, enter actual delivery charges and export a CSV or printable shopping list with store links. Purchased items still count toward the budget; wardrobe items do not.

## Price and budget accuracy

All arithmetic uses integer minor units. Delivery reserve is charged once per store; an entered actual delivery amount, including zero, replaces that reserve. No unconditional free-delivery threshold is assumed. Missing foreign exchange rates leave a product unpriced and the plan incomplete. A partial family selection is not described as a complete family outfit within budget. NBP reference exchange data supports PLN, EUR and DKK and exposes its original effective date. The bank/card settlement rate may differ.

Offers with explicit age restrictions and unverified size, an out-of-stock status or a price older than 14 days are excluded from automatic suggestions. They can still be inspected manually where appropriate. A two-piece garment set can cover top and bottom; an infant bodysuit does not silently replace trousers. Product photographs remain separate from customizable design mockups.

## Persistence and architecture

- `shopping-core.mjs`: pure normalization, eligibility, amount conversion, budget totals, search and bounded beam search.
- `shopping-studio.mjs` / CSS: accessible browser UI, shopping rows, external store searches, manual/wardrobe form, CSV and printable report.
- `shopping-stores.mjs`: official retailer destinations.
- `data/retail-catalog.json`: explicit price snapshots with source URLs and verification dates.
- `data/exchange-rates.json`: official NBP table snapshot.
- `ShoppingStudio.tsx`, `shopping-types.ts`: React/Next.js adapter and TypeScript contract.
- The same normalizer runs before authenticated Supabase configuration saves, including URL, member reference, quantity and currency checks.
- `/api/offers` serves the verified catalog in the Next.js build. It is available only when the Next.js application is deployed; the existing public service remains static.

Family JSON exports and guest session history retain the shopping plan. Actual body measurements and custom manufacturing documents remain separate. No payment, merchant checkout, order dispatch or email is triggered by the shopping list.

## Refresh and partner feeds

`node familylook/tools/refresh-exchange-rates.mjs` reads the documented public NBP HTTPS API and atomically replaces the FX snapshot only after validation. It never re-dates product prices.

A merchant-authorized normalized JSON export can replace the product catalog:

```
RETAIL_PERMISSION_REFERENCE=<merchant-approval-reference> node familylook/tools/import-retail-feed.mjs --input /absolute/path/offers.json
```

The import accepts an array (or `{offers:[...]}`) with the same offer fields used by `retail-catalog.json`. Keep actual per-variant IDs, explicit size information, price currency, merchant URL, photo URL and the supplier's true checkedAt. Source `partner-feed` denotes approved feed records. Invalid rows, missing dates, duplicate IDs and unsafe URLs abort before replacing the existing catalog. Do not place API tokens or feed credentials in the browser bundle or repository.

Awin product feeds require a publisher account and feed permissions/key; generic retailer catalogs are not anonymously connected by this release. To automate a full merchant feed, the owner must provide the approved feed/access credentials through server secrets. Existing source connectors can parse Awin-style CSV/XML/JSON aliases, but the family offer contract still requires an explicit adult/child/infant classification. No silent age guessing or license assumption is performed. The legacy supplier-sync path guard was corrected to recognize the repository's `source` directory.

## Verification

Node tests cover arithmetic, delivery grouping, zero delivery, quantities, purchased versus owned clothes, missing FX, incomplete outfits, search and size filters, optimizer budget/fixed rows, age/staleness exclusions, JSON/Supabase roundtrips, URL safety and feed/FX validation. Next.js production build includes the shared shopping UI and `/api/offers` route.

Browser QA includes the live H&M and C&A searches, official H&M product photos/prices, Reserved and Sinsay search destinations, product selection, budgets and mobile layout. Decathlon serves an access-denied security page to the cloud test browser; that browser transition cannot be verified here. Its catalog records originate from official page research and remain dated snapshots with unknown variant stock.

Primary references: [NBP public API](https://api.nbp.pl/), [Awin feed access](https://success.awin.com/s/article/How-can-I-access-a-Product-Feed?language=en_US), [Awin authentication](https://help.awin.com/apidocs/api-authentication). Exact retailer source URLs are stored with every offer.
