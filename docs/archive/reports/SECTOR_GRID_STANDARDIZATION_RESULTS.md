# Sector grid standardization — implementation results

> **Historical evidence.** Original dates, counts, conclusions and work orders below describe their checkpoint, not current authority. See [project status](../../PROJECT_STATUS.md). Recorded old paths and local artifacts are provenance, not setup instructions.

> This report records the grid implementation before Cantum Visual Patch Stage 1.
> Its grid geometry remains unchanged. Stage 1 subsequently replaces floor text
> meshes with projected nameplates; see [that report](CANTUM_NAMEPLATES_STAGE1_RESULTS.md).

Implemented against clean local `main` at
`eca903b2dccab1a38492b0891e96b22aa5a56935`. This is a focused grid change;
no JSON, schema, authored positions, navigation generation or icon-minimum
changes were made.

## Implementation

- `src/viewer/chart-layout.mjs`: Sector View now has eight subdivisions and
  nine full-span lines per axis on the declared `map.planeY`. Nonzero Y origins
  and independently authored vertical extents do not offset it. The same helper
  emits one bottom-right scale, using cell width `map.size.x / 8`, cell depth
  `map.size.z / 8` and authored X/Z origin. The 160-ly demo displays `20 ly`.
  No sector column letters, row numbers or H8 designation are emitted.
- `src/viewer/map-scene.mjs`: reuses the existing projected double-headed arrow,
  text-above-arrow placement and grid visibility preference. The sector marker
  uses `data-cell="sector-bottom-right"` and Sector View/light-year accessibility
  text. The arrow follows actual projection in both cameras and cannot intercept
  pointer selection.
- System View still has its 8×8 A–H/1–8 grid, absolute Y=0 CNU and unchanged H8
  geometry, arrow projection and accessibility text. Camera framing is unchanged.
- Cantum influence and lettering code/materials/positions are unchanged. Explicit
  transparent render ordering already places grid before influence and lettering;
  their separate floor presentation remains intact, with routes/markers above.
  No additional layer adjustment was needed.

## Changed files

Two source files listed above; `tests/layout.test.mjs`,
`tests/browser-grid-zero.mjs`, `tests/browser-layout3_6.mjs`; `AGENTS.md`,
`docs/VIEWER_SPECIFICATION.md`, `docs/ARCHITECTURE.md`,
`docs/CANTUM_TERRITORY_RENDERING.md`, `docs/DEVELOPMENT_ROADMAP.md`, and this report.

Tests retain existing system/interaction assertions and add sector bounds,
nine lines per axis, nonzero origins, input immutability, fractional/alternate
chart widths, one unnumbered scale and exact endpoints. Browser additions check
both cameras, independent map preferences, history, unchanged influence texture
and lettering state during grid toggles, nonintercepting annotations and mobile
scale visibility/containment.

## Verification

| Command or browser suite | Result |
| --- | --- |
| `node --test tests/layout.test.mjs` | PASS: 10/10 |
| `npm test` | PASS: 156/156 Node tests, legacy chronology and demo validation |
| `npm run validate` | PASS: strict schema, relations/bounds/history and freshness |
| `npm run connections:check` | PASS: read-only graph and derived gate positions current |
| `npm run demo` | PASS: legacy chronology demonstration |
| `npm run build` | PASS: 20 audited outputs including exactly 14 approved SVGs; existing >500-kB main-chunk advisory remains |
| `browser-grid-zero.mjs` | PASS: sector reference/scale/Cantum compatibility in both cameras; all three system grids/H8; independent preferences, exact XYZ, 23 objects above and 14 below zero; no console errors |
| `browser-layout3_6.mjs` | PASS: desktop, three mobile sizes, sector scale containment, system H8, routes, panels, InfoCard, pan/zoom and perspective restoration |
| `browser-labeling.mjs` | PASS: territorial world scaling, caption collisions, independent layers/history/disposal, three mobile sizes and 300-object synthetic chart; no console errors |
| `browser-navigation-v1_2.mjs` | PASS: 38 pointer-selected objects, 16 exclusive local endpoints, three interstellar routes, discovery/activation and archival fallback |
| `browser-checkpoint3.mjs` | PASS: history/search, population/crew, parent clearing, archival/unplaced/partial distinctions and technical loading errors/Retry |
| `browser-touch-camera.mjs` | PASS: native 2D/3D pan, pinch/orbit, finger transitions, post-gesture controls, navigation and year restoration; no page errors |
| `git diff --check` | PASS |

Visual review at sector overview in both cameras found readable grid, distinct
routes, visible Cantum names and no scale/name overlap, flicker or depth-order
artifact. Local screenshots (ignored, not published) are
`.playwright-mcp/sector-grid-top.png` and
`.playwright-mcp/sector-grid-perspective.png`.

No blocking display issue was observed. The existing projection rules can move
the scale offscreen when its cell is outside the current camera view. Browser
verification uses Chromium emulation; physical mobile hardware and other browsers
were not tested. All requested command/browser categories were executed.

`src/viewer/visual-config.mjs`, all assets, demo/canonical JSON, schemas, frozen
fixtures, generator and Cantum rendering modules remain unchanged. No commit,
push, deployment or further visual feature was undertaken. Stop for creator review;
central icon minima remain reserved for the creator's separate adjustment.
