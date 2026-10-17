# Velara Atlas — Development roadmap

**Status:** Checkpoints 1–3, v1.2 navigation and Checkpoint 3.6 layout are
implemented in the local noncanonical demo. The current extension synchronizes
documentation and audits retention. Implementation and browser limits are
recorded in [the repository audit](REPOSITORY_AUDIT_3_6.md).

## Approved foundations and design

Milestones 1–5 established repository/disclosure rules, the structural data model,
the viewer specification, Cantum rendering, NEXUS identity and asset policy.
Schema v1.0 evolved through v1.1 to the current **v1.2 noncanonical contract**.
The local visual editor was deferred. Design approval does not authorize all
future implementation or canonical content migration.

## Milestone 6 implementation progression

| Stage | Implemented outcome / present status |
| --- | --- |
| Checkpoint 1 | Pure modern historical resolver and regression tests, separate from legacy v0.1 |
| Checkpoint 2 | Local Vite/Three.js read-only sector/system prototype, selection and navigation |
| Checkpoint 3 | Continuous chronology, catalogue/search, historical InfoCards/fallbacks, local/interstellar routes, real XYZ perspective, three zone geometries and Cantum influence |
| Pre-Checkpoint-4 navigation v1.2 | Object-authored links, exclusive lifetime gate pairs, boundary-derived local gate positions, manual offline generator, read-only freshness, three systems/two Cantums and safety tests |
| Checkpoint 3.6 | Centered square charts, full-map bounded 2D framing, A–H/1–8 system grid and H8 measurement, vertical History, floating panels, centered dismissible InfoCards and hover-driven routes |
| Checkpoint 3.6 audit extension | Repository inventory, documentation authority/status synchronization and retention proposals; no uncertain deletion/move |
| Checkpoint 4 | **Not started / requires explicit approval:** visual implementation described below |
| Checkpoint 5 | **Not started / requires explicit approval:** publication and security review |

Checkpoint 3.6 is saved in `7d9231c`; earlier navigation implementation is in
`4ff0ecb`. The current audit is uncommitted work for review. Passing checks does
not settle the documented post-gesture touch issue, physical-device testing,
full accessibility/cross-browser QA or large-dataset performance.

## Upcoming Checkpoint 4 — visual implementation

After a new instruction, implement original default SVG registry/fallbacks,
procedural celestial materials and approved size hierarchy, camera-facing
navigation markers, contextual targeting rings, accessible NEXUS styling and
responsive polish. Preserve square framing and overlay/InfoCard behavior.
Use supplied approved curator assets only when available; the intended
side-profile portrait is still absent. Do not invent or substitute it.

This roadmap is not authorization to create assets now. Follow
[NEXUS identity](NEXUS_VISUAL_IDENTITY.md) and [asset policy](VISUAL_ASSET_POLICY.md).

## Subsequent publication and separate workstreams

Checkpoint 5 covers static build/deployment review, repository-subpath URLs,
runtime/fallback behavior, disclosure audit, accessibility and performance.
GitHub Pages is a target host, not an active deployment.

Canonical v0.1 → v1.2 migration remains a **separate creator-approved workstream**
requiring an explicit permanent-ID crosswalk and historical review. Never promote
demo systems, coordinates, routes or statistics to canon. See
[migration safeguards](LEGACY_MIGRATION_PLAN.md).

A general publication pipeline, larger dataset loader, moon-relative coordinates,
orbital simulation, exact legal boundaries and the local editor remain outside
the current task. Preserve the existing authoring/recovery workflow and ID Finder.
Stop after Checkpoint 3.6 synchronization; no automatic commit/push/merge/deploy.
