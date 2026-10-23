# Velara Atlas — Implemented architecture

**Status:** Runtime baseline from `190bd21`, with Phase 2 paths updated from
`main` at `6ae6ee2` (2026-10-20). The local
noncanonical viewer includes Checkpoint 4.1 Phase 3, the sector grid, Cantum
Stages 1–4 and intermediate calibration, retaining Checkpoint 3.8 zones,
cartographic labeling, Checkpoint 3.6 layout and version-aware v1.2/v1.3 navigation authoring.
Architecture Phase 2 is committed in `6e026cb`; Architecture Phases 3A, 3B, 3C, 3D, 3E and 3F
are complete and creator-approved. Overall Architecture Phase 3 is complete.
Architecture Phases 4, 5 and 6 are complete and creator-approved; the current
optimization roadmap is complete. Canonical migration, final artwork, deployment,
the local editor and all subsequent development remain separately gated.
Use the [index](INDEX.md) for authority and the
[migration inventory](archive/completed-tasks/PHASE_02_DATASET_MIGRATION_INVENTORY.md) for historical planning context, not operating instructions.

## Runtime responsibilities

| Module | Responsibility |
| --- | --- |
| `src/core/history.mjs` | Pure v1.1/v1.2 historical selectors: names, knowledge/existence, InfoCards, systems, zones and eligible connections; no I/O or renderer dependency |
| `src/core/cartography.mjs` | Pure map/catalogue composition, search, exact recorded-year boundaries, scoped route points/destinations, Cantum field calculations and seeded zone sampling |
| `src/core/zone-geometry.mjs` | Pure zone validation/intersection, concave footprint clipping, projected membership, clipped ray intervals, witnesses, overlap ordering and bounded particles; shared by validator and viewer |
| `src/viewer/zone-layers.mjs` | Clipped system-zone footprints, bounded approximate 3D cloud slices/particles, mode switching and subtle hover/selection emphasis |
| `src/viewer/zone-outline.mjs` | Pointer-transparent 2D SVG hover/focus contours, constant CSS stroke, solid authored boundaries and dashed chart-clipping edges; no hit testing |
| `src/viewer/demo-data.mjs` | Validated virtual-module registry imports and generated detail callbacks; eagerly preloads every registered released detail for endpoint eligibility |
| `src/viewer/main.mjs` | Validated loader and application composition, selection/navigation callbacks, historical refresh and technical-error/retry boundary |
| `src/viewer/map-scene.mjs` | Stable AtlasMap facade, renderer and ordered coordination of camera, interaction, layers and projection owners |
| `src/viewer/target-reticle.mjs` | Two decorative cyan/gold UI indicators consuming final shared anchor visibility and selected/hover state; no projection, picking, extra renderer or animation loop |
| `src/viewer/map-transition.mjs` | One finite decorative destination reveal, reduced-motion/input cancellation and lifetime cleanup; no history, scene or camera state |
| `src/viewer/visual-config.mjs`, `celestial-scale.mjs` | Central CSS minima and handoff ratio; pure physical-radius and camera-projection math |
| `src/viewer/sector-markers.mjs` | Inverts active sphere projection for the central 4px CSS radius; Sector catalogue symbols only, never physical System View models |
| `src/viewer/celestial-model.mjs` | Fixed physical spheres/normalized small bodies and deterministic symbolic material colors; no geometry for unknown sizes/artificial structures |
| `src/viewer/icon-manifest.mjs`, `icon-registry.mjs`, `navigation-proxy.mjs` | Fourteen explicitly bundled SVGs, safe category/fallback resolution and one screen-facing image per existing object button |
| `src/viewer/inspection-camera.mjs` | Radius-based local camera framing, clipping and center/surface constraints; Reset returns to normal navigation |
| `src/viewer/caption-layout.mjs` | Pure screen-space priority, zoom deadband, marker/annotation/panel collision and occlusion calculations |
| `src/viewer/territorial-labels.mjs` | Pure per-Cantum field components, preserved full-name fitting, centralized sigil-only island eligibility/interior placement, bounded cache, zoom fade and provisional heights |
| `src/viewer/cantum-nameplates.mjs` | Camera-projected decorative full-name/sigil-only DOM plates; secure registry availability, local heights, screen-space typography, visibility and image/listener cleanup |
| `src/viewer/sigil-registry.mjs` | Closed static URL mapping for the single noncanonical Cantum sigil; optional image lifecycle with text-only failure behavior |
| `src/viewer/influence-envelopes.mjs` | Pure bounded X/Z field triangulation, contributor-Y centerline, clipped rounded surfaces and eight-input mesh-data cache |
| `src/viewer/influence-compositor.mjs` | Non-pickable envelope geometry in a private scene, half-float accumulation and one capped chart-layer composite; target/resource lifecycle |
| `src/viewer/chart-layout.mjs` | Square-map validation, full-chart fit, bounded 2D pan/zoom; 8×8 sector grid on `map.planeY` with an unnumbered ly scale, and absolute-zero system grid with A–H/1–8 and H8 CNU scale |
| `src/viewer/cartographic-layers.mjs` | Routes/direction arrows, three zone shapes, cached Cantum texture, explicit drawing order and disposal |
| `src/viewer/index.html`, `style.css` | Compact header, centered square stage, floating panels and dismissible centered record dialog |
| `src/timeline/resolve.mjs` | Separate legacy v0.1 resolver, used by legacy tests and console demo; not imported into the viewer |

