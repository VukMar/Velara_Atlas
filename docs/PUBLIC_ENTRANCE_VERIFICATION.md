# Public entrance implementation verification

Local implementation and creator acceptance completed on 2026-10-26. The creator reports completed manual visual and functional testing and explicitly approves the implementation. This authorized documentation closeout records the approved work in one local commit; no push, merge or deployment is authorized or performed. Branch: `main`, initially clean. No data migration, schema, Canon, original artwork, recording, npm script or dependency changes.

The working architecture is described in [PUBLIC_ENTRANCE](PUBLIC_ENTRANCE.md). Both pages reuse the unchanged opening view and audio controller; one controller owns the existing three persistence keys and speech per page. Homepage passes only the original acknowledgment URL and no interface sound URLs. Demo keeps the complete original soundscape and validated-ready opening.

## Implementation checks and evidence

These results describe the implementation work preceding creator acceptance. Fresh closeout results are recorded in the closeout section below.

| Check | Result |
| --- | --- |
| `npm run connections:check` | PASS; read-only generated graph/positions are current |
| `npm test` | PASS final run: 371/371, zero skipped/failures, 138.191 seconds; process exit 0 |
| Focused final output-audit tests | PASS 2/2 selected tests (7 unrelated tests skipped by name filter) |
| `npm run validate` | PASS strict v1.3.0 schema, four registered details, relationships and freshness |
| `npm run build` | PASS final run, explicit process exit 0; both pages and strict source/output audits |
| `npm run release:check` | PASS; explicit process exit 0; two pages, 46 files, 5,409,690 bytes |
| `git diff --check` | PASS |
| Original Demo HTML comparison | Exact match to former index after removing only the new Homepage link |
| Extracted opening CSS comparison | Exact match to the approved original rules |
| Protected paths comparison | No changes to public/, schemas/, package files, core/history, main.mjs, opening-view.mjs or audio-controller.mjs |

Build inventory remains sixteen exact SVGs, three exact PNGs and eight exact MP3s. Total bytes: HTML 11,162; JS 741,959; CSS 19,624; SVG 16,022; PNG 3,737,805; MP3 883,118. Landing reachability includes ten output files; its JavaScript is isolated from the Demo renderer/data. Original PNGs account for most homepage transfer; there are no new images or media. The existing Demo chunk-size advisory (>500 kB) remains.

A final rebuild encountered a transient Windows `ENOTEMPTY` while emptying dist/assets with preview running. Stopping the owned preview and rerunning the unchanged build succeeded with explicit exit 0; the preview was then restarted. No filesystem guard or build check was changed.

The first `npm test` attempt failed 43 temporary-directory checks because the sandbox denied realpath/stat operations through the Windows user-profile temporary directory. Rerunning unchanged tests with TEMP/TMP pointing to ignored `.playwright-mcp/tmp` passed. No test or filesystem guard was relaxed. Host runtime: Node 20.5.1; Node 24 CI was not rerun for this uncommitted work.

## Completed browser checks

`tests/browser-public-entrance.mjs` passed on development (5173) and final production preview (4173), under `/Velara_Atlas/`, with isolated Chromium Visitor contexts:

- Fresh landing welcome; audio and silent entry; Escape entry.
- Exact existing storage keys/completion and shared saved ON/OFF preference.
- Returning homepage bypass without welcome autoplay.
- Landing to Demo without repeated welcome/speech, and Demo back to landing.
- Fresh direct Demo entry after actual chart construction, with canvas focus return.
- Storage access/write denial; rejected media; missing portrait; content failure and successful Retry.
- Keyboard action order and focus restoration to the invitation link.
- Pagehide releases acknowledgment speech; mute releases it immediately.
- 390x844, 320x568 and 844x390 layouts, reachable primary link, no horizontal document overflow and reduced-motion opening.
- No landing canvas/WebGL construction, Three.js, map engine, historical engine, Demo data or calibration requests.

Ignored captures: `.playwright-mcp/entrance-5173-desktop.png`, `entrance-5173-welcome.png`, `entrance-5173-390.png`, `entrance-5173-320.png`, `entrance-5173-844.png`, and corresponding `4173` captures. Mobile full-page capture widths exclude Chromium's scrollbar gutter; creator manual visual and functional acceptance has since been completed.

## Browser limits and completed creator acceptance

