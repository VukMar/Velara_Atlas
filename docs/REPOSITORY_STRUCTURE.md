# Velara Atlas — Repository structure and ownership

**Status:** Current ownership verified at `190bd21` (2026-10-20), including
Checkpoint 4.1 Phase 3, Cantum Stage 4 and intermediate calibration.
The [Checkpoint 3.6 audit](REPOSITORY_AUDIT_3_6.md) is an earlier inventory,
not a complete inventory of later additions. The tree below summarizes ownership;
[architecture](ARCHITECTURE.md) lists module responsibilities and the
[index](INDEX.md) maps documentation authority.
Future paths are proposals, not scaffolding to create during Phase 1.

## Current tree

```text
Velara_Atlas/
  AGENTS.md                     Coding-agent constraints and read-first references
  README.md                     Public introduction, status and commands
  package.json / package-lock.json
  vite.config.mjs               Demo root/base, input allowlist and build checks
  .gitignore                    Dependencies, output, private/cache/recovery paths
  docs/                         Design contracts, guides, safeguards and reports
  schemas/
    atlas.schema.json           Current v1.2 master definitions
    atlas-v1_1.schema.json       Frozen v1.1 regression definitions
    sector.schema.json
    cantums.schema.json
    connections.schema.json
    presentation.schema.json
    system-detail.schema.json   Release XYZ required
    system-authoring.schema.json Limited derived-gate pre-generation null
  scripts/
    atlas-validation.mjs        Strict offline Ajv
    check-relations.mjs         Cross-record integrity
    demo-files.mjs              Explicit demo allowlist and safe reads
    navigation.mjs              Pure graph/coordinate compiler
    connections.mjs             Manual generator / read-only freshness
    validate-demo.mjs           Release + relationships + freshness
    idfind.mjs                  Read-only ID Finder
    audit-demo-build.mjs        Production output audit
    preview-cantum-calibration.mjs Explicit loopback-only preview server
  src/
    timeline/resolve.mjs        Preserved legacy v0.1 resolver
    core/
      history.mjs              Modern pure historical selectors
      cartography.mjs          Pure catalogue/routes/territory/zone calculations
      zone-geometry.mjs        Shared pure clipped zone geometry and hit testing
    viewer/
      index.html / style.css   Floating interface and square map stage
      main.mjs                 Historical/navigation/selection UI state
      demo-data.mjs            Explicit public-safe demo imports
      map-scene.mjs            Three.js cameras, picking and scene
      chart-layout.mjs         Square fit/clamping and sector/system grids
      cartographic-layers.mjs  Influence, zones and routes
      zone-layers.mjs          Clipped footprints and approximate 3D system clouds
      [other viewer modules]   Physical models/proxies, labels/sigils/envelopes;
                               see ARCHITECTURE.md for individual owners
  examples/
    demo_atlas/
      sector.json              Authored v1.2 index in ly
      cantums.json             Authored demonstration histories
      presentation.json        Noncanonical colors/field settings
      connections.json         Generated Git-tracked runtime index
      systems/sys_0001.json    Authored records + derived local gate positions
      systems/sys_0002.json
      systems/sys_0003.json
    noncanon_sector_system.json / noncanon_system_detail.json
                               Active v0.1 regression inputs
    [other standalone JSON]    Historical v0.2 proposals; not v1.2 templates
  tests/
    check.mjs / demo.mjs        Legacy assertions / console chronology
    *.test.mjs                 Versioned schemas/history, generator, cartography,
                               viewer, ID Finder and layout
    browser-*.mjs              Playwright MCP entry points, not Node test files
    calibration/               Synthetic in-memory scenario, controller and HTML;
                               excluded from production, not a JSON dataset
    fixtures/v1_1/             Frozen accepted two-system branching regression
    fixtures/v1_2/             Frozen original three-system navigation regression
  public/data/
    political.json             Legacy canonical v0.1 history
    sector.json                Legacy canonical v0.1 index
    systems/.gitkeep           Reserved empty canonical detail directory
  public/assets/               Existing assets; only explicit approved SVGs bundled
    icons/                     Fourteen navigation SVGs and one Cantum demo sigil
    nexus/                     Supplied PNGs; viewer integration remains deferred
```

## Authoring and generated ownership

