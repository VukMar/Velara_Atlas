# Velara Atlas

*A developing historical atlas of the Velara Sector, presented by NEXUS — the archivist of Maric Cosmic Records (MCR) / The New World.*

The Velara Atlas is an independent science-fiction worldbuilding and mapping project. Its aim is to make the history and geography of a fictional interstellar civilization explorable through an interactive navigational chart, inspired by the usability of classic space-game maps but with an original presentation.

> **Project status — foundation stage:** The repository currently contains JSON examples, historical/political records, and JavaScript timeline logic. **A public interactive map, Three.js viewer, and local visual editor have not yet been implemented.** Some example data is intentionally noncanonical.

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
| `tests/` | Automated checks and a console timeline demonstration |
| `docs/DATA_RULES.md` | Historical conventions and known outstanding decisions |
| `docs/DATA_MODEL_DRAFT.md` | InfoCard and entity model examples; integration is not yet complete |
| `docs/ARCHITECTURE.md` | Design boundaries and proposed software components |
| `docs/REPOSITORY_STRUCTURE.md` | Repository and private-data organization |
| `docs/DEVELOPMENT_ROADMAP.md` | Planned milestones and acceptance criteria |
| `docs/CONTENT_WORKFLOW.md` | How source lore is reviewed, approved, and released |
| `AGENTS.md` | Rules for coding assistants working in this repository |

See the documentation before adding or changing historical records. Files in `public/data/` may include placeholders and approximate dates awaiting refinement; do not interpret all map-display boundaries as exact historical events.

## Try the current foundation

Install a current supported [Node.js](https://nodejs.org/) version and run in the repository root:

```bash
npm test
npm run demo
```

`npm test` checks historical state resolution, names, Cantum status, and current fallback/object discovery behavior. `npm run demo` prints sample political states at selected A.E. years. No frontend server is needed for these commands. **There is no visual map to launch yet.**

## Data and disclosure policy

The complete fictional canon is maintained privately in writing/source documents, currently including RTF files. The public repository holds only intentionally publishable material. Approved map records are extracted into JSON; unreleased story secrets and private source files must not be committed anywhere in this public repository, including tests and examples.

The historical date on a record describes **when that object or fact was known or applicable in-universe**. Publication is a separate editorial decision. A system can be visible on the sector overview while its detail view shows an NEXUS archival notice; a released system can also have only some of its objects published.

## Development

This project is being built incrementally. Planned technologies are vanilla JavaScript, Three.js, Vite, JSON, and small local Node.js utilities. The data and timeline logic are deliberately independent from the visual renderer so future interfaces can reuse the same history.

Consult [`docs/DEVELOPMENT_ROADMAP.md`](docs/DEVELOPMENT_ROADMAP.md) for the next milestones and [`AGENTS.md`](AGENTS.md) for AI-assisted development rules.

## Attribution and licensing

Velara, the Continuance setting, NEXUS, and associated MCR worldbuilding content belong to their respective creator(s). No third-party game assets are included by implication of design inspiration. **A public software/content license has not yet been selected**; do not assume the repository is licensed for reuse just because it is publicly visible. A `LICENSE` file can be added after that decision.

This is a fictional setting and a work in progress; the atlas does not claim to chart real astronomical positions.

## October 2026 update

Milestone 3 viewer design and Milestone 5 NEXUS visuals are approved. The local editor is deferred. The v1.1 data schema applies to noncanonical examples; original public canonical v0.1 political records are intentionally unchanged. Install dependencies with npm ci, then use npm test to run both historical checks and v1.1 validation. See docs/LEGACY_MIGRATION_PLAN.md.

Milestone 6 Checkpoint 1 adds an engine-independent historical resolver for the noncanonical v1.1 demo in `src/core/history.mjs`. See [the API and usage notes](docs/HISTORICAL_RESOLVER.md). The legacy resolver and public canonical records remain unchanged; no viewer has been implemented.
