# Codex Task — Phase 2: Dataset and Repository Organization

> **Completed historical task/inventory, archived during Phase 2.1.** Phase 1/2
> are committed in `6e026cb`. The original scope and instructions below preserve
> provenance and confer no current authorization. Use [the documentation index](../../INDEX.md)
> and [AGENTS](../../../AGENTS.md) for current maintenance scope.

**Project:** `VukMar/Velara_Atlas`  
**Workstream:** [Atlas Architecture Optimization Roadmap](../../ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md)
**Phase:** **2 — Dataset and repository organization**, authorized by the creator for this task only  
**Reference baseline:** `main` at `6ae6ee2160f36e2ff2ac76319d1399be2b0e2247` (2026-10-20; Phase 1 documentation commit). Recheck the actual checkout before making any change.  
**Input inventory:** [Phase 2 Dataset Migration Inventory](PHASE_02_DATASET_MIGRATION_INVENTORY.md)  
**Delivery:** Working, tested, reviewable local changes and a Phase 2 completion report. **Do not commit, push, merge, tag, release, deploy, or start Phase 3.**

> **Creator objective:** The working demonstration JSON belongs under `public/datasets/demo/`, not under `examples/`. The `examples/` directory should eventually contain only accurate, developer-facing examples showing how the *current* JSON schema is used. Moving a dataset must not require altering its lore, identifiers, coordinates, history, or generated navigation records. Keep Vite's intentional public-disclosure restrictions.

## 0. One-paragraph copy/paste task for Codex

> Read `AGENTS.md`, `docs/INDEX.md`, `docs/ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md`, `docs/PHASE_02_DATASET_MIGRATION_INVENTORY.md`, and **this** document. Execute **architecture optimization Phase 2 only**, beginning with a clean preflight inventory of the actual checkout. Move the seven live, noncanonical v1.2 demo JSON files from `examples/demo_atlas/` to `public/datasets/demo/`, preserving their bytes, data, generated navigation output, and application behavior. Update every necessary root, import, explicit Vite allowlist, safe-path rule, recovery exclusion, regression test, browser URL interception and current documentation reference. Preserve `publicDir: false`, all canonical and frozen data, production input/output audits, and the isolated calibration preview. In a separately verifiable substep, reorganize standalone legacy/example JSON so `examples/` is an accurate **reference-only** area, not a source of production data or legacy regression inputs; do not invent canonical content or discard historical test evidence. Run all applicable tests, report exact evidence, and stop for creator review. Do not implement a manifest loader, system-creation CLI, calibration JSON conversion, editor, viewer modularization, or deployment. Do not commit or push.

## 1. Read-first and preflight — required before edits

