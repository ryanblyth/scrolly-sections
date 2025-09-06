# Project Operating Spec — Scrollytelling Sections Library
**Version:** 0.1 • **Owner:** @ryan • **Status:** Proposed  
**Repo(s):** `scrollytelling-poc` (primary). Optional source repos: `trail-scrub-poc`, others.

## 1) Purpose & Scope
Create a reusable, a-la-carte library of scrollytelling “sections” (e.g., Trail Scrub, Photo Pan/Zoom, Stat Counters) that:
- Run **standalone** for demo/dev
- Compose **reliably** into a single page/app
- Ship as **ESM** for apps and **IIFE** for CMS/Webflow embeds
- Are built **spec-first** (docs drive code), using **Vite + TypeScript + SCSS**

**Non-goals (for now):**
- Server rendering or SSR frameworks
- Design system theming beyond tokens/mixins
- Cross-page routing; this is section-centric

---

## 2) High-Level Outcomes (Acceptance)
- **A1.** Each section builds as **standalone demo** (Vite dev + build) and exports a **standard mount API**.
- **A2.** A “**kitchen-sink**” app mounts any subset of sections together without conflicts (JS/CSS).
- **A3.** A **library** package re-exports sections for app use; **IIFE bundles** exist for CMS embeds.
- **A4.** Docs-first workflow is enforced: every feature PR links a spec or ADR and passes budgets/tests.

---

## 3) Repository Layout (Workspaces)
Use a single repo with workspaces (pnpm or npm).

```
scrollytelling-poc/
  apps/
    kitchen-sink/                 # demo app that mounts any combination of sections
  packages/
    sections/
      _design-system/             # shared tokens/mixins (SCSS) and shared types
      trail-scrub/                # section A
      photo-panzoom/              # section B
      stat-counters/              # section C
      ...                         # more sections as subpackages
    lib/                          # thin re-export + orchestrator for composition
  docs/
    adrs/                         # tiny decision records
    rfcs/
    specs/
      library/                    # library-wide spec(s)
      sections/                   # one spec per section
    workflow.md
  .github/
    ISSUE_TEMPLATE/
    pull_request_template.md
  package.json
  pnpm-workspace.yaml
```

**Acceptance for layout**
- **L1.** `pnpm -w i && pnpm -w build` builds all packages and app.  
- **L2.** Each section has `dev`, `build`, and `preview` scripts; `apps/kitchen-sink` consumes local packages.

---

## 4) Standard Section API (Contract)
All sections implement the same minimal API for predictable composition.

```ts
// packages/sections/<name>/src/index.ts
export type SectionOptions = {
  target: string | Element;            // mount target
  css?: boolean | 'lazy';              // auto-attach CSS (false|true|'lazy')
  prefersReducedMotion?: boolean;      // overrides OS setting
  // + section-specific options
};

export type SectionHandle = {
  mount(opts: SectionOptions): Promise<void>;
  unmount(): Promise<void>;
  isMounted(): boolean;
};

export declare const createSection: () => SectionHandle;
// ESM default export also re-exports types
```

**Acceptance for API**
- **S1.** `createSection()` exists and returns a handle with `mount/unmount/isMounted`.  
- **S2.** Mount is **idempotent**; calling twice doesn’t duplicate DOM/layers.  
- **S3.** When `css: 'lazy'`, feature CSS loads on first mount; otherwise global import is supported.

---

## 5) Build Targets & Bundling
Each section builds to:
- **ESM**: for app imports (tree-shakable)
- **IIFE**: single-file embed (`window.Scrolly<Name>.mount(...)`)
- Extracted CSS (global and/or feature chunk)

**Vite baseline**
- TypeScript strict; SCSS with `@use/@forward`
- Manual vendor chunks for heavy libs (Mapbox, GSAP, Turf) where applicable
- Source maps in dev only

**Acceptance for bundling**
- **B1.** `dist/` contains `index.es.js`, `index.iife.js`, and `style.css` (if any).  
- **B2.** IIFE exposes `window.Scrolly<Name>.mount(selector, opts)`.  
- **B3.** Library package re-exports section ESM and provides a tiny **orchestrator** to mount multiple sections with **IntersectionObserver**-based lazy init.

---

## 6) CSS Strategy (SCSS Modules)
- Shared tokens/mixins in `packages/sections/_design-system` using **`@use/@forward`**.
- Each section ships its own SCSS. Feature CSS can be:
  - **Eager**: imported by the host app
  - **Lazy**: injected on mount (for embeds)

**Acceptance for CSS**
- **C1.** No global class leakage: sections prefix classes (e.g., `.scrolly-<name>-...`).  
- **C2.** Minimal global base styles live in kitchen-sink app only.  
- **C3.** Layout stability: pinning/containers reserve space to avoid CLS.

---

## 7) Performance, Accessibility, and Quality Budgets
**Initial app (kitchen-sink) targets**
- JS entry (br): ≤ **75–100 KB**; heavy libs lazy-loaded per section
- CSS entry (br): ≤ **50–80 KB**
- LCP (mobile): ≤ **2.5 s**
- No long tasks > **200 ms** during scroll

**Section runtime**
- Respect `prefers-reduced-motion`
- Avoid heavy work in per-frame callbacks; throttle map updates if needed

**Acceptance**
- **P1.** Lighthouse CI budgets file passes on `apps/kitchen-sink`.  
- **P2.** Each section’s demo meets its spec’s perf & a11y ACs.  
- **P3.** `prefers-reduced-motion` verified (fallback behavior present).

