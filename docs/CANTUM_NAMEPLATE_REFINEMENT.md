# Final Cantum visual hierarchy polish - PR #5 review record

The subsequent creator task visually approves the world-space size, safe fit,
placement, fixed horizontal/+Y orientation, component elevation, camera behavior
and 1.15x-1.50x crossfade at **62c4927a69aaf370fe07d5d615007f2553bfbc3f**.
This revision is compositing/contrast only, on the same
`refine/cantum-adaptive-nameplates` / draft PR #5. Parent PR #4 remains
`e1ae55c1ea65477b003278bc49f2090fa662172f`. Final compositing approval is pending.
Version stays **1.0.0 candidate** as requested; no increment for this polish.

## Exact implementation and depth rationale

Only two production values change:

- `src/viewer/cartographic-layers.mjs`: `layerOrder.cantumNames` **1.5 -> 4.5**.
  Grid 0, influence 1, zones 2, routes 3 and ordinary markers 4 stay unchanged.
- `src/viewer/territorial-labels.mjs`: maximum Cantum opacity **.46 -> .82**.
  The existing smoothstep still starts at 1.15x and ends at 1.50x; system-caption
  opacity is untouched. At 1.325x, Cantum/system opacities are now **.41/.50**.

Ordinary sector marker materials are transparent but write depth. Name materials
already have `transparent: true`, normal blending, `depthTest: true`,
`depthWrite: false`, front faces and upward-facing world planes. Originally the
names drew before markers without writing depth, allowing dots to replace their
strokes. Drawing names at 4.5 lets each approved elevated plane blend over the
lower marker pixels while still testing their depth. Unrelated foreground
geometry remains in front and occludes text. No global depth change, special
render pass, stencil, extra material or marker suppression is introduced.

The selected maximum **.82** is within the requested .80-.85 range and improves
same-color glyph contrast without white tint, opaque backing, extra glow or a
thicker outline. The existing restrained dark shadow is sufficient. CanvasTexture
filtering (linear magnification, trilinear mip minification), DPR handling, source
font, UV mapping, raster bounds, caching and disposal are unchanged. Influence
clouds keep soft Gaussian fields, colors, geometry and .16/.22 alpha caps behind
stars; no separate influence adjustment was needed.

## Matched actual-renderer comparisons

All captures use the same silent-entry canonical Atlas, 1200 A.E., camera, layers,
viewport and renderer settings for each before/after pair. The Drevnasel detail is
a crop of the actual 1x view, avoiding any altered zoom/fade or artificial rescale.
The 3D camera is switched through the real Map Controls button; orbit uses the
same fixed azimuth change. No screenshot is recolored or painted.

| Case | Starting 62c4927 | Refined |
| --- | --- | --- |
| Desktop 1440x1000 | [Before](review/cantum-polish/before-overview.png) | [After](review/cantum-polish/after-overview.png) |
| Drevnasel overlaps | [Before](review/cantum-polish/before-drevnasel-detail.png) | [After](review/cantum-polish/after-drevnasel-detail.png) |
| Mobile 390x844 | [Before](review/cantum-polish/before-390x844.png) | [After](review/cantum-polish/after-390x844.png) |
| Small mobile 320x568 | [Before](review/cantum-polish/before-320x568.png) | [After](review/cantum-polish/after-320x568.png) |
| Landscape 844x390 | [Before](review/cantum-polish/before-844x390.png) | [After](review/cantum-polish/after-844x390.png) |
| Standard perspective | [Before](review/cantum-polish/before-perspective.png) | [After](review/cantum-polish/after-perspective.png) |
| Orbit | [Before](review/cantum-polish/before-orbit.png) | [After](review/cantum-polish/after-orbit.png) |
| Fade start 1.15x | [Before](review/cantum-polish/before-zoom-1_15.png) | [After](review/cantum-polish/after-zoom-1_15.png) |
| Midpoint 1.325x | [Before](review/cantum-polish/before-zoom-1_325.png) | [After](review/cantum-polish/after-zoom-1_325.png) |
| Complete 1.50x | [Before](review/cantum-polish/before-zoom-1_5.png) | [After](review/cantum-polish/after-zoom-1_5.png) |
| Portrait, renderer DPR=2 | [Before](review/cantum-polish/before-390x844-dpr2.png) | [After](review/cantum-polish/after-390x844-dpr2.png) |

Desktop and perspective retain the same six names and broad Drevnasel lettering;
stronger tint and translucent over-dot compositing make strokes more continuous.
Portrait gains clarity without changing geographic proportions. Small/short charts
still produce small type, especially compact Gornebes; this is a remaining natural
limit, not a reason to reinstate a CSS minimum or change the approved fade.
Mobile/reticle/interaction checks retain all stars. The fully transitioned 1.50x
PNG is byte-identical before/after; unchanged system captions dominate that view.
No responsive threshold adjustment was made.

## Pixel, geometry and interaction evidence

`tests/browser-cantum-composition.mjs` renders a bounded isolated GPU target using
clones of the real Drevnasel texture/material/plane and real gold marker material/
sphere. It does not modify the application map. At a solid glyph-interior sample,
the old draw sequence is `name, star` and the result is the full star RGB
**[202,166,92]**. The new sequence is `star, name`; text alone is **[20,98,142]**
and their composite is **[57,129,159]**, retaining about **18.5%** normalized RGB
contribution from the underlying gold dot. Moving the unrelated marker in front
of the plane yields the unchanged full star RGB, proving retained depth occlusion.
These are GPU render-target values, not edited screenshot colors.

`tests/browser-cantum-polish.mjs` compares each current view against the captured
starting world-space fingerprint: full labels, X/Z, both elevations, scales,
quaternions and raster dimensions all match exactly in every required camera,
zoom, viewport and DPR case. All **70** visible canonical marker centers resolve
to their original entities through the real picker. Hovered and selected reticles
both remain visible above the canvas; interactive captions retain full strength
even with Object Names off. The existing independent toggles, historical-name
filtering, navigation and resource regressions are rerun separately below.

