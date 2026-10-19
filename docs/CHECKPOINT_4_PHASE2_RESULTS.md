# Checkpoint 4.1 Phase 2 — Implementation results

**Status:** Implemented and verified for creator review. Stop here; Phase 3
renderer development and Phase 4 visual refinement are not authorized.
Baseline: `3681c04a55d302bc5466e1b5a5af6631b1400c73`; the worktree was clean.
All new names, measurements, positions and dates below are **NONCANONICAL
DEMONSTRATION DATA**, not Continuance canon.

## System composition

All detailed charts retain origin `(0,0,0)`, 20,000-CNU Y extent, authored XYZ,
square X/Z and the existing Y = 0 grid/annotations. Only the two verified
unconnected stars move. No existing connected anchor, gate, route or zone moves.

| System | X × Z chart (CNU) | Star XYZ (CNU) | Phase 2 changes |
| --- | --- | --- | --- |
| A / `sys_0001` | 100,000 × 100,000 | `(0, 0, 0)` | All positions and objects retained; diameters on four existing celestial bodies; rocky colony and water outer-world variants |
| B / `sys_0002` | 80,000 × 80,000 | `(-26000, 1800, -20000)` | Smaller chart, offset `cb_0005`; existing rocky B Prime, gas-giant B Outer and associated moon reuse their positions/relationships; B Cold remains unknown |
| C / `sys_0003` | 160,000 × 160,000 | `(-62000, -1200, 50000)` | Expanded from 120K; peripheral `cb_0010`; established world and infrastructure retained; three separated small bodies added |
| D / `sys_0004` | No published detail chart | Sector position `(55, -6, 45)` ly | Positioned archival entry, discovered at 900 A.E.; no colonization, Cantum assignment, objects or routes authored |

B and C stars have neither navigation declarations nor incoming local-link
references. Their future physical spheres have ample chart-boundary clearance.
A still has 16 local objects, B 12 and C 8; C remains sparse. Existing A nebula
clipping, asteroid field and B polygon hazard retain their exact authored geometry.

## Authored physical diameters

**1 CNU = 10,000 km.** The CNU column is a calculation for review, not a new
JSON field or a render multiplier. No artificial structure receives a diameter.

| ID | Body / variant | Diameter km | Diameter CNU |
| --- | --- | ---: | ---: |
| `cb_0001` | A Primary / star | 1,080,000 | 108 |
| `cb_0002` | A Colony / rocky planet | 12,400 | 1.24 |
| `cb_0003` | A Outer World / water planet | 18,600 | 1.86 |
| `cb_0004` | A Colony Moon | 3,200 | 0.32 |
| `cb_0005` | B Primary / star | 1,310,000 | 131 |
| `cb_0006` | B Prime / rocky planet | 9,800 | 0.98 |
| `cb_0007` | B Outer / gas planet | 126,000 | 12.6 |
| `cb_0008` | B Cold / unknown planet | Omitted: unknown | Unknown |
| `cb_0009` | B Prime Moon | 2,600 | 0.26 |
| `cb_0010` | TEST C Primary / star | 720,000 | 72 |
| `cb_0011` | TEST C World / unspecified planet variant | 14,200 | 1.42 |
| `cb_0012` | TEST C Small Water World | 6,800 | 0.68 |
| `cb_0013` | TEST C Survey Planetoid | 920 | 0.092 |
| `cb_0014` | TEST C Named Asteroid | 64 | 0.0064 |

The fictional sizes use the creator's approved ranges, with broad scale informed
by NASA's [Sun facts](https://science.nasa.gov/sun/facts/) and
[planet-size comparisons](https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/).
The values and composition are original demo choices, not a Solar System copy or
an astronomical simulation. Category has not supplied any automatic diameter.

New IDs were checked with ID Finder before authoring:

| New celestial ID | Authored XYZ (CNU) | Discovery A.E. | Parent / navigation |
| --- | --- | ---: | --- |
| `cb_0012` | `(42000, -1700, -26000)` | 680 | No parent or navigation declaration |
| `cb_0013` | `(-35000, 800, -42000)` | 740 | No parent or navigation declaration |
| `cb_0014` | `(52000, 600, 30000)` | 820 | No parent or navigation declaration |

Their name/description histories start at discovery. Existing names, dated facts,
object types, parents, navigation boundaries and links remain unchanged.

## Archival fallback and publication boundary

`sys_0004` is named `TEST D Unreleased Survey`, with explicitly noncanonical name
history starting at 900 A.E. It is absent from markers, selection and name search
at 899; eligible at 900 and the default 1200 snapshot. `publicDetailPath` is null.
**There is no `systems/sys_0004.json`.** There is no detail loader for it.

Opening D uses the unchanged textual title `NEXUS // ARCHIVAL SURVEY UNAVAILABLE`
and existing archive-edition message. It renders zero detail markers, controls,
zones or routes. Return to Sector works. Partial released details remain maps;
failed, missing and malformed detail requests remain technical errors with Retry.
No illustrated fallback or replacement message was introduced.