A production run of the existing audio regression reached its final repository-subpath assertion, which still concatenated `assets/` onto the former HTML root. That test URL construction was corrected in both audio/interface suites. Before the full rerun could complete, Playwright MCP closed its transport during the existing opening suite. Repeated tool calls returned `Transport closed`; therefore neither that interrupted opening run nor the broader map/audio/interface/release suites are reported as passing for this change. New entrance checks on both servers had completed before this failure. Existing automated regressions remain intact and pass; full existing browser callback reruns remain an explicit verification limit.

No new physical-device, Firefox/Safari, screen-reader, speaker/fidelity, actual browser-zoom, GPU-memory or hosted CI certification is claimed. The creator has completed manual visual and functional acceptance of the local two-page implementation. This approval does not imply additional automated browser coverage or certification. Push, Canon migration, Atlas Creator and public deployment remain separately gated.

## Approved closeout verification - 2026-10-26

**NEXUS Public Entrance Integration — Complete and Creator-Approved (2026-10-26).** Creator manual visual and functional acceptance is completed, independently of the automated coverage recorded above. This closeout changes documentation only; hashes of all approved implementation/test/build files match the accepted working-tree snapshot. No unrelated working-tree changes were found. The original Demo HTML (apart from its Homepage link) and extracted opening CSS match their approved predecessors, and Checkpoint 4.2G-I roadmap records remain unchanged.

Fresh commands run for this documentation/commit closeout:

| Check | Fresh result |
| --- | --- |
| `npm run connections:check` | PASS, exit 0; current generated connections and derived gate positions, read-only |
| `npm test` | PASS, exit 0; 371/371 tests, zero failures/skips, 106.545 seconds; final release validation also passed |
| `npm run validate` | PASS, exit 0; strict v1.3.0 release schema, four registered details, relationships and freshness |
| `npm run build` | PASS, exit 0; both HTML entries plus source/output security audits |
| `npm run release:check` | PASS, exit 0; two pages, 46 files, 5,409,690 bytes, dataset verified, sixteen exact SVGs, three exact PNGs and eight exact MP3s |
| `git diff --check` / staged diff check | PASS; no whitespace errors |
| Production entry inspection | `dist/index.html` and `dist/demo.html` present; exactly two HTML outputs |
| Scope/retention review | No canonical/data/schema/dependency/approved-binary/deployment-workflow changes; `/Velara_Atlas/` and npm scripts unchanged |

Host runtime remains Node 20.5.1. Tests used ignored workspace-local TEMP/TMP as required by this sandbox, without changing tests or guards. The existing >500 kB Demo chunk advisory remains. Browser callbacks were not rerun for this documentation-only closeout; the earlier transport interruption and device/browser/hosted-CI limits above remain explicit. Creator acceptance completes the review gate without expanding those automated claims.

The approved implementation and relevant documentation are included in one descriptive local commit. Generated dist/, local logs, screenshots, caches and private material are excluded. No push, merge or deployment is performed. Canon migration, canonical Atlas population, Atlas Creator and any future Demo retirement/archival remain separately approved workstreams.

## File-by-file changes

