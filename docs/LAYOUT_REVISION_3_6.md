# Checkpoint 3.6 — Layout and interaction revision

This creator-requested revision records the rationale and implementation details
behind the current [viewer behavior contract](VIEWER_SPECIFICATION.md). It supersedes the permanent left/right columns,
bottom timeline and persistent right InfoCard in Viewer Specification §§7/8
and NEXUS Visual Identity §§7/10. It also supersedes selection-driven route
highlighting. Other historical, spatial, disclosure and visual contracts remain
in force. Schema v1.2 lifetime gate exclusivity continues to supersede the old
branching examples. This is a prototype layout refinement, not Checkpoint 4 art.

## Chart and camera

The chart is a centered square, sized from the available stage in both camera
modes. Opening a panel or record never participates in its sizing. A resize or
device rotation resizes the square while retaining camera state. Header, footer
and the whole default chart fit the viewport, including 320-pixel-wide screens.

Top-down framing uses the complete declared X/Z extent, with equal world-space
scale on both axes. Zoom 1 is the full-map minimum; Reset restores it. After
pan, wheel, pinch, keyboard motion, cursor zoom or focus, the visible X/Z range
is clamped within the chart. This constraint applies only to the orthographic
camera; perspective retains its existing orbit/pan controls. Y stays genuine
elevation, and camera snapshots preserve both the active perspective view and
the preceding top-down view across chronology and navigation.

The viewer and Vite build reject nonfinite/nonpositive maps and unequal X/Z
extents with a square-chart error. They do not alter JSON or expand a rectangle
silently. This is a viewer constraint; the general schema remains unchanged.

Local CNU charts use nine lines per axis to create **8×8** equal cells. A–H run
left to right (−X to +X), 1–8 top to bottom (−Z to +Z). Geometry and annotations
are anchored in world space, on the existing chart floor. H8 displays the cell
width: `map.size.x / 8`, so a 100,000-CNU chart shows **12.5K CNU**. This measures
a navigation sector, not a body diameter. Sector View retains an unlabeled grid.

## Overlays and records

The compact header retains Sector View, current location and selected year.
Catalogue/search, Map controls, Map layers and History are floating native
`details` panels, closed initially. Opening one closes the others; close buttons
and Escape return focus to the relevant summary. Panels scroll within the
available stage instead of clipping content or moving the map.

History opens a vertical whole-year slider plus numeric input, previous/next
exact recorded-year controls and reset-to-latest. Existing date filtering and
the 0–1200 demo range remain unchanged. Arrow keys operate the focused range;
the compact header keeps the selected year visible when History is closed.

Selection opens a centered, nonmodal NEXUS InfoCard with the existing fields,
null/zero distinctions, archival fallbacks, coordinates and explicit navigation
actions. There is no initial InfoCard. Its top-right close button and Escape
clear selection, preserve the camera and return focus to the opener (or the
replacement record control after historical reconstruction). Focus selection
closes the card so its map result can be inspected. A short mouse-click delay
lets double-click still open systems without the card intercepting click two;
touch and keyboard selections are immediate. No portrait or new artwork is used.

## Routes

Eligible routes brighten while their own stroke/label or corresponding gate is
hovered. Hover exit restores the base transport styling; keyboard focus is the
equivalent transient state. Touch presses preview, then release restores the
route. Selection changes only the selected marker/label targeting and InfoCard;
it does not keep a route or partner highlighted. Hidden and historically
ineligible routes cannot be highlighted. Existing curves, direction arrows,
solid/dashed transport styling and public endpoint rules are preserved.

## Verification

`npm test` includes pure framing, invalid extents, bounded pan/zoom, grid,
measurement, camera snapshots and route-style regression tests. The original
accepted v1.2 fixture is frozen under `tests/fixtures/v1_2/`, so author edits to
the live demo do not change the old generator rejection scenarios. Live-demo
schema/freshness validation still runs independently. ID Finder's smoke tests
derive current maxima; its synthetic exact-value tests remain in place.

Reusable Playwright MCP entry points (pass an absolute `filename` to
`browser_run_code_unsafe`, with a connected page at the app URL):

- `tests/browser-layout3_6.mjs`: dev or production; desktop/narrow sizing,
  overlay and popup focus, timeline, wheel/pan bounds, grid, hover, perspective.
- `tests/browser-navigation-v1_2.mjs`: dev; current three-system records,
  pointer selections, exclusive links, destination and historical navigation.
- `tests/browser-checkpoint3.mjs`: dev; chronology, layers, synthetic unplaced,
  fallback, partial and failed-load states, and invalid square-map input.
- `tests/browser-touch3_6.mjs`: dev or production; Chromium touch emulation,
  selection, timeline, navigation, injected pinch and bounded pan. Follow-up taps
  after the raw multi-touch sequence remain unverified: the injected sequence
  produced pointer events without a following click. No physical-touch or
  cross-browser pass is claimed.
- `tests/browser-documentation3_6.mjs`: dev or production; the README review
  workflow across all systems, Focus/Reset actions and observed read-only,
  same-origin traffic without canonical/private-source requests.

See [the original results](CHECKPOINT_3_6_RESULTS.md) and
[the current synchronization audit](REPOSITORY_AUDIT_3_6.md). No authored
coordinates, histories, schemas, IDs, navigation declarations, generated graph,
Cantum calculations, zone geometry or publication configuration are changed.
