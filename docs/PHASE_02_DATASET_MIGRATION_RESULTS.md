# Architecture Optimization Phase 2 ? Dataset migration results

**Status:** Complete locally for creator review. Phase 3 not started.
**Date:** 2026-10-20. No commit, push, deployment or connection regeneration.

## 1. Verified starting state

- Branch: `main`.
- HEAD: `6ae6ee2160f36e2ff2ac76319d1399be2b0e2247` (`feat: Optimization phase 1 started.`), matching the Phase 2 task's baseline.
- Initial `git status --short`: only `?? docs/CODEX_PHASE_02_DATASET_MIGRATION_TASK.md`.
- The preexisting task file is unchanged. No reset, clean, stash, rebase or overwrite of user work occurred.
- Preflight examined ignored/untracked entries under the old demo root: no `.connections-recovery.json`, `.connections-*.tmp` or `.bak` files existed. No recovery action was needed.
- Recorded 79 original SHA-256 hashes covering demo data, canon, frozen fixtures, calibration, schemas, assets, historical results, the output-audit source and task input. Final mapped-path comparison passed for every recorded hash.

## 2. Substep A ? independently verified before Substep B

Moved exactly seven live JSON files, preserving bytes. The single SHA-256 column below is **both the original and relocated hash**; equality was checked after A and after B.

| Original path | Current path | Original = moved SHA-256 |
| --- | --- | --- |
| `examples/demo_atlas/cantums.json` | `public/datasets/demo/cantums.json` | `803b83658b6e99f0e2068e14d9fab2ab29a5b86b26480d8e0143a8cfb256a041` |
| `examples/demo_atlas/connections.json` | `public/datasets/demo/connections.json` | `6d6f905f76fe485895aa699026051d3f4f86fbac318f1d9197f0f38aa35b6729` |
| `examples/demo_atlas/presentation.json` | `public/datasets/demo/presentation.json` | `17884de7a6f2dd5ae97136fc65058460ae9587d8094d0a81bebc3e53d6dc12c7` |
| `examples/demo_atlas/sector.json` | `public/datasets/demo/sector.json` | `d1e27fd720fef6bef8bc0ef000b672470a4d66fe1c73bba81c865909a9764d3d` |
| `examples/demo_atlas/systems/sys_0001.json` | `public/datasets/demo/systems/sys_0001.json` | `0536f2cd3c5fe27ca34a518218e82c3a86826e63bdf909d7be8498f9aadbe327` |
| `examples/demo_atlas/systems/sys_0002.json` | `public/datasets/demo/systems/sys_0002.json` | `9fb3fbb7210e83489f1ea1152101dcdc7cb9abac6341ad868e944f2764b2826d` |
| `examples/demo_atlas/systems/sys_0003.json` | `public/datasets/demo/systems/sys_0003.json` | `504143ce397bf210042026349c6502bd5ed4c3afea8d85fad1a0a0936c4da031` |

The former live root is absent; no duplicate runtime dataset remains. `sys_0004`
retains `publicDetailPath: null` and has no detail file or loader. The same three
released systems preload for existing endpoint eligibility. No manifest, discovery,
fetch architecture or registration semantics changed.

Updated consumer paths:

| Consumer | Change |
| --- | --- |
| `src/viewer/demo-data.mjs` | Four registry imports and three literal dynamic imports use the new root; dataset-relative loader keys and errors/preload behavior preserved |
| `scripts/demo-files.mjs` | `DEMO_ROOT` only; `SYSTEM_FILES`, `INPUT_FILES`, `safePath()`, rewrite rules and fixture-root injection preserved |
| `scripts/idfind.mjs` | Demo scope root changed; `--public` still reads `public/data/` |
| `scripts/check-relations.mjs` | Default CLI root changed; explicit-root readers unchanged |
| `vite.config.mjs` | Exactly seven admitted JSON paths and the narrow dev dataset directory changed |
| `.gitignore` | Added three new-root recovery patterns; retained all three old-root patterns |
| `tests/viewer.test.mjs`, `tests/labeling.test.mjs`, `tests/idfind.test.mjs` | Live dataset roots, admitted input expectations, ID Finder mock/capture roots |
| `tests/browser-checkpoint3.mjs`, `browser-zones3_8.mjs` | Live module lookup and escaped failure-injection regexes |
| `tests/browser-navigation-v1_2.mjs`, `browser-celestial4_1.mjs`, `browser-grid-zero.mjs`, `browser-documentation3_6.mjs` | Live module URL discovery |

