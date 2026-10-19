# Velara Atlas — Implemented architecture

**Status:** Local noncanonical viewer through Checkpoint 3.8 zone interaction, with cartographic labeling and the Checkpoint 3.6 layout; navigation authoring
uses Schema v1.2. Canonical migration, final artwork, deployment and the local
editor remain separate future work.

## Runtime responsibilities

| Module | Responsibility |
| --- | --- |
| `src/core/history.mjs` | Pure v1.1/v1.2 historical selectors: names, knowledge/existence, InfoCards, systems, zones and eligible connections; no I/O or renderer dependency |
| `src/core/cartography.mjs` | Pure map/catalogue composition, search, exact recorded-year boundaries, scoped route points/destinations, Cantum field calculations and seeded zone sampling |
| `src/core/zone-geometry.mjs` | Pure zone validation/intersection, concave footprint clipping, projected membership, clipped ray intervals, witnesses, overlap ordering and bounded particles; shared by validator and viewer |
| `src/viewer/zone-layers.mjs` | Clipped system-zone footprints, bounded approximate 3D cloud slices/particles, mode switching and subtle hover/selection emphasis |
| `src/viewer/zone-outline.mjs` | Pointer-transparent 2D SVG hover/focus contours, constant CSS stroke, solid authored boundaries and dashed chart-clipping edges; no hit testing |
| `src/viewer/demo-data.mjs` | Explicit imports of four demo registries plus three allowlisted detail loaders; preloads released details for endpoint eligibility |
| `src/viewer/main.mjs` | Selected year/map/record, per-map camera and layer state, catalogue, vertical History, InfoCard, archival and technical-error presentation |
| `src/viewer/map-scene.mjs` | Three.js scene, orthographic/perspective cameras, OrbitControls, marker/route picking, projected labels and transient route hover |
| `src/viewer/visual-config.mjs`, `celestial-scale.mjs` | Central CSS minima and handoff ratio; pure physical-radius and camera-projection math |
| `src/viewer/celestial-model.mjs` | Fixed physical spheres/normalized small bodies and deterministic symbolic material colors; no geometry for unknown sizes/artificial structures |
| `src/viewer/icon-manifest.mjs`, `icon-registry.mjs`, `navigation-proxy.mjs` | Fourteen explicitly bundled SVGs, safe category/fallback resolution and one screen-facing image per existing object button |
| `src/viewer/inspection-camera.mjs` | Radius-based local camera framing, clipping and center/surface constraints; Reset returns to normal navigation |
| `src/viewer/caption-layout.mjs` | Pure screen-space priority, zoom deadband, marker/annotation/panel collision and occlusion calculations |
| `src/viewer/territorial-labels.mjs` | Pure per-Cantum field components, cached geographic lettering placement, fitting and fade calculations |
| `src/viewer/chart-layout.mjs` | Square-map validation, full-chart fit, bounded 2D pan/zoom, world-space 8×8 system grid and CNU cell measurement |
| `src/viewer/cartographic-layers.mjs` | Routes/direction arrows, three zone shapes, cached Cantum texture, explicit drawing order and disposal |
| `src/viewer/index.html`, `style.css` | Compact header, centered square stage, floating panels and dismissible centered record dialog |
| `src/timeline/resolve.mjs` | Separate legacy v0.1 resolver, used by legacy tests and console demo; not imported into the viewer |

The app is vanilla JavaScript ES modules, Three.js and Vite. The public viewer
has no write endpoint, authentication, live AI lore generation or backend.

## Data flow and historical semantics

1. The demo loader reads only released, explicitly allowlisted noncanonical JSON.
2. Historical selectors resolve the chosen nonnegative integer A.E. year.
3. Cartography derives eligible records, route strokes and influence contributors.
4. The scene renders XYZ; the interface displays the same resolved records.
5. Year changes reconstruct derived state without mutating authored JSON.

