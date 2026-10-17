# Checkpoint 3.6 — Repository audit and documentation synchronization

## Scope and baseline

The audit began from clean local commit `7d9231c` (`feat: Redesigned the UI
layout.`), with **102 tracked files**. The committed Checkpoint 3.6 application
already contained the square chart, bounded 2D camera, 8×8 system grid, H8 CNU
measurement, vertical History, floating panels, centered InfoCard and transient
route hover. These were inspected and rerun before documentation changes; no
second layout implementation or unrelated refactor was needed.

All tracked paths were inventoried: JSON syntax/versions/definitions, source
imports/exports and command entry points, tests/fixture consumers, current schema
wrappers, docs/links and build rules. Only public-safe tracked repository files
were inspected. Ignored dependencies were consulted for tool operation; private
folders, source lore, credentials and sibling directories were not inspected.
No uncertain file was deleted, moved, renamed, migrated or deduplicated.

Baseline `npm test` passed **121/121**, with legacy checks and strict demo
validation. `npm run validate`, `npm run connections:check` and `npm run build`
all exited 0. The build audit passed for six files; Vite retained its existing
main-chunk >500 kB advisory. The layout/navigation/historical browser suites
also passed; the known post-multi-touch tap check remains a separate failure.

| Area | Tracked files at audit start | Retention/use |
| --- | ---: | --- |
| Root | 6 | Instructions, introduction, dependency/command configuration, Vite and ignore rules |
| `docs/` | 20 | Contracts, workflow/API guides, safeguards, implementation notes and historical evidence |
| `schemas/` | 8 | Current v1.2 master, six wrappers, frozen v1.1 master |
| `scripts/` | 8 | Validation, allowlisted generation/check/recovery, ID Finder and build audit |
| `src/` | 10 | Legacy resolver, modern pure core and browser implementation |
| `tests/` | 29 | Node suites, four MCP suites and two frozen fixture sets |
| `examples/` | 18 | Seven current demo JSONs, two legacy test inputs and nine historical proposal templates |
| `public/` | 3 | Two protected canonical v0.1 JSONs and reserved detail-directory placeholder |
| **Total** | **102** | No baseline file removed |

This extension adds this report and `tests/browser-documentation3_6.mjs`, for
**104 reviewable files**. Generated `dist/`, dependencies and browser artifacts
remain ignored. A file-level classification appears at the end.

## Documentation authority

| Primary reference | Responsibility |
| --- | --- |
| [README](../README.md) | Public introduction, present status, installation/use and commands |
| [AGENTS](../AGENTS.md) | Agent instructions, read-first order and non-negotiable safeguards |
| [Architecture](ARCHITECTURE.md) | Implemented modules, data flow and future components |
| [Data model](DATA_MODEL.md) | Current structural model; schemas are the exact validation definitions |
| [Navigation design](SCHEMA_V1_2_NAVIGATION.md) | Approved navigation contract and historical design decisions |
| [Navigation authoring](NAVIGATION_AUTHORING.md) | Practical generator/check/recovery workflow |
| [Viewer specification](VIEWER_SPECIFICATION.md) | Viewer behavior, incorporating the Checkpoint 3.6 revision |
| [NEXUS identity](NEXUS_VISUAL_IDENTITY.md) | Approved visual direction and curator identity |
| [Visual asset policy](VISUAL_ASSET_POLICY.md) | Asset conventions, data support and future appearance fallbacks |
| [Roadmap](DEVELOPMENT_ROADMAP.md) | Completed stages, current refinement and separately authorized future checkpoints |

Separate documents retain distinct responsibilities: historical data caveats,
resolver API, Cantum formula, release safeguards, layout rationale and evidence
reports. Reports record what happened at their checkpoint; they do not override
current contracts or authorize future implementation.

## Conflicts found and actual revisions

