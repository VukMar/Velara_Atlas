# Codex Task — Phase 1: Documentation Consolidation and Architecture Baseline

> **Completed historical task/inventory, archived during Phase 2.1.** Phase 1/2
> are committed in `6e026cb`. The original scope and instructions below preserve
> provenance and confer no current authorization. Use [the documentation index](../../INDEX.md)
> and [AGENTS](../../../AGENTS.md) for current maintenance scope.

**Task status:** Completed; retained original task for historical reference only.
**Authorized scope:** Phase **1** of [the architecture optimization roadmap](../../ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md), **documentation and inventory only**.
**Known reference baseline:** `main` commit `190bd21bcdfd6bfafc94b51ffccd705592b0648c` (2026-10-20). Verify the actual local checkout before applying edits.  
**Stop condition:** Return a phase-completion report and proposed Phase 2 dependency/migration plan; **do not implement Phase 2**.

## Copy/paste task for Codex

> You are working in `VukMar/Velara_Atlas`. Read `AGENTS.md` and `docs/ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md` first. Execute **Phase 1 — Documentation Consolidation and Architecture Baseline only**. This task authorizes documentation inspection, documentation changes and status corrections; it does **not** authorize file moves, code/schema/data changes, new features, calibration scenario modifications, publishing, committing or pushing. Start by checking `git status`, HEAD and current files. Respect all canonical, historical, navigation, and disclosure rules in `AGENTS.md`. Reconcile the committed current state, produce a concise navigable documentation index, correct stale *current-status* wording in active docs, explicitly document the calibration preview's **in-memory** data source, and inventory all dependencies for the **proposed** move of the live noncanonical demo from `examples/demo_atlas/` to a separately authorized data location. Preserve every historical report as historical evidence. Do not silently rewrite implementation claims or approved contracts. Run appropriate read-only checks when possible, report exact outcomes, show the files changed and stop for my review. See the detailed instructions below.

## 1. Read-first order and facts to confirm

1. Run `git status --short`, `git branch --show-current`, `git rev-parse HEAD` and inspect the most recent commit. **Never reset, clean, restore, rebase, stash or overwrite in-progress work.** If HEAD differs from the cited baseline, use the actual checkout as truth and explain the difference.
2. Read `AGENTS.md`, `README.md`, this task, the architecture roadmap and `docs/DEVELOPMENT_ROADMAP.md`.
3. Read current contracts and authoring guides: `docs/ARCHITECTURE.md`, `docs/REPOSITORY_STRUCTURE.md`, `docs/VIEWER_SPECIFICATION.md`, `docs/DATA_MODEL.md`, `docs/NAVIGATION_AUTHORING.md`, `docs/CONTENT_WORKFLOW.md`, `docs/NEXUS_VISUAL_IDENTITY.md`, `docs/CANTUM_TERRITORY_RENDERING.md`, `docs/LEGACY_MIGRATION_PLAN.md`, and related schemas where needed. Do not treat superseded proposals as current contracts.
4. Read the latest point-in-time reports: `docs/CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md` and `docs/CANTUM_SCALE_CALIBRATION_RESULTS.md`. Distinguish each report's **original working-copy circumstances** from their current committed status; do not rewrite or delete historical evidence.
5. Inspect only the source paths necessary to verify documentation facts: `package.json`, `vite.config.mjs`, `scripts/demo-files.mjs`, `scripts/idfind.mjs`, `scripts/connections.mjs`, `scripts/preview-cantum-calibration.mjs`, `src/viewer/demo-data.mjs`, `tests/calibration/scenario.mjs`, `tests/calibration/controller.mjs`, `tests/calibration/index.html`, and current `examples/`, `public/data/`, `tests/fixtures/` trees. Inspect other code only to resolve a material documentation discrepancy.

**Known facts to verify, not assume:**