1. Read the documents cited above, `README.md`, `docs/ARCHITECTURE.md`, `docs/REPOSITORY_STRUCTURE.md`, `docs/DATA_MODEL.md`, `docs/NAVIGATION_AUTHORING.md`, `docs/CONTENT_WORKFLOW.md`, `docs/LEGACY_MIGRATION_PLAN.md`, and the applicable v1.2 schemas. Keep checkpoint result files as historical evidence, not current orders.
2. Run `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, and `git log -3 --oneline`. Record existing uncommitted/untracked work. If the checkout differs from the reference baseline, inspect the changes and update the dependency inventory; do not reset, clean, stash, rebase, or overwrite.
3. Inspect the actual current trees of `examples/`, `public/`, `tests/fixtures/`, `tests/calibration/`, `src/viewer/`, `scripts/`, and `docs/`. Check references to `examples/demo_atlas`, `DEMO_ROOT`, `SYSTEM_FILES`, `INPUT_FILES`, `readDemoSource`, `publicDetailPath`, `connections-recovery`, and browser URL intercept patterns with `rg` (or an equivalent repository-wide search). The Phase 1 inventory is a starting point, not an exhaustive substitute for fresh search.
4. Record SHA-256 hashes of **all seven** live demo JSON files **and** the protected `public/data/` legacy records and frozen `tests/fixtures/v1_1/` / `v1_2/` files. Preserve the hash inventory in the task report or a non-sensitive, explicitly authorized documentation result. Hash equality after migration is mandatory for the seven live demo JSON files.
5. Inspect `examples/demo_atlas/` for any pending `.connections-recovery.json` journal and `*.connections-*.tmp` / `.bak` files, including ignored/untracked files, before moving the directory. If recovery is pending, **stop the migration** and report the blocker. Never delete or relocate a pending journal as though it were disposable. Follow `docs/NAVIGATION_AUTHORING.md` only with explicit recovery authorization.
6. Inspect `vite.config.mjs`, `src/viewer/demo-data.mjs`, `scripts/demo-files.mjs`, `scripts/idfind.mjs`, `scripts/check-relations.mjs`, `scripts/connections.mjs`, `scripts/audit-demo-build.mjs`, `.gitignore`, and the tests that read or intercept demo paths. Preserve any preexisting user edits.
7. If the baseline test tooling is available, record pre-edit results of `npm test`, `npm run validate`, `npm run connections:check`, and `npm run build` (all must remain read-only with respect to authored JSON); optional relevant browser tests if available. Note skipped commands and why.

### Protected source-of-truth rules

- Sector XYZ is in **light-years**; System XYZ is in **CNU**, where **1 CNU = 10,000 km**. Do not change coordinates, scales, IDs or timelines as part of organization.
- `connections.json` and `positionMode: "boundary_derived"` gate coordinates are **generated outputs**. Their source is the authored navigation declarations in system objects. **Do not run `npm run connections` for a path-only move** or silently regenerate graph data to make a check pass.
- `public/data/sector.json`, `public/data/political.json` and the reserved legacy canonical subtree are protected **v0.1 canon**. No edits, migration or schema reinterpretation.
- Frozen `tests/fixtures/v1_1/` and `tests/fixtures/v1_2/` are regression evidence. Do not rewrite, renumber, reformat or regenerate them.
- The local `preview:calibration` is a **synthetic JavaScript in-memory test** using `tests/calibration/scenario.mjs`. No conversion to scenario JSON and no new preview architecture in Phase 2.
- Public Git is itself a publication/disclosure surface, even when Vite excludes a file. Do not copy private or unreleased canon into `public/`, `examples/`, fixtures or docs. Do not inspect private sibling directories without authorization.

## 2. Substep A — Relocate the live noncanonical demonstration (mandatory)

**Old dataset root:** `examples/demo_atlas/`  
**New dataset root:** `public/datasets/demo/`  
**Purpose:** Demonstration-only, noncanonical, explicitly public-safe **source data**, not the protected `public/data/` legacy canon.  
**Important:** `publicDir: false` stays active. A path under `public/` does **not** mean Vite may automatically copy or serve everything in `public/`.

Move exactly these seven active files, retaining their current contents **byte-for-byte**:

```text
sector.json
cantums.json
presentation.json
connections.json                 # generated; preserve bytes
systems/sys_0001.json
systems/sys_0002.json
systems/sys_0003.json
```

`sys_0004` remains the existing indexed **archival-only** system with `publicDetailPath: null`; do **not** invent or create a detail file for it.

### Required consumer updates

- **Viewer:** `src/viewer/demo-data.mjs`. Change the four registry imports and three explicit dynamic detail-loader paths to the new root. Retain `detailLoaders`' dataset-relative keys, released-only behavior, error states and existing preload semantics. **Do not introduce automatic discovery, `import.meta.glob`, or a new data-loading service** (Phase 3).
- **Offline source readers:** `scripts/demo-files.mjs` (`DEMO_ROOT`; fixed `SYSTEM_FILES` / `INPUT_FILES`; `safePath` and `readDemoSource`). Keep all existing path safety and fixture-root injection behavior. Adjust only what the move requires.
- **Other independent roots:** `scripts/idfind.mjs` `--demo`, `scripts/check-relations.mjs` CLI defaults, `scripts/validate-demo.mjs` if necessary, `scripts/connections.mjs` transitively, and any additional actual consumers found at preflight. `idfind --public` must continue targeting protected `public/data/`.
- **Build/dev:** `vite.config.mjs` exact seven-file demo input allowlist and narrow dev filesystem permissions. Keep `base: '/Velara_Atlas/'`, `publicDir: false`, `sourcemap: false`, production module auditing, canonical `public/data/` denial and approved-asset restrictions. **Never allow the entire `public/` tree as a shortcut.** Test that the new narrow allowlist works in development and build; canonical and calibration files remain inaccessible/excluded.
- **Generated-output safety:** `scripts/audit-demo-build.mjs` should retain its strict published-output contract. Do **not** loosen its output rules merely to accommodate the changed source root. The current bundle still does not publish raw JSON folder copies or a generated manifest.
- **Recovery exclusions:** `.gitignore` currently contains `examples/demo_atlas`-specific ignored journal/backup/temp patterns. Add suitable new-root patterns before any potential generator operation and retain old-root exclusions if historical local recovery state could still exist. Never delete a preexisting recovery file.
- **Tests:** update only paths tied to the **live** demo in unit and browser tests. Preserve separate frozen fixture roots, deliberately forbidden test inputs (e.g. the legacy `cantum_b.json` case), failure-injection routes, URL regex/escaping and current behavior assertions. Search dynamically rather than relying only on the Phase 1 inventory.
- **Docs:** update present-tense operational references in `README.md`, `AGENTS.md`, `docs/INDEX.md`, `docs/ARCHITECTURE.md`, `docs/REPOSITORY_STRUCTURE.md`, `docs/DEVELOPMENT_ROADMAP.md`, authoring guides and other current-contract documents as needed. Keep historical reports' point-in-time paths and claims unchanged. Update the architecture roadmap's phase state accurately.

### Substep A acceptance gate

1. The same seven JSON files exist under `public/datasets/demo/`, and their recorded SHA-256 hashes match the originals exactly.
2. The old live demo root contains no active runtime dataset; no duplicate live copies are used by the viewer or build.
3. All four registry references and three released detail loads work under the repository subpath with unchanged data semantics; archival fallback continues working.
4. The generated navigation graph and derived positions are unchanged; `npm run connections:check` passes **without regeneration**.
5. The public build still contains only allowlisted modules/assets; protected v0.1 canon and calibration sources are not emitted or accidentally served.
6. Existing validation, unit and relevant browser tests pass or any environmental limits are explicitly documented.

Do not begin Substep B until Substep A is independently consistent. If Substep A is blocked, stop with a precise failure report; do not paper over errors with broader permissions or rewritten JSON.

## 3. Substep B — Make `examples/` reference-only (separately reviewable)

**Creator's stated target:** `examples/` is for developers to learn the supported JSON format, **not** for live runtime data, legacy tests or misleading obsolete schema examples.

1. Inventory each remaining standalone `examples/*.json` by actual schema version, consumer, and documentary value. At the current reference baseline, these include:
   - `noncanon_sector_system.json`, `noncanon_system_detail.json` — direct inputs to `tests/check.mjs`; these are **legacy regression data**, not current v1.2 templates.
   - `cantum_b.json` — an intentional **forbidden-input** example in `tests/viewer.test.mjs`; preserve that negative test even if the file is relocated.
   - Other individual Cantum, celestial, sector, system-detail and station JSON files — inspect them; some represent superseded v0.2 proposals rather than valid v1.2 examples.
2. Move proven regression-dependent standalone JSON into an appropriately named, **non-frozen** legacy test-fixture location such as `tests/fixtures/legacy_examples/`, preserving bytes and documenting provenance. Update all exact test references and negative input-audit cases; confirm such files remain excluded from the viewer build. **Do not mix these with or alter the frozen `v1_1`/`v1_2` fixture directories.**
3. Preserve superseded, historically relevant examples without presenting them as current schema templates. Prefer a clearly labeled historical archive **outside** the active `examples/` root (for example `docs/archive/json-proposals/`) only where the complete reference/link/test impact is understood. Do not bulk-delete or mass-update historical reports. If exact retention or references are ambiguous, report a specific exception for creator review rather than guessing or deleting.
4. Give `examples/` a clearly labeled `README.md` stating that the current supported dataset contract is schema v1.2 and pointing to `schemas/atlas.schema.json`, `docs/DATA_MODEL.md`, and the relocated noncanonical demo. Create focused `examples/v1_2/` examples **only where they can be shown valid against the actual current schema** (or explain why no safe stand-alone example can be added without further work). They must be clearly **noncanonical**, independently usable as learning material, excluded from production, and never required by the runtime loader. Do not invent Continuance lore or promote demonstrations into canon.
5. Update current documentation to explain where regressions, archived proposals, runtime demo data and current examples now live. Retain historical checkpoint reports as historical evidence.

### Substep B acceptance gate

- `examples/` contains only active developer reference material for the current supported schema, plus explanatory documentation; no viewer imports or mandatory regression inputs depend on this directory.
- All moved regression files retain original bytes, IDs, chronology and coverage; deliberately forbidden-file tests still verify rejection.
- Frozen fixtures and canon are unchanged. Obsolete shapes are clearly archived or any unavoidable exceptions are itemized (never silently discarded).
- Newly added examples, if any, accurately reflect current schema definitions and are not inadvertently distributed.
- Substep A continues passing after the cleanup. **If a remaining sample cannot safely be classified or moved, leave it in place and explain the resulting incomplete acceptance gate; never claim complete `examples/` cleanup prematurely.**

## 4. Prohibited work — this is NOT Phase 3

- No automatic dataset manifest, unrestricted filesystem discovery, generalized runtime fetch loader, new-system generator, ID reservation tool, or new `npm` authoring commands.
- No JSON schema version change, canonical migration, history/route rule change, map coordinate normalization, auto-generation on build, or redesign of `connections.json`.
- No modularization of `main.mjs`, `map-scene.mjs`, CSS/theming refactor, graphical editor, orbital logic, extra art or NEXUS Stage 5 visual design.
- No changing `preview:calibration` scenario, test radius, synthetic records or route isolation. No preview-to-JSON conversion (Phase 5).
- No enabling global `publicDir`, broadly exposing `public/data`, removing the strict production audit, introducing unrestricted Vite module imports, or publishing private files.
- No upgrading dependencies merely for tidiness; no breaking unrelated features; no deleting retained recovery/legacy material without explicit creator approval.
- **No commit, push, merge, PR, deployment or automatic Phase 3 execution.** Stage changes for review only if the creator's working practices require it, but do not create a commit.

## 5. Required verification and regression evidence

After **each substep**, run the checks that are available, and record exact output/result and any environmental blockers:

```bash
npm test
npm run validate
npm run connections:check
npm run demo
npm run build
git diff --check
git status --short
git diff --name-status
```

Also verify:

- Original-versus-moved SHA-256 hashes for all seven demo JSON files. Verify protected `public/data/` and frozen fixture hashes did not change. For additional legacy-example moves, compare each relocated file's hashes too.
- `npm run idfind -- all --demo` or the exact documented supported CLI invocation, plus `idfind --public`, without modifying either dataset.
- Development viewer and production preview with representative Sector map, System A/B/C, archival System D, historical year changes, navigation/InfoCards, layer toggles, picking and camera modes. Confirm the build still honors `/Velara_Atlas/` URL base.
- Browser suites affected by demo module URL patterns, including navigation, checkpoint/history, celestial, zones, grids, labels and sigils. If Playwright MCP or a browser runner is unavailable, note the specific suites not executed; do not claim they passed.
- `npm run preview:calibration`: confirm the local route and memory-based fixtures remain isolated if the browser tooling is available. Check the calibration-exclusion unit assertion and the built `dist/` boundary.
- No unintended raw dataset files, legacy canon, source maps, editor paths or calibration assets in distributable output. Verify the existing build/output audit has not been weakened.
- Re-scan for remaining active `examples/demo_atlas` source literals, incorrectly updated frozen test paths and outdated present-tense documentation. Historic paths in historical reports may remain intentionally.
- Relative Markdown links for edited documents and moved/archived sample references.

**Do not use `npm run connections` as a test.** It writes generated artifacts. A path move must not require any change in the graph's generated bytes.

## 6. Failure handling and rollback

Keep Substeps A and B separately reviewable. If something fails, identify whether the failure comes from path resolution, Vite source admission, frozen test inputs, generated-output freshness, browser interception, or a preexisting baseline problem.

- Never use blanket `git reset --hard`, `git clean -fd`, a repository-wide restore, or forced overwrite; preserve user changes.
- Revert **only** reviewed path moves and corresponding consumers using the recorded file maps and verified original bytes. Preserve any concurrent changes.
- Do not regenerate or manually edit the connection graph to fix a path error.
- Do not move, overwrite or discard active generator recovery files. Stop and request recovery approval where necessary.
- Do not change technical contracts or broaden publication permissions to make tests pass.

## 7. Required Phase 2 completion report

Produce `docs/PHASE_02_DATASET_MIGRATION_RESULTS.md` only as a **report of work actually performed** (if the user permits recording the phase report in `docs/`; this task authorizes that documentation). Include:

1. **Verified starting state:** branch, HEAD, initial `git status`, any existing user changes or recovery blockers.
2. **Substep A migration:** exact old → new file map, SHA-256 comparison for all seven JSON files, and each viewer/tool/build/test path updated. Confirm that `sys_0004` remains archival-only.
3. **Substep B cleanup:** complete inventory of former standalone `examples/*.json`, actions taken, moved-file hashes, remaining exceptions, and verified v1.2 learning references.
4. **Preserved invariants:** data IDs/history/XYZ/units, graph and generated gate positions, frozen fixtures, canonical `public/data`, calibration fixture, Vite `publicDir: false`, strict input/output audits.
5. **Test matrix:** commands and browser suites actually executed, results with counts when available, failed/skipped checks with exact reasons. Do not reuse historical report counts as current results.
6. **Documentation and reference updates:** changed active files, preserved historical reports, checked links.
7. **Remaining concerns and rollback:** anything unresolved; exact reversible file map and precautions.
8. **Stop statement:** `Phase 2 complete (or partially complete). Phase 3 not started. Await creator review and explicit authorization.`

If substantial checks cannot run, or Substep B cannot be safely completed, state **partial completion** instead of claiming that all Phase 2 gates passed.

## 8. Acceptance checklist for the creator

- [ ] Live noncanonical demo is located under `public/datasets/demo/` with **seven identical JSON file hashes**.
- [ ] Existing viewer behavior, archived-system fallback and navigation remain unchanged.
- [ ] `public/data/` canon and frozen regression fixtures are unchanged.
- [ ] Build/dev restrictions remain strict; `publicDir: false` remains set.
- [ ] Current documentation names the new demo location; historical reports retain original context.
- [ ] `examples/` is developer-reference-only, or clearly documented exceptions remain for separate review.
- [ ] Test and build results are supplied with honest execution limits.
- [ ] No manifests, new loader, authoring CLI, editor or calibration JSON conversion appeared.
- [ ] No commit/push/deploy or Phase 3 started without separate approval.

**Stop after this phase.** Phase 3 will address the real hardcoded-registration bottleneck through a validated, explicit public manifest and JSON-driven system loading. Phase 2's goal is safe, clear file ownership—not pretending the current manual loader has already been eliminated.
