# Velara Atlas — Repository structure and ownership

**Status:** Architecture Phase 2 is committed in `6e026cb` (2026-10-20), including
Checkpoint 4.1 Phase 3, Cantum Stage 4 and intermediate calibration.
The [Checkpoint 3.6 audit](REPOSITORY_AUDIT_3_6.md) is an earlier inventory,
not a complete inventory of later additions. The tree below summarizes ownership;
[architecture](ARCHITECTURE.md) lists module responsibilities and the
[index](INDEX.md) maps documentation authority.
Architecture Phases 1, 2 and 2.1 are complete; Phase 2.2 is complete and
creator-approved. Its ten-file entity-family reference library is in
`examples/v1_2/`, with the active demonstration in `public/datasets/demo/`.
Architecture Phases 3A, 3B, 3C, 3D, 3E and 3F are complete and creator-approved. Phase 3D
activates v1.3 in the NONCANONICAL Demo; implementation and status are committed together.
Phase 3E implementation and completion documentation are committed together.
Phase 3F integration/showcase implementation is complete and creator-approved,
with implementation and completion documentation committed together. Overall
Architecture Phase 3 is complete. Architecture Phase 4 is complete and
creator-approved, with implementation and completion documentation committed
together. Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.
The active v1.3 Demo uses a provisional shared 24-ly radius. Frozen v1.2
per-Cantum settings and calibration radii remain unchanged.

## Current tree

Completed, creator-approved Phase 6 adds `tests/performance/` (seeded temporary workloads
and sampling probes), `tests/preview-performance.mjs` (finite loopback preview),
`scripts/benchmark-atlas.mjs`, `scripts/release-check.mjs` and a read-only
`.github/workflows/verify.yml`. Machine-specific output and screenshots remain
ignored under `.playwright-mcp/`; none are Demo imports. See
[performance/release operations](PERFORMANCE_AND_RELEASE_READINESS.md).

```text
Velara_Atlas/
  AGENTS.md                     Coding-agent constraints and read-first references
  README.md                     Public introduction, status and commands
  package.json / package-lock.json
  vite.config.mjs               Demo root/base, input allowlist and build checks
  .gitignore                    Dependencies, output, private/cache/recovery paths
  docs/                         Design contracts, guides, safeguards and reports
  schemas/
    atlas.schema.json           Unchanged v1.2 master/reference definitions
    atlas-v1_1.schema.json       Frozen v1.1 regression definitions
    atlas-v1_3.schema.json       Active v1.3 Demo/entity/governance definitions
    sector.schema.json
    cantums.schema.json
    connections.schema.json
    presentation.schema.json
    system-detail.schema.json   Release XYZ required
    system-authoring.schema.json Limited derived-gate pre-generation null
  scripts/
    atlas-validation.mjs        Strict offline Ajv
    check-relations.mjs         Cross-record integrity
    dataset-inventory.mjs       Sector-derived paths, identities and filesystem guard
    demo-files.mjs              Registered raw reads and byte-preserving rewrites
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
      main.mjs                 Loader/composition, navigation and historical refresh
      demo-data.mjs            Eager imports from the validated virtual mapping
      map-scene.mjs            Stable AtlasMap facade and renderer lifecycle
      chart-layout.mjs         Square fit/clamping and sector/system grids
      cartographic-layers.mjs  Influence, zones and routes
      zone-layers.mjs          Clipped footprints and approximate 3D system clouds
      [other viewer modules]   Physical models/proxies, labels/sigils/envelopes;
                               see ARCHITECTURE.md for individual owners
  public/datasets/
    demo/
      sector.json              Authored v1.3 Demo index in ly
      cantums.json             Authored demonstration histories
      factions.json            Two approved NONCANONICAL TEST faction registrations
      presentation.json        Noncanonical colors/field settings
      connections.json         Generated Git-tracked runtime index
      systems/sys_0001.json    Authored records + derived local gate positions
      systems/sys_0002.json
      systems/sys_0003.json
      systems/sys_0005.json    Approved Phase 3F star/planet/station/gate showcase
      factions/fac_0001.json   Historical TEST intelligence organization
      factions/fac_0002.json   Explicitly independent TEST faction
  examples/
    README.md                  Current contract and reference-only ownership
    v1_2/                      Ten focused family snippets/files plus the v1.2 guide
  docs/archive/
    json-proposals/            Eight unchanged obsolete standalone proposals
    completed-tasks/           Completed Phase 1/2 tasks and migration inventory
    design/                    Superseded v0.2 data-model proposal
    installation/              Obsolete schema package-install procedure
  tests/
    check.mjs / demo.mjs        Legacy assertions / console chronology
    *.test.mjs                 Versioned schemas/history, generator, cartography,
                               viewer, ID Finder and layout
    browser-*.mjs              Playwright MCP entry points, not Node test files
    calibration/               Local controller, HTML and JSON adapter; no production entry
      scenario-format.mjs      Reduced-format validator and cloning adapter
      preview.mjs              Registry, presets, camera delegation and diagnostics
      scenarios/               Finite manifest, unchanged baseline and island experiment
    fixtures/legacy_examples/  Three preserved legacy/forbidden regression inputs
    fixtures/v1_1/             Frozen accepted two-system branching regression
    fixtures/v1_2/             Frozen original three-system navigation regression
    fixtures/v1_3/             Isolated TEST factions, Cantum hierarchy and station
  public/data/
    political.json             Legacy canonical v0.1 history
    sector.json                Legacy canonical v0.1 index
    systems/.gitkeep           Reserved empty canonical detail directory
  public/assets/               Existing assets; only explicit approved SVGs bundled
    icons/                     Fourteen navigation SVGs and one Cantum demo sigil
    nexus/                     Supplied PNGs; viewer integration remains deferred
```

