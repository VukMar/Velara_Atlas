# Checkpoint 4.1 Phase 3 — Implementation results

> **Post-Phase-3 addendum:** Phase 3 is now creator-approved. This report preserves
> the original implementation evidence, which retained Phase 2 data. The creator
> subsequently made intentional System C navigation and discovery-date changes
> during testing, committed at `16668e2`. Current counts, dates and verification
> are in [the maintenance note](POST_PHASE3_MAINTENANCE.md). Earlier preservation
> claims and test totals describe the implementation before those testing edits.

**Status:** Implemented and verified for creator review. Stop after Phase 3.
Phase 4 artistic refinement, canonical migration and deployment are not started.
Baseline: `94a3fba35d873cd202878d64e286a90d7da1dfda`; initial worktree clean.
All displayed system data remain the approved noncanonical demonstration.

## Rendering architecture and scale

The modern historical resolver forwards `physicalDiameterKm` only when authored
on an eligible celestial body. Omission stays omission; chronological filtering,
names, IDs, XYZ, parents, InfoCards and nonmutation are preserved. The legacy
resolver, schemas, frozen fixtures and all Phase 2 JSON are unchanged.

| Module | Implemented responsibility |
| --- | --- |
| `visual-config.mjs` | Universal CNU constant, CSS-pixel minima and model-handoff ratio |
| `celestial-scale.mjs` | Pure radius conversion, actual-camera silhouette bounds, clip visibility and complementary transition weights |
| `celestial-model.mjs` | Physical spheres and normalized irregular small bodies, deterministic symbolic vertex colors and no invented unknown/artificial geometry |
| `icon-manifest.mjs`, `icon-registry.mjs` | Exact fourteen-file inventory, static Vite URLs, schema-driven category/variant mapping and closed icon override policy |
| `navigation-proxy.mjs` | One image per existing projected button; safe image-failure fallback and listener cleanup |
| `inspection-camera.mjs` | Radius-based camera framing, centered inspection, clipping precision and surface-distance protection |
| `map-scene.mjs` | Integrates these modules with existing labels, visibility, ray picking, routes/zones, selection and disposal |

**1 CNU = 10,000 km**, and **radiusCNU = physicalDiameterKm / 20000**.
Model geometry has this authored local radius and mesh scale `(1,1,1)` in both
camera modes. It never uses navigation boundaries or category multipliers.
Stars are self-lit spheres; planets/moons use restrained symbolic shading, gas
planets subtle bands, and small bodies normalized irregular geometry. No actual
continents, composition, rings, cloud layers, textures or orbital physics are
inferred. Stellar corona is optional and is not implemented.

Orthographic projection uses the active matrix scale, zoom and CSS viewport.
Perspective computes sphere tangent bounds in camera space, including off-axis
projection and zoom, rather than using Euclidean distance as projected depth.
Device pixel ratio changes canvas resolution, not CSS minima.

| Category | Minimum CSS diameter |
| --- | ---: |
| Star | 28 px |
| Gas planet | 24 px |
| Other planet | 20 px |
| Moon | 16 px |
| Planetoid / asteroid / comet / other celestial | 14 px |
| Station / Jump Gate / Jump Hole | 12 px |
| Short-range gate | 10 px |

No initial minimum values required adjustment. Display diameter follows
`max(projectedPhysicalDiameterPx, minimumDisplayDiameterPx)`. Below the minimum,
only the SVG proxy is visible. From 1.0 to 1.35 times the minimum, smoothstep
weights transfer opacity from SVG to model; they sum to one. Above that range,
the model is opaque and the SVG invisible. There is no timed animation or new
animation loop, so reduced-motion users receive the same deterministic handoff.

The HTML image is always screen-facing, anchored by the actual XYZ projection.
It shares the existing button, caption and permanent identity; there is no second
selectable sprite or GPU texture. Physical ray picking and bounded button targets
retain object → route → zone priority. Opaque physical bodies occlude symbols
behind them using the existing raycaster. Layer switches and clip bounds hide
the corresponding models/proxies together; catalogue access remains available.
Caption offsets follow displayed size, with active text kept inside the viewport
when an inspected disk fills the screen. Sector system markers remain unchanged.

## Focus Selection and camera limits

Focus Selection on a known-size celestial body keeps its selected identity,
closes the InfoCard and enters physical inspection. Unknown sizes keep the
ordinary symbol-based focus behavior. Closing an InfoCard or Escape still clears
selection normally; Focus is now explicitly distinct from dismissal.

