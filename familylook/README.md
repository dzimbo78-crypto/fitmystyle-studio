# FitMyStyle — FamilyLook Studio / Tailor Edition

A **new module** exclusively for `dzimbo78-crypto/fitmystyle-studio`. It shares no data, secrets, code or deployments with B-CORE or any other project.

## Live-capable static module

`site/` is a self-contained, responsive web app with no paid external API:
- Family builder for **1–12 people**: adult, child, infant; optional body-shape category and size label.
- **13 step-by-step body measurement guides**, clickable silhouette indicator, validation and per-garment required measurements.
- **20 original vector garment silhouettes**; coordinated colors, garment-specific fit/ease and optional print-text overlay.
- Explicit **body measurement vs finished garment measurement** distinction.
- Printable **A4 tailor Tech Pack** with one card per person, full measuring instructions, missing values, seam assumption, material and prototype review checklist.
- JSON project export/import; guest `sessionStorage` privacy; local mail draft for admin, **no live order**.

Run locally with `python -m http.server 8080 --directory site`, or use `FamilyLook_Studio_Atelier_OFFLINE.html`. Print-to-PDF from the UI. Example backend PDF at `examples/FamilyLook_TechPack_przyklad.pdf`.

## Optional backends

- `next-app/`: React 19, Next.js 16, Tailwind 4, TypeScript components, optional Supabase Auth and private saves. Not live or validated by a full Next.js dependency build yet.
- `sql/001_familylook.sql`: independent Supabase database with per-owner row-level security. Do not apply to any existing project.
- `fastapi/`: standalone PDF generator, draft provider mapping and explicit 503 fallback for unconfigured AI. No payment or production dispatch.

## Test

```bash
node --test tests/*.test.mjs
cd fastapi && pytest -q
python tools/build-offline.py
```

A browser smoke test can be run using Playwright Chromium against the self-contained offline HTML. Test measurement entry, family count, gallery, technical cards, PDF and empty-field warnings.

## Safe scope / manufacturing status

This is a professional **measurement capture, planning and documentation** layer, **not** production-certified CAD. Fit allowances are initial assumptions, not standardized sizing or validated patterns. A qualified pattern maker must approve templates and sew test garments. Real product availability, purchase, checkout, and manufacturer dispatch are not active.

See `docs/POMIARY_I_PRODUKCJA.md` and `docs/ARCHITECTURE.md`.