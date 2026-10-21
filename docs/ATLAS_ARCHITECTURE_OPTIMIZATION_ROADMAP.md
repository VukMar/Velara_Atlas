# Velara Atlas — Architecture, Data and Developer-Workflow Optimization Roadmap

**Status:** Architecture Phases 1, 2 and 2.1 are complete; Phase 2.2 is complete and creator-approved. Later implementation remains phase-gated and requires separate creator approval.
**Baseline reviewed:** `main` at `190bd21bcdfd6bfafc94b51ffccd705592b0648c` (2026-10-20, `feat: Visual callibration`).  
**Completed maintenance:** Phase 2 dataset migration is committed in `6e026cb`
(2026-10-20), and Phase 2.1 in `711a410`. Phase 2.2's simplified entity-family
reference library is complete and creator-approved.
**Current planning:** Architecture Phase 3 is being discussed
with the creator. Its scope and implementation have not yet
been authorized. Phases 1, 2, 2.1 and 2.2 are complete;
Phase 2.2 was committed in `8d88ef2`.
**Next implementation gate:** Phase 3 is proposed, not started or authorized.
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
The committed Phase 2 evidence remains in [its report](PHASE_02_DATASET_MIGRATION_RESULTS.md).

## Original baseline findings (190bd21)

Completed architecture Phase 2 relocated the live demo to `public/datasets/demo/`; the
following table retains the original Phase 1 audit context. Explicit loading,
preloading and seven-file allowlisting remain; manifest loading is still Phase 3.

The baseline has a working separation between pure historical/cartographic logic (`src/core/`), Three.js viewer (`src/viewer/`), schema validation, navigation generation, browser tests, and test fixtures. **Preserve it.** The principal bottlenecks are at the data-registration, viewer-orchestration, configuration, and development-tools boundaries.

| Current responsibility | Verified owner / constraint | Optimization target |
| --- | --- | --- |
| Live noncanonical demo | `examples/demo_atlas/` | Move to a dedicated, public-safe demonstration dataset namespace; leave `examples/` for reference examples |
| Demo dataset enumeration | `scripts/demo-files.mjs` (`SYSTEM_FILES` and `INPUT_FILES`) | One discoverable/validated dataset inventory rather than several hand-edited lists |
| Browser system loading | `src/viewer/demo-data.mjs` (three explicit system import callbacks; preloads released details) | Manifest-driven, authorized paths; on-demand detail loading with caching |
| Build input allowlist | `vite.config.mjs` (seven exact JSON paths) | Generate the input/output allowlist from the **approved release manifest**, never unconstrained folder scanning |
| IDs | `scripts/idfind.mjs` (read-only suggestions) | Safe, collision-checked creation workflow; never silently renumber existing IDs |
| Navigation | Authored system declarations; generated `connections.json` | Preserve source-of-truth, manual generator/check/recovery, and deterministic outputs |
| Viewer coordination | `src/viewer/main.mjs` and `map-scene.mjs` | Extract cohesive UI/state/camera/picking/layer responsibilities without changing behavior |
| Presentation controls | `visual-config.mjs`, `style.css`, `map-scene.mjs`, related modules | Single documented configuration surface for **tunable** parameters; do not externalize invariants |
| Calibration preview | `npm run preview:calibration`, `scripts/preview-cantum-calibration.mjs`, `tests/calibration/` | Keep isolated deterministic regression fixture; later support named JSON-based local scenarios |
| Legacy canonical records | `public/data/sector.json`, `public/data/political.json`, legacy resolver/tests | **Do not migrate or overwrite** during this workstream |
| Production | Vite `publicDir: false`, base `/Velara_Atlas/`, static output audits | Retain disclosure boundary; implement explicit release packaging and deployment only in a later approved phase |

### Calibration preview: exact ownership at this baseline

`npm run preview:calibration` starts a loopback-only Vite server at `http://127.0.0.1:5174/Velara_Atlas/__calibration/`. Its scenario is created **in memory** in `tests/calibration/scenario.mjs` (15 synthetic star systems, a 40 x 40 ly sector, independent 12-ly Y extent, two synthetic Cantums and selectable 2/2.5/3 ly radii). `tests/calibration/controller.mjs` resolves/displays it. `tests/calibration/index.html` owns the controls. `scripts/preview-cantum-calibration.mjs` serves an explicit three-file inventory. **It does not read `examples/demo_atlas/*.json`, and its data is not presently stored as JSON.** It is test infrastructure, not the canonical source or the main demo loader. Preserve its reproducibility and production exclusion.

### Non-negotiable design and publication boundaries

