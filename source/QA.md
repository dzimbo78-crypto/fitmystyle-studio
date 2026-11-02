# FitMyStyle Studio 9.0 — QA evidence

Date: 2026-11-02. Repository and deployment are exclusively FitMyStyle.

## Automated tests
- `node --test tests/*.test.mjs`: **122 passed, 0 failed** locally.
- Browser verification: Chromium via Playwright loading the generated standalone HTML directly; both 1440×900 and 390×844 viewports.
- Passed: landing family-count update, palette changes without navigation, persistent public header when entering studio, no unexpected sidebar, cloth types and seam settings, front/back rotation, matching measurements display, return to landing, no JS page errors and no page horizontal overflow.
- Additional browser checks: distinct render for shirt/hoodie, change to child/oversize, save A/B configurations, JSON technical-pack download with NOT_APPROVED status, pop-up printable technical sheet, 270° side view, legal summary opening.

## Scope and exclusions
- No real fit-validation or sewn prototype testing was performed. The shaded garment viewer is a stylized parametric representation, not physically based cloth draping or a photorealistic supplier product.
- Existing draft patterns are not production-approved; garment dimensions use predefined design-ease assumptions and are not verified pattern grading.
- Live supplier stock, affiliate contracts, automated checkout, shipping, refunds and online authentication remain unconfigured.
- Automated/browser tests are not a guarantee that every combination or all devices are fault-free.
- A guest session can be restored by some browsers; manual session clearing is present.