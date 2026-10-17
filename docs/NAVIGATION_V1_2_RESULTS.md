# v1.2 navigation implementation results

> **Historical implementation report.** Counts, camera framing, browser-suite
> behavior and test totals below describe the original `4ff0ecb` implementation,
> not today's author-editable demo or Checkpoint 3.6 layout. Retained for migration,
> generation/recovery and disclosure evidence. Use
> [NAVIGATION_AUTHORING.md](NAVIGATION_AUTHORING.md) for current procedure and
> [REPOSITORY_AUDIT_3_6.md](REPOSITORY_AUDIT_3_6.md) for current verification.

The accepted Checkpoint 3 baseline was commit `32f43d6`. Before edits, the only
untracked file was the supplied approved specification. No commits, pushes,
merges or deployments were performed. All new fictional data is NONCANONICAL.

## Final commands and results

| Command | Result |
| --- | --- |
| Baseline `npm test` | Exit 0: 56 tests, legacy checks and strict demo validation |
| Baseline `npm run validate` / `npm run demo` / `npm run build` | Each exit 0; build audit passed (5 files) |
| Final `npm test` | Exit 0: **102/102**, zero failed/skipped; legacy history and v1.2 release/freshness validation pass |
| `npm run validate` | Exit 0: strict v1.2 release schema, all three systems, relationships, graph and position freshness |
| `npm run demo` | Exit 0: unchanged canonical legacy console chronology |
| `npm run connections`, twice | Each exit 0: already current, no files written; isolated changed-input tests also verify byte/mtime idempotence |
| `npm run connections:check` | Exit 0: current graph and derived positions, read-only |
| `npm run build` | Exit 0: 20 modules, six distributable HTML/JS/CSS files, input/output disclosure audit passes |
| `npm run dev -- --port 5173 --strictPort` | Started at `http://127.0.0.1:5173/Velara_Atlas/`; both MCP suites pass |
| `npm run preview -- --port 4173 --strictPort` | Started at `http://127.0.0.1:4173/Velara_Atlas/`; v1.2 MCP suite passes |
| `git diff --check` | Exit 0, no whitespace errors |

A deliberately stale boundary radius caused both the actual
`npm run connections:check` and `npm run build` commands to exit **1** and
identify stale gate positions. Neither command repaired the source; existing
`dist/` bytes were unchanged. The original fixture bytes were restored in
`finally`, and final validation/test/build pass. Pure/API tests also cover stale
graphs, anchor XYZ, radii, positions and missing graph files without checker writes.

The new failure-injection tests verify staging failures, mid-replacement rollback,
retained backups/journal on restore failure, and rejection of a pending recovery.
Tests use isolated temporary demo copies. Windows sandbox restrictions on resolving
the temporary directory initially blocked those tests; the full final run passed
with approved temporary-directory access. Schema-wrapper and test-setup issues
found during implementation were corrected; no failing check remains.

## Browser findings

The v1.2 suite passed on dev and production preview using the connected Playwright
browser: three systems, two Cantum records, three interstellar routes, **31/31
objects pointer-selectable**, and **12/12 short-range endpoints with exactly one
local partner**. It verifies A?C?A?B?A, including both retained A/B transports and
the new A/C Jump Gates, local transfer to interstellar infrastructure, perspective,
elevation controls, pan/zoom, persistent year, and discovery/membership/route boundaries.

The updated Checkpoint 3 dev suite additionally passed search, historical
population/crew, invalid-selection clearing, partial/fallback/unplaced states,
expected failed-load retry, narrow viewport drawers and zone focus. Its 20-step
scrub measured 57 ms median / 68 ms maximum per automation round trip, with
bounded labels; this is small-demo evidence, not a performance guarantee.

Production preview reported **zero console errors/warnings**. The intentionally
aborted request in the dev error-path test produces expected diagnostics before
a clean reload. Screenshots were inspected: orange System C influence remains
separate from blue A/B influence, the two A/B strokes and A/C route remain
independent, and no nebula appears in the sector. The nebula remains in A from
160 A.E. and is excluded at 159; both existing other zone geometries are retained.
Influence edges can extend beyond the initial marker-fit camera viewport; zoom
out shows the wider chart without changing geometry or membership.

