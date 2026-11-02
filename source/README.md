# FitMyStyle Studio 9.0 — standalone

Independent fashion and family style studio. **Never shares any code, database, secrets or deployments with B-CORE or other projects.**

Features: unified landing-to-studio navigation, interactive home family preview, procedural shaded garment mannequin with rounded shoulder/sleeve profiles, clothing presets, fabric-specific visual drape, front/back/left/right views, adjustable body dimensions, garment ease logic, seam recommendations, A/B comparison, client-side tech pack JSON and print-ready two-view sheet, existing wardrobe, pattern sketches, outfit matching and catalog imports.

Build from this folder: `node --test tests/*.test.mjs && node scripts/build.mjs && node scripts/build-offline.mjs`. No paid keys needed. `index.html` + `src` + images form a modular static site. `FitMyStyle_Studio_8_OFFLINE.html` is the generated single-file release (renamed to v9 after build).

**Not ready for payments or automatic orders:** no active partner catalog, no online auth provider, no print supplier checkout, no certified garment physics. See `LEGAL_READINESS.md`.