# FamilyLook Studio — architektura izolowana

```
FitMyStyle homepage (existing Render static service)
  ↳ link to dedicated FamilyLook Render Static Site
      ↳ Browser guest (sessionStorage, no paid AI)
      ↳ SVG base garment templates (20)
      ↳ Family planner (adult/child/infant, 1–12 persons)
      ↳ 13 body measurement guides per person
      ↳ Tech Pack preview / print-to-PDF / JSON / draft email

For future deployment only:
Next.js 16 + React 19 + Tailwind 4 (separate server-capable deployment)
      ↳ Supabase Auth (magic link) + RLS private family_projects
      ↳ FastAPI (optional PDF provider and AI 503 fallback)
      ↳ provider adapter requires verified product SKU/variant/print areas
```

The browser implementation is **live-capable without credentials**. The Next.js source is typed, and its backend/login require separate infrastructure before any production claim. No external shop or manufacturer credentials are embedded. Payment endpoints do not exist.

### Production entities and invariants

- `FamilyProject` has 1–12 `FamilyMember` records.
- Every member owns independently: group (`adult|child|infant`), optionally a body shape category, size label, measurement values, garment ID, and artwork layer.
- A garment must explicitly support that member's group.
- Measurements are always centimetres of a human body. Garment ease is separately labelled.
- An absent measurement must remain `null`/blank; never synthesized.
- `TechPack` requires operator confirmation even with complete body measurements.
- Saved user projects: only authenticated `user_id` can read/update/delete via RLS.
- Supplier dispatch is disabled. Adapter drafts have null external IDs by design.

### Follow-on work, not simulated as completed

1. Production-qualified sewing pattern system with notches, seam lines, grading, fabric tests and prototype approval.
2. Dedicated Supabase instance, verified auth redirects, deletion/retention workflows, two-account cross-access tests.
3. Verified Printify/Gelato catalog mapping and print areas per size, manufacturer approval, commercial terms.
4. Separate FastAPI deployment, rate limiting, PDF job quotas, storage retention, monitoring and traceable tech-pack versions.
5. Optional editorial AI imaging with opt-in, model/provider agreement, budget limits and clear synthetic-image labelling.

### Current privacy design

Names may be nicknames. Ages are optional and represented in months, not dates of birth. Guest session data never leaves the browser without deliberate user export or preparing a local mail draft. Never enable silent analytics on body or child measurements.