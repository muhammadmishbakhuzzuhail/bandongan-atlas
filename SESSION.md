# Session

## Current status

Phases 1–4 are complete. The local `impeccable` skill is installed at `.agents/skills/impeccable/`, and product/design context is recorded in `PRODUCT.md` and `DESIGN.md`. A real NYC borough GeoJSON fixture, official city-boundary mask, adjacency-aware overlay colors, locked color-first map, anchored infographic popup, and color/satellite basemap toggle are active for integration testing.

## Next action

Supply the official Bandongan village-boundary GeoJSON, replace the illustrative figures in `src/data/villages.ts`, switch `activeDataset` back to `bandonganDataset`, and exercise map hover/click/fit interactions against the official features.

## Constraints to preserve

- Never add invented administrative coordinates.
- Keep geometry and statistical data in separate files.
- Keep map browser-only; the rest of the application can remain server-renderable where possible.
