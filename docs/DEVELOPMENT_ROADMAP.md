# Velara Atlas — Development roadmap

**Status:** Architecture Phase 2 is committed at `6e026cb` (2026-10-20),
preserving the visual/runtime baseline from `190bd21`. Checkpoint 4.1
Phases 1–3 are complete and creator-approved. The local noncanonical demo also
includes the sector grid, Cantum Stages 1–4 and intermediate scale calibration,
retaining Checkpoint 3.8 zones, labeling, v1.2 navigation and Checkpoint 3.6 layout.
The system grid uses Y = 0 CNU. [Maintenance evidence](POST_PHASE3_MAINTENANCE.md)
records the earlier creator-approved System C navigation/discovery baseline.
Checkpoint 4.2 visual refinement, Cantum Stage 5, canonical migration and
deployment remain separately gated.

**Architecture status:** Phases **1, 2 and 2.1 are complete**; **Phase 2.2 is
complete and creator-approved**. Phase 2.1 is committed in `711a410`. The v1.2
examples now use ten focused entity-family references and one guide; the active
demonstration remains in `public/datasets/demo/`. Architecture Phase 2.2 was committed in `8d88ef2`.
Architecture Phase 3A–3F is now planned in detail; no implementation has started, and each checkpoint requires a separate creator authorization. See the [architecture optimization roadmap](ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md)
and [documentation index](INDEX.md). That roadmap is a separate architecture
workstream; this document retains feature milestones and their approval gates.
Architecture phases, Checkpoint 4.1 phases and Cantum stages are distinct.
The [Phase 2 report](PHASE_02_DATASET_MIGRATION_RESULTS.md) preserves point-in-time
evidence. **Architecture Phase 3 has NOT started** and requires separate creator
approval. The governing-Cantum influence and one shared `radiusLY` are proposed for Phase 3D, not implemented; the current per-Cantum `radiusLY` is unchanged. Faction/InfoCard resolution and dated Cantum governance are proposed for Phase 3C.

Earlier evidence remains in
[the repository audit](REPOSITORY_AUDIT_3_6.md) and checkpoint reports.

**Completed focused authorization:** following the approved SVG family at `eca903b`,
standardize only the sector grid to unnumbered 8×8 on `map.planeY`, with one
bottom-right light-year cell-width arrow. System View keeps its A–H/1–8 grid,
absolute Y=0 CNU and H8 measurement. Cantum presentation, chart dimensions and
authored positions are unchanged. Icon-minimum adjustments in `visual-config.mjs`
are reserved for the creator; further visual development is outside this task.

**Completed authorization — Cantum Visual Patch Stage 1:** floor-mounted names
were replaced with camera-facing DOM nameplates, retaining
component X/Z placement and contributor-based provisional height. That stage
preserved the then-pending sector grid work, flat fields, icons, data and
navigation. Sigils, envelopes and detached-island rules followed in Stages 2–4.
See [implementation and verification](CANTUM_NAMEPLATES_STAGE1_RESULTS.md).

## Approved foundations and design

**Implemented and committed — intermediate Cantum scale calibration:** `190bd21`
contains Stage 4 and calibration. Sector spheres use 8 CSS pixels with usable
invisible targets and tightened caption offsets; the provisional envelope
half-height is `clamp(radiusLY * .30, .5, 3)`. The separate loopback preview
compares 2/2.5/3-ly radii in a synthetic 40-ly in-memory scenario, not demo JSON.
Existing demo radii, coordinates and all System View scales remain unchanged.
No permanent canonical radius is selected. Stage 5 remains deferred.
The [calibration report](CANTUM_SCALE_CALIBRATION_RESULTS.md) preserves its
original uncommitted-work context and historical verification claims.

