# scrolly-sections

Spec-first library of a‑la‑carte scrollytelling sections (Vite + TypeScript + SCSS). Ships ESM for apps and IIFE for CMS embeds, with standalone demos and a kitchen‑sink orchestrator.

## Why
Build scrollytelling pages from reusable, standalone **sections** (e.g., Trail Scrub, Photo Pan/Zoom, Stat Counters). Each section runs in isolation for demos and can be combined a‑la‑carte in a single page/app. The project is **docs‑first**: specs and ADRs drive code (ideal for Cursor workflows).

## Features
- **Vite + TypeScript + SCSS** workflow
- **Two builds per section**: ESM (apps) and IIFE (single‑file embed for CMS/Webflow)
- **Kitchen‑sink app** to compose multiple sections and test integration
- **Lazy loading** (IntersectionObserver) with “jump‑past” fallback
- **Performance budgets** and reduced‑motion support
- **Spec‑first docs** to keep decisions and contracts explicit

## Repo structure (conceptual)
```
apps/
  kitchen-sink/                 # demo app that mounts any combination of sections
packages/
  sections/
    _design-system/             # shared SCSS tokens/mixins + shared types
    trail-scrub/                # example section A
    photo-panzoom/              # example section B
    stat-counters/              # example section C
  lib/                          # re-exports sections + small orchestrator
docs/
  adrs/
  rfcs/
  specs/
    library/
    sections/
  workflow.md
```

## Getting started
**Prereqs:** Node 18+, pnpm (or npm), Mapbox token if you use map sections.

```bash
pnpm i            # install workspace deps
pnpm -w build     # build all packages
pnpm -F apps/kitchen-sink dev   # run the kitchen-sink app
# or run a section demo directly:
pnpm -F packages/sections/trail-scrub dev
```

## Section API (common contract)
Every section exposes the same surface for predictable composition.

```ts
export type SectionOptions = {
  target: string | Element;          // mount target
  css?: boolean | 'lazy';            // auto-attach CSS (false|true|'lazy')
  prefersReducedMotion?: boolean;    // override OS setting
};

export type SectionHandle = {
  mount(opts: SectionOptions): Promise<void>;
  unmount(): Promise<void>;
  isMounted(): boolean;
};

export declare const createSection: () => SectionHandle;
```

## Orchestrator usage (app side)
```ts
import { createOrchestrator } from '@scrolly/lib';
import * as TrailScrub from '@scrolly/trail-scrub';
import * as PhotoPanZoom from '@scrolly/photo-panzoom';

const orchestrator = createOrchestrator([
  { section: TrailScrub, target: '#trail-scrub', css: 'lazy' },
  { section: PhotoPanZoom, target: '#photo-panzoom' }
]);

orchestrator.start(); // uses IntersectionObserver with generous rootMargin
```

## CMS/Webflow embed (IIFE)
```html
<div id="trail-scrub" data-mapbox-token="YOUR_TOKEN"></div>
<script src="https://cdn.example.com/trail-scrub.iife.js" defer></script>
<script>
  // lazy init with proximity
  (function () {
    const el = document.getElementById('trail-scrub');
    const io = new IntersectionObserver(async (e)=>{
      if(!e[0].isIntersecting) return; io.disconnect();
      await window.ScrollyTrailScrub.mount('#trail-scrub', { css: 'lazy' });
    }, { rootMargin: '1000px' });
    io.observe(el);
  })();
</script>
```

## Performance & a11y targets
- Entry JS (br): ≤ **75–100 KB**; heavy libs lazy‑loaded per section
- Entry CSS (br): ≤ **50–80 KB**
- Respect **prefers‑reduced‑motion**; avoid long tasks (> 200 ms) during scroll

## Docs‑first
Start here and keep it current: [`docs/specs/PROJECT_OPERATING_SPEC.md`](docs/specs/PROJECT_OPERATING_SPEC.md)

## Scripts (typical, per package)
```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

## License
MIT.