---

## 8) Docs-First Workflow
- **Specs** live under `docs/specs/sections/<name>.md`, `docs/specs/apps/<name>.md`, and `docs/specs/library/library.md`.
- **ADRs** (≤10 lines) in `docs/adrs/####-<slug>.md`.  
- PRs must link relevant spec/ADR and tick acceptance boxes.
- **Specs Index**: See `docs/specs/README.md` for navigation.

**App specs:**
- `docs/specs/apps/kitchen-sink.md` — specification for the comprehensive "all sections together" page
- `docs/specs/apps/singles.md` — specification for the single-section pages app (one page per section, with intro & outro)

**Acceptance**
- **D1.** PR template requires links to spec/ADR and a checklist.  
- **D2.** Merges blocked if no spec link for new features.  
- **D3.** Weekly "spec drift" task (optional): diff contracts vs code.

---

## 9) Testing Strategy (right-sized)
- **Playwright smoke** per section: mount → scroll/interaction → no console errors
- **Unit/logic** (only where it pays): data validators, geometry utilities
- **Kitchen-sink integration**: mounts multiple sections; checks runtime errors & budgets

**Acceptance**
- **T1.** `pnpm -w test` runs section smoke tests headless.  
- **T2.** CI fails on console errors in demo pages.  
- **T3.** Optional: snapshot screenshots for visual drift.

---

## 10) Section Lifecycle
**States:** Draft → Demo-Ready → Library-Ready → Deprecated

**Promotion checklist to Library-Ready**
- Spec ACs met (perf/a11y included)
- API matches contract; idempotent mount/unmount
- CSS scoped & optional lazy injection works
- README inside section with usage examples (ESM & IIFE)
- Demo page recorded (GIF or short clip)

---

## 11) Naming & Conventions
- Packages: `@scrolly/<section-name>` (kebab-case).
- CSS classes: `.scrolly-<section>-<element>`.
- Commits: `spec:`, `adr:`, `feat:`, `fix:`, `docs:`.
- Files: `index.ts` exports public API; internal modules under `src/*`.

---

## 12) Orchestration (Library)
The library package exports:
- All sections (ESM re-exports)
- `createOrchestrator(config)` that:
  - Registers sections with mount targets
  - Uses `IntersectionObserver` with generous `rootMargin` + “jump-past” fallback
  - Optionally injects feature CSS on first mount

**Acceptance**
- **O1.** Kitchen-sink uses orchestrator to mount 2+ sections smoothly.  
- **O2.** Orchestrator works with both ESM and IIFE sections (for parity).

---

## 13) Security & Tokens
- Mapbox tokens are **public** but not committed in plaintext in examples; use `.env.example` and `import.meta.env`.
- IIFE embed reads token from `data-mapbox-token` attribute.

**Acceptance**
- **Sx1.** Example embeds never hardcode a real token.  
- **Sx2.** `.env.example` exists with clear instructions.

---

## 14) Change Management
- **Spec bug** → update spec first; then code.  
- **Implementation bug** → fix code; don’t change spec.  
- **Design change** → change spec first; reference commit in PR.

**Acceptance**
- **CM1.** PR narrative states which category the change falls into.  
- **CM2.** ADR added if a tool/approach choice changes.

---

## 15) Cursor Usage (Guidelines)
- Prompts always link to the relevant spec file(s).
- For new sections, start from the **section template** (provide path).
- For bugs: reference the exact AC (e.g., “AC3 violated”) and request minimal diffs.

**Acceptance**
- **Cu1.** Repo contains a `prompts/` folder with bootstrap prompts for: new section, fix bug, optimize perf.

---

## 16) Initial Artifacts to Create
- `docs/specs/library/library.md` (master library spec)
- `docs/specs/sections/trail-scrub.md` (template; copy for other sections)
- `docs/adrs/0001-bundling-outputs.md` (ESM + IIFE decision)
- `docs/adrs/0002-sections-interface.md` (standard API)
- `.github/pull_request_template.md` (requires spec link + checkboxes)
- `apps/kitchen-sink` scaffold
- `packages/sections/_design-system` (tokens/mixins)
- `packages/sections/<template>` (empty section scaffold)

---

## 17) Budgets File (Lighthouse) — Example
Create `apps/kitchen-sink/lighthouse-budgets.json`:
```json
[{
  "path": "/*",
  "resourceSizes": [
    { "resourceType": "script", "budget": 150 },
    { "resourceType": "stylesheet", "budget": 80 }
  ],
  "timings": [
    { "metric": "interactive", "budget": 4000 },
    { "metric": "first-contentful-paint", "budget": 2000 }
  ]
}]
```

---

## 18) “Done” Definition for This Spec (v0.1)
- [ ] Repo structure laid out as in §3, workspace bootstrapped
- [ ] PR template + workflow doc added (§8)
- [ ] Library spec + one section spec drafted (§16)
- [ ] Kitchen-sink app boots, renders placeholder for 2 sections (§2, §12)
- [ ] CI runs typecheck + tests + Lighthouse budgets (§7, §9, §17)

---

## Appendix A — Glossary
- **Section:** Self-contained scrollytelling component (JS + CSS + DOM contract).
- **Kitchen-sink:** Demo app that mounts any combination of sections.
- **Library:** Package that re-exports sections and provides an orchestrator.
- **ESM/IIFE:** Module build for apps / single-file embed for CMS.