`validate-demo.mjs` and `connections.mjs` follow `DEMO_ROOT` transitively and were
not edited. `scripts/audit-demo-build.mjs` is byte-identical to the baseline.

A's independent gate passed before any B moves: 182/182 tests, strict validation,
read-only graph/gate freshness, console demo, build audit, both ID Finder scopes,
all 79 recorded hashes, navigation browser suite, production A/B/C/D smoke,
calibration suite, forbidden-source HTTP checks, diff/status review and output
exclusion scan. An ignored local gate record is `.playwright-mcp/phase2-A-gate.json`.

## 3. Substep B ? complete former standalone-example inventory

All eleven former standalone JSON files are retained. Hashes below again mean
**original SHA-256 = moved SHA-256**, verified after B. No sample was reformatted.

| Original path | Current path | Actual format and retained purpose | Original = moved SHA-256 |
| --- | --- | --- | --- |
| `examples/cantum_a.json` | `docs/archive/json-proposals/cantum_a.json` | No schemaVersion; legacy/v0.2-proposal Cantum and InfoCard; historical reference | `ac116514492e0d9396034c9802be0753f37c0efab72ae731151c4ffc321edda7` |
| `examples/cantum_b.json` | `tests/fixtures/legacy_examples/cantum_b.json` | No schemaVersion; legacy/v0.2-proposal names/letter Cantum; rejected production-input fixture | `78687658b187649145107300ac911213f4105f70229bd88399143227344f549d` |
| `examples/celestial_colonized_planet.json` | `docs/archive/json-proposals/celestial_colonized_planet.json` | No schemaVersion; v0.2-style body with legacy affiliation ID; historical reference | `e5ef792c2e4cc97731d059ed80707e7f214d3f0789da09532116aa026e286173` |
| `examples/celestial_star.json` | `docs/archive/json-proposals/celestial_star.json` | No schemaVersion; v0.2-style obj_demo_star and old icon; historical reference | `db0d24d29f22a9484d4dc7dd07de609513951cddda321d8e8f669e3965875329` |
| `examples/celestial_uncolonized_planet.json` | `docs/archive/json-proposals/celestial_uncolonized_planet.json` | No schemaVersion; v0.2-style obj_demo_unsettled_planet; historical reference | `01c906853828aa1ecbf5d8caff7aa0fa2fa28ebb1e3187219575095bf4551bf8` |
| `examples/full_noncanonical_system_detail.json` | `docs/archive/json-proposals/full_noncanonical_system_detail.json` | Explicit 0.2-draft; map_units/referencePlaneY and old IDs; historical reference | `7e89025c354102e8d1bd115315caa2d7b4ab309c1a004fb762493507e64aeaea` |
| `examples/noncanon_sector_system.json` | `tests/fixtures/legacy_examples/noncanon_sector_system.json` | No schemaVersion; v0.1-style synthetic sector-entry regression in tests/check.mjs | `069183f1aeb7fe4e0e2317af19fdf46d737a81c7eda77b0d843c691f087f1b45` |
| `examples/noncanon_system_detail.json` | `tests/fixtures/legacy_examples/noncanon_system_detail.json` | Explicit 0.1.0; legacy type/map_units detail regression in tests/check.mjs | `8827528147c00eda523387d0315d56481fa808586b33cf21e12a8461f890db5d` |
| `examples/sector.json` | `docs/archive/json-proposals/sector.json` | Explicit 0.2-draft; old view/political path; historical reference | `ba9079037a21c7bd12d5724fed5d2519cf8450f0aa7cf61d410499c74c28a1c5` |
| `examples/star_system_sector_entry.json` | `docs/archive/json-proposals/star_system_sector_entry.json` | Explicit 0.2-draft; legacy ID/visibility; historical reference | `4592e4bee14601cc5e67e4777bd51b4f663443c4659bbbf9f7f187b0ed237a20` |
| `examples/station.json` | `docs/archive/json-proposals/station.json` | No schemaVersion; v0.2-style station classification and icon; historical reference | `65a6417b5f03b29088c3b3b894a9b76ff0520532dedd0b269a5b027cfd50e812` |

