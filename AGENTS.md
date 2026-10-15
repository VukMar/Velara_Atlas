# Velara Atlas — Codex working instructions

This file governs AI-assisted changes in this repository. Read it before making edits. Keep it concise; detailed decisions live in `docs/`.

## Mission and current scope

Build a maintainable historical, interactive atlas for the fictional MCR / The New World setting, presented through NEXUS. The target is a **public, read-only GitHub Pages viewer**, backed by approved JSON, plus **local-only authoring/editing tools**. The atlas is not yet implemented as a Three.js application: the current repository is a data/timeline foundation.

## Read first

1. `README.md` — public project status and run commands.
2. `docs/ARCHITECTURE.md` — planned runtime components and security boundary.
3. `docs/REPOSITORY_STRUCTURE.md` — file ownership and publication rules.
4. `docs/DATA_RULES.md` — existing chronology, identity, and disclosure rules.
5. `docs/DATA_MODEL_DRAFT.md` — adopted InfoCard example shape; **draft integration contract**, not fully supported by the v0.1 resolver.
6. `docs/DEVELOPMENT_ROADMAP.md` and `docs/CONTENT_WORKFLOW.md` — milestones and safe extraction/release process.

If a file is absent in the actual checkout, report that and work with available material instead of inventing its contents.

## Non-negotiable constraints

- **No invented canon.** Do not create official names, dates, statistics, affiliations, positions, political transitions, or narratives without creator approval. Use `null` or a clearly labeled noncanonical fixture where allowed. Do not reinterpret approximate dates as exact.
- **Permanent IDs:** distinguish identity from naming; preserve existing IDs. Names, political status, administrative assignment, and controlling polity can each have separate dated histories.
- **Timeline:** `fromAE` is inclusive; `untilAE` is exclusive; `null` ending means open-ended. The historical resolver must not depend on Three.js. Distinguish unknown/null dates from year zero; validate numeric years explicitly.
- **Public knowledge is not author knowledge.** A system may appear at its historical discovery date while opening a NEXUS fallback if its detail file has not been published. Only released objects and fields may enter public JSON, examples, documentation, browser bundles, logs, or committed history.
- **Private lore never goes in Git.** RTF source documents remain in a separate private folder; generated local text caches must be excluded from Git and the website build. `.gitignore` alone is not a confidentiality guarantee.
- **Preserve current behavior.** `src/timeline/resolve.mjs` and `npm test` reflect v0.1. The v0.2 InfoCard examples are accepted templates, but adding InfoCard resolution/schema validation requires a deliberate migration and tests. Do not silently rewrite historical records or test expectations.
- **Coordinates:** sector space uses XYZ in light-years; individual system space uses separate local XYZ and declared units. X/Z is the default map plane; Y is elevation. A coordinate of `null` means no canonical placement, not `(0,0,0)`.
- **Technology:** prefer vanilla JavaScript, ES modules, Three.js, Vite, and small focused Node tools. No backend is required for the GitHub Pages viewer. Do not add frameworks/dependencies or server-side authentication without approval.
- **Local editor:** never publish private content, credentials, or a publicly writable endpoint. Editor code may live in the source repository if the release build excludes it; local-only access is enforced by deployment/build design, not by hiding a button.

## Working method

1. Before significant changes, inspect the current files, `git status`, and existing tests; describe affected files and any canon/data migration implications.
2. Follow the accepted task boundary. **Do not implement future milestones without an explicit user instruction.** Architectural planning and docs review do not authorize a viewer/editor build.
3. Prefer the smallest backward-compatible change. If a breaking change is necessary, propose the migration, affected files, and rollback path first.
4. Treat `examples/` as noncanonical demonstration/test data; never promote an example to `public/data/` without approval.
5. For canon extraction, read source files without modifying them. Produce a **private candidate report** with filename/section support, uncertainty, and unresolved questions. Require the creator's approval before changing canonical JSON.
6. Validate JSON syntax, references, ID uniqueness, dated interval overlap, and no private-file leakage for any relevant change; add focused tests when behavior changes.
7. Run `npm test` after changes affecting data or code; run `npm run demo` when relevant. Report exact results and any commands not run.
8. Summarize modifications, key assumptions, unresolved questions, and any files needing creator approval. Do not claim an interactive viewer, deployed website, or security protection that hasn't been verified.

## Canon guardrails

The founding civilization is Drevnasel; the Visshum name, Drevnasel as the founding/capital Cantum, and unified name The Continuance emerge around the draft 360 A.E. display boundary. Cantums were initially **administrative divisions of a centralized republic, not federal sovereign states**. The 1200 A.E. atlas snapshot shows six sovereign Cantums, with Rekdolin a historic region within Okeanberg. Existing `datePrecision` notes qualify these boundaries; **never claim they are precise legal event dates**. Consult `public/data/political.json` and `docs/DATA_RULES.md` for specifics and known uncertainties.

The public-facing NEXUS aesthetic and narrative are part of the project identity; detailed visuals have **not** been approved or implemented. Never use proprietary Freelancer/Discovery artwork as atlas assets without appropriate permission.