The app is vanilla JavaScript ES modules, Three.js and Vite. The public viewer
has no write endpoint, authentication, live AI lore generation or backend.

## Data flow and historical semantics

1. The Demo loader reads the validated sector-derived noncanonical inventory
   from `public/datasets/demo/` (currently five registries, four detail files and two registered faction files).
2. Historical selectors resolve the chosen nonnegative integer A.E. year.
3. Cartography derives eligible records, route strokes and influence contributors.
4. The scene renders XYZ; the interface displays the same resolved records.
5. Year changes reconstruct derived state without mutating authored JSON.

Intervals remain `fromAE <= yearAE < untilAE`, with null endings ongoing.
Exact discovery, confirmed-known-by, construction, decommissioning and colonization
remain separate. Object/faction InfoCard affiliation never substitutes for administrative
Cantum membership or sovereignty. Only a Cantum's dated superior affiliation
defines its governance chain. Missing, unknown and zero are distinct.
See [the resolver API](HISTORICAL_RESOLVER.md) and [data model](DATA_MODEL.md).

A known system may be unplaced (catalogue only), archival (`publicDetailPath:
null`) or released with partial detail. Partial records remain partial. Missing
unreleased endpoint details stay explicitly unverified; fetch/parse failures are
technical errors with retry. There is no security in sending a secret record
and hiding it in the UI.

## Offline authoring and validation

| Module | Responsibility |
| --- | --- |
| `scripts/dataset-inventory.mjs` | Validated sector-derived registration paths, deterministic ordering and shared filesystem guard |
| `scripts/demo-files.mjs` | Registered raw authoring reads, stable system/file association and position-value-span rewrites preserving unrelated bytes |
| `scripts/navigation.mjs` | Nonmutating v1.2/v1.3 declaration-to-graph/XYZ compiler; lifetime exclusivity and navigation-boundary checks |
| `scripts/connections.mjs` | Manual generator or read-only freshness check; staged validated writes, backups and recovery journal |
| `scripts/atlas-validation.mjs` | Offline strict Ajv Draft 2020-12 validation for v1.1, v1.2 and v1.3; separate authoring/release validators |
| `scripts/check-relations.mjs` | Cross-file identity, intervals, references, bounds, endpoint types/cardinality and presentation constraints |
| `scripts/validate-demo.mjs` | Current demo release schema + relations + read-only generated-artifact freshness |
| `scripts/idfind.mjs` | Read-only dataset-scoped ID inventory and next-ID suggestions |
| `scripts/audit-demo-build.mjs` | Selected-dataset identities, resource reachability/completeness, extensions, exact SVGs, base paths and forbidden-reference checks |

System-object declarations are the authoring source of truth; generated,
Git-tracked `connections.json` is the runtime index. Only the manual
`npm run connections` writer changes the graph and eligible short-range gate
positions. Normal tests/Demo/build check freshness and fail instead of repairing.
Multi-file replacement is not atomic; [authoring/recovery instructions](NAVIGATION_AUTHORING.md)
are authoritative for operating that tool.

## Validated dataset inventory

Phase 6 adds a validated Vite snapshot to avoid repeating whole-dataset schema,
relationship and graph validation for every eager JSON import. Each imported
file still undergoes safe-path and actual-byte checks. Watcher invalidation and
virtual-module loading check the whole snapshot; production rejects changed
bytes during the build and checks all registered inputs again before accepting
output. A snapshot never incorporates an unvalidated record. No lazy loading,
new dataset selector or runtime JSON-fetch architecture is introduced.

The input audit now requires every registered JSON module to be present in the
actual bundle. The output audit verifies selected-dataset numeric identities,
local asset-reference completeness/reachability, exact approved SVGs and forbidden
references. These are layered checks, not a general secret-content detector.
See [readiness evidence and limitations](PERFORMANCE_AND_RELEASE_READINESS.md).

