# App Spec — Kitchen Sink (All Sections Together)
**Version:** 0.1 • **Owner:** @ryan • **Status:** Proposed  
**App path:** `apps/kitchen-sink`

## 1) Purpose
Demonstrate and validate multiple sections running together on one page, exercising composition, lazy loading, and budgets.

## 2) Scope
- Compose any subset of sections using the orchestrator from `@scrolly/lib`.
- Provide a representative, scrollable narrative.
- Exclude: deep content authoring; this is a technical showcase.

## 3) Behavior & Composition
- Each section mounted via orchestrator.
- Sections must not conflict in CSS or global listeners.
- Map tokens come from `.env` (`VITE_MAPBOX_TOKEN`); if missing, sections show a non-crashing overlay.

## 4) Performance & A11y Budgets
- Entry JS (br): ≤ 75–100 KB (sections and heavy vendors lazy loaded).
- Respect `prefers-reduced-motion`.
- No long tasks > 200 ms during scroll.

## 5) Acceptance Criteria
- AC1: App builds and runs with 0 console errors.
- AC2: Can mount 2+ sections without visual/CSS conflicts.
- AC3: Budgets documented and checked (manual, Lighthouse later).
- AC4: Works with and without env token (overlay path).

## 6) Commands
```bash
pnpm -F apps/kitchen-sink dev
pnpm -F apps/kitchen-sink build
```

## 7) Change Log
v0.1: Initial spec
