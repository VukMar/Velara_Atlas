# Documentation audit and reorganization - 2026-10-26

**Historical maintenance record, not implementation authorization.** Baseline: clean `main`/`origin/main` at `f0d8d140f6b8c61dc5c6585edf34c49aa485201f`. The creator confirmed Checkpoint 4 integrated acceptance, Architecture Phases 1-6 completion, Stage 5 deferral without a release-planning blocker, and separately gated Checkpoint 5 release preparation. [PROJECT_STATUS](../../PROJECT_STATUS.md) is current authority.

## Before and after

```text
Before                             After
README.md (619 lines)               README.md (short setup/check entry point)
AGENTS.md (255 lines)               AGENTS.md (actionable constraints)
docs/INDEX.md (status + history)    docs/INDEX.md (purpose-based navigation)
                                   docs/PROJECT_STATUS.md (one status authority)
README detailed operations         docs/LOCAL_DEVELOPMENT.md
docs/*.md (specs + 16 reports)      docs/*.md (stable specs/guides/roadmaps)
                                   docs/archive/README.md (evidence navigation)
                                   docs/archive/reports/ (16 reports)
docs/archive/{completed-tasks,      same sections retained unchanged in role
  design,installation,
  json-proposals}/
                                   docs/archive/audits/ (this record)
```

Only Markdown files changed. No files were deleted; the sixteen absent old paths are relocations, not removals of evidence.

## Authority and consolidation

PROJECT_STATUS owns present completion/authorization. INDEX organizes references; README owns first setup, and AGENTS owns agent working constraints. Versioned schemas govern exact JSON shape. Subject specifications govern implemented behavior, with later approved amendments taking precedence over earlier proposals. No specification or historical task authorizes implementation.

README/AGENTS repeated phase-by-phase recaps were consolidated into links to existing roadmap/readiness evidence and subject contracts. Detailed local preview/ID/browser operations moved from README into LOCAL_DEVELOPMENT. No old report dates, measured results, test totals or conclusions were rewritten. Archive banners and link-target rebasing are editorial annotations only. Mixed roadmap/readiness documents are explicitly labeled and retain stable paths.

## Complete Markdown inventory

The following table covers all 54 pre-audit tracked Markdown documents, including example and fixture guides. "Retained" permits link rebasing; technical or historical content remains unless the action explicitly says current guidance was corrected.

