# Cantum visual patch — intermediate scale calibration

This is a focused calibration, not Stage 5 completion or canonical radius approval.
The starting branch was `main` at `4c1f04d6a442317e0da1b517673e8560746f2e90`,
with the completed Stage 4 work already present and uncommitted. That work was
preserved in place: no reset/restore/rebase, recreation, commit, push or deployment.
`territorial-labels.mjs`, `cantum-nameplates.mjs`, both Stage 4 test files and the
Stage 4 results report were not changed by this follow-up. They remain in the
combined local diff. Previous implementation reports retain their checkpoint history.

## Calibration files

| Added/modified for this follow-up | Purpose |
| --- | --- |
| `src/viewer/visual-config.mjs` | Central `SECTOR_SYSTEM_MARKER_RADIUS_PX = 4`; existing System minima/conversion unchanged |
| Added `src/viewer/sector-markers.mjs` | Camera-projection inversion for fixed CSS-pixel Sector spheres |
| `src/viewer/map-scene.mjs` | Applies Sector marker scale and 4px caption radius only |
| `src/viewer/influence-envelopes.mjs` | New provisional `.5–3` ly half-height clamp |
| `tests/influence-envelopes.test.mjs` | Updates clamp expectations; retains closure, bounds, history, compositor and disposal coverage |
| `tests/browser-labeling.mjs` | Caption assertion uses the new visible 4px Sector radius |
| Added `tests/cantum-calibration.test.mjs` | Seven tests for projection, targets, Gaussian math/topology, heights, fixture identities/history and build exclusion |
| Added `tests/browser-cantum-calibration.mjs` | Real-renderer preview checks and nine comparison screenshots |
| Added `tests/calibration/scenario.mjs`, `index.html`, `controller.mjs` | Memory-only records and interactive local preview |
| Added `scripts/preview-cantum-calibration.mjs` | Explicit loopback preview with three-file inventory |
| `package.json` | Adds calibration unit tests and `preview:calibration` command; preserves Stage 4 test wiring |
| `AGENTS.md`, territory/viewer/architecture/roadmap documentation and this report | Current authorization, implemented scale policy, preview boundary and evidence |

No dependencies, schema fields, asset-registry entries or Vite configuration
changes were needed. `influence-compositor.mjs`, core history/cartography,
caption-layout policy, chart geometry, physical models and navigation are unchanged.

## Sector markers and interaction

Only Sector `star_system` markers use the central 4px radius. The existing unit
SphereGeometry and warm star color are retained. `sectorMarkerWorldRadius()`
inverts the active sphere silhouette projection using CSS viewport dimensions,
including off-axis perspective magnification, with three ratio corrections.
It accounts for active camera zoom and uses no device-pixel dimensions. The
nominal projected diameter is 8 CSS pixels in top-down, perspective and low-angle
views, at DPR=1/2. The existing low-polygon sphere can have a slightly faceted
subpixel silhouette; no new icon/artwork is introduced.

The invisible target still uses the original neighbor-aware `markerHitSize()`:
up to 30px diameter, reduced where needed to protect neighboring centers.
Captions now start 4px below the visible 4px radius (8px below the center), rather
than retaining the old 13px caption radius. Existing hover/selection/focus,
occlusion, collision and catalogue behavior are preserved. Browser checks select
an isolated star with pointer and emulated touch at 8px from its center, outside
its visible disk, and verify double-click identity and keyboard focus. Normal
demo navigation checks still enter systems, open InfoCards and follow routes.
System celestial minima, physical sphere sizes, SVG designs and CNU scale do not change.

## Gaussian radius and height comparison

The field remains `sum(exp(-ln(2) * distanceSquared / radiusLY²))`, with .35/.65
thresholds and unchanged smoothing/compositing. No radius follows camera zoom,
viewport, nearest-star distances or chart width. These are explicit preview
candidates only; the committed demo still authors 24/18 ly.

| Radius | Isolated .35-threshold extent | Equal-pair critical separation | New nominal half-height |
| --- | --- | --- | --- |
| 2.0 ly | 2.461 ly | 6.343 ly | .60 ly |
| 2.5 ly | 3.077 ly | 7.929 ly | .75 ly |
| 3.0 ly | 3.692 ly | 9.514 ly | .90 ly |

The isolated extent is `r * sqrt(-ln(.35) / ln(2))`. The equal-pair saddle reaches
the threshold at `2r * sqrt(ln(2/.35) / ln(2))`; a finite-width visible connection
requires separation below that ideal limit. These describe approximate chart
influence, not exact legal boundaries.

