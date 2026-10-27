# Velara Atlas — Development roadmap

> **2026-10-26 public entrance amendment:** [Two-page website and shared first entry](PUBLIC_ENTRANCE.md). NEXUS Public Entrance Integration is complete and creator-approved, including manual visual/functional acceptance. Public deployment remains separately gated. The Checkpoint 4.2G-I records below retain their historical scope.

**Current status:** See [PROJECT_STATUS](PROJECT_STATUS.md). Checkpoint 4 is complete and creator-approved, including final integrated acceptance. Architecture Phases 1-6 are complete. Cantum Visual Stage 5 is deferred and does not block release planning. Checkpoint 5 release preparation requires separate authorization; Canon migration, Atlas Creator and deployment remain separately gated.

This document retains original milestone scope, approval sequence and dated implementation evidence. Historical closeout statements about pending work describe their dates, not current permission or blockers. Active technical rules live in the subject specifications linked by [INDEX](INDEX.md).

## Completed Architecture Phase 6

Phase 6 is complete and creator-approved, including performance measurement,
preservation, read-only CI configuration and a local publication dry run. The
current architecture optimization roadmap is complete; this is not completion
of the whole project or authorization for further development. [Readiness evidence](PERFORMANCE_AND_RELEASE_READINESS.md)
distinguishes its original results from unexecuted cross-browser/device checks. Current hosted CI evidence is in [PROJECT_STATUS](PROJECT_STATUS.md).
No Canon migration, deployment or Atlas Creator is authorized.

**Completed focused authorization:** following the approved SVG family at `eca903b`,
standardize only the sector grid to unnumbered 8×8 on `map.planeY`, with one
bottom-right light-year cell-width arrow. System View keeps its A–H/1–8 grid,
absolute Y=0 CNU and H8 measurement. Cantum presentation, chart dimensions and
authored positions are unchanged. Icon-minimum adjustments in `visual-config.mjs`
are reserved for the creator; further visual development is outside this task.

**Completed authorization — Cantum Visual Patch Stage 1:** floor-mounted names
were replaced with camera-facing DOM nameplates, retaining
component X/Z placement and contributor-based provisional height. That stage
preserved the then-pending sector grid work, flat fields, icons, data and
navigation. Sigils, envelopes and detached-island rules followed in Stages 2–4.
See [implementation and verification](archive/reports/CANTUM_NAMEPLATES_STAGE1_RESULTS.md).

## Approved foundations and design

**Implemented and committed — intermediate Cantum scale calibration:** `190bd21`
contains Stage 4 and calibration. Sector spheres use 8 CSS pixels with usable
invisible targets and tightened caption offsets; the provisional envelope
half-height is `clamp(radiusLY * .30, .5, 3)`. The separate loopback preview
compares 2/2.5/3-ly radii in a synthetic 40-ly in-memory scenario, not demo JSON.
Existing demo radii, coordinates and all System View scales remain unchanged.
No permanent canonical radius is selected. Stage 5 remains deferred.
The [calibration report](archive/reports/CANTUM_SCALE_CALIBRATION_RESULTS.md) preserves its
original uncommitted-work context and historical verification claims.

**Implemented and committed — Cantum Visual Patch Stage 4:** Stages 1–3 are
creator-approved. Stage 4 preserves full-name fitting and adds registered sigil-only
identities for sufficiently resolved small islands, using the existing field
components and DOM nameplate lifecycle. Fixed overview fitting avoids camera
classification flicker; local envelope sampling preserves separate island heights.
No data, SVG, schema, grid or influence-geometry changes. Stage 5 final refinement,
canonical migration and deployment remain deferred.
[Stage 4 verification](archive/reports/CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md) is historical
evidence from before the combined `190bd21` commit, not today's worktree status.

**Completed authorization — Cantum Visual Patch Stage 3:** Stages 1–2 are
creator-approved. Perspective envelopes now visualize the unchanged 2D field,
with bounded contributor-Y shaping, local nameplate heights and restrained capped
compositing. Top-down stays unchanged. Stage 4 was deferred at that checkpoint;
Stage 5 final refinement remains planned. See
[Stage 3 verification](archive/reports/CANTUM_ENVELOPES_STAGE3_RESULTS.md).

**Completed authorization — Cantum Visual Patch Stage 2:** Stage 1 has been
reviewed and approved. Add the optional current v1.2 sigil identifier, one explicit
noncanonical demo SVG, secure bundling and integration with existing nameplates.
Stage 3 flattened influence envelopes and Stage 4 sigil-only detached-island
rules were deferred at that checkpoint and subsequently authorized separately.
Grid, influence and navigation behavior were preserved. See
[Stage 2 verification](archive/reports/CANTUM_SIGILS_STAGE2_RESULTS.md).

Milestones 1–5 established repository/disclosure rules, the structural data model,
the viewer specification, Cantum rendering, NEXUS identity and asset policy.
Schema v1.0 evolved through v1.1 to the current **v1.3 noncanonical Demo contract**, retaining frozen v1.2 compatibility.
The local visual editor was deferred. Design approval does not authorize all
future implementation or canonical content migration.

## Milestone 6 implementation progression

