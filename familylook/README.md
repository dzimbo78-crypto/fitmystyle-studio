# FitMyStyle — FamilyLook Studio 3.0 (Atelier Edition)

A fully isolated **module in `dzimbo78-crypto/fitmystyle-studio`**; the existing B-CORE and unrelated projects are not used. This release has a fully working browser configurator and tailoring technical pack, and includes modular React/Next.js/Supabase/FastAPI **buildable client and optional backend** for later account-based expansion.

## Live standalone app

The directory `site/` is a zero-dependency static site. All guest projects and personal body measurements stay in `sessionStorage` until cleared or the tab's browser session ends; browser restore functionality can preserve a previous session. The app has no online database, checkout, or production dispatch. No third-party cookies or AI APIs are used.

Launch locally in a web server with `python -m http.server --directory site 8080`, then open http://localhost:8080 (local machine). 

### Key working features
- Smooth 3D family mannequins, WebGL and software fallback, skin tones, patterns, curved print layers.
- 1–12 people; selectable Adult/Child/Infant, female/male/neutral body-shape configuration, independent garment and size per person.
- 20 original editable SVG template shapes (not real purchasable SKUs) and 8 coordinated color palettes.
- Independent front/back lettering and locally attached artwork layer (image stays in memory only).
- 16 anthropometric measurement guides, highlight diagrams, cm validation, required fields by garment group, per-person progress and warnings.
- **Technical pack** print-to-PDF with a distinct page for each person, measured values, provisional garment targets, ease, print zone and sign-off fields. Also HTML, JSON and CSV exports.
- Downloadable measurement instructions `site/instrukcja-pomiarow.pdf` and `site/pomiar-przewodnik.html`.

## Intended workflow for tailors

Measure body → choose garment and fabric → add preliminary ease → create draft tech pack → pattern maker confirms pattern/drape/material shrinkage/production tolerances → fit sample → approve final technical documents and size chart → ONLY THEN consider placing an order. The app never implies that it already produces an approved sewing pattern.

## Validation
- `node --test tests/domain.test.mjs` — 10 domain tests.
- `python tests/browser_smoke.py` — Playwright tests without external navigation, desktop/mobile, guest profiles, measurement independence, mockup, exports, JS errors.
- `cd fastapi && pytest -q` — 2 optional FastAPI fallback tests.
- Example print: `example-tailor-pack.pdf` (sample with intentionally missing fields).

## Next.js + Supabase (optional, not connected)
`next-app` contains typed TS domain, family member/measurement components, protected save route, and Supabase client bootstrap. Deploy ONLY after creating a **new dedicated** FitMyStyle Supabase project and applying `sql/001_familylook_measurements.sql`; RLS enforces account ownership. The Next app has been installed, type checked and production-built. It is **not** the currently deployed static site. See `docs/ATELIER_3.md` for current integration and verification details.

## Optional FastAPI
`fastapi/` supports private PDF generation and an opt-in BFL photography adapter. With no enabled provider/account, image requests return 503 and the local mannequin renderer remains functional.

## Privacy, copyright and children
Avoid photos and excessive personal measurement data. Drawstrings/cords on children's clothes require appropriate review under EN 14682. Measurement descriptions are our own simplified guide, informed by the scope of ISO 8559-1; not a certified replacement for that standard. Template drawings, textile colors and sample lifestyle image are creative/editorial demonstrations, not live sales offers.