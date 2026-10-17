# Velara Atlas

*A developing historical atlas of the Velara Sector, presented by NEXUS — the archivist of Maric Cosmic Records (MCR) / The New World.*

The Velara Atlas is an independent science-fiction worldbuilding and mapping project. Its aim is to make the history and geography of a fictional interstellar civilization explorable through an interactive navigational chart, inspired by the usability of classic space-game maps but with an original presentation.

> **Project status — Milestone 6, Checkpoint 3:** The local, read-only **noncanonical three-system demonstration** supports historical navigation, searchable records, routes, top-down/perspective cameras, spatial zones and approximate Cantum influence shading. Final visual polish, canonical migration, publication and the deferred local editor are not implemented.

The Checkpoint 3.6 layout refinement adds a centered square chart, floating panels,
vertical History and a dismissible centered InfoCard. See [layout rules and controls](docs/LAYOUT_REVISION_3_6.md)
and [verification results](docs/CHECKPOINT_3_6_RESULTS.md).

## The planned atlas

- **Sector view:** select a historical year (A.E.) and inspect discovered systems, changing regional/political context, and interstellar connections as the published records become available.
- **System view:** explore a navigational X/Z map with real Y elevation for stars, planets, stations, gates, and other mapped objects.
- **NEXUS archival interface:** an original in-universe visual design, searchable InfoCards, and an archival notice for systems whose detailed maps are not yet released.
- **Living archive:** systems can be known in-universe without yet having a finished public detail map. More information appears as MCR stories and canon are released.
- **Historical accuracy within the fiction:** names, discovery dates, affiliations, and political conditions are resolved for the selected year rather than displaying every object as though it always existed.

The intended public viewer will be **read-only and statically hosted**, initially on GitHub Pages. Atlas editing and private worldbuilding remain local. This separation is a planned architecture, not a claim that public deployment is active today.

## Repository at a glance

| Location | Contents |
| --- | --- |
| `public/data/` | Approved publicly distributable atlas records (currently a preliminary foundation) |
| `examples/` | Illustrative/noncanonical JSON data shapes and fixtures |
| `src/timeline/` | Existing historical resolver (v0.1) |
| `src/core/history.mjs` | Independent historical resolver (v1.1/v1.2 runtime records) |
| `src/core/cartography.mjs` | Pure historical catalogue, route and influence calculations |
| `src/viewer/` | Local demo-only Vite/Three.js prototype |
| `tests/` | Automated checks and a console timeline demonstration |
| `docs/DATA_RULES.md` | Historical conventions and known outstanding decisions |
| `docs/DATA_MODEL_DRAFT.md` | InfoCard and entity model examples; integration is not yet complete |
| `docs/ARCHITECTURE.md` | Design boundaries and proposed software components |
| `docs/REPOSITORY_STRUCTURE.md` | Repository and private-data organization |
| `docs/DEVELOPMENT_ROADMAP.md` | Planned milestones and acceptance criteria |
| `docs/CONTENT_WORKFLOW.md` | How source lore is reviewed, approved, and released |
| `AGENTS.md` | Rules for coding assistants working in this repository |

See the documentation before adding or changing historical records. Files in `public/data/` may include placeholders and approximate dates awaiting refinement; do not interpret all map-display boundaries as exact historical events.

## Run the local demonstration