| Files | Before | Applied correction |
| --- | --- | --- |
| `AGENTS.md` | Earlier scope descriptions; no audit-extension guidance | Current local implementation, correct read-first roles, map-first layout, preservation/retention limits |
| `README.md` | Checkpoint 3 status, draft-model entry, repeated October/v1.2 updates and old renderer claims | Single current status, current model/tooling links, consolidated manual authoring commands and clear future boundaries |
| `ARCHITECTURE.md` | Foundation-only proposed viewer, pending schema/validation, appended contradictory updates | Actual module responsibilities, pure/runtime/offline split, implemented release checks, demo preload and deferred components |
| `REPOSITORY_STRUCTURE.md` | Old tree; current folders listed as future; implied `public/data/` served | Actual tree, authored/generated ownership, current/frozen schemas, fixture consumers and explicit browser-build exclusions |
| `DEVELOPMENT_ROADMAP.md` | “Next implementation handoff,” consolidation and awaiting Checkpoint 3 | Completed 1–3/v1.2, implemented 3.6/current audit, upcoming separately approved 4/5 and canonical workstream |
| `VIEWER_SPECIFICATION.md` | Permanent sidebars/bottom timeline, marker-fit camera, branching and pending v1.1 features despite correction banner | Revised behavior sections directly: square fit/bounds/grid, vertical History, overlays/popups, hover-only routes, v1.2 exclusivity and implemented/deferred compatibility table |
| `NEXUS_VISUAL_IDENTITY.md` | Old right/bottom layout, short-range branching and old schema references | Map-first arrangement, same approved palette/typography/targeting/curator policy, current data support and deferred final art |
| `VISUAL_ASSET_POLICY.md` | Claimed null icons/variants invalid and demanded a migration already completed | Schema-valid nullable icon/variant rules distinguished from the still-deferred final registry/materials |
| `CANTUM_TERRITORY_RENDERING.md` | Missing/pending presentation schema and unversioned illustrative envelope | Current presentation schema/wrapper, valid v1.2 example, implemented field/cache status; formula/radii/caps unchanged |
| `LEGACY_MIGRATION_PLAN.md` | Referred only to v1.1; required a resolver already implemented | Current noncanonical v1.2 boundary, reuse of modern API, separate approved canonical ID/history/release process |
| `SCHEMA_V1_2_NAVIGATION.md` | “Implementation pending” despite completed tools | Status/provenance note and current workflow links; original approved design and implementation sequence preserved |
| `HISTORICAL_RESOLVER.md` | Old wrapper versions, validator gaps generalized to current version, future UI/event helper and Checkpoint 2 instructions | Present v1.1/v1.2 compatibility, version-specific validation, implemented conservative recorded-year helper/range and current consumers |
| `NAVIGATION_AUTHORING.md` | Original nine-link table looked like live inventory; tests/preview claims predated 3.6 | Historical table explicitly labeled, current frozen/live distinction and correct dev-only versus preview-capable MCP entry points |
| `VIEWER_PROTOTYPE.md`, `LAYOUT_REVISION_3_6.md` | Old sidebar/selection text or evidence pointers | Synchronized implementation notes, rationale subordinate to behavior contract, current browser/audit references |
| `SCHEMA_INSTALL.md`, `DATA_MODEL_DRAFT.md`, `NAVIGATION_V1_2_RESULTS.md`, `CHECKPOINT_3_6_RESULTS.md` | Historical procedures/reports could be mistaken for present instructions | Clear historical banners; original procedural/design/evidence bodies retained at the same paths |

No schema, application, generator, ID Finder, dependency, canonical JSON,
demonstration JSON, generated graph, history or existing test assertion was
rewritten. The one new test is an MCP browser workflow/audit smoke check.

## Deliberately retained files

- `public/data/political.json`, `sector.json` and `systems/.gitkeep`: protected
  canonical foundation/placeholder, not demo build inputs. Their chronology and
  IDs remain untouched.
- `src/timeline/resolve.mjs`, `tests/check.mjs`, `tests/demo.mjs` and both
  `examples/noncanon_*.json` inputs: active legacy historical regressions/console
  demonstration. No obsolete-file inference was made from the old version.
- Frozen `schemas/atlas-v1_1.schema.json` and `tests/fixtures/v1_1/`: active
  historical schema/history/cartography/branching regressions. `schema-v1.test.mjs`
  is a historical filename; it uses this v1.1 snapshot, not a separate v1.0 master.
- `tests/fixtures/v1_2/`: fixed original generator/date/position safety scenarios;
  the editable live demo independently passes validation/freshness/viewer checks.
  Repeated IDs across independent snapshots are intentional, not duplicate
  definitions within one dataset.
- All current v1.2 schemas/wrappers, generator/check/recovery modules, graph and
  allowlists: active authoring/release/runtime dependencies. Generated does not
  mean disposable; `connections.json` stays Git-tracked.
- All Node/MCP suites and ID Finder: active tests/workflow. Browser entry points
  are invoked through MCP; absence from the Node command is intentional.
- `DATA_RULES.md`: legacy canonical uncertainty and identity distinctions remain
  authoritative; its known open canon questions were not “cleaned up.”