Inspection uses a ten-radius top-down frustum, not an enormous global zoom.
Perspective initially places the camera six radii from the center. Near/far
planes are `0.02r` / `1000r`, perspective distance is bounded to `1.5r`–`200r`,
and inspection zoom is 1–8. Pan is disabled to keep the physical center fixed;
orbit and pinch/zoom remain usable. Mode switches reframe the same body. Reset
restores full-chart projection, ordinary pan, chart-derived distance limits and
the normal 2048 maximum zoom. History/map snapshots preserve inspection only
while the inspected body remains eligible.

All thirteen known-size bodies were inspected in both modes, including
`cb_0014`: 64-km diameter, 0.0064 CNU diameter and **0.0032 CNU radius** at its
unchanged `(52000,600,30000)` position. No arbitrary enlargement is used.

This is centered inspection, not surface flight. Local clipping intentionally
excludes distant chart content and may exclude the Y=0 reference plane when the
body is far above/below it. Perspective cannot enter the selected surface.
Mode changes reframe inspection rather than preserve an arbitrary inspection
zoom exactly. Extreme values approaching floating-point representability limits
are not guaranteed to support arbitrary astronomical precision.

## Starter SVG inventory and build boundary

All fourteen icons are original geometric navigation symbols with transparent
backgrounds and a common `0 0 64 64` viewBox. They use no scripts, foreign objects,
remote resources, fonts, copied game artwork or baked text:

- `public/assets/icons/celestial/`: `star.svg`, `planet-rocky.svg`,
  `planet-gas.svg`, `planet-water.svg`, `planet-unknown.svg`, `moon.svg`, `small-body.svg`.
- `public/assets/icons/stations/`: `regular.svg`, `shipyard.svg`, `unknown.svg`.
- `public/assets/icons/navigation/`: `short-range-gate.svg`, `jump-gate.svg`, `jump-hole.svg`.
- `public/assets/icons/generic/`: `unknown.svg`.

Known categories/variants and supported registry identifiers select these files.
The fallback chain is authorized available custom override → supported
override/category default → generic SVG → built-in CSS primitive. **No custom
file sources are authorized in this release**; unsupported authored paths are
never fetched and safely fall back. `icon: null` continues to request defaults.

Vite keeps `publicDir: false`, the existing demo allowlist and three detail
loaders. Only the fourteen exact icon paths are added to the source/dev allowlist.
Static URLs and `assetsInlineLimit: 0` emit deployment-base-safe hashed SVG files.
`scripts/svg-assets.mjs` checks a narrow starter SVG profile. The output audit
requires exact approved SVG bytes/names once each, rejects unexpected files and
duplicates, and retains all canonical/private/source-map scans. Existing NEXUS
PNGs are untouched and excluded. No wildcard importing or public-directory copy
was introduced.

## Verification

| Command / check | Result |
| --- | --- |
| `npm test` | PASS: **154/154**, including eight new renderer/resolver/asset/inspection unit tests and all existing regressions |
| `npm run validate` | PASS: strict v1.2, three detail files, cross-file checks and generated freshness |
| `npm run connections:check` | PASS: read-only; no navigation writer was needed |
| `npm run demo` | PASS: unchanged legacy chronology demonstration |
| `npm run build` | PASS: **20 output files, including exactly 14 SVGs**; existing >500-kB main-chunk advisory remains (about 667 kB / 175 kB gzip) |
| Negative output audit | PASS: an extra SVG containing approved bytes was rejected as a duplicate/unexpected distributable; the temporary test file was removed and clean audit rerun |
| Baseline preservation / `git diff --check` | PASS: Phase 2 JSON, schema/frozen data, canonical records, generator, zones and NEXUS PNGs unchanged; whitespace clean |

Full Node runs used the approved access needed by existing Windows temporary-
directory recovery tests. No tests were removed. Two old temporary-marker
assertions now verify the new contract: physical spheres/small bodies plus
geometry-free unknown/artificial anchors, and persistent shared selection state
instead of coloring a fictitious physical gate mesh.

Chromium Playwright checks passed:

