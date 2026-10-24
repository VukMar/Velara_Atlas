# Velara Atlas

*A developing historical atlas of the Velara Sector, presented by NEXUS — the archivist of Maric Cosmic Records (MCR) / The New World.*

The Velara Atlas is an independent science-fiction worldbuilding and mapping project. Its aim is to make the history and geography of a fictional interstellar civilization explorable through an interactive navigational chart, inspired by the usability of classic space-game maps but with an original presentation.

> **Project status — visual/runtime baseline `190bd21` (2026-10-20):** The local, read-only **noncanonical demonstration has four released system charts and one archival-only system**. It includes Checkpoint 4.1 Phase 3 physical models/proxies and inspection, historical navigation, routes, cameras, clipped zones and version-aware v1.2/v1.3 authoring, plus the sector grid, Cantum Stages 1–4 and intermediate scale calibration. Final artistic refinement, canonical migration, deployment and the deferred editor remain deferred.

Architecture Phases **1, 2, 2.1, 2.2, 3A, 3B, 3C, 3D, 3E, 3F, 4, 5 and 6 are complete and
creator-approved**. Phase 3F implementation, approved Demo showcase and completion
documentation are committed together. Overall Architecture Phase 3 is complete. The v1.2 examples now use ten focused entity-family references
and [one main guide](examples/v1_2/README.md). The active demonstration remains in
`public/datasets/demo/`. Start with the [documentation index](docs/INDEX.md) and
[example entry point](examples/README.md). Phase 2 dataset organization is
committed in `6e026cb`, and Phase 2.1 in `711a410`; the
[Phase 2 report](docs/PHASE_02_DATASET_MIGRATION_RESULTS.md) retains its original
verification context. **Phase 3F integration and the curated Demo showcase are complete and creator-approved**, under
the [architecture roadmap](docs/ATLAS_ARCHITECTURE_OPTIMIZATION_ROADMAP.md).
The commands below distinguish local Development, graphical Demo and future Canon.
Architecture Phase 6 is complete and creator-approved; the existing architecture
optimization roadmap is complete. This does not mean the whole project is finished
or approved for deployment, Canon migration or Atlas Creator. See [performance and local release readiness](docs/PERFORMANCE_AND_RELEASE_READINESS.md)
for measured limits, local browser checks and the read-only CI matrix. No deployment is authorized.
Phase 3E provides safe local manual system authoring; Architecture Phase 4 viewer modularization/configuration is complete and creator-approved, with implementation and status documentation committed together. Phase 5 is complete and creator-approved. Completed Phase 3D activates v1.3
in the NONCANONICAL Demo: one required provisional 24-ly influence radius,
historical governing-Cantum groups and named InfoCard references. Frozen v1.2 examples, navigation and calibration stay compatible.

The detailed charts are 100,000 CNU (A, central star), 80,000 CNU (B, offset star)
and 160,000 CNU (C, peripheral star). Representative celestial diameters are
authored in kilometers; **1 CNU = 10,000 km**. Known-size physical models use
those diameters; distant SVGs use category pixel minima. Focus Selection inspects
a body (including the 64-km asteroid), preserving selection; Reset View restores
normal chart navigation. Unknown sizes remain symbols. `sys_0004`, discovered at 900 A.E., has no
detail file and demonstrates the dedicated NEXUS archival presentation.
See [Phase 2 data and verification](docs/CHECKPOINT_4_PHASE2_RESULTS.md).
See [Phase 3 rendering, evidence and inspection limits](docs/CHECKPOINT_4_PHASE3_RESULTS.md).
Phases 1–3 are creator-approved. Subsequent creator testing added a second local
transfer in System C (now ten objects) and advanced two discoveries to 610 A.E.;
see [the maintenance baseline](docs/POST_PHASE3_MAINTENANCE.md). Subsequent
[Stage 4](docs/CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md) and
[calibration](docs/CANTUM_SCALE_CALIBRATION_RESULTS.md) work is committed in
`190bd21`; those reports retain their original pre-commit circumstances.
Remaining Checkpoint 4.2 visual refinement and Cantum Stage 5 remain separately gated.