| Original document -> current location | Classification | Action / retained value |
| --- | --- | --- |
| `AGENTS.md` -> [AGENTS.md](../../../AGENTS.md) | Active developer/authoring guide | Rewritten or current guidance corrected; duplicate status consolidated |
| `README.md` -> [README.md](../../../README.md) | Active developer/authoring guide | Rewritten or current guidance corrected; duplicate status consolidated |
| `docs/ARCHITECTURE.md` -> [ARCHITECTURE.md](../../ARCHITECTURE.md) | Active authoritative specification | Retained stable path; stale status/context corrected, technical rules preserved |
| `docs/ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md` -> [ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md](../../ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md) | Completed task/roadmap | Retained stable path; stale current authorization labeled historical |
| `docs/CANTUM_ENVELOPES_STAGE3_RESULTS.md` -> [CANTUM_ENVELOPES_STAGE3_RESULTS.md](../reports/CANTUM_ENVELOPES_STAGE3_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md` -> [CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md](../reports/CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CANTUM_NAMEPLATES_STAGE1_RESULTS.md` -> [CANTUM_NAMEPLATES_STAGE1_RESULTS.md](../reports/CANTUM_NAMEPLATES_STAGE1_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CANTUM_SCALE_CALIBRATION_RESULTS.md` -> [CANTUM_SCALE_CALIBRATION_RESULTS.md](../reports/CANTUM_SCALE_CALIBRATION_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CANTUM_SIGILS_STAGE2_RESULTS.md` -> [CANTUM_SIGILS_STAGE2_RESULTS.md](../reports/CANTUM_SIGILS_STAGE2_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CANTUM_TERRITORY_RENDERING.md` -> [CANTUM_TERRITORY_RENDERING.md](../../CANTUM_TERRITORY_RENDERING.md) | Active authoritative specification | Retained stable path; stale status/context corrected, technical rules preserved |
| `docs/CARTOGRAPHIC_LABELING.md` -> [CARTOGRAPHIC_LABELING.md](../../CARTOGRAPHIC_LABELING.md) | Active authoritative specification | Retained technical rules; links updated where needed |
| `docs/CARTOGRAPHIC_LABELING_RESULTS.md` -> [CARTOGRAPHIC_LABELING_RESULTS.md](../reports/CARTOGRAPHIC_LABELING_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CHECKPOINT_3_6_RESULTS.md` -> [CHECKPOINT_3_6_RESULTS.md](../reports/CHECKPOINT_3_6_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md` -> [CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md](../../CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md) | Active authoritative specification | Retained stable path; stale status/context corrected, technical rules preserved |
| `docs/CHECKPOINT_4_PHASE2_RESULTS.md` -> [CHECKPOINT_4_PHASE2_RESULTS.md](../reports/CHECKPOINT_4_PHASE2_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CHECKPOINT_4_PHASE3_RESULTS.md` -> [CHECKPOINT_4_PHASE3_RESULTS.md](../reports/CHECKPOINT_4_PHASE3_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/CONTENT_WORKFLOW.md` -> [CONTENT_WORKFLOW.md](../../CONTENT_WORKFLOW.md) | Active developer/authoring guide | Retained; links updated where needed |
| `docs/DATA_MODEL.md` -> [DATA_MODEL.md](../../DATA_MODEL.md) | Active authoritative specification | Retained technical rules; links updated where needed |
| `docs/DATA_MODEL_V1_3_PROPOSAL.md` -> [DATA_MODEL_V1_3_PROPOSAL.md](../../DATA_MODEL_V1_3_PROPOSAL.md) | Active authoritative specification | Retained stable path; stale status/context corrected, technical rules preserved |
| `docs/DATA_RULES.md` -> [DATA_RULES.md](../../DATA_RULES.md) | Active authoritative specification | Retained legacy rules; detailed canon cautions moved from AGENTS, links updated |
| `docs/DEMO_SHOWCASE.md` -> [DEMO_SHOWCASE.md](../../DEMO_SHOWCASE.md) | Active developer/authoring guide | Retained; links updated where needed |
| `docs/DEVELOPMENT_ROADMAP.md` -> [DEVELOPMENT_ROADMAP.md](../../DEVELOPMENT_ROADMAP.md) | Planning + historical phase records | Retained; current completion/gates corrected, dated phase evidence preserved |
| `docs/HISTORICAL_RESOLVER.md` -> [HISTORICAL_RESOLVER.md](../../HISTORICAL_RESOLVER.md) | Active authoritative specification | Retained technical rules; links updated where needed |
| `docs/INDEX.md` -> [INDEX.md](../../INDEX.md) | Current navigation | Rewritten by purpose; status delegated to PROJECT_STATUS |
| `docs/LAYOUT_REVISION_3_6.md` -> [LAYOUT_REVISION_3_6.md](../../LAYOUT_REVISION_3_6.md) | Active authoritative specification | Retained technical rules; links updated where needed |
| `docs/LEGACY_MIGRATION_PLAN.md` -> [LEGACY_MIGRATION_PLAN.md](../../LEGACY_MIGRATION_PLAN.md) | Active migration safeguards (plan only) | Retained stable path; stale status/context corrected, technical rules preserved |
| `docs/MANUAL_AUTHORING.md` -> [MANUAL_AUTHORING.md](../../MANUAL_AUTHORING.md) | Active developer/authoring guide | Retained; links updated where needed |
| `docs/NAVIGATION_AUTHORING.md` -> [NAVIGATION_AUTHORING.md](../../NAVIGATION_AUTHORING.md) | Active developer/authoring guide | Rewritten or current guidance corrected; duplicate status consolidated |
| `docs/NAVIGATION_V1_2_RESULTS.md` -> [NAVIGATION_V1_2_RESULTS.md](../reports/NAVIGATION_V1_2_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/NEXUS_VISUAL_IDENTITY.md` -> [NEXUS_VISUAL_IDENTITY.md](../../NEXUS_VISUAL_IDENTITY.md) | Active authoritative specification | Retained stable path; stale status/context corrected, technical rules preserved |
| `docs/PERFORMANCE_AND_RELEASE_READINESS.md` -> [PERFORMANCE_AND_RELEASE_READINESS.md](../../PERFORMANCE_AND_RELEASE_READINESS.md) | Active developer/authoring guide | Retained mixed guide/evidence; added authority boundary, original results untouched |
| `docs/PHASE_02_DATASET_MIGRATION_RESULTS.md` -> [PHASE_02_DATASET_MIGRATION_RESULTS.md](../reports/PHASE_02_DATASET_MIGRATION_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/POST_PHASE3_MAINTENANCE.md` -> [POST_PHASE3_MAINTENANCE.md](../reports/POST_PHASE3_MAINTENANCE.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/REPOSITORY_AUDIT_3_6.md` -> [REPOSITORY_AUDIT_3_6.md](../reports/REPOSITORY_AUDIT_3_6.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/REPOSITORY_STRUCTURE.md` -> [REPOSITORY_STRUCTURE.md](../../REPOSITORY_STRUCTURE.md) | Active developer/authoring guide | Rewritten or current guidance corrected; duplicate status consolidated |
| `docs/SCHEMA_V1_2_NAVIGATION.md` -> [SCHEMA_V1_2_NAVIGATION.md](../../SCHEMA_V1_2_NAVIGATION.md) | Active authoritative specification | Retained technical rules; links updated where needed |
| `docs/SECTOR_GRID_STANDARDIZATION_RESULTS.md` -> [SECTOR_GRID_STANDARDIZATION_RESULTS.md](../reports/SECTOR_GRID_STANDARDIZATION_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/VIEWER_PROTOTYPE.md` -> [VIEWER_PROTOTYPE.md](../reports/VIEWER_PROTOTYPE.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/VIEWER_SPECIFICATION.md` -> [VIEWER_SPECIFICATION.md](../../VIEWER_SPECIFICATION.md) | Active authoritative specification | Retained stable path; stale status/context corrected, technical rules preserved |
| `docs/VISUAL_ASSET_POLICY.md` -> [VISUAL_ASSET_POLICY.md](../../VISUAL_ASSET_POLICY.md) | Active authoritative specification | Retained stable path; stale status/context corrected, technical rules preserved |
| `docs/ZONE_GEOMETRY_INTERACTION_RESULTS.md` -> [ZONE_GEOMETRY_INTERACTION_RESULTS.md](../reports/ZONE_GEOMETRY_INTERACTION_RESULTS.md) | Historical implementation report | Moved; original evidence retained, history banner and links updated |
| `docs/ZONE_GEOMETRY_INTERACTION_SPEC.md` -> [ZONE_GEOMETRY_INTERACTION_SPEC.md](../../ZONE_GEOMETRY_INTERACTION_SPEC.md) | Active authoritative specification | Retained technical rules; links updated where needed |
| `docs/archive/completed-tasks/CODEX_PHASE_01_DOCUMENTATION_TASK.md` -> [CODEX_PHASE_01_DOCUMENTATION_TASK.md](../completed-tasks/CODEX_PHASE_01_DOCUMENTATION_TASK.md) | Superseded proposal or completed task | Retained provenance; potential review candidate, no deletion |
| `docs/archive/completed-tasks/CODEX_PHASE_02_DATASET_MIGRATION_TASK.md` -> [CODEX_PHASE_02_DATASET_MIGRATION_TASK.md](../completed-tasks/CODEX_PHASE_02_DATASET_MIGRATION_TASK.md) | Superseded proposal or completed task | Retained provenance; potential review candidate, no deletion |
| `docs/archive/completed-tasks/PHASE_02_DATASET_MIGRATION_INVENTORY.md` -> [PHASE_02_DATASET_MIGRATION_INVENTORY.md](../completed-tasks/PHASE_02_DATASET_MIGRATION_INVENTORY.md) | Superseded proposal or completed task | Retained provenance; potential review candidate, no deletion |
| `docs/archive/design/DATA_MODEL_DRAFT.md` -> [DATA_MODEL_DRAFT.md](../design/DATA_MODEL_DRAFT.md) | Superseded proposal or completed task | Retained provenance; potential review candidate, no deletion |
| `docs/archive/installation/SCHEMA_INSTALL.md` -> [SCHEMA_INSTALL.md](../installation/SCHEMA_INSTALL.md) | Superseded proposal or completed task | Retained provenance; potential review candidate, no deletion |
| `docs/archive/json-proposals/README.md` -> [README.md](../json-proposals/README.md) | Superseded proposal or completed task | Retained provenance; potential review candidate, no deletion |
| `examples/README.md` -> [README.md](../../../examples/README.md) | Active developer/provenance guide | Retained version boundaries and authoring/fixture provenance |
| `examples/v1_2/README.md` -> [README.md](../../../examples/v1_2/README.md) | Active developer/provenance guide | Retained version boundaries and authoring/fixture provenance |
| `tests/fixtures/legacy_examples/README.md` -> [README.md](../../../tests/fixtures/legacy_examples/README.md) | Active developer/provenance guide | Retained version boundaries and authoring/fixture provenance |
| `tests/fixtures/v1_1/README.md` -> [README.md](../../../tests/fixtures/v1_1/README.md) | Active developer/provenance guide | Retained; stale live-Demo path/version corrected |
| `tests/fixtures/v1_2/README.md` -> [README.md](../../../tests/fixtures/v1_2/README.md) | Active developer/provenance guide | Retained version boundaries and authoring/fixture provenance |
| `tests/fixtures/v1_3/README.md` -> [README.md](../../../tests/fixtures/v1_3/README.md) | Active developer/provenance guide | Retained version boundaries and authoring/fixture provenance |

New documents: [PROJECT_STATUS](../../PROJECT_STATUS.md), [LOCAL_DEVELOPMENT](../../LOCAL_DEVELOPMENT.md), [archive index](../README.md) and this audit. Each has one navigation, status, operating or evidence role.

## Reference preflight and preservation

Before moves, all tracked text was searched for each exact filename and full path, including source, tests, scripts, runtime errors, workflow, Markdown links/fragments and agent instructions. The sixteen report filenames had documentation-only consumers. Relative links were resolved from the old location, mapped to the destination and rebased from the new location. Existing heading fragments were retained. The old 4.2 planned-section fragment remains as an explicit compatibility anchor.

The code-consumed `docs/NAVIGATION_AUTHORING.md`, `docs/MANUAL_AUTHORING.md` and `docs/HISTORICAL_RESOLVER.md` stay in place. Active specifications, the accepted v1.3 PROPOSAL filename and heavily linked roadmaps also stay put. No relocation required application/test/script modifications.

## Outdated statements corrected

- Pending final Checkpoint 4 integrated acceptance and unresolved Stage 5 closure requirements: now complete acceptance and explicit nonblocking deferral.
- Architecture Phase 6 called a current authorization: now completed history; no new work order.
- v1.3 guide saying Phase 5 and later unauthorized, and Cantum guide saying Phase 3B proposed: completed architecture status is centralized.
- Repository tree claiming NEXUS PNG integration deferred/excluded and only fifteen SVGs admitted: corrected to approved sixteen SVGs, three PNGs, eight MP3s and two UI JSON modules.
- Viewer authority still describing active v1.2 and Canon plan describing three-system viewer: corrected active v1.3/four released charts, preserving legacy contracts.
- Calibration prose treating old 24/18 radii and an in-memory-only/four-resource preview as current: historical context distinguished from shared 24-ly Demo and finite registered JSON previews.
- Frozen v1.1 guide pointing new tests at removed `examples/demo_atlas`: corrected current test/Demo separation.
- Old reports claiming hosted CI unverified: retained as historical evidence; current main post-merge Ubuntu/Windows success is recorded in PROJECT_STATUS.

## Potentially obsolete material retained for creator review

| Candidate | Why review later / why retained now |
| --- | --- |
| `archive/installation/SCHEMA_INSTALL.md` | Obsolete installation commands could mislead; retained provenance with an explicit do-not-execute banner |
| `archive/design/DATA_MODEL_DRAFT.md` | Superseded v0.2 shapes; retains identity/InfoCard/null design origins |
| All eight `archive/json-proposals/*.json` | Obsolete standalone examples, no positive runtime consumer; names/provenance remain in their [inventory](../json-proposals/README.md). No JSON changed |
| Completed Phase 1/2 task files and migration inventory | Redundant as instructions, useful dependency/rollback provenance; archived and non-authorizing |
| `archive/reports/VIEWER_PROTOTYPE.md` | Old setup/implementation summaries overlap current guides; retained for checkpoint evidence and compatibility history |
| Repeated completion paragraphs in retained roadmaps/spec amendments | Dated provenance; a later editorial pass could extract more history, but broad rewrites/moves would create avoidable churn now |

The active v1.3 PROPOSAL guide, versioned schemas, fixtures, CLI recovery guides and historical limitations are **not deletion candidates**. The IDE-mentioned `diagnose.yml` is absent from this checkout; no replacement or CI change was invented.

## Verification and remaining ambiguities

Local Windows Node 24.22.1 verification: **370/370 tests passed**, zero failures/skips/cancellations. `connections:check`, `validate`, `build`, `history:demo`, `idfind -- all`, `release:check` and whitespace checks passed. The audited build remains **39 files / 5,399,246 bytes**, including the same sixteen SVGs, three PNGs and eight MP3s. Browser/device suites were not rerun for this documentation-only maintenance.

The Markdown audit checked **58 files and 534 local links**, including relative destinations, exact path case, duplicate-heading fragments and explicit anchors: **zero broken links**. All seven external linked pages returned HTTP 200. All 13 documented `npm run` script names matched `package.json` (with `npm test` checked separately); referenced current document/script paths were checked against tracked paths. Historical code spans and examples were reviewed separately rather than rewritten as executable current instructions. Historical inline-code paths may name pre-migration locations, supplied private reference filenames, examples of future files or ignored local artifacts; these are explicitly provenance/examples, not runnable links. Public Markdown links must resolve with exact case and valid fragments. No private reference was read or published.

All 256 tracked non-Markdown Git blobs were verified unchanged, and JSON/SVG/PNG/MP3 source bytes match their original Git blobs. Report-body comparisons confirmed all sixteen original texts are preserved apart from link destinations and archive annotations. No runtime, test, schema, dataset, generated navigation, visual/audio asset, dependency, lockfile or CI source changed. Production/publication boundaries remain intact. Checkpoint 5 and all other implementation work are outside this PR.
