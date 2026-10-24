# Velara Atlas — Codex working instructions

This file governs AI-assisted changes in this repository. Read it before making edits. Keep it concise; detailed decisions live in `docs/`.

## Current original-roadmap planning authority (updated 2026-10-24)

[DEVELOPMENT_ROADMAP](docs/DEVELOPMENT_ROADMAP.md#checkpoint-42--nexus-visual-and-audiovisual-completion-planned)
defines nine separately gated Checkpoint 4.2A–I phases, followed by final
Checkpoint 4 creator acceptance and the pending Cantum Stage 5 decision.
**4.2A–F are complete and creator-approved (2026-10-23), as is 4.2G (2026-10-24);
4.2H–I remain planned,
unimplemented and unauthorized**. The approved documentation foundation **does not**
grant permission to implement or close out any phase.

For a *separately creator-authorized* phase, inspect current `main`,
read the phase and linked NEXUS/viewer/asset/architecture specifications,
implement only the named scope, test normal NONCANONICAL Demo and
applicable regressions/browser/release audits, and stop for creator
visual review **without commit or push**. Only after explicit
creator approval may a separate closeout verify, synchronize docs,
commit one approved phase and push normally to `origin/main` if
separately authorized. Never automatically advance; preserve history,
Canon/Demo boundaries, safe assets and all non-negotiable rules below.

The prior Architecture Phase 6 authorization mentioned below is
a **completed historical task**, not a current implementation order.
Checkpoint 5 publication, Canon migration and Atlas Creator remain
separately gated.

## Mission and current scope

**Architecture status:** Phases 1, 2, 2.1, 2.2, 3A, 3B, 3C, 3D, 3E, 3F, 4, 5 and 6 are complete and creator-approved.
Phase 3F implementation, approved Demo showcase and completion documentation
are committed together. Overall Architecture Phase 3 is complete. The simplified v1.2 reference library
remains in `examples/v1_2/`, and the active noncanonical Demo remains in
`public/datasets/demo/`. Development supports registered named JSON scenarios and replayable presets.
The original calibration remains selectable and unchanged.
Canon is future approved MCR data, with no launcher or noncanonical fallback.

**Historical completed Phase 6 authorization (not current authority):** creator-approved Phase 6 final verification, documentation
closeout, one completion commit and normal push only. Phase 6 implementation and
status synchronization enter history together. The existing Architecture
Optimization Roadmap is complete; no next development milestone is authorized.
Deployment, Canon migration and Atlas Creator require separate explicit approval.
Synthetic performance fixtures remain test-only, separate from the noncanonical
read-only Demo and specialized Development previews.
Preserve the original calibration JSON, Demo/Canon, schemas, history/navigation,
Phase 4 defaults and publication restrictions. No editor, save endpoint or arbitrary
filesystem/dataset selector is authorized.
No deployment, Canon migration or graphical Atlas Creator is authorized.
The local system-authoring CLI exists; no graphical Atlas Creator is implemented.
Canon migration and editor development remain unauthorized. See
`docs/MANUAL_AUTHORING.md` for the preview/apply/recovery workflow.
Every newly created short-range gate starts with `position: null` and
`positionMode: "boundary_derived"`; the author creates gate records/anchor
relationships, and the offline generator later writes XYZ and the graph.
Report directly; create no new phase task. The current request explicitly permits
`docs/PERFORMANCE_AND_RELEASE_READINESS.md` as the Phase 6 evidence/operating guide.
Preserve active demo/canonical data, frozen fixtures, all established schemas, runtime/tools behavior,
build/dev restrictions, generated navigation, IDs/history/units and calibration behavior.
Preserve frozen v1.2 per-Cantum radii. The active v1.3 Demo uses one required
`presentation.territoryOverlay.radiusLY: 24`, a provisional noncanonical setting. Stage 4 and calibration are committed in `190bd21`: 8px Sector
symbols, usable invisible targets, provisional `clamp(radiusLY * .30, .5, 3)`
half-height and the isolated 40-ly local preview (now backed by calibration JSON). Do not select a canonical
radius. Completed Phase 3A contains only command separation, the local calibration
JSON adapter, focused tests and operating documentation. Completed Phase 3B
adds the sector-derived validated inventory and eager Demo loader/build mapping.
Only Demo is configured for the graphical viewer; no arbitrary roots or runtime
Demo JSON fetching. Development reads only finite registered preview JSON. Calibration
editors, schema/territory redesign and Cantum Stage 5 refinement remain unauthorized.
Completed Phase 3C adds a separate proposed v1.3 schema, faction registry and
pure historical reference/governance helpers, activated in the creator-approved Phase 3D Demo; see `docs/DATA_MODEL_V1_3_PROPOSAL.md`.

Build a maintainable historical, interactive atlas for the fictional MCR / The New World setting, presented through NEXUS. The local read-only Three.js/Vite viewer includes Checkpoint 3.8, cartographic labeling, version-aware v1.2/v1.3 navigation and the Checkpoint 3.6 layout, using only the noncanonical demo. The system grid uses absolute Y = 0 CNU. The target host is GitHub Pages; no deployment is implemented. Checkpoint 4.1 Phases 1–3 are complete and creator-approved. The creator subsequently approved the committed System C navigation and discovery-date changes at `16668e2`. Preserve that data baseline and the Stage 4/calibration implementation committed in `190bd21`. Phase 2 dataset organization is committed in `6e026cb`; Phase 2.2 example simplification is complete and creator-approved. Architecture Phases 3A, 3B, 3C, 3D, 3E and 3F are complete and creator-approved; overall Architecture Phase 3 is complete. Architecture Phase 4 is complete and creator-approved. Phase 5 is complete and creator-approved. Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization. Further visual development, canonical migration, deployment and the deferred editor remain unauthorized.

## Read first

For future authorized architecture work, follow the current creator request and use `docs/INDEX.md` to
separate active authority from completed tasks and historical evidence. The
technical read-first references remain:

1. `README.md` — public project status and run commands.
2. `docs/ARCHITECTURE.md` — implemented module responsibilities, future components and security boundary.
3. `docs/REPOSITORY_STRUCTURE.md` — file ownership and publication rules.
4. `docs/DATA_RULES.md` — existing chronology, identity, and disclosure rules.
5. `docs/DATA_MODEL.md`, `docs/DATA_MODEL_V1_3_PROPOSAL.md` and `schemas/atlas-v1_3.schema.json` — active v1.3 noncanonical Demo contract. `docs/NAVIGATION_AUTHORING.md` and `docs/SCHEMA_V1_2_NAVIGATION.md` govern shared navigation; `schemas/atlas.schema.json` and frozen v1.1/v1.2 fixtures retain their versioned contracts.
6. `docs/DEVELOPMENT_ROADMAP.md` and `docs/CONTENT_WORKFLOW.md` — milestones and safe extraction/release process.
7. `docs/VIEWER_SPECIFICATION.md` — viewer behavior, incorporating Checkpoint 3.6 square framing, floating panels, vertical History, centered dismissible InfoCards and hover-driven routes; `docs/LAYOUT_REVISION_3_6.md` explains this revision.
8. `docs/CANTUM_TERRITORY_RENDERING.md` — Approved rules for procedurally generated Cantum influence overlays, historical filtering, metaball blending, visual layering and rendering performance.
9. `docs/NEXUS_VISUAL_IDENTITY.md` — Approved Milestone 5: visual design, palette, targeting and NEXUS presentation.
10. `docs/VISUAL_ASSET_POLICY.md` — Approved visual asset fallback rules.
11. `docs/LEGACY_MIGRATION_PLAN.md` — Required approval before migrating public canonical records.
12. `docs/CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md` — Approved scale contract and Phase 3 renderer boundary; later phases require creator review/approval.

Use `docs/NAVIGATION_AUTHORING.md` for manual generation/recovery and README for
commands. `docs/HISTORICAL_RESOLVER.md` documents the pure API. Implementation
reports record evidence at a checkpoint; they do not override current contracts.
See `docs/REPOSITORY_AUDIT_3_6.md` for retained historical files and review candidates.

If a file is absent in the actual checkout, report that and work with available material instead of inventing its contents.

## Non-negotiable constraints

- **No invented canon.** Do not create official names, dates, statistics, affiliations, positions, political transitions, or narratives without creator approval. Use `null` or a clearly labeled noncanonical fixture where allowed. Do not reinterpret approximate dates as exact.
- **Permanent IDs:** distinguish identity from naming; preserve existing IDs. Names, political status, administrative assignment, and controlling polity can each have separate dated histories.
- **Timeline:** `fromAE` is inclusive; `untilAE` is exclusive; `null` ending means open-ended. The historical resolver must not depend on Three.js. Distinguish unknown/null dates from year zero; validate numeric years explicitly.
- **Public knowledge is not author knowledge.** A system may appear at its historical discovery date while opening a NEXUS fallback if its detail file has not been published. Only released objects and fields may enter public JSON, examples, documentation, browser bundles, logs, or committed history.
- **Private lore never goes in Git.** RTF source documents remain in a separate private folder; generated local text caches must be excluded from Git and the website build. `.gitignore` alone is not a confidentiality guarantee.
- **Preserve current behavior.** `src/timeline/resolve.mjs` and legacy tests preserve v0.1 canon. The modern historical resolver only gains authored static celestial diameter passthrough in Phase 3; eligibility/history semantics remain unchanged. Keep v1.1 regression coverage; v1.2 supersedes only its local-gate branching rule and navigation authoring contract.
- **Navigation source of truth:** v1.2 system objects author `navigation.localLinks` and `interstellarConnection`. `connections.json` is the generated, Git-tracked runtime index. Every connected short-range gate has one lifetime link and explicit `positionMode: "boundary_derived"`. All gate/hole types have at most one lifetime partner; no repointing. Run `npm run connections` manually, then `npm run connections:check`, tests/build, and review the diff. Only this offline command writes the graph and eligible short-range gate `position` fields; no sidecar, browser generation or build-time repair. Do not discard pending recovery journals/backups.
- **Coordinates:** sector space uses XYZ in light-years; individual system space uses local XYZ in CNU, universally 1 CNU = 10,000 kilometers. X/Z is the default map plane; Y is elevation. A coordinate of `null` means no canonical placement, not `(0,0,0)`. Optional celestial `physicalDiameterKm` is positive finite, omitted when unknown, independent of navigation boundaries and never inferred from type. Do not rescale existing coordinates or geometry.
- **Technology:** prefer vanilla JavaScript, ES modules, Three.js, Vite, and small focused Node tools. No backend is required for the GitHub Pages viewer. Do not add frameworks/dependencies or server-side authentication without approval.
- **Local editor:** never publish private content, credentials, or a publicly writable endpoint. Editor code may live in the source repository if the release build excludes it; local-only access is enforced by deployment/build design, not by hiding a button.

## Working method

1. Before significant changes, inspect the current files, `git status`, and existing tests; describe affected files and any canon/data migration implications.
2. Follow the accepted task boundary. **Do not implement future milestones without an explicit user instruction.** Architectural planning and docs review do not authorize a viewer/editor build.
3. Prefer the smallest backward-compatible change. If a breaking change is necessary, propose the migration, affected files, and rollback path first.
4. Treat `examples/` as noncanonical developer reference material; never promote an example to `public/data/` without approval.
5. For canon extraction, read source files without modifying them. Produce a **private candidate report** with filename/section support, uncertainty, and unresolved questions. Require the creator's approval before changing canonical JSON.
6. Validate JSON syntax, references, ID uniqueness, dated interval overlap, and no private-file leakage for any relevant change; add focused tests when behavior changes.
7. Run `npm test` after changes affecting data or code; run `npm run demo` when relevant. Report exact results and any commands not run.
8. Summarize modifications, key assumptions, unresolved questions, and any files needing creator approval. Do not claim an interactive viewer, deployed website, or security protection that hasn't been verified.

## Canon guardrails

The founding civilization is Drevnasel; the Visshum name, Drevnasel as the founding/capital Cantum, and unified name The Continuance emerge around the draft 360 A.E. display boundary. Cantums were initially **administrative divisions of a centralized republic, not federal sovereign states**. The 1200 A.E. atlas snapshot shows six sovereign Cantums, with Rekdolin a historic region within Okeanberg. Existing `datePrecision` notes qualify these boundaries; **never claim they are precise legal event dates**. Consult `public/data/political.json` and `docs/DATA_RULES.md` for specifics and known uncertainties.

The NEXUS visual identity is approved. Phase 3 uses original starter navigation SVGs and restrained procedural physical models. Completed, creator-approved 4.2A adds the unchanged MCR insignia in the header and NEXUS side-profile in ordinary InfoCards; completed 4.2B adds the front-facing archival portrait and universal approved text. Completed 4.2C uses the exact original reticle for cyan rotating hover/focus and static gold selection. Completed 4.2G reuses the original front-facing portrait and MCR insignia for the opening; audio and later refinement remain deferred. Never use proprietary Freelancer/Discovery artwork without appropriate permission.

## Current scope correction

Checkpoint 3.6's implemented layout supersedes permanent sidebars, bottom timeline
and selection-driven route highlighting. Its approved audit extension permits
documentation cleanup, but uncertain file deletions/moves remain proposals for
creator review. Preserve frozen schemas/fixtures, generators, IDs and historical
behavior. Phase 3 originally consumed the existing optional v1.2 diameter field
without schema or demo-data changes. Subsequent creator testing intentionally
changed System C navigation and discoveries; preserve the current committed
records, including derived gate positions. See `docs/POST_PHASE3_MAINTENANCE.md`.
The fallback system has no detail JSON
or extra loader. Keep `publicDir: false`; approved artwork inputs are only the
14 navigation SVGs, one explicit Stage 2 demonstration sigil and the two 4.2A PNGs
`public/assets/nexus/mcr-insignia.png` and `nexus-side-profile.png`. Preserve static
imports, pinned source hashes, exact binary output/name checks and reachability.
Completed, creator-approved 4.2B additionally admits
the unchanged `nexus-form.png` as an exact third PNG and the single universal
`public/content/nexus/fallback-data.json` module. Its three validated UI strings
replace optional/deprecated sector `nexusPresentation` consumption; only that
obsolete field was removed from active Demo. All three originals remain unchanged.
Completed, creator-approved 4.2C adds exactly `public/assets/ui/nexus-reticle.svg`
through independent pinned-hash UI admission, without relaxing the starter SVG
validator: sixteen SVGs and three PNGs total. Preserve its bytes, shared projected
anchors, 60px cyan/30s hover rotation, 72px static gold lock and reduced-motion
handling. Audio remains excluded; 4.2G reuses the admitted images for its approved
opening. Fixed radii never follow zoom;
navigational minima affect proxies only.

Completed, creator-approved 4.2D sets System View CSS minimum diameters centrally
to 42/36/30/24/21/18/15px (star/gas planet/other planet/moon/small body/structure/
short-range gate). Preserve 1 CNU = 10,000 km, the 1.35 handoff, physical geometry,
original hit targets, 8px Sector symbols and 4.2C reticles. The committed
`nexus-fallback-message.mp3` remains unchanged, reserved for 4.2H and excluded
from the application build; source-repository presence grants no audio authority.

Completed, creator-approved 4.2E animates Focus only: 550ms smoothstep, one
cancelable camera-owned RAF operation, exact existing inspection/zone/anchor
endpoints and immediate reduced-motion framing. Preserve input/command/history/
navigation/context-loss/disposal cancellation, intermediate free-camera snapshots
and the existing renderer. That phase adds no map-navigation effect to the camera.

Completed, creator-approved 4.2F owns a separate 420ms decorative chart reveal in
`map-transition.mjs`, with `cubic-bezier(.42,0,.58,1)` easing. `main.navigate()`
still commits history, scene replacement and camera restoration synchronously;
the effect never schedules navigation or interpolates between chart coordinates.
Preserve input/history/error/replacement/disposal cancellation, immediate reduced
motion, pointer transparency and the unchanged archival copy/portrait. 4.2H–I,
final Checkpoint 4 acceptance, Cantum Stage 5 and deployment remain separately gated.

Completed, creator-approved 4.2G (2026-10-24) adds the ready-only native opening
dialog, reusing original front-facing NEXUS/MCR images and the exact universal
`public/content/nexus/opening-data.json` script. Show once per successful fresh
page load; ordinary navigation/remount does not reopen it. Entry records only
in-memory `audio`/`silent` intent, with Escape silent; no storage or playback.
Preserve 240ms ease-out appearance, immediate entry/reduced motion, map focus,
unchanged historical/camera state and technical-error visibility. The closed
two-JSON input audit retains validation, redirect/mid-build-change rejection and
module completeness. No new binary asset is admitted. H–I remain separately gated.

Local visual editor is deferred, not part of the MVP. The v1.2 schema applies to noncanonical demo/reference records, not an automatic canonical migration. Canonical public v0.1 records and permanent IDs require a separate approved migration. Preserve committed Stage 4 and the intermediate Cantum scale calibration. Phase 2.2 example simplification is complete and creator-approved. Architecture Phase 3A is complete and creator-approved, with implementation and status synchronization included in the same closeout commit. Phase 3B is complete and creator-approved, with implementation and completion documentation committed together. Phase 3C is complete and creator-approved. Phase 3D is complete and creator-approved, with its implementation and completion documentation committed together. Phase 3E is complete and creator-approved, with its local authoring implementation and completion documentation committed together. Phase 3F integration and the noncanonical Demo showcase are complete and creator-approved; implementation and completion documentation enter Git history together. Architecture Phase 4 is complete and creator-approved, with implementation and status synchronization committed together. Phase 5 is complete and creator-approved, with implementation and status synchronization committed together. Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization. Further visual development, Atlas Creator, canonical migration and deployment remain unauthorized.

## Feature showcase policy

For future separately authorized viewer-facing development: implement -> automated
checks -> representative NONCANONICAL Demo -> creator visual review -> corrections
-> explicit creator approval -> separately authorized documentation/commit/push.
A significant visible feature needs a usable normal-Demo example when the existing
Demo cannot demonstrate it, unless the creator opts out. Internal refactoring,
security, documentation and nonvisual tooling do not need filler entities.
The read-only normal Demo provides representative graphical examples of completed
capabilities. Keep automated/invalid TEST fixtures, specialized Development/calibration,
curated Demo and protected future Canon physically separate. This policy permits
neither autonomous commits nor new canon. Never import temporary fixtures into Demo. See `docs/DEMO_SHOWCASE.md`.

## Viewer ownership and configuration

`main.mjs` composes `AppState` and focused catalogue, InfoCard, timeline and layer
owners. `AtlasMap` retains its facade and instrumentation while camera, picking,
scene layers and projected labels have explicit owners. `Lifetime` scopes
listeners/observers and disposal; pure historical logic remains in `src/core/`.
`createVisualConfig` admits only validated presentation values; units, IDs,
history, physical dimensions, navigation, territory radius and publication
safeguards are not tunables. See `docs/ARCHITECTURE.md` before extending owners.
The unchanged living Demo is the regression/visual review surface; later changes
and commits still require explicit creator authorization.