Intervals remain `fromAE <= yearAE < untilAE`, with null endings ongoing.
Exact discovery, confirmed-known-by, construction, decommissioning and colonization
remain separate. InfoCard affiliation never substitutes for administrative
Cantum membership or sovereign control. Missing, unknown and zero are distinct.
See [the resolver API](HISTORICAL_RESOLVER.md) and [data model](DATA_MODEL.md).

A known system may be unplaced (catalogue only), archival (`publicDetailPath:
null`) or released with partial detail. Partial records remain partial. Missing
unreleased endpoint details stay explicitly unverified; fetch/parse failures are
technical errors with retry. There is no security in sending a secret record
and hiding it in the UI.

## Offline authoring and validation

| Module | Responsibility |
| --- | --- |
| `scripts/demo-files.mjs` | Fixed demo file allowlist, safe reads, position-value-span rewrites preserving unrelated bytes |
| `scripts/navigation.mjs` | Nonmutating v1.2 declaration-to-graph/XYZ compiler; lifetime exclusivity and navigation-boundary checks |
| `scripts/connections.mjs` | Manual generator or read-only freshness check; staged validated writes, backups and recovery journal |
| `scripts/atlas-validation.mjs` | Offline strict Ajv Draft 2020-12 validation for v1.1 and v1.2; separate authoring/release validators |
| `scripts/check-relations.mjs` | Cross-file identity, intervals, references, bounds, endpoint types/cardinality and presentation constraints |
| `scripts/validate-demo.mjs` | Current demo release schema + relations + read-only generated-artifact freshness |
| `scripts/idfind.mjs` | Read-only dataset-scoped ID inventory and next-ID suggestions |
| `scripts/audit-demo-build.mjs` | Production output extension, base-path, disclosure-marker and forbidden-reference checks |

System-object declarations are the authoring source of truth; generated,
Git-tracked `connections.json` is the runtime index. Only the manual
`npm run connections` writer changes the graph and eligible short-range gate
positions. Normal tests/dev/build check freshness and fail instead of repairing.
Multi-file replacement is not atomic; [authoring/recovery instructions](NAVIGATION_AUTHORING.md)
are authoritative for operating that tool.

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

Phase 2 supplies 100K/80K/160K CNU charts and authored physical measurements in
the three released details. A fourth positioned sector entry has
`publicDetailPath: null` and uses existing textual archival fallback, without a
detail file or additional loader. The seven-file explicit JSON input allowlist and
`publicDir: false` remain unchanged. Sector markers remain display aids; system
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
the modern core modules, seven exact demo JSON files and dependencies.
Phase 3 adds only fourteen explicit icon paths to source/dev allowlists; existing
NEXUS PNGs remain excluded. `scripts/svg-assets.mjs` validates their narrow SVG
profile. The output audit checks HTML/JS/CSS plus exact approved SVG bytes/names
with no duplicates, base-relative assets and the unchanged forbidden references.

Thus `public/data/`, private lore, docs, unrelated examples, Node authoring
tools and frozen fixtures are not browser inputs. Git itself is a second
publication surface: everything committed here must be public-safe regardless
of whether it is bundled. The current allowlist is deliberately small, not a
general canonical publication pipeline.

## Future work and remaining limits

GitHub Pages deployment, a general released-data loader/runtime validation
strategy, a canonical release pipeline and any local editor need separate
authorization. Canonical v0.1 IDs/history require the
[migration safeguards](LEGACY_MIGRATION_PLAN.md). Private RTF remains external;
no private source extraction or publication tool is implemented.

The data contract has no latest-published-year field: this demo uses
`timeline.startAE` through `defaultAE`. Exact event markers beyond conservative
record jumps, final assets, full accessibility, cross-browser/touch-hardware QA
and large-atlas performance remain future work. See
[current audit evidence](REPOSITORY_AUDIT_3_6.md), including the unresolved
post-gesture emulated tap and existing bundle-size advisory.