`tests/check.mjs` now reads the two relocated legacy files. The original
`cantum_b.json` forbidden-input case in `tests/viewer.test.mjs` now points to its
fixture location and still rejects it. No frozen directory was used for these
moves. Archive and fixture READMEs document provenance and the absence of a
current-version contract for old shapes. No unresolved retention exceptions remain.

`examples/` now contains explanatory documentation and three current references:

| Reference | Actual schema validation | Source / use |
| --- | --- | --- |
| `examples/v1_2/celestial-star.json` | PASS `#/$defs/celestial` | Existing System A `cb_0001`, semantically identical; object snippet, not a complete file envelope |
| `examples/v1_2/system-detail.json` | PASS `#/$defs/systemDetail` | Existing System A envelope/map and its existing star only; minimal detail learning file |
| `examples/v1_2/presentation.json` | PASS `#/$defs/presentationFile` | Byte copy of existing noncanonical demo presentation |

All three were validated offline with installed Ajv Draft 2020-12 in strict mode.
All three were explicitly passed to the unchanged production input-audit hook and
rejected as unexpected inputs. No runtime loader or mandatory regression input
reads `examples/`. These references reuse already public demo facts and duplicate
existing demo IDs intentionally; they are independent learning material, not new
entities or a complete separately loadable dataset. No canonical content was invented.

## 4. Preserved invariants and protected hashes

Authored IDs, names, historical dates/intervals, XYZ positions, ly/CNU units,
physical measurements, navigation declarations, generated graph and gate positions
are unchanged by byte-equal preservation. `1 CNU = 10,000 km`; no radius or scale
was selected or changed. Core resolvers/renderers, grids, camera behavior, asset
registries, dependencies and schemas were not edited.

Vite retains `publicDir: false`, `/Velara_Atlas/`, `sourcemap: false`, the same
input-audit implementation, narrow filesystem admission, canonical-data deny rule
and fifteen exact approved SVGs. No raw JSON publishing or output-audit relaxation.
Both old and new recovery exclusions remain. `npm run connections` was never run;
generator write/failure behavior is exercised only against isolated regression
fixtures by the existing tests.

The entire protected v0.1 subtree and frozen fixture files (including READMEs and
reserved .gitkeep) retain these **before = after** SHA-256 values:

