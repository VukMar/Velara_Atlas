# Performance and local release readiness

Phase 6 implementation/verification evidence, 2026-10-22. **Complete and creator-approved.**
Baseline: clean `main` at `6d417e56865b2d0f2e57e239b36db7657ed0fd23`.
Phases 1–6 of the current Architecture Optimization Roadmap are complete and
creator-approved. Implementation and completion documentation are committed
together. This completes the optimization workstream, not the entire project.
It is not deployment approval or Canon certification.

## Repeatable measurements

```bash
npm run benchmark -- all 3
# baseline | medium | large | extended | all; optional 3–20 samples (default 5)
node tests/preview-performance.mjs medium
# finite loopback fixture: http://127.0.0.1:5178/Velara_Atlas/
```

Run `tests/browser-performance.mjs` through the existing Chromium/MCP callback
harness against that preview. It is not a standalone Node program. Stop the
preview with Ctrl+C; its guarded cleanup removes its own temporary dataset.
No arbitrary dataset root, network source, editor or writing HTTP endpoint exists.
The ordinary Demo remains on 5173 and Development on 5174.

`tests/performance/fixture.mjs` uses seed **6302026**, a fixed LCG and approved
noncanonical templates. Tiers contain 5/100/400/1000 catalogue systems and
4/80/320/800 released details. Synthetic tiers make every fifth system archival;
each released detail has a star, planet, faction-linked station, two complete
gates and an environmental zone. The generator preserves 350/352 construction,
353 route activation, faction identity/legal transitions and 800/1000 governance
boundaries. Geography combines sparse, dense and detached clusters with Y
elevation and short/long names; internal finite patterns can isolate each case.
One scenario is generated per tier, not copied into the live Demo.

Fixture generation, schema validation and navigation generation are setup work.
Operation timings separately cover inventory/read/validation, thirteen historical
boundaries, map resolution, search, governing groups, 256-pixel flat fields,
128-grid envelopes and labels. Controlled color changes invalidate the bounded
caches for cold samples; repeated identical inputs measure warm samples. Local
machine-readable reports are ignored under `.playwright-mcp/atlas-benchmark.json`.
Do not compare runs made concurrently with tests, builds or other benchmarks.

## Measurement environment and interpretation

Windows 10 build 19045 x64; Intel i5-7300U, four logical CPUs; 16 GiB installed
RAM, approximately 6.8 GiB available at the serial CPU run; local Node **20.5.1**.
The CI matrix targets Node 24; that runtime and hosted runners have not yet been
verified by GitHub. Chromium **155.0.8059.80**, viewport 1280×900, DPR approximately
1, ANGLE Intel HD Graphics 620 / Direct3D11. The MCP harness does not expose a
reliable headed/headless launch-mode flag, so that mode is unspecified.

CPU values use `performance.now()` wall time. Browser startup includes Vite
development transforms, module delivery, eager preload and initial scene work;
it is not production startup. Renderer timing measures CPU submission, not GPU
execution. RAF intervals include scheduling and browser work. Geometry/texture
counts are resources, **not GPU-memory bytes**. Browser heap bytes and true GPU
timings were not measured. Three samples' p95 is their maximum; this is a
repeatability check, not a high-confidence population percentile.
The browser's resource-timing buffer can cap at 250 entries; performance-report
entry counts are not total request counts. Full preload is independently checked
from the loaded detail/faction maps. The production smoke uses request events.

### Observed results

The serial three-sample CPU sweep produced these rounded median/p95 milliseconds.
Setup is a separate one-time measurement; historical resolution samples all
thirteen boundaries. An earlier five-sample diagnostic overlapped other
work and is retained locally as `atlas-benchmark-contended-diagnostic.json`;
its timings are not used as performance budgets.

| Systems / released | Setup ms | Inventory | Schema/read | Relations + fresh graph | Validated module preload | Historical resolve |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 / 4 | 83 | 20/25 | 35/36 | 81/98 | 138/171 | 1/2 |
| 100 / 80 | 821 | 144/191 | 375/415 | 878/1024 | 1516/1973 | 15/29 |
| 400 / 320 | 2502 | 428/429 | 968/1353 | 3224/3280 | 6004/6882 | 32/60 |
| 1000 / 800 | 16418 | 1521/1636 | 3730/4212 | 13393/14219 | 20397/20857 | 132/199 |

| Systems | Flat cold 256 | Envelope cold 128 | Envelope warm 128 | Labels cold 128 | Sector resolve | System resolve |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 5 | 76/100 | 192/218 | <1/<1 | 55/97 | 1/2 | 4/5 |
| 100 | 352/501 | 689/1523 | <1/1 | 85/101 | 11/16 | 17/22 |
| 400 | 803/833 | 7785/11191 | 2/3 | 499/549 | 31/32 | 31/31 |
| 1000 | 2420/2429 | 42326/42870 | 5/7 | 2176/2372 | 125/154 | 158/158 |

Warm flat and label medians stay below 3 ms in this run. Search medians are
below 3 ms; grouping below 2 ms. These results expose expensive cold preparation
despite inexpensive cached access. The 1000-system tier completed CPU/validity
checks. Its full 20-cycle browser interaction sweep exceeded the MCP 300-second
call limit, so it is **not a passed stress test**. A separate one-visit, warm
Vite-module-cache startup smoke passed in 52.2 seconds with all 1000 systems,
800 released details and two factions loaded. Its initial snapshot had 1002
geometries, one texture, 1003 calls, 1000 anchors and one canvas; those are initial,
not settled-cycle invariants. Browser evidence is limited to these explicit scopes.