| Stage | Implemented outcome / present status |
| --- | --- |
| Checkpoint 1 | Pure modern historical resolver and regression tests, separate from legacy v0.1 |
| Checkpoint 2 | Local Vite/Three.js read-only sector/system prototype, selection and navigation |
| Checkpoint 3 | Continuous chronology, catalogue/search, historical InfoCards/fallbacks, local/interstellar routes, real XYZ perspective, three zone geometries and Cantum influence |
| Pre-Checkpoint-4 navigation v1.2 | Object-authored links, exclusive lifetime gate pairs, boundary-derived local gate positions, manual offline generator, read-only freshness, three systems/two Cantums and safety tests |
| Checkpoint 3.6 | Centered square charts, full-map bounded 2D framing, A–H/1–8 system grid and H8 measurement, vertical History, floating panels, centered dismissible InfoCards and hover-driven routes |
| Checkpoint 3.6 audit extension | Repository inventory, documentation authority/status synchronization and retention proposals; no uncertain deletion/move |
| Checkpoint 3.8 and follow-ups | Clipped interactive system zones, 2D hover contours distinguishing physical/chart edges, and the absolute Y = 0 system grid |
| Checkpoint 4.1 Phase 1 | Approved celestial scale specification, additive v1.2 diameter field and tests; no demo/renderer/assets changes |
| Checkpoint 4.1 Phase 2 | Authorized noncanonical demo expansion: 100K/80K/160K CNU charts, offset/peripheral stars, physical measurements, small bodies and one archival-only system; see [results](archive/reports/CHECKPOINT_4_PHASE2_RESULTS.md) |
| Checkpoint 4.1 Phase 3 | Physical radii, projected SVG proxies, 14 starter icons, bounded physical inspection and explicit asset bundling; [verification](archive/reports/CHECKPOINT_4_PHASE3_RESULTS.md); creator-approved |
| Post-Phase-3 maintenance | Synchronize tests/docs with creator-approved System C changes; preserve current authored data |
| Sector grid and Cantum Stages 1–4 | Implemented; Stage 4 included in `190bd21`, alongside the intermediate calibration |
| Intermediate Cantum scale calibration | Committed in `190bd21`; 8px Sector symbols, provisional envelope clamp and isolated in-memory preview; no canonical radius decision |
| Checkpoint 4.2 — NEXUS visual and audiovisual completion | **Audiovisual implementation complete:** 4.2A–I complete and creator-approved; final Checkpoint 4 integrated acceptance is complete. |
| Checkpoint 4.2A — NEXUS and MCR Branding | **Complete and creator-approved (2026-10-23):** approved header/ordinary InfoCard PNGs and exact binary asset admission. |
| Checkpoint 4.2B — Archival Fallback Redesign | **Complete and creator-approved (2026-10-23):** distinct archival interface, universal approved dialogue and front-facing portrait; technical errors retained, no speech. |
| Checkpoint 4.2C — Unified Targeting Reticle | **Complete and creator-approved (2026-10-23):** exact original SVG, 60px cyan rotating hover/focus and 72px static gold lock in both views; independent UI asset admission. |
| Checkpoint 4.2D — System Object Icon Sizing | **Complete and creator-approved (2026-10-23):** centralized 42/36/30/24/21/18/15px System minima; physical geometry, picking and Sector 8px marker preserved. |
| Checkpoint 4.2E — Focus Selection Animation | **Complete and creator-approved (2026-10-23):** 550ms smoothstep camera-owned Focus, exact inspection/zone/anchor endpoints, interruptible and immediate under reduced motion. |
| Checkpoint 4.2F — Map Navigation Transitions | **Complete and creator-approved (2026-10-23):** 420ms decorative chart reveal, synchronous navigation/camera restoration, cancelable and immediate under reduced motion. |
| Checkpoint 4.2G — NEXUS Atlas Opening | **Complete and creator-approved (2026-10-24):** ready-only branded opening and universal approved script; original entry policy superseded by H. |
| Checkpoint 4.2H — NEXUS Voice and Audio Preferences | **Complete and creator-approved (2026-10-25):** two exact recordings, global header toggle, first-entry completion and safe returning-Visitor persistence without autoplay. |
| Checkpoint 4.2I — UI Sound Effects | **Complete and creator-approved (2026-10-25):** five concurrent interface cues and one quiet continuous loop, voice priority and exact eight-MP3 admission. |
| Checkpoint 4 — final creator acceptance | **Complete and creator-approved:** final integrated acceptance; Cantum Stage 5 deferred, not a blocker. |
| Checkpoint 5 | **Release preparation requires separate creator authorization.** Public deployment remains separately gated. Architecture Phase 6 completed local release checks. |

Checkpoint 3.6 is saved in `7d9231c`; earlier navigation implementation is in
`4ff0ecb`. Those reports record their checkpoint's evidence, not current worktree
status. Passing checks does not settle physical-device testing, full
accessibility/cross-browser QA or large-dataset performance.

## Checkpoint 4.1 — phased celestial implementation

Follow [the celestial scale specification](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md).
Phase 1 records the universal 1 CNU = 10,000 km conversion, optional positive
celestial `physicalDiameterKm`, flexible system dimensions and the future
physical/proxy/apparent-minimum contract. It changes no authored demo measurements
or renderer behavior; that phase has been reviewed and approved.

Phase 2 is now explicitly approved and expands the three existing noncanonical
demo systems and adds a fallback-only sector entry with no detail file. Temporary
marker sizes in that phase did not represent physical diameters. Phase 2 has
been reviewed and approved. Phase 3 now implements correctly scaled celestial
models, continuous SVG-proxy transitions, fixed apparent structure markers,
neutral unknown fallbacks and Focus Selection inspection; it has been reviewed
and approved. The original four-phase plan reserved further visual/browser
refinement for Phase 4. Further Checkpoint 4.2 visual refinement requires separate
approval; architecture Phase 2.2 example simplification is complete and
creator-approved. Its closeout does not authorize further visual work.
The NEXUS side-profile PNG is supplied at
`public/assets/nexus/nexus-side-profile.png`; ordinary InfoCard integration is
now complete and creator-approved in 4.2A. At that closeout, broader archival/opening
use remained deferred; the later approved 4.2B and 4.2G records below supersede it.
Preserve the current creator-approved System C geography,
IDs/history, navigation workflow, labels/zones, asset paths and build disclosure
boundaries. Use supplied curator assets only as authorized; do not invent them.

This roadmap is not authorization to create assets now. Follow
[NEXUS identity](NEXUS_VISUAL_IDENTITY.md) and [asset policy](VISUAL_ASSET_POLICY.md).

<a id="checkpoint-42--nexus-visual-and-audiovisual-completion-planned"></a>

## Checkpoint 4.2 - completed scope and phase history

The original 2026-10-23 sequence below is retained as completed history. All nine phases and final Checkpoint 4 integrated acceptance are creator-approved. Original per-phase scope, test counts and pending-work conclusions remain dated evidence. They do not authorize new work; [PROJECT_STATUS](PROJECT_STATUS.md) controls current gates.

### Design authority and fixed limits

- Read this roadmap with [AGENTS](../AGENTS.md), [NEXUS identity](NEXUS_VISUAL_IDENTITY.md),
  [asset policy](VISUAL_ASSET_POLICY.md), [viewer behavior](VIEWER_SPECIFICATION.md),
  [architecture](ARCHITECTURE.md), [celestial scale](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md),
  [Cantum rules](CANTUM_TERRITORY_RENDERING.md), [Demo showcase](DEMO_SHOWCASE.md),
  and [release evidence](PERFORMANCE_AND_RELEASE_READINESS.md). The newest
  specific approved creator decision controls when old visual suggestions differ.
- Preserve approved MCR insignia, NEXUS image identities, the committed reticle
  and all 14 original SVG navigation icons. The intent is a restrained,
  dark NEXUS-operated historical archive, **not** a game HUD.
- No changes to Canon, protected legacy `public/data/`, active noncanonical
  Demo records, frozen fixtures, schemas, IDs, XYZ positions, chronology,
  historical resolver, governance, navigation/gate pairings, political
  influences, Cantum radii, scale (1 CNU = 10,000 km), physical diameters,
  camera contracts or authored geometry. No retcon/new lore through copy.
  The separately approved 4.2B correction only relaxes the deprecated
  `nexusPresentation` schema requirement and removes that obsolete Demo UI-copy field.
- Keep the square chart, floating controls, vertical History and centered
  dismissible InfoCard, the single Three.js renderer, existing projected
  anchors/picking, startup/error distinction, Demo-only validated loader
  and release boundaries. Do not modify Demo JSON to make visual tasks easier,
  enlarge hit targets as a side effect, introduce an extra framework, migrate
  Canon, build Atlas Creator or deploy GitHub Pages.
- `publicDir: false`, explicitly admitted build modules/asset paths, audited
  output, canonical/private exclusions and GitHub Pages base URL
  `/Velara_Atlas/` remain mandatory. Unreleased/private audio cannot
  be committed to the public GitHub repository.

