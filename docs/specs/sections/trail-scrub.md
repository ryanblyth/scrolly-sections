# Section Spec — Trail Scrub
**Version:** 0.1 • **Owner:** @ryan • **Status:** Draft  
**Package:** `@scrolly/trail-scrub`

**Used by:** Singles page recipe → [apps/singles/singles-trail-scrub.md](../apps/singles/singles-trail-scrub.md)

## 1) Summary
Scroll-scrubbed trail “draw” effect on a Mapbox map. As the reader scrolls, the trail reveals along its path; optionally a marker moves along the line.

## 2) Scope
**In-scope**
- Mapbox GL JS vector map with trail line reveal using `["line-progress"]` + `line-gradient`.
- Optional moving marker (`turf.along`) synchronized to scroll.
- Reduced-motion fallback: full trail visible; marker static; no scrub.
- Lazy initialization when section is near viewport.

**Out-of-scope**
- Multi-trail choreography (handled by app-level orchestrator).
- Data fetching beyond local static GeoJSON files.
- Camera fly-through cinematics (later RFC).

## 3) User Story & Narrative
As a reader, I scroll through the story; when I reach the trail section, the trail “draws” from start to end, optionally following the camera lightly.

## 4) Dependencies
- `mapbox-gl` (runtime), `gsap` (ScrollTrigger), `@turf/along`, `@turf/length`, `@turf/bbox` (modular imports).

## 5) DOM Contract
- Mount target: a container with id or class passed in `options.target`.
- Generated markup inside target:
  - `.scrolly-trail-scrub` root
  - child container for the map canvas
  - optional UI labels/legend
- Container sizing: reserve at least `120vh`; pinning handled by the section.

## 6) Public API
```ts
export type SectionOptions = {
  target: string | Element;
  css?: boolean | 'lazy';
  prefersReducedMotion?: boolean;
  trailDataUrl?: string; // URL to GeoJSON FeatureCollection<LineString>
};
export type SectionHandle = {
  mount(opts: SectionOptions): Promise<void>;
  unmount(): Promise<void>;
  isMounted(): boolean;
};
export declare const createSection: () => SectionHandle;
```

## 7) Styles (SCSS)
- Use namespace `.scrolly-trail-scrub-*` only.
- Minimal base styles for container/pinning; no global resets.

## 8) Performance & A11y Budgets
- Throttle expensive map updates; avoid work in hot `onUpdate` loop.
- Respect `prefers-reduced-motion`.
- Verify demo smoothness targets where possible.

## 9) Build Outputs
- ESM: `dist/index.es.js`
- IIFE: `dist/index.iife.js` (`window.ScrollyTrailScrub.mount(...)`)
- CSS asset emitted on build

## 10) Acceptance Criteria (AC)
- **AC1 (API):** Exports `createSection()`; mount/unmount/isMounted idempotent.
- **AC2 (Data):** Validates GeoJSON: single Feature, LineString, `[lng,lat]`, ≥ 50 vertices, length within 6–14 km (configurable).
- **AC3 (Render):** Uses Mapbox `lineMetrics:true`; reveal via `line-gradient` over `["line-progress"]`.
- **AC4 (Marker):** Marker position from `turf.along(totalLen * progress)` (if enabled).
- **AC5 (Reduced):** Reduced-motion shows full trail; disables scrub/marker animation.
- **AC6 (Build):** Produces ESM + IIFE + CSS; no console errors in demo.
- **AC7 (Lazy):** Section can lazy-load CSS when `css:'lazy'`.
- **AC8 (Perf):** No long tasks > 200 ms during scroll in demo scenario.
- **AC9 (Errors):** Clear overlay/log when data invalid (dev only).

## 11) Test & Verification
- Manual:
  1. `pnpm -F apps/kitchen-sink dev` → scroll to section → trail reveals.
  2. Toggle reduced-motion → static trail.
  3. Missing target → throws.
- (Later) Playwright smoke for mount/scroll and console cleanliness.

## 12) Risks & Mitigations
- Heavy per-frame updates → throttle; precompute geometry length once.
- Data from OSM split across segments → stitch offline or validate failure states.

## 13) Rollout / Lifecycle
- Draft → Demo-Ready after AC1–AC7 met; Library-Ready after AC8–AC9 & smoke tests.

## 14) Appendix
- Sample data path: `/data/trails/highland-mary.geojson` (in app public folder)
- Overpass query & stitching notes (see data-pipeline doc)