- Design contracts and technical companions: distinct responsibilities justify
  separate documents. No import is necessary for a document to be useful.
- Historical proposals/reports: retained with clear labels so provenance and
  existing links survive. Original recorded test totals are not current totals.

## Recommendations awaiting creator approval — not applied

| Candidate | Proposed action after approval | Reason / impact |
| --- | --- | --- |
| `docs/SCHEMA_INSTALL.md` | Prefer move to `docs/archive/SCHEMA_INSTALL.md`; alternatively delete only if original integration history is unwanted | Superseded v1.0 package instructions conflict with current setup. No baseline incoming Markdown link found; new audit/cross-links would need updating after any move |
| `docs/DATA_MODEL_DRAFT.md` | Optional move to `docs/archive/DATA_MODEL_DRAFT.md`; retain contents | Superseded structure but useful origin of InfoCard/null/identity decisions. `DATA_MODEL.md`, old install guidance and repository history refer to it; update links if moved |
| `docs/NAVIGATION_V1_2_RESULTS.md` | Prefer retain in place as labeled history; archive is optional, deletion not recommended | Unique migration, idempotence, rollback and browser evidence; authoring/prototype/audit links depend on it |
| Nine standalone v0.2 proposal JSONs listed below | Review as a group for possible `examples/archive/v0_2/` placement; no deletion recommended without owner decision | Legacy IDs/fields omit current v1.2 requirements; useful authoring/design history, not current templates or browser inputs |

The nine JSON candidates are `examples/cantum_a.json`, `cantum_b.json`,
`celestial_star.json`, `celestial_colonized_planet.json`,
`celestial_uncolonized_planet.json`, `full_noncanonical_system_detail.json`,
`sector.json`, `star_system_sector_entry.json` and `station.json`.
They have no positive live-loader or file-reading test dependency. A negative
build-allowlist test names `examples/cantum_b.json` as a rejected input; review
that assertion if its path moves. The two original `noncanon_*.json` files are
explicitly excluded from these recommendations because legacy tests read them.

No archive directory was created and none of these actions was applied.

## References and validation

The initial Markdown-link and relative-import scan found no broken local link
targets. The problems were semantic references to superseded documents/versions
and inaccurate command/test availability. Corrected README's primary model
reference, AGENTS read-first roles, current guide/evidence links and the claim
that the current v1.2 browser suite runs on preview (it now requires dev modules).

The final read-only reference audit checks local Markdown targets/anchors,
literal relative module imports, npm script names/entry-point paths, JSON syntax,
current dataset paths and schema-wrapper JSON pointers. Schema IDs ending in
`.invalid` are offline identifiers registered locally, not URLs to download.
Symbolic example IDs, illustrative unreleased paths and explicitly proposed
asset/archive/editor/deployment paths are not claims of existing files.

The final audit passed across 25 Markdown files and 86 local Markdown targets,
52 relative imports, 14 literal module-relative URLs, 43 JSON files, 146 schema
pointers (including all six current wrappers), 16 npm script entry paths and
17 live/frozen dataset paths. All documented npm script names resolve. There are
currently no fragment-anchor links to validate; no broken local targets were
found. The audit was a read-only Node built-in-module check over the explicit
tracked/review file list, with no network request or private-folder traversal.

## Browser verification

Loopback dev ran with `npm run dev -- --port 5173 --strictPort` at
`http://127.0.0.1:5173/Velara_Atlas/`; production preview used
`npm run preview -- --port 4173 --strictPort` at
`http://127.0.0.1:4173/Velara_Atlas/`.

- `browser-layout3_6.mjs`: passed dev and preview; square chart, stationary panels,
  vertical year controls, popup/focus/close, grid/H8, wheel/drag bounds, hover and
  actual route-stroke picking, 3D restoration and 1440×1000 / 390×844 / 320×568 /
  844×390 layouts.
- `browser-navigation-v1_2.mjs`: passed dev; all three systems, **33 objects**
  pointer-selected, **14 exclusive local endpoints**, three interstellar routes,
  destinations, historical activation and perspective.
- `browser-checkpoint3.mjs`: passed dev; chronological search/records, system-only
  nebula, parent return, layers, synthetic fallback/unplaced/partial/error+retry
  and invalid-square states. Deliberate errors are followed by a clean reload.
- New `browser-documentation3_6.mjs`: passed dev and preview; all four documented
  panels, year range, all three system review paths, record Focus/Reset, and
  observed same-origin **GET-only** requests without canonical/private-source
  fetches. This is a workflow observation, not proof of all possible server paths.
