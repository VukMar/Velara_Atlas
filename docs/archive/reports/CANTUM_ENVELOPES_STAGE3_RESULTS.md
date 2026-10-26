# Cantum Visual Patch — Stage 3 implementation results

> **Historical evidence.** Original dates, counts, conclusions and work orders below describe their checkpoint, not current authority. See [project status](../../PROJECT_STATUS.md). Recorded old paths and local artifacts are provenance, not setup instructions.

Implemented Stage 3 only on clean local `main` at
`39821c13f6ec99b9220f439a22d0b2dc3def2a3b`. Stages 1–2 remain creator-approved.
No data, schema, asset, dependency, commit, push or deployment change was made.
Stage 4 detached-island label rules and Stage 5 final refinement remain unimplemented.

## Files modified

- Added `src/viewer/influence-envelopes.mjs`: pure bounded geometry and cache.
- Added `src/viewer/influence-compositor.mjs`: private geometry pass and capped composite.
- Updated `src/viewer/map-scene.mjs`: lifecycle, exclusive camera-mode presentation
  and event-driven rendering; `cantum-nameplates.mjs`: local perspective heights.
- Added `tests/influence-envelopes.test.mjs`,
  `tests/browser-influence-envelopes.mjs`; test wiring in `package.json`.
- Updated `tests/browser-grid-zero.mjs` to retain grid/scale assertions while
  checking the new mode-specific territory visibility and nameplate heights.
- Updated `AGENTS.md`, `docs/CANTUM_TERRITORY_RENDERING.md`,
  `VIEWER_SPECIFICATION.md`, `ARCHITECTURE.md`, `DEVELOPMENT_ROADMAP.md`, and this report.

## Geometry, footprint and height

The existing Gaussian X/Z field remains the political/geographic authority.
`territoryGroups()` and the historical resolver are unchanged. Geometry receives
only current eligible contributors, with their authored Y matched by permanent ID.
No proximity, route, elevation or envelope intersection assigns membership.

Each Cantum uses a 128×128 bounded chart grid split into four triangles per cell.
Triangles are clipped at `fieldThresholdStart` using shared, canonical edge roots
with 24 bisections of the true field. Upper and lower surfaces taper to the same
centerline at the contour; chart-edge intersections have closing side faces.
Surface winding is outward, zero-area Float32 triangles are omitted, and all XYZ
are clipped to authored chart bounds. No independent overlapping star spheres,
volumetric raymarcher or separate 3D political field exists.

The horizontal sample step is 1.25 ly for this chart; conservative contour
tolerance is one cell diagonal, about **1.77 ly**, plus Float32 rounding. Mesh
vertices respect the true field; straight interpolation inside each sampled
triangle approximates curved contours. Sub-cell features and very narrow necks
are limited by that resolution. Y does not determine the sampled footprint or
connect/disconnect its islands. Synthetic merged/detached tests verify that
large elevation differences do not alter X/Z topology.

Nominal half-height is `clamp(radiusLY * .30, 4, 9)`:
7.2 ly for `can_0001`, 5.4 ly for `can_0002`. A Gaussian-weighted inverse-square
centerline interpolates eligible authored elevations locally, exactly through
distinct contributor positions; coincident X/Z contributors use mean Y.
Relative exponents avoid underflow in distant weights. Height tapers with
`sqrt(t * (2-t))` over the normalized configured field interval. Alpha follows
the existing smoothstep interval.

All demo contributors are contained within the clipped envelopes without moving
them. Impossible coincident-elevation cases preserve the positions and nominal
height budget, recording only current eligible IDs in each data object's
`limitations` array. The synthetic ±20-ly coincident test produces two explicit
limitations. Clipping can create planar chart-edge cuts, which represent map
bounds rather than a newly authored political surface.

## Historical behavior and nameplates

The first known system at 100 A.E. is not yet a Cantum contributor. Geometry is
empty at 99, 100 and 209; A contributes at 210/329; B joins A inclusively at
330 (tested immediately before/at that boundary), and both contribute at 600/699;
the second Cantum's C contributor enters inclusively at 700. At 1200 all three
eligible contributors are represented. Memory-only tests cover a historical
transfer, omitted/unplaced/future contributors, isolated/merged/detached fields,
different-Cantum overlaps and authored nonzero map origins.

Nameplates keep accepted X/Z placement, eligible islands, resolved names/sigils,
camera-facing typography, zoom-only fade and independent Names preference.
Perspective Y samples the local envelope upper surface plus
`min(map.size.y * .03, map.size.x * .01)` clearance: **1.6 ly** here. Remote
islands no longer inherit the Cantum-wide maximum for perspective placement.
Top-down retains the prior provisional height. No sigil-only islands, new size
thresholds or catalogue identities were introduced.

## Transparency, layers and interaction

Top-down renders the byte-identical existing flat RGBA texture. Perspective hides
it and renders only the new envelope composite. Influence controls the active
representation; Names controls the full name/sigil group independently.

