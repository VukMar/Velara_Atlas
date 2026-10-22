# Velara Atlas documentation index

Architecture Phases **1, 2, 2.1, 2.2, 3A, 3B, 3C and 3D are complete**. **Phase 3D is
creator-approved**, with its implementation and completion documentation committed together.
**Phase 3E is next, not started and awaiting separate authorization.** Phases 3E-3F and later architecture
Phases 4-6 remain planned, unstarted and separately gated. Phase 3 is not complete.
The simplified v1.2 reference library remains current; Phase 2.1 is in `711a410`.
This index is the current navigation/status reference, not an implementation task.

For setup and commands, start with [README](../README.md). For supported JSON,
start with [the v1.2 entity-family guide](../examples/v1_2/README.md) and
[the master schema](../schemas/atlas.schema.json). For authorized work, follow
[AGENTS](../AGENTS.md) and the current creator request. Completed archived tasks
cannot authorize new work.

## Current authoritative specifications and operating guides

| Document | Use it for |
| --- | --- |
| [DATA_MODEL](DATA_MODEL.md) | Active v1.3 model, v1.2 compatibility and null conventions; exact shape is in schemas. |
| [DATA_RULES](DATA_RULES.md) | Protected legacy chronology, uncertainty and disclosure; not a v1.2 migration. |
| [NAVIGATION_AUTHORING](NAVIGATION_AUTHORING.md) | Current manual authoring/generation, read-only checks and recovery. |
| [SCHEMA_V1_2_NAVIGATION](SCHEMA_V1_2_NAVIGATION.md) | Navigation contract; original delivery sections retain historical examples. |
| [CONTENT_WORKFLOW](CONTENT_WORKFLOW.md) | Manual canonical extraction/release safeguards; no automated publisher. |
| [VIEWER_SPECIFICATION](VIEWER_SPECIFICATION.md) | Current historical viewer behavior, map hierarchy and interaction. |
| [LAYOUT_REVISION_3_6](LAYOUT_REVISION_3_6.md) | Approved layout rationale/amendment; supersedes original permanent sidebars. |
| [ZONE_GEOMETRY_INTERACTION_SPEC](ZONE_GEOMETRY_INTERACTION_SPEC.md) | Implemented zone intersection and picking contract. |
| [CARTOGRAPHIC_LABELING](CARTOGRAPHIC_LABELING.md) | Implemented typography and caption rules with later Cantum amendments. |
| [CANTUM_TERRITORY_RENDERING](CANTUM_TERRITORY_RENDERING.md) | Current membership, Gaussian fields, compositing, identities and calibration. |
| [NEXUS_VISUAL_IDENTITY](NEXUS_VISUAL_IDENTITY.md) | Approved visual direction; final refinement remains deferred. |
| [VISUAL_ASSET_POLICY](VISUAL_ASSET_POLICY.md) | Asset categories, safe registries and fallbacks. |
| [CHECKPOINT_4_CELESTIAL_SCALE_SPEC](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md) | Approved CNU conversion, physical dimensions/proxy scale and inspection. |
| [LEGACY_MIGRATION_PLAN](LEGACY_MIGRATION_PLAN.md) | Canonical migration safeguards; separate approval and ID crosswalk required. |

These documents divide authority by subject; schemas govern exact stored shape.
Design directions do not authorize all future implementation. Canonical v0.1,
frozen regressions, the active noncanonical demo and reference examples are
separate data contexts.

## Current roadmap, status and reference

| Document | Use it for |
| --- | --- |
| [ARCHITECTURE](ARCHITECTURE.md) | Implemented module ownership, data flow and production boundary. |
| [REPOSITORY_STRUCTURE](REPOSITORY_STRUCTURE.md) | Current path ownership and publication surfaces. |
| [HISTORICAL_RESOLVER](HISTORICAL_RESOLVER.md) | Pure modern historical API; legacy v0.1 remains separate. |
| [DEVELOPMENT_ROADMAP](DEVELOPMENT_ROADMAP.md) | Feature checkpoints and separate approval gates. |
| [ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP](ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md) | Phases 1-2.2 and 3A-3D complete and creator-approved; 3E next and unauthorized; 3E-3F and 4-6 planned. |

