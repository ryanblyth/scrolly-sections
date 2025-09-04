# Section Spec Template — Scrollytelling Sections Library
**Version:** 0.1 • **Owner:** @ryan • **Status:** Draft  
**Package:** `@scrolly/<section-name>`

## 1) Summary
Concise description (1–3 sentences) of what this section does and the story it supports.

## 2) Scope
- In-scope behaviors and interactions.
- Out-of-scope (explicitly list to prevent scope creep).

## 3) User Story & Narrative
- Primary user story / goal.
- Narrative steps the user will experience while scrolling or interacting.

## 4) Dependencies
- Libraries (e.g., Mapbox GL, GSAP, Turf) and exact packages used.
- External data assets (e.g., GeoJSON paths) and expected size.
- Feature flag(s) or env vars (if any).

## 5) DOM Contract
- **Mount target**: CSS selector or element.
- **Generated markup**: outline of container elements/classes.
- **CSS namespace**: prefix classes with `.scrolly-<section>-...`.
- **Required container sizing** (e.g., pinning, min-heights).

## 6) Public API (must implement)
```ts
export type SectionOptions = {
  target: string | Element;         // mount target
  css?: boolean | 'lazy';           // feature CSS loading strategy
  prefersReducedMotion?: boolean;   // override OS setting
  // + section-specific options here ...
};
export type SectionHandle = {
  mount(opts: SectionOptions): Promise<void>;
  unmount(): Promise<void>;
  isMounted(): boolean;
};
export declare const createSection: () => SectionHandle;
```

## 7) Styles (SCSS)
- Use `@use/@forward`; import shared tokens from `packages/sections/_design-system`.
- Keep global resets in apps; scope section CSS to its namespace.
- If `css: 'lazy'`, the section must be able to inject its CSS on first mount.

## 8) Performance & A11y Budgets
- **Initial app entry** (not section): JS ≤ 75–100 KB br; CSS ≤ 50–80 KB br.
- **This section**:
  - Avoid long tasks > 200 ms during scroll.
  - Respect `prefers-reduced-motion` with non-animated fallback.
  - Smoothness target: 55+ fps desktop, 30+ fps mid-range Android (guideline).

## 9) Build Outputs
- **ESM**: `dist/index.es.js` (tree-shakable import for apps).
- **IIFE**: `dist/index.iife.js` exposing `window.Scrolly<PascalName>.mount(...)` for CMS embeds.
- Extracted CSS asset if styles present.

## 10) Acceptance Criteria (AC)
- **AC1 (API):** Exports `createSection()` → handle with `mount/unmount/isMounted` (idempotent).
- **AC2 (CSS):** All classes scoped to `.scrolly-<section>-*`; no global leakage.
- **AC3 (Lazy):** Supports `css: 'lazy'` and eager CSS import.
- **AC4 (Errors):** Mount on a missing target throws a clear error.
- **AC5 (Reduced motion):** Honors `prefers-reduced-motion` or explicit option.
- **AC6 (Perf):** No long tasks > 200 ms during nominal scroll in demo.
- **AC7 (Build):** Vite build produces ESM + IIFE artifacts with source maps (dev only).
- **AC8 (Demo):** Demo page loads with zero console errors.

## 11) Test & Verification
- Manual test checklist steps.
- Playwright smoke (optional now, required later): mount → scroll → no console errors.
- Lighthouse CI budgets (only in kitchen-sink).

## 12) Risks & Mitigations
- List likely failure modes and how we’ll detect/mitigate (e.g., heavy per-frame work).

## 13) Rollout / Lifecycle
- States: Draft → Demo-Ready → Library-Ready → Deprecated.
- Promotion checklist (tick when promoting to Library-Ready).

## 14) Appendix (Data, diagrams, links)
- Data contract examples, reference diagrams, external references.