The new provisional height is `clamp(radiusLY * .30, .5, 3)`. Local Gaussian/
inverse-square contributor-Y interpolation, rounded taper, clipping, topology
and geometry safeguards remain unchanged. Stars are not moved. In the existing
wide-area demo, Cantum A's nominal half-height falls from 7.2 to 3 ly, and B's
from 5.4 to 3 ly. The result is visibly thinner in perspective, especially at 10°.
Contributor positions remain within their local analytic envelope; mesh closure,
history, bounds, front/back compositing and resource checks pass. No blocking
geometry defect was observed, so a separate legacy-height configuration was not
introduced. The visual preference remains for creator review.

## Compact synthetic sector

`tests/calibration/scenario.mjs` constructs records only in memory. The chart is
40×40 ly with independent 12-ly Y extent, an 8×8 grid at `map.planeY = 0` and a
5-ly cell-width measurement. Its 15 original noncanonical test systems comprise:

- A: six stars on a 3-ly-spaced cluster, y=.3–.6 ly, one complete Cantum name and
  the existing registered demonstration sigil.
- A outpost: one star at (10, −1.4, −9) ly, over 17 ly from its nearest A cluster
  contributor, with a disconnected sigil-only identity at every candidate radius.
- B: six stars on a separate 3-ly-spaced cluster, y=−.6–−.3 ly, complete name and
  explicit `sigil: null`; no invented emblem.
- Two unassociated controls: one inside A's approximate shading and one outside
  the displayed regions. Neither ever contributes to a Cantum field. Its InfoCard
  and catalogue state remain unassociated, demonstrating that overlap cannot
  manufacture political membership.

The real resolver filters synthetic discovery/name/membership histories. Before
200 A.E. no stars/identities appear; at 200 only A's first contributor and the
two unassociated controls are known. Other A members appear at 300, B at 700 and
the outpost at 800. A memory-only outpost transfer at 1300 removes its A sigil;
B's null-sigil small island does not acquire replacement artwork. Default 1200
shows the requested A main/outpost and B main identities. These dates/IDs are
test inputs, not Continuance canon or edits to the approved demonstration.

Stage 4's existing placement, threshold policy, historical filtering, secure
sigil fallback and DOM lifecycle are reused unchanged. Radius changes can change
anchors because they change the preview geography; camera movement cannot change
classification or resample the field. Perspective plates sample their own local
upper surface plus the unchanged .36-ly clearance for this chart.

## Open and regenerate the visual evidence

From the repository root:

```text
npm run preview:calibration
```

Open `http://127.0.0.1:5174/Velara_Atlas/__calibration/` in a browser. Choose
2.0/2.5/3.0 ly and Top-down/Perspective/Low perspective (10°). Use the existing
map pan/zoom/orbit gestures, grid/Influence/Names/object layer switches, year input,
catalogue, marker selection/InfoCards, Focus Selection and Reset View. Controls
collapse initially on narrow screens; open “Calibration controls and layers” to
adjust settings, then collapse it for a larger map. Nothing is written to disk.
Stop the server with Ctrl+C. Port 5174 is fixed and loopback-only.

For automated screenshot regeneration, also run `npm run dev` in another terminal
(port 5173), then execute `tests/browser-cantum-calibration.mjs` through the
repository's Chromium Playwright MCP workflow, using `browser_run_code_unsafe`
with `filename: "tests/browser-cantum-calibration.mjs"`. The suite navigates to
the preview, tests all variants and overwrites these ignored local screenshots:

| Radius | Top-down | Perspective | Low perspective |
| --- | --- | --- | --- |
| 2.0 | `.playwright-mcp/calibration-2-top.png` | `.playwright-mcp/calibration-2-perspective.png` | `.playwright-mcp/calibration-2-low.png` |
| 2.5 | `.playwright-mcp/calibration-2_5-top.png` | `.playwright-mcp/calibration-2_5-perspective.png` | `.playwright-mcp/calibration-2_5-low.png` |
| 3.0 | `.playwright-mcp/calibration-3-top.png` | `.playwright-mcp/calibration-3-perspective.png` | `.playwright-mcp/calibration-3-low.png` |

Open these PNG files directly in VS Code or an image viewer. Additional captures
of the unchanged wide-area geography with the new height cap are
`.playwright-mcp/calibration-wide-top.png`, `calibration-wide-perspective.png`
and `calibration-wide-low.png` in that directory. These were captured at the
default year, reset Sector camera, then perspective tilt 45°/10°, with panels
closed. Use the normal viewer's controls to reproduce those three captures.

The preview is installed only by its explicit script, not normal dev/build/preview
configuration. It serves a fixed inventory of three files without directory
scanning or arbitrary path loading. It imports the real allowed viewer/core
modules. `publicDir: false`, existing filesystem limits, production entry points
and build/output audits remain unchanged. Unit tests reject calibration inputs
through the production input audit; a post-build scan found no calibration
fixture, identifiers or preview route in distributable files.

## Verification results

