# FamilyLook Studio — photographic garment templates

The public static application at `familylook/site` uses 20 original AI generated garment atlases, each showing front and back. It does not request paid image generation when a customer changes a color, motif or print. The library displays 40 optimized photographic views rather than procedural mannequin thumbnails. All library cards and the product studio map to the same T01–T20 identifiers.

## Rendering

`photo-catalog.mjs` describes each template, construction details and approximate print placement. `photo-engine.mjs` loads a 1600 × 800 WebP atlas and a separate cleaned alpha mask, recolors its luminance while retaining folds and stitches, applies a deterministic motif and composites the customer design. Narrow strips follow luminance gradients to approximate the print passing over creases. This is a visual approximation, not a calibrated displacement or cloth simulation.

Text, uploaded images, monograms and badges share `design-layer.mjs` with the existing 3D preview. Print and embroidery appearances are local preview effects; no embroidery machine file is produced. Prepared bases and colorized layers use bounded caches. Stale asynchronous draws are discarded. Image failures show the unpersonalized base and offer the existing 3D view.

`photo-studio.mjs` provides family boards, individual products, front/back/both, a material close-up, frozen A/current B comparison, independent colors and motifs, per-layer switches, eight text presets, three typefaces, print movement and PNG export. The static app adds bounded undo/redo and JSON roundtrips. PNG mockups and clean SVG artwork remain separate exports.

## Assets

`tools/build-photo-assets.mjs` accepts a JSON array of `{id,path}` pointing to the original generated PNG files. It requires Sharp from the Next.js application dependencies. It resizes the images, removes detached alpha components separately on each side, writes the atlas, mask and catalog thumbnails, and records crop bounds and coverage in `assets/photo-v4/manifest.json`. Catalog photographs use one neutral color to make construction differences easier to compare. Original generated files are retained separately; no competitor product photographs are copied.

| Range | Garments |
| --- | --- |
| T01–T03 | Regular, oversized and relaxed tees |
| T04–T07 | Regular and oversized sweatshirts, hoodie, zip hoodie |
| T08–T12 | Fine knit, cable knit, ribbed turtleneck, half-zip, cardigan |
| T13–T15 | Oxford shirt, linen overshirt, polo |
| T16–T18 | Joggers, relaxed trousers, dress |
| T19–T20 | Infant wrap bodysuit and two-piece set |

## Data and backend

The existing Next.js TypeScript component now hosts the same photo studio. `PreviewStyle` includes motif scale/visibility and `ArtworkLayer` includes font, composition, technique and visibility. Runtime validation bounds these values before the existing authenticated Supabase project endpoint persists the configuration JSON. The tailoring profile bridge preserves photo controls while keeping actual measurements separate from illustrative defaults.

The public Render service remains a static guest application. This release does not activate Supabase accounts, a remote try-on model, payments, email or supplier order dispatch. The existing optional Supabase/FastAPI scaffolds remain available in the repository. Supplier variants and print areas still require real provider mappings and approval.

## Accuracy

These are realistic conceptual garment mockups, not photographs of verified supplier products. Changing a declared size does not reshape the photographic base. Measurements affect the optional 3D mannequin proportions; neither view predicts actual fit, drape, colors on a physical garment or printing results. Print locations are approximate and supplier files are marked DRAFT. White garments are recolored as a whole, so trim, buttons and zippers are conceptually recolored too. All-over motifs simulate a visual layer and do not generate cut-and-sew pattern pieces.

## Validation

- Node tests cover all 20 atlases, 40 unique image views, crop and mask bounds, textile shading, 20 distinct motifs, cache inputs, safe print exports, project/tailoring roundtrips and undo/redo.
- Next.js contract tests cover retention and validation of photo controls through the Supabase payload shape.
- Browser QA rendered all 20 templates on both sides, exercised color/motif/design edits, A/B comparison, undo/redo and a 2800 × 1640 front/back PNG export.
- Mobile QA uses a 375 px content viewport. Publication checks include the live library and product preview.

Workflow inspiration: [Customily masks](https://help.customily.com/articles/8824001662-using-masks-in-your-product-base-mockups), [Customily POD product bases](https://help.customily.com/articles/7339922770-how-to-create-a-simple-pod-product-base), [Printful mockups](https://help.printful.com/hc/en-us/articles/50264186389393-What-are-mockup-images). The implementation and generated assets are original.