`scripts/dataset-inventory.mjs` owns the selected trusted Demo root. It validates
`sector.systems[]` before consuming detail declarations: IDs are unique, each
released path is exactly `systems/<matching-id>.json`, and null entries are
intentionally archival. Sector references select Cantums and connections;
v1.3 also requires presentation and the faction registry (presentation remains
optional in legacy v1.2). Registered faction paths/IDs are validated before reads. Technical file order is deterministic; catalogue order is preserved.
Filesystem guards reject traversal, absolute paths, alternate separators,
unsupported names/directories and symlink/reparse redirection of roots or files.
Missing details fail. Root/IO injection is internal test support, with no arbitrary
root/URL CLI or runtime selection. Only Demo is configured for the viewer.

`readDemoSource()` retains exact original text and validates records with the
existing Ajv definitions. It accepts authoring-stage null derived positions and a
missing generated graph solely so the explicit writer can generate release data.
Release validation and Vite reuse `checkConnections()` for strict structure,
relationships and freshness; a missing/stale graph, bad references or recovery
journal blocks startup/build. No implicit generation or repair occurs.

Vite's narrow `virtual:velara-demo-dataset` module generates imports solely from
the validated inventory. `demo-data.mjs` still eagerly calls every callback at
initialization and retains complete detail/faction Maps for v1.3; there is no
lazy fetch/cache architecture. Vite transforms the exact JSON text that passed validation. The
same snapshot supplies the filesystem and build module allowlists; changed
registrations require a Demo restart, while other JSON edits revalidate. Only
the named virtual module and two specific Vite helpers get virtual-ID admission.

