# Local development and verification

Use [README](../README.md) for first setup and [PROJECT_STATUS](PROJECT_STATUS.md) for current approval gates. This is an operating guide, not authorization to change Demo data, add scenarios or publish. Commands run from the repository root. Node 24 matches CI.

## Local Development and future Canon

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
[`tests/calibration/scenarios/cantum-scale-baseline.json`](../tests/calibration/scenarios/cantum-scale-baseline.json).
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


## Automated and browser verification

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

The sector-derived inventory supplies eager imports, HTTP admission and production checks. See [validated dataset inventory](ARCHITECTURE.md#validated-dataset-inventory) for ownership and [manual authoring](MANUAL_AUTHORING.md) for registration. After authorized registration changes, restart Demo. Generate navigation manually only when needed, then run `connections:check`, validation, tests/build and review the diff. Unregistered files never become publication inputs.

## Governance test preview

Run `node tests/preview-governance.mjs` for the isolated, loopback-only test viewer
at `http://127.0.0.1:5175/Velara_Atlas/`, then execute the MCP entry point
`tests/browser-governing-influence.mjs`. It derives TEST A/B/C governance and
factions from the existing v1.3 fixture, adds rendering-only statuses/positions,
and removes its temporary dataset on Ctrl+C. It does not edit the live Demo or
create a new public dataset selector. All other browser suites continue using
Demo 5173 and calibration 5174. See the
[contract and focused tests](DATA_MODEL_V1_3_PROPOSAL.md).


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
is added. See [the isolated fixture and checks](../tests/fixtures/v1_3/README.md).

The highest numeric suffix is dataset-wide; suggestions use at least four digits
and never fill historical gaps, reserve IDs or change files. Public v0.1 legacy
IDs are listed separately without conversion; suggestions there apply only to
the numbered namespace, not to a canonical migration. Duplicate definitions,
malformed IDs and missing required files fail and withhold next-ID suggestions;
bad arguments also return nonzero. No unrelated examples, frozen test fixtures,
dependencies, build assets, documentation or private folders are traversed.


## Named local preview scenarios

Run `npm run dev` (or its alias `npm run preview:calibration`, not both) and open
**http://127.0.0.1:5174/Velara_Atlas/__calibration/**. The ordinary `npm run demo` on 5173 and its v1.3 data/24-ly radius are unchanged.

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
explicit creator authorization. See the readiness guide for historical Phase 6 evidence.


## Local release checks and profiling

`npm run release:check` builds and audits the fixed NONCANONICAL Demo; it does not generate navigation or deploy. Use [the release checklist](PERFORMANCE_AND_RELEASE_READINESS.md#local-publication-dry-run-and-security). `npm run benchmark -- all 3` writes ignored local measurements; run benchmarks without concurrent tests. Browser callbacks require the existing MCP harness and are not part of `npm test`. Historical timing/device results are evidence for their recorded environments, not current performance guarantees.
