# Velara Atlas — Architecture, Data and Developer-Workflow Optimization Roadmap

**Status:** Architecture Phases 1, 2, 2.1, 2.2, 3A–3F, 4, 5 and 6 are complete and creator-approved. Phase 6 implementation and completion documentation are committed together. The current Architecture Optimization Roadmap (Phases 1–6) is complete; the entire project is not finished or deployed.

> **Completed roadmap, retained for provenance and link continuity.** [PROJECT_STATUS](PROJECT_STATUS.md) owns present decisions. All phase tasks and authorization text below describe completed work; do not execute them again.

**Baseline reviewed:** `main` at `190bd21bcdfd6bfafc94b51ffccd705592b0648c` (2026-10-20, `feat: Visual callibration`).  
**Completed maintenance:** Phase 2 dataset migration is committed in `6e026cb`
(2026-10-20), and Phase 2.1 in `711a410`. Phase 2.2's simplified entity-family
reference library is complete and creator-approved.
**Roadmap baseline:** `main` at `1f36182` (2026-10-21); Phase 2.2 was committed in `8d88ef2`.
**Completed historical authorization (not a current work order):** creator-approved Phase 6 final verification, documentation,
one completion commit and normal push only. No additional development, deployment,
Canon migration or Atlas Creator is authorized. No next milestone is automatically
authorized by completion of this roadmap.
**Scope:** Developer experience, data-loading and authoring architecture, file ownership, documentation, configuration, runtime performance, and eventual static publication.  
**Out of scope unless separately authorized:** Canonical migration, new lore, changes to established history/geometry, new visual art, public deployment, and a full graphical editor.

> **Purpose:** Authoring a supported star system, celestial body, station, navigation link, or historical change must be a data operation, not a code-maintenance operation. A creator should not need to understand the renderer to prepare valid atlas records. The public viewer remains a read-only presentation of **explicitly approved** JSON data.

## Relationship to existing documents

This is an **architecture optimization workstream**, not a replacement for `docs/DEVELOPMENT_ROADMAP.md` or the approved feature specifications. Current behavior and rules continue to be defined by `docs/DATA_MODEL.md`, `schemas/`, `docs/VIEWER_SPECIFICATION.md`, `docs/CANTUM_TERRITORY_RENDERING.md`, `docs/NAVIGATION_AUTHORING.md`, `docs/CONTENT_WORKFLOW.md`, `docs/NEXUS_VISUAL_IDENTITY.md`, and `AGENTS.md`. Implementation reports remain point-in-time evidence, not active instructions. Resolve contradictory current-status prose by inspection, not by silently overriding technical contracts.

