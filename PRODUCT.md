# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is inferred from the brief: people exploring Kecamatan Bandongan on desktop or mobile, including local-government teams, residents, educators, and researchers. They need to identify a village on a map and understand its basic profile without navigating a road-planning tool.

## Product Purpose

An interactive geographic infographic for Kecamatan Bandongan, Kabupaten Magelang, Jawa Tengah. It presents the official administrative village boundary dataset alongside a separate local statistical dataset. Success means a visitor can orient themselves in the district, find a village, select it from the map or list, and read a focused statistical profile.

## Positioning

The product is boundary-first: the map is the primary interface and every selected region is joined to local statistics by a stable village ID. It is a focused administrative atlas rather than a general-purpose navigation map or an enterprise data system.

## Operating Context

Visitors use the page as a geographic reference on a wide desktop map or a compact mobile map with an anchored information popup. The default map is a clear white vector canvas with colored administrative regions; satellite imagery is an optional secondary view. They may arrive without knowing a village's exact location, so search, labels, list browsing, hover feedback, and reset-to-district controls are part of the core reading flow.

## Capabilities and Constraints

- Use Next.js App Router, TypeScript, React, Tailwind CSS, MapLibre GL JS, GeoJSON, and Lucide React.
- Keep the app frontend-only. Statistical data is local and static; no backend, database, authentication, or API layer is needed.
- Load the active dataset's GeoJSON at runtime. The production target is `/public/geojson/bandongan-villages.geojson`; the current integration preview uses the real NYC borough dataset configured in `src/data/datasets.ts`. Support Polygon and MultiPolygon features, hover state, selected state, labels, city masking, adjacency-safe colors, locked camera mode, search, village list, and responsive dialog presentation.
- Join geometry and statistics through `properties.id` or `properties.slug`. Do not copy the statistical dataset into GeoJSON properties.
- Never invent administrative coordinates. The repository may contain only an empty/geometry-null placeholder until the official boundary file is supplied.
- The application must degrade cleanly for loading, missing/empty boundary data, and fetch/parse errors.
- The architecture should allow a future district/county hierarchy without introducing that hierarchy in this first version.

## Brand Commitments

The user asked for a professional modern-government geographic dashboard: calm, legible, neutral surfaces, restrained geographic color, clear borders, and a map-first composition. Avoid a literal Google Maps clone, excessive gradients, neon, glassmorphism, and template-like admin chrome.

## Evidence on Hand

The original implementation brief is the current product specification. No official Bandongan village-boundary GeoJSON is present in the project; a real City of New York borough boundary dataset is included only as an integration fixture. Local development statistics are illustrative only and must be replaced with an official statistical dataset before public use.

## Product Principles

1. Administrative geography is the source of truth for place selection.
2. A map action and a list/search action must resolve through the same village-selection path.
3. Illustrative statistics must never be confused with official boundaries or official figures.
4. Map clarity comes before decorative interface elements.
5. The first version stays small, static, and easy to extend.

## Accessibility & Inclusion

The interface must expose labels for icon-only controls, visible keyboard focus, keyboard-usable search and village selection, adequate contrast, reduced-motion behavior, and text alternatives for map states. Map interaction must have a non-map route to the same village information through search and the village list.
