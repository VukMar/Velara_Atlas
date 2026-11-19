# Canonical application integration — creator review

> The integration verification below records the completed baseline at `67b730130c516e5e15fba3dd366612ae1ca3ad77`. Its whole-card scrolling and retained 0.5.0 repository version are superseded by the subsequent creator-approved [Holographic InfoCard and 1.0.0 candidate](#holographic-infocard-and-100-candidate--2026-11-19) amendment. Publication remains separately gated.

Implemented under the creator's 2026-11-19 task on `review/canonical-velara-cantum-migration`, in [PR #4](https://github.com/VukMar/Velara_Atlas/pull/4). Starting revision: `fa53a770eb848f45031dce4da7787dc2a26c7bb5`. Implementation, validation, commit/push and PR reconciliation are authorized. Creator visual acceptance, merge and website deployment remain separate. The published website is still the October 27 noncanonical 0.5.0 release.

## Dataset and entry point

`public/datasets/canonical/` contains the five approved files: `sector.json`, `cantums.json`, `connections.json`, `factions.json` and `presentation.json`. Each is byte-identical to the approved candidate at the starting revision. The old candidate directory is retired and recoverable through Git history. Permanent IDs, coordinates, map configuration, all other history fields and unrelated numeric 1201 endpoints are unchanged.

The active v1.3 dataset contains 70 systems, seven historical Cantums, 199 system descriptions and 35 Cantum descriptions. All final description endpoints remain null. Qualification counts remain 209 exact, seven circa and 18 confirmed_by. Shumdom's 760–776 and Morluk's 812–838 visible-but-undescribed periods are preserved. There are no published system interiors, faction details or connections; entering a known system uses the existing NEXUS archival fallback.

`src/viewer/index.html` now reuses the original interactive viewer at `/Velara_Atlas/`. There is one renderer and one application. The existing opening modal, audio controller, preference keys, media, acknowledgment and lifecycle remain unchanged. New visitors choose audio or silent entry; Escape enters silently. Returning visitors retain completion and saved audio without a second acknowledgment. Loading failures retain the technical error/Retry boundary.

The teaser, invitation, Homepage navigation and noncanonical production disclosures are retired. `demo.html` is not emitted and both local server modes reject that retired route. Canonical text comes from the data and selected year. InfoCards still use `textContent`; the sole description presentation change is `white-space: pre-line`, preserving paragraphs without HTML interpretation or redesign.

## Runtime, tooling and archives

`atlas-data.mjs` consumes `virtual:velara-atlas-dataset`. The offline `dataset-files.mjs`/`dataset-inventory.mjs` select Canonical by default and preserve the existing v1.3 object structure and synchronous historical APIs. `validate-atlas.mjs`, `audit-atlas-build.mjs`, `createAtlasConfig()` and `release:check` use the same registered production dataset. Test-root injection remains internal, with no runtime or arbitrary-root CLI selector.

The historical engine in `src/core/`, all schemas, renderer/camera modules, opening/audio components, original assets, universal content and legacy `public/data/` records are unchanged. The authoring guard now permits an absent `systems/` directory for a valid all-archival dataset. When that directory exists, its original reparse, recovery and orphan checks still apply. No navigation generation or canonical fictional edit was performed.

The previous Demo data, HTML and landing sources live under `tests/fixtures/archived-demo/`. They are historical NONCANONICAL inputs, selected explicitly through `tests/archived-demo.mjs`; production never imports them or falls back to them. `tests/preview-archived-demo.mjs` serves current-viewer synthetic regressions on 5177. Calibration and other frozen fixtures retain their separate contracts.

| Command | Current scope |
| --- | --- |
| `npm run atlas` | Validate and serve Canonical on 5173 at `/Velara_Atlas/` |
| `npm run demo` | Compatibility alias for `atlas`; never selects archived data |
| `npm run dev` / `preview:calibration` | Synthetic calibration on 5174 at `__calibration/` |
| `npm run validate`, `connections:check` | Canonical schema/relationships and read-only navigation freshness |
| `npm run build`, `release:check` | Canonical single-page build and source/output audits |
| `npm run preview` | Canonical production preview on 4173 |
| `npm run idfind -- all` | Canonical IDs; `--demo` explicitly selects the archived fixture, `--public` the protected legacy dataset |

Vite retains `publicDir: false`, strict filesystem guards, finite source admission, static validated imports and registered-module completeness. Its viewer-module allowlist is explicit. Output auditing requires one canonical shell, rejects retired HTML/teaser and unregistered identities, verifies all approved SVG/PNG/MP3 bytes and checks local resource references and full reachability. Production has no source maps, editor, backend or runtime dataset JSON requests.

## Verification

| Command | Scope | Exit/result |
| --- | --- | --- |
| `npm ci` | Existing lockfile; no dependency changes | 0 |
| `npm test` | All generic/versioned/legacy/archived regressions plus five new canonical tests | 0; 376 passed, zero failures/skips |
| `npm run validate` | Actual integrated canonical dataset, strict v1.3 and relationships | 0 |
| `npm run connections:check` | Canonical graph freshness, read-only | 0 |
| `npm run build` | Canonical application and output audit | 0 |
| `npm run release:check` | Single-page canonical build/resource/disclosure audit | 0 |
| `npm run idfind -- all` / `history:demo` | Canonical diagnostics / protected legacy chronology | 0 / 0 |
| `git diff --check` | Full integration diff | 0 |

The canonical tests pin all five file SHA-256 values to the approved candidate, require 70/7/199/35 counts and final-null endpoints, verify all 1,201 supported years through the real resolver, check the known gaps, Pustosh names, retained selection, archival fallback and production configuration. All 371 prior unit tests remain represented; the obsolete landing-only closure test is replaced by canonical source-exclusion coverage. Synthetic tests continue to exercise their original identities, interiors, navigation and chronology through isolated fixtures.

Both actual development (5173) and production preview (4173) passed the canonical browser callbacks:

- Ten first-entry categories each: silent/audio, returning preferences and no duplicate acknowledgment, Escape, storage denial, rejected media, missing portrait, failure/Retry, reduced motion and 390×844, 320×568 and 844×390 layouts.
- 44 historical open-InfoCard checks each, in both directions; 70 markers/77 records, null-description gaps, Pustosh names, archival return and 2D/3D controls.
- Long-description scrolling and visible paragraph separation at 1440×1000, 390×844 and 320×740; no horizontal card overflow. The paragraph boundary measured 48.625 CSS pixels of vertical separation. Selected screenshots were visually inspected.
- Zero unexpected JavaScript/resource errors. Injected failure scenarios and deliberately canceled media transfers are distinguished from unexpected failures. `demo.html` returned 404 on both servers.

Archived-fixture browser checks passed lifecycle/focus/selection with four stable remount/dispose cycles (one canvas, no stale renders/selections), plus navigation across five systems/four interiors, 43 selectable objects, 18 exclusive local endpoints, three interstellar routes, history, destinations, archival fallback and perspective. These generic callbacks ran with the unchanged shared entry helper inlined by the harness because MCP does not support their dynamic Node helper import. The extended legacy opening callback did not complete: a timing assertion was made event-aware, then Playwright MCP closed its transport during a fresh-context rerun. It is not reported as passed. The required canonical opening checks on both servers had already passed.

The final production audit reports exactly one HTML entry and 33 reachable files, including sixteen SVGs, three PNGs and eight MP3s. Registered canonical modules are complete; archived data/HTML, old landing implementation, calibration, private source/migration files and unapproved IDs are excluded. All resource URLs retain `/Velara_Atlas/`.

## Limits and review

Local runtime was Node 20.5.1/npm 9.8.0 on Windows; the CI matrix continues to require Node 24. `npm ci` reports two moderate dependency vulnerabilities; no dependency upgrade or automatic fix is included. Vite reports the existing large-chunk advisory (the canonical application is approximately 922 kB before gzip). No new hosted-CI, physical-device, Firefox/Safari, screen-reader, speaker-fidelity or GPU-memory result is implied by these checks. The initial diagnostic test failures were fixture-root/two-page expectations and were corrected without weakening guards or removing engine coverage.

The GitHub verification workflow remains automatic and read-only. Pages remains manually dispatched on main only; no dispatch, merge, tag or Release is part of this work. Version 0.5.0 is retained for PR review. This is a significant application integration; recommend evaluating 1.0.0 with the separately approved canonical public launch, as reserved by policy, rather than assigning it before launch approval.

READY FOR CREATOR CANONICAL ATLAS VISUAL REVIEW

## Holographic InfoCard and 1.0.0 candidate — 2026-11-19

The subsequent creator directive starts at `67b730130c516e5e15fba3dd366612ae1ca3ad77` on the same PR #4 branch. It authorizes the Holographic Transmission InfoCard, staging repository version **1.0.0**, validation, commit/push and PR-description updates. It does not authorize merge, Pages deployment, a tag or GitHub Release. The published website remains the October 27 **0.5.0 noncanonical pre-release**; the canonical public launch is not complete.

The centered dialog uses `width: min(600px, calc(100vw - 24px))` and `max-height: min(720px, calc(100dvh - 48px))`. Its blue-black archival header retains the resolved name, kind, current historical year, Close and the unchanged approved NEXUS portrait. Portrait boxes are 144 px desktop, 80 px narrow/short and 64 px at extreme heights, with `object-fit: contain`. No viewport/density rule hides the portrait; actual image failure retains the existing graceful collapse.

Exactly two tabs follow: Description defaults for each new entity; Technical retains all existing model facts, destinations and the scale/inspection note. Text remains complete, safe `textContent` with `white-space: pre-line`. Normally only the active panel scrolls while the header, tabs and applicable actions persist. Very short windows or enlarged text leaving less than 96 px for reading switch to one recoverable outer scrollbar. Short content keeps a natural card height. The original 96/64 px checkpoint record remains historical evidence, superseded for ordinary InfoCards only.

Historical updates retain tab, focus and sensible scroll while synchronously replacing name/year/narrative/facts. New entities reset both tab scroll positions, including a hidden panel's offset on its first activation. Existing ineligible-record clearing remains. External navigation buttons retain their actions and focus across eligible year updates. Native tab buttons provide relationships, roving focus, wrapping arrows, Home/End and Enter/Space; inactive panels are hidden and active panels are keyboard-scrollable. Existing Escape/Close focus restoration, touch targets and reduced-motion behavior remain. All listeners/observers and replaced destination handlers use the owning lifetime.

Affected files for this amendment:

- Implementation: `src/viewer/index.html`, `src/viewer/style.css`, `src/viewer/infocard-view.mjs`.
- Version metadata: `package.json`, `package-lock.json` (only the three authorized version fields).
- Tests: `tests/viewer-modules.test.mjs`, `tests/canonical-integration.test.mjs`, `tests/browser-infocard.mjs`, `tests/browser-release-readiness.mjs`, `tests/browser-branding4_2a.mjs`, `tests/browser-navigation-v1_2.mjs`, `tests/browser-phase3f-showcase.mjs`.
- Documentation: `README.md`, `AGENTS.md`, `docs/PROJECT_STATUS.md`, `docs/VERSIONING_POLICY.md`, `docs/VIEWER_SPECIFICATION.md`, `docs/NEXUS_VISUAL_IDENTITY.md`, this report.

All five canonical JSON files and 234 descriptions remain byte-identical to the approved hashes. There is no diff from the starting revision in `src/core/`, schemas, InfoCard model, renderer/camera/navigation owners, opening/audio components, original media, universal content or `.github/`. Package scripts, dependencies and all non-version lockfile data match the starting revision exactly. No migration framework or Creation Kit work is added.

Final local validation (Windows, Node 20.5.1/npm 9.8.0):

| Command | Result |
| --- | --- |
| `npm ci` | Exit 0; final candidate lockfile, unchanged dependencies |
| `npm test` | Exit 0; **379 passed**, zero failures/skips (376 baseline plus two focused InfoCard tests and one version-metadata test) |
| `npm run validate` | Exit 0; strict actual canonical v1.3 schema/relationships |
| `npm run connections:check` | Exit 0; read-only freshness |
| `npm run build` | Exit 0; single-entry production build and audit |
| `npm run release:check` | Exit 0; **33 reachable files / 5,588,354 bytes**, sixteen exact SVGs, three PNGs and eight MP3s |
| `git diff --check` | Exit 0 |
| Independent scope/version audit | All five approved SHA-256 values match; protected paths unchanged; only package/root-lock version fields differ |

The real canonical InfoCard callback passes on development (5173) and production (4173), with identical measured layouts:

| Viewport | Long Cantum card (CSS px) | Portrait |
| --- | --- | --- |
| 1440 × 900 | 600 × 720 | 144 px |
| 1280 × 720 | 600 × 672 | 144 px |
| 390 × 844 | 366 × 720 | 80 px |
| 320 × 568 | 296 × 520 | 80 px |
| 844 × 390 | 600 × 342 | 80 px |
| 320 × 740 | 296 × 692 | 80 px |

All six retain a loaded, nonoverlapping portrait, reachable Close/tabs/actions, no horizontal overflow and independent narrative scrolling without outer scrolling. Canonical Cantum `can_1000004` retains its complete 3,443-character history and paragraph breaks; the short system `sys_1000065` produces a natural **600 × 442.734375 px** card. At 320 × 568 with 200% root text, the single-scroll fallback exposes the complete narrative/controls; 320 × 280 also passes the extreme-height fallback. This is enlarged-text testing, not a claim of native browser-zoom or device coverage. Desktop/mobile/landscape and enlarged-text screenshots were inspected locally and remain ignored review artifacts.

On both servers, keyboard arrows/Home/End/Enter/Space, hidden inactive panels, new-record default, year changes with either tab active, selected-year/technical updates, the missing-description gap, ineligible selection clearing, Escape/Close focus return, Focus and Enter System all pass. Development additionally checks the actual camera snapshot; both check unchanged chart dimensions/center on selection. The existing canonical release callback passes **44 open-card historical updates per server**, including reverse/repeated years, null gaps, Pustosh names, archival return and 2D/3D. Paragraph separation measures 51.6875 CSS px; `demo.html` remains 404 and no unexpected resource/JavaScript errors occur.

The canonical first-entry callback also passes all **ten categories on each server**: silent/audio and returning preferences, Escape, storage denial, media rejection, missing portrait, load failure/Retry and three responsive reduced-motion layouts. No unexpected resource/JavaScript failures occur; intentionally rejected images/modules and canceled media transfers retain their expected classifications.

Isolated archived-fixture callbacks pass rich celestial/station/gate facts, compact portraits and image-failure recovery; all **43** selectable objects, **18** exclusive local endpoints and **three** interstellar routes; political/faction and gate chronology plus mobile station cards; and four remount/dispose cycles with **241 listeners, one canvas, 10 geometries and one texture** per sample, zero stale selections/renders. Hidden-panel scroll retention discovered during the responsive test was corrected and covered without weakening engine regressions.

Playwright MCP's transport was unavailable. Browser checks instead used the already-installed local Playwright/Chromium (139) through an ignored local runner, with no repository dependency or framework addition. The initial install encountered the previous task's preview servers holding Rollup open; those owned servers were stopped and the final clean install passed. Unchanged advisories remain: two moderate dependency vulnerabilities and Vite's large-chunk warning (main bundle approximately 924 kB before gzip). Physical devices, Firefox/Safari, native browser zoom, screen readers, speaker fidelity and GPU-memory certification were not tested.

GitHub's read-only deployment metadata still identifies successful Pages deployment `7371013524`, created October 27, at `77d2ab0ea484770eb6e40f6d0ac5aaa581d74209`. Repository 1.0.0, root lock metadata and README agree; no package command/dependency changed. Final creator visual acceptance remains pending. No merge, deployment, tag or Release occurred.

## Navigation and responsive control bars — 2026-11-19

Starting revision: `dfbf7abf0d78c9915b70e70af00f41faeb187993`, on the same PR #4 branch. The creator confirmed the canonical Atlas/InfoCard visual inspection and authorized this surrounding-interface refinement, validation/documentation and commit/push. Version remains **1.0.0 canonical launch candidate** without an increment. Final navigation UI review, merge and manual deployment remain separate; the published **0.5.0** release is unchanged.

The compact main header gains the restrained InfoCard-family radial cyan/directional blue-black gradient. Four top triggers replace the corner summaries: Catalogue/Map Controls left, Layers/History right, sharing responsive widths on narrow screens. Accessible names, expanded state, ≥44 px targets and existing branding/location/year/audio remain. No new artwork or audio behavior is added.

Catalogue is a native modal archival-search dialog, maximum 760 px wide. It retains current-year eligibility, search/type filters, order/counts, empty states and highlight semantics. Search autofocuses; results scroll independently, with an outer-scroll fallback for short/enlarged-text layouts. Close/Escape return to its trigger. Selection closes Catalogue before opening the existing InfoCard; Enter System/Focus Selection provide accessible navigation/inspection equivalents to Catalogue double-click. Map double-click is unchanged. Help is a separate NEXUS-styled modal with actual pointer/touch/keyboard instructions, Close/Escape and focus return. Neither dialog has a timeout; Help suspends Map Controls' deadline.

Horizontal History, context-derived Layers and Map Controls share one mutually exclusive bottom region **outside** the chart stage. Trigger toggling/switching is immediate. Existing control IDs, Timeline/Layer owners, qualified-date/exact-event rules, selection, camera and history-commit audio remain. Bounded wrapping/scrolling protects narrow/short layouts. The original stage observer still computes `max(1, min(width, height) - 16)`; the existing renderer observer resizes its square canvas and picking geometry. Bars reserve actual space above the footer without covering the chart/annotations. Height-limited charts shrink in both dimensions; width-limited charts retain their size until height requires a smaller square. Dismissal restores space without calling Reset View. Opening/closing animate height/opacity for 200 ms, with immediate reduced-motion states.

`toolbar-activity.mjs` owns one **10,000 ms** deadline with a controlled clock and generation guards. Outside opening starts immediately; hover/re-entry cancels; exit restarts the full deadline. Keyboard focus and active pointer/slider interactions suppress expiration. Touch completion restarts it; text editing remains protected until blur and native select operation until commit/blur. Help pauses/resumes normal rules. Replacing/toggling, navigation, remount/disposal and graphics-context loss cancel stale work. Native timers are called through wrappers to retain browser invocation semantics. Closing cannot leave focus in hidden controls, including an InfoCard whose invoking toolbar expired.

Implementation files: `index.html`, `style.css`, `app-shell.mjs`, new `toolbar-activity.mjs`, `catalogue-view.mjs`, `main.mjs`, and the narrow hidden-toolbar focus-return adjustment in `infocard-view.mjs`. `projected-labels.mjs` measures the complete scale caption and bounds its box to the small chart, compensating the arrow's horizontal offset so its exact projected cell span remains unchanged; the layout regression caught the prior small-chart clipping. Grid coordinates, arrow endpoints, camera and scene geometry are untouched. `vite.config.mjs` admits exactly the new static module; other source/output guards remain. Tests add four clock-controlled unit regressions and the actual-canonical `browser-control-bars.mjs`; existing browser helpers now use the top triggers, with old layout assertions updated to reserved space/horizontal History and Catalogue-to-InfoCard navigation. Meaningful geometry, touch, history, navigation and audio checks remain. Active viewer/NEXUS/architecture/status/readme guidance is updated; Checkpoint 3.6 remains historical evidence.

The five approved canonical files, all 234 descriptions, core, schemas, map geometry, scene/camera implementations, original images/audio/content, playback owners, deployment workflows and both package files remain unchanged from the starting revision. The only projection-presentation adjustment is scale-caption containment described above. No dependencies, migration framework, wiki/backend or Creation Kit are added.

### Final navigation verification

All required local commands passed: `npm ci`, `npm test` (**383 passed, zero failures/skips**), `npm run validate`, `npm run connections:check`, `npm run build`, `npm run release:check` and `git diff --check`. The full suite was rerun after the scale-caption correction. Four new controlled-clock tests cover exact deadlines, composed interaction protections, replacement and disposal. The release audit admits **33 reachable files / 5,598,066 bytes**: one HTML entry, JavaScript/CSS, sixteen exact SVGs, three exact PNGs and eight exact MP3s. Canonical completeness, base-relative reachability, finite source/output admission and absence of private/archive/source-map references pass.

The final canonical control-bar callback passes on development (5173) and production preview (4173), with identical measurements. Each row below includes all three toolbar states; values are square chart side lengths in CSS pixels:

| Viewport | History | Layers | Map Controls |
| --- | ---: | ---: | ---: |
| 1920 × 1080 | 811 | 832 | 836 |
| 1440 × 900 | 631 | 652 | 656 |
| 1280 × 720 | 451 | 472 | 476 |
| 390 × 844 | 374 | 374 | 374 |
| 320 × 568 | 192 | 125 | 185 |
| 844 × 390 | 121 | 112 | 146 |

All **18 states per server** have zero horizontal page overflow, one active toolbar, square chart completely above the bar, footer below it, ≥44 px top targets and complete contained scale captions with the original projected one-cell arrow span. Closing restores the original chart bounds; actual development camera snapshots retain zoom/mode/tilt across toolbar switching. Width-limited portrait charts remain 374 px rather than shrinking unnecessarily. Small/landscape layouts use bounded wrapping/scrolling; dismissing the bar releases its space. Desktop, small-mobile, landscape, Catalogue mobile/desktop and 200% text screenshots were inspected locally and remain ignored review artifacts (`.playwright-mcp/control-bars-4173-*.png`, `catalogue-4173-*.png`).

Both servers pass exact **9,999 ms visible / 10,000 ms dismissed** checks, hover/exit/re-entry, keyboard/input protection, Help suspension and focus return, replacement-generation safety, synthetic touch slider/select/text editing and no Catalogue timeout. Real Chromium touch input also holds a dragged slider for 20 seconds, then expires exactly ten seconds after release; Catalogue selection and Help suspension/resumption pass without sticky-hover interference. Development additionally remounts near an old deadline and verifies that it cannot close the replacement toolbar. Normal motion starts a 200 ms fade; reduced motion applies the final state immediately. Keyboard activation reaches the first enabled toolbar control and Escape returns to its trigger. Unexpected JavaScript/console errors: **zero**.

Catalogue's historical collection is verified at **74 eligible records in 1174 A.E.**, with independent scrolling, empty search, seven Cantums, modal focus/autofocus, dismissal and selection-to-InfoCard transition. Enlarged 200% root text checks horizontal recovery in History and Catalogue; this is not native browser-zoom certification. InfoCard regressions pass on development and production at all six InfoCard sizes, retaining its approved 600 × 720 px maximum, 144/80 px portraits, complete narrative, tab/history behavior and focus return. The canonical release callback passes **44 open-card historical updates per server**, reverse/repeated years, null gaps, Pustosh names, archival return and 2D/3D; `demo.html` remains 404 with zero unexpected resource/JavaScript failures. The canonical first-entry callback passes all **ten categories per server**, including returning/audio/silent preferences, Escape, storage/media/image/load failure recovery, Retry and responsive reduced motion.

Isolated archived-fixture browser checks pass square-chart/grid/scale/picking/camera behavior, all 43 selectable objects / 18 exclusive local endpoints / three interstellar routes, rich station/celestial/gate facts and portrait failure recovery, real pointer/touch history commits (one confirmation per completed gesture), and 2D/3D touch pan/pinch/orbit and post-gesture controls. Four remount samples retain **229 listeners, one canvas, 10 geometries and one texture**, with zero stale selections/renders. Other existing browser callbacks received selector/structure updates and syntax checks; this is not a claim that every historical standalone callback was rerun.

An independent final audit matches all five approved SHA-256 pins and confirms 70 permanent system identities, seven Cantums and 234 descriptions (199 system / 35 Cantum; 209 exact / seven circa / 18 confirmed-by; 142 multiline records). All final description endpoints remain null. Dataset bytes, protected core/schema/scene/camera/history/layer/opening/audio/media/content/workflow paths and both 1.0.0 package files have no diff from the starting revision. The full historical resolver regression checks every year 0–1200. No source lore was re-extracted or rewritten.

The previous preview refusal was an automatic-review service usage-limit failure. Retrying the same authorized preview command after resumption succeeded; no restriction was bypassed. Installed local Playwright/Chromium 139 completed production verification without new dependencies. Local runtime remains Windows Node 20.5.1/npm 9.8.0. Existing two moderate dependency advisories and Vite's large-chunk warning remain; physical devices, Firefox/Safari, native browser zoom, screen readers, speaker fidelity and GPU-memory certification were not verified. There is no remaining implementation blocker; final creator UI acceptance is pending.

GitHub's read-only deployment metadata still identifies October 27 deployment `7371013524` at `77d2ab0ea484770eb6e40f6d0ac5aaa581d74209`. The public website remains 0.5.0. This task authorizes a verification-only push to existing PR #4; no merge, deployment, tag or Release is performed.