- The active demo currently occupies `examples/demo_atlas/`, with the viewer's explicit system loaders in `src/viewer/demo-data.mjs`, offline `SYSTEM_FILES`/`INPUT_FILES` in `scripts/demo-files.mjs`, and build-input JSON paths in `vite.config.mjs`.
- The current calibration preview is started by `npm run preview:calibration`. Its scenario is generated **in JavaScript memory** in `tests/calibration/scenario.mjs` (15 synthetic test stars, 40 x 40 ly chart, radius choices 2/2.5/3 ly); it does **not** read demo JSON. The preview source/controller are restricted to local development and excluded from production.
- `publicDir: false` is intentional. `public/data/` contains protected v0.1 legacy canonical records and is not the present v1.2 demo runtime source.
- The latest baseline commit contains Stage 4 Cantum island identities and a subsequent visual calibration, despite historical reports or active prose that may say portions were previously uncommitted.
- `connections.json` is generator-owned. History, IDs, CNU/ly units, existing schema rules and release-status separation are protected.

## 2. Documentation edits authorized during Phase 1

**Required output:**

- Create/update `docs/INDEX.md` as the single short navigation page, grouping active authority, procedures, current project status/roadmap, historical checkpoint evidence and superseded/reference material. Link to existing files using working relative paths. Indicate which documents should be read for which task. **Do not duplicate full specs** in the index.
- Correct **stale current-status statements** in `README.md`, `docs/ARCHITECTURE.md`, `docs/REPOSITORY_STRUCTURE.md`, and `docs/DEVELOPMENT_ROADMAP.md` as supported by checkout evidence. Preserve their distinct roles; do not replace `docs/DEVELOPMENT_ROADMAP.md` with the new optimization roadmap. Make the relationship between those two roadmaps explicit.
- Update only the stale top-level scope/status/read-first wording in `AGENTS.md`, to reflect the actual committed state and the documentation-only Phase 1 authorization. Keep all technical guardrails, canon, schema and permission limits intact. **Do not relax release or editing restrictions.**
- Add a compact documented inventory of Phase 2 move consumers (either a short section in `docs/REPOSITORY_STRUCTURE.md` or a small new `docs/PHASE_02_DATASET_MIGRATION_INVENTORY.md`, whichever is clearer). Include direct imports, script path constants, generated graph/recovery paths, tests/fixtures, URL/base-path handling, Vite input allowlist, disclosure and rollback concerns. Mark the target structure as **proposed, not implemented**.
- Add a succinct current-workflow note for calibration: `tests/calibration/scenario.mjs` is a hardcoded **synthetic** in-memory scenario; `controller.mjs` resolves it; `index.html` defines controls; `scripts/preview-cantum-calibration.mjs` serves its explicit files. Preserve the purpose and isolation of this test tool. Document that future JSON scenario support is **Phase 5**, not current functionality.
- Ensure entry links from `README.md` and/or `docs/DEVELOPMENT_ROADMAP.md` direct developers to `docs/INDEX.md`, this architecture roadmap and the Codex Phase 1 task without introducing a second, conflicting source of truth.

**Allowed edits:** Only `README.md`, `AGENTS.md`, the roadmap/task documents provided here, and files under `docs/`. Prefer the smallest set of relevant files. If a necessary change outside those paths appears, describe it as a **proposal** for a future phase; do not make it.

**Documentation organization policy:** During Phase 1, organize **logical authority and navigation**, not physical report directories. No historical report deletion, renaming or bulk movement. If files would benefit from a future `docs/reports/` layout, document a migration proposal and link-update implications instead. Do not rewrite historical implementation reports to erase former worktree context.

## 3. Required Phase 2 inventory (analysis only)

Produce a table with: existing path; purpose; exact consumers/references; proposed destination or action; publication sensitivity; validation/rollback concerns. Include at least:

