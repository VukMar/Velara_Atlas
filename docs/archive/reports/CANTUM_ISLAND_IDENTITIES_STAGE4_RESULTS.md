# Cantum Visual Patch — Stage 4 results

> **Historical evidence.** Original dates, counts, conclusions and work orders below describe their checkpoint, not current authority. See [project status](../../PROJECT_STATUS.md). Recorded old paths and local artifacts are provenance, not setup instructions.

Implemented Stage 4 only on clean local `main` at
`4c1f04d6a442317e0da1b517673e8560746f2e90`. Stages 1–3 are creator-approved.
Stage 5 remains deferred. No commit, push or deployment was performed.

## Files changed

- `src/viewer/territorial-labels.mjs`: centralized eligibility policy, optional
  registered-sigil availability in the bounded placement cache, sigil-only fitting
  and stable component-local anchors after the preserved full-name pass.
- `src/viewer/cantum-nameplates.mjs`: both DOM variants, component-local provisional
  outpost height, local perspective surface validation, failed outpost cleanup.
- Added `tests/island-identities.test.mjs` and
  `tests/browser-island-identities.mjs`; wired the Node suite in `package.json`.
- Updated `AGENTS.md`, `docs/CANTUM_TERRITORY_RENDERING.md`,
  `docs/VIEWER_SPECIFICATION.md`, `docs/ARCHITECTURE.md`,
  `docs/DEVELOPMENT_ROADMAP.md`, and this report. Previous reports are unchanged.

## Placement and eligibility

The authoritative Gaussian field and existing four-neighbor `fieldComponents()`
are unchanged. The full-name pass runs first with its original candidates,
metrics, rectangle fitting and minimum size. Unit coverage checks its output is
identical when sigil-only availability is enabled. A component receives exactly
one `name-with-optional-sigil` or `sigil-only` result, or none.

Only a component that cannot fit its full name and has a registered sigil may
use the fallback. `ISLAND_IDENTITY_POLICY` requires at least 24 sampled cells,
with a padded interior square for a 24px sigil on a fixed 768px reference overview.
At the default 128x128 sampling on a 160-ly map, the glyph width is 5 ly and the
one-cell-per-side padded square is 7.5 ly. Every covered sample cell must belong
to the same component. This combines cell count, geographic dimensions and finite
resolution margin; it is not an authored territory boundary or current zoom test.

Candidate anchors are interior samples at/above the existing upper field threshold.
They prefer separation from system markers at the reference overview, then boundary
depth and proximity to the field-weighted center. Where full separation is
impossible, maximum available marker clearance wins. Cell indices break ties.
No grid snapping, route connectivity, new political association or authored
coordinate change is involved. Long names are never abbreviated or shrunk to fit.

## Heights, projection and lifecycle

Both variants use the same decorative, camera-facing, `aria-hidden`, noninteractive
DOM overlay. Existing 18–24px sigil sizing, zoom fade, viewport containment and
Names preference apply to the whole group. Influence visibility is independent.
Perspective samples each anchor's local envelope upper surface plus the existing
`min(map.size.y * .03, map.size.x * .01)` clearance. Missing/invalid surfaces hide
the marker. Top-down full-name placement is preserved; new sigil-only provisional
heights use contributors belonging to their own component. Invalid local anchors
are omitted rather than moved to another island.

The placement cache retains at most eight resolved input sets and includes the
registered-sigil availability set. Camera movement only reprojects/fades the same
anchors; browser checks verify both label and envelope-data object reuse.
Rebuild/disposal removes obsolete nodes and image listeners. Failed sigil-only
assets remove the whole plate and anchor; full-name plates retain their text.
Unknown, null or omitted sigils cannot create an outpost marker or an empty slot.
The secure registry and all fifteen approved SVG assets remain unchanged.

## Historical behavior and synthetic coverage

The historical resolver and `territoryGroups()` remain unchanged. Only currently
eligible resolved names and contributor groups enter placement. Tests cover
pre-discovery/pre-Cantum states, first contributors, nearby merging, detached
holdings, overlapping different Cantums, a memory-only historical transfer,
unplaced/disappearing contributors, missing names and null/omitted/unknown sigils.
Synthetic fixtures also cover a main region plus outpost, tiny fragments, distinct
island elevations, very long names, failed images, stale listeners, repeated
rebuilds, invalid surface samples and camera-independent classification.
No synthetic authored records are written to demo JSON or public data.