| Protected path | Before = after SHA-256 |
| --- | --- |
| `public/data/political.json` | `7ab2c1876fd4adddc9af003a9419eac928ba2f0782093cf08c1b75cbe309fc13` |
| `public/data/sector.json` | `6e78e62cadb3462c560b0d757008fca17d641036f97bc113f5447b0498299f87` |
| `public/data/systems/.gitkeep` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `tests/fixtures/v1_1/cantums.json` | `8c9ba284814b7636c21ff5c97db3799da74a749092dbd6eb2f417df035766250` |
| `tests/fixtures/v1_1/connections.json` | `31d6bc4eb02bc4a9c6a3647cd53593e81bdb1aecc0bfe95a12aab158a770def2` |
| `tests/fixtures/v1_1/presentation.json` | `6f113e1aaf33444722a116a8dbc0cb2f6ea0e0f2361919261c9f4c8e0bdd6a9b` |
| `tests/fixtures/v1_1/README.md` | `4a3f95380e53b3d2f56672f4c9d031c04629fb51b0822bb973ce3ee213c51cfa` |
| `tests/fixtures/v1_1/sector.json` | `759f444547b5f529e583c8d0e94760553c71bb91fd649f43cf5367d9c2cf30a1` |
| `tests/fixtures/v1_1/systems/sys_0001.json` | `440eef928eeb6c20624b56e365fc41b7a8afdb0881f5ab3a1a7ee66f3c38e51a` |
| `tests/fixtures/v1_1/systems/sys_0002.json` | `b62bbabd8a78e3173a0738da752a71b64f697a85938787c2b5beabf5d3375125` |
| `tests/fixtures/v1_2/cantums.json` | `32d69c78774232f82aab32cf4c8b7619bf47e51cb64d74a7694de0c872870c40` |
| `tests/fixtures/v1_2/connections.json` | `6831dda09b9ee6f1b6d376ad699fc4c1834f82c97cfe2abba8c50a71442a1af0` |
| `tests/fixtures/v1_2/presentation.json` | `17884de7a6f2dd5ae97136fc65058460ae9587d8094d0a81bebc3e53d6dc12c7` |
| `tests/fixtures/v1_2/README.md` | `5b6e403bd8a310028e24e6bb64d92a2751f3ce01b55e4ae356116863179721ef` |
| `tests/fixtures/v1_2/sector.json` | `7c79d313c808e87891246c082893175eda6566dbc5a44362969312b7c3eff7cd` |
| `tests/fixtures/v1_2/systems/sys_0001.json` | `73081a1c3553b6c102f21a749d143c34f9bf301dcbcbe489ed501418fc77e24d` |
| `tests/fixtures/v1_2/systems/sys_0002.json` | `6d734c87e55d5b18e258232b7631cb8dce10a000042876f648817876162a2437` |
| `tests/fixtures/v1_2/systems/sys_0003.json` | `8c8b982f092fb06db37ca00030becf429ff040a90b1eeb2fdf243096bbe7ca7c` |

Calibration's three source files, all existing assets and schemas, and recorded
historical results also match their original hashes. The reserved canonical
subtree and frozen fixture READMEs remain unchanged, including intentional
historical references to the old demo root. No private sibling folder was read.

## 5. Executed verification matrix

All results here are from this task, not inherited report claims.

| Command/check | Pre-edit | After A | After B |
| --- | --- | --- | --- |
| `npm test` | PASS 182/182 after filesystem-access retry | PASS 182/182, 0 failures/skips | PASS 182/182, 0 failures/skips |
| `npm run validate` | PASS | PASS | PASS |
| `npm run connections:check` | PASS, read-only | PASS, read-only | PASS, read-only |
| `npm run demo` | Not run before editing | PASS, ten historical snapshots | PASS, ten historical snapshots |
| `npm run build` | PASS on direct rerun | PASS | PASS |
| `npm run idfind -- all --demo` | Not run before editing | PASS, 6 scanned JSON files | PASS, same 6 files and ID suggestions |
| `npm run idfind -- all --public` | Not run before editing | PASS, 2 protected legacy records | PASS, unchanged legacy scope |
| Original/mapped SHA-256 | 79 recorded | All 79 equal | All 79 equal |
| `git diff --check`, `git status --short`, `git diff --name-status` | Starting status captured | Reviewed; no whitespace errors | Reviewed; no whitespace errors |

Each successful build transformed 37 modules, emitted 21 files and passed the
strict audit with exactly 15 SVGs. Existing main-chunk advisory remains: 677.61 kB
minified, above 500 kB. Build outputs retained the same emitted asset/chunk names.
No bundle splitting or unrelated configuration work was performed.

Baseline environment/invocation issues, resolved before migration:

- Sandboxed `npm test` initially passed 178/182; four recovery tests failed at
  `realpathSync` with `EPERM: operation not permitted, lstat 'C:\Users\PC'` on
  temporary paths. The required escalated rerun passed 182/182. After-A and after-B
  tests used the same access; no safety checks or test expectations were weakened.
- The first baseline build reached its successful audit, but PowerShell `*>`
  redirection treated Vite's stderr advisory as a NativeCommandError and the
  wrapper returned 1. A direct `npm run build` rerun returned 0. After-A/B builds
  also returned 0. This was a logging-wrapper issue, not a build failure.

Chromium/Playwright MCP suites actually executed:

| Suite | Environment / stage | Verified result |
| --- | --- | --- |
| `browser-navigation-v1_2.mjs` | Dev, after A and B | PASS: 4 catalogue systems, 3 released, 1 archival; 38 pointer selections, 16 local endpoints, 3 interstellar routes; destinations/discoveries/history/cameras |
| `browser-cantum-calibration.mjs` | Separate loopback preview, after A and B | PASS: nine radius/camera comparisons, 2/2.5/3 ly, unchanged .6/.75/.9 half-heights, identity/transfer/independent membership, pointer/touch/keyboard, 2 mobile sizes, DPI and resources; no console errors |
| `browser-checkpoint3.mjs` | Dev, after B | PASS: chronological search, population/crew, parent clearing; unplaced/partial/fallback records; failed/missing/malformed detail and retry; non-square rejection |
| `browser-celestial4_1.mjs` | Dev, after B | PASS: all 3 details, 13 known bodies, 7 transition samples, physical XYZ/radii, neutral unknown, history/layers, mobile/DPI, depth/picking, repeated-map resources and icon failure |
| `browser-zones3_8.mjs` | Dev, after B | PASS: 4 zones, off-map/giant geometry, object/route priority, overlap/layers, history/focus, 2D solid/dashed outline, 2 mobile sizes and touch gestures |
| `browser-grid-zero.mjs` | Dev, after B | PASS: 3 systems, 23 objects above / 14 below, absolute-zero/H8 grids, both cameras/preferences and sector scale |
| `browser-labeling.mjs` | Dev, after B | PASS: camera-facing names, anchors/fade/low tilt, captions/collisions, independent preferences/history/disposal, 3 mobile sizes and 300-marker dense case |
| `browser-cantum-sigils.mjs` | Dev, after B | PASS: both Cantums/cameras, fading/toggles, history/navigation, 3 mobile sizes, lifecycle/asset-failure fallback and deployment-base URLs |
| `browser-documentation3_6.mjs` | Dev, after B | PASS: four panels, three detail charts, focus/reset; observed only GET requests, no external/canonical requests |
| `browser-layout3_6.mjs` | Production preview, after B | PASS: square framing/floating panels, History and InfoCards, picking/hover/focus, perspective restoration, 390/320 portrait and 844x390 landscape |

One initial `browser-documentation3_6.mjs` invocation was made while the page
was on production preview. Its development-module resource lookup returned
undefined, as production has bundled chunks rather than source JSON modules.
It passed after navigating to the required dev server; no suite code was changed
to hide that environment mismatch.

Additional executed checks:

- Dev and production were served through existing npm commands on loopback ports
  5173/4173, plus `npm run preview:calibration` on 5174. Production smoke after
  both substeps confirmed A/B/C/D marker counts `16/12/10/0`. A's production smoke
  also exercised camera switches, D's inclusive 899/900 discovery and base assets;
  B's production layout suite exercised history, layers and interaction controls.
- Direct `@fs` requests after A returned 403 for canonical sector/political files,
  calibration scenario and the then-standalone forbidden legacy file. After B,
  canonical sector/political, calibration scenario, moved Cantum fixture, archived
  proposal and new learning presentation all returned 403. Only the new narrow
  demo source root was admitted.