A private geometry-only pass accumulates premultiplied color/alpha in a half-float
render target. Each face uses at most .08 peak alpha (half the existing .16
per-Cantum maximum). One normal-blended chart-layer pass normalizes weighted
color and clamps final alpha to the configured total cap, never above .22.
This handles front/back surfaces, multiple ray intersections and different-Cantum
overlaps without visible additive brightness or unbounded opacity stacking.
Color mixing is deterministic up to floating-point accumulation rounding.

The GPU readback test renders overlapping differently colored envelopes from
above and below: maximum alpha is **56/255**, the 8-bit representation of the
.22 cap, with 832/916 nonzero pixels respectively. No opaque pass is introduced.
The pipeline requires a renderable half-float color target; the tested Chromium
renderer supports `EXT_color_buffer_float`. Other GPU/browser support remains
unverified rather than claimed universally.

Grid stays at `map.planeY`; the unchanged light-year scale, routes, markers and
interaction overlays remain distinguishable. The composite draws after grid
and before routes/markers, without depth writes/testing. Shells have no entity
selection identity and both private meshes and composite disable raycasting.
Object/route/zone picking semantics remain intact.

## Performance and cleanup

Geometry data are cached for eight resolved input sets keyed by eligible
contributors/XYZ, color/radius, thresholds, bounds and resolution. Camera movement
reuses the exact same data and GPU geometries. Changed historical groups rebuild
as needed; names-only year changes can reuse cached geometry data. Map replacement
disposes private geometries/materials/target; the main scene disposes composite
geometry/material exactly once. No permanent animation loop or listener was added.

The demo uses 96,672 and 25,776 vertices, totaling 122,448 and about 1.87 MiB of
cached position/weight arrays. One observed fresh Node build took about 647 ms;
the cache hit took about 0.53 ms. These are local measurements, not performance
guarantees. First-time changed inputs can pause while building; larger Cantum
counts have not been performance-certified. Render-target memory is eight bytes
per physical drawing-buffer pixel (about 24.6 MiB at the tested 1794² DPR-2 size).
The target resizes with viewport/DPR and is released with the map. Repeated
camera/year/map tests show no accumulation of GPU geometries or textures.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | PASS: 168/168 Node tests, legacy chronology and demo validation |
| Focused envelope unit tests | PASS: 5/5, including final transfer/zero-threshold assertions; default/clamped heights, exact authored elevations, determinism/cache, closed surfaces/outward winding, footprint, XYZ clipping, topology, history, overlaps, non-pickability, cleanup and immutability |
| `npm run validate` | PASS: strict v1.2, references/history/bounds and read-only generated freshness |
| `npm run connections:check` | PASS: no navigation writer/regeneration |
| `npm run demo` | PASS: unchanged legacy chronology demonstration |
| `npm run build` | PASS: 21 audited outputs, exactly 15 approved SVGs; existing >500-kB main-chunk advisory remains |
| New envelope browser suite | PASS: exclusive 2D/3D presentation, unchanged flat texture hash, geometry reuse while tilting, local plate heights, exact historical contributor counts, real GPU alpha cap from both sides, DPR-2 target resize, independent layers, repeated maps/resources and two mobile sizes; no console errors |
| `browser-grid-zero.mjs` | PASS: unchanged sector/system grid geometry, scales, camera/preferences and actual XYZ, with mode-specific influence/nameplate checks; no console errors |
| `browser-labeling.mjs` | PASS: Stage 1 projection/fading/toggles/history/islands/cleanup, three mobile sizes, captions and dense-system regressions; no console errors |
| `browser-cantum-sigils.mjs` | PASS: both Cantums/cameras, loading/failure fallback, historical eligibility, mobile grouping/containment, repeated navigation and listener lifecycle; no unexpected console errors |
| `browser-navigation-v1_2.mjs` | PASS: 38 pointer-selected objects, 16 local endpoints, three interstellar routes, historical destinations and archival fallback |
| `browser-checkpoint3.mjs` | PASS: historical facts/search, parent clearing, archival/partial/unplaced distinctions and technical loading errors/Retry |
| `browser-layout3_6.mjs` | PASS: desktop/three mobile layouts, panels/InfoCard, grid/H8, routes, pan/zoom and perspective restoration |
| `browser-celestial4_1.mjs` | PASS: all 13 known-size bodies in both modes, transitions, layers/history/DPR/mobile, picking/occlusion and repeated maps; no console errors |

Visual evidence, local and ignored: `.playwright-mcp/envelopes-stage3-top.png`,
`envelopes-stage3-perspective.png`, and `envelopes-stage3-low.png` in that directory.
Top-down, ordinary perspective and 10° elevation were visually reviewed. Flat
shading remains unchanged; perspective envelopes are restrained and flattened,
with readable stars, routes, names/sigils and grid scale. No blocking crack,
flicker, picking or resource issue was observed in these checks.

All requested command/browser categories ran. Evidence uses Chromium emulation,
not physical mobile hardware or cross-browser certification. Sampling tolerance,
cold-build time, render-target capability/memory and impossible height budgets
are the current technical limitations. Stage 4 label rules and Stage 5 visual
refinement remain deferred. Canonical/demo data, political memberships, the
15 SVGs, schema/fixtures, grid helper, navigation and `visual-config.mjs` remain
unchanged. Stop after Stage 3 for creator review.