All required commands passed:

| Command | Result |
| --- | --- |
| `npm test` | Legacy chronology checks, 182/182 Node tests, zero failures/skips, strict demo validation |
| `npm run validate` | Strict v1.2 and cross-file validation, all three detailed maps |
| `npm run connections:check` | Existing graph and derived gate positions current, read-only |
| `npm run demo` | Historical demonstration completed |
| `npm run build` | 37 modules, 21 output files, exactly 15 approved SVGs; base-path/public-private audit passed |
| Production calibration-sentinel scan | No fixture names/IDs, controller or local preview route in `dist` |
| `git diff --check` | No whitespace errors |

Chromium/Playwright suites passed:

1. `browser-cantum-calibration.mjs`: all nine radius/camera combinations, 8px
   markers, 30px isolated target, pointer/touch/double-click/keyboard, compact
   captions, exact grid, local Y, independent membership, history/transfer,
   toggles, cache/resource reuse, DPR=2 and 390/320px mobile containment.
2. `browser-influence-envelopes.mjs`: unchanged flat RGBA, new thinner envelopes,
   all historical contributor steps, local nameplate surfaces, front/back alpha
   capped at 56/255, DPR, reuse and disposal.
3. `browser-island-identities.mjs`: existing Stage 4 full/sigil-only eligibility,
   both cameras, local heights, failure handling, null/unknown/long names,
   mobile, stable classifications and clean rebuilding.
4. `browser-labeling.mjs`: caption offsets/collisions, focus/hover, nameplate
   anchors/fade, histories, detached full names, mobile and 300-object dense case.
5. `browser-cantum-sigils.mjs`: both live Cantums, camera modes, null/failure
   fallback, secure URL, historical visibility and listener lifecycle.
6. `browser-grid-zero.mjs`: sector plane/20-ly scale, independent preferences,
   all three system zero-plane grids and H8 annotations.
7. `browser-touch-camera.mjs`: 2D/3D pan/pinch/orbit, gesture transitions,
   immediate taps, navigation and history.
8. `browser-navigation-v1_2.mjs`: four catalogue systems, three released details,
   38 pointer selections, 16 exclusive local endpoints, three interstellar routes,
   destinations and existing archival fallback.
9. `browser-layout3_6.mjs`: charts, panels, InfoCards, timeline, hover/focus/routes,
   perspective, portrait and landscape layouts.
10. `browser-celestial4_1.mjs`: 13 known bodies, unchanged XYZ/physical radii,
    proxy transitions, 28px star minimum, DPR, layers/history, resources and fallback.
11. `browser-checkpoint3.mjs`: chronology, layers, unplaced/archival states and
    distinct failed/missing/malformed-detail errors/retry.
12. `browser-zones3_8.mjs`: clipped/giant zones, picking priority, local focus,
    historical visibility, 2D outline, mobile and touch.

No unexpected console/page errors were reported. Vite retains the existing
advisory about the main bundle exceeding 500kB; no unrelated code splitting was
undertaken. Checks use Chromium and emulated touch/DPR/mobile dimensions; physical
devices and Firefox/Safari were not tested.

## Visual assessment and limits

- 2.0 ly: tighter skirts, more empty chart between holdings and the smallest
  detached footprint; the main clusters still merge and all requested identities fit.
- 2.5 ly: the preferred comparison candidate gives a readable merged cluster and
  clearly detached outpost without filling the chart. It remains a preview default.
- 3.0 ly: broader skirts and a larger outpost, still detached; full-name versus
  sigil-only classification remains correct. Nominal height is .9 ly.
- Sampling remains 128x128: .3125-ly step and .442-ly cell diagonal on this chart.
  Unit tests compare mesh vertices against the true field, check separate/merged
  pairs around the analytic limit, and verify bounded/cached geometry. The intended
  3-ly neighbor spacing and distant outpost are comfortably resolved. Extremely
  narrow near-threshold necks/gaps remain subject to finite sampling tolerance.
- On a 160-ly chart the same resolution has 1.25-ly steps. Single 2–3-ly-radius
  islands can be too small for Stage 4's reference-overview/padded sigil fitting,
  regardless of later camera zoom. Future wide canonical charts need explicit
  sampling and identity-density review; this patch does not silently rescale
  radii, increase global resolution or relax Stage 4 eligibility.
- Low-angle projection can overlap nameplates, object captions and markers even
  when anchors are geographically separate. Current overlays remain noninteractive
  and usable through catalogue/selection. No new layout or Stage 5 artistic
  decluttering was added. The tiny spheres remain subtly faceted as before.

Authored demo and canonical JSON, physical diameters, historical dates/memberships,
connections/generated gates, schemas/frozen fixtures and all fifteen SVG assets
remain unchanged. No permanent canonical influence radius was selected.
