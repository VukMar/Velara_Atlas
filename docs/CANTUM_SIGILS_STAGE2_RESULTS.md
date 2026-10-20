# Cantum Visual Patch — Stage 2 results

Implemented Stage 2 only against clean local `main` at
`d21b7c8e9481e7513d94d223dc7986bb1621fe18`. Stage 1 is creator-approved.
No commit, push, deployment, 3D influence volume or new island-layout rule was
undertaken.

## Schema and historical behavior

Current v1.2 Cantum records accept optional `sigil`: null or a string of at most
64 characters matching `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`. This is a stable registry
identifier, never a path/URL. Null and omission both mean no image, with no
generic fallback. A syntactically valid but unregistered identifier renders
name-only. The field is not accepted on systems, celestial bodies or structures.

The modern `resolveCantum()` copies the authored string/null only after existing
historical eligibility succeeds. Omission stays omitted; input is not mutated.
Eligibility still means an applicable name or status, as before; sigils cannot
make a Cantum eligible. Static identity metadata does not add a dated history.
The version remains `1.2.0`; old records are valid, with no breaking migration.
Frozen schemas/fixtures and canonical public records are unchanged.

The only authored demo changes are:

- `can_0001`: `"sigil": "test-cantum-a"`, beside the unchanged `Test Cantum` name.
- `can_0002`: `"sigil": null`, retaining name-only `TEST Second Cantum` at and
  after 700 A.E.; absent before eligibility, including the tested 699 snapshot.

All other names, dates, histories, descriptions, political memberships, colors,
geography, elevations and navigation records are preserved.

## SVG and closed registry

Exactly one original noncanonical fixture was added:
`public/assets/icons/cantums/test-cantum-a.svg`. It uses a transparent 64×64
viewBox, a blue hexagonal outline and cyan diamond/central point. It contains no
text, letters, scripts, remote resources, embedded images, fonts or filters.
It is not a final political emblem or a statement of Continuance canon.

`src/viewer/sigil-registry.mjs` recognizes only `test-cantum-a`, using a literal
Vite asset URL. Null/omitted/unknown keys return no URL, including prototype-like
keys; authored strings never become filenames or fetch targets.
`icon-manifest.mjs` keeps the existing fourteen `ICON_PATHS` intact and adds a
separate one-entry `SIGIL_PATHS`. `scripts/svg-assets.mjs` supplies the combined
explicit fifteen-file inventory to Vite and the output audit.

`publicDir: false`, the seven-file demo-data allowlist, three detail loaders,
source-module restrictions and canonical/private/source-map scans remain intact.
The output audit requires every approved SVG once, with exact content and expected
name, and rejects unexpected files or duplicates. It now exposes the same audit
as a function so negative output checks run in isolated temporary directories.
The production build has **21 outputs, including exactly 15 SVGs**. The new
sigil resolves to `/Velara_Atlas/assets/test-cantum-a-BW03m4et.svg` in this build.
All fourteen navigation SVG sources remain byte-identical to the approved baseline.

## Nameplate integration and lifecycle

The optional decorative image and full text share one inline-flex nameplate,
world anchor, projection, zoom-only opacity, Names preference and viewport-edge
containment. The image is 24 CSS px at desktop overview, responsively bounded
to 18–24 px; the gap is .35em. Its artwork colors do not replace Cantum text tint.
Null/omitted/unknown values create no image and reserve no empty slot. A failed
image is removed, leaving text; the existing render path recontains the smaller
group. No generic unknown symbol, extra pointer target or animation loop exists.

One once-only error listener belongs to each image; map/year rebuilds and scene
disposal remove it. Obsolete images cannot trigger later updates. Every existing
eligible detached island can share its Cantum's sigil; component placement and
small-region rejection remain unchanged. System View has no nameplates or sigils.
The provisional Stage 1 contributor-height calculation and flat influence surface
are preserved. Grid annotations and marker controls retain their higher DOM layer.

## Files changed

- Schema/data: `schemas/atlas.schema.json`, `examples/demo_atlas/cantums.json`.
- Resolver: `src/core/history.mjs`.
- Viewer: new `src/viewer/sigil-registry.mjs`; `icon-manifest.mjs`,
  `cantum-nameplates.mjs`, `map-scene.mjs`, `style.css` in the same directory.