| Suite | Evidence |
| --- | --- |
| `browser-celestial4_1.mjs` (new) | All 13 known bodies inspected in both modes; seven threshold samples; fixed XYZ/radii; stable hover/selection; neutral unknown; hidden layers/history; mobile full-disk caption; perspective facing/occlusion; DPR 2; icon failure fallback; archival return; repeated maps |
| `browser-navigation-v1_2.mjs` | 36 pointer-selected detailed objects, 14 local endpoints, three interstellar routes, three released maps and one archival entry |
| `browser-layout3_6.mjs` | Desktop and three mobile layouts, InfoCard/pan/zoom, H8 endpoints, route hover/focus and perspective restoration |
| `browser-grid-zero.mjs` | Three systems, both cameras and preferences; exact object XYZ, absolute-zero grid and H8; 22 objects above and 13 below zero |
| `browser-labeling.mjs` | World lettering, fixed caption sizing/collisions, preferences/history/disposal, mobile and a 300-object memory-only case |
| `browser-zones3_8.mjs` | Off-map/giant/overlapping zones, object/route picking priority, layers/history/focus, camera-inside 3D, 2D outline styles and touch |
| `browser-touch-camera.mjs`, `browser-touch3_6.mjs` | Native 2D/3D pan/pinch/orbit, finger transitions, post-gesture taps, mode/navigation/year controls |
| `browser-checkpoint3.mjs` | Historical search/InfoCards, fallback versus unplaced/partial/missing/malformed/failed details and Retry |
| `browser-documentation3_6.mjs` | Three released charts, cell measurements, Focus/Reset and same-origin GET-only workflow |
| Production preview `/Velara_Atlas/` | All 14 SVG URLs return successfully; asteroid inspection and selected identity in both modes; archival notice/Return to Sector; no page errors |

No unhandled JavaScript errors or unintentionally broken icons were observed.
Expected icon failures were deliberately injected to verify generic/primitive
fallback. No required command was left unrun.

## Resources, screenshots and remaining limits

Geometry/material disposal is tested. DOM image error listeners are removed on
chart cleanup; browser image URLs share the normal cache. Four returns to System
A each used **13 total GPU geometries**, without growth. No GPU icon textures,
new dependency or permanent animation loop was added. The existing 300-object
caption case retained all objects and focused identification; observed median
render times varied around 9–16 ms under local test load, not a performance promise.
Much larger overlapping physical-model datasets remain a performance review item.

Local creator-review evidence is in the ignored `.playwright-mcp/` directory
(not copied into the site or committed):

- Before: `phase3-before-a.png`, `phase3-before-c.png`.
- After overview: `phase3-after-sys_0001.png`, `phase3-after-sys_0002.png`, `phase3-after-sys_0003.png`.
- Close models: `phase3-inspection-cb_0007.png` (gas planet) and
  `phase3-inspection-cb_0014.png` (64-km asteroid).

Screenshots were inspected for functional rendering, not Phase 4 artistic polish.
Materials/icons are restrained starters; there is no detailed texturing, corona,
atmospheric scattering, illustrated fallback or curator-art integration.
Browser verification is Chromium emulation, including mobile/DPR 2; physical
Android/iOS hardware and other browsers remain unverified. Custom artwork needs
an explicitly approved source entry before it can be loaded. No blocking schema
or Phase 2 data defect was found.

## Files added or modified

- Added viewer modules: `src/viewer/visual-config.mjs`, `celestial-scale.mjs`,
  `celestial-model.mjs`, `icon-manifest.mjs`, `icon-registry.mjs`,
  `navigation-proxy.mjs`, `inspection-camera.mjs` in that directory.
- Added the fourteen SVG files listed above; added `scripts/svg-assets.mjs`,
  `tests/celestial-rendering.test.mjs`, `tests/browser-celestial4_1.mjs` and this report.
- Updated runtime: `src/core/history.mjs`, `src/viewer/map-scene.mjs`,
  `caption-layout.mjs`, `main.mjs`, `index.html`, `style.css` in the viewer directory.
- Updated build/tests: `vite.config.mjs`, `scripts/audit-demo-build.mjs`,
  `package.json`, `tests/viewer.test.mjs`, `tests/layout.test.mjs`.
- Updated documentation: `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`,
  `CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md`, `DATA_MODEL.md`, `DEVELOPMENT_ROADMAP.md`,
  `NEXUS_VISUAL_IDENTITY.md`, `VIEWER_PROTOTYPE.md`, `VIEWER_SPECIFICATION.md`,
  `VISUAL_ASSET_POLICY.md` in `docs/`.

**Canonical data and Phase 2 geometry/measurements are unchanged.** No commit,
push, deployment or Phase 4 work was performed. Await creator review.
