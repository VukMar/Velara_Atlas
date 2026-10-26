# Velara Atlas - Codex working instructions

Read this file before editing. Follow the current creator request; documentation and completed tasks do not authorize implementation.

## Status and authorization

[PROJECT_STATUS](docs/PROJECT_STATUS.md) is the single current-status authority.
Checkpoint 4, including integrated creator acceptance, and Architecture Phases 1-6 are complete and creator-approved.
Cantum Visual Stage 5 is deferred, not a release-planning blocker.
Checkpoint 5 release preparation needs separate creator authorization.
Canon migration, graphical Atlas Creator and public deployment remain separately gated.
Do not automatically advance milestones or treat an old task/closeout as current permission.

For viewer-facing work, implement only the authorized scope, run checks, provide a representative normal-Demo example when needed, and stop for creator visual review. Corrections, explicit approval and separately authorized commit/push follow. Documentation and nonvisual maintenance need no filler entities. See [DEMO_SHOWCASE](docs/DEMO_SHOWCASE.md#feature-to-review-policy).

## Read by task

Start with [README](README.md) for setup and [INDEX](docs/INDEX.md) for document authority.

- Architecture/source changes: [ARCHITECTURE](docs/ARCHITECTURE.md), [REPOSITORY_STRUCTURE](docs/REPOSITORY_STRUCTURE.md).
- Data/history: [DATA_MODEL](docs/DATA_MODEL.md), [accepted v1.3 contract](docs/DATA_MODEL_V1_3_PROPOSAL.md), versioned schemas, [DATA_RULES](docs/DATA_RULES.md), [HISTORICAL_RESOLVER](docs/HISTORICAL_RESOLVER.md).
- Authoring/navigation: [MANUAL_AUTHORING](docs/MANUAL_AUTHORING.md), [NAVIGATION_AUTHORING](docs/NAVIGATION_AUTHORING.md), [navigation contract](docs/SCHEMA_V1_2_NAVIGATION.md).
- Viewer/presentation: [VIEWER_SPECIFICATION](docs/VIEWER_SPECIFICATION.md), [celestial scale](docs/CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md), [territory rendering](docs/CANTUM_TERRITORY_RENDERING.md), [NEXUS identity](docs/NEXUS_VISUAL_IDENTITY.md), [VISUAL_ASSET_POLICY](docs/VISUAL_ASSET_POLICY.md).
- Disclosure/release: [CONTENT_WORKFLOW](docs/CONTENT_WORKFLOW.md), [LEGACY_MIGRATION_PLAN](docs/LEGACY_MIGRATION_PLAN.md), [release checks](docs/PERFORMANCE_AND_RELEASE_READINESS.md#local-publication-dry-run-and-security).

Schemas govern exact stored shape; subject specifications govern behavior. Archive reports and completed roadmap sections preserve evidence, not current instructions. If a file is missing, report it instead of inventing its contents.

## Non-negotiable boundaries

- **No invented canon or disclosure.** Do not invent official names, dates, statistics, affiliations, coordinates or narratives. Use null/omission or explicitly permitted noncanonical TEST records. Approximate dates remain approximate. Only creator-approved public facts may enter JSON, examples, tests, docs, logs, bundles or Git history. Private RTF/source lore and extraction caches stay outside public Git; ignoring a file is not confidentiality.
- **Keep environments separate.** Active v1.3 NONCANONICAL Demo: `public/datasets/demo/`. Development/calibration: finite registered synthetic scenarios under `tests/calibration/`. Legacy Canon: `public/data/` and `src/timeline/resolve.mjs`. Frozen fixtures and v1.2 examples retain their contracts. Never promote Demo/TEST/example data into Canon; no Canon launcher or noncanonical fallback is authorized.
- **Preserve identity, schema and chronology.** IDs are permanent. Names, administration, control and affiliations are independent histories. `fromAE` is inclusive, `untilAE` exclusive, null ending open-ended. Unknown/null is not year zero. Validate numeric years explicitly. Pure historical logic stays independent of Three.js. Keep legacy and versioned regressions.
- **Preserve units and authored geometry.** Sector XYZ is light-years; system XYZ is CNU, universally 1 CNU = 10,000 km. X/Z is the map plane; Y is elevation, with the system grid at absolute Y = 0 CNU. Null placement is not the origin. Optional `physicalDiameterKm` is positive finite, omitted when unknown and never inferred. No coordinate rescaling. Preserve the provisional v1.3 Demo radius of 24 ly and frozen v1.2/calibration radii; choose no canonical radius.
- **Navigation is manual and recoverable.** System-object `navigation.localLinks`/`interstellarConnection` declarations own navigation. Each gate/hole has at most one lifetime partner; no repointing. Newly authored short-range gates start with `position: null`, `positionMode: "boundary_derived"`. Only `npm run connections` writes the tracked graph and eligible gate XYZ. Then run `connections:check`, tests/build and review the diff. CI, startup and builds only check. Preserve pending recovery journals/backups.
- **Keep the public viewer read-only.** Retain `publicDir: false`, static validated imports, filesystem guards, exact input/output allowlists, completeness, reachability and disclosure audits. No arbitrary roots, runtime Demo JSON fetching, writable endpoint, editor or authentication/backend without approval. Source-repository asset presence alone does not authorize bundling.
- **Preserve approved assets and behavior.** Sixteen exact SVGs, three PNGs and eight MP3s are admitted by pinned registries. Do not edit originals, replace hashes, add assets/settings or rebalance audio without approval. Preserve the single audio master, first-entry rules, physical/proxy scale, reticles, camera/history/navigation and cancellation/disposal contracts. Detailed rules live in the linked specifications.
- **Keep the stack focused.** Prefer vanilla ES modules, Three.js, Vite and small Node tools. No framework or dependency additions without approval.

## Working method

1. Inspect current branch, `git status`, relevant files/tests and task scope before significant changes. Preserve existing user work. Explain affected files and any data/migration implications.
2. Do not change code, data or assets beyond the authorized scope. Make the smallest backward-compatible change. Propose any breaking migration, affected files and rollback before implementation. Do not delete/move uncertain retained material without scoped authorization.
3. For separately authorized canon extraction, read sources without modifying them; produce a private candidate report with source sections, uncertainty and unresolved questions. Obtain creator approval before canonical JSON changes.
4. Run relevant checks. Code/data changes require `npm test`; normal Demo and scoped browser checks apply to visible changes. Validate relevant JSON, references, IDs, intervals and disclosure. Use [local development](docs/LOCAL_DEVELOPMENT.md) for commands.
5. Before delivery, inspect the diff and run `connections:check`, validation/build/release checks as relevant. Report exact results, omissions and limits. Never claim deployment, browser/device coverage or protections that were not verified.
6. Work on the requested branch/PR; commit, push or merge only within creator authorization. Never start another workstream automatically.