## Verification

All commands passed:

| Command | Result |
| --- | --- |
| `npm test` | Legacy chronological checks, 175/175 Node tests, zero failures/skips, then strict demo validation |
| `npm run validate` | Strict v1.2 schema, all three detailed systems, cross-file/reference checks and read-only connection freshness |
| `npm run connections:check` | Generated graph and boundary-derived gates remain current; no regeneration |
| `npm run demo` | Historical demonstration completed successfully |
| `npm run build` | 36 modules; 21 output files, including exactly 15 approved SVGs; public/private/base-path audit passed |
| `git diff --check` | No whitespace errors |

Chromium/Playwright suites passed on the local Vite dev server:

| Suite | Verified |
| --- | --- |
| `browser-island-identities.mjs` | Full-name main region + sigil-only outpost; three perspective tilts including 10 degrees; local heights; projection; independent toggles; zoom fade/classification stability; picking; two mobile sizes; failed/null/unknown assets; long names; repeated rebuilds and invalid surfaces |
| `browser-labeling.mjs` | Existing nameplate eligibility, fixed projected anchors, fade, low tilt/orbit, captions, history, disposal, detached full names, mobile and dense systems |
| `browser-cantum-sigils.mjs` | Both demo Cantums and camera modes; group fade; history/navigation; three mobile sizes; listener cleanup; actual aborted-asset fallback and deployment-base URLs |
| `browser-influence-envelopes.mjs` | Unchanged top-down RGBA texture, perspective envelopes, exact history, local heights, geometry reuse, both shell sides, overlap cap, DPR=2, toggles and resource cleanup |
| `browser-grid-zero.mjs` | Sector plane and 20-ly scale; all three system grids/H8; both modes and preferences |
| `browser-navigation-v1_2.mjs` | Four catalogue systems, three released maps, 38 pointer selections, 16 local endpoints, three interstellar routes, historical destinations and archival fallback |
| `browser-layout3_6.mjs` | Square framing, panels, InfoCards, timeline, grid/scale, hover/focus/routes, perspective and portrait/landscape layouts |
| `browser-touch-camera.mjs` | Touch pan/pinch/orbit, gesture transitions, taps, mode changes, navigation and year changes |
| `browser-checkpoint3.mjs` | Historical catalogue, parent clearing, layers, unplaced/fallback states, failed/missing/malformed detail errors and retry |
| `browser-celestial4_1.mjs` | All three details, 13 known bodies, neutral unknown size, model/proxy transitions, physical XYZ/radii, history/layers, DPR, repeated-map resources and fallback |
| `browser-zones3_8.mjs` | Four zones, off-map/giant geometry, object/route priority, overlap/layers, history, local focus, 2D outlines, mobile and touch controls |

No unexpected console/page errors were reported. The production build retains
Vite's existing advisory for the main chunk exceeding 500kB. No code splitting
or unrelated build changes were made. Browser checks used Chromium emulation;
physical touch hardware and Firefox/Safari were not tested.

## Visual evidence and limits

Visually reviewed local screenshots (ignored by Git):

- `.playwright-mcp/stage4-islands-top.png`
- `.playwright-mcp/stage4-islands-perspective.png`

Both show a named main region and the same Cantum's sigil-only detached outpost.
They are synthetic memory-only scenes, not changes to the published demo.
Finite sampling deliberately omits narrow/sub-cell islands. Eligibility uses a
reference overview, not a promise of collision-free placement at every camera
angle; projected star/route/name overlaps remain possible. If an island cannot
accommodate complete marker separation, the valid anchor with most clearance is
used. No new dynamic decluttering or Stage 5 artistic treatment was added.
Failed assets are omitted until the next normal map/year rebuild retries them.

Underlying flat influence shading, Stage 3 envelope geometry/compositing, vertical
height rules, thresholds/radii/colors, political/history records, canonical data,
demo geography, connections/gates, schemas, SVGs, grid, celestial physical sizes
and `visual-config.mjs` are unchanged. No dependencies were added.