| Current path | Phase 2 consideration |
| --- | --- |
| `examples/demo_atlas/` | Candidate active public-safe noncanonical dataset to relocate to `public/datasets/demo/` **after approval** |
| `examples/*.json` | Review separately: reference templates vs legacy regression-dependent examples |
| `public/data/` | Protected v0.1 canon: **no move/no conversion** without a separate migration approval |
| `tests/fixtures/v1_1/`, `tests/fixtures/v1_2/` | Freeze and preserve regression semantics |
| `tests/calibration/` | Existing in-memory preview; defer test JSON conversion to Phase 5 |
| `src/viewer/demo-data.mjs` | Update imports in Phase 2; replace hardcoded registration in Phase 3 |
| `scripts/demo-files.mjs`, `idfind.mjs`, `connections.mjs` | Audit demo roots, input lists, recovery files and generated-output assumptions |
| `vite.config.mjs`, `.gitignore`, `scripts/audit-demo-build.mjs` | Audit build boundaries, path restrictions, ignored recovery files and output verification |
| `README.md`, `AGENTS.md`, `docs/*`, `tests/*` | Find affected references and update only in the authorized migration phase |

Do not promise the move can be accomplished safely by file relocation alone; follow every consumer. Treat paths inside tests as intentional and identify frozen fixtures that must remain stable.

## 4. Explicit prohibitions

- **No** moving/copying/renaming/deleting folders or JSON records in `examples/`, `public/`, `tests/fixtures/` or `src/`.
- **No** changing source code (`src/`, `scripts/`, `tests/`), `package.json`, lockfiles, `vite.config.mjs`, schemas, `.gitignore`, data, icon/SVG/PNG assets, or test implementation.
- **No** enabling Vite `publicDir`, adding implicit runtime glob/fetch scanning, changing input allowlists, or generating/publishing a manifest.
- **No** new system CLI, calibration JSON conversion, viewer refactor, local editing UI, feature work or deployment.
- **No** changes to canon, historic events, registered names/IDs, celestial measurements, navigation connections, existing demonstration coordinates or tests' expected results.
- **No** commit, push, PR, tag, release, deployment or automatic Phase 2 execution.
- **No** assumption that untracked or ignored files are disposable; do not expose private sources in comments, docs or logs.

## 5. Validation and acceptance checks

Before edits, record the initial `git status --short` and HEAD. After edits:

1. Inspect `git diff --name-status`, `git diff --check`, and `git status --short`. Verify that source edits are **restricted to approved documentation files** and that preexisting user changes remain intact.
2. Verify new/changed relative Markdown links against actual files (simple local link checks are sufficient; don't add dependencies).
3. Use `npm test`, `npm run validate`, `npm run connections:check`, and `npm run build` as baseline confidence checks **if dependencies and local conditions permit**. These commands must not intentionally mutate tracked authored data. If any check cannot run, give the exact reason. Do not use `npm run connections` because it writes generator outputs. Do not deploy anything.
4. Confirm `docs/INDEX.md` identifies document authority, `docs/REPOSITORY_STRUCTURE.md` distinguishes current vs target layout, and `AGENTS.md` no longer describes committed work as uncommitted.
5. Do not report any implementation or screenshot/testing results not actually performed in this task. Historical reports' claims may be summarized only as historical evidence.

**Completion means:** A new contributor can find the current viewer architecture, active demo source, calibration fixture, canon/disclosure rules and migration plan **without guessing**; active docs no longer contradict committed reality; code/data/build behavior remains unchanged.

## 6. Required final report from Codex

End with these sections:

1. **Verified baseline** — branch, commit, initial working-tree status; explain any deviation from `190bd21`.
2. **Documentation changes** — each changed/created file and what was corrected; identify historical files left untouched.
3. **Current authority map** — what is current spec, tutorial, status and historical evidence.
4. **Phase 2 dependency inventory** — concise migration touchpoints and high-risk assumptions; clear note that no files moved.
5. **Checks performed** — exact command outcomes; links checked; report unrun checks honestly.
6. **Open questions and stop** — anything requiring creator decisions; explicitly state: **"Phase 1 complete (or partially complete); Phase 2 not started. Await creator approval."**

Do not begin future work, even if Phase 1 finishes quickly.

## After Phase 1 is accepted (not part of this task)

The creator may authorize a separate **Phase 2** task based on the documented inventory. That later task should first move the active noncanonical demo safely into the approved data namespace, update all consumers/audits/recovery paths, preserve the frozen regressions, verify the build, and return for review **before** implementing Phase 3's manifest-driven loader. Phase 5, not Phase 2, is where the calibration's in-memory scenario can be migrated to JSON if desired.