- `dist/` scan found no raw `.json`, source maps, calibration IDs/controller/route,
  legacy fixture/archive paths or current-example paths. The existing output
  audit separately verified disclosure markers, canonical/private exclusions,
  approved SVG bytes and base-relative asset URLs.
- Final mechanical diff comparison confirmed all 15 changed source/tool/test/Vite
  files contain only the intended path substitutions. The initial comparison
  against Git blob bytes detected the checkout's CRLF/LF distinction; comparison
  with Git/worktree line endings normalized passed. Authored-data hash checks
  always used raw bytes, without normalization.
- Re-scan found no active old-demo literals or examples-based test inputs in
  source/tools/top-level tests/Vite. Old recovery ignore patterns, frozen fixture
  provenance, original design sections, tasks and historical reports intentionally
  retain old paths. All 21 moved/new JSON files parse successfully.
- Three new references passed schema and rejected-input checks described above.
- Checked 186 relative Markdown links across 19 changed/new Markdown files,
  including the preexisting Phase 2 task and new sample READMEs: all resolved,
  including referenced headings. Final diff checks found no whitespace errors.

No physical devices, Firefox/Safari or publication/deployment were tested.
Unchanged specialized `browser-island-identities.mjs`,
`browser-influence-envelopes.mjs`, `browser-touch-camera.mjs` and
`browser-touch3_6.mjs` were not rerun; current Node suites, calibration, labels,
sigils, zones and production layout covered the required path-migration regressions.
Screenshots generated by the calibration suite remain ignored local artifacts;
no new manual screenshot-based artistic assessment is claimed.

## 6. Documentation and reference updates

Updated `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`,
`ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md`, `DATA_MODEL.md`,
`DEVELOPMENT_ROADMAP.md`, `HISTORICAL_RESOLVER.md`, `INDEX.md`,
`LEGACY_MIGRATION_PLAN.md`, `NAVIGATION_AUTHORING.md`,
`PHASE_02_DATASET_MIGRATION_INVENTORY.md`, `REPOSITORY_STRUCTURE.md`,
`SCHEMA_V1_2_NAVIGATION.md` and `VIEWER_SPECIFICATION.md`.
The inventory and roadmap preserve their original audit/design tables under
explicit historical headings while current entry points name the new locations.
The navigation design has a current-location note; original delivery sections
retain their historical paths. Technical contracts and permission boundaries
were not relaxed.

Added this report and three ownership/provenance READMEs: `examples/README.md`,
`tests/fixtures/legacy_examples/README.md`, and
`docs/archive/json-proposals/README.md`. All preexisting historical reports,
including Stage 4/calibration, repository audit and maintenance, are unchanged.
The preexisting Phase 2 task and prior Phase 1 task are unchanged.

## 7. Remaining concerns and reversible map

No unresolved migration or example-classification exception remains. The existing
bundle advisory and Chromium-only/physical-device limitations remain. The manual
loader registration bottleneck is intentionally still present for separately
approved Phase 3.

The two move tables above are the exact reversible file map. To roll back after
review, stop task-owned servers, inspect concurrent edits, verify the recorded
hashes and reverse only those 18 moves plus their listed path consumers. Reverse
B separately from A if desired. Remove newly created references/READMEs/report
only after checking for later user changes; preserve the original task file.
Restore a consistent loader/tool/Vite/test/documentation set together. Keep both
recovery exclusion sets until any local recovery state has been checked. Never
run the generator to fix a path error, bulk-reset the repository or discard a
journal/backup; follow reviewed manual recovery if a future journal appears.
Rerun the same validation and browser gates after any reversal.

The three task-owned dev/production/calibration servers were stopped with Ctrl+C
after verification. No preexisting user server was stopped.

Changes are intentionally unstaged. Git currently shows original-path deletions
and new destinations as untracked until a creator chooses to stage the review;
byte-equal hashes above establish that these are preserved moves. No tracked
history, canonical content or frozen fixture was rewritten.

## 8. Stop

**Phase 2 complete. Phase 3 not started. Await creator review and explicit authorization.**