The sector-derived validated inventory and eager loader are described in
[README](../README.md#registered-demo-systems-and-loading) and
[architecture](ARCHITECTURE.md#validated-dataset-inventory). Phase 3B is complete;
Completed Phase 3D activates Phase 3C's core support in the v1.3 Demo.
[DATA_MODEL_V1_3_PROPOSAL](DATA_MODEL_V1_3_PROPOSAL.md) describes faction records,
pure reference/governance APIs, validation and the TEST fixture. It is the accepted
current Demo contract, retaining its proposal history and migration crosswalk.
Phase 3E remains unauthorized.

The live graphical Demo remains `public/datasets/demo/`, served by `npm run demo`
on 5173. `npm run dev` (alias `preview:calibration`) serves local calibration on
5174 from the fixed JSON scenario in `tests/calibration/scenarios/`, via its
cloning adapter. `history:demo` is the terminal chronology. Canon remains future,
with no launcher. See [commands, scenario format and tests](../README.md#local-development-and-future-canon).
The v1.3 Demo uses a provisional shared 24-ly radius and an empty faction registry.
Frozen v1.2 per-Cantum radii/calibration remain compatible; Canon is not migrated.

## Historical implementation reports and verification evidence

The files below stay at their existing paths. Dates, test counts, screenshots,
limitations, paths and working-copy circumstances describe their checkpoints.
In particular, Stage 4/calibration and Phase 2 reports saying uncommitted/local
predate their later commits. They are not new test results or current work orders.

| Document | Historical role |
| --- | --- |
| [VIEWER_PROTOTYPE](VIEWER_PROTOTYPE.md) | Historical implementation reference with explicitly marked later compatibility notes. |
| [NAVIGATION_V1_2_RESULTS](NAVIGATION_V1_2_RESULTS.md) | Original navigation migration, graph and recovery evidence. |
| [CHECKPOINT_3_6_RESULTS](CHECKPOINT_3_6_RESULTS.md) | Original layout implementation evidence. |
| [REPOSITORY_AUDIT_3_6](REPOSITORY_AUDIT_3_6.md) | Point-in-time repository audit, retention proposals and test limitations. |
| [CARTOGRAPHIC_LABELING_RESULTS](CARTOGRAPHIC_LABELING_RESULTS.md) | Original cartographic-label verification. |
| [ZONE_GEOMETRY_INTERACTION_RESULTS](ZONE_GEOMETRY_INTERACTION_RESULTS.md) | Checkpoint 3.8 zone verification. |
| [CHECKPOINT_4_PHASE2_RESULTS](CHECKPOINT_4_PHASE2_RESULTS.md) | Celestial demonstration expansion evidence. |
| [CHECKPOINT_4_PHASE3_RESULTS](CHECKPOINT_4_PHASE3_RESULTS.md) | Physical renderer/proxy and starter-asset evidence. |
| [POST_PHASE3_MAINTENANCE](POST_PHASE3_MAINTENANCE.md) | Creator-approved System C baseline and maintenance verification. |
| [SECTOR_GRID_STANDARDIZATION_RESULTS](SECTOR_GRID_STANDARDIZATION_RESULTS.md) | Original sector-grid standardization evidence. |
| [CANTUM_NAMEPLATES_STAGE1_RESULTS](CANTUM_NAMEPLATES_STAGE1_RESULTS.md) | Nameplate implementation evidence. |
| [CANTUM_SIGILS_STAGE2_RESULTS](CANTUM_SIGILS_STAGE2_RESULTS.md) | Sigil schema/registry and nameplate integration evidence. |
| [CANTUM_ENVELOPES_STAGE3_RESULTS](CANTUM_ENVELOPES_STAGE3_RESULTS.md) | Envelope implementation and measured limits at that checkpoint. |
| [CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS](CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md) | Stage 4 fitting/identity implementation evidence. |
| [CANTUM_SCALE_CALIBRATION_RESULTS](CANTUM_SCALE_CALIBRATION_RESULTS.md) | Intermediate scale calibration and isolated-preview evidence. |
| [PHASE_02_DATASET_MIGRATION_RESULTS](PHASE_02_DATASET_MIGRATION_RESULTS.md) | Phase 2 move/hash/browser evidence before its subsequent commit. |

## Archived completed or superseded material

| Document | Classification / reason retained |
| --- | --- |
| [CODEX_PHASE_01_DOCUMENTATION_TASK](archive/completed-tasks/CODEX_PHASE_01_DOCUMENTATION_TASK.md) | Completed Phase 1 task; provenance only, no current authorization. |
| [CODEX_PHASE_02_DATASET_MIGRATION_TASK](archive/completed-tasks/CODEX_PHASE_02_DATASET_MIGRATION_TASK.md) | Completed Phase 2 task; provenance only, no current authorization. |
| [PHASE_02_DATASET_MIGRATION_INVENTORY](archive/completed-tasks/PHASE_02_DATASET_MIGRATION_INVENTORY.md) | Completed pre-migration dependency inventory; old paths retained as evidence. |
| [DATA_MODEL_DRAFT](archive/design/DATA_MODEL_DRAFT.md) | Superseded v0.2 design proposal; preserves InfoCard/null/identity origins. |
| [SCHEMA_INSTALL](archive/installation/SCHEMA_INSTALL.md) | Obsolete package-install procedure; do not execute against current checkout. |
| [README](archive/json-proposals/README.md) | Eight retained historical JSON proposals; not current templates. |

Archived task and installation language is original historical scope, not a
present instruction to move files, install old packages or implement a phase.
No historical JSON proposals or reports were deleted during Phase 2.1.

Frozen regression provenance remains in [v1.1](../tests/fixtures/v1_1/README.md)
and [v1.2](../tests/fixtures/v1_2/README.md); separate legacy examples remain in
[legacy_examples](../tests/fixtures/legacy_examples/README.md). Use the current
[family guide](../examples/v1_2/README.md) for authoring formats, not archived
shapes or frozen snapshots. All of these developer/historical sources are excluded
from the production viewer.