### Implementation and acceptance workflow (every phase)

**Prompt 1 — Implement only the authorized phase.** Verify live `main`, clean
worktree and current module ownership; read controlling docs; make scoped,
independently reversible changes. Run focused automated tests, relevant
regressions, actual normal NONCANONICAL Demo/production-preview browser
checks and asset/security verification. Report changed files, exact commands,
outcomes, URLs, screenshots/manual review steps and limitations. **Stop
without committing or pushing.** No unauthorized follow-on work.

**Creator review.** The creator visually and functionally evaluates desktop,
mobile/narrow, keyboard and pointer/touch alternatives, 2D/3D where relevant,
rapid interruption, historical fallback and accessibility. Corrections stay
within the same phase. An automated pass alone is not creator approval.

**Prompt 2 — Close out only after explicit creator approval.** Recheck
baseline/diff; rerun scoped verifications; synchronize docs; mark *that one
phase* complete; create a reviewed commit; push normally to `origin/main`
only with explicit authorization and verify the remote. Never force-push,
bypass approval gates or start the next phase automatically.

The usual relevant checks include `npm test`, `npm run validate`,
`npm run connections:check`, `npm run build` and
`npm run release:check` plus existing Chromium browser callbacks and
normal-Demo historical/navigation regressions; justify and report
non-applicable/unrun checks. Verify resource lifecycle: no stray
ResizeObservers/listeners/timers/RAF loops, stale objects or growing WebGL
resources. Installed Chromium tests do not certify physical devices,
Firefox/Safari/WebKit, assistive technology or deployment; those remain
separate review/publication gates.

### Phase 4.2A — NEXUS and MCR Branding

**Status: complete and creator-approved, 2026-10-23.** The creator reviewed and
approved the working header and ordinary InfoCards, then separately authorized
this implementation/documentation closeout and one normal push to `origin/main`.

**Purpose/scope:** Apply existing approved studio imagery contextually:
`public/assets/nexus/mcr-insignia.png` in the header and
`nexus-side-profile.png` in ordinary InfoCards. Retain
`nexus-form.png` for later fuller archival/opening compositions.
Inspect each supplied image before placement. Explicitly admit only the
approved PNGs into Vite/production auditing; optional optimized delivery
copies cannot alter or replace originals.

**Must not change:** chart layout, historical facts, dialog semantics,
world data, SVG icon family or imagery itself.
**Acceptance:** compact legible header; undistorted picture; long/empty
InfoCards readable, dismissible and keyboard-focus-correct; mobile text
takes precedence over portraits; missing image has graceful fallback;
release audit recognizes only trusted PNG files and valid subpath URLs.
**Visual review:** header and several long/short InfoCards, desktop/mobile,
portrait/background/cropping. **Depends on:** existing source art and InfoCard
architecture. **Approval gate:** creator accepts art positioning and binary audit.

**Implemented result:** original MCR insignia beside the Atlas title at 32 CSS px
(24 px on narrow screens); original side-profile beside the ordinary record
heading at 96 px, reduced to 64 px for narrow/dense records and hidden at widths
≤360 px or heights ≤600 px. Images use `object-fit: contain`; image failures hide
the image without a broken placeholder. Logo alt text identifies MCR; the portrait
is decorative beside the existing NEXUS label. Centered dialog, close/Escape,
focus return, facts/actions and independent square chart are preserved.

Static Vite imports admit only these two PNGs. `scripts/png-assets.mjs` pins their
source SHA-256 hashes; the output audit compares binary bytes and approved names,
rejects duplicates/missing/unreferenced assets and retains all fifteen existing
SVGs, dataset checks, canonical/private exclusions and `/Velara_Atlas/` URLs.
No original artwork, datasets, schemas, historical or map semantics changed.

**Verification:** final `npm test` passes 275 tests (zero failed/skipped), plus
`npm run validate`, `npm run connections:check`, `npm run build`,
`npm run release:check` and `git diff --check`. Tests use the ignored workspace
temporary directory to avoid the sandbox's Windows temp-path restriction.
The production audit verifies 26 files: HTML, seven JS, one CSS, fifteen SVGs
and exactly two PNGs, totaling 2,492,994 bytes. Focused rejection coverage includes
corrupt/truncated/appended, missing, duplicate, unapproved and unreferenced PNGs,
wrong-base HTML URLs, reserved inputs and unsupported image/audio outputs.
`tests/browser-branding4_2a.mjs` passes on normal Demo and production preview:
desktop/narrow/landscape, keyboard/focus, year/navigation, 200% CSS text scaling,
image-failure fallback and both production PNG requests returning HTTP 200.
Existing navigation, layout, viewer-module, touch-emulation, celestial-scale,
resource-lifetime and production release callbacks also passed implementation review.

**Remaining limitations:** unchanged PNG originals add 1,751,093 bytes; the
existing Vite chunk-size advisory remains. Physical devices, non-Chromium browsers,
screen readers and actual browser zoom are not certified by these checks.
Creator approval covers 4.2A only; 4.2B–I, final Checkpoint 4 acceptance/Cantum
Stage 5, deployment, Canon migration and Atlas Creator remain separately gated.

### Phase 4.2B — Archival Fallback Redesign

**Status: complete and creator-approved, 2026-10-23.** The creator reviewed and
approved the archival composition, front-facing portrait, exact message, Return
behavior and responsive presentation, then separately authorized this closeout,
one reviewed commit and a normal push to `origin/main`. The earlier correction
explicitly approved the unchanged `nexus-form.png` as a third PNG, superseding
the initial two-PNG/reused-side-profile limit for this archival context only.

**Purpose/scope:** Replace the generic map-status archival presentation
with a NEXUS-style text/visual archival notice using approved portrait,
resolved system name/year, publication-accurate unavailable-detailed-chart
message and Return to Sector. Script text must receive creator approval;
no voice yet. Use the current `sys_0004` NONCANONICAL fallback.

**Must not change:** historical knowledge filters, registered detail files,
loader/recovery semantics or historical Demo data. The creator-approved correction
only makes legacy sector `nexusPresentation` optional/deprecated and removes that
obsolete UI-copy object from active Demo; frozen fixtures and Canon stay unchanged.
**Acceptance:** pre-discovery records stay absent; known system with
`publicDetailPath: null` yields archive notice; released partial charts
remain valid charts; invalid/missing detail, WebGL or startup failure
is a technical error with retry, **never** normal fallback; no future-name
leak; accessibility/return navigation maintained.
**Visual review:** before/after year boundary, archive card versus technical
error, mobile, keyboard, focus return. **Depends on:** A.
**Gate:** creator approves notice copy and composition.