- Asset: the one SVG listed above.
- Security/build: `scripts/svg-assets.mjs`, `scripts/audit-demo-build.mjs`,
  `vite.config.mjs`.
- Tests: new `tests/cantum-sigils.test.mjs`,
  `tests/browser-cantum-sigils.mjs`; test wiring in `package.json`.
- Documentation: `AGENTS.md`, `docs/DATA_MODEL.md`,
  `CANTUM_TERRITORY_RENDERING.md`, `VISUAL_ASSET_POLICY.md`,
  `NEXUS_VISUAL_IDENTITY.md`, `VIEWER_SPECIFICATION.md`, `ARCHITECTURE.md`,
  `DEVELOPMENT_ROADMAP.md` and this report.

## Verification

| Check | Result |
| --- | --- |
| `node --test tests/cantum-sigils.test.mjs` | PASS: 5/5 focused schema, history, registry, lifecycle and exact-output/security tests |
| `npm test` | PASS: 163/163 Node tests, legacy chronology and demo validation; no existing tests removed or weakened |
| `npm run validate` | PASS: strict v1.2, reference/bounds/history checks and read-only generated freshness |
| `npm run connections:check` | PASS: no generation or navigation edits |
| `npm run demo` | PASS: legacy chronology demonstration |
| `npm run build` | PASS: 21 outputs, exactly 15 approved SVGs; existing >500-kB main-chunk advisory remains |
| Negative output audit | PASS: rejects extra/duplicate SVG, missing sigil, private RTF and canonical-data reference |
| New sigil browser suite — development | PASS: A/B in both cameras, upright low-angle view, group fading/toggles, 699 eligibility, three mobile sizes, repeated maps, two detached islands sharing two images, unknown/null behavior, listener cleanup and real asset-failure fallback; no unexpected console errors |
| New sigil browser suite — production preview | PASS under `/Velara_Atlas/`: emitted SVG URL/loading, both Cantums/cameras, history/navigation/mobile and deliberate asset-failure fallback; no unexpected console errors |
| `browser-labeling.mjs` | PASS: existing Stage 1 projection/fade/history/islands/disposal and caption/collision/dense-system checks |
| `browser-grid-zero.mjs` | PASS: sector/system grids/scales, both cameras, independent preferences and authored XYZ; no console errors |
| `browser-layout3_6.mjs` | PASS: desktop, three mobile layouts, grid/H8, panels/InfoCard, routes, pan/zoom and perspective restoration |
| `browser-navigation-v1_2.mjs` | PASS: 38 pointer-selected objects, 16 local endpoints, three interstellar routes, history/destinations and archival fallback |
| `browser-checkpoint3.mjs` | PASS: historical/search/facts, archival/partial/unplaced states and technical loading-error/Retry distinctions |
| `browser-celestial4_1.mjs` | PASS: 13 known bodies, both cameras, seven transition samples, layers/history/mobile/DPR 2, icon failure and repeated systems; no console errors |
| Preservation / `git diff --check` | PASS: exact two-field demo change; navigation icons, grids, influence algorithm/surface, system JSON/connections, visual config, frozen fixtures and canonical data unchanged; whitespace clean |

The production run exercises live UI/asset behavior; isolated constructor/listener
fixtures run in development and Node, where those source modules are directly
importable. They are not exported as production debug hooks. No requested check
was unavailable. Local ignored visual evidence is in
`.playwright-mcp/sigils-stage2-top.png` and `sigils-stage2-perspective.png` there.

## Deferred work and limitations

Stage 3 flattened influence envelopes and Stage 4 sigil-only detached-island
logic remain planned. The existing provisional heights, label eligibility and
decorative DOM composition remain; there is no new collision solver, history of
changing sigils, custom artwork loader or automatic unknown emblem. The single
emblem is a development fixture. Browser evidence is Chromium emulation, not
physical mobile hardware or cross-browser certification. No blocking issue was
observed. Stop after Stage 2 for creator review.