**Implemented and committed — Cantum Visual Patch Stage 4:** Stages 1–3 are
creator-approved. Stage 4 preserves full-name fitting and adds registered sigil-only
identities for sufficiently resolved small islands, using the existing field
components and DOM nameplate lifecycle. Fixed overview fitting avoids camera
classification flicker; local envelope sampling preserves separate island heights.
No data, SVG, schema, grid or influence-geometry changes. Stage 5 final refinement,
canonical migration and deployment remain deferred.
[Stage 4 verification](CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md) is historical
evidence from before the combined `190bd21` commit, not today's worktree status.

**Completed authorization — Cantum Visual Patch Stage 3:** Stages 1–2 are
creator-approved. Perspective envelopes now visualize the unchanged 2D field,
with bounded contributor-Y shaping, local nameplate heights and restrained capped
compositing. Top-down stays unchanged. Stage 4 was deferred at that checkpoint;
Stage 5 final refinement remains planned. See
[Stage 3 verification](CANTUM_ENVELOPES_STAGE3_RESULTS.md).

**Completed authorization — Cantum Visual Patch Stage 2:** Stage 1 has been
reviewed and approved. Add the optional current v1.2 sigil identifier, one explicit
noncanonical demo SVG, secure bundling and integration with existing nameplates.
Stage 3 flattened influence envelopes and Stage 4 sigil-only detached-island
rules were deferred at that checkpoint and subsequently authorized separately.
Grid, influence and navigation behavior were preserved. See
[Stage 2 verification](CANTUM_SIGILS_STAGE2_RESULTS.md).

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
| Checkpoint 4.1 Phase 3 | Physical radii, projected SVG proxies, 14 starter icons, bounded physical inspection and explicit asset bundling; [verification](CHECKPOINT_4_PHASE3_RESULTS.md); creator-approved |
| Post-Phase-3 maintenance | Synchronize tests/docs with creator-approved System C changes; preserve current authored data |
| Sector grid and Cantum Stages 1–4 | Implemented; Stage 4 included in `190bd21`, alongside the intermediate calibration |
| Intermediate Cantum scale calibration | Committed in `190bd21`; 8px Sector symbols, provisional envelope clamp and isolated in-memory preview; no canonical radius decision |
| Checkpoint 4.2 — Visual Identity and SVG Icon Refinement | Further visual refinement requires separate approval; not authorized by the completed architecture Phase 2.2 or its closeout |
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
neutral unknown fallbacks and Focus Selection inspection; it has been reviewed
and approved. The original four-phase plan reserved further visual/browser
refinement for Phase 4. Further Checkpoint 4.2 visual refinement requires separate
approval; architecture Phase 2.2 example simplification is complete and
creator-approved. Its closeout does not authorize further visual work.
The NEXUS side-profile PNG is supplied at
`public/assets/nexus/nexus-side-profile.png`; its integration remains deferred.
Preserve the current creator-approved System C geography,
IDs/history, navigation workflow, labels/zones, asset paths and build disclosure
boundaries. Use supplied curator assets only as authorized; do not invent them.

This roadmap is not authorization to create assets now. Follow
[NEXUS identity](NEXUS_VISUAL_IDENTITY.md) and [asset policy](VISUAL_ASSET_POLICY.md).

## Subsequent publication and separate workstreams

Checkpoint 5 covers static build/deployment review, repository-subpath URLs,
runtime/fallback behavior, disclosure audit, accessibility and performance.
GitHub Pages is a target host, not an active deployment.

Canonical v0.1 → proposed modern schema migration remains a **separate creator-approved workstream**
requiring an explicit permanent-ID crosswalk and historical review. Never promote
demo systems, coordinates, routes or statistics to canon. See
[migration safeguards](LEGACY_MIGRATION_PLAN.md).

A general publication pipeline, larger dataset loader, moon-relative coordinates,
orbital simulation, exact legal boundaries and the local editor remain outside
the current task. Preserve the existing authoring/recovery workflow and ID Finder.
Stop after the currently approved phase; no automatic commit/push/merge/deploy.