**Implemented result:** a dedicated nonmodal archival section inside the existing
square viewport, owned by `archival-view.mjs`, appears only for resolved
`archival_fallback`. Name/year use current public history. All universal strings
come from the exact validated `public/content/nexus/fallback-data.json` import;
world-specific copy is ignored. The full front-facing portrait is contained
without crop/stretch, reduced on mobile and hidden on smallest/shortest layouts.
Image failure preserves text and navigation. Return invokes existing Sector
navigation; entry focuses the heading, routine history refreshes retain focus,
and exit restores map focus. Header navigation, History, Catalogue and the 4.2A
dialog/header remain intact. Technical failures/Retry and valid empty or partial
charts remain separate; a year before discovery returns to Sector without leakage.

**Approved wording:** title `NEXUS // ARCHIVAL NOTICE`; subtitle
`DETAILED SURVEY UNAVAILABLE`; exact message:

> Ah, this one. Yes, the system is documented. Unfortunately, its detailed survey isn't included in your edition of the archive. How disappointing. For you, I mean.

This is approved public UI dialogue, not new historical metadata. It may supply
the fallback script for separately authorized 4.2H; no voice/audio is implemented.

**Verification:** final `npm test` passes 281 tests (zero failed/skipped), plus
validation, connection freshness, build, release audit and `git diff --check`.
Focused archival browser regression passes on normal Demo and production preview:
899/900/1200 A.E., resolved names, both returns, all released charts, partial/empty
charts, technical failures/Retry, missing portrait/configuration, keyboard/focus,
touch emulation, long names, four desktop/mobile/landscape viewports, 200% CSS text
scaling and repeated entry/exit with stable resources. All three PNG URLs return
HTTP 200 beneath `/Velara_Atlas/`. The audit verifies 28 files, fifteen exact SVGs
and three exact PNGs, 4,484,376 bytes; canonical/private and dataset checks remain.

**Remaining limitations:** small/short/enlarged-text layouts scroll vertically
within the square to reach Return. Original PNGs total 3,737,805 bytes; the existing
Vite large-chunk advisory remains. Chromium emulation/CSS scaling do not certify
physical devices, other browsers, actual zoom or screen-reader output. 4.2C–I,
final Checkpoint 4 acceptance, Cantum Stage 5, deployment, Canon migration and
Atlas Creator remain separately gated. No deployment is part of this closeout.

### Phase 4.2C — Unified Targeting Reticle

**Status: complete and creator-approved, 2026-10-23.** The creator reviewed and
approved the original-artwork treatment, cyan rotation, gold lock, sizes,
visibility, interactions and responsive presentation, then separately authorized
one implementation/documentation closeout commit and normal push to `origin/main`.

**Purpose/scope:** Use the unchanged FINAL creator SVG
`public/assets/ui/nexus-reticle.svg` from
`6b4bc5f92e1ef7fc7fd1740da5cc3d2217b8a1f0`, with 128×128 viewBox.
Do not redraw/reinterpret/simplify. Admit through a **separate strictly
trusted UI SVG** strategy; preserve the narrower starter-icon SVG validator.
Test a non-destructive recoloring technique before choosing it.

**Hover or keyboard focus:** cyan preferred `#00d6ff`, subtle continuous
rotation and slightly smaller, disappears when inactive; include Sector
star-system markers as well as eligible System objects.
**Selected:** same artwork gold `#e6ba7b`, static and larger, persists
after pointer leave and when a different entity is hovered. Both may
coexist on distinct entities; selecting a new one transfers the lock.
A 15–25% size difference is provisional subject to visual review.

**Must not change:** coordinates, physical size, picking/hit areas, scene
geometry, route-hover rules, icon art or object history.
**Acceptance:** projected screen anchor remains aligned during pan/zoom/tilt,
top/perspective, year/view changes; no offscreen/hidden ghost, occluded
selection or leaked loops; keyboard/mouse/touch selection survives;
`prefers-reduced-motion` makes reticles nonrotating.
**Visual review:** both map levels/camera modes, selected+other hovered,
dense overlap and actual SVG detail. **Depends on:** existing projection;
can run independently of A/B if creator authorizes. **Gate:** creator
approves hover/lock fidelity and responsive sizing.

**Implemented result:** two decorative, pointer-transparent DOM indicators owned
by `target-reticle.mjs`, using the existing final projected anchors and visibility
decisions. Hover/keyboard focus is 60 CSS px, `#00d6ff`, one clockwise rotation
per 30 seconds; selected is 72 px (20% larger), `#e6ba7b`, static. Selection wins
on the same object; separate objects can show both. Reduced motion removes
rotation. CSS alpha masking preserves the unchanged original geometry and opacity
detail, replacing only display hues. No idle, unpositioned, route/zone, archival,
hidden, occluded or offscreen targeting is invented. Scene rebuild/disposal clears
the owner without extra listeners, timers, RAF loops, meshes or textures. The old
generic proxy circle is retired; keyboard outlines, captions, aria states,
specialized route/zone behavior, 8px Sector symbols and System minima remain.

**Asset verification:** independent exact-source SHA-256 admission and binary
output/name/duplicate/completeness/reachability checks add one UI SVG, leaving the
64×64 starter validator, fifteen previous SVGs, three PNGs, universal fallback
JSON, registered Demo and private/Canon exclusions unchanged. The 7,620-byte source
matches definitive commit `6b4bc5f92e1ef7fc7fd1740da5cc3d2217b8a1f0`.

**Verification:** final `npm test` passes 283 tests (zero failed/skipped), plus
validation, connection freshness, build, release audit and `git diff --check`.
Dedicated normal-Demo and production callbacks pass: both map levels, cyan/gold
precedence, keyboard/Catalogue/dropdown/touch, proxy/model handoff, pan/zoom/tilt,
layers/history/depth/clipping, reduced motion, four responsive viewports, 200%
CSS text scaling and DPR 2. Twenty navigation cycles and complete remounts retain
stable resources. Existing scale, zones, navigation, layout, viewer/lifetime,
branding, archival and production-release callbacks also pass. Production audit:
29 files, sixteen SVGs and three PNGs, 4,494,160 bytes; reticle request HTTP 200 at
`/Velara_Atlas/assets/nexus-reticle-wjkQVr7N.svg`.

**Accepted trade-offs/limits:** fixed rings can overlap near dense markers or sit
inside large inspected bodies. Chromium alpha comparison differed by at most
1/255 from source rendering; physical devices, other browsers, screen readers,
actual browser zoom and low-power GPU performance remain unverified. The existing
Vite chunk-size advisory remains. 4.2D–I remain planned and unimplemented; final
Checkpoint 4 acceptance and Cantum Stage 5 remain outstanding. Checkpoint 5,
Canon migration, Atlas Creator and deployment remain separately gated.

### Phase 4.2D — System Object Icon Sizing

**Status: complete and creator-approved, 2026-10-23.** The creator reviewed and
approved the implemented sizes, reticle/caption relationship and physical-model
presentation, then separately authorized one closeout commit and normal push.

**Purpose/scope:** Centralize/tune *apparent navigational minima only*,
tested at no greater than 1.5× the current values:

| Class | Current minimum | Maximum approved target |
| --- | ---: | ---: |
| Star | 28px | 42px |
| Gas planet | 24px | 36px |
| Regular planet | 20px | 30px |
| Moon | 16px | 24px |
| Small celestial body | 14px | 21px |
| Station/structure | 12px | 18px |
| Short-range gate | 10px | 15px |

