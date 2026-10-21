# Velara Atlas — Codex working instructions

This file governs AI-assisted changes in this repository. Read it before making edits. Keep it concise; detailed decisions live in `docs/`.

## Mission and current scope

**Architecture status:** Phases 1, 2, 2.1, 2.2, 3A and 3B are complete.
Phase 3B is creator-approved; its implementation and completion documentation
are committed together. Overall Phase 3 is not complete. The simplified v1.2 reference library
remains in `examples/v1_2/`, and the active noncanonical Demo remains in
`public/datasets/demo/`. Development uses the JSON-backed local calibration.
Canon is future approved MCR data, with no launcher or noncanonical fallback.

**Current closeout authorization:** verify, synchronize documentation, stage,
commit and normally push only the reviewed Phase 3B inventory/loading work to
`origin/main`. No new feature development, merge, history rewrite or deployment.
Stop after the closeout commit, push and remote verification. Phase 3C is the
next proposed checkpoint and requires separate creator authorization.
Phases 3C-3F and 4-6 remain planned and separately gated; no faction, hierarchy,
universal-radius, v1.3, editor or canonical migration work is authorized.
Every newly created short-range gate starts with `position: null` and
`positionMode: "boundary_derived"`; the author creates gate records/anchor
relationships, and the offline generator later writes XYZ and the graph.
Report directly; create no new phase task or results Markdown file.
Preserve active demo/canonical data, frozen fixtures, all schemas, runtime/tools,
build/dev restrictions, generated navigation, IDs/history/units and calibration behavior.
Retain the per-Cantum `radiusLY` schema and demo values. A universal Cantum-radius
redesign remains a proposed Phase 3 design-review item, not an implemented feature. Stage 4 and calibration are committed in `190bd21`: 8px Sector
symbols, usable invisible targets, provisional `clamp(radiusLY * .30, .5, 3)`
half-height and the isolated 40-ly local preview (now backed by calibration JSON). Do not select a canonical
radius. Completed Phase 3A contains only command separation, the local calibration
JSON adapter, focused tests and operating documentation. Completed Phase 3B
adds the sector-derived validated inventory and eager Demo loader/build mapping.
Only Demo is configured; no arbitrary roots or runtime JSON fetching. Calibration
editors, schema/governance/radius redesign and Stage 5 refinement remain unauthorized.

Build a maintainable historical, interactive atlas for the fictional MCR / The New World setting, presented through NEXUS. The local read-only Three.js/Vite viewer includes Checkpoint 3.8, cartographic labeling, Schema v1.2 navigation and the Checkpoint 3.6 layout, using only the noncanonical demo. The system grid uses absolute Y = 0 CNU. The target host is GitHub Pages; no deployment is implemented. Checkpoint 4.1 Phases 1–3 are complete and creator-approved. The creator subsequently approved the committed System C navigation and discovery-date changes at `16668e2`. Preserve that data baseline and the Stage 4/calibration implementation committed in `190bd21`. Phase 2 dataset organization is committed in `6e026cb`; Phase 2.2 example simplification is complete and creator-approved. Architecture Phases 3A and 3B are complete and creator-approved; current authorization covers only the reviewed Phase 3B closeout commit/push. Further visual development, canonical migration, deployment and the deferred editor remain unauthorized.

## Read first

For future authorized architecture work, follow the current creator request and use `docs/INDEX.md` to
separate active authority from completed tasks and historical evidence. The
technical read-first references remain:

1. `README.md` — public project status and run commands.
2. `docs/ARCHITECTURE.md` — implemented module responsibilities, future components and security boundary.
3. `docs/REPOSITORY_STRUCTURE.md` — file ownership and publication rules.
4. `docs/DATA_RULES.md` — existing chronology, identity, and disclosure rules.
5. `docs/DATA_MODEL.md`, `docs/SCHEMA_V1_2_NAVIGATION.md`, `docs/NAVIGATION_AUTHORING.md` and `schemas/atlas.schema.json` — v1.2 noncanonical contract and authoring workflow. Frozen v1.1 regression fixtures/schema remain separate.
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

The NEXUS visual identity is approved. Phase 3 uses original starter navigation SVGs and restrained procedural physical models; final artistic refinement, elaborate targeting rings and curator imagery remain deferred. Never use proprietary Freelancer/Discovery artwork without appropriate permission.

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
or extra loader. Keep `publicDir: false`; only the 14 navigation SVGs and one
explicit Stage 2 demonstration sigil path may enter
the build. Fixed radii never follow zoom; navigational minima affect proxies only.

Local visual editor is deferred, not part of the MVP. The v1.2 schema applies to noncanonical demo/reference records, not an automatic canonical migration. Canonical public v0.1 records and permanent IDs require a separate approved migration. Preserve committed Stage 4 and the intermediate Cantum scale calibration. Phase 2.2 example simplification is complete and creator-approved. Architecture Phase 3A is complete and creator-approved, with implementation and status synchronization included in the same closeout commit. Phase 3B is complete and creator-approved, with implementation and completion documentation committed together. Stop after its authorized closeout commit/push and remote verification. Phase 3C and later implementation, future commits/pushes, further visual development and deployment require separate creator approval.
