# Velara Atlas

*A developing historical atlas of the Velara Sector, presented by NEXUS — the archivist of Maric Cosmic Records (MCR) / The New World.*

The Velara Atlas is an independent science-fiction worldbuilding and mapping project. Its aim is to make the history and geography of a fictional interstellar civilization explorable through an interactive navigational chart, inspired by the usability of classic space-game maps but with an original presentation.

> **Project status — visual/runtime baseline `190bd21` (2026-10-20):** The local, read-only **noncanonical demonstration has three released system charts and one archival-only system**. It includes Checkpoint 4.1 Phase 3 physical models/proxies and inspection, historical navigation, routes, cameras, clipped zones and v1.2 authoring, plus the sector grid, Cantum Stages 1–4 and intermediate scale calibration. Final artistic refinement, canonical migration, deployment and the deferred editor remain deferred.

Architecture Phases **1, 2 and 2.1 are complete**; **Phase 2.2 is complete and
creator-approved**. The v1.2 examples now use ten focused entity-family references
and [one main guide](examples/v1_2/README.md). The active demonstration remains in
`public/datasets/demo/`. Start with the [documentation index](docs/INDEX.md) and
[example entry point](examples/README.md). Phase 2 dataset organization is
committed in `6e026cb`, and Phase 2.1 in `711a410`; the
[Phase 2 report](docs/PHASE_02_DATASET_MIGRATION_RESULTS.md) retains its original
verification context. **Architecture Phase 3 has NOT started** and requires
separate creator approval under the [architecture roadmap](docs/ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md).
The universal Cantum-radius redesign remains a proposed Phase 3 design-review
item, not an implemented feature; current per-Cantum `radiusLY` behavior is unchanged.

The detailed charts are 100,000 CNU (A, central star), 80,000 CNU (B, offset star)
and 160,000 CNU (C, peripheral star). Representative celestial diameters are
authored in kilometers; **1 CNU = 10,000 km**. Known-size physical models use
those diameters; distant SVGs use category pixel minima. Focus Selection inspects
a body (including the 64-km asteroid), preserving selection; Reset View restores
normal chart navigation. Unknown sizes remain symbols. `sys_0004`, discovered at 900 A.E., has no
detail file and demonstrates the existing textual NEXUS archival notice.
See [Phase 2 data and verification](docs/CHECKPOINT_4_PHASE2_RESULTS.md).
See [Phase 3 rendering, evidence and inspection limits](docs/CHECKPOINT_4_PHASE3_RESULTS.md).
Phases 1–3 are creator-approved. Subsequent creator testing added a second local
transfer in System C (now ten objects) and advanced two discoveries to 610 A.E.;
see [the maintenance baseline](docs/POST_PHASE3_MAINTENANCE.md). Subsequent
[Stage 4](docs/CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md) and
[calibration](docs/CANTUM_SCALE_CALIBRATION_RESULTS.md) work is committed in
`190bd21`; those reports retain their original pre-commit circumstances.
Checkpoint 4.2 visual refinement and Cantum Stage 5 remain separately gated.
The supplied NEXUS side-profile PNG is available at
`public/assets/nexus/nexus-side-profile.png`; viewer integration remains deferred.

The Checkpoint 3.6 layout refinement adds a centered square chart, floating panels,
vertical History and a dismissible centered InfoCard. See [layout rules and controls](docs/LAYOUT_REVISION_3_6.md)
and [verification results](docs/CHECKPOINT_3_6_RESULTS.md).

Checkpoint 3.8 allows v1.2 system zones to extend beyond their chart. Only the
visible intersection is drawn and selectable; objects and routes win picking.
Hover a region for its name, select it for the existing InfoCard, or use Catalogue
and Focus to inspect an off-map-origin zone. See [zone rules and verification](docs/ZONE_GEOMETRY_INTERACTION_RESULTS.md).

## Atlas behavior

- **Sector view:** select a historical year (A.E.) and inspect discovered systems, changing regional/political context, and interstellar connections as the published records become available.
- **System view:** explore a navigational X/Z map with real Y elevation for stars, planets, stations, gates, and other mapped objects.
- **NEXUS archival interface:** an original in-universe visual design, searchable InfoCards, and an archival notice for systems whose detailed maps are not yet released.
- **Living archive:** systems can be known in-universe without yet having a finished public detail map. More information appears as MCR stories and canon are released.
- **Historical accuracy within the fiction:** names, discovery dates, affiliations, and political conditions are resolved for the selected year rather than displaying every object as though it always existed.

The viewer is read-only. Local Node tools support manual JSON authoring; private worldbuilding stays outside the public repository. GitHub Pages is the intended static host, with no deployment configured yet.

## Repository at a glance