**Must not change:** true model size, 1 CNU scaling, handoff
mathematics, categories, hit areas, XY/XYZ coordinates or 8px
Sector system symbols.
**Acceptance:** new minima stored centrally (normally
`src/viewer/visual-config.mjs`), bounded/tested; proxy/model transition
remains continuous; Sector marker unchanged.
**Visual review:** side-by-side screenshots at wide/close zoom in 2D/3D,
small bodies, dense labels and model handoff. **Depends on:** C preferred
for reticle comparisons. **Gate:** creator accepts exact chosen sizes.

**Accepted result:** the original/max table above is retained as design history.
Final System CSS minimum diameters are **42 star, 36 gas planet, 30 other planet,
24 moon, 21 small body, 18 structure and 15 short-range gate**: exactly 50% above
the initial values. Only the frozen central table in `visual-config.mjs` changed
at runtime. Category mapping, unknown-size proxies, authored geometry/XYZ,
`KM_PER_CNU = 10000`, `MODEL_HANDOFF_RATIO = 1.35`, smoothstep opacity, cameras,
hit targets and caption algorithms remain unchanged. Existing diameter-aware
caption offsets apply automatically. The 8px Sector symbols and 60/72px reticles
with 30s cyan rotation/reduced motion remain independent and unchanged.

**Verification:** final `npm test` passes 284 tests, zero failed/skipped;
validation, connection freshness, build, release audit and `git diff --check`
pass. Demo and production sizing/reticle callbacks cover seven categories across
43 objects, four viewports, shared centers, physical inspection, DPR 2, keyboard/
touch, reduced motion, history and archival navigation. Existing celestial,
navigation, layout, zone, module/lifecycle and release callbacks pass. Tests now
derive crossover samples from central minima and retain the original formula.
A before/after comparison of 16 System A objects retains exact physical radii,
XYZ, unit mesh scales, projected centers and hit sizes. Output remains 29 files,
16 SVGs and three PNGs, 4,494,160 bytes; no new application assets or audio.

**Preservation/limits:** original artwork, world JSON, schemas and resolver are
unchanged. The 305,746-byte `nexus-fallback-message.mp3` in baseline `3a1bb44`
remains byte-identical, unimported, unplayed and absent from output; its exact
source path is rejected by the existing input audit. Greater dense-chart overlap
is an accepted presentation trade-off; existing decluttering, Catalogue and Focus
remain. Physical devices, non-Chromium browsers, screen readers and actual browser
zoom are not certified; the existing Vite chunk advisory remains. 4.2E–I, final
Checkpoint 4 acceptance, Cantum Stage 5, Checkpoint 5 deployment, Canon migration
and Atlas Creator remain separately gated. No deployment occurred.

### Phase 4.2E — Focus Selection Animation

**Status: complete and creator-approved, 2026-10-23.** The creator reviewed and
approved movement timing/easing, inspection framing, interruption and reduced
motion, then separately authorized this closeout commit and normal push.

**Purpose/scope:** Animate existing computed Focus camera position/target
over a tentative 400–650ms, retaining established object inspection,
zone framing, chart bounds and camera controls.
**Must not change:** Focus's valid final state, reset semantics,
perspective/top-down restoration, radius/physical inspection math.
**Acceptance:** ending state matches existing instantaneous Focus;
new Focus, manual controls, Reset, timeline, view/mode navigation, disposal
and context loss cancel safely; reduced motion completes immediately
without animated movement or stale handlers.
**Visual review:** small-body inspection, planets, stars, zones,
rapid Focus/Reset in both camera modes. **Depends on:** D.
**Gate:** creator accepts timing/inspection correctness.

**Accepted implementation:** `CameraController` owns one cancelable RAF operation
with **550ms** duration and smoothstep **`t*t*(3-2*t)`** easing. Viewing scale,
zoom and positive clipping ranges interpolate geometrically; target movement is
coordinated with scale. The existing Focus path computes the endpoint with
drawing suppressed, then restores the starting state before moving. No second
renderer, duplicate live OrbitControls, object animation or 4.2F navigation
transition is introduced. Inspection constraints are deferred until exact
endpoint commitment, preserving the original camera/controls/saved-top state.

Manual pointer/wheel/touch and keyboard camera input cancels before controls act;
internal controls changes do not cancel the animation. New Focus, Reset, zoom,
tilt, mode/restore, resize, map rebuild, year change/disappearance, navigation,
archival entry, context loss and disposal invalidate the old generation. Manual
interruption retains the visible free camera and its actual frustum; optional
`focusFrame` snapshots retain that view across history/navigation. Ordinary chart
clamping is unchanged. Reduced motion applies the valid endpoint directly; an
active preference change completes it immediately. Selection, projected reticles,
InfoCard closure and canvas focus return remain intact.

**Verification:** `npm test` passes **306 tests**, zero failed/skipped, including
22 focused camera tests. Twenty frozen endpoints from `0c635da` cover seven
record types in top/perspective and leaving existing inspection for station,
gate and zone Focus. Position, target, orientation/up, zoom, clipping/projection,
inspection limits and saved top view match within `1e-10 * max(1, abs(expected))`;
controlled-clock tests cover continuity, stale callbacks and cancellation.
Validation, connection freshness, build, release audit and `git diff --check`
pass. Normal Demo and production callbacks separately exercise normal/reduced
motion, 12 movements, 13 interruption paths and four viewport sizes. Celestial,
reticle, sizing, navigation, zone, touch, layout, module/lifecycle, archival and
release/accessibility regressions pass. Repeated Focus/Reset retains GPU resource
counts and no queued frame; remount leaves one canvas. No delayed callback can
overwrite the next authoritative camera operation.

**Preservation/limits:** world JSON, schemas, resolver, inspection math, artwork,
4.2D minima, 8px Sector markers and 60/72px reticles are unchanged. Strict source/
output admission, private/Canon exclusions and dataset verification remain intact:
29 files, 16 exact SVGs, three exact PNGs, **4,499,915 bytes**. The 305,746-byte
reserved MP3 remains byte-identical to `0c635da`, unimported/unplayed and absent
from output; browser callbacks observe no audio requests. Local Chromium software
rendering can deliver frames after the 550ms clock deadline; physical-device,
non-Chromium, assistive-technology and actual browser-zoom certification remain
outstanding. Existing Vite chunk-size advisory remains. 4.2F–I, final Checkpoint 4
acceptance, Cantum Stage 5, Checkpoint 5 deployment, Canon migration and Atlas
Creator remain separately gated. No deployment occurred.

### Phase 4.2F — Map Navigation Transitions

**Status: implemented, creator-reviewed and approved (2026-10-23).** The original
planning range and acceptance criteria below are retained; the accepted treatment
and verification record follow them.

