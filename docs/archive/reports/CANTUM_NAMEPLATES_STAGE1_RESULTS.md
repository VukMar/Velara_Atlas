# Cantum Visual Patch — Stage 1 results

> **Historical evidence.** Original dates, counts, conclusions and work orders below describe their checkpoint, not current authority. See [project status](../../PROJECT_STATUS.md). Recorded old paths and local artifacts are provenance, not setup instructions.

Implemented Stage 1 only on local `main` at `eca903b`, preserving the pending
Sector View grid changes already in the worktree. No reset, data edits, commit,
push or deployment was performed. Sigils, emblems, 3D influence envelopes and
new detached-island display rules are not implemented.

## Representation and provisional height

`cantum-nameplates.mjs` owns a decorative, `aria-hidden` DOM overlay. It reuses
`territorialLabels()` component eligibility and accepted X/Z anchors, including
the existing complete-name measurement/fitting metrics and one label for each
sufficiently large connected island. It uses resolved names and Cantum colors;
missing names, inactive Cantums and System View produce no nameplates. No new
records, selection identities, artwork, dependencies or GPU text resources exist.

The isolated `territorialAnchorY()` helper uses only systems referenced by the
current Cantum contributor group, with matching resolved membership and finite
authored elevations:

`anchorY = highest eligible contributor Y + min(map.size.y * .05, map.size.x * .02)`

The current demo clearance is 3 ly. Negative elevations remain meaningful; the
calculation does not use the chart ceiling or grid/floor. For this intermediate
stage, separate islands of the same Cantum share its highest eligible contributor
height. Stage 3 can replace this helper with the actual influence-envelope top.
No envelope geometry or new geographic connectivity rule was added.

Every render projects the fixed XYZ anchor through the active camera. Text stays
horizontal and unforeshortened in both modes, at
`clamp(viewport CSS width * .027, 14, 24)` CSS pixels, weight 600, with restrained
spacing/shadow and Cantum tint. A four-pixel viewport containment margin shifts
only displayed text near edges; it never moves the geographic or projected
anchor. Names remain complete. Extremely long names/overlapping plate layouts
are still constrained by existing component eligibility; Stage 1 adds no new
nameplate-to-nameplate collision/layout rules.

Opacity keeps the existing smoothstep fade from .46 at overview to zero at 5×
fit zoom. It no longer depends on camera tilt, label orientation or projected
glyph height. Anchors outside the frustum or behind the camera are hidden.
The existing Cantum Names preference controls all plates independently of
influence shading. The DOM overlay sits below object captions/targeting and grid
annotations, uses no opaque panel, and never receives pointer/touch/raycast input.
It is decorative; Cantum accessibility stays in the catalogue and InfoCards.

## Lifecycle and preservation

Map/year/membership changes replace all nameplate nodes from resolved inputs.
Clearing or disposing the scene removes nodes; final disposal removes the root.
No extra listeners, texture uploads or permanent animation loop were introduced.
Field/component caches retain the existing eight-input bound.

The Gaussian field, contributor selection, historical membership, color/radius
settings, opacity/overlap algorithm and flat influence mesh are unchanged.
`cartographic-layers.mjs` only loses its obsolete text-mesh factory/import.
Pending `chart-layout.mjs`, system/grid geometry, grid scales and original
layout/browser-layout tests were preserved byte-for-byte from Stage 1's initial
worktree. The grid browser test changes only its obsolete name-mesh observations
and height expectations, retaining its grid, scale, projection and toggle checks.
Core cartography, authored JSON, schemas, assets and `visual-config.mjs` are unchanged.

## Files affected by Stage 1

- New: `src/viewer/cantum-nameplates.mjs` and this report.
- Source: `src/viewer/territorial-labels.mjs`, `cartographic-layers.mjs`,
  `map-scene.mjs`, `style.css`.
- Tests: `tests/labeling.test.mjs`, `browser-labeling.mjs`,
  `browser-grid-zero.mjs`.
- Documentation: `AGENTS.md`, `docs/VIEWER_SPECIFICATION.md`,
  `ARCHITECTURE.md`, `NEXUS_VISUAL_IDENTITY.md`, `CANTUM_TERRITORY_RENDERING.md`,
  `CARTOGRAPHIC_LABELING.md`, `DEVELOPMENT_ROADMAP.md`; an addendum in
  `SECTOR_GRID_STANDARDIZATION_RESULTS.md` distinguishes its earlier evidence.

## Verification

| Check | Result |
| --- | --- |
| Focused labeling unit tests | PASS: 8/8; component/history coverage retained, plus provisional heights, exact projections, constant CSS size, low tilt/orbit, monotonic fade and viewport containment |
| `npm test` | PASS: 158/158 Node tests, legacy chronology and demo validation |
| `npm run validate` | PASS: strict schema, relations/bounds/history and read-only navigation freshness |
| `npm run connections:check` | PASS; no generation/writer was run |
| `npm run demo` | PASS: legacy chronology demonstration |
| `npm run build` | PASS: 20 audited outputs, exactly 14 approved SVGs; `publicDir: false` and disclosure protections retained |
| `browser-labeling.mjs` | PASS: camera-facing names, exact projected anchors, zoom/pan/orbit, 10° tilt without fading, independent toggles, historical eligibility, absent System View names, repeated-map cleanup, three mobile sizes/edge containment and original caption/dense-system checks; no console errors |
| Detached-island browser fixture | PASS: two plates at provisional Y=8; obsolete nodes replaced; missing/ineligible names and CNU map produce zero plates; disposal removes root/nodes |
| `browser-grid-zero.mjs` | PASS: sector/system grids and scales in both modes, independent preferences, unchanged shading texture during grid toggles, elevated names, exact object XYZ; no console errors |
| `browser-layout3_6.mjs` | PASS: desktop/three mobile layouts, InfoCard, grid/H8, routes, pan/zoom and perspective restoration |
| `browser-navigation-v1_2.mjs` | PASS: 38 pointer-selected objects, 16 exclusive local endpoints, three interstellar routes, history/destinations and archival return |
| `browser-checkpoint3.mjs` | PASS: historical/search/facts, parent clearing, archival/partial/unplaced distinctions and technical loading errors/Retry |
| `browser-touch-camera.mjs` | PASS: 2D/3D native gestures, finger transitions, post-gesture controls, navigation and historical restoration; no page errors |
| `browser-celestial4_1.mjs` | PASS: all 13 known-size bodies in both modes, proxy transitions, layers/history, DPR 2/mobile, picking/occlusion, fallback and repeated systems; no console errors |
| Preservation hashes / `git diff --check` | PASS: pending grid helper, existing layout tests, visual configuration and core cartography byte-identical to initial worktree; whitespace clean |

Visual checks found horizontally readable text in top-down and low-angle
perspective. The initial mobile check exposed clipped text at a chart edge;
viewport containment fixed it and all three mobile sizes now pass. Local ignored
screenshots: `.playwright-mcp/nameplates-top.png`, `nameplates-low-tilt.png` and
`nameplates-mobile.png` in that directory.

The existing >500-kB main-chunk build advisory remains. Browser evidence uses
Chromium emulation, not physical Android/iOS hardware or other browser engines.
The provisional heights and decorative DOM compositing are intermediate
presentation; there is no envelope occlusion, true geographic volume or new
collision solver. No blocking issue was found. Stop after Stage 1 for review.