The seven-file explicit demo input allowlist, three detail-loader entries and Vite
`publicDir: false` are unchanged. `connections.json` is byte-identical to the
approved baseline; no writer/regeneration was needed. Read-only checks and the
pure generator's tests confirm current gate coordinates. The schema, frozen
v1.1/v1.2 fixtures, historical resolver, canonical data and rendering algorithms
are unchanged. The sole viewer source edit corrects the existing InfoCard unit
note and explicitly identifies temporary marker sizes as display aids.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | PASS: 146/146 Node tests, including five new demo-expansion tests, legacy checks and demo validation |
| `npm run validate` | PASS: strict v1.2 schema, three released details, cross-file/bounds/history checks and freshness |
| `npm run connections:check` | PASS: read-only; derived positions and graph current |
| `npm run demo` | PASS: unchanged legacy chronology demonstration |
| `npm run build` | PASS: production build and six-output disclosure/base-path audit; existing >500-kB chunk advisory remains |
| Baseline comparison | PASS: existing records preserved outside approved diameters/variants, chart widths, star positions and additions; graph/schema/allowlists byte-identical |
| `git diff --check` | PASS |

Initial Node runs exposed the legitimately stale live-demo maximum `cb_0011`
(now `cb_0014`). A sandboxed rerun also blocked existing navigation-recovery
tests at the Windows temporary-directory parent with EPERM; the final full run
outside that restriction passed all 146 tests. No production validation was relaxed.

Chromium Playwright checks ran against the current local Vite viewer:

| Browser suite | Result |
| --- | --- |
| `browser-navigation-v1_2.mjs` | PASS: 36 pointer-selected objects, 14 local endpoints, three interstellar routes, three released maps, one archival entry and discovery boundaries |
| `browser-checkpoint3.mjs` | PASS: chronology, search, population/crew, fallback/unplaced/partial distinctions, failed/missing/malformed loading errors and Retry, non-square rejection |
| `browser-layout3_6.mjs` | PASS: desktop and three mobile sizes, panels/InfoCard, H8 arrows, pan/zoom, hover/focus routes and perspective restoration |
| `browser-grid-zero.mjs` | PASS: all three released systems in both camera modes, exact XYZ, zero-plane lines/annotations, H8 cell alignment and independent preferences; 22 objects above and 13 below zero |
| `browser-documentation3_6.mjs` | PASS: three released charts, authored cell widths, focus/reset and observed same-origin GET-only traffic |
| `browser-labeling.mjs` | PASS: geographic lettering, constant caption size/collisions, preferences/history/disposal, three mobile sizes and 300-object synthetic case |
| `browser-zones3_8.mjs` | PASS: off-map/giant zones, overlap, object/route priority, history/layers/focus, camera-inside 3D, 2D solid/dashed outlines and mobile touch controls |
| `browser-touch-camera.mjs` | PASS: native 2D/3D pan/pinch/orbit, finger transitions, post-gesture controls, mode/navigation/year restoration |
| `browser-touch3_6.mjs` | PASS: tap/close, vertical History, back navigation, two-finger pinch, bounded pan and post-gesture tap |

Navigation/grid/loader tests now distinguish released and archival systems.
Documentation cell widths derive from each chart. Layout H8 endpoints derive
from the current extent instead of assuming every chart is 100K. Original object,
endpoint, historical activation and destination checks remain intact.

## Modified files

- Demo: `examples/demo_atlas/sector.json`, `systems/sys_0001.json`,
  `systems/sys_0002.json`, `systems/sys_0003.json` within that demo directory.
- Unit tests/wiring: `tests/demo-expansion.test.mjs` (new), `tests/viewer.test.mjs`,
  `tests/idfind.test.mjs`, `package.json`.
- Browser tests: `tests/browser-navigation-v1_2.mjs`, `browser-checkpoint3.mjs`,
  `browser-grid-zero.mjs`, `browser-documentation3_6.mjs`, `browser-layout3_6.mjs`
  within `tests/`.
- Text/status: `src/viewer/index.html`, `AGENTS.md`, `README.md`,
  `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/DEVELOPMENT_ROADMAP.md`,
  `docs/VIEWER_SPECIFICATION.md`, `docs/VIEWER_PROTOTYPE.md`,
  `docs/CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md` and this report.

## Remaining integration work and limits

No blocking schema or data defect was found. The historical resolver still does
not forward `physicalDiameterKm`, and temporary markers do not render physical
diameters or planet materials. Passing through released measurements, physical
models, SVG proxies, centralized apparent minima and continuous transitions
belong to separately approved Phase 3. No such visual tests or Phase 4 refinement
were performed. Browser verification is Chromium emulation, not physical
Android/iOS hardware or cross-browser certification. Dense-system timings are
environment-specific, not a performance guarantee. No commit, push or deployment
was performed.