## Validation, resources and preservation

Node **24.22.3**: `npm ci`, `npm test` (**388 passed, zero failures/skips**),
`npm run validate`, `npm run connections:check`, `npm run build`,
`npm run release:check`, and `git diff --check` pass. The audited build retains
33 admitted files and all exact pinned 16 SVG / 3 PNG / 8 MP3 originals; review
PNGs are documentation only. Existing Vite large-chunk advice and two moderate
npm dependency advisories remain, with no dependency or lockfile changes.

[Canonical preservation evidence](review/cantum-polish/preservation.json): all
five JSON files match both the starting commit and parent PR #4 **byte for byte**,
including all **234 dated descriptions**. Source owners for name rendering, marker
sizing, System View models, camera, scene layers, projected captions, influence
and reticles remain unchanged. The only fitting-module edit is the opacity
constant; Gaussian components, maximum rectangle/marker scoring, registered sigil
fallback, world geometry and historical inputs are unchanged.

Four full fixture remounts and repeated timeline/political transitions check
resource/listener stability and stale callbacks. Detailed timing and final browser
results are recorded in the current evidence summary below. No new texture,
geometry, material, draw pass or persistent listener is required by this polish.
Timing observations are local software-WebGL samples, not physical-device or
cross-browser performance certification.

## Final browser and resource results

[Current machine-readable evidence](review/cantum-polish/results.json),
[before capture/fingerprints](review/cantum-polish/before.json) and
[after capture/fingerprints](review/cantum-polish/after.json) record 14 distinct
browser callbacks, all with no unexpected page/console errors:

| Scope | Passed browser callbacks |
| --- | --- |
| Canonical dev | `browser-cantum-polish`, `browser-adaptive-nameplates`, `browser-control-bars` |
| Isolated archived fixture | `browser-phase3f-showcase`, `browser-cantum-sigils`, `browser-island-identities`, `browser-labeling`, `browser-influence-envelopes`, `browser-grid-zero`, `browser-viewer-modules` |
| Isolated governance | `browser-governing-influence` |
| Isolated calibration | `browser-cantum-calibration` (2 / 2.5 / 3 ly x top/perspective/low angle, pointer/touch/double click/keyboard, DPR=2, history/transfer, mobile) |
| Production preview | `browser-world-production`, `browser-release-readiness`, `browser-control-bars` |

The previously unverified governance and Phase 3F callbacks both pass. Governance
needed only an explicit Technical-tab click in its test adapter to match the
current Description-first InfoCard. No production interface change was required.
Political-transition counts are stable; all four full fixture remounts retain
11 geometries, 3 textures and 228 tracked listeners, with zero stale selections
or renders. Names/Object Names preferences, interactive caption overrides,
selection/hover reticles, historical names, navigation, influence alpha, absolute
grid elevation, invisible hit targets, media/entry and 10-second toolbars retain
their regression coverage.

The matched warm canonical sample has **79 main-scene draw calls, 80 geometries
and 8 textures in both versions** after perspective/return and the bounded GPU
test. Normal initial top overview remains 73 geometries / 7 textures. No new
render pass/resource is introduced. With requestAnimationFrame pacing, a GPU
finish before/after each frame, five warmups and 30 samples, before median/p95
was **4.7 / 35.0 ms**, after **5.1 / 32.5 ms**. These single local software-WebGL
runs show variable tail latency and are observations rather than a performance
promise, hardware benchmark or absolute heap/GPU leak certification.

The starting screenshots were captured with the two original `62c4927` source
files. A refresh used those original files to exercise the real camera button
and paced timing, restoring the final files automatically before the after run.
The final production diff remains only the two presentation values and their
explanatory comment. The final candidate SHA is reported in PR #5 and delivery;
working-tree/remote verification is part of closeout. Final creator visual review
is pending. Neither PR is merged, parent PR #4 is untouched, and no deployment,
tag or Release is performed. Version remains 1.0.0.

Remaining limits: 320px and short landscape charts naturally make compact names
small; low-angle foreshortening and unrelated foreground occlusion are preserved.
Dense overlapping information can still occur at the fade midpoint, governed by
the approved transition and collision rules. Only local Chrome emulated viewports
and renderer DPR=2 were checked; physical phones, other browser engines and
screen readers were not certified. No threshold or font-size exception was added.

## Current changed-file inventory and reproduction

- Production: `src/viewer/cartographic-layers.mjs`, `territorial-labels.mjs`.
- Tests: `tests/labeling.test.mjs`, `browser-adaptive-nameplates.mjs`,
  `browser-governing-influence.mjs` (explicit Technical tab selection for the
  current InfoCard), plus `browser-cantum-composition.mjs` and
  `browser-cantum-polish.mjs`.
- Active instructions/docs: `AGENTS.md`, `docs/ARCHITECTURE.md`,
  `CARTOGRAPHIC_LABELING.md`, `CANTUM_TERRITORY_RENDERING.md`,
  `NEXUS_VISUAL_IDENTITY.md`, `VIEWER_SPECIFICATION.md`, `PROJECT_STATUS.md`
  and this PR #5 record.
- Review evidence: `docs/review/cantum-polish/` (11 matched PNG pairs,
  starting/final view and compositing JSON, preservation and regression summary).

Run Node 24 checks, then `npm run atlas`. Execute
`tests/browser-cantum-polish.mjs` with the existing local Playwright callback
harness; it defaults to the final after comparison. `CANTUM_POLISH_PHASE=before`
is used only with the two original starting source files from `62c4927` to capture
the baseline. The full geometry remains fixed. Existing regressions run against
Canonical, the explicit archived/governance/calibration fixtures and production
preview one active development configuration at a time. Prior world-space review
PNGs below remain frozen and are not overwritten by the current regression runs.

