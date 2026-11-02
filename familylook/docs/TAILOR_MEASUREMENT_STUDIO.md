# FitMyStyle · FamilyLook Tailor Studio

Independent sewing measurement & production-review dossier, built under `dzimbo78-crypto/fitmystyle-studio` and published only within the **FitMyStyle FamilyLook** Render service. No other repository or B-CORE files touched.

## Live interface

- `/measurements.html`: enter family size (1–8), adult F/M, child or infant, with independent measurements per person.
- 17 illustrated anatomical measurement definitions A–Q, instructions, on-focus diagram, required vs optional fields by garment.
- 8 garment categories, 6 material types, four fits; body measurements and **design ease** separate from seam and hem allowances.
- Real-time completeness checks and plausible-range warnings. Missing values are **not auto-filled** from retail sizing charts.
- Individual tailor cards, family booklet (A4, one card per person), print/save as PDF, and structured JSON.
- Guest-only in `sessionStorage`, explicit reset button, no automatic upload/supplier dispatch. PDF/JSON exported to disk persist until the user deletes them.
- PDF printable manual `instrukcja-pomiarow.pdf`, 4 pages in Polish.
- Code is dependency-free ESM (does not require paid APIs); `build_offline.py` creates standalone HTML with embedded assets and PDF manual.

## Verification

```bash
node --test tests/measurements.test.mjs
python build_offline.py
python tests/browser_smoke.py
```

Test results for this release: 16 domain tests, Playwright desktop and mobile, family PDF generated at A4 with 5 pages (cover + 4 cards), zero browser JS errors, no horizontal overflow in tested viewport.

## Limitations

This is an **editable measurement dossier**, not an industrial pattern generator, seam grading software or certified garment simulation. Body measurements and approximate size/ease must be checked by a qualified pattern maker. Textile shrinkage, actual stretch, stitching and child-specific garment safety must be assessed by the real factory before production.

PDF export uses native browser printing: choose **Save as PDF**. Works offline in the standalone HTML. Print dialog may require permission for popups.

`sql/002_tailor_measurements.sql` is a future dedicated authenticated persistence migration (not activated), and `next-app/lib/tailor-types.ts` supplies typed client model contracts. Do not enable online accounts until a separate Supabase project and privacy flows are properly configured.

Reference: [ISO 8559-1:2017, anthropometric definitions](https://www.iso.org/standard/61686.html) (not a claim of ISO certification).