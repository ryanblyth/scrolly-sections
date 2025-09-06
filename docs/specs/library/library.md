# Library Spec — Orchestrator (`@scrolly/lib`)
**Version:** 0.1 • **Owner:** @ryan • **Status:** Proposed  
**Package:** `@scrolly/lib` (ESM only)

## 1) Purpose
Provide a tiny orchestrator that mounts scrollytelling **sections** on scroll proximity, with optional **code-splitting** via dynamic import. Keep it framework-agnostic, idempotent, and compatible with both the **kitchen-sink** and **singles** apps.

## 2) Scope
- Manage *when* and *how* sections mount/unmount in the page.
- Lazily load section **code** (via `loader`) and optionally section **CSS** (`css: 'lazy'`).
- Respect reduced-motion and missing-token fallbacks exposed by sections.
- Exclude: routing, content authoring, analytics, or cross-section choreography beyond mount timing.

## 3) API Contract
```ts
// ---------- Section Contract (implemented by each section) ----------
export type SectionOptions = {
  target: string | Element;
  css?: boolean | 'lazy';
  prefersReducedMotion?: boolean;
  [key: string]: unknown; // section-specific options allowed
};

export type SectionHandle = {
  mount(opts: SectionOptions): Promise<void>;
  unmount(): Promise<void>;
  isMounted(): boolean;
};

export type SectionModule = {
  createSection: () => SectionHandle;
};

// ---------- Orchestrator Types ----------
export type OrchestratorItem =
  | { section: SectionModule; target: string | Element; css?: boolean | 'lazy'; prefersReducedMotion?: boolean; rootMargin?: string }
  | { loader: () => Promise<SectionModule>; target: string | Element; css?: boolean | 'lazy'; prefersReducedMotion?: boolean; rootMargin?: string };

export type OrchestratorOptions = {
  items: OrchestratorItem[];
  debug?: boolean;
  preloadMargin?: string; // default '1000px'
};

export type Orchestrator = {
  start(): void;          // attach IOs, lazy-load + mount on intersect
  stop(): Promise<void>;  // disconnect IOs, unmount all (idempotent)
};

// Factory
export function createOrchestrator(opts: OrchestratorOptions): Orchestrator;
```

## 4) Behavior
- Uses **IntersectionObserver** per item with `rootMargin = preloadMargin || item.rootMargin || '1000px'`.
- On first intersect:
  1) Disconnect observer (idempotent).
  2) If `loader` provided → `await loader()`; else use `section` directly.
  3) `module.createSection().mount({ target, css, prefersReducedMotion })`.
  4) Cache handle for `stop()`.
- **Jump-past safety**: if `document.readyState === 'complete'`, run a one-shot check on `start()` to handle initial positions where the user loads mid-page.
- Missing `target` → **log in debug mode** and skip (do not throw globally).
- `stop()` disconnects all observers and calls `unmount()` on every mounted handle. Safe to call multiple times.

## 5) CSS & Tokens
- Orchestrator doesn’t inject CSS. It merely passes `css: 'lazy' | boolean` through to sections.
- Mapbox tokens or other secrets are **not** handled here; sections read from `import.meta.env` (ESM) or element attributes (IIFE) as defined in their own specs.

## 6) Performance & A11y
- Keep orchestrator **zero-dependency** and tiny (< 3 KB esbuild-min, guideline).
- Mount only when needed; prefer dynamic `loader` for heavy sections.
- Respect `prefers-reduced-motion` by forwarding option; orchestration itself is motion-free.

## 7) Acceptance Criteria
- **AC1:** Can register and mount multiple sections without conflicts.
- **AC2:** Supports both **direct** (`section`) and **async** (`loader`) items.
- **AC3:** `start()` is idempotent; `stop()` unmounts all and is idempotent.
- **AC4:** Missing targets are ignored with a debug log; no crashes.
- **AC5:** Works in both apps (kitchen-sink & singles) without code change.
- **AC6 (size):** Orchestrator stays tiny (see guideline above).

## 8) Commands (dev expectations)
The orchestrator is built from its own package folder.
```bash
pnpm -F packages/lib dev
pnpm -F packages/lib build
```

## 9) Change Log
- v0.1: Define explicit API and ACs; clarify behavior and size goals.
