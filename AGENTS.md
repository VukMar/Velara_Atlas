# Velara Atlas - Codex working instructions

Read this file before editing. Follow the current creator request; documentation and completed tasks do not authorize implementation.

## Status and authorization

[PROJECT_STATUS](docs/PROJECT_STATUS.md) is the single current-status authority. Original Checkpoint 4, Architecture Phases 1-6 and NEXUS Public Entrance Integration are complete and creator-approved.

Canonical Atlas integration, the Holographic Transmission InfoCard, NEXUS navigation/control bars and world-anchored Cantum typography with final compositing polish are implemented, creator-accepted and merged through PRs #4 and #5 into `main` at `bc4c529664fce1df4dab4117bb3f0794a41f5531`. Repository version stays **1.0.0 canonical launch candidate**. Documentation reconciliation does not authorize further product changes. The next publication gate is a separately authorized manual GitHub Pages deployment. Future canonical content, Atlas Creator, tags and GitHub Releases remain separately authorized.

`src/viewer/index.html` is the single interactive canonical Atlas; `public/datasets/canonical/` is its active v1.3 dataset. The former teaser and Demo are archived in `tests/fixtures/archived-demo/`, never production inputs. Preserve original NEXUS first-entry/audio ownership, `/Velara_Atlas/`, all five canonical JSON files, descriptions, engine/schema, map geometry, cameras, navigation and pinned assets. See [integration](docs/CANONICAL_APPLICATION_INTEGRATION.md) and [Cantum implementation evidence](docs/CANTUM_NAMEPLATE_REFINEMENT.md).

The current interface uses four top utilities, modal Catalogue/Help, exclusive reserved-space bottom toolbars and protected 10-second inactivity dismissal. Cantum names use component-fitted +Y-facing world planes, order 4.5 after ordinary markers at 4, .82 overview opacity, retained depth tests and the 1.15x-1.50x caption crossfade. Historical floating-panel/vertical-History, DOM 14-24px and camera-facing nameplate rules are superseded.

The latest verified published website remains the October 27, 2026 **0.5.0 noncanonical pre-release** until a successful separately authorized manual deployment is recorded. Cantum Visual Stage 5 remains deferred. Future canonical expansion, protected legacy migration and graphical Atlas Creator remain separately gated. Do not advance old roadmap concepts automatically; dated task/closeout records preserve evidence, not current permission.