Both PRs remain unmerged, PR #5 remains draft, and the parent branch is untouched.
No deployment, tag, Release or version change. Stop for creator final visual review.

---

## Previous world-space review record at 62c4927


The subsequent 2026-11-20 creator request revises the existing draft PR #5 from
`bd8d2dafab722b0a98b2beb9c1f6c39589e27717` on
`refine/cantum-adaptive-nameplates`. Parent PR #4 stays at
`e1ae55c1ea65477b003278bc49f2090fa662172f`. The original horizontal-fit report
below is retained as historical evidence; its appearance-preservation statements
are superseded by this revision. Final creator visual approval is pending.
Version remains **1.0.0 canonical launch candidate**, as explicitly requested;
no increment is warranted for this same candidate's presentation refinement.

## Verified browser closeout

[Machine-readable current evidence](review/cantum-world/results.json) records:

| Browser callback | Result |
| --- | --- |
| `browser-adaptive-nameplates` | Canonical 1200, exact transition/midpoint, hover/focus/selection, independent toggles, history, all 70 marker centers, fixed dimensions at 390x844 / 320x568 / 844x390, perspective/orbit/low angle: PASS |
| `browser-cantum-sigils` | Unicode shaping/sigil gap, shared raster, registered image paint, full-name/sigil-only failures and exactly one disposal per shared texture/material/geometry: PASS |
| `browser-island-identities` | Full-name plus detached fallback, local negative/positive elevations, zoom/tilt/orbit, failed/null/unknown identities and lifecycle: PASS |
| `browser-labeling` | Object caption sizes/collisions, hover/focus/selection, independent per-view layers, navigation, historical names, sparse/minor captions, 300-object dense memory fixture: PASS |
| `browser-influence-envelopes` | Unchanged field colors/flat texture, front/back .22 alpha cap, history, layer independence, disposal and DPR: PASS |
| `browser-grid-zero` | Sector scale, all real archived system grids at absolute Y=0, authored XYZ and navigation/layer preferences: PASS |
| `browser-viewer-modules` | Four full remounts: each 11 geometries / 3 textures / 228 tracked listeners; no stale selections/renders: PASS |
| `browser-cantum-calibration` | All 2 / 2.5 / 3 ly radii in top/perspective/10-degree modes, actual full names plus detached sigil, null-sigil transfer, pointer/touch/double-click/keyboard, DPR=2, mobile and resource rebuilds: PASS |
| `browser-world-production` | Built-bundle overview/1.4x/close hierarchy, interaction override, perspective and mobile portrait/landscape: PASS |
| `browser-release-readiness` | Production canonical narratives, history boundaries, InfoCards, archival navigation, mobile layout, retired Demo 404 and public requests: PASS |

All these callbacks reported no unexpected console/page errors. Calibration and
archived synthetic fixtures ran separately from Canonical. Governance/Phase 3F
browser adapters were updated to read world resources; those two specialized UI
callbacks were not rerun in this revision. Their Node regressions remain in the
388-test pass. `npm ci` completed with two moderate dependency advisories; the
dependency manifests/lockfile are unchanged. No dependency upgrade is part of this
presentation request.

The existing PR #5 remains open and draft, targeting PR #4's branch. The final
candidate SHA is identified in the PR description and delivery. Neither PR is
merged; no parent update, Pages dispatch, tag or Release was performed. Stop for
creator world-space typography review.

## Current rendering and fitting

