# Velara Atlas — Architecture

**Status:** Proposed system architecture for review; foundation phase. **Not a claim of implemented features.**

## Purpose

The Velara Atlas is an independent JSON-driven, historical navigational atlas of the fictional Velara Sector. NEXUS presents a chronological public view. The complete authoring canon may contain more than the publicly released atlas. Design for long-lived IDs, testable history, selective publication, and replaceable presentation technology.

## Four responsibilities

| Responsibility | Input | Output | Location |
| --- | --- | --- | --- |
| Private source / authoring | RTF lore, private notes and approved decisions | Creator-reviewed candidate records | External private folder (not in public Git) |
| Historical resolver | Structured records and selected A.E. year | State valid for that year | `src/timeline/`, independently testable |
| Publication pipeline (planned) | Approved canonical data plus release allowlist | Public-safe JSON and assets | Local tools/scripts; output in `public/data/` |
| NEXUS viewer (planned) | Public JSON, date, selected map and viewport | Interactive read-only map and InfoCards | Three.js + browser interface; static Pages build |

The local visual editor (planned) modifies approved data while running on the creator's computer. It must not require an Internet-facing write endpoint. It should reuse core coordinate, selection and rendering rules; publishing changes remains an explicit separate step.

## Data relationships

- **Sector** is a geographical context and system index, **not** a government. It uses its own XYZ space (`positionLY`, light-years) and an era label resolved from political records.
- **Political history** tracks the unified state, historical era titles, and Cantums. A Cantum can exist as an administrative region long before being sovereign.
- **Star system** is a persistent identity in sector space. It contains discovery, naming and regional history and may point to a public details file.
- **System detail** is a local coordinate context (`position`, declared units) containing natural bodies and constructed objects, independently positioned above/below the X/Z navigation plane.
- **InfoCard** is a shared view model: `affiliation`, `class`, `crew`, `population`, `armament`, `description`, with historically dated records where populated. It is *not* the source of entity identity, political borders or object coordinates.
- **Connections and area volumes** (jump routes, jump holes, trade lanes, nebulae, asteroid fields, zone definitions) are planned schema expansions; exact data contracts are pending. Avoid inventing these in application code before approval.

`id` is permanent and independent of all names. Foreign keys refer to IDs. A rename is a dated name record, not a new entity. A system's Cantum administrative history, operating affiliation, and sovereign control should remain distinguishable rather than inferred from one field.

## Historical resolution

1. Input: a selected integer `yearAE` at/after the epoch start.
2. Filter discoveries/existence: a system or object appears only at the applicable knowledge/existence dates in the released data.
3. Choose interval records: `fromAE <= yearAE < untilAE`; open-ended `untilAE: null` remains active.
4. Resolve naming/status/InfoCard histories independently.
5. Return an immutable or safely derived state for the viewer. Do **not** mutate source JSON in response to slider movement.
6. Surface known uncertainty. An approximate map-display boundary is not a precisely attested legal or historical event.

The current `src/timeline/resolve.mjs` implements the basic v0.1 resolver. It does **not yet** support full v0.2 InfoCard resolution. Null discovery dates and validation behavior need explicit attention during migration; JS comparisons may accidentally treat `null` as zero.

### Disclosure and availability (distinct from chronology)

A system can have three user-visible outcomes for a selected year:

1. **Not chronologically known** — omitted from the sector view for that date.
2. **Known, details not published** — appears in sector overview if coordinates and public index allow it; selecting it shows NEXUS archival fallback (`publicDetailPath: null`).
3. **Known, partial/full published detail** — loads a public detail JSON containing only the objects and fields approved for release, filtered to the selected historical year.

**Critical:** history must not be used to reveal unreleased canon. A public website cannot securely hide JSON sent to its browser. Never put secret objects or plot spoilers into any served, bundled, or publicly committed file with `hidden: true`.

## Coordinates and rendering

- Sector: `{x, y, z}` in light-years, using X/Z for the top-down projected plane and Y as elevation.
- Individual system: independent XYZ coordinates, with local scale specified in each detail file. Do not assume interstellar distances and local distances share units.
- Default camera (planned): top-down orthographic over X/Z; switchable perspective tilt/rotation for depth inspection.
- Null position: unresolved canon placement; don't render a fake point at the origin.
- Planetary positions in v1 are static navigation-chart coordinates. Orbital motion/simulation is outside the initial scope and requires a separate proposal.
- Display icons/themes are presentation identifiers, not object identity or source data.

## Runtime and deployment (planned)

- **Viewer:** vanilla JS ES modules + Three.js; Vite for local development and static production build.
- **Host:** GitHub Pages with repository-relative `base` configured at build time. Browser reads static JSON/assets only; no public mutations, authentication, or server database.
- **Editor:** local tool, potentially served via Vite plus Node file-writing endpoint *bound to localhost only*, or JSON export/import. Editing capability must be absent/inaccessible in the public deployment; merely hiding buttons is insufficient.
- **Publication:** generate or review explicit public-safe JSON, validate it, test the build output, then commit/push. Build/deploy must never traverse private sibling folders or local caches.
- **Progressive loading:** sector overview first, individual system details on demand; cache already loaded public JSON for navigation.

## Risks to resolve before implementation

1. Existing v0.1 data shape vs adopted v0.2 InfoCard examples; define compatible migration and tests.
2. Canonical coordinates, local map units, and visual scale conventions remain undefined beyond the XYZ orientation.
3. Precise ownership/control versus administrative Cantum affiliation; do not infer one from another.
4. Public `sector.json` currently has an `editorialNotes` field. Remove/review editorial/private commentary before live deployment.
5. Lack of formal JSON Schema, cross-record integrity checks, explicit publication allowlist, and release validation.
6. Historical date uncertainties (see `DATA_RULES.md`); no automatic conversion of `circa`/`confirmed_by` into exact event dates.
7. License for software and lore has not been chosen; don't assume reuse rights.

See `REPOSITORY_STRUCTURE.md`, `CONTENT_WORKFLOW.md`, and `DEVELOPMENT_ROADMAP.md` for actionable ownership and implementation order.

## Current approved design state

Local visual editor deferred; the approved Milestone 3/5 specifications supersede references to pending visual decisions. Routes exist in v1.0+ schema, zones and optional display settings in v1.1; none of these constitutes a completed browser renderer. Canonical public v0.1 records await explicit creator-approved migration (docs/LEGACY_MIGRATION_PLAN.md).

Milestone 6 Checkpoints 2–3 now provide a local noncanonical viewer under src/viewer/, reusing src/core/history.mjs and pure cartography helpers. This supersedes the earlier foundation-only implementation status; it does not claim completion of final NEXUS visuals, deployment or canonical migration. See VIEWER_PROTOTYPE.md.

## Pre-Checkpoint-4 v1.2 navigation

The secured Checkpoint 3 baseline is extended by the approved noncanonical navigation task. System-object declarations are the authoring source of truth; manually generated, Git-tracked `connections.json` is the runtime index. `npm run connections` also updates only explicitly boundary-derived short-range gate positions; `connections:check` makes stale artifacts fail validation/build without repair. Frozen v1.1 regressions preserve older behavior. The demo has three systems and two Cantums. See [NAVIGATION_AUTHORING.md](NAVIGATION_AUTHORING.md). No canonical migration, editor, deployment or Checkpoint 4 visual work is included.