| Location | Contents |
| --- | --- |
| `public/data/` | Protected legacy v0.1 canonical records; excluded from the demo build |
| `public/datasets/demo/` | Active public-safe noncanonical v1.2 runtime dataset |
| `examples/v1_2/` | Ten focused noncanonical entity-family references and their guide; excluded from runtime |
| `tests/fixtures/legacy_examples/` | Preserved legacy regression inputs |
| `docs/archive/json-proposals/` | Preserved obsolete JSON proposal shapes |
| `src/timeline/` | Existing historical resolver (v0.1) |
| `src/core/history.mjs` | Independent historical resolver (v1.1/v1.2 runtime records) |
| `src/core/cartography.mjs` | Pure historical catalogue, route and influence calculations |
| `src/viewer/` | Local demo-only Vite/Three.js prototype |
| `tests/` | Automated checks and a console timeline demonstration |
| `docs/DATA_RULES.md` | Historical conventions and known outstanding decisions |
| `docs/DATA_MODEL.md` | Current v1.2 structural model; schemas are the exact validation contract |
| `docs/NAVIGATION_AUTHORING.md` | Manual connection generation, validation and recovery |
| `schemas/` | Current v1.2 definitions/wrappers and frozen v1.1 regression schema |
| `scripts/` | Offline generation, validation, ID Finder and build audit |
| `docs/ARCHITECTURE.md` | Implemented modules, future work and disclosure boundaries |
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
**Cantum Names** toggles geographic region lettering independently of influence
shading in Sector View. **Object Names** toggles adaptive captions beneath markers
in both views; hover, keyboard focus and selection still identify objects.
See [labeling implementation and verification](docs/CARTOGRAPHIC_LABELING_RESULTS.md).
Close the centered InfoCard with its top-right button or Escape to clear selection
without resetting the camera. Hover a gate/route, or focus it with the keyboard,
to highlight active links; selecting it opens its record and destination actions.
System charts have A–H / 1–8 cells; H8 shows the navigation-sector width in CNU.
Reset fits the complete chart, and normal top-down pan/zoom stays within its bounds.

Switch to 3D and right-drag to orbit, or use Camera elevation. Political influence
shading is not a legal border. Sector and artificial-structure symbols are
navigational signs; known-size system celestial models use physical dimensions.
These starter visuals are not final artwork. See [implementation and limitations](docs/VIEWER_PROTOTYPE.md).

```bash
npm test
npm run validate
npm run demo
npm run build
npm run preview
```

`npm test` runs legacy history, frozen v1.1 regression checks, v1.2 schema/generation/recovery checks and prototype spatial/build-boundary tests. `npm run demo` remains the legacy **console** political-history demonstration; it is separate from the browser app. `npm run build` validates the fixtures, creates static `dist/` output and audits it. `npm run preview` serves that build at **http://127.0.0.1:4173/Velara_Atlas/**. These commands do not deploy anything.

Dependencies are pinned by `package-lock.json`; use `npm ci` and a supported Node LTS. Vite's `publicDir` is disabled: canonical `public/data/` is neither an application input nor automatically copied to `dist/`. The `/Velara_Atlas/` base prepares asset URLs for a future repository-subpath deployment; no GitHub Pages workflow is configured. The [Checkpoint 3.6 audit](docs/REPOSITORY_AUDIT_3_6.md) records earlier checks and limits; the [index](docs/INDEX.md) links subsequent evidence. Physical touch-device verification remains outstanding.

### Separate local calibration preview

Run `npm run preview:calibration`, then open
**http://127.0.0.1:5174/Velara_Atlas/__calibration/**.
This loopback-only tool generates 15 synthetic test stars **in JavaScript memory**
in `tests/calibration/scenario.mjs`: a 40 × 40 ly chart with independent 12-ly Y
extent and selectable 2/2.5/3-ly radii. It does not read demo JSON or save data.
`controller.mjs` resolves/displays the scenario, `index.html` defines its controls,
and `scripts/preview-cantum-calibration.mjs` serves those three explicit files.
The preview is excluded from production and is separate from normal `npm run dev`.
JSON scenario support is proposed for architecture **Phase 5**, not implemented.
No canonical radius has been chosen; see [architecture and isolation](docs/ARCHITECTURE.md).

## Schema v1.2 navigation authoring

Edit only the noncanonical demonstration under `public/datasets/demo/` for this
workflow. System-object `navigation.localLinks` and `interstellarConnection`
declarations are the authoring source; `connections.json` is a generated,
Git-tracked runtime index. Each physical gate/hole has at most one lifetime
partner. The viewer never generates links or gate positions.

```text
Edit system JSON
npm run connections
npm run connections:check
npm test
npm run build
git diff
```

The manual offline generator may rewrite only the complete connection index
and `position` of explicitly boundary-derived short-range gates in allowlisted
demo system files. Checks/dev/build fail on stale output and never repair it.
Review both system files and graph before any separately authorized commit/push.
See [practical authoring and recovery](docs/NAVIGATION_AUTHORING.md) and the
[approved design contract](docs/SCHEMA_V1_2_NAVIGATION.md).

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

## Documentation authority

Use the [roadmap](docs/DEVELOPMENT_ROADMAP.md) for checkpoint status,
[data model](docs/DATA_MODEL.md) and schemas for structure,
[viewer specification](docs/VIEWER_SPECIFICATION.md) for behavior,
[NEXUS identity](docs/NEXUS_VISUAL_IDENTITY.md) and [asset policy](docs/VISUAL_ASSET_POLICY.md)
for presentation, and [resolver API](docs/HISTORICAL_RESOLVER.md) for historical
selectors. [Canonical migration safeguards](docs/LEGACY_MIGRATION_PLAN.md) remain
a separate approval boundary. Older proposals and implementation reports are
retained as historical references, not current setup instructions.