For future authorized viewer-facing work, use Canonical for integration review and an explicit isolated synthetic fixture when generic object coverage is needed, then stop for creator visual review. Corrections, explicit approval and separately authorized commit/push follow. Documentation and nonvisual maintenance need no filler entities. See [review policy](docs/DEMO_SHOWCASE.md#feature-to-review-policy).

## Read by task

Start with [README](README.md) for setup and [INDEX](docs/INDEX.md) for document authority. Follow [VERSIONING_POLICY](docs/VERSIONING_POLICY.md): evaluate version impact at each milestone closeout/release, recommend an increment or none with a brief reason, and obtain approval before changing versions unless the creator already specified the new version.

- Architecture/source changes: [ARCHITECTURE](docs/ARCHITECTURE.md), [REPOSITORY_STRUCTURE](docs/REPOSITORY_STRUCTURE.md).
- Data/history: [DATA_MODEL](docs/DATA_MODEL.md), [accepted v1.3 contract](docs/DATA_MODEL_V1_3_PROPOSAL.md), versioned schemas, [DATA_RULES](docs/DATA_RULES.md), [HISTORICAL_RESOLVER](docs/HISTORICAL_RESOLVER.md).
- Authoring/navigation: [MANUAL_AUTHORING](docs/MANUAL_AUTHORING.md), [NAVIGATION_AUTHORING](docs/NAVIGATION_AUTHORING.md), [navigation contract](docs/SCHEMA_V1_2_NAVIGATION.md).
- Viewer/presentation: [VIEWER_SPECIFICATION](docs/VIEWER_SPECIFICATION.md), [celestial scale](docs/CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md), [territory rendering](docs/CANTUM_TERRITORY_RENDERING.md), [NEXUS identity](docs/NEXUS_VISUAL_IDENTITY.md), [VISUAL_ASSET_POLICY](docs/VISUAL_ASSET_POLICY.md).
- Disclosure/release: [CONTENT_WORKFLOW](docs/CONTENT_WORKFLOW.md), [LEGACY_MIGRATION_PLAN](docs/LEGACY_MIGRATION_PLAN.md), [release checks](docs/PERFORMANCE_AND_RELEASE_READINESS.md#local-publication-dry-run-and-security).

Schemas govern exact stored shape; subject specifications govern behavior. Archive reports and completed roadmap sections preserve evidence, not current instructions. If a file is missing, report it instead of inventing its contents.

## Non-negotiable boundaries

- **No invented canon or disclosure.** Do not invent official names, dates, statistics, affiliations, coordinates or narratives. Use null/omission or explicitly permitted noncanonical TEST records. Approximate dates remain approximate. Only creator-approved public facts may enter JSON, examples, tests, docs, logs, bundles or Git history. Private RTF/source lore and extraction caches stay outside public Git; ignoring a file is not confidentiality.
- **Keep environments separate.** Active canonical v1.3: `public/datasets/canonical/`. Archived NONCANONICAL Demo: `tests/fixtures/archived-demo/dataset/`. Development/calibration: finite registered synthetic scenarios under `tests/calibration/`. Legacy Canon: `public/data/` and `src/timeline/resolve.mjs`. Frozen fixtures and v1.2 examples retain their contracts. Never promote Demo/TEST/example data into Canon; no noncanonical fallback is authorized.
- **Preserve identity, schema and chronology.** IDs are permanent. Names, administration, control and affiliations are independent histories. `fromAE` is inclusive, `untilAE` exclusive, null ending open-ended. Unknown/null is not year zero. Validate numeric years explicitly. Pure historical logic stays independent of Three.js. Keep legacy and versioned regressions.
- **Preserve units and authored geometry.** Sector XYZ is light-years; system XYZ is CNU, universally 1 CNU = 10,000 km. X/Z is the map plane; Y is elevation, with the system grid at absolute Y = 0 CNU. Null placement is not the origin. Optional `physicalDiameterKm` is positive finite, omitted when unknown and never inferred. No coordinate rescaling. Preserve the provisional v1.3 Demo radius of 24 ly and frozen v1.2/calibration radii; choose no canonical radius.
- **Navigation is manual and recoverable.** System-object `navigation.localLinks`/`interstellarConnection` declarations own navigation. Each gate/hole has at most one lifetime partner; no repointing. Newly authored short-range gates start with `position: null`, `positionMode: "boundary_derived"`. Only the explicitly invoked `npm run connections` writes the tracked graph and eligible gate XYZ. Then run `connections:check`, tests/build and review the diff. CI, startup and builds only check. Preserve pending recovery journals/backups.
- **Keep the public viewer read-only.** Retain `publicDir: false`, static validated imports, filesystem guards, exact input/output allowlists, completeness, reachability and disclosure audits. No arbitrary roots, runtime dataset JSON fetching, writable endpoint, editor or authentication/backend without approval. Source-repository asset presence alone does not authorize bundling.
- **Preserve approved assets and behavior.** Sixteen exact SVGs, three PNGs and eight MP3s are admitted by pinned registries. Do not edit originals, replace hashes, add assets/settings or rebalance audio without approval. Preserve the single audio master, first-entry rules, physical/proxy scale, reticles, camera/history/navigation and cancellation/disposal contracts. Detailed rules live in the linked specifications.
- **Keep the stack focused.** Prefer vanilla ES modules, Three.js, Vite and small Node tools. No framework or dependency additions without approval.

## Working method

1. Inspect current branch, `git status`, relevant files/tests and task scope before significant changes. Preserve existing user work. Explain affected files and any data/migration implications.
2. Do not change code, data or assets beyond the authorized scope. Make the smallest backward-compatible change. Propose any breaking migration, affected files and rollback before implementation. Do not delete/move uncertain retained material without scoped authorization.
3. For separately authorized canon extraction, read sources without modifying them; produce a private candidate report with source sections, uncertainty and unresolved questions. Obtain creator approval before canonical JSON changes.
4. Run relevant checks. Code/data changes require `npm test`; canonical entry and scoped fixture browser checks apply to visible changes. Validate relevant JSON, references, IDs, intervals and disclosure. Use [local development](docs/LOCAL_DEVELOPMENT.md) for commands.
5. Before delivery, inspect the diff and run `connections:check`, validation/build/release checks as relevant. Report exact results, omissions and limits. Never claim deployment, browser/device coverage or protections that were not verified.
6. Work on the requested branch/PR; commit, push or merge only within creator authorization. Never start another workstream automatically.