The 400-system Chromium run loaded all 320 released details and two factions.
Three startup visits took 10.6/11.8/10.0 seconds. Median/p95: sector rebuild
450/636 ms; system rebuild 52/107 ms; historical sector refresh 630/12,034 ms;
perspective switch 36/72 ms; CPU render submission 22/34 ms; RAF interval 28/46 ms.
Twenty cycles returned to exactly **405 geometries, 2 textures, 403 draw calls,
400 anchors, 21 political plates and one canvas**, with no console errors.
That is stable resource ownership, not a claim of smooth large-dataset history.

The final 100-system run loaded all 80 details: startup visits 4.3/2.4/2.5 seconds;
sector rebuild median/p95 189/206 ms; system rebuild 64/80 ms; historical sector
refresh 148/2756 ms; CPU rendering 8/15 ms; RAF interval 17/19 ms. Twenty cycles
retained 105 geometries, 2 textures, 103 calls, 100 anchors, 12 plates and one
canvas. The isolated ordinary-Demo-sized baseline loaded in 2.0/1.4/1.2 seconds;
sector rebuild 68/87 ms, historical refresh 66/542 ms, rendering 3/6 ms. Its
equivalent-state counts were 13 geometries, 2 textures, 11 calls, 8 anchors and
2 plates. All three runs had zero console errors. The explicit 20-cycle loops
exercise map/year/view transitions; six separate remounts additionally verify
that actual map observers, targets, pending selection timers, canvases and labels
all reach zero after teardown. The shell observer is intentionally outside that
per-map instrumentation scope; listener coverage remains in the module suite.

### Measured optimization

The former Vite hook ran complete schema, relationship and navigation checks
again for every registered JSON module. The first 100-system diagnostic exceeded
the 180-second browser wait and eventually loaded; it was contended, so no
causal speedup ratio is claimed from that visit. Whole-snapshot byte checking
per import also scaled poorly at 400 systems.

The revised hook owns one fully validated snapshot, checks each requested file's
safe path and exact bytes, checks all files on watcher invalidation/virtual entry,
and rejects mid-build changes before accepting output. It never trusts mtimes or
patches an unvalidated record into the snapshot. Recovery/authoring guards remain
active. The small-workload controlled CPU comparison measures the old repeated
validation operation versus the new validated module preload. Eager loading and
all historical/navigation semantics remain unchanged. No territory, resolution,
renderer, lazy-loading or LOD redesign was introduced.

For the 11-file baseline, repeated-validation reference median/p95 was 714/818 ms,
versus 138/171 ms for validated module preload (about 81% lower median CPU wall
time). The reference repeats the former full validation once per JSON module;
it excludes the former extra build-start/virtual-entry checks. The new operation
includes its inventory, build-start validation and per-file guards. This bounded
comparison is distinct from browser startup or GPU performance.

## Initial advisory budgets

These review targets apply to this machine and the measured workloads, not to
all devices or future canonical sectors. Investigate regressions; do not make
shared CI fail on these timing limits.

| Workload/operation | Advisory review threshold | Basis |
| --- | --- | --- |
| Current Demo loaded-process validation + graph check | p95 150 ms | Serial small-workload result near 100 ms; excludes Node/Ajv module startup |
| Current Demo cold field/envelope/label preparation | p95 400 ms per operation | Baseline envelope near 220 ms |
| Demo-sized development startup | 3 seconds | Revised visits 1.2–2.0 seconds |
| 100-system development startup | 6 seconds | Revised visits 2.4–4.3 seconds |
| 400-system development startup | 15 seconds | Three revised visits were 10–12 seconds |
| 400-system warm sector rebuild | p95 800 ms | Observed 636 ms |
| Cold historical refresh | Explicit blocking-work warning above 1 second | 100/400-system outliers of 2.8/12 seconds already exceed this usability target |
| Equivalent-state resource counts | No growth across the defined cycles | Deterministic scene/listener ownership tests |
| Demo output | Review above 850 KiB uncompressed | Existing audited artifact about 724 KiB; assets/records remain independently audited |

The 400/1000 tiers are scaling probes, not supported interactive-size promises.
Cold envelope/field preparation and historical rebuilds are the principal scaling
limits. Warm caches help repeated identical states but cannot eliminate novel
political/topological work. Future local/adaptive field computation or off-main
thread preparation needs separate design/review; full preload is retained.

## Sampling fidelity and visual limitations

`tests/performance/sampling.mjs` compares 128-grid footprint components/area and
the actual envelope mesh with 512-grid references, increased to 2048 for wide
800-ly/small-radius cases. Single-source areas additionally use the analytic
Gaussian threshold disk, `πr² × -ln(.35)/ln(2)`. This prevents a still-coarse
reference from being mistaken for ground truth. Cases include the 40-ly/2.5-ly
calibration, 160-ly/24-ly Demo scale, detached islands, a near-saddle bridge, dense
clusters, separate governors, elevations and wide-map radii 2/2.5/3.