- `browser-touch3_6.mjs`: partial on dev and preview. Ordinary tap selection,
  close, vertical year selection, back navigation, injected pinch and bounded
  pan passed. The subsequent Sector tap still timed out with
  `postGestureTap.passed: false`: pointer/touch events occurred without a click.
  Cause unresolved; physical-device touch is unverified. No full touch pass is
  claimed and this documentation extension did not hide or “fix” it in tests.

Fresh normal production-preview console: **0 errors, 0 warnings**. The output
audit continues to permit only six HTML/CSS/JS files and base-relative assets;
no canonical/private/source-map references were found. Browser tests do not
replace the later publication/security review.

## Remaining issues and stop boundary

The post-gesture touch check, physical touch hardware, cross-browser/screen-reader/
full contrast testing and large-atlas performance remain open. Vite's existing
main-chunk advisory remains (about 630 kB minified / 162 kB gzip). Latest-published
year/event registry design, final visual registry/materials/reticles/portraits,
canonical migration, general publication pipeline and deployment are future work.

Historical documents intentionally retain old claims beneath clear banners;
they are not live procedures. The frozen v1.1 fixture README's original “new
navigation uses live data” statement records its capture-time role; current
navigation regressions now use frozen v1.2. It was retained with the protected
fixture rather than rewriting provenance in this cleanup. Reserved future paths
and the nine proposal examples remain pending owner review.

Stop after this synchronization for creator review. No Checkpoint 4, artwork,
editor, canonical migration, dependency change, commit, push, merge or deploy.

## File-level inventory

Legend: **A** active/authoritative; **I** active implementation/test dependency;
**H** retained historical reference; **U → A/I/H** outdated documentation revised
in this extension; **Q** potential obsolete/redundant candidate requiring owner
review. Categories can overlap; Q never means permission to delete.