## Authoring and generated ownership

`public/datasets/demo/systems/` owns v1.2 object declarations, permanent IDs,
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
| `public/datasets/demo/` | Noncanonical demonstration | Tracked | Sector-derived exact JSON allowlist; eleven current files |
| `examples/v1_2/` | Current developer learning references | Public-safe | Excluded |
| `tests/fixtures/legacy_examples/` | Legacy regression/forbidden inputs | Preserved | Excluded |
| `docs/archive/json-proposals/` | Superseded JSON proposals | Preserved | Excluded |
| `public/data/` | Canonical legacy v0.1 records | Protected | Excluded (`publicDir: false`) |
| `public/assets/` | Existing art sources | Public-safe | Only fourteen navigation SVGs and one explicit demo sigil; NEXUS PNGs excluded |
| `tests/calibration/` | JSON-backed synthetic Development calibration | Public-safe | Excluded; explicit loopback development middleware only |
| `src/viewer/`, modern core | Runtime implementation | Tracked | Included as bundled modules |
| `scripts/`, `schemas/`, `tests/` | Offline tools/validation/regression | Tracked | Excluded from runtime |
| `dist/` | Generated static demo build | Ignored | Output under `/Velara_Atlas/` |
| `node_modules/`, `.playwright-mcp/` | Dependencies, local browser artifacts | Ignored | Dependencies bundled as required; screenshots excluded |
| Private lore/caches/secrets | External or ignored local material | Never | Never |

Committing outside `public/` still discloses content in public Git.
An ignored folder is not a security control for already tracked history.
Do not inspect private sibling folders without an explicit task.

## Retention and review rules

The two original `noncanon_*.json` regression files and the `cantum_b.json`
forbidden-input fixture now live in `tests/fixtures/legacy_examples/`, with
unchanged bytes and assertions. Eight obsolete proposal files are preserved in
`docs/archive/json-proposals/`; their README records versions and provenance.
`examples/` now contains only current v1.2 developer references and explanatory
documentation. These references never register runtime data or reserve IDs.

Keep historical reports clearly labeled at their existing paths so existing
links and provenance remain valid. `archive/installation/SCHEMA_INSTALL.md` is obsolete setup history,
not an instruction to install old files over today's checkout.
`DATA_MODEL.md`, current schemas and `NAVIGATION_AUTHORING.md` govern new demo data.

## Architecture Phase 2 organization

