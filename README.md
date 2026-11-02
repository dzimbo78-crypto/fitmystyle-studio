# FitMyStyle Studio 10.0 — Textile Atelier

Independent customer-facing prototype, deployed only to `dzimbo78-crypto/fitmystyle-studio` and the corresponding **FitMyStyle-only** Render static service. No access to or data sharing with B-CORE, TradePilot or any other project.

## Changes

- Auto rotation repaired; time-based 24-26 FPS render loop, `aria-pressed`, stop/restart and controlled 360° orbit.
- Two framing modes: garment closeup (default) and complete mannequin. 21 vector textile swatches (20 original motifs and solid), projected onto garment mesh. 7 new knitwear/sweatshirt garment presets plus existing categories.
- New soft fabric shading, loft sampling density, fit/material options and a product-oriented zoom.
- Manual **admin-only** production enquiry, no payments, no automatic factory order. The form uses FormSubmit, a third-party service requiring administrator email confirmation on first use. Optional direct `mailto:` and JSON export remain as fallbacks. Form body measurements are excluded by default; separate opt-in is required to include them.
- Extended conceptual technical pack with chosen textile motif, product colour, seam recommendations and sample/label-compliance checks.

## Important commercial limitations

The preview is procedural 2.5D canvas software and is **not** a physical fabric drape simulator, validated garment grading system, or manufacturer's exact purchasable product. Apparel visuals, patterns and dress sizes still require supplier verification, sample sewing and physical fit checks. Mockups represent original *concepts*, not existing verified products.

**Email activation:** the first submission to FormSubmit's independent address endpoint needs the recipient to confirm the link received by email. Until this has happened, do not call the workflow a delivered customer order. Never confuse an admin enquiry with a placed factory order or a paid checkout.

**Customer privacy:** form fields are sent only if the user checks explicit consent. The service processes personal contact data; confirm provider's data processing terms and supply a production privacy notice before public marketing. Do not attach sensitive measurements without a separate opt-in. This site does not store requests in a database.

## Development and tests

```
node --test tests/*.test.mjs
node scripts/build.mjs
node scripts/build-offline.mjs
```

After new commits, Render auto-deploys the existing independent static website. Root `index.html` for Render is the self-contained offline build with all assets embedded; the complete modular source and tests are stored separately in `source/`.

## Retail/producer readiness

No checkout, payment collection, verified live stock, automated supplier order, photo-realistic fit guarantee or certified sewing patterns. In the EU, the fibre composition must be disclosed before online purchase under Regulation 1007/2011; safety requirements for children's clothing must be assessed (e.g. EN 14682 on drawstrings). Only publish confirmed supplier data as real products.