| File | Class | Role / consumer |
| --- | --- | --- |
| `.gitignore` | I | Ignore private/cache/output/recovery paths |
| `AGENTS.md` | A | Agent instructions and safeguards |
| `README.md` | A | Public status, commands and primary references |
| `docs/ARCHITECTURE.md` | U ? A | Implemented architecture and future boundaries |
| `docs/CANTUM_TERRITORY_RENDERING.md` | U ? A | Approved influence algorithm and caps |
| `docs/CHECKPOINT_3_6_RESULTS.md` | U ? H | Original layout implementation evidence |
| `docs/CONTENT_WORKFLOW.md` | U ? A | Manual extraction/disclosure/release safeguards |
| `docs/DATA_MODEL.md` | U ? A | Current structural model |
| `docs/DATA_MODEL_DRAFT.md` | U ? H / Q | Superseded v0.2 design origin; review archive |
| `docs/DATA_RULES.md` | A | Canonical uncertainty and chronology caveats |
| `docs/DEVELOPMENT_ROADMAP.md` | U ? A | Checkpoint progression and approval boundaries |
| `docs/HISTORICAL_RESOLVER.md` | U ? A | Pure modern API and compatibility |
| `docs/LAYOUT_REVISION_3_6.md` | U ? I | Layout revision rationale and implementation details |
| `docs/LEGACY_MIGRATION_PLAN.md` | U ? A | Separate canonical ID/history approval safeguards |
| `docs/NAVIGATION_AUTHORING.md` | U ? A | Manual generator/check/recovery workflow |
| `docs/NAVIGATION_V1_2_RESULTS.md` | U ? H | Original migration/generator/recovery evidence |
| `docs/NEXUS_VISUAL_IDENTITY.md` | U ? A | Approved visual identity; final art deferred |
| `docs/REPOSITORY_AUDIT_3_6.md` | I | This inventory, retention and fresh verification report |
| `docs/REPOSITORY_STRUCTURE.md` | U ? A | Actual ownership and publication surfaces |
| `docs/SCHEMA_INSTALL.md` | U ? H / Q | Obsolete v1.0 procedure; review archive |
| `docs/SCHEMA_V1_2_NAVIGATION.md` | U ? A | Approved navigation design contract |
| `docs/VIEWER_PROTOTYPE.md` | U ? I | Current implementation notes and limits |
| `docs/VIEWER_SPECIFICATION.md` | U ? A | Viewer behavior including 3.6 revision |
| `docs/VISUAL_ASSET_POLICY.md` | U ? A | Appearance conventions versus current data support |
| `examples/cantum_a.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `examples/cantum_b.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `examples/celestial_colonized_planet.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `examples/celestial_star.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `examples/celestial_uncolonized_planet.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `examples/demo_atlas/cantums.json` | A | Authored demo histories |
| `examples/demo_atlas/connections.json` | I | Generated tracked runtime index; preserve identities |
| `examples/demo_atlas/presentation.json` | A | Authored demo visual field settings |
| `examples/demo_atlas/sector.json` | A | Authored demo index and map/range |
| `examples/demo_atlas/systems/sys_0001.json` | A | Authored v1.2 objects/zones/declarations and stored derived positions |
| `examples/demo_atlas/systems/sys_0002.json` | A | Authored v1.2 objects/zones/declarations and stored derived positions |
| `examples/demo_atlas/systems/sys_0003.json` | A | Authored v1.2 objects/zones/declarations and stored derived positions |
| `examples/full_noncanonical_system_detail.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `examples/noncanon_sector_system.json` | I | Active input to tests/check.mjs |
| `examples/noncanon_system_detail.json` | I | Active input to tests/check.mjs |
| `examples/sector.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `examples/star_system_sector_entry.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `examples/station.json` | H / Q | Superseded v0.2 standalone proposal; no positive live-reader dependency |
| `package-lock.json` | I | Pinned dependency graph |
| `package.json` | I | Command and dependency definitions |
| `public/data/political.json` | A | Protected canonical v0.1 chronology; legacy tests |
| `public/data/sector.json` | A | Protected canonical v0.1 index; legacy tests |
| `public/data/systems/.gitkeep` | A | Reserved canonical detail directory, no records |
| `schemas/atlas-v1_1.schema.json` | I | Frozen v1.1 regression definitions; preserve |
| `schemas/atlas.schema.json` | A | Current v1.2 structural source |
| `schemas/cantums.schema.json` | I | Current v1.2 wrapper; offline strict resolution tested |
| `schemas/connections.schema.json` | I | Current v1.2 wrapper; offline strict resolution tested |
| `schemas/presentation.schema.json` | I | Current v1.2 wrapper; offline strict resolution tested |
| `schemas/sector.schema.json` | I | Current v1.2 wrapper; offline strict resolution tested |
| `schemas/system-authoring.schema.json` | I | Current v1.2 wrapper; offline strict resolution tested |
| `schemas/system-detail.schema.json` | I | Current v1.2 wrapper; offline strict resolution tested |
| `scripts/atlas-validation.mjs` | I | Strict Ajv authoring/release validation |
| `scripts/audit-demo-build.mjs` | I | Production output audit |
| `scripts/check-relations.mjs` | I | Cross-file historical/spatial integrity |
| `scripts/connections.mjs` | I | Manual writer/check and staged recovery |
| `scripts/demo-files.mjs` | I | Explicit demo allowlist and position-span rewrites |
| `scripts/idfind.mjs` | I | Read-only dataset ID suggestions |
| `scripts/navigation.mjs` | I | Declaration-to-graph/XYZ compiler |
| `scripts/validate-demo.mjs` | I | Live release/relationships/freshness entry point |
| `src/core/cartography.mjs` | I | Pure catalogue, routes, events, territory and zones |
| `src/core/history.mjs` | I | Pure modern historical resolution |
| `src/timeline/resolve.mjs` | I | Protected legacy v0.1 resolver |
| `src/viewer/cartographic-layers.mjs` | I | Three.js routes, zones and influence layer |
| `src/viewer/chart-layout.mjs` | I | Square fit/clamp, grid and measurement |
| `src/viewer/demo-data.mjs` | I | Explicit demo imports and released-detail preload |
| `src/viewer/index.html` | I | Browser shell and native floating/dialog controls |
| `src/viewer/main.mjs` | I | Historical/navigation/selection UI integration |
| `src/viewer/map-scene.mjs` | I | Scene/cameras/picking/projected labels |
| `src/viewer/style.css` | I | Square stage, overlays and restrained prototype style |
| `tests/browser-checkpoint3.mjs` | I | MCP browser entry point; invoked separately |
| `tests/browser-documentation3_6.mjs` | I | MCP browser entry point; invoked separately |
| `tests/browser-layout3_6.mjs` | I | MCP browser entry point; invoked separately |
| `tests/browser-navigation-v1_2.mjs` | I | MCP browser entry point; invoked separately |
| `tests/browser-touch3_6.mjs` | I | MCP browser entry point; invoked separately |
| `tests/cartography.test.mjs` | I | Active Node regression suite |
| `tests/check.mjs` | I | Active Node regression suite |
| `tests/demo.mjs` | I | Legacy console demonstration |
| `tests/fixtures/v1_1/README.md` | I | Frozen accepted v1.1 provenance/input; history/schema/cartography |
| `tests/fixtures/v1_1/cantums.json` | I | Frozen accepted v1.1 provenance/input; history/schema/cartography |
| `tests/fixtures/v1_1/connections.json` | I | Frozen accepted v1.1 provenance/input; history/schema/cartography |
| `tests/fixtures/v1_1/presentation.json` | I | Frozen accepted v1.1 provenance/input; history/schema/cartography |
| `tests/fixtures/v1_1/sector.json` | I | Frozen accepted v1.1 provenance/input; history/schema/cartography |
| `tests/fixtures/v1_1/systems/sys_0001.json` | I | Frozen accepted v1.1 provenance/input; history/schema/cartography |
| `tests/fixtures/v1_1/systems/sys_0002.json` | I | Frozen accepted v1.1 provenance/input; history/schema/cartography |
| `tests/fixtures/v1_2/README.md` | I | Fixed original v1.2 provenance/input; navigation safety regressions |
| `tests/fixtures/v1_2/cantums.json` | I | Fixed original v1.2 provenance/input; navigation safety regressions |
| `tests/fixtures/v1_2/connections.json` | I | Fixed original v1.2 provenance/input; navigation safety regressions |
| `tests/fixtures/v1_2/presentation.json` | I | Fixed original v1.2 provenance/input; navigation safety regressions |
| `tests/fixtures/v1_2/sector.json` | I | Fixed original v1.2 provenance/input; navigation safety regressions |
| `tests/fixtures/v1_2/systems/sys_0001.json` | I | Fixed original v1.2 provenance/input; navigation safety regressions |
| `tests/fixtures/v1_2/systems/sys_0002.json` | I | Fixed original v1.2 provenance/input; navigation safety regressions |
| `tests/fixtures/v1_2/systems/sys_0003.json` | I | Fixed original v1.2 provenance/input; navigation safety regressions |
| `tests/history-v1_1.test.mjs` | I | Active Node regression suite |
| `tests/idfind.test.mjs` | I | Active Node regression suite |
| `tests/layout.test.mjs` | I | Active Node regression suite |
| `tests/navigation-v1_2.test.mjs` | I | Active Node regression suite |
| `tests/schema-v1.test.mjs` | I | Active Node regression suite |
| `tests/schema-v1_1.test.mjs` | I | Active Node regression suite |
| `tests/viewer.test.mjs` | I | Active Node regression suite |
| `vite.config.mjs` | I | Demo root/base, module allowlist and build constraints |

