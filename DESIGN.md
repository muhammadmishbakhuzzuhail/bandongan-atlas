# Survey Atlas — Visual Direction

## Surface

The primary surface is an operate-mode geographic atlas. The map owns the viewport and the interface behaves like a calm public-sector field reference: clear boundaries, restrained controls, and a statistical dossier that appears only when a place is selected.

## Physical scene

A local-government analyst or resident uses the page in daylight at a desk or on a phone outdoors. The screen should remain readable in bright ambient light, with a light neutral canvas and one dark ink color carrying most of the hierarchy.

## Palette

- Canvas / lichen fog: `#EEF3F0`
- Surface / paper white: `#FFFFFF`
- Ink / pine: `#173B39`
- Accent / cadastral teal: `#1E716A`
- Map wash / river mist: `#D9E8E5`
- Signal / survey amber: `#D39A55`

Use the restrained strategy. Teal is reserved for active selection, primary actions, and map emphasis. Amber marks a pending boundary source or a secondary signal, never decoration. Borders are quiet pine-tinted neutrals.

## Typography

Use one practical sans family throughout: `Avenir Next`, `Segoe UI`, `Helvetica Neue`, Arial, sans-serif. Use a small caps-like utility label sparingly for map metadata, normal sentence case for actions, and `ui-monospace` only for numeric values and coordinate-like metadata. Data figures use tabular numerals.

## Composition

The map is a full-height working surface beneath a compact top navigation rail. Search, the village list, and the basemap toggle sit in the upper-left working rail. A compact color legend sits over the lower-left map area. For the locked NYC preview, the default white canvas makes the five colored boroughs the primary visual; optional satellite imagery is clipped to the city boundary with a white inverse mask, while the selected region dossier appears as an anchored popup near the clicked region rather than a right-side panel.

## Signature

Every state carries a small “boundary / detail” reading: the map is quiet at rest, while a selected polygon receives a teal wash and a precise ink outline, and the dossier echoes the same village name. This makes the geographic join visible without adding decorative chrome.

## Interaction and state

- Selection changes use a short 180–240ms ease-out; respect `prefers-reduced-motion`.
- Hover is a preview only: translucent teal fill, stronger border, and a compact tooltip.
- Click, search, legend, and list selection all call the same selection action.
- The initial view shows every region with a clear categorical fill computed from geometry adjacency; the solid color map is the default preview and areas outside NYC are white.
- NYC is a presentation map: it fits once to the city extent and does not allow pan, zoom, or rotation. Region selection does not move the camera.
- Loading, missing boundary data, and fetch errors are explicit inline states.
- Icon-only controls have text labels through `aria-label` and visible focus rings.

## Responsive rules

- Desktop (`>= 1024px`): anchored infographic popup, compact top rail, map fills the viewport.
- Tablet: popup narrows and remains readable over the locked map.
- Mobile: top rail stacks search and list actions, map keeps a generous minimum height, and the statistic popup stays attached to the selected region with a viewport-safe width.

## What this direction avoids

No generic hero, marketing gradient, neon map, glass-only panels, random per-village colors, or fabricated boundary illustration. The official GeoJSON remains the only source of administrative geometry.