The navigation writer's raw text, file association, concurrency/transaction and
recovery interfaces remain intact. ID Finder shares the filesystem guard but
retains its separate read-only diagnostic scan of direct unregistered system
files and legacy `--public` scope. Diagnostic visibility confers no publication
admission. See [authoring steps](../README.md#registered-demo-systems-and-loading).
`tests/dataset-inventory.test.mjs` covers unsafe declarations, a temporary extra
system through the real loader/full build, and new-file navigation generation.
That Phase 3B checkpoint preserved the Demo, fixtures, schema and historical
resolver. The completed Phase 3D migration is described below.

## v1.3 governing entities and fields (Phase 3D)

`src/core/infocard-resolver.mjs` remains the pure owner of historical can_/fac_
reference presentation and direct/ultimate Cantum governance. `resolveAtlas()`
adds copied presentation state without changing authoritative `cantumId` or the
history selectors. `territoryGroups()` requires the shared v1.3 radius, omits
unrecorded roots and groups every eligible contributor by ultimate governor
before the existing Gaussian sum. Frozen v1.2/calibration retain direct grouping.

Envelope and label-anchor filters use derived group membership and matching
system coordinates, retaining subordinate elevation. Labels, sigils and islands
consume the governing group. Existing caches distinguish contributors, identity,
position, radius, thresholds and local elevation where consumed. Rendering and
cleanup remain in the established components; no separate same-color fields or
new territory algorithm is introduced.

The validated Vite module eagerly loads registered system and faction files;
only the existing Demo root is configured. The pure resolver is explicitly
admitted. Isolated v1.3 fixtures, calibration and unregistered files remain
excluded. Navigation generation emits the source version and preserves existing
geometry/chronology/writer recovery. See the [contract and migration crosswalk](DATA_MODEL_V1_3_PROPOSAL.md).
Phase 3D is complete and creator-approved; its implementation and completion
documentation are committed together. Phase 3E is complete and creator-approved; Phase 3F integration/showcase work and overall Phase 3 are complete and creator-approved; Architecture Phase 4 is complete and creator-approved; Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

## Coordinates, layout and rendering

Sector XYZ is in light-years; local system XYZ is in CNU, universally defined as
10,000 kilometers per CNU. Positions are static and absolute in their own map.
`orbitingId` is relationship metadata, not a position calculation.

Checkpoint 4.1 Phase 1 added optional positive finite `physicalDiameterKm` only
to current v1.2 celestial schemas, with omission for unknown values and no version
migration. Phase 3 forwards authored celestial measurements through resolved
records and keeps fixed physical geometry, apparent-size minima and interaction
hit areas separate. Projected HTML SVGs need no GPU textures or second identity.
Focus enters local physical inspection; normal framing/pan is restored by Reset.
See [the scale contract and phase boundaries](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md).
System chart dimensions may differ; square X/Z, independent Y extent, off-center
stars and the absolute Y = 0 system reference grid remain compatible.

Sector grid standardization places its transparent lines and single bottom-right
light-year scale on `map.planeY`, with nine lines per axis. The existing projected
measurement arrow and per-map grid toggle are shared with System View. Influence
meshes retain their separate presentation plane and explicit ordering above the
grid. Cantum Visual Patch Stage 1 replaces text meshes with horizontally readable
DOM nameplates, using the existing component X/Z anchors and highest eligible
contributor Y plus modest clearance. Projection/fade updates share the event-driven
render path; the nameplate overlay owns no GPU textures, and removes its image
error listeners on rebuild/disposal. Authored XYZ,
chart extents, camera framing, political calculations and system-grid behavior
do not change. See [the Stage 1 report](CANTUM_NAMEPLATES_STAGE1_RESULTS.md).

Stage 3 supersedes the always-flat perspective presentation. `AtlasMap` retains
the original flat mesh for top-down and shows only the envelope composite in
perspective. Geometry is generated from resolved contributor groups at map/year
updates and cached independently of camera movement. Perspective nameplates sample
their local envelope top; top-down full-name heights and fitting remain intact.
The event-driven render path rasterizes only envelope meshes into a half-float
target, then displays one normal-blended chart layer with total alpha capped at
.22. This bounds overlaps/front/back coverage without additive visible effects.
Main-scene picking excludes the composite and private shell meshes. Clearing a
map disposes private geometries/materials/target; the main scene owns the composite
geometry/material. No data, schema, asset, dependency or grid change is involved.

Stage 4 extends those same sampled components with stable identity variants,
preserving every existing full-name fit. Only registered-sigil availability enters
the pure placement helper; asset URLs remain the closed registry's responsibility.
A camera-independent reference-overview square with one-cell padding and minimum
cell count determines small-island eligibility. Interior anchors prefer marker
clearance; perspective height sampling stays local to that anchor. Classification
is cached on map/year inputs and never recalculated on camera movement. The DOM
overlay removes failed sigil-only images and their entire empty anchors, while
full-name failures retain text. No influence geometry/compositor module changes.
See [Stage 4 policy](CANTUM_TERRITORY_RENDERING.md#stage-4-detached-island-identities).
Stage 5 refinement remains deferred.

The intermediate calibration preserved Stage 4 behavior; both are committed in
`190bd21`. Their reports retain their original working-copy circumstances. Sector sphere
scale now comes from `sectorMarkerWorldRadius()` using CSS viewport dimensions and
three projection corrections, rather than radial camera distance. Captions use
the same visible 4px radius; existing invisible picking targets remain independent.
The envelope half-height clamp becomes `.5–3` ly; the X/Z field, geometry technique,
local Y centerline and compositor are unchanged. No physical size/minimum changes.
`npm run dev` and its compatibility alias `preview:calibration` serve the
loopback-only Development preview on 5174; `demo` serves the graphical showcase
on 5173 and `history:demo` retains the terminal demonstration. Canon has no launcher.
The finite `tests/calibration/scenarios/preview-manifest.json` maps stable IDs to
exact local JSON resources and complete preset descriptions. The original
`cantum-scale-baseline.json` remains unchanged. `island-elevation.json` is a separate
seven-system TEST arrangement. Both deliberately use reduced local v1.2-style
format version 1; neither is a release-valid dataset nor interchangeable with
v1.3 universal-radius semantics.

`scenario-format.mjs` owns the extracted validator and clone/radius adapter;
`scenario.mjs` preserves the fixed-baseline compatibility exports. `preview.mjs`
validates the closed registry/presets, loads only registered IDs and derives data
through `resolveAtlas()`/`territoryGroups()`. Every load/state owns its data.
The local controller uses the Phase 4 camera API, `createVisualConfig()` and
`Lifetime`; it never duplicates history/projection math or writes authored files.
Map replacement removes listeners/resources and releases its local WebGL context.
Replay starts clean camera/control ownership so stored top-view state is also
reproducible; visual-only rebuilds restore the current view through `restoreView()`.
Presets replay complete declared states; Reset View only reframes the current
experiment. Loading errors remove the obsolete map and permit explicit reselection.

The server admits only enumerated HTML/modules plus exact registry-declared JSON.
It rejects encoded/case/separator variants, non-GET/HEAD methods and real-path or
symlink/reparse redirection. Registry changes require a Development restart; no
filesystem glob, arbitrary root, remote URL or save API is added. Demo Vite source
admission/output audits remain unchanged and reject all preview-only resources.
Operational steps and diagnostic meanings are in [README](../README.md#named-local-preview-scenarios-completed-phase-5).
Architecture Phase 5 is complete and creator-approved; implementation and status documentation are committed together. Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.
See [historical calibration results](CANTUM_SCALE_CALIBRATION_RESULTS.md).

Phase 2 supplies 100K/80K/160K CNU charts and authored physical measurements in
the three released details. A fourth positioned sector entry has
`publicDetailPath: null` and uses existing textual archival fallback, without a
detail file or additional loader. The JSON input allowlist is sector-derived
(eleven registered JSON inputs for the Phase 3F showcase); `publicDir: false` remains unchanged. Sector markers remain display aids; system
physical models consume known diameters; their Phase 3 implementation originally
preserved Phase 2 data. Subsequent creator testing intentionally changed System C
navigation and discovery dates. The current committed demo has ten System C
objects and two local transfers, within the same chart and asset/data allowlists.
See [the maintenance baseline](POST_PHASE3_MAINTENANCE.md). The supplied
`public/assets/nexus/nexus-side-profile.png` exists; viewer integration remains
deferred and it remains outside the current demo build.

Checkpoint 3.6 fits the complete square X/Z chart, clamps orthographic pan/zoom
and leaves genuine Y available in perspective and records. Both camera modes
use a square viewport. Panels float without shifting it; History is vertical
and the header retains the year. Selection opens a centered dismissible
InfoCard; only hover/focus temporarily brightens routes. The
[viewer specification](VIEWER_SPECIFICATION.md) owns these behaviors.

Cantum influence follows the approved historical membership filter,
Gaussian/smoothstep formula, fixed ly radii and 0.16/0.22 opacity caps.
Zones remain independent ellipsoid/box/polygon-volume geometry. Phase 3 provides
starter SVGs and simple procedural physical models; final artistic refinement and
elaborate targeting-ring art remain future work.

## Build and disclosure boundary

**Completed 4.2C addition (2026-10-23):** the exact original UI reticle is admitted
independently by `scripts/ui-reticle-asset.mjs` with a pinned source hash, exact
Vite path and output byte/name/uniqueness/reachability checks. It does not relax
the 64×64 starter profile. Current release inventory is sixteen SVGs and three
PNGs; existing universal fallback content and dataset/private/Canon restrictions
remain. See [current asset policy](VISUAL_ASSET_POLICY.md#10-implemented-checkpoint-42c-ui-svg-admission).
The older baseline asset counts/exclusions below remain historical context.

Vite roots the app in `src/viewer/`, uses `/Velara_Atlas/` as its base,
disables `publicDir` and source maps, and writes `dist/`. Development binds
to loopback with filesystem restrictions. The input audit allows viewer code,
the modern core modules, exact inventory-derived Demo JSON, dependencies and
the narrowly named virtual mapping/Vite helpers.
Phase 3 added fourteen explicit navigation icon paths; Stage 2 adds exactly one
separate Cantum demonstration sigil path. `sigil-registry.mjs` resolves only
`test-cantum-a` via a static Vite URL, never a path derived from authored data.
Null/unknown/failed images leave full-name text intact; Stage 4 sigil-only
failures remove the whole empty plate. Rebuild/disposal
removes image error listeners; failure requests a normal render for containment.
Existing NEXUS PNGs remain excluded. `scripts/svg-assets.mjs` validates the narrow SVG
profile. The output audit checks HTML/JS/CSS plus exact approved SVG bytes/names
with no duplicates, base-relative assets and the unchanged forbidden references.

Thus `public/data/`, private lore, docs, unrelated examples, Node authoring
tools and frozen fixtures are not browser inputs. Git itself is a second
publication surface: everything committed here must be public-safe regardless
of whether it is bundled. The current allowlist is deliberately small, not a
general canonical publication pipeline.

## Future work and remaining limits

GitHub Pages deployment, arbitrary dataset selection/runtime validation,
a canonical release pipeline and any local editor need separate
authorization. Canonical v0.1 IDs/history require the
[migration safeguards](LEGACY_MIGRATION_PLAN.md). Private RTF remains external;
no private source extraction or publication tool is implemented.

The data contract has no latest-published-year field: this demo uses
`timeline.startAE` through `defaultAE`. Exact event markers beyond conservative
record jumps, final assets, full accessibility, cross-browser/touch-hardware QA
and large-atlas performance remain future work. See
[Checkpoint 3.6 audit evidence](REPOSITORY_AUDIT_3_6.md) for its original limits;
the [calibration report](CANTUM_SCALE_CALIBRATION_RESULTS.md) records subsequent
emulated-touch checks and the continuing bundle-size advisory. These are
historical results. [Phase 2 results](PHASE_02_DATASET_MIGRATION_RESULTS.md) record
the browser and boundary verification performed for this path migration.

## Local manual system authoring (completed Phase 3E)

The CLI `scripts/atlas-new-system.mjs` exposes only the selected Demo. Reusable
Node-only planning, record construction, complete validation and apply/recovery
operations live in `scripts/system-authoring.mjs`. ID allocation reuses ID Finder's
BigInt inventory, including unregistered and archival identities. Strict v1.3
validation precedes any write; the sector remains the sole registration source.

An exclusive authoring journal, verified staging and sector backup make the
sector append/new detail operation recoverable. New detail installation is
exclusive; unrelated sector bytes stay intact. Input hashes and filesystem guards
reject stale plans/concurrent changes. `scripts/authoring-guard.mjs` prevents
navigation generation and Demo startup/build from consuming pending authoring
state. Navigation keeps its existing independent journal format and algorithm.
The tools and test-only scenarios remain excluded by the unchanged build allowlist.
There is no editor endpoint or new runtime dependency. See
[MANUAL_AUTHORING](MANUAL_AUTHORING.md) for scope, recovery limits and tests.

## Living Demo integration policy

Authorized significant viewer-facing features pass automated tests, gain a curated
noncanonical example in the normal Demo when needed, then undergo creator visual
review/corrections and explicit approval before separately authorized closeout.
Nonvisual work needs no filler data. The Demo never imports TEST scenarios or
calibration fixtures; its own registered JSON remains authoritative. Phase 3F
adds only curated data/integration checks, preserving runtime module boundaries.
See [DEMO_SHOWCASE](DEMO_SHOWCASE.md) for normal-viewer inspection and differences.

## Phase 4 viewer module ownership

Architecture Phase 4 is complete and creator-approved. Its implementation and
completion documentation are committed together. Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization. The current
NONCANONICAL Demo, HTML/CSS and algorithms are preserved.

| Owner | Responsibility and boundary |
| --- | --- |
| `app-state.mjs` / `AppState` | One session's year, scope, selected ID, filters, exact events, saved camera snapshots and per-map layers. Delegates to `resolveAtlas`, `recordedYears`, `searchRecords` and `territoryGroups`; never stores a second political history. No DOM or Three.js dependency. |
| `catalogue-view.mjs` | Resolved-record rows, filters, selected-row aria state, hover/focus and explicit select/open/focus callbacks; disposes old row listeners before rebuilding. |
| `infocard-model.mjs` | Pure resolved-record-to-facts/destinations presentation. Retains qualified dates, zero/null, faction legality, administration/government, zones and archival endpoint uncertainty. |
| `infocard-view.mjs` | Safe text DOM, dialog actions, destination listeners, focus capture/return and dismissal. No historical inference or data HTML. |
| `timeline-view.mjs` | Slider/numeric input, bounds/errors, previous/next exact event and latest; requests refresh without reloading. |
| `layer-config.mjs`, `layer-view.mjs` | One frozen definition of supported layer keys/defaults/labels; independent per-map visibility. Visibility never changes historical eligibility. |
| `app-shell.mjs` | Square stage sizing, floating-panel mutual exclusion/closing and Escape dispatch. |
| `camera-controller.mjs` | Camera/OrbitControls, framing, constraints, modes, inspection, snapshots and disposal; completed 4.2E owns one cancelable 550ms Focus RAF operation and local reduced-motion/input lifetime. Preserves inspection endpoints and ordinary chart math. |
| `map-interaction.mjs` | Canvas/label inputs, drag-versus-click, delayed selection, pointer/focus/touch hover, one marker/route/zone picker and zone emphasis/tooltip. |
| `scene-layers.mjs` | Per-map grid, influence, envelopes, zones, routes, meshes, labels/proxies, visibility and rebuild/disposal. Uses existing geometry/compositor/nameplate modules. |
| `projected-labels.mjs` | Existing grid/caption/symbol projection, physical/proxy handoff, depth occlusion and caption layout; supplies final anchors to targeting, no new geometry or picking source. |
| `target-reticle.mjs` | Completed 4.2C: two pointer-transparent, accessibility-hidden DOM spans driven by existing selectedId/hoverSources and final anchor.screen/button.hidden/object visibility. CSS owns masks/rotation; AtlasMap owns creation/disposal, SceneLayers clears on rebuild. |
| `lifetime.mjs` | Locally scoped listeners, observer guards and reverse-order, idempotent cleanup. Disposed callbacks cannot act on a replacement application. |

Data flow is validated eager loader -> `AppState` -> core resolved view -> UI
owners / `AtlasMap`. Main captures the current camera before historical refresh,
resolves scope/selection invalidation and passes only that resolved view to the
scene. Navigation resets search/category while retaining each map's camera and
layer preferences. InfoCard focus-return state belongs to the dialog owner.

AtlasMap retains its public methods and observable camera/scene fields. The
controllers receive that facade as an explicit context to preserve existing test
instrumentation; geometry/history are not copied into parallel stores. Lazy
controller attachment preserves prototype-based non-WebGL harnesses. Camera,
picking, scene and projection owners never import the facade: marker/hit-size
factories are injected, avoiding circular imports.

### Checkpoint 4.2E Focus ownership and lifecycle

**Complete and creator-approved, 2026-10-23.** `CameraController.focus()` first
cancels the old generation. In normal motion it snapshots both cameras,
controls target/limits, inspection and saved top view, runs the established
`applyFocus()` path with drawing suppressed, then restores the visible start.
Planning suppresses camera change renders and renderer resizing; no duplicate
live controls or renderer is constructed. One RAF handle interpolates toward
the destination for 550ms using smoothstep and geometric scale/zoom/clipping.
`finishFocus()` commits the exact captured endpoint and synchronizes controls.
Inspection and ordinary chart constraints cannot fight the active transition.

Capture-phase canvas listeners cancel before OrbitControls/manual keyboard
input; programmatic `change` events only request rendering. Camera commands and
resize cancel locally. `SceneLayers.clearMap()` cancels before scene cleanup,
covering history, navigation and archival changes. Context loss, controller
disposal and AtlasMap teardown cancel the handle and invalidate stale callbacks.
The controller's `Lifetime` removes input/media-query listeners; reduced motion
uses direct framing and an active preference change finishes immediately.

Cancellation preserves the visible free camera. `clampChart()`'s optional actual
half-frustum bounds this intermediate view without forcing the original chart
plane/direction; its ordinary path is unchanged. Optional `focusFrame` snapshot
metadata retains frustum, clipping and control limits across history/navigation;
`getView()` remains read-only. `data-focus-moving` exposes completion for browser
checks. Projected labels/reticles and physical/proxy calculations remain their
existing owners' responsibility. The separate 4.2F presentation below adds no
map-navigation animation ownership to the camera controller.

`tests/focus-camera.test.mjs` uses an injected clock and real controls update math;
`tests/fixtures/focus4_2e-endpoints.json` freezes 20 original `0c635da` camera
destinations. The dedicated `browser-focus4_2e.mjs` callback checks normal and
reduced motion, intermediate projections, input/cancellation, four viewports and
teardown on the normal Demo and audited production preview. Existing celestial,
reticle, sizing and zone callbacks now await actual completion before their
unchanged settled-state assertions. See [closeout evidence and limits](DEVELOPMENT_ROADMAP.md#phase-42e--focus-selection-animation).

### Checkpoint 4.2F chart-transition ownership and lifecycle

**Complete and creator-approved, 2026-10-23.** `main.navigate()` remains the sole
navigation entry point. It cancels the previous decoration, saves the current
camera and synchronously navigates/resolves/rebuilds/restores/focuses the
destination. Only after those operations does a changed valid scope request
`createMapTransition().reveal()`. Same-scope navigation does not replay it;
historical automatic return cancels through `refresh()` without starting one.
`AppState.cameras`, `SceneLayers` disposal and Focus cancellation remain unchanged.

The owner creates one `aria-hidden`, pointer-transparent viewport element and
one finite 420ms Web Animation using `cubic-bezier(.42,0,.58,1)`. It owns no map,
dataset, camera, navigation decisions, renderer or scheduler. CSS supplies the
dark/cyan reveal and archival perimeter-only variant, leaving archival content
and the higher reticle/control layers intact. The effect cannot delay or undo a
navigation commit. Unavailable/failing animation support leaves direct navigation.

Capture-phase listeners on the chart stage and InfoCard cancel before existing
pointer/touch, wheel, keyboard, click and input handlers act. Selection/refresh,
replacement navigation and context loss also cancel explicitly. Cancellation
hides the overlay, detaches callbacks, cancels the active animation and advances
a generation guard; stale completion cannot hide a replacement. Reduced motion
skips animation, and an active preference change cancels it. The mount's
`Lifetime` removes the decoration, listeners and animation before AtlasMap
disposal. No callback restores a scene or camera. Existing 550ms Focus remains
camera-owned with its frozen endpoints and cancellation rules.

Twelve deterministic owner tests cover timing, replacement/stale callbacks,
input priority, media changes, failed animation support and cleanup. The dedicated
`browser-map-transitions4_2f.mjs` callback checks real intermediate frames,
synchronous destinations, existing marker/Catalogue/InfoCard/gate/Return paths,
camera restoration, rapid navigation, responsive bounds and lifecycle on normal
Demo and audited preview. See [accepted evidence and limits](DEVELOPMENT_ROADMAP.md#phase-42f--map-navigation-transitions).

### Safe presentation configuration

`createVisualConfig(overrides)` returns a frozen, closed configuration. AtlasMap's
optional fifth argument is `{visual: overrides}`; default callers are unchanged.
No URL/file loading or public settings editor is involved.

| Setting | Existing default | Accepted range |
| --- | --- | --- |
| `backgroundColor` (scene only) | `0x03090f` | Integer RGB, 0 through `0xffffff` |
| `selectionColor` (marker meshes) | `0xffbf62` | Integer RGB, 0 through `0xffffff` |
| `hoverColor` (routes/arrows) | `0x00d6ff` | Integer RGB, 0 through `0xffffff` |
| `routeOpacity` | `0.7` | Finite 0 through 1; highlighted route remains 1 |
| `selectionDelayMs` | `230` | Finite 0 through 1000 |

Unknown keys, invalid types/ranges, accessors and non-plain objects are rejected
before WebGL allocation. Existing frozen `MINIMUM_DIAMETERS`,
`MODEL_HANDOFF_RATIO` and Sector symbol constants remain centralized and unchanged.
CSS owns typography/panel tokens. Units (`KM_PER_CNU = 10000`), IDs, schemas,
history, coordinates, physical diameters, navigation, authored 24-ly radius,
Gaussian thresholds and source admission are not configuration options.

### Resource lifetime and verification

The application owns its components and AtlasMap; each map rebuild owns its
label listeners, proxies and scene objects. Camera mode changes remove the old
change listener and dispose OrbitControls. Map clearing retains the existing
geometry/material/texture/render-target, nameplate and outline cleanup. AtlasMap
disposal also removes canvas input handlers, observers, tooltips and renderer DOM.
Main owns component listeners per mount and shell/document listeners plus the
stage observer at the root (including startup errors), guards
pending startup promises and registers the same cleanup with Vite HMR. Vite's
existing full-page-reload behavior is retained; no new HMR state architecture.

Run `node --test tests/viewer-modules.test.mjs`, then `npm test`, validation,
freshness and audited build. Run `tests/browser-viewer-modules.mjs` through the
Chromium MCP runner with the normal `npm run demo`; it checks focus, timeline
invalidation, four remount/dispose cycles, resource/listener stability and stale
callbacks. Existing Demo, navigation, zones, touch, labeling and calibration
suites remain unchanged. Reuse the [showcase walkthrough](DEMO_SHOWCASE.md) for
creator inspection. The authorized local Phase 5 preview reuses this closed
config factory and camera APIs; no preview editor is implemented.


Phase 4 implementation and closeout verification: the pre-refactor baseline passed 245 tests; the
extraction plus twelve focused tests passes 257. All 18 applicable Chromium
suites pass, including lifecycle/configuration and the nine calibration views.
Ten fixed desktop/mobile DOM and camera snapshots match; pixel comparison with
a repeat rendering of the unchanged Phase 3F source is identical in all ten.
Two initial card-edge raster differences also reproduced with that unchanged
source and disappeared in the controlled comparison. Startup-error Retry remains
usable because chart sizing belongs to the root shell, independent of loading.
Vite full reload, repeated teardown/remount, the 24-file/15-SVG build audit and
protected-data hashes were verified. These execution results support the separately recorded creator approval.
Physical touch hardware/non-Chromium QA and the existing large-bundle advisory
remain limitations.

### Extending the completed viewer safely

Keep historical decisions in the existing pure core and pass resolved records to
UI/scene owners. Add event/observer cleanup to the owning lifetime and preserve
facade methods and DOM hooks deliberately. Test state/presentation independently,
then run the ordinary living Demo, error/retry, camera/picking and lifecycle
regressions. Presentation injection is internal and closed; do not use it to
change authored history, geometry, schemas or source admission. Completed, creator-approved Phase 5 local previews reuse these interfaces. No editor or public settings control is added.


Closeout reran all 257 automated tests and 18 Chromium suites successfully.
All ten DOM/camera states match. Nine closeout images match the preserved repeat
baseline exactly; the remaining faction-card image matches the preserved initial
baseline exactly, including the already reproduced 157-pixel card-edge raster
variation. No visual baseline was replaced or test expectation relaxed.
