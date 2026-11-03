# FamilyLook Atelier 3 — implementation and deployment

The public, existing Render app still serves `familylook/site/`. It does not require account credentials, a paid AI provider, an order API or payment keys.

## Delivered guest studio

- Twenty persistent garment templates share one local mannequin generator. Adults, children and infants have different proportions; skin and garment colors are independent.
- WebGL uses Three.js 0.187.0 (vendored, MIT), smooth normals, textile normal maps, physical cloth materials, three studio lights and shadows. A second Canvas renderer uses the same garment meshes when WebGL is unavailable.
- Front/back/side, auto-rotation, manual drag, keyboard rotation, zoom, individual focus and PNG export. Animation pauses outside the viewport or in a hidden tab and starts only on request.
- Twenty original procedural textile patterns; color, material pattern and print are separate layers. Lettering and locally imported artwork use a curved surface on the garment. A raster image is not regenerated on edits.
- Four coordinated collection presets respect infant-compatible garments. Per-person color overrides can be restored to the shared palette.
- Project JSON includes the independent artwork layer; importing restores the project. Attached artwork is embedded only in an explicit JSON download, not saved in session storage.
- Explicit bridge between the visual studio and detailed measurement editor: exact template ID, skin, pattern, fit, palette, names and actual measurements survive navigation. Both support 1–12 people and individual adult silhouettes.
- Draft SVG print file for the selected person, physical print area in millimetres, 300 DPI pixel requirements and a separate provider manifest. Neither export invents a supplier SKU or dispatches an order.
- PWA manifest and same-origin static cache; API responses and authorized requests are excluded. Online navigation uses the network first.

The collection editorial `site/assets/collection-studio-v3.webp` was generated once using the built-in ImageGen tool. Brief: full-body Scandinavian studio family in blank sage crewneck, espresso knit, off-white child tee and infant wrap body; warm studio lighting, realistic fabric, no text or logos. It is inspiration, not a live try-on result. The editable 3D models remain procedural mannequins, not scans or validated cloth simulation.

## Typed React / Next.js client

`next-app/` is a separate, buildable React/Next.js/Tailwind implementation with:

- `FamilyBuilder`, `MannequinViewer`, `FamilyMeasureForm`, `MeasurementWizard`, `AccountPanel`, `TechPackPreview`, `VirtualTryOnPanel`;
- shared studio assets copied by `scripts/sync-studio.mjs` before development/build, and a generated typed catalog from the static studio's domain;
- server-side runtime validation of unknown JSON, independent of TypeScript;
- `GET /api/projects` and `POST /api/projects` using a verified Supabase JWT, explicit owner filters, RLS and affirmative cloud-save consent;
- an optional optimistic-update guard (`id` plus `expectedUpdatedAt`) so concurrent changes are not silently overwritten;
- server-only API proxies for optional photography and PDF generation.

Use Node >=22.18, `npm ci`, `npm test`, `npm run build`. All three checks were run for this release. This Next.js server is not the existing static Render workload and has not replaced it.

## Supabase

No Supabase account or database was provisioned, and no migration was executed. When connecting a dedicated FitMyStyle Supabase project, apply `sql/001_familylook_measurements.sql` for owner-scoped projects and optionally `sql/003_private_artwork.sql` for a private artwork bucket. Add only the project URL and publishable/anon key to the browser environment. Never expose a service-role credential. Cloud save is disabled until configured.

## Optional FastAPI

`fastapi/` provides a private `/v1/tech-pack.pdf` endpoint with embedded DejaVu fonts and proper Polish characters. Actual body measurements remain distinct from preliminary ease and garment targets. Missing values stay blank; a human pattern maker must approve the sample and pattern.

`POST /api/visualize` uses the documented BFL `flux-2-pro` submit/poll flow. It requires all of: an explicit `FAMILYLOOK_AI_ENABLED=true`, `BFL_API_KEY`, and a private backend token of at least 32 characters. The Next server passes the token; the browser never sees it. Only group, silhouette category, garment and palette descriptions are sent, without names, body measurements or photos.

Local 3D remains available for disabled/unreachable AI, provider limits or generation failures. Repeated identical requests reuse a short-lived result. The default process-wide budget is six submissions/hour and only one concurrent request. This in-memory guard is for a single instance: use a persistent shared rate/quota store before multiple workers or public paid access. No actual paid provider call was made while building or testing this release.

Reference contracts checked:
- https://threejs.org/docs/pages/MeshPhysicalMaterial.html
- https://supabase.com/docs/reference/javascript/auth-getuser
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bpro%5D
- https://docs.bfl.ai/api-reference/utility/get-result

## Verification and practical limits

- Main FitMyStyle: 128 Node tests.
- FamilyLook and cross-editor roundtrip: 44 Node tests.
- Typed contracts and exact provider variant checks: 5 tests.
- FastAPI fallback, authorization, provider URL guard, reuse/quota, PDF and request limits: 8 tests.
- Next.js production build and type checking pass.
- Browser QA exercises the software renderer because this cloud browser disables WebGL. WebGL rendering is implemented but could not be visually tested in this environment; a physical-device GPU pass remains a release limitation.
- A sample two-person PDF was rendered and visually checked; missing fields remain blank.
- Garments, colors, fit and printed placement are conceptual previews. Physical drape, seam construction, material shrinkage, size grading and manufacturer print zones require physical sampling and verification.

Payments and automatic supplier submission are not connected. Nothing in this release claims that a production order or email has been delivered.