The seven live JSON files now reside under `public/datasets/demo/`; their relative
paths and bytes are preserved. `public/data/` remains protected legacy canon,
and frozen fixtures remain unchanged. The original [dependency inventory](archive/completed-tasks/PHASE_02_DATASET_MIGRATION_INVENTORY.md)
records the pre-migration consumer map. Completed Phase 3B replaces manual
registration with `scripts/dataset-inventory.mjs`: sector-declared paths drive
offline reads, the browser virtual module and exact Vite admission. Full preload
remains. See [loading workflow](../README.md#registered-demo-systems-and-loading).

Substep B separately preserves three legacy regression files and archives eight
obsolete proposals, leaving validated v1.2 learning references under `examples/`.
See [Phase 2 results](PHASE_02_DATASET_MIGRATION_RESULTS.md) for historical checks;
that report's uncommitted-work circumstances predate `6e026cb`. Current reference
coverage and validation targets are in [the family guide](../examples/v1_2/README.md).
Calibration facts now live in the fixed `tests/calibration/scenarios/cantum-scale-baseline.json`;
`scenario.mjs` retains the compatibility API via `scenario-format.mjs`. Completed, creator-approved Phase 5 adds the finite JSON registry, presets and island/elevation scenario. A future report-directory reorganization needs separate approval.

The [accepted v1.3 guide](DATA_MODEL_V1_3_PROPOSAL.md) owns the current Demo
entity/presentation contract, retaining its Phase 3C proposal history. `src/core/infocard-resolver.mjs` is now explicitly admitted to
production; the v1.3 fixture remains excluded. `scripts/entity-relations.mjs` is offline
validation, not a second navigation compiler. Internal v1.3 root/version opt-in
and ID Finder fixture injection do not create public dataset selection.

## Other reserved future paths

A local editor and deployment workflow remain deferred; `src/editor/` is a
possible future location, not a current component. `.github/workflows/verify.yml`
now contains only read-only source/test/build verification, with no publishing.
`public/assets/` already exists; final art and NEXUS integration remain deferred.
Publication must explicitly exclude editor/private inputs and enable only reviewed
assets. Keep `publicDir: false`; do not copy all of `public/`.

No canonical migration, file move, commit, push or deployment follows from
this document. Review changes, run checks and obtain the relevant authorization.

## Local authoring ownership (completed Phase 3E)

- `scripts/atlas-new-system.mjs`: fixed Demo CLI; preview by default, explicit apply.
- `scripts/system-authoring.mjs`: reusable validated planning, two-file writes and rollback recovery.
- `scripts/authoring-guard.mjs`: pending-state checks shared with navigation and Vite.
- `tests/system-authoring.test.mjs`: temporary dataset success/security/failure/build checks.
- `tests/authoring-scenario.mjs`: explicitly TEST star/planet/station/gate pair on a copy.
- `tests/preview-system-authoring.mjs`, `tests/browser-system-authoring.mjs`: loopback-only temporary browser integration, no write endpoint.
- [MANUAL_AUTHORING](MANUAL_AUTHORING.md): commands, object workflow and evidence-preserving recovery.

The new-system CLI may mutate only `sector.json` and one new matching
`systems/sys_XXXX.json` under the configured Demo. Its ignored recovery journal,
lock and stages/backups are local safety evidence; preserve them while pending.
None are publication inputs. Canonical records, live Demo facts, schemas and
frozen fixtures are not changed by this implementation task.

## Completed Phase 3F showcase

The ordinary Demo registers `sys_0005`, its five-object detail, and two TEST faction
files. Only Cantum B's superior-affiliation periods change among existing political
records; all existing system entries/details and routes remain preserved. The
shared radius stays 24 ly. [DEMO_SHOWCASE](DEMO_SHOWCASE.md) lists the exact differences.
`tests/phase3f-integration.test.mjs` derives temporary copies using the Phase 3E
service; `tests/browser-phase3f-showcase.mjs` exercises the normal Demo on 5173.
Phase 3F itself added no runtime fixture imports, new application subsystem,
Canon move or Phase 4 work; the completed modularization is described below.

## Completed Phase 4 viewer owners

- `app-state.mjs`: per-session UI state and delegation to pure historical resolution.
- `catalogue-view.mjs`, `timeline-view.mjs`, `layer-view.mjs`: focused DOM controls.
- `infocard-model.mjs`, `infocard-view.mjs`: historical facts/destinations, dialog and focus.
- `app-shell.mjs`, `lifetime.mjs`: panels/chart sizing and owned listeners/observers.
- `camera-controller.mjs`, `map-interaction.mjs`: camera/controls and picking/inputs.
- `scene-layers.mjs`, `projected-labels.mjs`: per-map resources and existing caption projection.
- `layer-config.mjs`, `visual-config.mjs`: closed visibility definitions and safe defaults.
- `tests/viewer-modules.test.mjs`, `tests/browser-viewer-modules.mjs`: focused module and real-Demo lifecycle checks.

All runtime owners remain under `src/viewer/`, inside the existing source boundary.
No test-only import, arbitrary discovery, dataset mutation or new dependency is
introduced. Main and AtlasMap are compatibility/composition facades, not alternate
history or geometry sources. See [architecture](ARCHITECTURE.md#phase-4-viewer-module-ownership).
