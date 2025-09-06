# Singles Page Recipe — Trail Scrub
**Owner:** @ryan • **Status:** Draft  
**App page:** `apps/singles/pages/trail-scrub.html`  _(if your folder is `apps/sections`, note that path)_  
**Relates (canonical spec):** ../../sections/trail-scrub.md

## Purpose
One-page Trail Scrub for focused development, QA, and performance checks—without interference from other sections.

## Inherits
This page **inherits the full API, behaviors, and Acceptance Criteria** from the canonical section spec:  
→ See **Trail Scrub Spec**: [../../sections/trail-scrub.md#acceptance-criteria-ac](../../sections/trail-scrub.md#acceptance-criteria-ac)

> If a change is needed to section behavior or API, **update the section spec**, not this page. This recipe only adds page-level context.

## Page-specific details (add-only)
- **Layout:** **Intro (≥120vh)** → **Scrollytell** (mount target below) → **Outro (≥120vh)**
- **Mount target:** `#scrolly-root`
- **Data:** `/data/trails/highland-mary.geojson`  
  _Place a copy under the singles app public folder, e.g._ `apps/singles/public/data/trails/highland-mary.geojson`.
- **Token source:** `.env` → `VITE_MAPBOX_TOKEN` (non-crashing overlay when missing)
- **Camera:** fit trail bbox with ~10–12% padding; optional bearing ≤ 20°, pitch ≤ 45°
- **Style:** 3–4 px trail line; accent color; gradient over `["line-progress"]`
- **Marker:** optional; if enabled, moves via `turf.along(totalLen * progress)`

## Reduced Motion
- Show full trail statically; marker hidden or static. No scrub animation.

## Additional ACs for this single page
- **S1:** Page loads with **0 console errors** (token present or not)
- **S2:** Network panel shows only **Trail Scrub** JS/CSS chunks
- **S3:** Intro/Outro heights meet spec (≥120vh each)
- **S4:** Mount is idempotent at `#scrolly-root` (no duplicate DOM on re-entry)

## Version parity
- `sections/trail-scrub.md`: v0.1  ← **canonical**
- `apps/singles/singles-trail-scrub.md`: v0.1 (extends)

## Pointers for implementation (non-normative)
- HTML scaffold lives at `apps/singles/pages/trail-scrub.html` with the three sections.
- Entry script `apps/singles/src/trail-scrub.ts` imports `@scrolly/trail-scrub` and calls:
  ```ts
  import * as TrailScrub from '@scrolly/trail-scrub';
  const handle = TrailScrub.createSection();
  handle.mount({ target: '#scrolly-root', css: 'lazy' /*, trailDataUrl: '/data/trails/highland-mary.geojson'*/ });
  ```
- Keep copy minimal; this page is for QA/perf checks rather than editorial.