Install a current supported [Node.js](https://nodejs.org/) version and run in the repository root:

```bash
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/Velara_Atlas/** (or the local URL printed by Vite). Select a system marker, then **Enter system**, or double-click the marker. Use **Sector View** to return. Drag empty map space to pan, scroll/pinch to zoom, or use the zoom/reset buttons. The Selection control provides keyboard access to the current map's entities; focused map canvas also accepts arrow keys and +/−.

Open **Map controls** for Selection, zoom/reset and camera mode. Open **History**
for the vertical slider and numeric year (0–1200, initially 1200 A.E.); the header
always shows the selected year. **Catalogue** searches only names valid then.
**Map layers** controls optional overlays. These panels never move the chart.
Close the centered InfoCard with its top-right button or Escape to clear selection
without resetting the camera. Hover a gate/route, or focus it with the keyboard,
to highlight active links; selecting it opens its record and destination actions.
System charts have A–H / 1–8 cells; H8 shows the navigation-sector width in CNU.
Reset fits the complete chart, and top-down pan/zoom stays within its bounds.

Switch to 3D and right-drag to orbit, or use Camera elevation. Political influence
shading is not a legal border. Shapes remain temporary category markers, not
physical dimensions or final artwork. See [implementation and limitations](docs/VIEWER_PROTOTYPE.md).

```bash
npm test
npm run validate
npm run demo
npm run build
npm run preview
```

`npm test` runs legacy history, frozen v1.1 regression checks, v1.2 schema/generation/recovery checks and prototype spatial/build-boundary tests. `npm run demo` remains the legacy **console** political-history demonstration; it is separate from the browser app. `npm run build` validates the fixtures, creates static `dist/` output and audits it. `npm run preview` serves that build at **http://127.0.0.1:4173/Velara_Atlas/**. These commands do not deploy anything.

The prototype uses Vite 6 (compatible with the installed Node 20.5.1) and Three.js. Use a supported Node LTS for ongoing development. Vite's `publicDir` is disabled: canonical `public/data/` is neither an application input nor automatically copied to `dist/`. The `/Velara_Atlas/` base prepares asset URLs for a future repository-subpath deployment; no GitHub Pages workflow is configured.

## ID Finder (read-only authoring utility)

```text
npm run idfind -- cb
npm run idfind -- all --demo
npm run idfind -- sys --public
```

Supported prefixes: `cb`, `gat`, `sta`, `jhl`, `sys`, `lnk`, `can`, `zon`, `sec`,
or `all` for a table. The default scope is `--demo`. The scanner reads only the
chosen dataset's sector/Cantum/connection registries and direct `systems/*.json`
files, including systems not yet indexed. References and presentation settings
do not count as definitions. Catalogue/detail system IDs and authored/generated
link pairs count once; generated-only link IDs remain used. It does not run the
navigation generator or check graph freshness (`connections:check` does that).

The highest numeric suffix is dataset-wide; suggestions use at least four digits
and never fill historical gaps, reserve IDs or change files. Public v0.1 legacy
IDs are listed separately without conversion; suggestions there apply only to
the numbered namespace, not to a canonical migration. Duplicate definitions,
malformed IDs and missing required files fail and withhold next-ID suggestions;
bad arguments also return nonzero. No unrelated examples, frozen test fixtures,
dependencies, build assets, documentation or private folders are traversed.

## Data and disclosure policy

The complete fictional canon is maintained privately in writing/source documents, currently including RTF files. The public repository holds only intentionally publishable material. Approved map records are extracted into JSON; unreleased story secrets and private source files must not be committed anywhere in this public repository, including tests and examples.

The historical date on a record describes **when that object or fact was known or applicable in-universe**. Publication is a separate editorial decision. A system can be visible on the sector overview while its detail view shows an NEXUS archival notice; a released system can also have only some of its objects published.

## Development

This project is being built incrementally using vanilla JavaScript, Three.js, Vite, JSON, and small local Node.js utilities. The data and timeline logic remain independent from the visual renderer so future interfaces can reuse the same history.

Consult [`docs/DEVELOPMENT_ROADMAP.md`](docs/DEVELOPMENT_ROADMAP.md) for the next milestones and [`AGENTS.md`](AGENTS.md) for AI-assisted development rules.

## Attribution and licensing

Velara, the Continuance setting, NEXUS, and associated MCR worldbuilding content belong to their respective creator(s). No third-party game assets are included by implication of design inspiration. **A public software/content license has not yet been selected**; do not assume the repository is licensed for reuse just because it is publicly visible. A `LICENSE` file can be added after that decision.

This is a fictional setting and a work in progress; the atlas does not claim to chart real astronomical positions.

## October 2026 update

Milestone 3 viewer design and Milestone 5 NEXUS visuals are approved. The local editor is deferred. The v1.2 schema applies to the noncanonical demo, with frozen v1.1 regressions retained; original public canonical v0.1 political records are intentionally unchanged. Install dependencies with npm ci, then use npm test to run historical and versioned data checks. See docs/LEGACY_MIGRATION_PLAN.md.

Milestone 6 Checkpoint 1 adds an engine-independent historical resolver for the noncanonical v1.1 demo in `src/core/history.mjs`. See [the API and usage notes](docs/HISTORICAL_RESOLVER.md). Checkpoints 2–3 add the local demonstration viewer and historical cartography. The legacy resolver and public canonical records remain unchanged. Checkpoint 4 needs separate creator approval.

## v1.2 navigation authoring (pre-Checkpoint-4)

The three-system NONCANONICAL demo now has two distinct Cantum presentation colors. System object declarations author navigation; `connections.json` is the generated, Git-tracked runtime index. Connected short-range gates are dedicated lifetime pairs with explicitly boundary-derived CNU positions. The original A/B Jump Gate and Jump Hole pairings remain; a separate new Jump Gate pair connects A/C. The viewer is read-only and does no generation.

```text
Edit system JSON -> npm run connections -> npm run connections:check -> npm test -> npm run build -> review git diff -> commit/push manually
```

Generation is a standalone offline manual command, restricted to the vetted demo allowlist. It writes only the complete graph and eligible short-range gates' `position` values in system JSON. Tests/dev/build run a read-only freshness check and fail on stale output. See [authoring, rounding, migration and recovery](docs/NAVIGATION_AUTHORING.md) and [verification results](docs/NAVIGATION_V1_2_RESULTS.md). Canonical data, the historical resolvers and renderer are unchanged; Checkpoint 4 needs separate approval.