1. **In-universe history is not publication status.** A known system may have no released detail; use the existing NEXUS archival fallback, never ship secret details with a client-side hidden flag.
2. **Public Git is itself a disclosure surface.** Nothing unreleased/private enters `public/`, `examples/`, `docs/`, tests, commits, bundles, or browser requests. Placing files under `public/` does not make them private; keep `publicDir: false` and copy only authorized output into `dist/`.
3. **Preserve canon, IDs and schema semantics.** Retain legacy v0.1 and frozen v1.1/v1.2 fixtures; schema v1.2 is currently the noncanonical authoring contract. No invented dates, positions, identities, political status, counts, or meanings.
4. **Preserve navigation source-of-truth.** v1.2 object declarations own connections; `connections.json` and selected derived boundary-gate positions are generator outputs. Validation/build must not mutate source data.
5. **Preserve spatial and historical invariants.** Sector XYZ in ly; system XYZ in CNU (`1 CNU = 10,000 km`); absolute map positions; history intervals `fromAE <= yearAE < untilAE`, `null` open-ended; physical sizes independent from visible navigation-symbol minima.
6. **Do not solve configuration by exposing unsafe internals.** CSS colors, label distances and supported presentation values are tunable; schema rules, units, ID semantics, release allowlists, clipping correctness and safety limits are governed by contracts.
7. **Prefer incremental refactoring.** Retain vanilla JS, Three.js, Vite, Node tooling and pure `src/core/` architecture unless a later explicit decision changes the stack.

## Phase sequence and approval gates

```text
PRE-FLIGHT INSIDE PHASE 1
  Inspect main, git status, tracked files and existing test commands
          |
          v
[1] DOCUMENTATION CONSOLIDATION
    current truth / document authority / migration inventory
          | creator review
          v
[2] DATASET & REPOSITORY ORGANIZATION
    active demo relocated / examples as documentation only
          | creator review
          v
[3] DATA-DRIVEN LOADING & AUTHORING
    generated manifest / new-system CLI / lazy detail fetch
          | creator review
          v
[4] VIEWER MODULARIZATION & CONFIGURATION
    state/UI/scene separation / centralized tunables
          | creator review
          v
[5] LOCAL PREVIEW & CALIBRATION WORKFLOW
    JSON scenarios / reusable local tools / optional tuning UI
          | creator review
          v
[6] PERFORMANCE & RELEASE PREPARATION
    benchmarked large atlas / safe static publication / deployment
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

**Completed:** committed in `6e026cb`; see [results](PHASE_02_DATASET_MIGRATION_RESULTS.md).
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

### Phase 3 — Data-driven loading and creation workflow

**Proposed design review, not implemented:** the universal Cantum-radius redesign
remains a Phase 3 design-review item requiring separate creator approval.
Completed Phases 2.1 and 2.2 preserve per-Cantum `radiusLY`: the current schema,
24/18-ly demo values, fallback, thresholds and calculations remain unchanged.

**Goal:** Adding a new supported demonstration system or supported entity should no longer require source edits in viewer/loader/build configuration.

**Design:**
- Define a versioned dataset manifest format. Generate it from explicitly designated **approved public-safe dataset roots** with safe path normalization, no traversal/symlinks, schema checks, identity uniqueness and cross-file verification. Do not trust arbitrary `publicDetailPath` values from unverified JSON.
- Build an authorized release inventory at build time; produce exactly its permitted files and verified asset URLs. Do not use an unbounded `import.meta.glob` or `publicDir` copying as an alternative to publication review.
- Browser load sequence: sector/index + Cantums/presentation/public connection index first; system details on demand, with a cache and a clear distinction among known-but-unreleased, missing public detail, corrupted data and network/technical failure.
- Preserve current navigation eligibility, including links to archival endpoints: if full detail is not loaded, use validated, publishable endpoint metadata and do not invent object facts.
- Add `atlas:new-system` CLI (command name provisional) to obtain/check IDs, generate a **schema-valid** system template, update the sector registry transactionally, and show explicit next authoring steps. Do not assign fictional dates/names/positions on behalf of the creator; require values where schema demands them or use clearly noncanonical/test defaults only by explicit option.
- Keep connections generation an explicit authoring step and `connections:check` read-only; do not regenerate source files automatically on build.

**Acceptance gate:** A brand-new disconnected test system appears in the local viewer from authorized JSON with zero modifications to `src/viewer/` or `vite.config.mjs`; adding a supported planet or station is data-only; stale/bad links and unsafe paths fail; release builds include only explicitly approved data; regression and failure-path checks pass.

### Phase 4 — Viewer modularization and configuration

**Goal:** Decouple UI, state, camera, picking, rendering and visual parameters without changing established behavior.

**Target ownership** (module names provisional):

```text
src/viewer/
  main.mjs                      # composition/bootstrap only
  app/                          # state, navigation, dataset service
  map/                          # renderer orchestration, camera, picking, layers
  ui/                           # catalogue, InfoCard, timeline, layers
  config/                       # NEXUS theme and supported viewer tunables
  assets/                       # safe semantic symbol registry
