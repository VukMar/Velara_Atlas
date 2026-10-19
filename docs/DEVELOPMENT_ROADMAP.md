# Velara Atlas — Development roadmap

**Status:** The local noncanonical demo implements through Checkpoint 3.8 zones,
cartographic labeling, v1.2 navigation and the Checkpoint 3.6 layout. The system
grid now uses Y = 0 CNU. Checkpoint 4.1 Phases 1–2 are approved. Phase 3 explicitly
authorizes physical models, SVG proxies/starter icons, inspection cameras and
verification against the unchanged three released systems and archival entry.
Phase 4 refinement, canonical migration and deployment remain unauthorized.
Earlier evidence remains in
[the repository audit](REPOSITORY_AUDIT_3_6.md) and checkpoint reports.

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
| Checkpoint 3.8 and follow-ups | Clipped interactive system zones, 2D hover contours distinguishing physical/chart edges, and the absolute Y = 0 system grid |
| Checkpoint 4.1 Phase 1 | Approved celestial scale specification, additive v1.2 diameter field and tests; no demo/renderer/assets changes |
| Checkpoint 4.1 Phase 2 | Authorized noncanonical demo expansion: 100K/80K/160K CNU charts, offset/peripheral stars, physical measurements, small bodies and one archival-only system; see [results](CHECKPOINT_4_PHASE2_RESULTS.md) |
| Checkpoint 4.1 Phase 3 | Physical radii, projected SVG proxies, 14 starter icons, bounded physical inspection and explicit asset bundling; [verification](CHECKPOINT_4_PHASE3_RESULTS.md); stop for creator review |
| Checkpoint 4.1 Phase 4 | Artistic refinement remains unauthorized |
| Checkpoint 5 | **Not started / requires explicit approval:** publication and security review |

Checkpoint 3.6 is saved in `7d9231c`; earlier navigation implementation is in
`4ff0ecb`. Those reports record their checkpoint's evidence, not current worktree
status. Passing checks does not settle physical-device testing, full
accessibility/cross-browser QA or large-dataset performance.

## Checkpoint 4.1 — phased celestial implementation

Follow [the celestial scale specification](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md).
Phase 1 records the universal 1 CNU = 10,000 km conversion, optional positive
celestial `physicalDiameterKm`, flexible system dimensions and the future
physical/proxy/apparent-minimum contract. It changes no authored demo measurements
or renderer behavior; that phase has been reviewed and approved.

Phase 2 is now explicitly approved and expands the three existing noncanonical
demo systems and adds a fallback-only sector entry with no detail file. Temporary
marker sizes in that phase did not represent physical diameters. Phase 2 has
been reviewed and approved. Phase 3 now implements correctly scaled celestial
models, continuous SVG-proxy transitions, fixed apparent structure markers,
neutral unknown fallbacks and Focus Selection inspection. Stop after Phase 3
verification for creator review. Future Phase 4 refines
systems, close/far transitions, mobile interaction, Y = 0 grid and existing
archival fallback. Review is required between phases. Preserve authored geography,
IDs/history, navigation workflow, labels/zones, asset paths and build disclosure
boundaries. Use supplied curator assets only as authorized; do not invent them.

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
Stop after the currently approved phase; no automatic commit/push/merge/deploy.