**Purpose/scope:** Brief visual record transitions, tentatively
350–500ms: Sector→System, System→Sector and System→other System.
Keep `main.mjs` navigation and `scene-layers.mjs` rebuilding as
the actual source of truth; not simulated interstellar travel.
**Must not change:** resolver, scene resources, history, camera saved
state, routes or interaction semantics; no duplicate renderer/heavy particles.
**Acceptance:** interrupted/repeated navigation, Reset, year change,
error and teardown cannot retain obsolete layers, focus or overlays;
keyboard/touch available; reduced motion direct; fallback still works.
**Visual review:** three paths, very rapid inputs, System fallback,
2D/3D and mobile. **Depends on:** E. **Gate:** creator approves
appearance, timing and cancellation.

**Accepted implementation:** one decorative `map-transition.mjs` owner uses a
finite Web Animation of **420ms**, easing **`cubic-bezier(.42,0,.58,1)`** and
opacity keyframes 1 → .86 at 24% → 0. A dark `rgba(2,12,19,.82)` chart mask and
restrained cyan/teal inset edge reveal the destination. Archival entry uses only
a 2px cyan perimeter, leaving the approved portrait, message and Return action
untouched. This communicates an archival chart change, never physical travel.

All three paths—Sector→System, System→Sector and eligible System→System gate
navigation—use the existing `main.navigate()` callback. History, scene replacement,
camera restoration and focus placement commit synchronously before the reveal.
No old scene, extra renderer, camera flight, dependency, dialogue or media is
introduced. Same-scope requests do not replay the effect. Input (including touch
and keyboard), Reset, Focus, mode/zoom/tilt, history refresh/automatic return,
selection, replacement navigation, context loss and disposal cancel the visual
operation. A generation guard invalidates stale completion callbacks. Reduced
motion skips it; changing the preference cancels an active effect. Missing or
failing Web Animations support leaves direct navigation functional.

**Verification:** all **318 tests** pass, zero failed/skipped, including twelve
focused transition-owner tests and the unchanged frozen Focus endpoints.
Validation, generated-connection freshness, build, release audit and
`git diff --check` pass. The dedicated callback passes normal Demo and audited
production preview, with actual intermediate opacity samples, all three routes,
rapid valid A→B→A→C gate navigation, camera restoration, ten interruption paths,
899/900/1200 archival behavior, reduced motion and four viewports (1280×900,
390×844, 320×740, 844×390). Existing Focus, celestial, reticle, sizing, navigation,
zone, touch, responsive, archival, accessibility/release and lifecycle callbacks
pass. Twenty warmed navigation cycles retain 13 geometries, two textures and one
canvas; teardown removes the decoration and active animation, and remount leaves
one canvas. Remembered perspective cameras and normal/reduced destination states
match within `1e-9 * max(1, abs(expected))`; the 550ms Focus code is unchanged.

**Preservation/limits:** A–E artwork, dialogue, 60/72px reticles and 30s rotation,
42/36/30/24/21/18/15px System minima, 8px Sector symbols, physical scale/handoff,
world data, schemas, historical resolver and geometry are unchanged. Exact
admission/private/Canon restrictions remain: **29 files, 4,501,368 bytes**, sixteen
SVGs and three PNGs. All three PNG URLs return HTTP 200 beneath `/Velara_Atlas/`.
The 305,746-byte MP3 matches `d30681f` byte-for-byte, remains reserved for 4.2H,
unimported/unplayed and excluded. Headless Chromium 139/Intel D3D11 supplies local
browser evidence; software rendering can stall across the animation interval.
Physical-device, non-Chromium, screen-reader and actual browser-zoom verification
remain outstanding, as does the existing Vite chunk-size advisory. At the 4.2F closeout, 4.2G–I remained
planned, unimplemented and separately gated. Final Checkpoint 4 acceptance and
Cantum Stage 5 remain pending; Checkpoint 5, Canon migration, Atlas Creator and
deployment are not authorized. No deployment occurred.

### Phase 4.2G — NEXUS Atlas Opening

**Complete, creator-reviewed and approved, 2026-10-24.** The following original
scope is retained; the completion record below records the approved decisions.

**Purpose/scope:** Short branded welcome/entry using approved NEXUS form
and MCR insignia, readable introduction and explicit enter-with-audio
or silent option. **Visual opening only — no media playback in G.**
Final copy, repeat-visit and persisted-preference behavior must receive
creator review rather than being presumed.

**Must not change:** underlying chart/history/selection merely by opening,
error/retry visibility, public records, or start-up accessibility.
**Acceptance:** both choices work for keyboard/touch; reload, error
and repeated visit behavior deterministic; entering does not change
selected A.E., camera geography or archival state.
**Visual review:** desktop/mobile opening, focus order, silent option,
refresh/retry. **Depends on:** A, B, F. **Gate:** creator approves
script/UI and return policy.

**Approved implementation and script:** `opening-view.mjs` owns the native
opening dialog, contained original front-facing NEXUS portrait, unchanged MCR
insignia and dark/cyan composition. The ready chart is constructed before the
dialog opens; no historical or camera command runs on opening or entry. A finite
**240ms ease-out opacity appearance** is optional; reduced motion skips it and
live preference changes cancel it. Entry never waits for animation.

The only editable introduction source is
`public/content/nexus/opening-data.json`, with exactly these three nonempty strings:

```json
{
  "title": "NEXUS // CONNECTION ESTABLISHED",
  "subtitle": "VELARA ATLAS",
  "message": "Ah, a Visitor. Welcome to the Velara Atlas. You may explore this edition of the archive by system and by year. History has a habit of resisting simple explanations. Fortunately, you have me. Do try to keep up."
}
```

This is the **approved 4.2G script for future 4.2H voice production**, independent
of world records and the existing approved fallback script. No welcome recording
or playback is implemented or admitted. Edit only this JSON and rebuild to change
the introduction; revised released wording still requires creator approval.

**Historical 4.2G entry/return policy (superseded by the 4.2H correction below):** show once after each successful fresh page load,
including reload/Retry; never reopen during ordinary navigation, year changes,
Reset, Focus or same-document remount. No browser storage suppresses it.
`Enter with audio` records only in-memory `audio` intent; `Enter silently` and
Escape record `silent`. Both close immediately and focus the real map canvas,
preserving year, scope, selection, layers and exact camera state. The visible note
is: "Voice playback is not available in this preview. Both entry options currently
open the Atlas without sound." A second note states "Escape enters silently."
Native modal focus isolates background controls; entry buttons retain visible
focus. Responsive contained artwork yields to scrollable text/actions on small,
short or enlarged-text screens. Failed images hide without blocking entry.

**Startup/security/lifecycle:** missing or malformed opening content fails through
technical startup feedback/Retry, never a false connection-established notice.
Context loss hides the opening and focuses Retry. `Lifetime` removes listeners,
closes the dialog and cancels its animation; remount leaves one canvas and one
opening element. The exact two-file NEXUS content audit validates fallback/opening
source paths, rejects redirects and mid-build changes, and requires both modules
in the build. `publicDir: false`, PNG/SVG pins, binary output equality,
reachability and dataset/private/Canon restrictions remain unchanged.