See the authoritative [world-space contract](CARTOGRAPHIC_LABELING.md#world-space-typography-and-coordinated-visibility---2026-11-20).
Original browser-generated CanvasTextures use available system fonts, Unicode
shaping and complete name/sigil metrics. One shared unit plane lies on X/Z,
facing +Y, with north at -Z. It never billboards, rotates toward a camera,
wraps, truncates or stretches glyphs. Camera and viewport changes preserve the
saved dimensions and topology. Depth testing is enabled, depth writing disabled,
and decorative raycasting is disabled. Markers/routes/reticles retain their
existing owners, order and interaction targets.

The original Gaussian field, thresholds, 128x128 grid, four-neighbor components
and 24-cell minimum are unchanged. For each eligible interior cell, a bounded
12-step search finds the largest full proportional rectangle whose padded row
runs remain inside that component. Apply one-cell padding and a 90% size margin.
Among candidates within 85% of the largest height, prefer marker/symbol clearance,
size, interior depth and field-weighted balance. The upper limits are 60% chart
width and 12% chart height before the 90% safety scale; neither limit binds the
six canonical 1200 A.E. names. The 14/768 reference-font floor gates impractical
full names; it is not a displayed font cap. Registered sigil-only fallbacks and
multiple-component identities remain supported without geographic bridges.

All variants store component-specific contributing system IDs. Each plane clears
its local highest eligible star Y plus modest chart-relative clearance. Perspective
also clears its envelope half-height and actual whole-box envelope extrema/edge
samples. This is computed once per resolved replacement, with no camera-frame
sampling or remote-island highest-star substitution.

The coordinated smoothstep starts at **1.15x**, completes at **1.50x**, and yields
Cantum/passive-system opacities **.46/0** at overview, **.23/.50** at **1.325x**,
and **0/1** at 1.50x and beyond. Hover, focus and selection stay full strength,
including with Object Names off. Cantum Names off or no eligible full names
bypasses passive suppression. Object Names off hides passive captions at every
zoom. System View captions, collision rules and influence visibility are separate.

## Canonical before/after and visual review

Screenshots are captured from the real silent-entry Atlas at 1200 A.E. in local
Chrome with reduced motion, not mockups. The task text described a handwritten
reference but did not include that image attachment; comparisons therefore use
the captured starting PR #5 render and the requested broad, straight scale.

| Cantum | Starting fitted width (ly) | World width x height (ly) | Full-name contributors |
| --- | ---: | ---: | ---: |
| Drevnasel | 7.403 | 13.168 x 3.479 | 10 |
| Visshum | 6.290 | 8.117 x 2.510 | 6 |
| Okeanberg | 8.221 | 8.119 x 1.937 | 9 |
| Vodravan | 7.046 | 9.664 x 2.679 | 5 |
| Gornebes | 7.163 | 5.800 x 1.582 | 6 |
| Zaklun | 5.081 | 8.118 x 3.082 | 6 |

All six receive complete names. No canonical 1200 component uses a sigil-only
fallback; canonical records have no registered sigils. Rekdolin has zero eligible
positioned contributors, so no invented territory/nameplane is added. Drevnasel
is 1.78 times its prior fitted width and 2.27 times Gornebes's current width.
Compact Okeanberg/Gornebes are constrained by their actual regions rather than
a universal font cap. At overview the passive caption clutter is removed while
all 70 marker centers remain pickable. At the midpoint, both information levels
are dimmed; close zoom restores passive system names through the existing layout.

| Review | Screenshots |
| --- | --- |
| Starting PR #5 | [Overview](review/cantum-world/before-overview-bd8d2da.png), [perspective](review/cantum-world/before-perspective-bd8d2da.png) |
| World overview | [1200 A.E.](review/cantum-world/overview-1200.png) |
| Crossfade | [1.15x](review/cantum-world/zoom-1_15.png), [1.325x](review/cantum-world/zoom-1_325.png), [1.50x](review/cantum-world/zoom-1_5.png), [1.80x](review/cantum-world/zoom-1_8.png) |
| Perspective | [Standard](review/cantum-world/perspective-1200.png), [orbited](review/cantum-world/orbit-1200.png), [10-degree angle](review/cantum-world/low-angle-1200.png) |
| Mobile | [390x844](review/cantum-world/mobile-390x844.png), [320x568](review/cantum-world/mobile-320x568.png), [844x390](review/cantum-world/mobile-844x390.png) |
| History | [299](review/cantum-world/history-299.png), [360](review/cantum-world/history-360.png), [800](review/cantum-world/history-800.png) |
| Production preview | [Perspective](review/cantum-world/production-perspective.png), [portrait](review/cantum-world/production-390x844.png), [landscape](review/cantum-world/production-844x390.png) |

Desktop top/perspective/orbit screenshots show fixed geographic orientation and
natural foreshortening without mirrored text. Portrait/landscape preserve the
same territory proportions. Short landscape produces small geographic text as
the square chart shrinks; this is expected, not a minimum-CSS-size promise.
Dense markers can still cross letters where all near-maximal rectangles overlap
stars; actual symbols and interactive captions retain precedence. Different
Cantums' overlapping fields are not repartitioned. Low angles can flatten or
naturally clip text. Available platform fonts may change metrics. Only emulated
Chrome sizes are covered; physical phones, other engines and screen readers
were not exercised. Creator visual scale/transition-speed review remains open.

## Resource ownership and checks

One geometry per resolved map; at most one raster/material per Cantum/variant,
shared across its disconnected components. Rasters are bounded to 2048x512 at
up to 3x source resolution, with filtered mipmaps for minification. The six
canonical name rasters total approximately 7.35 MiB including mip levels
(excluding driver overhead). At top overview the renderer reports 73 geometries
and 7 textures, including existing chart resources. Repeated history changes
stay within the warmed perspective allocation budget. System/archival navigation
clears all text resources; remount/disposal checks exercise handler cancellation
and exact once-only texture/material/geometry disposal. No downloaded font,
new dependency or runtime artwork is introduced. Review PNGs are documentation
only and absent from the audited build.

Node **24.22.3** validation: `npm ci`; `npm test` (**388/388**); `npm run validate`;
`npm run connections:check`; `npm run build`; `npm run release:check`; and
`git diff --check`. The audited build contains 33 files, the same exact admitted
16 SVG / 3 PNG / 8 MP3 assets, no archived Demo or private/source-map references,
and the verified canonical dataset. Vite retains its advisory for a chunk over
500 kB. Browser-specific results and the final commit are recorded in the PR
closeout below.

All five canonical JSON files are byte-identical to starting `bd8d2da`; the
234 description records and their text are unchanged. SHA-256 pins remain those
in the historical table below. Core/resolver/schema, coordinates, influence
geometry/compositing, assets/audio, camera controls and publication workflows
have no changes. No merge, deployment, tag or Release is authorized or performed.

## Current modified-file inventory

- Renderer: `src/viewer/territorial-labels.mjs`, `cantum-nameplates.mjs`,
  `projected-labels.mjs`, `caption-layout.mjs`, `scene-layers.mjs`, `map-scene.mjs`,
  `style.css`.
- Node coverage: `tests/labeling.test.mjs`, `phase3f-integration.test.mjs`
  (the latter accepts a full identity when maximum world fitting now permits it).
- Browser coverage: `tests/browser-adaptive-nameplates.mjs`,
  `browser-world-state.mjs`, `browser-world-production.mjs`,
  `browser-labeling.mjs`, `browser-island-identities.mjs`,
  `browser-cantum-sigils.mjs`, `browser-cantum-calibration.mjs`,
  `browser-grid-zero.mjs`, `browser-influence-envelopes.mjs`,
  `browser-governing-influence.mjs`, `browser-phase3f-showcase.mjs`.
- Active instructions/docs: `AGENTS.md`, `docs/ARCHITECTURE.md`,
  `CARTOGRAPHIC_LABELING.md`, `CANTUM_TERRITORY_RENDERING.md`,
  `NEXUS_VISUAL_IDENTITY.md`, `VIEWER_SPECIFICATION.md`, `PROJECT_STATUS.md`,
  this record and the reproduction notes in `LOCAL_DEVELOPMENT.md`.
- Evidence: `docs/review/cantum-world/*.png` and current browser result JSON.

---

## Historical report: initial adaptive horizontal fitting at bd8d2da


The 2026-11-20 creator task refines geographic fitting while retaining the existing
nameplate appearance. Creator visual approval is pending. This work is isolated
on `refine/cantum-adaptive-nameplates`, stacked on PR #4 at
`e1ae55c1ea65477b003278bc49f2090fa662172f`. Neither PR is merged or deployed.
Version remains **1.0.0 canonical launch candidate** by explicit creator request;
this preparation refinement warrants no version increment.

## Implementation

`territorial-labels.mjs` retains Gaussian fields, thresholds, 128×128 sampling,
four-neighbor components, the 24-cell minimum, historical identities and bounded
eight-input cache. Every full-name candidate uses a horizontal rectangle. Row
runs intersect across its entire measured height plus one-cell padding per side;
all eligible interior cells compete, including broad lobes outside the previous
deepest-64 shortlist. Candidates first prefer the existing conservative 15px
marker budget, then avoidance of the existing 4px visible symbol where full
clearance is impossible. Usable width, interior depth, rectangle-to-marker
clearance and weighted-center proximity rank candidates; cell index resolves ties.
Eligible unassociated system markers also participate in full-name scoring.

`cantum-nameplates.mjs` measures complete resolved names with hidden DOM probes
at the fixed 768px reference overview, using the existing font clamp (20.736px at
that reference). Actual browser shaping, font weight/family, letter spacing,
padding, line height, registered sigil size and gap determine the complete box.
Measurements round upward to 1/64px. Placeholders reserve sigil dimensions without
another image request; probes are removed synchronously. Map span / 768 converts
the box into geographic dimensions. No topology or measurement runs per frame.

The original `nameplateProjection()`, `territorialOpacity()`, CSS and sigil-only
fallback are unchanged. Typography stays 14–24 CSS px, weight 600, horizontal and
camera-facing, with the original font family, spacing, tint, shadow, sigil clamp,
edge containment and zoom-only fading. No schema, history, data or asset migration
is involved. [Full active contract](CARTOGRAPHIC_LABELING.md#adaptive-horizontal-fitting-refinement--2026-11-20).

## Before/after method

`tests/browser-adaptive-nameplates.mjs` loads the actual parent algorithm with
`git show` at the pinned SHA, reproduces its 500/64px per-glyph aspect estimates,
and compares it with current placements using independently measured full CSS
boxes. Synthetic shapes from `tests/nameplate-shapes.mjs` are memory-only, never
canonical or production inputs. Canonical comparisons use the actual resolver
and approved dataset. Browser measurement also independently checks a real
registered image, Unicode shaping, added test-only CSS padding and flex gap.

All distances below are in ly unless marked CSS px. Usable horizontal span is
the symmetric interior width after padding, intersected across the complete
padded height. Contour clearance is an approximate lower bound from the nearest
noncomponent sample minus half a cell diagonal; it is not a legal boundary.
The legacy estimated dimensions describe its geometric eligibility box, whose
angle could differ from the displayed text. The current eligibility box equals
the measured complete reference box, with separate one-cell fitting padding.
Marker overlap tests use that actual horizontal reference box, with both the
visible 4px radius and conservative 15px budget. They do not certify caption
separation at every camera or mobile size.

Every previously valid full horizontal box remains eligible in these comparisons;
previously clear visible markers remain clear. No label is added by shrinking,
truncating, stretching, abbreviating or rotating text.

## Synthetic results

| Case / component | Before → after | X/Z anchor before → after (ly) | Usable horizontal span before → after (ly) | Previous horizontal box valid? |
| --- | --- | --- | --- | --- |
| wide / test:0 | name → name | (-17.97, -0.78) → (-0.78, -8.59) | 82.81 → 104.69 | yes |
| tall-narrow | omitted → omitted | — | — | no label |
| tall-with-shoulder / test:0 | name → name | (5.47, 24.22) → (-0.78, 24.22) | 42.19 → 51.56 | yes |
| diagonal / test:0 | name → omitted | (-5.47, -5.47) → (—) | 23.44 → — | no |
| crescent / test:0 | name → name | (-14.84, 38.28) → (-0.78, 35.16) | 32.81 → 67.19 | no |
| L-shaped / test:0 | name → name | (-17.97, 38.28) → (7.03, 35.16) | 54.69 → 104.69 | yes |
| broad-lobe / test:0 | name → name | (-13.28, 33.59) → (0.78, 32.03) | 51.56 → 79.69 | yes |
| disconnected / test:0 | name → name | (-53.91, -5.47) → (-58.59, -10.16) | 42.19 → 45.31 | yes |
| disconnected / test:1 | name → name | (53.91, -5.47) → (58.59, -10.16) | 42.19 → 45.31 | yes |
| tiny | omitted → omitted | — | — | no label |
| small-sigil / test:0 | sigil → sigil | (-0.78, -0.78) → (-0.78, -0.78) | 7.81 → 7.81 | yes |
| dense / test:0 | name → name | (-5.47, -0.78) → (-0.78, -32.03) | 92.19 → 82.81 | yes |
| long-name | omitted → omitted | — | — | no label |
| unicode / test:0 | name → name | (-3.91, -0.78) → (-0.78, -8.59) | 110.94 → 104.69 | yes |

| Case / component | Complete box at reference (CSS px) | Complete reference box (ly) | Legacy estimated box (ly) | Center contour clearance before → after (ly) | Visible 4px symbol overlap before → after | 15px budget overlap before → after |
| --- | --- | --- | --- | --- | --- | --- |
| wide / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 68.57 × 12.95 | 16.08 → 8.27 | yes → no | yes → no |
| tall-narrow | 139.98 × 24.88 | 36.45 × 6.48 | — | — | — | — |
| tall-with-shoulder / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 30.12 × 5.69 | 16.57 → 19.92 | yes → yes | yes → yes |
| diagonal / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 47.06 × 8.89 | 11.10 → — | no → — | yes → — |
| crescent / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 50.02 × 9.45 | 12.25 → 5.15 | yes → no | yes → yes |
| L-shaped / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 54.59 × 10.31 | 13.64 → 8.27 | no → no | yes → no |
| broad-lobe / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 50.02 × 9.45 | 9.94 → 5.15 | yes → no | yes → no |
| disconnected / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 40.34 × 7.62 | 20.60 → 17.65 | no → no | yes → no |
| disconnected / test:1 | 139.98 × 24.88 | 36.45 × 6.48 | 40.34 × 7.62 | 20.60 → 17.65 | no → no | yes → no |
| tiny | 167.97 × 24.88 | 43.74 × 6.48 | — | — | — | — |
| small-sigil / test:0 | 24.00 × 24.00 | 6.25 × 6.25 | 6.25 × 6.25 | 6.71 → 6.71 | yes → yes | yes → yes |
| dense / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 68.57 × 12.95 | 41.08 → 9.83 | yes → no | yes → no |
| long-name | 2877.77 × 24.88 | 749.42 × 6.48 | — | — | — | — |
| unicode / test:0 | 210.17 × 24.88 | 54.73 × 6.48 | 98.89 × 12.59 | 16.08 → 8.27 | yes → no | yes → no |

The broad lobe gains usable width (51.56 → 79.69 ly) and avoids markers while
accepting less center depth. The crescent moves from an invalid horizontal box to
a valid interior shelf. The diagonal name is intentionally omitted: its old
rotated fit left only 23.44 ly for a 36.45-ly actual horizontal box. The tall narrow
case, tiny holding and 2877.77px complete long name remain omitted. The small
registered-sigil case retains the exact existing fallback anchor and size.
Disconnected regions retain independent identities; the dense case finds a
clear alternative; the complete Unicode name fits without abbreviation.

## Calibration eligibility corrections

The unchanged 40-ly calibration has a complete A name/sigil box of 250.48 ×
24.88 CSS px (13.05 × 1.30 ly at reference) and a B name-only box of 221.11 ×
24.88 CSS px (11.52 × 1.30 ly). At 2/2.5 ly, the A main component cannot fit
that complete box, so it uses its existing registered sigil-only fallback.
At 2 ly, B also cannot fit and has no registered sigil, so it is omitted.
At 3 ly both full names fit; the detached A outpost retains its existing fallback.
The baseline comparison below identifies its previously invalid horizontal boxes.

| Case / component | Before → after | X/Z anchor before → after (ly) | Usable horizontal span before → after (ly) | Previous horizontal box valid? |
| --- | --- | --- | --- | --- |
| calibration-2 / can_9101:0 | sigil → sigil | (11.09, -8.59) → (11.09, -8.59) | 1.56 → 1.56 | yes |
| calibration-2 / can_9101:1 | name → sigil | (-8.91, -1.41) → (-8.91, -1.41) | 10.94 → 10.94 | no |
| calibration-2 / can_9102:0 | name → omitted | (7.97, 8.59) → (—) | 10.94 → — | no |
| calibration-2.5 / can_9101:0 | sigil → sigil | (8.59, -8.91) → (8.59, -8.91) | 2.19 → 2.19 | yes |
| calibration-2.5 / can_9101:1 | name → sigil | (-9.22, -1.41) → (-8.91, -1.41) | 12.19 → 12.19 | no |
| calibration-2.5 / can_9102:0 | name → name | (7.97, 8.59) → (7.97, 8.59) | 12.81 → 12.81 | yes |
| calibration-3 / can_9101:0 | sigil → sigil | (8.59, -8.91) → (8.59, -8.91) | 3.44 → 3.44 | yes |
| calibration-3 / can_9101:1 | name → name | (-9.22, -1.41) → (-8.91, -1.41) | 14.06 → 14.06 | yes |
| calibration-3 / can_9102:0 | name → name | (8.28, 8.59) → (7.97, 5.47) | 14.06 → 12.19 | yes |

| Case / component | Complete box at reference (CSS px) | Complete reference box (ly) | Legacy estimated box (ly) | Center contour clearance before → after (ly) | Visible 4px symbol overlap before → after | 15px budget overlap before → after |
| --- | --- | --- | --- | --- | --- | --- |
| calibration-2 / can_9101:0 | 24.00 × 24.00 | 1.25 × 1.25 | 1.25 × 1.25 | 1.18 → 1.18 | no → no | yes → yes |
| calibration-2 / can_9101:1 | 24.00 × 24.00 | 1.25 × 1.25 | 10.26 × 1.22 | 4.15 → 4.15 | no → no | yes → no |
| calibration-2 / can_9102:0 | 221.11 × 24.88 | 11.52 × 1.30 | 10.28 × 1.23 | 4.15 → — | no → — | yes → — |
| calibration-2.5 / can_9101:0 | 24.00 × 24.00 | 1.25 × 1.25 | 1.25 × 1.25 | 1.60 → 1.60 | no → no | no → no |
| calibration-2.5 / can_9101:1 | 24.00 × 24.00 | 1.25 × 1.25 | 11.37 × 1.35 | 5.09 → 5.09 | no → no | yes → no |
| calibration-2.5 / can_9102:0 | 221.11 × 24.88 | 11.52 × 1.30 | 11.98 × 1.43 | 5.09 → 5.09 | no → no | yes → yes |
| calibration-3 / can_9101:0 | 24.00 × 24.00 | 1.25 × 1.25 | 1.25 × 1.25 | 2.16 → 2.16 | no → no | no → no |
| calibration-3 / can_9101:1 | 250.48 × 24.88 | 13.05 × 1.30 | 13.08 × 1.55 | 6.03 → 6.03 | no → no | yes → yes |
| calibration-3 / can_9102:0 | 221.11 × 24.88 | 11.52 × 1.30 | 13.08 × 1.56 | 6.03 → 3.22 | no → no | yes → no |


## Canonical 1200 A.E.

Six names remain eligible: Drevnasel, Visshum, Okeanberg, Vodravan, Gornebes and
Zaklun. Existing visible-symbol overlaps fall from five to one at the reference
scale. Gornebes remains the crowded case; every candidate satisfying the complete
name fit still fails visible-symbol clearance. All six still intersect the
conservative 15px budget. Separate Cantums remain independent overlapping fields.

| Case / component | Before → after | X/Z anchor before → after (ly) | Usable horizontal span before → after (ly) | Previous horizontal box valid? |
| --- | --- | --- | --- | --- |
| canonical-1200 / can_1000001:0 | name → name | (7.09, -8.81) → (8.81, -7.09) | 9.02 → 14.18 | yes |
| canonical-1200 / can_1000002:0 | name → name | (-15.25, -17.40) → (-16.54, -16.11) | 9.88 → 9.88 | yes |
| canonical-1200 / can_1000003:0 | name → name | (-10.53, -8.81) → (-10.10, -10.10) | 9.02 → 9.02 | yes |
| canonical-1200 / can_1000005:0 | name → name | (13.96, 1.93) → (13.96, 1.93) | 7.30 → 7.30 | yes |
| canonical-1200 / can_1000006:0 | name → name | (5.37, 5.80) → (5.37, 5.80) | 7.30 → 7.30 | yes |
| canonical-1200 / can_1000007:0 | name → name | (-2.79, 3.22) → (-2.79, 4.08) | 9.88 → 9.02 | yes |

| Case / component | Complete box at reference (CSS px) | Complete reference box (ly) | Legacy estimated box (ly) | Center contour clearance before → after (ly) | Visible 4px symbol overlap before → after | 15px budget overlap before → after |
| --- | --- | --- | --- | --- | --- | --- |
| canonical-1200 / can_1000001:0 | 103.38 × 24.88 | 7.40 × 1.78 | 13.44 × 3.38 | 3.54 → 3.99 | yes → no | yes → yes |
| canonical-1200 / can_1000002:0 | 87.83 × 24.88 | 6.29 × 1.78 | 11.25 × 3.33 | 3.75 → 2.58 | yes → no | yes → yes |
| canonical-1200 / can_1000003:0 | 114.80 × 24.88 | 8.22 × 1.78 | 9.56 × 2.18 | 4.73 → 4.08 | yes → no | yes → yes |
| canonical-1200 / can_1000005:0 | 98.39 × 24.88 | 7.05 × 1.78 | 7.31 × 1.91 | 2.45 → 2.45 | no → no | yes → yes |
| canonical-1200 / can_1000006:0 | 100.02 × 24.88 | 7.16 × 1.78 | 7.84 × 2.05 | 3.05 → 3.05 | yes → yes | yes → yes |
| canonical-1200 / can_1000007:0 | 70.95 × 24.88 | 5.08 × 1.78 | 8.80 × 3.20 | 4.12 → 4.50 | yes → no | yes → yes |

## Historical eligibility

| A.E. | Previous labels | Refined labels | Previously valid horizontal names retained |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 / 0 |
| 299 | 1 | 1 | 0 / 0 |
| 300 | 1 | 1 | 0 / 0 |
| 344 | 1 | 1 | 0 / 0 |
| 345 | 1 | 1 | 0 / 0 |
| 359 | 1 | 1 | 0 / 0 |
| 360 | 1 | 1 | 0 / 0 |
| 699 | 1 | 1 | 1 / 1 |
| 700 | 1 | 1 | 1 / 1 |
| 799 | 1 | 1 | 1 / 1 |
| 800 | 1 | 1 | 1 / 1 |
| 999 | 3 | 2 | 2 / 2 |
| 1000 | 4 | 3 | 3 / 3 |
| 1174 | 6 | 6 | 6 / 6 |
| 1175 | 6 | 6 | 6 / 6 |
| 1199 | 6 | 6 | 6 / 6 |
| 1200 | 6 | 6 | 6 / 6 |

Okeanberg is intentionally omitted at 999–1000 A.E.: the previous horizontal
anchor offered 6.45 ly for its 8.22-ly reference name, and no complete padded
horizontal candidate fits that component. There is no registered canonical sigil
to authorize a substitute. Its later 1199–1200 name remains eligible. At 299–300,
Drevnasel instead gains a valid horizontal anchor. The actual Cantum rename at
359/360 and postwar changes at 1174/1175 are checked in the real UI; repeated
year updates expose only currently resolved names with one DOM root and stable
GPU texture counts.

## Performance and limitations

Illustrative cold-placement browser timings (milliseconds, single local samples):

| Case | Previous | Refined |
| --- | --- | --- |
| wide | 61.80 | 31.90 |
| broad-lobe | 33.00 | 27.70 |
| small-sigil | 4.20 | 3.30 |
| dense | 53.70 | 36.80 |
| canonical-1199 | 84.40 | 56.10 |

These software-WebGL samples are not a hardware benchmark. Cache hits can round
to zero. There is no demonstrated material performance regression; tiny/fallback
cases can vary by sub-millisecond or low-millisecond noise. Camera motion only
projects existing anchors. Resource checks cover repeated updates, removal of
measurement probes, stale-image listeners and DOM/GPU counts; they are not heap
or GPU-memory certification.

Reference-overview eligibility does not promise screen-space territorial
containment at every mobile width, zoom or low-angle perspective. The original
14px floor and viewport containment can make text larger relative to geography
on small charts; tilt can crowd separate names. Dense system captions can still
overlap decorative nameplates. Geographic fit takes precedence over adding
labels; no cross-Cantum partitioning or new caption decluttering is introduced.
System-font fallback differs by platform. Firefox, Safari and physical mobile
hardware were not tested; creator visual acceptance remains required.

## Reproducing review

Run `npm ci`, then `npm run atlas`, and open
`http://127.0.0.1:5173/Velara_Atlas/`. Enter silently or use the existing audio
choice. At 1200 A.E. inspect top-down and perspective views, low tilt/orbit,
overview/zoom, independent Names/Influence toggles, Catalogue, InfoCards, History
and system archival navigation. Check 299, 359/360, 999/1000, 1174/1175 and 1200.
Inspect 1440×1000, 390×844, 320×568 and 844×390 viewports.

Run browser callback files through the existing Playwright callback runner from
the repository root. Use reduced motion for fixed-size assertions so reserved
toolbar resize animation does not contaminate them. The browser MCP transport
was unavailable during this task; verification used the already-installed
Playwright and Chrome with software WebGL, without adding project dependencies.
Run one preview configuration at a time to avoid their shared Vite dependency
cache being invalidated by other server/test configurations.

Local screenshot evidence is ignored under `.playwright-mcp/`:
`cantum-before-desktop.png`, `cantum-after-desktop.png`,
`cantum-after-perspective.png`, `cantum-after-390x844.png`,
`cantum-after-320x568.png` and `cantum-after-844x390.png`.
The callback returns full numerical comparison JSON for independent inspection.
Screenshots were visually inspected; use the live preview instructions when
reviewing the PR on another machine. No screenshot is added as a production asset.

## Modified-file inventory

- `src/viewer/territorial-labels.mjs`: horizontal fitting and candidate scoring.
- `src/viewer/cantum-nameplates.mjs`: complete CSS-box measurements and eligible marker inputs.
- `tests/nameplate-shapes.mjs`: memory-only representative shape factory.
- `tests/labeling.test.mjs`: deterministic horizontal geometry/measurement regressions.
- `tests/island-identities.test.mjs`: clarifies the retained fallback test title; assertions unchanged.
- `tests/browser-adaptive-nameplates.mjs`: baseline comparisons, real canonical browser and screenshot checks.
- `tests/browser-cantum-sigils.mjs`: checks the existing responsive CSS clamp instead of assuming every desktop chart reaches 24px.
- `tests/browser-cantum-calibration.mjs`: checks measured full-name eligibility and the retained outpost/transfer rules at all three radii.
- `docs/CARTOGRAPHIC_LABELING.md`, `docs/CANTUM_TERRITORY_RENDERING.md`, `docs/VIEWER_SPECIFICATION.md`: active refinement contract.
- `docs/PROJECT_STATUS.md`: isolated authorization and review gate.
- `docs/LOCAL_DEVELOPMENT.md`: explains corrected identity variants in the unchanged calibration fixtures.
- `docs/CANTUM_NAMEPLATE_REFINEMENT.md`: this comparison/validation evidence.

## Validation and preservation

Final required commands all exited **0** under **Node.js 24.22.3**:
`npm ci`, `npm test`, `npm run validate`, `npm run connections:check`,
`npm run build`, `npm run release:check` and `git diff --check`.
The full suite passed **385 tests, zero failures/skips**. The build/release audit
verified the selected canonical dataset and all 33 output files, including the
sixteen exact SVGs, three exact PNGs and eight exact MP3s. The existing large-JS-
bundle advisory remains; no dependency or warning threshold was changed.

Six Chromium browser callbacks passed: `browser-labeling.mjs`,
`browser-cantum-sigils.mjs`, `browser-adaptive-nameplates.mjs`,
`browser-control-bars.mjs`, `browser-release-readiness.mjs` and
`browser-cantum-calibration.mjs`. The adaptive callback compares 13 memory-only
shapes, 17 canonical historical snapshots and three existing calibration radii.
It retains every previously valid horizontal full name and every previously
clear visible symbol. Calibration verifies all nine radius/camera combinations,
historical transfer, touch/picking, high DPI, resource reuse and mobile views.
Canonical checks include the real Cantum rename, postwar years, Catalogue,
InfoCards, Help, exact toolbar deadlines, archival navigation and responsive
portrait/landscape layouts. Normal runs report no runtime/console errors; one
deliberately aborted sigil request verifies the existing image-failure fallback.

The independent diff audit permits only the fourteen files inventoried above.
It confirms that `fieldComponents()`, `nameplateProjection()`,
`containNameplate()`, `territorialAnchorY()`, `territorialOpacity()` and the
sigil-only fallback code are unchanged. No protected data, core/resolver/schema,
coordinates, political history, influence/camera rendering, chart/grid, NEXUS
interface/audio owner, artwork or deployment workflow changed. Historical reports
remain intact; package metadata stays at 1.0.0.

All five canonical files match the parent **byte for byte**, preserving all 234
descriptions. SHA-256:

| File | Hash |
| --- | --- |
| `cantums.json` | `a5519e3735d47a091a5e47de63f2b88d680aa3413c218190b58b4d1c5a0b0c5c` |
| `connections.json` | `217779677717f8a86e7684230de849f0305cb090abceb882cbb68eb594db0809` |
| `factions.json` | `2f17c91597a35d61d4a40d62e93bc44f0fb32e3e4aefcde946a47df64dccce36` |
| `presentation.json` | `4165d339ba486e381af34643ce0fe530df2a7d27b2e440e230678cc88e82d5a7` |
| `sector.json` | `5d0244e429daec57a5f876bc363ad11dbc5998b9e88be41b7b35cefc04201b3c` |

Local validation does not constitute creator acceptance, hosted-CI certification
or publication. Integration into PR #4, either merge, Pages dispatch, tag and
Release remain separately gated. Stop for creator visual review.
