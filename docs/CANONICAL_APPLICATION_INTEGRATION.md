# Canonical application integration — creator review

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