src/core/                       # retained pure historical/geometric calculations
```

Extract cohesive responsibilities from `main.mjs` and `map-scene.mjs` incrementally; avoid turning each helper into a separate file. Centralize approved NEXUS CSS design tokens, marker and label presentation values, tunable camera defaults and symbol lookups. Remove duplicate configuration when safe. Preserve click/touch, keyboard focus, all layer modes, physical-size/proxy behavior, grid rules and resource disposal. Keep explicit tests around rendering correctness and interaction behavior.

**Acceptance gate:** One obvious configuration owner per supported tunable; viewer behavior unchanged at baseline settings; no hardcoded lore-specific system IDs in renderer; targeted unit and browser tests cover extracted boundaries.

### Phase 5 — Local preview, calibration and authoring ergonomics

**Goal:** Make experimentation possible without editing JavaScript or jeopardizing public/canonical records.

**Design:** Keep the existing `preview:calibration` deterministic and loopback-only, while moving its *authored scenario data* to named JSON fixtures after verifying the exact generator-dependent history/geometry behavior. Separate radius/camera test overrides from historical records; retain existing nine radius/camera comparisons, synthetic IDs and test isolation. Support selecting a named local scenario. Add a different, similarly isolated **data-driven demo preview** using the Phase 3 loader. Add visual configuration controls only after Phase 4 establishes a single safe configuration surface. Any future editor remains local, explicitly excluded from release builds, and validates before saving.

**Acceptance gate:** Regression tests can still recreate the prior calibration scenarios; a creator can preview authorized test JSON without hand-coding scenario records; settings are reproducible/exportable; no local tooling or its fixtures enter the public output.

### Phase 6 — Performance and production preparation

**Goal:** Validate large-dataset behavior and enable secure publication to the planned static host.

**Work:** Build representative noncanonical load/performance fixtures; benchmark initial payload, system navigation, chart update on year change, 2D/3D rendering, nameplate density, WebGL memory/disposal, low-power/touch devices, accessibility and cross-browser behavior. Profile before optimizing. Investigate adaptive sampling/LOD for Cantum influence rather than blindly raising global resolution: the October 20 calibration report warns that 128x128 sampling on a 160-ly chart can underresolve narrow 2–3-ly territory islands. Evaluate code splitting and large-atlas routing. Add CI tests, explicit public build manifests, disclosure audits, publishing dry runs and reviewed GitHub Pages deployment. Canonical v0.1 to v1.2 migration remains a **separate approval-bound workstream**.

**Acceptance gate:** Published/approved data only in generated output and Git history; documented scale/performance budgets and measured results; browser/functional QA; staging/production deployment verified. No private lore or unpublished details in any public artifact.

## Quality gates required for every later phase

- **Before:** `git status`; note committed HEAD and existing work; review owning contracts, tests and affected consumers; record expected diff and rollback method.
- **During:** Keep phases and substeps independently reviewable. Do not mix new creative/canonical content with architecture changes. Preserve IDs and source facts.
- **Verify:** Run relevant tests and strict validations (`npm test`, `npm run validate`, `npm run connections:check`, `npm run build` where applicable); targeted Chromium/browser coverage for viewer changes; diff review; disclosure audit; record commands not run.
- **After:** Provide files changed, behavior preserved, test evidence, outstanding questions, migration/rollback impact and the next **proposed** phase. **Stop for creator approval; never automatically begin the next phase or commit/push/deploy.**

## Creator-facing definition of success

| Task | Target interaction after the relevant phase |
| --- | --- |
| Add an empty supported test system | One local authoring command or later Studio action, with proper generated registration |
| Add a supported planet, moon, gate or station | Edit validated JSON; no viewer source changes |
| Change a system's history | Edit dates/records in JSON; viewer re-resolves the selected year |
| Change a Cantum's *approved* appearance | Edit separate presentation data or exposed theme configuration |
| Calibrate a synthetic scenario | Select/load scenario data and tuning values; no JS edits for the scenario |
| Release a system to readers | Explicitly approve the public data; generate, inspect and validate the release manifest |
| Render a known but unpublished system | NEXUS archival notice, never a hidden spoiler payload |

## Current maintenance boundary

Phase 2.2 is complete and creator-approved.
Active code, demo/canonical data, schemas, navigation output, calibration and
build/dev restrictions remain unchanged. Completed archived task text cannot
restart a phase. Architecture Phase 3 has NOT started and requires separate
creator approval; no deployment or further implementation is authorized.
