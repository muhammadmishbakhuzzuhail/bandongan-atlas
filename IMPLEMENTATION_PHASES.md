# Implementation phases

## Phase 1 — Frontend foundation

**Type:** Infrastructure  
**Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css`, `PRODUCT.md`, `DESIGN.md`  
**Task:** Scaffold the App Router, Tailwind v4, TypeScript, global tokens, and accessible document shell.  
**Verification:** The project starts, renders the route, and TypeScript recognizes `@/*` imports.  
**Exit:** A clean Next.js shell is ready for client-only map code.

## Phase 2 — Geographic and statistical model

**Type:** UI / Integration  
**Files:** `src/types/*`, `src/data/villages.ts`, `src/lib/*`, `src/hooks/useVillageSelection.ts`, `public/geojson/bandongan-villages.geojson`  
**Task:** Define typed GeoJSON contracts, load/validate boundary data, calculate bounds/label centers, and keep local statistics separate from geometry.  
**Verification:** Empty/geometry-null placeholder loads without crashing; bounds and ID lookup are deterministic.  
**Exit:** Map consumers can receive valid normalized features and a single selection action.

## Phase 3 — Map-first application UI

**Type:** UI  
**Files:** `src/app/page.tsx`, `src/components/map/*`, `src/components/infographic/*`, `src/components/village/*`, `src/components/ui/*`  
**Task:** Implement MapLibre layers, feature-state interaction, hover tooltip, search/list selection, camera fitting, controls, responsive dossier, loading, empty, and error states.  
**Verification:** Map click, search, list click, reset, keyboard focus, mobile bottom sheet, and desktop panel all share the same selection flow.  
**Exit:** The full geographic infographic is usable with an official GeoJSON replacement.

## Phase 4 — Verification and handoff

**Type:** Testing  
**Files:** project-wide  
**Task:** Run lint, typecheck, production build, and the Impeccable detector; fix implementation-caused failures and document official data replacement.  
**Verification:** `npm run lint`, `npm run typecheck`, `npm run build`, and detector complete without unresolved implementation errors.  
**Exit:** README explains local development, GeoJSON properties, and the remaining official data TODO.