**Roadmap planning update (2026-10-23):** The
[original Milestone 6 roadmap](docs/DEVELOPMENT_ROADMAP.md#checkpoint-42--nexus-visual-and-audiovisual-completion-planned)
established nine separately gated phases 4.2A–I for NEXUS imagery, archival fallback,
final reticle, System symbols, camera/map transitions, opening,
two prerecorded voice situations and optional UI sounds last. The planning
foundation did not authorize implementation. Final Checkpoint 4 visual
acceptance includes the deferred Cantum Stage 5 decision. No phase,
publication, Canon migration or Atlas Creator work is automatically
authorized.

**Checkpoint 4.2A closeout (2026-10-23): complete and creator-approved.** The
unchanged MCR insignia now appears beside the header title; the supplied
`public/assets/nexus/nexus-side-profile.png` appears beside ordinary InfoCard
headings, reducing/hiding responsively before compromising text. Failed images
collapse gracefully. Static imports, pinned source hashes and exact binary output
checks admit only these two PNGs alongside the existing fifteen SVGs, with
`publicDir: false` and `/Velara_Atlas/` URLs preserved. Final checks pass 275 tests,
validation, connection freshness, build and release audit. The unchanged originals
add 1.75 MB; physical-device, non-Chromium and assistive-technology checks remain
limitations. See [4.2A results and limits](docs/DEVELOPMENT_ROADMAP.md#phase-42a--nexus-and-mcr-branding).
At the 4.2A closeout, **4.2B–I remained planned and unimplemented**. The front-facing
`nexus-form.png`, reticle and audio are not admitted by 4.2A; no deployment occurs.

**Checkpoint 4.2B closeout (2026-10-23): complete and creator-approved.** Known
systems without a published chart now show a dedicated nonmodal archival screen
with resolved historical name/year, the approved front-facing `nexus-form.png`
and Return to Sector. Edit only `public/content/nexus/fallback-data.json`
(`title`, `subtitle`, `message`) to change universal dialogue; deprecated optional
world `nexusPresentation` never overrides it. The creator-approved correction
adds exactly this third unchanged PNG, retaining fifteen SVGs and strict binary,
dataset and private-output audits. Technical failures/Retry remain distinct.
Final checks pass 281 tests and all validation/build/release gates; focused Demo
and production browser regressions pass. Small/short layouts scroll within the
square; physical devices, other browsers, screen readers and actual browser zoom
remain verification limits. See [4.2B results and approved wording](docs/DEVELOPMENT_ROADMAP.md#phase-42b--archival-fallback-redesign).
At the 4.2B closeout, 4.2C–I remained planned and unimplemented. Final Checkpoint 4
acceptance and Cantum Stage 5 remain outstanding; no deployment occurred.

**Checkpoint 4.2C closeout (2026-10-23): complete and creator-approved.** Both map
levels now use the unchanged original NEXUS reticle: cyan 60px hover/keyboard focus
rotating once per 30 seconds, and a static gold 72px selected lock. Reduced motion
disables rotation; existing projected visibility, focus, routes/zones, picking,
8px Sector markers and physical-size contracts remain intact. Independent pinned
UI-SVG admission preserves the narrow starter profile: sixteen SVGs and three
PNGs total. Final checks pass 283 tests, validation, connections, build and release
audit; Demo/production targeting and relevant browser regressions pass. See
[4.2C results and limits](docs/DEVELOPMENT_ROADMAP.md#phase-42c--unified-targeting-reticle).
At the 4.2C closeout, 4.2D–I remained planned and unimplemented. Final Checkpoint 4
acceptance and Cantum Stage 5 remain outstanding. Checkpoint 5, Canon migration,
Atlas Creator and deployment remain separately gated; no deployment occurred.

**Checkpoint 4.2D closeout (2026-10-23): complete and creator-approved.** System
navigational minimum diameters are now 42/36/30/24/21/18/15 CSS px for star/gas
planet/other planet/moon/small body/structure/short-range gate. Only the central
size table changes; physical models, CNU conversion, 1.35 handoff, hit targets,
8px Sector symbols and 60/72px reticles remain unchanged. All 284 tests and
validation/build/release gates pass, with normal Demo/production browser checks.
The 16-SVG/3-PNG inventory is unchanged. The repository MP3 remains untouched,
reserved for 4.2H and excluded from the application. See [4.2D results and limits](docs/DEVELOPMENT_ROADMAP.md#phase-42d--system-object-icon-sizing).
At the 4.2D closeout, 4.2E–I remained planned and unimplemented. Final Checkpoint 4
acceptance and Cantum Stage 5 remain pending; deployment, Canon migration and
Atlas Creator are not authorized.

**Checkpoint 4.2E closeout (2026-10-23): complete and creator-approved.** Focus
Selection uses a 550ms smoothstep camera movement, preserving the original
physical inspection, ordinary object and zone destinations. Manual input,
commands, history/navigation and teardown cancel safely; reduced motion applies
the final state immediately. All 306 tests and validation/build/release gates
pass, with normal Demo and production browser regressions. Asset admission is
unchanged (sixteen SVGs, three PNGs); the reserved 4.2H MP3 is unchanged and excluded.
See [4.2E results and limits](docs/DEVELOPMENT_ROADMAP.md#phase-42e--focus-selection-animation).
At the 4.2E closeout, 4.2F–I remained planned and unimplemented. Final Checkpoint 4
acceptance and Cantum Stage 5 remain pending; Checkpoint 5 deployment, Canon
migration and Atlas Creator are not authorized. No deployment occurred.

**Checkpoint 4.2F closeout (2026-10-23): complete and creator-approved.** Sector→
System, System→Sector and valid System→System actions now use a restrained
420ms dark/cyan chart reveal with `cubic-bezier(.42,0,.58,1)` easing. Navigation,
history, scene replacement and camera restoration still commit synchronously;
there is no simulated travel or camera flight. Input, Reset, Focus, mode/history
changes, rapid replacement, context loss and teardown cancel safely; reduced
motion skips the effect. Archival entry accents only the perimeter, preserving
the portrait/message and Return control. A–E behavior and asset bytes remain intact.
All 318 tests and validation/connection/build/release gates pass, with dedicated
Demo/production and existing browser regressions. The unchanged inventory is
sixteen SVGs and three PNGs; the reserved MP3 remains untouched and excluded.
See [4.2F results and limits](docs/DEVELOPMENT_ROADMAP.md#phase-42f--map-navigation-transitions).
At the 4.2F closeout, **4.2G–I remained planned, unimplemented and separately gated.** Final Checkpoint 4
acceptance and Cantum Stage 5 remain pending. Checkpoint 5, Canon migration,
Atlas Creator and deployment are not authorized. No deployment occurred.

**Checkpoint 4.2G closeout (2026-10-24): complete and creator-approved.** A ready-only
opening presents the unchanged front-facing NEXUS artwork and MCR insignia, the
approved [universal introduction](public/content/nexus/opening-data.json), and
`Enter with audio` / `Enter silently`. Both enter immediately without changing
the loaded chart, year or camera; the first records only in-memory audio intent.
Escape enters silently. The opening appears once per successful fresh page load,
including reload, with no browser persistence or reopening during navigation or
same-document remount. The optional 240ms ease-out appearance respects reduced
motion. Missing artwork leaves entry usable; startup errors expose Retry instead.
No audio playback or welcome recording is implemented. Edit only the opening JSON
and rebuild to revise the introduction; the released script is creator-approved
for future 4.2H voice production. All 330 tests and required release gates pass;
dedicated Demo/production opening and existing A–F browser regressions pass.
The same sixteen SVGs and three PNGs are bundled; the reserved MP3 is unchanged
and excluded. See [4.2G behavior and limits](docs/DEVELOPMENT_ROADMAP.md#phase-42g--nexus-atlas-opening).
**4.2A–G are complete and creator-approved; 4.2H–I remain planned, unimplemented
and separately gated.** Final Checkpoint 4 acceptance and Cantum Stage 5 remain
pending. Checkpoint 5, Canon migration, Atlas Creator and deployment remain
unauthorized. No deployment occurred.

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
| `public/datasets/demo/` | Active public-safe noncanonical v1.3 runtime dataset |
| `examples/v1_2/` | Ten focused noncanonical entity-family references and their guide; excluded from runtime |
| `tests/fixtures/legacy_examples/` | Preserved legacy regression inputs |
| `docs/archive/json-proposals/` | Preserved obsolete JSON proposal shapes |
| `src/timeline/` | Existing historical resolver (v0.1) |
| `src/core/history.mjs` | Independent historical selectors shared by v1.1/v1.2/v1.3 |
| `src/core/cartography.mjs` | Pure historical catalogue, route and influence calculations |
| `src/viewer/` | Local demo-only Vite/Three.js prototype |
| `tests/` | Automated checks and a console timeline demonstration |
| `docs/DATA_RULES.md` | Historical conventions and known outstanding decisions |
| `docs/DATA_MODEL.md` | Active v1.3 model and v1.2 compatibility; schemas govern exact shape |
| `docs/NAVIGATION_AUTHORING.md` | Manual connection generation, validation and recovery |
| `schemas/` | Active v1.3 definitions; unchanged v1.2 wrappers and frozen regressions |
| `scripts/` | Offline generation, validation, ID Finder and build audit |
| `docs/ARCHITECTURE.md` | Implemented modules, future work and disclosure boundaries |
| `docs/REPOSITORY_STRUCTURE.md` | Repository and private-data organization |
| `docs/DEVELOPMENT_ROADMAP.md` | Planned milestones and acceptance criteria |
| `docs/CONTENT_WORKFLOW.md` | How source lore is reviewed, approved, and released |
| `AGENTS.md` | Rules for coding assistants working in this repository |

See the documentation before adding or changing historical records. Files in `public/data/` may include placeholders and approximate dates awaiting refinement; do not interpret all map-display boundaries as exact historical events.

## Run Development, Demo and historical checks

Install a current supported [Node.js](https://nodejs.org/) version and run in the repository root:

```bash
npm ci
npm run demo
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
npm run history:demo
npm run build
npm run preview
```

`npm run benchmark -- all 3` measures controlled 5/100/400/1000-system workloads
and writes ignored local JSON under `.playwright-mcp/`. Run benchmarks without
concurrent tests for useful comparisons. `npm run release:check` validates freshness,
builds and audits the selected NONCANONICAL Demo; it does not generate navigation,
publish artifacts or certify Canon. Its browser/subpath dry run is documented in
[the readiness guide](docs/PERFORMANCE_AND_RELEASE_READINESS.md).

`npm test` runs legacy history, frozen v1.1 regression checks, v1.2 schema/generation/recovery checks, v1.3 entity/governance, radius and navigation tests and prototype spatial/build-boundary tests. `npm run history:demo` runs the unchanged legacy **console** political-history demonstration; it is separate from both browser environments. `npm run build` validates the registered Demo dataset, creates static `dist/` output and audits it. `npm run preview` serves that build at **http://127.0.0.1:4173/Velara_Atlas/**. These commands do not deploy anything.

Dependencies are pinned by `package-lock.json`; use `npm ci` and a supported Node LTS. Vite's `publicDir` is disabled: canonical `public/data/` is neither an application input nor automatically copied to `dist/`. The `/Velara_Atlas/` base prepares asset URLs for a future repository-subpath deployment; no GitHub Pages workflow is configured. The [Checkpoint 3.6 audit](docs/REPOSITORY_AUDIT_3_6.md) records earlier checks and limits; the [index](docs/INDEX.md) links subsequent evidence. Physical touch-device verification remains outstanding.

### Local Development and future Canon

| Command | Environment and URL |
| --- | --- |
| `npm run dev` | Synthetic Development/calibration: `http://127.0.0.1:5174/Velara_Atlas/__calibration/` |
| `npm run demo` | Validates then serves the graphical noncanonical Atlas: `http://127.0.0.1:5173/Velara_Atlas/` |
| `npm run history:demo` | Legacy console chronology (`tests/demo.mjs`), no server |
| `npm run preview:calibration` | Compatibility alias for `npm run dev`, using the same server and port |
| `npm run build` / `npm run preview` | Audited noncanonical Demo output / preview at `http://127.0.0.1:4173/Velara_Atlas/` |

Run Development and Demo in separate terminals. The compatibility command is an
alternative name for Development, not a second server to launch on the same port.
Both bind to loopback. Canon is a future approved-MCR environment: there is no
Canon launch command or fallback to noncanonical data. Protected legacy
`public/data/` remains unchanged and outside the Demo.

The original baseline calibration source remains
[`tests/calibration/scenarios/cantum-scale-baseline.json`](tests/calibration/scenarios/cantum-scale-baseline.json).
It contains format `velara-cantum-calibration`, version `1`, `radiiLY`,
`defaultRadiusLY`, `preview.maxYearAE` and a reduced `dataset` with `sector`,
`cantums`, empty `connections` and `presentation`. The original 15 systems,
positions (including their exact floating-point values), histories and two Cantums
are stored once. The chart remains 40 x 40 ly with a 12-ly Y extent.

`tests/calibration/scenario.mjs` reads that one fixed JSON resource (Node file read
or browser fetch), validates its local format and exports `calibrationDataset(radius)`
and `CALIBRATION_RADII`. Each call clones all records, creates its own empty detail
Map and applies only the selected 2/2.5/3-ly radius to both existing Cantum styles.
The default is 2.5 ly; the expanded controller obtains choices and timeline bounds
from the selected registered source. Missing/unsupported fields, malformed data, invalid coordinates,
intervals, references and radius choices fail explicitly; nothing is repaired.
Reload the page after editing an authorized local scenario.

This deliberately reduced fixture has empty InfoCards and no released details;
it is **not a release-valid Atlas dataset or canonical history**. No master schema,
normal radius calculation or demonstration JSON is changed. The preview script
adds only exact read-only module/HTML routes and finite registry-declared JSON resources.
Other calibration files/methods and direct filesystem access remain blocked; no
editor, saving endpoint or arbitrary dataset root is provided. The existing
renderer, resolver, controls and sigil registry are reused. Development JSON and
its adapter are excluded from the Demo's inventory-based input audit and `dist/` output.
No canonical radius is chosen. Completed, creator-approved named local previews are described below.

### Automated and browser verification

Run `npm test`, `npm run validate`, `npm run connections:check`,
`npm run build` and `npm run history:demo` from the repository root.
For focused calibration checks: `node --test tests/cantum-calibration.test.mjs`.
Tests compare all three JSON-backed datasets with hashes captured before the
migration and exercise histories, mutation isolation, invalid inputs and HTTP
boundaries, alongside the existing field/nameplate/geometry assertions.

With both browser servers running, use Playwright MCP's
`browser_run_code_unsafe` with `filename: "tests/browser-cantum-calibration.mjs"`
for all nine radius/camera combinations, history/transfer, input, mobile and
resource checks. Graphical suites `tests/browser-*.mjs` target the Demo on 5173;
run them with the Demo page selected (for example navigation, celestial, layout,
labeling, zones and touch suites). They are Playwright callback files, not Node
CLI tests; no Playwright dependency is added to the project. Historical reports
retain their original command names and results.

## Registered Demo systems and loading

`sector.systems[]` is the only system registration list. To release an approved
noncanonical system, author `systems/sys_XXXX.json` and register the same permanent
ID with `publicDetailPath: "systems/sys_XXXX.json"` in
[`public/datasets/demo/sector.json`](public/datasets/demo/sector.json).
No viewer, script list or Vite edit is needed. Keep `publicDetailPath: null` for
an intentional catalogue-only record; it retains the NEXUS archival fallback.
A missing non-null detail is an error, never a fallback.

`scripts/dataset-inventory.mjs` derives a sorted inventory from the trusted Demo
root, including the sector-declared registries. It validates the catalogue and
strict identity/path agreement before reading details; authoring/release Ajv,
relationship and navigation checks remain authoritative. Only registered paths
can become Vite imports. A narrow virtual module generates those imports, and
`loadDemoDataset()` eagerly preloads every released detail before initialization.
There is no runtime JSON fetch, folder discovery or second handwritten manifest.

Restart `npm run demo` after adding/removing registrations or changing registry
paths. Then run `npm run connections` if authored navigation requires generation,
`npm run connections:check`, `npm run validate`, `npm test` and `npm run build`;
review the JSON and generated diff. Startup/build only verify, never generate.
Unsafe paths, symlinks/reparse redirects, malformed/version-invalid records,
relationship failures and stale navigation block publication. Unregistered files
remain excluded even if ID Finder scans them for collisions. The build and Demo
filesystem allowlists derive from the same inventory; `publicDir: false`, asset
restrictions and output audits remain in force. Canon and calibration are excluded.
Internal alternate-root injection exists only for isolated automated tests.

`node --test tests/dataset-inventory.test.mjs` exercises rejection cases and a
temporary additional system through the real loader, navigation writer and full build.
It does not add speculative records to the active Demo. Phase 3B is complete
and creator-approved. Completed [Phase 3D v1.3 activation](docs/DATA_MODEL_V1_3_PROPOSAL.md)
now preloads the faction registry and every registered faction record alongside
all released system details. No on-demand fetching or arbitrary-root command is added.
The Demo registry now contains two curated TEST factions. Exhaustive edge cases remain isolated in tests. The pure
resolver is explicitly admitted to the build; test fixtures and calibration are not.

## Historical governing influence (Phase 3D)

Systems keep their authored administrative `cantumHistory`. The selected-year
Cantum superior chain determines the governing political field and its name/sigil.
All contributors of one governor enter one Gaussian sum before shading. Missing
superior history is **Not recorded**, not Independent: those systems retain their
administrative InfoCards but do not assert a sovereign overlay. InfoCards resolve
Cantum/faction names for the selected year, including faction legal status and
institutional affiliation. Exact faction/governance boundaries enter History jumps;
approximate dates do not.

The v1.3 Demo uses `territoryOverlay.radiusLY: 24` for every Cantum; per-Cantum
entries contain colors only. This is provisional NONCANONICAL data. Cantum A
keeps its former radius; Cantum B expands from 18 to 24 ly. Opacity, Gaussian
thresholds, colors and envelope-height rules are unchanged. The
[migration crosswalk](docs/DATA_MODEL_V1_3_PROPOSAL.md#phase-3d-demo-migration-crosswalk)
records every authorized data difference. Frozen v1.2 references still use their
original per-Cantum representation.

Run `node tests/preview-governance.mjs` for the isolated, loopback-only test viewer
at `http://127.0.0.1:5175/Velara_Atlas/`, then execute the MCP entry point
`tests/browser-governing-influence.mjs`. It derives TEST A/B/C governance and
factions from the existing v1.3 fixture, adds rendering-only statuses/positions,
and removes its temporary dataset on Ctrl+C. It does not edit the live Demo or
create a new public dataset selector. All other browser suites continue using
Demo 5173 and calibration 5174. See the
[contract and focused tests](docs/DATA_MODEL_V1_3_PROPOSAL.md).

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

Supported prefixes: `cb`, `gat`, `sta`, `jhl`, `sys`, `lnk`, `can`, `zon`, `sec`, `fac`,
or `all` for a table. The default scope is `--demo`. The scanner reads only the
chosen dataset's sector/Cantum/connection registries and direct `systems/*.json`
files, including systems not yet indexed. References and presentation settings
do not count as definitions. Catalogue/detail system IDs and authored/generated
link pairs count once; generated-only link IDs remain used. It does not run the
navigation generator or check graph freshness (`connections:check` does that).
The active v1.3 Demo registers two NONCANONICAL TEST factions. A loaded v1.3 context
enables bounded faction registry/file diagnostics; unregistered faction files
remain collision diagnostics, never viewer/build inputs. No CLI root selector
is added. See [the isolated fixture and checks](tests/fixtures/v1_3/README.md).

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

## Safe local system authoring (completed Phase 3E)

Phase 3E is complete and creator-approved. Its implementation and status
synchronization are committed together. Phase 3F and overall Architecture Phase 3 are complete; Architecture Phase 4 is complete and creator-approved; Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

`npm run atlas:new-system -- --help` describes the fixed NONCANONICAL Demo
workflow. No arguments validates the dataset and suggests an unused permanent ID;
`--size-x N --size-y N --size-z N` previews a new empty v1.3 chart and sector
registration. X/Z must be square; dimensions are explicit CNU author decisions.
Only `--apply` writes. Unknown history remains null and may prevent historical
visibility. No objects, politics or navigation are invented or auto-generated.

See [MANUAL_AUTHORING](docs/MANUAL_AUTHORING.md) for all inputs, exact record
shape, ID collisions, recovery, manual celestial/station authoring and complete
short-range gate pairs. Existing inventory/import mapping needs only JSON
registration, followed by a Demo server restart. The viewer stays read-only;
Canon, calibration and publication boundaries are unchanged. Focused tests:
`node --test tests/system-authoring.test.mjs`.

## Living Demo showcase (completed Phase 3F)

Start `npm run demo` and follow [DEMO_SHOWCASE](docs/DEMO_SHOWCASE.md) on the normal
5173 URL. `sys_0005` adds a TEST star, planet, faction-linked station and complete
gate pair: discovery 300, construction 350/352, activation 353 A.E. Inspect faction
names at 499/500 and legality at 899/900; inspect Cantum B's independent/subordinate/
independent political fields at 799/800/999/1000. `sys_0004` remains archival-only.
The guide records the exact intentional additions and preservation boundaries.

Future authorized significant visible features follow implement -> automated tests
-> representative noncanonical Demo -> creator visual review -> corrections ->
explicit approval -> separately authorized documentation/commit/push. Nonvisual
work needs no filler content. TEST, calibration, Demo and Canon remain separate.
Phase 3F and overall Architecture Phase 3 are complete and creator-approved.
Architecture Phase 4 is complete and creator-approved; no Canon migration or deployment is implemented.

## Viewer modules (completed Architecture Phase 4)

The normal Demo and its JSON are unchanged. `main.mjs` composes a locally owned
`AppState`, catalogue, timeline, layer panel and historical InfoCard. `AtlasMap`
remains the scene facade; camera, picking, map layers and projected labels have
focused owners. [Module ownership and configuration](docs/ARCHITECTURE.md#phase-4-viewer-module-ownership)
describes their interfaces, lifecycle and deliberately bounded presentation options.
No framework, dependency, dataset selector or public settings editor is added.

Run `node --test tests/viewer-modules.test.mjs` for focused state/presentation,
camera/picking, configuration and cleanup tests. The Chromium MCP entry point
`tests/browser-viewer-modules.mjs` runs against `npm run demo`; existing showcase,
keyboard/touch, zone and nine calibration comparisons remain applicable.
Architecture Phase 4 is complete and creator-approved. Phase 5 is complete and creator-approved. Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

## Named local preview scenarios (completed Phase 5)

Run `npm run dev` (or its alias `npm run preview:calibration`, not both) and open
**http://127.0.0.1:5174/Velara_Atlas/__calibration/**. Phase 5 is complete and creator-approved; implementation and completion
documentation are committed together. The ordinary
`npm run demo` on 5173 and its v1.3 data/24-ly radius are unchanged.

**Scenario** selects authored synthetic geography/history. **Preset** selects a
repeatable radius, year, camera, layers and visual state. Pan, zoom, selection and
manual control changes are temporary. **Replay preset** restores the complete
selected preset and clears selection/hover. **Reset View** only reframes the
current experiment. Neither action saves anything.

| Scenario | Useful presets / inspection |
| --- | --- |
| Original Cantum scale (`cantum-scale-baseline`) | Nine named 2/2.5/3-ly x top/perspective/low presets, all at 1200 A.E.; default 2.5/top. The original 15 systems, 40 x 40 x 12-ly chart, outpost transfer, sigils and 8px symbols are unchanged. Low means 10 degrees; perspective means 45 degrees. |
| Island merging and elevation (`island-elevation`) | `separated-top`: 2 ly, 499, top; `merged-perspective`: 3 ly, 800, 45 degrees; `outpost-low`: 2.5 ly, 1200, 10 degrees. Seven TEST systems include a near-threshold pair, a ridge appearing at 700, a detached outpost appearing at 800, elevated stars and one unassociated control. The outpost preset also changes background, selection color and delay. |

Creator walkthrough: choose Original and a low preset; switch to Island, inspect
Separated, then Merged; change year/view, colors, delay and layers, pan/zoom, then
Replay. The declared camera and controls return. Switch back to Original to
verify its unchanged calibration. On mobile, expand **Calibration controls and
layers**, choose controls, then collapse them to inspect the square chart.

Background and selected-marker colors plus selection delay (0-1000 ms) all pass
the closed Phase 4 `createVisualConfig()` validator. Select a star to inspect its
highlight; delay applies to map pointer selection. Hover color/route opacity are
not exposed here because these reduced scenarios have no routes. Presets may
carry validated config fields; unknown keys, invalid values and physical/history
injection are rejected. Visual changes rebuild/dispose the local map while retaining its view; Replay
starts with clean camera/control ownership for exact preset restoration. Neither
alters source JSON or defaults.

Read-only diagnostics report the actual selected scenario/preset/year/view/radius,
layer choices, eligible systems, positioned field contributors, field groups,
visible political identities and detached sigil identities. Renderer geometry/
texture counts come from Three.js; half-height/tolerance come from generated
envelopes. Sampling is the existing 128 x 128 grid (40/128 = 0.3125 ly step here).
Unavailable optional values show n/a. Fields remain approximations, not borders;
these counters are not Phase 6 profiling or telemetry.

`tests/calibration/scenarios/preview-manifest.json` is the version-1 finite local
registry: unique stable IDs, display names/purposes, exact `scenarios/<id>.json`
paths, default preset IDs and complete preset states. It admits only the reduced
`velara-cantum-calibration` version-1 format; these memory-only v1.2-style records
are not full release-valid v1.2/v1.3 or Canon data. No automatic format conversion
occurs. `scenario-format.mjs` validates/adapts independent clones; `scenario.mjs`
retains `calibrationDataset(radius)` and original exports. `preview.mjs` validates
registration/presets and delegates historical/camera/configuration behavior.

To add an authorized preview: author a separate public-safe TEST JSON file in
that directory, register its matching ID/path and presets, run validation/tests,
then restart Development. There is no discovery/glob or URL/root input. Registry
edits require a server restart so browser and server admission agree. Missing or
invalid resources show an explicit error, clear the obsolete map and permit
scenario reselection or **Reload registry**; no fallback claims success.

The loopback server serves exact admitted resources using GET/HEAD only, with
path/encoding/case and real-path/symlink checks. There is no save endpoint. Demo
source/build audits reject controllers, registry, scenarios and test utilities;
`publicDir: false`, Canon/private exclusions and approved assets remain unchanged.

Focused checks: `node --test tests/local-preview.test.mjs tests/cantum-calibration.test.mjs`.
With Development and Demo running, execute `tests/browser-local-preview.mjs` and
`tests/browser-cantum-calibration.mjs` through the existing Playwright MCP runner;
these are browser entry points, not Node test scripts. Continue the ordinary
Demo browser regressions. Future implementation and commits still require
explicit creator authorization. Those Phase 5 changes included no Phase 6 implementation or Atlas Creator; current Phase 6 evidence is in the readiness guide.