## Contracts and compatibility

See [NAVIGATION_AUTHORING.md](NAVIGATION_AUTHORING.md) for declarations, the
migration table, exact rewrite permissions, six-decimal CNU rounding, offline
allowlist, authoring/release validation and manual recovery. The graph retains
its prior shape and stable six original link identities/dates/directions, with
explicit dedicated endpoint replacements for the two formerly branching links.
No positions sidecar, automatic generation or silent build repair exists.

The v1.2 schema has a distinct identifier and updated editor wrappers, including
an authoring wrapper; strict Ajv resolves all wrappers locally. Frozen v1.1
fixtures/schema retain the original regression expectations. Only v1.2 rejects
short-range branching, validates object declarations, and requires derived local
placement. The validation/generation CLI is restricted to the explicit demo
allowlist; it no longer accepts arbitrary positional dataset paths. Canonical
migration and general dataset publication are separate future tasks.

`public/data/`, private sources, `src/timeline/resolve.mjs`,
`src/core/history.mjs`, `src/core/cartography.mjs`, Three.js rendering,
InfoCards, camera controls, zones and influence implementation are untouched.
The viewer source change is only the additional explicit System C detail import.
No dependency was added; `package-lock.json` is unchanged.

## Limits

The existing main Three.js chunk warning remains: 624.06 kB minified / 160.62 kB
gzip, above Vite's 500 kB advisory. Multi-file replacement is not atomic; injected
failures cannot prove power-loss/corrupt-filesystem recovery. Backups share the
same filesystem. No physical-touch, full accessibility, cross-browser or large
atlas performance audit is claimed. Checkpoint 4 materials, sizes, assets,
NEXUS styling, editor and deployment were not started. Local verification servers
are stopped after the task; use the commands above to restart them for review.

## Complete working-tree file inventory

This includes the creator-provided specification so review can account for every
untracked file. All remaining entries were added/modified by this task.

- `.gitignore`
- `AGENTS.md`
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/DEVELOPMENT_ROADMAP.md`
- `docs/HISTORICAL_RESOLVER.md`
- `docs/NAVIGATION_AUTHORING.md`
- `docs/NAVIGATION_V1_2_RESULTS.md`
- `docs/SCHEMA_V1_2_NAVIGATION.md` ? creator-supplied untracked contract, read but not edited
- `docs/VIEWER_PROTOTYPE.md`
- `examples/demo_atlas/cantums.json`
- `examples/demo_atlas/connections.json`
- `examples/demo_atlas/presentation.json`
- `examples/demo_atlas/sector.json`
- `examples/demo_atlas/systems/sys_0001.json`
- `examples/demo_atlas/systems/sys_0002.json`
- `examples/demo_atlas/systems/sys_0003.json`
- `package.json`
- `schemas/atlas-v1_1.schema.json`
- `schemas/atlas.schema.json`
- `schemas/cantums.schema.json`
- `schemas/connections.schema.json`
- `schemas/presentation.schema.json`
- `schemas/sector.schema.json`
- `schemas/system-authoring.schema.json`
- `schemas/system-detail.schema.json`
- `scripts/atlas-validation.mjs`
- `scripts/check-relations.mjs`
- `scripts/connections.mjs`
- `scripts/demo-files.mjs`
- `scripts/navigation.mjs`
- `scripts/validate-demo.mjs`
- `src/viewer/demo-data.mjs`
- `tests/browser-checkpoint3.mjs`
- `tests/browser-navigation-v1_2.mjs`
- `tests/cartography.test.mjs`
- `tests/fixtures/v1_1/README.md`
- `tests/fixtures/v1_1/cantums.json`
- `tests/fixtures/v1_1/connections.json`
- `tests/fixtures/v1_1/presentation.json`
- `tests/fixtures/v1_1/sector.json`
- `tests/fixtures/v1_1/systems/sys_0001.json`
- `tests/fixtures/v1_1/systems/sys_0002.json`
- `tests/history-v1_1.test.mjs`
- `tests/navigation-v1_2.test.mjs`
- `tests/schema-v1.test.mjs`
- `tests/schema-v1_1.test.mjs`
- `tests/viewer.test.mjs`
- `vite.config.mjs`
