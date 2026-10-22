# Velara Atlas — Implemented architecture

**Status:** Runtime baseline from `190bd21`, with Phase 2 paths updated from
`main` at `6ae6ee2` (2026-10-20). The local
noncanonical viewer includes Checkpoint 4.1 Phase 3, the sector grid, Cantum
Stages 1–4 and intermediate calibration, retaining Checkpoint 3.8 zones,
cartographic labeling, Checkpoint 3.6 layout and version-aware v1.2/v1.3 navigation authoring.
Architecture Phase 2 is committed in `6e026cb`; Architecture Phases 3A, 3B, 3C and 3D
are complete and creator-approved;
Phase 3E and later remain unauthorized; canonical migration,
final artwork, deployment and the local editor remain separately gated.
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
| `src/viewer/main.mjs` | Selected year/map/record, per-map camera and layer state, catalogue, vertical History, InfoCard, archival and technical-error presentation |
| `src/viewer/map-scene.mjs` | Three.js scene, orthographic/perspective cameras, OrbitControls, marker/route picking, projected labels and transient route hover |
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
   from `public/datasets/demo/` (currently five registries and three detail files, with an empty faction registry).
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
| `scripts/audit-demo-build.mjs` | Production output extension, base-path, disclosure-marker and forbidden-reference checks |

System-object declarations are the authoring source of truth; generated,
Git-tracked `connections.json` is the runtime index. Only the manual
`npm run connections` writer changes the graph and eligible short-range gate
positions. Normal tests/Demo/build check freshness and fail instead of repairing.
Multi-file replacement is not atomic; [authoring/recovery instructions](NAVIGATION_AUTHORING.md)
are authoritative for operating that tool.

## Validated dataset inventory

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
documentation are committed together. Phase 3E remains separately gated.

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
`scripts/preview-cantum-calibration.mjs` installs four exact read-only routes
only on its loopback Development server. `npm run dev` starts calibration at
`http://127.0.0.1:5174/Velara_Atlas/__calibration/`; `preview:calibration` aliases
that command. `npm run demo` validates and serves the existing graphical Atlas on
5173. `history:demo` retains the terminal historical demonstration. Canon is a
future approved-data environment with no launcher or noncanonical fallback.

`tests/calibration/scenarios/cantum-scale-baseline.json` owns the reduced local
scenario: 15 test systems, two Cantums, exact histories/XYZ, 40 x 40 x 12 ly extents,
presentation and radius/preview choices. `scenario.mjs` reads the fixed resource,
validates the local format, clones data and adapts the selected radius into the
existing runtime structure with an independent empty detail Map. Node uses a file
read; the browser fetches only the named JSON route. The empty local InfoCards and
missing release fields are intentional, not public-schema extensions. Invalid
inputs fail without normalization or repair. `controller.mjs` retains the existing
renderer and interactions; `index.html` defines controls. See [operating commands,
format and tests](../README.md#local-development-and-future-canon).

No filesystem allowlist is widened. Calibration JSON, controller and adapter stay
outside Demo imports and the production input audit; the JSON is available only
through its explicit local route. No calibration editor/writer or arbitrary-root
loader is introduced. The published build remains the noncanonical Demo only.
See [historical calibration results](CANTUM_SCALE_CALIBRATION_RESULTS.md).

Phase 2 supplies 100K/80K/160K CNU charts and authored physical measurements in
the three released details. A fourth positioned sector entry has
`publicDetailPath: null` and uses existing textual archival fallback, without a
detail file or additional loader. The JSON input allowlist is sector-derived
(currently seven files); `publicDir: false` remains unchanged. Sector markers remain display aids; system
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