Phase 2.1 completed examples/documentation consolidation. Completed,
creator-approved Phase 2.2 simplifies `examples/v1_2/` into ten focused
entity-family references and one guide with explicit gate-authoring semantics.
The active demonstration remains in `public/datasets/demo/`. Results are reported
directly to the creator; no additional Codex task/results document is required. Completed task records are retained only
in [the historical archive](INDEX.md#archived-completed-or-superseded-material).
The committed Phase 2 evidence remains in [its report](archive/reports/PHASE_02_DATASET_MIGRATION_RESULTS.md).

## Original baseline findings (190bd21)

Completed architecture Phase 2 relocated the live demo to `public/datasets/demo/`; the
following table retains the original Phase 1 audit context, including the old
manual file lists. Current Phase 3B operating behavior is described in
[architecture](ARCHITECTURE.md#validated-dataset-inventory); eager preload remains.

The baseline has a working separation between pure historical/cartographic logic (`src/core/`), Three.js viewer (`src/viewer/`), schema validation, navigation generation, browser tests, and test fixtures. **Preserve it.** The principal bottlenecks are at the data-registration, viewer-orchestration, configuration, and development-tools boundaries.

| Current responsibility | Verified owner / constraint | Optimization target |
| --- | --- | --- |
| Live noncanonical demo | `examples/demo_atlas/` | Move to a dedicated, public-safe demonstration dataset namespace; leave `examples/` for reference examples |
| Demo dataset enumeration | `scripts/demo-files.mjs` (`SYSTEM_FILES` and `INPUT_FILES`) | One discoverable/validated dataset inventory rather than several hand-edited lists |
| Browser system loading | `src/viewer/demo-data.mjs` (three explicit system import callbacks; preloads released details) | Validated inventory with **eager preload preserved** |
| Build input allowlist | `vite.config.mjs` (seven exact JSON paths) | Generate the input/output allowlist from the **approved release manifest**, never unconstrained folder scanning |
| IDs | `scripts/idfind.mjs` (read-only suggestions) | Safe, collision-checked creation workflow; never silently renumber existing IDs |
| Navigation | Authored system declarations; generated `connections.json` | Preserve source-of-truth, manual generator/check/recovery, and deterministic outputs |
| Viewer coordination | `src/viewer/main.mjs` and `map-scene.mjs` | Extract cohesive UI/state/camera/picking/layer responsibilities without changing behavior |
| Presentation controls | `visual-config.mjs`, `style.css`, `map-scene.mjs`, related modules | Single documented configuration surface for **tunable** parameters; do not externalize invariants |
| Calibration preview | `npm run preview:calibration`, `scripts/preview-cantum-calibration.mjs`, `tests/calibration/` | Phase 3A: synthetic JSON source and `npm run dev` environment |
| Legacy canonical records | `public/data/sector.json`, `public/data/political.json`, legacy resolver/tests | **Do not migrate or overwrite** during this workstream |
| Production | Vite `publicDir: false`, base `/Velara_Atlas/`, static output audits | Retain disclosure boundary; implement explicit release packaging and deployment only in a later approved phase |

### Calibration preview: exact ownership at this baseline

`npm run preview:calibration` starts a loopback-only Vite server at `http://127.0.0.1:5174/Velara_Atlas/__calibration/`. At the pre-3A baseline its scenario was created **in memory** in `tests/calibration/scenario.mjs` (15 synthetic star systems, a 40 x 40 ly sector, independent 12-ly Y extent, two synthetic Cantums and selectable 2/2.5/3 ly radii). `tests/calibration/controller.mjs` resolves/displays it. `tests/calibration/index.html` owns the controls. `scripts/preview-cantum-calibration.mjs` serves an explicit three-file inventory. **That baseline read no Demo JSON and stored no scenario JSON.** The completed, creator-approved Phase 3A workflow is documented in [local development](LOCAL_DEVELOPMENT.md#local-development-and-future-canon); its named JSON is now the local source of truth. It is test infrastructure, not the canonical source or the main demo loader. Preserve its reproducibility and production exclusion.

### Non-negotiable design and publication boundaries

1. **In-universe chronology is distinct from data privacy.** A `publicDetailPath: null` system retains the NEXUS catalogue fallback. It is not a way to conceal files already committed to Git.
2. **Public Git is itself a disclosure surface.** Nothing unreleased/private enters `public/`, `examples/`, `docs/`, tests, commits, bundles, or browser requests. Placing files under `public/` does not make them private; keep `publicDir: false` and copy only authorized output into `dist/`.
3. **Preserve canon, IDs and schema semantics.** Retain legacy v0.1 and frozen v1.1/v1.2 fixtures; schema v1.2 is currently the noncanonical authoring contract. No invented dates, positions, identities, political status, counts, or meanings.
4. **Preserve navigation source-of-truth.** v1.2 object declarations own connections; `connections.json` and selected derived boundary-gate positions are generator outputs. Validation/build must not mutate source data.
5. **Preserve spatial and historical invariants.** Sector XYZ in ly; system XYZ in CNU (`1 CNU = 10,000 km`); absolute map positions; history intervals `fromAE <= yearAE < untilAE`, `null` open-ended; physical sizes independent from visible navigation-symbol minima.
6. **Do not solve configuration by exposing unsafe internals.** CSS colors, label distances and supported presentation values are tunable; schema rules, units, ID semantics, release allowlists, clipping correctness and safety limits are governed by contracts.
7. **Prefer incremental refactoring.** Retain vanilla JS, Three.js, Vite, Node tooling and pure `src/core/` architecture unless a later explicit decision changes the stack.

## Phase sequence and approval gates

```text
COMPLETED: Phases 1, 2, 2.1, 2.2, 3A-3F; overall Phase 3; Phases 4, 5 and 6
       |
       v
[3A] Environment separation and calibration JSON (complete)
       | creator review
[3B] Dataset inventory and eager loader (complete)
       | creator review
[3C] Factions, InfoCards, Cantum hierarchy (complete)
       | creator review
[3D] Governing influence, universal radius (complete)
       | creator review
[3E] Manual system-authoring helpers (complete)
       | creator review
[3F] Historical integration and living Demo showcase (complete, creator-approved)
       | creator-approved Phase 4
[4] Viewer modularization (complete, creator-approved)
       | creator-approved Phase 5
[5] Expanded local previews (complete, creator-approved)
       | creator-approved Phase 6
[6] Performance and production readiness (complete, creator-approved)

Separate approval: MCR Canon migration / Atlas Creator
```

### Phase 1 — Documentation consolidation and baseline inventory

**Completed:** committed in `6ae6ee2`. Original scope below is retained as history.

**Goal:** Establish one navigable, internally consistent documentation hierarchy before touching source data, viewer code, directories, tests or deployment configuration.

**Work:**
- Inspect actual `HEAD`, `git status`, and relevant read-first files. Record the actual committed baseline and any local uncommitted changes; never discard existing work.
- Classify docs into **active contract**, **current how-to**, **roadmap/status**, **historical result/report**, and **superseded proposal**. Create or update a short `docs/INDEX.md` giving authority and entry points without re-documenting the codebase.
- Reconcile *current-status* statements in `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/REPOSITORY_STRUCTURE.md`, and `docs/DEVELOPMENT_ROADMAP.md` against `main`. The Phase 4 Cantum island and October 20 calibration work is already committed at baseline, despite some pre-commit report prose.
- Describe what calibration actually does and where its in-memory scenario resides. Distinguish the local `preview:calibration` server from the live noncanonical demo and from any future generic Atlas Studio.
- Record the proposed Phase 2 move, exact path consumers, legacy exceptions, rollback requirements, and release audit implications. Do **not** perform the move.
- Preserve the historical meaning of reports. Link and label them; do not retrospectively alter claimed test evidence or rewrite completed reports as if their original branch status had changed.

**Deliverables:** Documentation index; corrected current-status entries; updated cross-links; explicit current-vs-target structure; concise Phase 2 migration inventory; short report of exact docs edited and checks run.

**Acceptance gate:** One current authoritative path for status/structure/authoring; no dangling local documentation links newly introduced; no source code, data, test fixtures, schema, Vite/package scripts, directory moves, or builds changed by source edits. Phase 1 is **docs-only** except minimal status/authority corrections inside `AGENTS.md` and `README.md`. See the Codex task for exact allowed files and review process.

### Phase 2 — Dataset and repository organization

**Completed:** committed in `6e026cb`; see [results](archive/reports/PHASE_02_DATASET_MIGRATION_RESULTS.md).
Original delivery plan below is retained for reference.

**Goal:** Give active demonstration data, examples, calibration fixtures, legacy canon and public-release output unambiguous ownership.

**Implemented Phase 2 target (original Substep A/B organization):**

```text
public/
  assets/                       # existing approved static art sources
  data/                         # protected, unchanged canonical v0.1 baseline
  datasets/
    demo/                       # deliberately public-safe, NONCANONICAL active demo
      sector.json
      cantums.json
      presentation.json
      connections.json         # GENERATED, not manually authored
      systems/sys_XXXX.json
examples/                        # reference/template JSON only, never live dataset
  README.md
  v1_2/
docs/archive/json-proposals/      # obsolete proposals preserved, not templates
tests/
  fixtures/                     # frozen v1.1/v1.2 and separate legacy_examples
  calibration/                  # current preview, later named scenarios
```

The implemented move under `public/datasets/demo/` **does not authorize enabling Vite's `publicDir`** or copying all of `public/`. Until Phase 3, explicitly update the existing demo loader, safe path/recovery utilities, `.gitignore`, ID Finder, validators, generator, Vite source restrictions, tests and docs so the demo still functions. Move test-dependent old examples to fixtures only when all references and test semantics are preserved. Never conflate old v0.1 `public/data/` with a v1.2 publishable dataset. No automatic canonical promotion.

**Acceptance gate:** Same demo content/IDs/history/geometry/connections and outputs, relocated; `examples/` serves reference/documentation purposes; existing behavior and audits pass; a full path-by-path diff and rollback instructions exist. Stage as small coherent commits **only with explicit approval**.

### Phase 3 — Data-driven architecture and historical entities

**Status: 3A-3F and overall Architecture Phase 3 are complete and creator-approved. Architecture Phase 4 is complete and creator-approved; Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.**
The plan is divided into **3A-3F**;
each checkpoint needs its own creator-approved Codex task, review, and
separate commit authorization. Completed Phase 3D activates v1.3 in the noncanonical Demo; frozen v1.2 stays compatible.
The old Phase 3 proposal for lazy loading and per-system publication gates
is superseded.

**Purpose:** Creating a supported system, object, complete link, faction
or historical change should be a validated JSON operation, not a change
to browser/renderer registration code. Preserve IDs, chronology, source
of truth, the read-only viewer, and strict selected-dataset build audits.

#### Cross-phase decisions and invariants

- **Three environments.** Development is synthetic local calibration,
  Demo is the graphical noncanonical Atlas, Canon is separately
  creator-approved MCR history. Private unreleased content stays
  outside Git, not behind flags in committed files. The eventual
  Canon dataset requires a separate human-reviewed migration of
  protected `public/data/` v0.1 records.
- **Selected-dataset inventory and eager loading.** `sector.json`
  is the system catalogue; generate one validated inventory from
  its declared paths in an explicitly selected trusted dataset root.
  Reuse it for loaders, validators, navigation writer/check, ID
  Finder and Vite allowlists. Retain full detail preload: current
  route eligibility, timeline event discovery and system switching
  depend on the complete dataset. `publicDetailPath: null` denotes
  NEXUS catalogue-only fallback, not secret data or a broken
  referenced detail. No unlimited globs, remote paths or public
  directory copying.
- **Complete dated navigation.** Every new short-range gate
  initially has `position: null` and
  `positionMode: "boundary_derived"`. The creator supplies the
  two constructed/known physical gates, valid anchors, complete
  `lnk_` declaration and explicit years before publication.
  `npm run connections` calculates XYZ and generated graph;
  `connections:check` is read-only. Gates constructed at
  different historical years may visibly exist before a later
  link activation. Do not allow unfinished connections,
  invent years, change partner lifetime constraints, or
  weaken recovery and historical validation.
- **Political semantics.** System `cantumHistory` remains the
  *direct administrative* Cantum. A Cantum's dated
  `infoCard.affiliation` will mean its direct superior Cantum
  under the proposed next-version contract. Following that
  chain at a selected year yields the ultimate governing
  Cantum. No new `suzerainHistory` or
  `institutionalAffiliationHistory` keys are needed.
  `controlHistory` remains distinct. Validate same-year
  parent consistency, `can_` parent ID types, no cycles,
  self-reference or overlapping parents.
- **Null semantics.** A dated *effective* affiliation record
  with `entityId: null` explicitly means Independent.
  A null history or uncovered date means Not recorded.
  Unresolved references are errors, never Independent.
  Old v1.2 records/fixtures are not silently reinterpreted.
- **Faction model.** New permanent IDs use `fac_` for lawful
  and unlawful organizations: private groups, police,
  military/navy/intelligence, research, pirates, criminals,
  extremists, etc. Maintain dated names, faction type,
  lawful/unlawful classification and Cantum relationship.
  Lawful factions can be Cantum-affiliated or independent;
  unlawful factions must be independent in the same period.
  Operating within a Cantum does not imply official
  affiliation. Reserve `pol_` for a future genuinely
  different polity entity, and do not create new `org_`
  records; retain frozen v1.2 backwards compatibility.
  Former Continuance institutions can be renamed in
  explicitly dated histories without automatic inference.
- **Historical ID resolution.** A pure proposed
  `src/core/infocard-resolver.mjs` should translate registered
  `can_`/`fac_` IDs into correct-year display names and
  a resolution status, reusing `atYear`. It must preserve
  missing/independent/unresolved distinctions and not
  determine system administrative membership.
- **Governing influence.** Resolve each eligible positioned
  system's direct and ultimate Cantum at year Y, and merge
  contributors under the ultimate governing Cantum **before**
  calculating Gaussian influence. The governing Cantum
  supplies color, surface and nameplate identity; the
  subordinate retains original administration in its
  InfoCards. Update flat fields, perspective envelopes,
  contributor checks, detached-island labels, sigils,
  elevation and caching together. Adopt a single positive
  `territoryOverlay.radiusLY`, retain per-Cantum colors,
  existing opacity/threshold/Gaussian behavior and avoid
  pretending those fields are exact borders.
- **Coordinated versioning.** Faction registry, Cantum
  hierarchy interpretation, null semantics and shared
  radius are a proposed **v1.3** data model (provisional).
  Prepare isolated tests first, then perform one approved
  active *noncanonical* Demo transition. Protect v0.1
  Canon and frozen v1.1/v1.2 fixture/schema behavior.

#### 3A — Development, Demo and future Canon separation

**Implementation status: complete and creator-approved.** `npm run dev` serves
loopback Development/calibration on 5174 at `/Velara_Atlas/__calibration/`;
`npm run demo` validates and serves the graphical NONCANONICAL Atlas on 5173.
`npm run history:demo` preserves the terminal chronology, and
`preview:calibration` aliases the same Development entry point.

`tests/calibration/scenarios/cantum-scale-baseline.json` now owns the synthetic
facts and settings. The deterministic `scenario.mjs` adapter validates this local,
reduced format, clones records for each call and applies the selected 2/2.5/3-ly
radius. Pre-migration snapshots match at all three radii: fifteen systems, both
Cantums, exact coordinates, dates, memberships, transfers and presentation remain
unchanged. Development fixtures are not Demo inputs; future Canon has no launcher
or fallback. Protected v0.1 records, frozen fixtures, release schemas, generated
navigation and the `publicDir: false` input/output audits remain unchanged.

**Verification evidence:** 187 automated tests passed, including JSON provenance,
exact snapshots, independent loads, invalid-input rejection, history and local
HTTP isolation. Strict Demo validation, read-only navigation freshness, the
audited 21-file/15-SVG build and unchanged terminal history passed. Chromium
calibration covered all nine radius/camera combinations plus historical transfer,
nameplates/sigils, touch/keyboard, mobile and resource reuse. Graphical Demo suites
verified navigation, history, rendering and interaction. Physical touch hardware
is not verified. See [commands, format and test entry points](LOCAL_DEVELOPMENT.md#local-development-and-future-canon).

**Retained original design and acceptance criteria (pre-3A command names):**

**Work:** `npm run dev` becomes loopback-only development
calibration, while `npm run demo` becomes the current graphical
noncanonical viewer. Today's `npm run demo` actually invokes
the legacy terminal `tests/demo.mjs`; retain it under a
proposed `npm run history:demo`. Keep existing
`preview:calibration` as a compatible alias during transition
and update browser tests/docs. Move the *synthetic source*
from `tests/calibration/scenario.mjs` into named JSON
scenarios with a deterministic loader/adaptor, preserving
15 synthetic systems, two Cantums, the 40-ly map, authored
test history/geometry, radii 2/2.5/3 ly and the nine accepted
radius/camera comparisons. The current memory-only scenario
is not a strictly complete release-valid dataset, so do
not simply stringify it and claim schema compliance.
Reserve a future Canon dataset root without moving,
converting or displaying protected v0.1 as v1.2/v1.3.

**Acceptance:** Both commands open correct isolated
experiences; terminal history survives; existing tests
and visual calibration remain identical; development
fixtures do not enter the graphical Demo build.

#### 3B — Unified safe inventory and full-dataset loader

**Implementation status: complete and creator-approved.** Implementation and
completion documentation are committed together. Phase 3C is also complete and
creator-approved; Phases 3D-3F and overall Phase 3 are also complete. Architecture Phase 4 is complete and creator-approved; Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

`scripts/dataset-inventory.mjs` derives deterministic paths from the trusted
`public/datasets/demo/sector.json` catalogue and its registry references. Demo is
the only configured modern viewer dataset; alternate root/IO injection supports
isolated tests, not public CLI/URL selection or Canon loading. Paths must match
`systems/<registered-system-id>.json`; catalogue-only null paths remain archival.
Strict path/identity/uniqueness and filesystem checks precede detail reads,
including rejection of traversal, absolute paths and symlink/reparse redirects.
Existing Ajv authoring/release, relationship and navigation validators remain
authoritative; stale output and recovery journals block startup/build.

`scripts/demo-files.mjs` preserves raw text and stable system/file association for
the unchanged navigation writer. Vite derives exact JSON admission and a narrow
virtual import mapping from the same inventory. The browser eagerly preloads all
released details, preserving timeline/navigation eligibility and archival fallback.
No folder glob, on-demand fetch, parallel handwritten manifest or automatic
navigation generation is introduced. Registration changes require a Demo restart.
ID Finder retains read-only unregistered-file diagnostics without publication
admission. `publicDir: false`, approved assets and output audits remain intact;
Development calibration and protected Canon stay excluded.

**Verification evidence:** 196 automated tests passed, including nine focused
inventory tests covering unsafe/invalid inputs, missing/mismatched records,
symlink/reparse rejection, stale navigation, restart behavior and unregistered-file
exclusion. An isolated fourth-system fixture passes schema/relationships,
eager browser-loader resolution, HTTP admission, navigation generation with
byte-preserving writes and a full audited build without source-list changes.
Strict Demo validation, read-only navigation freshness, terminal history and the
21-file/15-approved-SVG production build pass. Chromium checks cover graphical
history, catalogue, archival fallback, navigation, rendering and calibration's
nine radius/camera combinations. Protected data and calibration facts remain
byte-identical. The existing bundle-size advisory and physical-device/cross-browser
verification limits remain. See [operating architecture](ARCHITECTURE.md#validated-dataset-inventory)
and [authoring/testing steps](LOCAL_DEVELOPMENT.md#registered-demo-systems-and-loading).

**Retained original Phase 3B objectives and acceptance criteria:**

**Work:** Replace separately maintained explicit
system arrays in `src/viewer/demo-data.mjs`,
`scripts/demo-files.mjs` and `vite.config.mjs` with
one inventory derived from selected, trusted sector JSON.
Validate filename/ID agreement, versions, uniqueness,
safe paths, no traversal or symlinks/reparse, existing
non-null detail files, cross-file references and generated
navigation freshness. Reuse selected-dataset policy
for validation, `idfind` and `connections` commands.
Preserve bounded Vite modules/assets and
`publicDir: false`. Continue eagerly loading all
released details and verified links, not fetching
on demand.

**Acceptance:** Add another noncanonical disconnected
system with a planet or station by editing JSON only,
without viewer or Vite source changes. Invalid/unsafe
inputs are rejected; existing Demo behavior survives.

#### 3C — Faction registry, InfoCards and Cantum hierarchy

**Implementation status: complete and creator-approved.** The implementation and
completion documentation are committed together. Phases 3D-3F and overall
Architecture Phase 3 are also complete and creator-approved; Architecture Phase 4 is complete and creator-approved; Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

The separate [provisional v1.3 contract](DATA_MODEL_V1_3_PROPOSAL.md) and schema
provide isolated Draft 2020-12 validation, a compact `factions.json` registry and
authoritative `fac_` records. Factions have historical names, descriptive types,
lawful/unlawful status and dated Cantum affiliation. Cantum `infoCard.affiliation`
records dated direct governance without changing system administrative membership.
Pure entity, InfoCard and governing-Cantum resolvers preserve uncertainty and
explicit independence. Temporal validation checks reference integrity, lawful
coverage, unlawful independence, self-parenting and cycles at every change boundary.
The existing ID Finder supports registered factions and unregistered diagnostics.

Verification: 215 automated tests, including 19 focused v1.3 schema, registry,
reference, legal-status and temporal-governance tests; 12 ID Finder regressions;
46 navigation tests; 12 calibration tests. Strict Demo validation, read-only
navigation checks, audited build and legacy historical demonstration pass.
Fourteen existing Chromium suites pass, including nine calibration radius/camera
comparisons. Protected baseline files and the 21-file Demo output remain unchanged.
These counts record the closeout execution, not future test-suite requirements.

That Phase 3C checkpoint kept the Demo/compiler/rendering on v1.2. Completed Phase
3D activates the resolver and v1.3 Demo, while test fixtures remain excluded.
See the [operational migration crosswalk](DATA_MODEL_V1_3_PROPOSAL.md#phase-3d-demo-migration-crosswalk).
Original Phase 3C objectives follow.

**Work:** Add proposed `factions.json` as a compact
index and authoritative `factions/fac_XXXX.json`
records. Avoid duplicate names in the registry.
Define dated faction names, types, lawfulness and
Cantum affiliations, and validate their period-wise
consistency. Introduce a pure year-aware reference
resolver for InfoCards with explicit Independent,
Not recorded and Unresolved states. Treat Cantum
`infoCard.affiliation` as dated direct superior
Cantum in the proposed contract; validate nested
hierarchies and preserve direct administrative
`cantumHistory`. Draft and test proposed v1.3
without switching the active v1.2 Demo halfway.

**Acceptance:** Stations display faction names
appropriate to year; renamed organizations resolve;
illegal lawful-status/affiliation combinations,
unknown IDs, cycles and self-parents fail; hierarchy
can transition from subordination to independence.

#### 3D — Governing Cantum territory and universal radius

**Implementation status: complete and creator-approved.** Implementation and
completion documentation are committed together. Phases 3E-3F and overall
Architecture Phase 3 are also complete and creator-approved. Architecture Phase 4 is complete and creator-approved; Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

At the Phase 3D checkpoint, the NONCANONICAL Demo used v1.3 throughout, including its empty faction
registry and historical InfoCard entity-name/legality presentation. Systems keep
their administrative `cantumHistory`; the pure governing resolver derives direct
superiors and ultimate roots at the selected year. Unknown governance is Not
recorded and creates no unsupported sovereign overlay. Eligible contributors
merge by governor before a single Gaussian sum; political labels, sigils and
islands use that governor, with actual subordinate elevations in perspective
envelopes. Existing field thresholds, opacity caps, interpolation and disposal
remain. Every v1.3 dataset requires authored presentation and one finite positive
universal radius; the Demo uses a provisional, noncanonical 24 ly. B's former
18-ly field intentionally expands, while A's sampled footprint is unchanged.

Navigation validates and emits its source version (v1.2/v1.3) without changing
link history, anchor geometry or derived XYZ. Raw-text writing, read-only freshness,
idempotence and partial-replacement rollback/recovery remain compatible. Frozen
v1.1/v1.2 schemas/fixtures, canonical records and calibration facts are preserved.
The validated inventory still selects only Demo for production, eagerly preloads
registered records, and excludes test/calibration data under `publicDir: false`.

Closeout verification: 223 automated tests; 97 focused v1.3, governance,
navigation, calibration and ID Finder tests; strict validation, read-only
connections check, audited build and legacy terminal history pass. Fifteen
Chromium suites pass, including isolated conquest/independence, historical
faction InfoCards and all nine calibration radius/camera combinations. The build
contains 21 audited files with 15 approved SVGs. These counts record closeout
evidence, not future suite requirements. Physical touch hardware/non-Chromium
verification and the existing bundle-size advisory remain limitations; fixed
sampling still approximates influence, never exact political borders.

See [the migration crosswalk and measured visual difference](DATA_MODEL_V1_3_PROPOSAL.md#phase-3d-demo-migration-crosswalk)
and [browser verification instructions](LOCAL_DEVELOPMENT.md#governance-test-preview).
Original Phase 3D objectives and acceptance criteria follow.

**Work:** Resolve direct and ultimate Cantum
for eligible systems, then aggregate all contributor
systems by ultimate governor before computing
fields. Update `territoryGroups`,
`influence-envelopes.mjs`, detached-island
names/sigils, elevation/label placement, 2D/3D
surfaces and cached keys consistently. Keep direct
membership in InfoCards. Replace per-Cantum radii
with one globally authored positive `radiusLY`
in proposed `presentation.territoryOverlay`,
while colors remain Cantum-specific. Do not
choose a canon radius here; Demo 24/18-ly
and synthetic calibration 2/2.5/3-ly are
test data. Specify missing-radius handling
explicitly and preserve Gaussian, threshold
and opacity behavior. Migrate only the approved
active Demo to new schema with generator
compatibility; keep frozen fixtures untouched.

**Acceptance:** Before conquest A and B have
separate colors; during B's dated subordination
their systems form ONE governing-A field with
coherent envelopes and labels, without double
opacity seams; B's independence returns its color.
Single-radius behavior and administrative identity
are preserved throughout.

#### 3E — Safe local manual authoring

**Implementation status: complete and creator-approved.** Implementation and
completion documentation are committed together. Phase 3F and overall
Architecture Phase 3 are also complete and creator-approved; Architecture Phase 4 is complete and creator-approved; Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

`npm run atlas:new-system` targets only the configured NONCANONICAL Demo.
Preview and ID suggestion are read-only, with explicit `--apply` for an empty
v1.3 detail and matching sector registration. The reusable Node-only authoring
service uses ID Finder's BigInt inventory, including archival and unregistered
identities, and rejects occupied or conflicting IDs/paths. Explicit chart sizes
are required; unknown history and six-field InfoCards remain null. No fictional
objects, dates, coordinates or political history are invented.

Current and proposed datasets pass the existing schemas, relationships and
navigation-freshness checks before writing. Verified staging, an exclusive
journal, sector backup, exclusive detail installation and concurrent-input
checks make the two-file operation recoverable while preserving unrelated bytes.
Ordinary errors roll back when safe; changed user files and unresolved evidence
are retained. `--recover` previews verified rollback; `--recover --apply` performs
it. Pending authoring state blocks other authoring, navigation and Demo startup/
build. The existing navigation writer keeps its separate journal and geometry.

[MANUAL_AUTHORING](MANUAL_AUTHORING.md) documents supported celestial objects,
stations, zones, references and complete dedicated gate pairs. New short-range
gates always start with null boundary-derived positions. Independent physical
construction/knowledge and later link activation remain separate; only the
explicit offline generator writes XYZ and `connections.json`. A temporary TEST
system with star, planet, station and gates at 350/352 A.E., linked at 353 A.E.,
works through validation, generation, eager loading, Chromium and an audited
build without viewer/Vite registration edits. It is not promoted into live Demo.

**Closeout verification:** 240 automated tests pass, including 17 focused
system-authoring tests for IDs, templates, registration, validation, unsafe paths,
concurrency, staging/rollback/recovery and a temporary eager-loader/build workflow.
Strict Demo validation, read-only connection freshness, terminal history, CLI help,
ID Finder with its required `all` prefix, and the audited production build pass.
Sixteen Chromium suites pass, including authoring visibility and gate chronology,
Demo navigation/archival fallback, governance/factions, labels/sigils/envelopes,
zones, touch emulation and all nine calibration radius/camera combinations.
Development, Demo and the calibration compatibility command pass HTTP checks;
unauthorized tool, Canon and calibration filesystem requests remain blocked.
The sigil suite was rerun on its documented Demo page after an initial wrong-port
fixture-context timeout; no implementation or assertion change was needed.
Bare `idfind` still reports the preexisting required-prefix usage error.
Production output remains byte-identical to the pre-3E 21-file baseline.
These are executed closeout results, not future suite-count requirements.

The public viewer remains read-only. Canon, schemas, frozen fixtures, Demo facts,
generated navigation, 24-ly shared radius and calibration remain preserved.
`publicDir: false`, exact inventory/asset admission and output audits remain.
Hard-link support is required; two-file OS atomicity is not claimed. Changed or
partial recovery evidence needs creator review. Physical-device/non-Chromium
coverage and the existing bundle-size advisory remain limitations.

**Retained original Phase 3E plan and acceptance criteria:**

**Work:** Add proposed `atlas:new-system` command
with ID suggestion/collision checks, schema-valid
template and consistent sector registration,
safe transactional/recoverable writes, and
actionable validation. Require creator input
where real dates/names/positions cannot be null;
never invent lore or change accepted IDs.
Extend scoped `idfind` and validation for `fac_`
and supported dataset selection. Preserve
authoring of two finished historical gates and
link before offline coordinate generation.
Keep authoring services separate from the
read-only viewer for future Atlas Creator reuse.

**Acceptance:** New system, supported entities
and complete historical route can be added
through JSON/local tools alone, with no
viewer/Vite edits or partial network published.

#### 3F — End-to-end integration and preservation

**Implementation status: complete and creator-approved.** Implementation, the
approved normal-Demo showcase and completion documentation are committed together.
One isolated valid scenario combines safe system creation/registration, collision
checks, star/planet/station authoring, complete gate pairs, explicit generation,
factions and historical InfoCards, governance, fields, detached identity, eager
preload, archival fallback and audited builds. The ordinary v1.3 Demo adds
`sys_0005`, two TEST factions, B's 800-1000 A.E. subordination and complete
350/352/353 gate chronology. It has four released details and one archival system.

The completed Phase 3 architecture combines the sector-derived validated inventory,
full eager preload, safe preview/explicit-apply authoring and recovery, v1.3 faction
and historical relationship validation, governing-Cantum field aggregation, one
provisional 24-ly radius and version-aware navigation. No manual viewer/Vite
registration was needed for the new records.

Verification: 245 automated tests, including five integrated/preservation tests,
and 17 applicable Chromium suites pass. The normal-Demo suite exercises exact
governance, faction and gate boundaries, InfoCards, flat/perspective display,
keyboard/mobile access, resource reuse and archival fallback; calibration retains
all nine radius/camera comparisons. Strict validation, read-only navigation
freshness, legacy terminal history, ID Finder and the 24-file/15-approved-SVG
build audit pass. Original system files and eleven links, Canon, frozen
fixtures/schemas and calibration facts are preserved. Unregistered/test/private
inputs and source maps remain excluded.

Known limits: influence fields remain approximations; the existing large-bundle
advisory remains; physical touch hardware and non-Chromium browsers are unverified.
At the Phase 3F checkpoint, no Phase 4, Atlas Creator, Canon migration or
deployment was implemented. Completed Phase 4 is recorded below.
See [the creator walkthrough and before/after comparison](DEMO_SHOWCASE.md).

**Permanent development policy:** separately authorized significant visible
features pass automated tests, receive representative NONCANONICAL Demo examples
when needed, then creator visual review/corrections and explicit approval before
separately authorized documentation/commit/push. Nonvisual work needs no filler.
TEST edge cases, Development/calibration, curated Demo and Canon remain separate.

**Retained original integration scenario and acceptance criteria:**

**Scenario:** Isolated NONCANONICAL fixture
with new system, star, planet and station;
two gates constructed at different years
and activated by `lnk_` later; generated
coordinates; factions with legal-status and
name-history changes; explicitly independent
faction; Cantum B subordinate to A and
later independent; direct/governing InfoCards;
one-radius 2D/3D envelopes and detached
nameplates. Do not add this fixture to
live Demo or Canon without separate approval.

**Acceptance:** `npm test`, strict validation,
`connections:check`, build/output disclosure
audits and targeted browser tests pass.
Existing v0.1 and frozen v1.1/v1.2
regressions continue passing. Phase 3 is
complete only when all checkpoints and
this integration result are creator-approved.

**Out of scope for Phase 3:** Automatic
canon migration, a complete graphical
Atlas Creator, unbounded publication
or arbitrary path access, lazy loading
without measured need, unfinished routes,
new visual artwork, broad viewer rewrite
or production deployment.

### Phase 4 — Viewer modularization and configuration

**Implementation status: complete and creator-approved.** Implementation and
completion documentation are committed together. `AppState` owns historical UI
state, filters and per-map preferences while reusing pure core resolution. Focused
catalogue, InfoCard model/view, timeline and layer owners preserve existing text,
ordering, focus and chronology. Main composes selection/navigation and refresh.
AtlasMap retains its public facade; camera/controls, picking/interaction, scene
layers and projected labels have cohesive owners using existing geometry/math.
A scoped lifetime owns listeners, observers and teardown; camera swaps and map
rebuilds dispose their resources. Closed visual settings retain approved defaults
and cannot change history, physical units, navigation or publication invariants.
Ownership is described in [architecture](ARCHITECTURE.md#phase-4-viewer-module-ownership).

Verification: 257 automated tests (including twelve new focused module tests),
18 applicable Chromium suites, all nine calibration comparisons, strict
validation, read-only navigation freshness, legacy history, ID Finder and the
24-file/15-approved-SVG build audit pass. Ten desktop/mobile DOM/camera snapshots
and controlled screenshots match the unchanged pre-refactor source. Startup-error
Retry, Vite reload, focus return, four remount/dispose cycles, listener/resource
stability and stale-callback suppression were verified. All eleven Demo JSON
files, Canon, schemas/fixtures, calibration, assets and build boundaries remain
unchanged. No dependencies, UI redesign or new Demo records were introduced.
Physical touch/non-Chromium QA and the existing large-bundle advisory remain
limitations. Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

**Retained original plan and acceptance criteria:** Extract
cohesive application state, catalogue,
InfoCard rendering, timeline, selection,
camera, picking, scene/layers and safe
NEXUS tunables from `main.mjs` and
`map-scene.mjs`. Reuse the pure
historical/reference logic from `src/core/`.
Preserve current 2D/3D visuals, zoom,
labels/sigils, keyboard/touch/pointer,
physical models, zone picking and
resource disposal. Centralize allowed
visual settings, not schema/ID invariants.

**Acceptance:** Same default look/behavior,
clear ownership per setting, focused
core/DOM/browser tests and no public
writer/editor endpoint.

### Phase 5 — Expanded local preview and ergonomics

**Complete and creator-approved.** Implementation and completion documentation
are committed together. The explicit `preview-manifest.json` registry selects
the unchanged 15-system calibration and a separate seven-system island/elevation
experiment. Twelve JSON-defined presets replay radius, year, top/perspective/low
camera, layers and visual state. Replay starts clean camera/control ownership;
ordinary adjustments use the Phase 4 camera API and independent derived data.
Background/selection colors and selection delay pass `createVisualConfig()`.
Read-only diagnostics derive eligible/contributing systems, field groups,
visible/detached identities, sampling/envelopes and renderer resources.

The loopback Development server retains the 5174 calibration route, finite
GET/HEAD admission, path/encoding/case checks and symlink/reparse rejection.
Errors clear obsolete maps and support explicit recovery, never hidden fallback.
The normal v1.3 Demo, Canon, baseline JSON, schemas/fixtures, navigation, Phase 4
defaults and production restrictions remain unchanged. No save API, arbitrary
dataset root, editor, new dependency or Phase 6 implementation is introduced.
The creator reviewed and approved these local-preview results. See
[scenario operations and test entry points](LOCAL_DEVELOPMENT.md#named-local-preview-scenarios).
At the Phase 5 closeout, Phase 6 remained proposed. Its current
completion and remaining limitations are recorded in the Phase 6 section below.

Final verification passes 270 automated tests, 25 independently run focused
preview/calibration tests and all 19 applicable Chromium suites, including the
original nine radius/camera comparisons. Preset replay, historical transitions,
visual tuning, invalid-input recovery and desktop/mobile use pass. Five scenario
cycles retain 153 listeners and stable geometry/texture counts; teardown removes
superseded resources. Strict validation, read-only navigation freshness, legacy
history, ID Finder and the 24-file/15-approved-SVG build audit pass. Protected
file hashes and production filenames/content-hashed chunks remain unchanged.
An isolated authoring browser attempt encountered Vite's shared dependency-cache
504; restarting the unchanged fixture server resolved it and its suite passed.
Physical touch hardware/non-Chromium QA and the existing bundle-size advisory
remain limitations, not completed Phase 6 profiling.

**Retained original proposal and acceptance criteria:** Phase 3A
already owns baseline calibration JSON
migration and the dev command. Phase 5
adds richer named local scenarios,
reproducible camera/radius/view presets,
safe visual tuning and diagnostic feedback,
using the Phase 3 data model and Phase 4
configuration surface. Prepare interfaces
for a separate interactive Atlas Creator,
but do not build a full editor. Keep all
synthetic preview resources out of public
output.

**Acceptance:** Select/replay calibration
scenarios without editing JS facts;
preserve prior results and build isolation.

### Phase 6 — Performance and production readiness

**Complete and creator-approved.** Implementation and completion documentation
are committed together. The optimization workstream is complete, not the entire
Atlas project or its public canonical release. See
[performance and release-readiness evidence](PERFORMANCE_AND_RELEASE_READINESS.md).
Completed implementation: seeded test-only workloads cover 5, 100, 400 and
1000 catalogue systems with advisory, machine-dependent timing budgets and
hardware-independent correctness/security/resource gates. Measurements identified
repeated whole-dataset Vite validation; a validated byte-checked snapshot removes
that repetition while retaining path, recovery, freshness and final-build checks.
All registered JSON inputs must appear in the bundle; output audits verify
selected identities, approved assets, resource references and bounded disclosure.
The fixed Demo release check and local static preview retain `/Velara_Atlas/`.

Verification includes 275 Node tests, strict validation, navigation freshness,
legacy history, ID Finder, all four CPU benchmark tiers, the local release dry
run, 19 existing Chromium suites, three new browser callbacks and the original
nine calibration comparisons. Medium/large browser stress and six disposal /
remount cycles pass. Accessibility probes cover keyboard, responsive layouts,
text scaling, visible control names/targets and sampled contrast; they are not
WCAG certification. Read-only Node 24 Ubuntu/Windows CI is implemented without
browser automation or deployment; remote execution is reported separately after
push, not inferred from local tests.

Accepted limitations remain explicit: non-Chromium engines, physical devices,
assistive technology and hosted CI are not certified by local Chromium results;
the optional full 1000-system browser sweep timed out (startup-only smoke passed).
Cold large-workload history/envelopes can stall, and fixed 128-grid sampling can
miss narrow islands on wide charts. No radius/field/renderer or historical data
was changed to hide these limits. Canon, Demo JSON, frozen fixtures, calibration
facts and publication boundaries are preserved. Measurement tables, budgets and
the precise executed/unverified matrix remain in the linked readiness report.

The original scope and acceptance criteria follow. Measure
representative larger NONCANONICAL
eager-loaded datasets: startup, timeline,
routes, system switching, Gaussian
sampling/nameplate density, GPU lifetime,
low-power/touch/browser/accessibility.
Profile before adding lazy loading or
LOD. Existing 128x128 sampling can
underresolve narrow 2–3-ly island
features on wide maps. Add CI, strict
dataset-selective build audits,
failure/recovery testing, GitHub Pages
base-path checks and publication dry runs.
Never silently publish Canon.

**Acceptance:** Measured budgets,
cross-browser/accessibility checks,
bounded distributables and separate
creator approval before deployment.

### Separate future projects

**MCR Canon migration:** Plan a
creator-reviewed permanent-ID/history
crosswalk from protected `public/data/`
v0.1 into a distinct modern Canon
dataset after Phase 3 stabilizes;
no invented lore or Demo promotion.

**Atlas Creator:** Future separate
local-only interactive authoring
application reusing Phase 3 validators/
writers and Phase 4 viewer modules.
Not an implementation part of
Phase 3 or the read-only public Atlas.

## Quality gates required for every later phase

- **Before:** `git status`; note committed HEAD and existing work; review owning contracts, tests and affected consumers; record expected diff and rollback method.
- **During:** Keep phases and substeps independently reviewable. Do not mix new creative/canonical content with architecture changes. Preserve IDs and source facts.
- **Verify:** Run relevant tests and strict validations (`npm test`, `npm run validate`, `npm run connections:check`, `npm run build` where applicable); targeted Chromium/browser coverage for viewer changes; diff review; disclosure audit; record commands not run.
- **After:** Provide files changed, behavior preserved, test evidence, outstanding questions, migration/rollback impact and the next **proposed** phase. **Stop for creator approval; never automatically begin the next phase or commit/push/deploy.**

## Creator-facing definition of success

| Goal | Result after corresponding phase |
| --- | --- |
| Launch calibration | `npm run dev` opens synthetic named scenarios (3A) |
| Launch example viewer | `npm run demo` opens noncanonical graphical Atlas (3A) |
| Preserve legacy terminal example | `history:demo` alias (3A) |
| Add a new system | Safe dataset JSON with no viewer/Vite source edit (3B/3E) |
| Create historical link | Two dated gates, completed `lnk_`, generated coordinates (3E) |
| Create a faction | `fac_` registry and year-aware InfoCard names (3C) |
| Conquer another Cantum | Dated Cantum `infoCard.affiliation` and governing field (3C/3D) |
| Show sovereignty | Merge contributors by ultimate Cantum, shared radius (3D) |
| Preserve direct administration | Systems keep original `cantumHistory` and InfoCards (3D) |
| Validate full workflow | Isolated integrated and frozen regression tests (3F) |
| View known catalogue-only system | NEXUS fallback, not a secret-file flag |
| Publish Canon | Separate historical migration and release authorization |

## Current implementation boundary

Phases 1, 2, 2.1, 2.2, 3A–3F, 4, 5 and 6 are complete and creator-approved.
The current Architecture Optimization Roadmap is complete. Phase 6 implementation,
verification infrastructure and completion documentation are committed together.
This closeout permits only its approved commit/push; no further development,
Canon migration, Atlas Creator, deployment or history rewrite is authorized.
Protected v0.1 Canon, frozen fixtures/schemas, IDs/history, generated navigation,
the normal noncanonical Demo and publication safeguards remain unchanged.