128 sampling preserves the tested baseline-scale component topology and area
within 4%. At 800 ly, small features can have large area errors or disappear from
the envelope entirely depending on grid alignment. This is a **known geometric
limitation**, not changed history or a new territorial rule. The 24-cell and
24-pixel fixed-overview identity policy is separate: a roughly five-pixel island
should not acquire a 24-pixel sigil merely by increasing the analysis resolution.
The approved 24-ly Demo, original calibration, thresholds, opacity caps, field
equation, label policy and envelope-height approximation are unchanged.

For the 800-ly/2-ly alignment probe, analytic area is 19.03 ly² and the 2048-grid
reference is 18.31 ly² (3.8% discretization error). The 128-grid estimate is
39.06 ly² at one alignment and zero at another; the latter envelope has no
triangles. The existing 256 flat grid estimates 39.06 ly². At normal calibration
scale, 128-grid area is 30.08 versus 29.69 reference and 29.74 analytic; the
envelope projection is 29.72. At normal Demo scale, it is 2743.75 versus 2739.45
reference and 2740.71 analytic; envelope projection 2740.56. Detached/bridge/dense
and separately governed probes retain their tested component topology. Reference
areas are numerical estimates checked against the analytic case, not exact borders.

## Verification and browser coverage

Required command results, browser outcomes and final preservation checks are
recorded in the final verification section below. Existing rich suites cover
normal Demo history/routes/factions/governance, map interactions, zones, focus,
mobile/touch emulation, lifecycle, local-preview switching and the original nine
calibration radius/camera combinations. `tests/browser-release-readiness.mjs`
adds actual built subpath imports, HTML resources, archival fallback, exact gate
boundaries, faction/governance InfoCards, keyboard focus return, accessible
control names, 24px target floor, opaque-shell contrast, reduced-motion emulation,
mobile/landscape layouts, CSS text scaling, WebGL startup failure, context loss
and reload. CSS text scaling does not certify browser zoom or screen-reader use.

Existing lifecycle tests also exercise listener removal, guarded timers,
ResizeObserver disconnect, renderer teardown, detached DOM and stale callbacks.
Repeated scenes are compared at equivalent settled states; bounded eight-entry
CPU caches are legitimate retained data, not a demand for identical heap bytes.

### Unverified/manual matrix

Only the installed Chromium harness is available for these callback suites.
Its VM does not provide a Node dynamic-import hook for launching other engines;
that is a harness limitation, not a Firefox/WebKit product-test failure.

| Environment | Status and exact follow-up |
| --- | --- |
| Firefox desktop | Not run; open production preview, repeat 799/800/999/1000 political transitions, System E 349/350/352/353 gates, 499/500/899/900 station InfoCards, zones, keyboard and 2D/3D |
| Safari/WebKit | Not run; same walkthrough on macOS/iOS, especially WebGL half-float blending, touch orbit/pinch and focus restoration |
| Physical Android/iPhone/tablet | Not run; repeat calibrated radius/camera views, tap/double-tap/pinch/orbit, small-screen floating panels and rotation |
| Browser zoom 200% and assistive technology | Manual gate: repeat keyboard-only Catalogue/History/InfoCards and archival navigation, verify all controls remain reachable/announced; test NVDA+Firefox and VoiceOver+Safari |
| Low-power hardware/other GPUs | Not run; repeat benchmark and resource cycles, record actual device and GPU |

These gaps prevent broad cross-browser/accessibility certification. Political
color is supplemented by named InfoCards, labels, Catalogue and administrative /
governing facts; procedural map shading itself is not an exact or accessible
legal-border description. Screen-reader chart comprehension remains a manual
review concern even with the form/catalogue alternatives.

## Read-only CI