`examples/demo_atlas/systems/` owns v1.2 object declarations, permanent IDs,
history and authored absolute CNU coordinates. Each dedicated connected
short-range gate opts into `positionMode: "boundary_derived"`. The manual
generator writes only those position values plus the complete central
`connections.json`, preserving unrelated system-file bytes. The index is a
runtime dependency, not a second authoring source. Both outputs remain tracked.

The six current wrapper schemas reference the v1.2 master's exact `$id` and
definitions. The v1.1 master keeps its original distinct identifier for offline
regressions. There is no standalone frozen v1.0 master; the historically named
`schema-v1.test.mjs` now exercises the frozen v1.1 relationship contract.
The authoring wrapper is not the release validator.

The live demo is editable, while frozen test copies preserve earlier
accepted rejection/date/position scenarios. Identical permanent IDs across
these separate datasets do not constitute duplicates within one dataset.
Never deduplicate fixtures or renumber IDs as organization cleanup.

## Publication surfaces

| Path | Role | Public Git | Current browser build |
| --- | --- | --- | --- |
| `docs/` | Contracts, workflow, historical references | Public-safe | Excluded |
| `examples/demo_atlas/` | Noncanonical demonstration | Tracked | Seven exact allowlisted JSON inputs |
| Other `examples/` | Legacy regression and historical templates | Retained | Excluded |
| `public/data/` | Canonical legacy v0.1 records | Protected | Excluded (`publicDir: false`) |
| `public/assets/` | Existing art sources | Public-safe | Only fourteen navigation SVGs and one explicit demo sigil; NEXUS PNGs excluded |
| `tests/calibration/` | Synthetic in-memory local preview | Public-safe | Excluded; explicit loopback development middleware only |
| `src/viewer/`, modern core | Runtime implementation | Tracked | Included as bundled modules |
| `scripts/`, `schemas/`, `tests/` | Offline tools/validation/regression | Tracked | Excluded from runtime |
| `dist/` | Generated static demo build | Ignored | Output under `/Velara_Atlas/` |
| `node_modules/`, `.playwright-mcp/` | Dependencies, local browser artifacts | Ignored | Dependencies bundled as required; screenshots excluded |
| Private lore/caches/secrets | External or ignored local material | Never | Never |

Committing outside `public/` still discloses content in public Git.
An ignored folder is not a security control for already tracked history.
Do not inspect private sibling folders without an explicit task.

## Retention and review rules

Keep both original `noncanon_*.json` files: `tests/check.mjs` reads them.
Other standalone examples preserve superseded proposal shapes and are not
current authoring templates. See [pending candidates](REPOSITORY_AUDIT_3_6.md)
before proposing movement/deletion; nothing uncertain was moved in this audit.

Keep historical reports clearly labeled at their existing paths so existing
links and provenance remain valid. `SCHEMA_INSTALL.md` is obsolete setup history,
not an instruction to install old files over today's checkout.
`DATA_MODEL.md`, current schemas and `NAVIGATION_AUTHORING.md` govern new demo data.

## Proposed Phase 2 layout — not implemented

The [architecture optimization roadmap](ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md)
proposes relocating only the active noncanonical demo to `public/datasets/demo/`
after separate approval. Today it remains in `examples/demo_atlas/`.
`public/data/` remains protected legacy canon; frozen fixtures remain unchanged.
Standalone examples need individual review because two are live v0.1 test inputs
and others are superseded proposal shapes, not valid v1.2 templates.
See the [Phase 2 dependency and rollback inventory](PHASE_02_DATASET_MIGRATION_INVENTORY.md)
before planning any move. A directory relocation alone is insufficient.

Calibration remains in-memory under `tests/calibration/`; scenario JSON is a
Phase 5 proposal. A future `docs/reports/` reorganization would require a separate
path/link inventory and approval; Phase 1 organizes navigation only.

## Other reserved future paths

A local editor and deployment workflow remain deferred. `src/editor/` and
`.github/workflows/` are possible future locations, not current components.
`public/assets/` already exists; final art and NEXUS integration remain deferred.
Publication must explicitly exclude editor/private inputs and enable only reviewed
assets. Keep `publicDir: false`; do not copy all of `public/`.

No canonical migration, file move, commit, push or deployment follows from
this document. Review changes, run checks and obtain the relevant authorization.
