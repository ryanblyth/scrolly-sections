# Build Bootstrap Spec
**Version:** 0.1 • **Owner:** @ryan • **Status:** Proposed

## Purpose
Stand up a pnpm workspace with Vite + TypeScript + SCSS so all packages install and build cleanly, giving Cursor a stable base to iterate on.

## Scope
- Root workspace (pnpm)
- apps/kitchen-sink (minimal Vite app)
- packages/lib (orchestrator, ES module)
- packages/sections/trail-scrub (section template, ES + IIFE builds)
- shared tsconfig + basic PR template

## Non-goals
- Implementing real section behavior
- Linting/test suites (lightweight placeholders only)

## Acceptance Criteria (AC)
- **AC1**: `pnpm -w install` completes with 0 errors (warnings OK).
- **AC2**: `pnpm -w build` completes with 0 errors; outputs:
  - `apps/kitchen-sink/dist/`
  - `packages/lib/dist/index.es.js`
  - `packages/sections/trail-scrub/dist/{index.es.js,index.iife.js}` (+ CSS asset)
- **AC3**: `pnpm -F apps/kitchen-sink dev` serves a page with no console errors.
- **AC4**: Type-check passes via `pnpm -w run typecheck`.
- **AC5**: No published tokens or secrets in repo; `.env.example` exists (optional in this step).

## Constraints
- Node ≥ 18, pnpm ≥ 9
- Vite 5, TypeScript 5, Sass latest
- Each package that runs Vite declares its own devDependencies (don’t rely on root-only devDeps)

## Deliverables
- `pnpm-workspace.yaml` (wildcards: apps/*, packages/*, packages/sections/*)
- Root `package.json` with workspace scripts
- `tsconfig.base.json`
- Minimal `package.json`, `tsconfig.json`, `vite.config.ts`, entry files per package
- `.gitignore` at root
- `.github/pull_request_template.md`

## Verification steps
1) `pnpm -w i`
2) `pnpm -w build`
3) `pnpm -F apps/kitchen-sink dev` → open in browser; verify no console errors
4) `pnpm -w run typecheck`

## Troubleshooting guidance
- If `vite` not found in a package: add it to that package’s `devDependencies`.
- If TS complains about config: ensure `tsconfig.json` extends the correct relative `tsconfig.base.json`.
- If ESM/IIFE build errors: check `lib.build.formats` and file names in `vite.config.ts`.
- If workspace not picking up a package: confirm its path matches `pnpm-workspace.yaml`.