**Verification:** 330 automated tests pass, including twelve focused opening tests;
validation, connection freshness, build, release audit and whitespace checks pass.
Dedicated normal-Demo and audited-preview browser checks cover both entry intents,
Escape, exact copy, reload, no state/camera rebuild, touch/keyboard, normal/reduced
motion, live preference changes, image/startup failure and lifecycle. Existing A–F
regressions remain applicable; see [closeout evidence and limits](PERFORMANCE_AND_RELEASE_READINESS.md#checkpoint-42g-opening-closeout--2026-10-24).
Production remains 29 files, sixteen exact SVGs and three exact PNGs; no audio or
raw UI JSON output. The reserved 305,746-byte fallback MP3 is unchanged and excluded.
Physical-device, non-Chromium, screen-reader and actual browser-zoom certification
remain unverified; CSS text scaling is checked. The existing chunk-size advisory
remains. At the 4.2G closeout, 4.2H–I remained planned and unimplemented; final Checkpoint 4 acceptance and
Cantum Stage 5 remain pending. Checkpoint 5, Canon migration, Atlas Creator and
deployment remain unauthorized. No deployment occurred.

### Phase 4.2H — NEXUS Voice and Audio Preferences

**Complete and creator-approved, 2026-10-25.**

**Accepted creator correction (2026-10-25):** the
once-per-fresh-load policy recorded under 4.2G above is historical and superseded.
Show the unchanged opening only until an explicit first-entry decision. Audio
entry saves completion and audio ON; silent entry and Escape save completion and
audio OFF. Completed Visitors bypass the opening after successful startup,
restore the header preference and never automatically play the entry recording.
Header toggles change only audio. Strict legacy Boolean preferences migrate once;
clearing completion alone restores first-entry behavior. Unavailable storage
retains functional in-memory choices. The creator reviewed and approved this
implementation and authorized its documentation and local commit; no push or
deployment was part of that H closeout. It did not authorize 4.2I; the later I record follows.

**Purpose/scope:** Only **two** prerecorded creator-approved speeches:
a short welcome on audio-enabled entry and the archival fallback message
whose text was approved in B. Add persistent, accessible header audio control,
respect silent entry and browser autoplay gesture rules. Optional distinct
voice/SFX settings may be introduced only if warranted by simple UI.
No narrated ordinary InfoCards, ambient music, runtime AI chat or paid
speech-generation APIs.

**Must not change:** known/missing survey semantics, historical chronology,
normal navigation, script authority; no private audio in public Git.
**Acceptance:** audio never plays against mute/silence; triggers only on
deliberate entry/fallback, not each timeline rerender; stops/replaces cleanly
on navigation, mute, disposal, reload and errors; missing audio leaves
text and navigation usable. Preference/storage-unavailable behavior tested;
only creator-cleared recordings admitted, binary release audit passes.
**Audio review:** both clips, interruption, refresh, denied autoplay,
silent choice and mobile. **Depends on:** B/G and final approved
script/recording assets. **Gate:** explicit creator audio approval, received for H.

**Implemented ownership and playback:** `audio-controller.mjs` owns global audio,
first-entry completion, the persistent accessible header toggle and at most one
lazy speech element. `voice-assets.mjs` imports only the two exact approved URLs.
`main.mjs` requests entry acknowledgment synchronously after audio-choice
dismissal, or fallback speech only on explicit changed-scope navigation resolving
to `archival_fallback`. Header ON, restored ON, ordinary renders, year changes,
panels and resize never start speech. OFF, navigation, historical refresh,
technical error, context loss, pagehide, remount and disposal stop/release speech;
generation guards isolate obsolete promises/events. Failed playback preserves
text and navigation without automatic retries. No SFX or ordinary narration.

**Persistence:** `velara-atlas:audio-enabled:v1` retains strict `true`/`false`;
`velara-atlas:first-entry-completed:v1` accepts only `true` as completion;
`velara-atlas:first-entry-migration:v1` prevents repeated legacy inference after
completion is cleared. Only a strict legacy Boolean with both entry keys absent
migrates. Header-only choices mark the modern protocol without completing entry.
No cookies, identity, playback progress, world state or camera data is stored.
The original opening/fallback JSON, 240ms appearance, artwork and A–G behavior
are unchanged. The entry clip is the approved acknowledgment, not narration of
the entire written introduction. The current note is: "Audio-enabled entry
activates NEXUS speech. You can change this setting in the header."

**Security and verification:** exactly two original MP3s are admitted with pinned
sizes/SHA-256, regular-file/ancestor checks and verification across build stages.
Output auditing requires their exact hashed names, binary equality, completeness
and reachability; existing SVG/PNG, dataset, Canon/private and source-map rules
remain. `publicDir: false` and `assetsInlineLimit: 0` remain. Production totals
32 files / 4,940,241 bytes: sixteen SVGs, three PNGs and two MP3s.
348 automated tests and validate/connections/build/release/diff checks pass;
15 Demo and 9 production callbacks plus seven independent browser starts verify
the corrected policy and A–G regressions. See [full evidence and limits](PERFORMANCE_AND_RELEASE_READINESS.md#checkpoint-42h-voice-and-first-entry-closeout--2026-10-25)
and [exact recordings/admission](VISUAL_ASSET_POLICY.md#13-implemented-checkpoint-42h-exact-audio-admission).
Physical-device, non-Chromium, assistive-technology, actual browser-zoom and
speaker/fidelity certification remain outside this evidence. At H closeout, 4.2I
remained separately gated; final Checkpoint 4 acceptance and Cantum Stage 5 remain pending.

### Phase 4.2I — UI Sound Effects (implement LAST)

**Complete and creator-approved, 2026-10-25. Creator-approved scope amendment:**
the original no-ambience scope below is retained as
history and superseded for this phase only. The creator supplied five exact
interface recordings and one quiet archival-computer loop. Generic button/summary
activation and successful dedicated actions are independent: a Focus button must
start both click and Focus Lock concurrently, never substitute or sequence them.
The same applies to button-driven record, chart and committed-year actions.
Continuous history input remains live, with one confirmation at commit/held-key
release. Speech takes priority and suppresses foreground effects. One master
Audio preference controls all eight recordings; no extra UI or storage keys.
Returning saved ON never autoplays; ambience begins on a permitted deliberate
interaction, or after natural audio-entry acknowledgment, remains continuous
across chart/year operations, ducks for speech and pauses while hidden. No source
audio edits, music, new dialogue or visual synchronization effects are authorized.
All six new assets require the same exact binary admission as the two H clips.
The creator personally approved all six original recordings, concurrent generic/
dedicated playback, speech priority, loop continuity, ducking and current balance.
Accepted native levels are speech 1.00, click 0.35, dedicated 0.45 and ambience
0.08, with 180ms ambient restoration. No audio adjustment accompanies closeout.

`interface-audio.mjs`, owned by the root audio lifetime, retains two bounded
foreground slots and one lazy loop. Same-kind repeats coalesce within 35ms;
mute, navigation, speech, visibility, context loss and disposal retain explicit
cancellation/cleanup. Media failure leaves text and navigation functional. The
existing H storage contract, historical/camera state and A–H visuals are unchanged.
Eight exact MP3s use static imports, pinned source/output bytes and filenames,
completeness and reachability checks; sixteen SVGs and three PNGs remain unchanged.

Final checks pass: 369/369 automated tests, including 21 interface-audio tests,
validation, connections, build, release audit and diff validation. Reviewed completed
browser evidence is 17/17 Demo callbacks, 11/11 production callbacks and seven
independent browser starts; closeout changes documentation only. Output is
39 files / 5,399,246 bytes. See [verification and limitations](PERFORMANCE_AND_RELEASE_READINESS.md#checkpoint-42i-interface-audio-and-ambience-closeout--2026-10-25)
and [exact audio admission](VISUAL_ASSET_POLICY.md#14-implemented-42i-binary-admission--2026-10-25).
Final Checkpoint 4 integrated visual acceptance requires separate authorization;
Cantum Stage 5 remains pending. Checkpoint 5, Canon migration, Atlas Creator and
deployment remain unauthorized.

**Original scope (historical; ambience exclusion superseded above):** Add a small creator-approved set of restrained technical
cues for meaningful selections, panel actions, committed timeline navigation,
system changes and archive entry (fewer is fine); no music or ambience.
Throttle/coalesce fast repeats and continuous slider movement.
**Must not change:** source of selection, route, history or mute decisions;
no full sound-engine architecture.
**Acceptance:** master mute and silent entry respected; no slider sound
storm, excessive overlap, stale audio or broken UI when sound fails;
SFX files individually public-release-approved and explicitly audited.
**Audio review:** normal/rapid controls, timeline drag, concurrent
voice/cues, mute and mobile. **Depends on:** H. **Gate:** creator approves
final restrained sound and code/assets.

### Resolved design choices and integrated acceptance

The creator has approved the combined Checkpoint 4 result, including final integrated acceptance. Opening/first-entry behavior, original scripts and recordings, exact reticle, and the single audio master follow the completed B-I amendments and subject contracts. No repeat acceptance milestone is pending.

Cantum Visual Stage 5 is **deferred and not required now**. Existing Stages 1-4/calibration and documented sampling/device limitations are retained. Stage 5 does not block Checkpoint 5 release planning, and deferral grants no permission to alter political membership, Gaussian math, radii or authored geometry.

Completion does not authorize Checkpoint 5 work, public deployment, Canon migration or Atlas Creator. See [PROJECT_STATUS](PROJECT_STATUS.md) for the next possible separately authorized workstream.

## NEXUS Public Entrance Integration — Complete and Creator-Approved (2026-10-26)

This subsequent amendment is complete and creator-approved, including manual visual and functional acceptance. One audited production build emits the NEXUS welcome/teaser at index.html and the existing noncanonical Atlas at demo.html. Both use the approved first-entry/completion/audio model; the homepage loads no Atlas renderer or Demo data. Existing npm commands, `/Velara_Atlas/`, original recordings/artwork and Demo records/restrictions are retained. See [implemented scope](PUBLIC_ENTRANCE.md) and [automated verification and browser limits](PUBLIC_ENTRANCE_VERIFICATION.md). The completed 4.2G-I records above remain unchanged historical evidence.

The future canonical release will replace the temporary index.html presentation with the actual canonical MCR Velara Sector Atlas. Retirement or archival of demo.html needs separate creator approval. Canon migration, Atlas Creator and public deployment remain separately authorized workstreams; no release date or deployment is established here.

## Checkpoint 5 — Phase 1: GitHub Pages Deployment Preparation — Complete and Creator-Approved (2026-10-27)

The creator approved the manual-only main-branch Pages workflow and deployment operating instructions. The two-page audited Vite artifact, ignored dist/, automatic Ubuntu/Windows verify.yml, required pre-upload checks, existing commands/base and publication safeguards are preserved. This closeout formally adopts 0.5.0 (Pre-release) as a deliberate milestone rebaseline and establishes [VERSIONING_POLICY](VERSIONING_POLICY.md); version numbers do not measure percentage completion. Documentation, verification, one commit and normal push to main are authorized. See the [operating guide and separate verification records](GITHUB_PAGES_DEPLOYMENT.md).

The first live Pages deployment has not been executed; hosting, public URLs and the deployment action are not live-verified. Manual GitHub configuration and public deployment remain separately authorized, as do Canon migration, Atlas Creator and other Checkpoint 5 work. No Git tag or GitHub Release is created by this closeout.

## Subsequent publication and separate workstreams

A separately authorized Checkpoint 5 release-preparation scope may cover static build review, repository-subpath URLs,
runtime/fallback behavior, disclosure audit, accessibility and performance.
GitHub Pages is a target host, not an active deployment. Public deployment requires its own explicit authorization.

Canonical v0.1 → proposed modern schema migration remains a **separate creator-approved workstream**
requiring an explicit permanent-ID crosswalk and historical review. Never promote
demo systems, coordinates, routes or statistics to canon. See
[migration safeguards](LEGACY_MIGRATION_PLAN.md).

A general publication pipeline, arbitrary dataset selection, moon-relative coordinates,
orbital simulation, exact legal boundaries and the local editor remain outside
the current task. Preserve the existing authoring/recovery workflow and ID Finder.
Phase 3F implementation and the scoped noncanonical Demo additions are complete
and creator-approved. Their implementation and status synchronization are committed together.
Architecture Phase 4 is complete and creator-approved; Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization. See [MANUAL_AUTHORING](MANUAL_AUTHORING.md).

## Feature showcase gate

Significant authorized viewer features need automated tests and a representative
normal-Demo example before creator visual review, unless the creator opts out.
After corrections, explicit approval and a separate closeout authorize docs,
commit and push. Nonvisual/internal work needs no filler entities. Preserve TEST,
Development/calibration, Demo and Canon separation. [DEMO_SHOWCASE](DEMO_SHOWCASE.md)
records the completed, creator-approved Phase 3F walkthrough and intentional additions.

## Completed Architecture Phase 4 boundary

The viewer now separates UI state, catalogue, InfoCard model/view, timeline,
layer controls, camera, picking, scene layers and projected labels. `AtlasMap`
and existing DOM hooks remain compatible; defaults, HTML/CSS, authored data,
historical algorithms and publication allowlists are preserved. See
[architecture ownership](ARCHITECTURE.md#phase-4-viewer-module-ownership).
Architecture Phase 4 is complete and creator-approved; its implementation and
completion documentation are committed together. No new Demo filler,
Atlas Creator, Canon migration or deployment is authorized. Phase 5 is complete and creator-approved. Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

## Completed Phase 5 local previews

The local Development preview now has named JSON scenarios, replayable presets,
validated presentation controls and read-only diagnostics. The original 15-system
calibration JSON and normal v1.3 Demo remain unchanged. See [scenario operations,
presets and tests](../README.md#named-local-preview-scenarios-completed-phase-5).
Phase 5 is complete and creator-approved. Its implementation and status
documentation are committed together. Phase 6 is complete and creator-approved; no editor, Canon migration or deployment is authorized.