`.github/workflows/verify.yml` runs on pull requests, pushes to main and manual
dispatch, with Ubuntu/Windows and Node major 24, lockfile installation, tests,
validation, freshness, build, historical demo, ID Finder, release check and a
tracked-diff check. Actions are pinned by full upstream commit SHA; checkout
does not persist credentials. Permissions are `contents: read`. There are no
secrets, uploads, deployment actions, release creation or repository writes.
See upstream [checkout](https://github.com/actions/checkout/blob/main/README.md),
[setup-node](https://github.com/actions/setup-node/blob/main/README.md) and
[Node release schedule](https://github.com/nodejs/Release/blob/main/README.md).

**CI configuration reviewed locally; remote execution pending post-push.** Test/validation/build,
history, ID and release commands are verified locally from the existing install;
a fresh `npm ci` install and Ubuntu/Node 24 execution are not certified here.
No local YAML parser is
installed; workflow structure and action references receive direct review.
There is no unattended browser-CI job. Rich MCP callbacks are not Node test
files; browser CI requires a separately maintained launcher/dependency plan.

## Local publication dry run and security

```bash
npm run release:check
npm run preview -- --port 4173 --strictPort
# http://127.0.0.1:4173/Velara_Atlas/
# Run tests/browser-release-readiness.mjs in the MCP browser harness.
```

The fixed Demo dry run checks release schemas, references and graph freshness,
builds, audits actual inputs/output, checks static resource references and base
paths, reports bytes/file types and exits nonzero on deterministic failure.
It never generates navigation or repairs authored records. The Vite preview is
a loopback static-host simulation, not GitHub Pages or a public deployment.
HTTP/browser execution is explicitly a separate second step.

`publicDir: false`, selected-sector registration, symlink/reparse/path rejection,
read-only local preview routes, exact SVG content/name inventory and module
allowlists remain enforced. Final bundle completeness requires every registered
JSON input. Selected-dataset output checks reject unknown numeric permanent IDs,
orphaned/missing resources, external literal imports/requests, forbidden markers,
source maps and unexpected assets. Input controls and actual browser requests
provide complementary evidence; a regex audit alone cannot prove arbitrary code
or unknown text contains no secrets. Review every proposed source/data addition.

Existing inventory, authoring and navigation failure-injection tests retain
traversal, absolute paths, unregistered records, malformed JSON, schema/reference
errors, stale graphs, journals, concurrent edits, verified writes, rollback and
crash recovery. New tests use temporary output copies to inject missing resources,
unregistered identities, forbidden references and build failures. They never
damage the active Demo to test rejection.

## Creator-approved closeout and remaining readiness limits

**Creator-approved architecture closeout; conditional local Demo readiness only.**
Hosted Node 24 matrix results, physical devices, non-Chromium rendering and manual
accessibility checks remain separately unverified. Creator approval accepts the
documented scope and limitations; it does not certify these untested environments. The wide-map/small-radius and cold large-workload
limits are disclosed. Canon needs separate content/migration review; publication
needs separate authorization and hosted/subpath verification. No website, release
or Canon dataset was published by this work.

Inspect `git diff` and the new tests/scripts/workflow. Run the commands above;
compare the untouched normal Demo at 5173 and named local previews at 5174.
The creator reviewed and approved the implementation and its supporting evidence.
The authorized closeout synchronizes completion status and commits/pushes the
approved scope only; no later implementation or deployment is authorized.

## Reviewed implementation verification record

| Check | Executed result |
| --- | --- |
| `npm test` | PASS, 275 tests, zero failed/skipped; final run 120.7 seconds plus the legacy check and strict Demo validation |
| Focused `node --test tests/performance-readiness.test.mjs` | PASS, five tests independently; final tightened failure case also passes within the full suite |
| `npm run validate` | PASS, strict v1.3, four registered details and relationships |
| `npm run connections:check` | PASS, read-only graph and derived XYZ current |
| `npm run build` | PASS, input completeness and selected-Demo output audit |
| `npm run history:demo` | PASS, legacy terminal history retained |
| `npm run idfind -- all` | PASS, registered identities and suggestions |
| `npm run benchmark -- all 3` | PASS, all four CPU tiers; sampling references refined and independently rerun afterward |
| `npm run release:check` | PASS, exit 0; final measured build/audit phase 9.0 seconds, excluding initial validation/module startup |
| `npm run demo`, `dev`, `preview:calibration` | PASS launch and HTTP/browser checks; compatibility alias uses the same 5174 server |
| `git diff --check` | PASS |
| Affected Markdown relative links | PASS, 189 existing targets; no files relocated |

The 19 existing Chromium callbacks all pass:

`browser-local-preview`, `browser-cantum-calibration`, `browser-viewer-modules`,
`browser-phase3f-showcase`, `browser-governing-influence`, `browser-system-authoring`,
`browser-navigation-v1_2`, `browser-cantum-sigils`, `browser-influence-envelopes`,
`browser-island-identities`, `browser-checkpoint3`, `browser-documentation3_6`,
`browser-grid-zero`, `browser-layout3_6`, `browser-labeling`, `browser-celestial4_1`,
`browser-touch-camera`, `browser-touch3_6`, `browser-zones3_8` (all in `tests/`, `.mjs`).
This includes nine radius/camera comparisons, keyboard/touch emulation, historical
and visual identity expectations, named previews and disposal. Existing assertion
files and frozen baselines were not changed to obtain these results.

New Chromium callbacks pass at their stated scopes:

- `browser-performance.mjs`: baseline, 100 and 400 systems, three startup visits,
  five operation samples, 30 render/RAF samples and 20 resource cycles each.
  Extended full stress timed out at 300 seconds; the separate warm 1000-system
  startup-only smoke passed. It is not a fourth passed stress result.
- `browser-resource-lifetime.mjs`: six remounts × four interaction groups; zero
  tracked map observers/targets/timers/canvases/labels after each disposal.
- `browser-release-readiness.mjs`: built `/Velara_Atlas/`, eager four-system/two-
  faction chunks, exact gate/faction/governance boundaries, archival fallback,
  responsive/keyboard/semantic checks, WebGL failure/retry, context loss/reload.
  Four opaque-shell text contrast ratios are 8.1–15.5; no unnamed or undersized
  visible controls in the sampled state. CSS 200% text scaling and 320/390-pixel
  portrait plus 844×390 landscape remain usable. This is not WCAG certification.

The local production preview served **all 24 output files with exact matching
HTTP bytes**, including every JS/CSS/SVG under the repository base. Its normal
browser walkthrough made 14 distinct resource requests, all within that base,
with zero unexpected response or console errors. Final rebuilt files match the
previously browser-checked artifact byte-for-byte. Output: **740,717 bytes**:
718,037 JS, 8,697 CSS, 8,402 SVG, 5,581 HTML; exactly 15 approved SVGs.
Vite's existing >500-kB chunk advisory remains visible and is not suppressed.

HTTP disclosure probes return 403 for Canon on Development and calibration JSON
on Demo; registered calibration JSON and normal launch pages return 200. Against
253 baseline tracked-file hashes, all **119 protected** public data/assets,
schemas, frozen fixtures, calibration and runtime-source files are unchanged.
All eleven Demo JSON records, generated navigation, core semantics, shared radius
and package lock remain unchanged. No new dependencies or visual assets were added.

Task-owned servers were stopped and ten identified temporary preview directories
removed after absolute-path/reparse checks. No broad Temp cleanup occurred.
Raw reports/screenshots/logs remain ignored under `.playwright-mcp/`; changes
were unstaged at that implementation checkpoint. No commit, push, Canon migration
or deployment occurred during that implementation verification; closeout follows separately.

Windows PowerShell's redirected warning stream initially produced
`NativeCommandError` despite a completed build/audit. Capturing via native
`cmd /c` redirection confirms real build/release exit 0. Browser collectors detach
the preceding fixture document before listening, avoiding stale closed-server
HMR errors. The accessibility probe measures visible disclosure content and
associated label hit areas instead of treating closed-panel layout boxes as
interactive targets. These are harness corrections, not rebaselined UI behavior.

## Creator-approved final closeout verification

The creator explicitly approved the reviewed implementation and evidence. Final
closeout used `main` at the Phase 5 baseline above; local HEAD and GitHub main
agreed before staging. The approved source/tests were not redesigned during
closeout. Documentation synchronization records Phases 1–6 complete together
with the implementation, without embedding this commit's own SHA.

Required commands were rerun: `npm test` passed **275 tests, zero failures or
skips** (74.1 seconds for the Node test runner, plus legacy/validation commands).
`validate`, `connections:check`, `build`, `history:demo`, `idfind -- all`,
`release:check` and `git diff --check` pass. All eleven changed/new JavaScript
files pass `node --check`. Affected Markdown relative targets pass (218 checked
before the final report additions); no files were relocated.

The serial `npm run benchmark -- all 3` rerun completed every tier. Rounded
median/p95 milliseconds below are a second observation, preserving the earlier
reviewed measurements above rather than replacing their historical context.

| Systems / details | Validated module preload | Relations + freshness | Pure historical resolve | Cold envelopes |
| --- | ---: | ---: | ---: | ---: |
| 5 / 4 | 128/154 | 79/96 | 1/8 | 151/221 |
| 100 / 80 | 1384/1388 | 1514/1871 | 9/15 | 846/1320 |
| 400 / 320 | 5895/7174 | 3554/4452 | 29/45 | 7097/8049 |
| 1000 / 800 | 14733/14966 | 8377/9260 | 88/133 | 26224/27228 |

The baseline repeated-validation reference was 563/615 ms versus 128/154 ms for
the revised preload, approximately 77% lower median in this bounded comparison.
The advisory budgets above remain unchanged; cold historical/geometry stalls
remain a known usability limitation, not a passed smooth-interaction claim.

All **19 existing Chromium suites** listed above passed again, including the
nine original calibration radius/camera comparisons and isolated governance /
authoring previews. New resource-lifetime and built-release callbacks also pass.
The large performance callback was rerun: 400 systems, 320 details, two factions,
startup 11.7/9.5/9.5 seconds, warm sector rebuild median/p95 409/435 ms, historical
refresh 429/11,607 ms, CPU render submission 17/21 ms and RAF 23/35 ms. Twenty
cycles retained exactly 405 geometries, two textures, 403 calls, 400 anchors,
21 plates and one canvas. No console errors occurred. Baseline/100-system browser
measurements retain their reviewed implementation-run context above. The optional
1000-system full browser sweep was not retried or promoted to a pass.

The built-site callback passed exact gate/faction/governance boundaries, eager
detail/faction modules, archival fallback, responsive and keyboard checks,
contrast, CSS text scaling, unsupported-WebGL retry and context-loss/reload.
Startup was 696 ms in this local warmed static-preview visit; it is not a
cross-device performance guarantee. Firefox/WebKit, physical devices, browser
zoom and assistive technology remain unverified as listed above.

`npm run demo`, `dev`, `preview:calibration` and `preview -- --port 4173 --strictPort`
were launched and checked through HTTP/Chromium. The compatibility alias loaded
the original 15 systems and one canvas. Its first closeout launch encountered
the earlier task-owned server occupying 5174; after verified shutdown, the alias
was rerun successfully. Windows PTY Ctrl+C did not reach the Node servers; only
verified task-owned listener processes were stopped through Windows process
management. Three newly created temporary preview roots were identified against
a pre-launch directory inventory and cleaned after absolute-path/reparse checks.

The final release dry run passes: **24 files, 740,717 bytes**, with the same byte
breakdown and 15 exact approved SVGs recorded above. Its measured build/audit
phase was 3.56 seconds. All 24 files matched their local bytes over HTTP under
`/Velara_Atlas/`; the browser made 14 distinct same-base requests without errors.
Canon on Development and calibration JSON on Demo returned 403; an unregistered
preview resource and POST to scenario JSON returned 404. All protected baseline
data and approved implementation hashes remain unchanged. No deployment occurred.

CI configuration reviewed locally; remote execution pending post-push. The
read-only Ubuntu/Windows Node 24 jobs are not declared successful by these local
Windows Node 20 results. The closeout response reports the actual remote Git and
CI state available after the push; no second commit is needed merely to insert
the completion commit's SHA or its hosted run status into this report.

## Checkpoint 4.2F local closeout evidence — 2026-10-23

Creator-approved 4.2F adds only a finite 420ms decorative chart reveal. Baseline
is `d30681fa0b4dd24107d37e930f63b36a4cf653c1`; the earlier Phase 6 measurements
above retain their original scope and are not new transition performance budgets.
Historical resolution, scene replacement and saved-camera restoration remain
synchronous and independent of the effect. No extra renderer, scene clone,
framebuffer pipeline, continuous JS loop or dependency is introduced.

The dedicated normal-Demo and production-preview callback records native Web
Animation opacity/timing samples across all three navigation paths, plus valid
rapid gate navigation, ten interruption paths, reduced motion/live preference
changes, camera restoration, keyboard/Chromium touch input and four viewport
sizes (1280×900, 390×844, 320×740, 844×390). Equivalent warmed Sector states across
twenty navigation cycles retain 13 geometries and two textures. Disposal removes
the transition element and active animation; remount leaves one canvas. Unit
tests additionally invalidate stale completion callbacks and verify owned-listener
cleanup. Existing module/lifecycle and navigation callbacks pass. This measures
resource counts, not GPU memory or physical-device responsiveness.

All 318 tests pass, including twelve focused owner tests; validation, connection
freshness, build, release audit and whitespace checks pass. Existing Focus,
celestial, reticle, sizing, archival, zones, touch, layout and production
release/accessibility checks pass. Camera-owned 550ms Focus and its frozen
endpoints are unchanged. Strict release output remains 29 files, sixteen exact
SVGs and three exact PNGs, totaling 4,501,368 bytes; all PNG URLs return HTTP 200
under `/Velara_Atlas/`. Dataset/private/Canon restrictions and exact asset
registries are unchanged. The reserved MP3 matches the baseline and is excluded;
browser callbacks observe no audio requests. Screenshots and samples remain in
ignored `.playwright-mcp/`, outside the reviewed commit.

Local browser evidence uses headless Chromium 139, DPR 1, ANGLE Intel HD Graphics
620/Direct3D11. Software rendering can stall across the animation interval, so
those stalled runs are not motion passes. Native animation duration is 420ms;
navigation wall time also includes the existing synchronous rebuild and browser
scheduling. Physical devices, Firefox/WebKit, screen readers and actual browser
zoom remain unverified. Existing Vite chunk-size advice remains. 4.2G–I, final
Checkpoint 4 acceptance, Cantum Stage 5, Checkpoint 5 publication, Canon migration,
Atlas Creator and deployment remain separately gated. No deployment occurred.

## Checkpoint 4.2G opening closeout — 2026-10-24

The creator approved the original-artwork opening composition, exact universal
script, entry wording, fresh-load policy, Escape and reduced-motion behavior.
`opening-view.mjs` adds one static native dialog and an optional finite 240ms
ease-out appearance, after actual successful chart initialization. Entry is
immediate and neither changes historical/camera state nor rebuilds the scene.
The session intent is memory-only; the opening does not reopen on navigation or
same-document remount. No audio constructor, playback, storage or MP3 request is
used. The approved script is recorded for future 4.2H voice production, without
claiming an existing welcome recording.

Final `npm test` passes **330/330**, with no failures/skips, including twelve
focused opening tests for the closed three-string contract, literal safe copy,
session choices, Escape/native dismissal, once-per-page policy, image failure,
reduced motion, disposal/stale callbacks, exact-path content admission, missing/
malformed/redirected/changed sources and a real audited JSON-only edit build.
`npm run validate`, `npm run connections:check`, `npm run build`,
`npm run release:check` and `git diff --check` pass. One initial Windows build
attempt failed clearing generated `dist/assets` with `ENOTEMPTY`; a retry after
stopping the task's local servers succeeded without changing source or weakening
checks. The existing Vite chunk-size advisory remains.

The dedicated normal-Demo and audited-production opening callback verifies exact
copy, both entry intents, Enter/Space/Escape, native background isolation, canvas
focus return, reload, no navigation reopening, missing portrait, explicit startup
failure and zero audio/storage use. Demo checks additionally compare exact live
camera/state snapshots and zero scene rebuilds across entry, malformed-content
failure, context-loss/Retry focus and four remounts. Each remount has one opening
element, a closed dialog and one canvas. Unit tests verify listener/animation
cleanup; this is bounded resource evidence, not a GPU-memory certification.

Responsive bounds pass at 1280×900, 390×844, 320×740 and 844×390, plus 200% CSS
text scaling at desktop and narrow mobile. Normal motion records the actual
240ms Web Animation; reduced motion omits it and a live preference change cancels
it. Both choices work through Chromium CDP touch input. Existing branding,
archival/history/technical recovery, targeting, sizing, Focus, chart navigation,
camera/touch, route/zone and lifecycle regressions are repeated as applicable.
Existing callbacks use a shared helper to activate the real entry action, never
a production bypass. The archival test still requires a nonmodal section and
permits only the known InfoCard and closed opening dialogs.

Closeout browser results: **13/13 normal-Demo callbacks** pass (opening, branding,
chart transitions, Focus, reticles, sizing, archival, documentation walkthrough,
viewer modules, resource lifetime, touch camera, navigation and zones).
**8/8 audited-production callbacks** pass (opening, branding, chart transitions,
Focus, reticles, sizing, archival and release readiness). No unexpected page or
resource failures remain. Intentional failure probes retain explicit recovery.

The unchanged binary inventory is **16 exact SVGs and 3 exact PNGs**: fourteen
navigation icons, one Test Cantum sigil, one original reticle, MCR insignia,
side-profile and front-facing NEXUS. Production totals **29 files / 4,507,604
bytes** (HTML 7,556; JS 731,463; CSS 14,758; SVG 16,022; PNG 3,737,805).
All PNG URLs work beneath `/Velara_Atlas/`; no raw UI JSON, audio or unauthorized
outputs appear. Original artwork, fallback JSON, world data, schemas and exact
asset registries remain unchanged. The 305,746-byte MP3 equals the 4.2F baseline
with SHA-256 `9815ff5b01120100e8825aebb1b2a43a38329c82c8ec020b0cca0bf0011aab72`;
it remains unimported, unplayed and excluded. The closed content audit adds only
the exact opening JSON module and retains source snapshots, path guards and
module completeness. Existing Canon/private/reachability audits remain intact.

Browser evidence is local headless Chromium 139 with Intel HD Graphics 620 /
Direct3D11, DPR 1, and emulated touch. No physical-device, Firefox/WebKit,
screen-reader or actual browser-zoom certification is claimed. Screenshots,
logs and intermediate evidence stay in ignored `.playwright-mcp/`, outside Git.
At the G closeout, 4.2A–G were complete and creator-approved; H–I remained planned and unimplemented.
Final Checkpoint 4 acceptance and Cantum Stage 5 remain pending; Checkpoint 5,
Canon migration, Atlas Creator and deployment remain unauthorized. No deployment
occurred.

## Checkpoint 4.2H voice and first-entry closeout — 2026-10-25

**Complete and creator-approved.** The creator reviewed the two original
recordings, global header control and corrected first-entry behavior. The
original G-only fresh-load policy above is historical and superseded. Pending
Visitors see the unchanged opening until an audio/silent/Escape decision is
completed. Returning Visitors bypass it, restore ON/OFF and never automatically
request acknowledgment speech. The three namespaced storage values distinguish
audio, completion and one-time migration; clearing completion alone restores
entry. A modern header-only change cannot prove entry. Malformed records and
storage denial retain safe, functional behavior. No history/camera data is stored.

One root-lifetime audio owner creates media lazily, retains at most one active
speech and releases listeners/source on completion, error, replacement, mute,
navigation, year refresh, context loss, pagehide, remount and disposal. Generation
guards prevent stale events/promises affecting replacement speech. Restored ON,
header ON, ordinary archive renders/panels/resize and timeline refresh never start
speech. Explicit changed-scope archival navigation is the only fallback trigger.
No scene rebuild, historical command or chart reveal runs on opening dismissal.

Final checks: **348/348 automated tests**, no failures/skips, including eighteen
audio tests and retained opening/media/security regressions. `npm run validate`,
`npm run connections:check`, `npm run build`, `npm run release:check` and
`git diff --check` pass. Two exact original MP3s are pinned and compared as binary
buffers at input/output, with exact filenames, module completeness and graph
reachability; negative tests reject changed/redirected inputs and missing,
renamed, duplicate, corrupt, unreferenced and unauthorized outputs. Existing
SVG/PNG/content/dataset/private/Canon rules remain intact.

Final local release totals **32 files / 4,940,241 bytes**: HTML 7,629; JS 734,095;
CSS 15,010; SVG 16,022; PNG 3,737,805; MP3 429,680. This is fourteen navigation
SVGs, one Cantum sigil, one NEXUS reticle, three original PNGs and exactly two
MP3s. Full base-relative recording requests return exact original buffers;
Chromium media range requests succeed. No source map, raw UI JSON, extra audio,
private records or Canon data enters the release. See [pins and output contract](VISUAL_ASSET_POLICY.md#13-implemented-checkpoint-42h-exact-audio-admission).

**Browser evidence:** 15/15 normal-Demo callbacks and 9/9 audited-production
callbacks pass. Demo covers audio, opening, branding, archival, chart transitions,
Focus, reticles, sizing, square layout, viewer modules, resource lifetime, touch
camera, navigation, zones and celestial rendering. Production covers audio,
opening, branding, archival, transitions, Focus, reticles, sizing and release
readiness. Seven independent persistent-profile Chromium launches verify first
entry, two ON returns, OFF return, cleared completion, silent return and Escape.
Completed returning starts make zero autoplay media requests.

The dedicated audio callback uses actual browser MP3 decoding/playing/currentTime,
not mocked playback: entry 6.687313s, fallback 18.050563s, natural entry completion
and resource release. It checks trusted entry activation, repeated ON/OFF reloads,
strict legacy migration, clearing completion, malformed storage, header keyboard/
touch operation, mute/replacement, 899/900/1200 chronology, released charts,
no rerender replay, denied playback, missing/corrupt recordings, storage denial,
startup failure/Retry, a header-only choice during failed first startup, remount,
context loss and disposal. The adapted G callback uses a separate playback spy
for exact copy, state/camera invariance, focus, image/motion and input assertions;
it deliberately resets entry fixtures rather than reinstating the old policy.

Responsive checks cover 1280×900, 390×844, 320×740 and 844×390, plus 200% CSS text
scaling and normal/reduced motion. Stable ON/OFF header bounds preserve the chart;
the desktop reserved column prevents an extra tall landscape row. Headless
Chromium 139/Intel HD Graphics 620 Direct3D11 and emulated touch were tested.
Physical devices, Firefox/WebKit, screen readers, actual browser zoom and physical
speaker/fidelity certification remain unverified. The creator's personal audio/
functional approval is separate from this automated evidence. The existing Vite
chunk-size advisory remains; no unresolved meaningful regression is reported.

Logs, screenshots, native media results and temporary profiles remain in ignored
`.playwright-mcp/`; no generated evidence is committed. Earlier checkpoint
history is retained. At H closeout, 4.2A–H were complete and creator-approved;
4.2I remained planned and unimplemented. Final Checkpoint 4 acceptance and Cantum Stage 5 are pending;
Checkpoint 5, Canon migration, Atlas Creator and deployment remain unauthorized.
This closeout authorizes a local commit only; no push or deployment occurred.

## Checkpoint 4.2I interface audio and ambience closeout — 2026-10-25

**Complete and creator-approved.** The creator personally approved six unchanged
original recordings, simultaneous generic/action effects, speech priority,
continuous ambience, ducking/restoration and the current volume balance. The
explicit approved scope amendment adds one quiet archival-computer loop to the
original five-cue phase; it authorizes no music or further audio features.
Accepted native gains remain speech 1.00, click 0.35, action 0.45 and ambience
0.08, with a bounded 180ms ambient restoration. Closeout changes documentation
only; runtime/test/asset fingerprints match the approved implementation.

Final checks pass **369/369 automated tests**, including **21 interface-audio
tests**, with no failures/skips. `npm run validate`, `npm run connections:check`,
`npm run build`, `npm run release:check` and `git diff --check` pass. Coverage
includes independent concurrent foreground slots, repeat coalescing, timeline
commit/release, voice suppression, loop lifecycle, mute, denied/failed media,
storage persistence and unchanged strict release rejection cases.

Reviewed completed browser evidence passes **17/17 Demo callbacks** and
**11/11 production callbacks**, including dedicated I/native-history checks and
the prior A–H, navigation, Focus, reticle, sizing, archival, responsive, touch and
resource-lifetime regressions. **Seven independent persistent-profile Chromium
starts** verify first entry, ON/OFF returns, cleared completion, silent and Escape
returns; returning visits make no unsolicited media requests. These completed
browser runs are reused for documentation-only closeout, rather than represented
as newly executed runs.

Native decoded playback demonstrates separate Focus click/lock starts 10ms apart
on Demo and 5.9ms in production, with observed overlapping playback. Chart,
selection and history actions retain the same independent triggering. Native
mouse/touch timeline dragging updates history immediately without cue storms;
release produces one confirmation. The same lazy 30-second loop survives chart/
year operations and speech duck/restore without a new player or play call; a
boundary-wrap probe observes continued playback. Speech clears foreground slots
and sets ambient volume to zero, then restores 0.08. Immediate mute, failed/denied
media, rapid activation, context loss, repeated remount and disposal pass without
stale callbacks or duplicate players. Hidden-document behavior was simulated.

Final audited output is **39 files / 5,399,246 bytes**: ten JS chunks (739,662),
one CSS (15,010), one HTML (7,629), sixteen SVGs (16,022), three PNGs (3,737,805)
and eight MP3s (883,118). SVGs remain fourteen navigation icons, one Cantum sigil
and one NEXUS reticle. The six new recordings total 453,438 bytes; both original
voice recordings are byte-identical to H. All eight source/output buffers, pinned
hashes, exact hashed filenames and `/Velara_Atlas/assets/` HTTP responses match.
No raw UI JSON, source maps, extra media, Canon or private records enter output.
`publicDir: false`, `assetsInlineLimit: 0`, binary validation, module completeness,
duplicate rejection and resource reachability remain restrictive. See [exact
pins](VISUAL_ASSET_POLICY.md#14-implemented-42i-binary-admission--2026-10-25).

Headless Chromium 139 with Intel HD Graphics 620 / Direct3D11, emulated touch,
1280×900, 390×844, 320×740 and 844×390 layouts and normal/reduced motion were
tested. Physical devices, Firefox/WebKit, assistive technology, actual browser
zoom, physical-speaker fidelity and sample-perfect loop-seam certification were
not tested. The creator's listening approval is separate from these automation
limits. The existing Vite chunk-size advisory remains; no meaningful unresolved
regression is reported. Logs, profiles and screenshots remain ignored under
`.playwright-mcp/` and are excluded from the commit.

**4.2A–I are complete and creator-approved; Checkpoint 4.2 audiovisual
implementation is complete.** Final Checkpoint 4 integrated visual acceptance
requires separate creator authorization. Cantum Stage 5 remains pending.
Checkpoint 5, Canon migration, Atlas Creator and public deployment remain
unauthorized. This closeout authorizes one reviewed commit and normal push only;
no deployment or further checkpoint work occurs.
