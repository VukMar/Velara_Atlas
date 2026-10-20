# Velara Atlas — Documentation index

Current baseline: `main` at `190bd21` (2026-10-20), including Cantum Stage 4 and
intermediate calibration. Current authorization is **architecture Phase 1,
documentation and inventory only**. Reports retain their original checkpoint
circumstances; a report saying “uncommitted” does not describe today's baseline.

## Active authority — read for rules and behavior

| Task | Read |
| --- | --- |
| Work within authorized scope | [AGENTS](../AGENTS.md), [Phase 1 task](CODEX_PHASE_01_DOCUMENTATION_TASK.md) |
| Understand implemented modules and disclosure boundaries | [Architecture](ARCHITECTURE.md), [repository ownership](REPOSITORY_STRUCTURE.md) |
| Author valid noncanonical records | [Data model](DATA_MODEL.md), [current schema](../schemas/atlas.schema.json), [navigation specification](SCHEMA_V1_2_NAVIGATION.md) |
| Preserve canon, dates and publication separation | [Data rules](DATA_RULES.md), [content workflow](CONTENT_WORKFLOW.md), [canonical migration safeguards](LEGACY_MIGRATION_PLAN.md) |
| Change viewer behavior under a future authorization | [Viewer specification](VIEWER_SPECIFICATION.md), [layout revision](LAYOUT_REVISION_3_6.md), [zone contract](ZONE_GEOMETRY_INTERACTION_SPEC.md), [labeling](CARTOGRAPHIC_LABELING.md) |
| Understand visual contracts | [Celestial scale](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md), [Cantum rendering](CANTUM_TERRITORY_RENDERING.md), [NEXUS identity](NEXUS_VISUAL_IDENTITY.md), [asset policy](VISUAL_ASSET_POLICY.md) |

Schemas govern exact structure; specifications govern behavior, not blanket
permission to implement future work. The v1.2 demo, frozen regressions and
protected v0.1 canon are separate datasets.

## Procedures and API reference — read to operate the checkout

- [README](../README.md): install/run/check commands, read-only ID Finder and
  separate loopback calibration workflow. Active demo: `examples/demo_atlas/`.
- [Navigation authoring](NAVIGATION_AUTHORING.md): manual graph generation,
  read-only freshness checks, safe replacement and recovery.
- [Historical resolver API](HISTORICAL_RESOLVER.md): pure selectors.
- [Calibration ownership](ARCHITECTURE.md): `tests/calibration/scenario.mjs`
  creates synthetic records in memory; no demo JSON or scenario JSON loader.

## Current status and proposed work — read before planning

- [Development roadmap](DEVELOPMENT_ROADMAP.md): feature milestones and approval gates.
- [Architecture optimization roadmap](ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md):
  separate architecture phases; does not replace feature contracts.
- [Phase 1 task](CODEX_PHASE_01_DOCUMENTATION_TASK.md): current documentation-only
  scope, validation and completion requirements.
- [Phase 2 migration inventory](PHASE_02_DATASET_MIGRATION_INVENTORY.md): proposed
  demo relocation, consumers and rollback; **not implemented**. JSON calibration
  scenarios are Phase 5, manifest loading is Phase 3.

## Historical checkpoint evidence — read for past verification and limits

These files are preserved at their existing paths. Their commands, screenshots,
counts and worktree statements are point-in-time evidence, not fresh test results.

- [Prototype](VIEWER_PROTOTYPE.md), [navigation v1.2](NAVIGATION_V1_2_RESULTS.md),
  [Checkpoint 3.6](CHECKPOINT_3_6_RESULTS.md), [3.6 repository audit](REPOSITORY_AUDIT_3_6.md).
- [Labeling](CARTOGRAPHIC_LABELING_RESULTS.md), [zones](ZONE_GEOMETRY_INTERACTION_RESULTS.md),
  [celestial Phase 2](CHECKPOINT_4_PHASE2_RESULTS.md), [celestial Phase 3](CHECKPOINT_4_PHASE3_RESULTS.md),
  [System C maintenance](POST_PHASE3_MAINTENANCE.md).
- [Sector grid](SECTOR_GRID_STANDARDIZATION_RESULTS.md),
  [Cantum Stage 1](CANTUM_NAMEPLATES_STAGE1_RESULTS.md),
  [Stage 2](CANTUM_SIGILS_STAGE2_RESULTS.md),
  [Stage 3](CANTUM_ENVELOPES_STAGE3_RESULTS.md),
  [Stage 4](CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md),
  [scale calibration](CANTUM_SCALE_CALIBRATION_RESULTS.md).

## Superseded or frozen reference material

- [Data-model draft](DATA_MODEL_DRAFT.md): superseded v0.2 proposal.
- [Schema installation](SCHEMA_INSTALL.md): obsolete installation history;
  do not install its old files over the current checkout.
- [Frozen v1.1](../tests/fixtures/v1_1/README.md) and
  [frozen v1.2](../tests/fixtures/v1_2/README.md): regression provenance.
  Standalone `examples/*.json` include legacy test inputs and old proposal
  shapes; consult [ownership](REPOSITORY_STRUCTURE.md), not those files as v1.2 tutorials.