## Final command and reference results

| Command / check | Final result |
| --- | --- |
| `npm test` | Exit 0; **121/121** Node tests, 0 failed/skipped; legacy checks and strict live-demo validation passed |
| `npm run validate` | Exit 0; strict v1.2 release schema, three systems, cross-file constraints and freshness passed |
| `npm run connections:check` | Exit 0; current generated graph and derived gate positions; read-only |
| `npm run build` | Exit 0; 21 modules, six output files; input/output audit passed |
| `npm run demo` | Exit 0; unchanged legacy console chronology |
| Read-only reference audit | Exit 0; counts above, no failed references |
| Retention/protected-path diff check | Exit 0; all 102 original files retained, no changes under protected data/schema/code/tool/fixture/config paths |
| `git diff --check` | Exit 0; no whitespace errors; ordinary Git CRLF conversion notices remain |
| Playwright dev/preview | Layout/navigation/history and new documentation workflow passed; touch suite retains the explicit failed post-gesture tap noted above |

The main production chunk is **630.38 kB minified / 162.43 kB gzip**; the existing
500 kB advisory was not hidden. No dependency/lockfile, application or dataset
change was needed. Existing Node/MCP tests were retained unchanged; the new MCP
smoke entry point is invoked separately and does not inflate the 121 Node total.

Current changes are 21 modified Markdown files (root instructions/introduction
and 19 documents), this new audit report and the new browser smoke test. The
conflict table identifies every revised document, and the file-level inventory
identifies all retained/current dependencies and candidate roles. Local dev and
preview servers are stopped after verification; restart them using the commands
above to review. No commit, push, merge or deployment was performed.