| File | Responsibility/change |
| --- | --- |
| `AGENTS.md` | Current approved entrance status, two-page ownership and separate future Canon/deployment gates. |
| `README.md` | Current homepage/Demo routes, operating commands, completed acceptance and approval boundaries. |
| `docs/ARCHITECTURE.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/CONTENT_WORKFLOW.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/DEMO_SHOWCASE.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/DEVELOPMENT_ROADMAP.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/INDEX.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/LOCAL_DEVELOPMENT.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/NEXUS_VISUAL_IDENTITY.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/PERFORMANCE_AND_RELEASE_READINESS.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/PROJECT_STATUS.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/REPOSITORY_STRUCTURE.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/VIEWER_SPECIFICATION.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `docs/VISUAL_ASSET_POLICY.md` | Active documentation updated with routes or a clearly identified amendment; completed checkpoint history retained. |
| `scripts/audit-demo-build.mjs` | Exactly two pages, navigation/disclosures, combined reachability and restricted landing media; original binary/data safeguards retained. |
| `scripts/release-check.mjs` | Accurate two-page dry-run scope in the report; same command and validation/build/audit behavior. |
| `src/viewer/index.html` | Public welcome/teaser HTML and ordinary Demo link. |
| `src/viewer/nexus-content.mjs` | Retain Demo fallback; re-export shared opening content. |
| `src/viewer/style.css` | Import shared opening styles and style the discreet Homepage link. |
| `src/viewer/voice-assets.mjs` | Reuse entry URL; retain original Demo fallback URL. |
| `tests/browser-archival4_2b.mjs` | Point actual map checks at demo.html. |
| `tests/browser-audio4_2h.mjs` | Point actual map checks at demo.html. Resolve media URL base independently of HTML filename. |
| `tests/browser-branding4_2a.mjs` | Point actual map checks at demo.html. |
| `tests/browser-cantum-sigils.mjs` | Point actual map checks at demo.html. |
| `tests/browser-celestial4_1.mjs` | Point actual map checks at demo.html. |
| `tests/browser-checkpoint3.mjs` | Point actual map checks at demo.html. |
| `tests/browser-documentation3_6.mjs` | Point actual map checks at demo.html. |
| `tests/browser-focus4_2e.mjs` | Point actual map checks at demo.html. |
| `tests/browser-governing-influence.mjs` | Point actual map checks at demo.html. |
| `tests/browser-grid-zero.mjs` | Point actual map checks at demo.html. |
| `tests/browser-history-audio4_2i.mjs` | Point actual map checks at demo.html. |
| `tests/browser-influence-envelopes.mjs` | Point actual map checks at demo.html. |
| `tests/browser-interface4_2i.mjs` | Point actual map checks at demo.html. Resolve media URL base independently of HTML filename. |
| `tests/browser-island-identities.mjs` | Point actual map checks at demo.html. |
| `tests/browser-labeling.mjs` | Point actual map checks at demo.html. |
| `tests/browser-layout3_6.mjs` | Point actual map checks at demo.html. |
| `tests/browser-map-transitions4_2f.mjs` | Point actual map checks at demo.html. |
| `tests/browser-navigation-v1_2.mjs` | Point actual map checks at demo.html. |
| `tests/browser-opening4_2g.mjs` | Point actual map checks at demo.html. |
| `tests/browser-performance.mjs` | Point actual map checks at demo.html. |
| `tests/browser-phase3f-showcase.mjs` | Point actual map checks at demo.html. |
| `tests/browser-release-readiness.mjs` | Point actual map checks at demo.html. |
| `tests/browser-resource-lifetime.mjs` | Point actual map checks at demo.html. |
| `tests/browser-reticle4_2c.mjs` | Point actual map checks at demo.html. |
| `tests/browser-sizing4_2d.mjs` | Point actual map checks at demo.html. |
| `tests/browser-system-authoring.mjs` | Point actual map checks at demo.html. |
| `tests/browser-touch-camera.mjs` | Point actual map checks at demo.html. |
| `tests/browser-touch3_6.mjs` | Point actual map checks at demo.html. |
| `tests/browser-viewer-modules.mjs` | Point actual map checks at demo.html. |
| `tests/browser-zones3_8.mjs` | Point actual map checks at demo.html. |
| `tests/cantum-sigils.test.mjs` | Preserve exact asset tests using an authorized two-page output fixture. |
| `tests/performance-readiness.test.mjs` | Retain output failure injections; add two-page/landing isolation cases and handle shared artwork references. |
| `tests/preview-governance.mjs` | Print relocated demo.html URL for the existing isolated map fixture. |
| `tests/preview-performance.mjs` | Print relocated demo.html URL for the existing isolated map fixture. |
| `tests/preview-system-authoring.mjs` | Print relocated demo.html URL for the existing isolated map fixture. |
| `vite.config.mjs` | Explicit two HTML inputs and finite landing module-closure audit; existing global input safeguards retained. |
| `docs/PUBLIC_ENTRANCE.md` | Completed, creator-approved two-page, first-entry, audio, security and future-Canon amendment. |
| `src/viewer/demo.html` | Former Atlas HTML, preserved except Homepage link. |
| `src/viewer/entry-voice.mjs` | Expose only the original welcome acknowledgment URL. |
| `src/viewer/landing.css` | Static black responsive teaser composition using approved identity. |
| `src/viewer/landing.mjs` | Homepage readiness, one shared opening/audio owner and cleanup. |
| `src/viewer/opening-content.mjs` | Shared exact opening JSON validation and original artwork URLs. |
| `src/viewer/opening.css` | Exact extracted approved opening styles, shared by both pages. |
| `tests/browser-public-entrance.mjs` | New isolated-context cross-page entry, persistence, failures, focus, responsive/reduced-motion and no-map-loading checks. |
| `docs/PUBLIC_ENTRANCE_VERIFICATION.md` | File-by-file delivery, exact check outcomes, captures and remaining verification limits. |
