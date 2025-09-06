# App Spec — Singles (One Page per Section)
**Version:** 0.1 • **Owner:** @ryan • **Status:** Proposed  
**App path:** `apps/singles` _(if your folder is `apps/sections`, note that here and we'll rename later)_

## 1) Purpose
Isolate each section on its own page for focused development, testing, and performance checks.

## 2) Scope
- One HTML entry per section, each with:
  - **Intro** (≥100–120vh), **Scrollytell**, **Outro** (≥100–120vh).
- Each page imports only its section (no cross-section deps).

## 3) Behavior
- Mount the section to `#scrolly-root`.
- Must not crash if env token is missing; show the section's "token missing" overlay.
- Reduced-motion shows non-animated fallback where applicable.

## 4) Build & Routing
- Vite multi-page: each page emitted as its own HTML file in `dist/`.
- Recommend file naming: `pages/<section>.html` + `src/<section>.ts`.

## 5) Performance & A11y Budgets
- Initial JS per page (br): ≤ 75–100 KB (excluding lazy vendor chunks).
- Respect `prefers-reduced-motion`.

## 6) Acceptance Criteria
- AC1: Dev server opens a specific page (e.g., `trail-scrub`) with 0 console errors.
- AC2: Build emits `dist/<section>.html` + its chunks.
- AC3: Network panel shows only that section's code/CSS loading.
- AC4: Intro/Outro present on every page.

## 7) Commands
```bash
pnpm -F apps/singles dev
pnpm -F apps/singles build
```

## 8) Change Log
v0.1: Initial spec

## Page recipes
- Trail Scrub → [singles/singles-trail-scrub.md](singles/singles-trail-scrub.md)
