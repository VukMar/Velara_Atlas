# Checkpoint 3.6 — Implementation and verification

> **Historical evidence.** Original dates, counts, conclusions and work orders below describe their checkpoint, not current authority. See [project status](../../PROJECT_STATUS.md). Recorded old paths and local artifacts are provenance, not setup instructions.

> **Retained implementation report for `7d9231c`.** The additional documentation
> synchronization audit starts from that accepted layout commit. Its inventory,
> recommendations and freshly rerun checks are in
> [REPOSITORY_AUDIT_3_6.md](REPOSITORY_AUDIT_3_6.md). Original evidence below is
> retained rather than rewritten as current results.

Implemented in the current local checkout, starting from clean commit `f6cad21`.
No commit, push, merge or deployment was performed. The [layout revision](../../LAYOUT_REVISION_3_6.md)
explicitly supersedes the older permanent sidebar/bottom timeline requirements.

## Changes

- Centered square viewport in orthographic and perspective modes. Full declared
  X/Z framing, minimum zoom 1, bounded 2D pan/cursor zoom and full-chart Reset.
  Invalid square extents fail clearly in the viewer and production build;
  authored data is never rescaled. Real XYZ and independent Y are preserved.
- World-space system grid with eight A–H columns and eight 1–8 rows. H8 shows
  `extent / 8`: **12.5K CNU** for all current 100,000-CNU system charts.
- Closed-by-default floating catalogue, controls, layers and vertical History.
  Header keeps year/location visible; overlays never move or resize the chart.
- Centered dismissible NEXUS InfoCards preserve record fields, navigation,
  fallbacks and technical errors. Close/Escape clears selection, returns focus
  and leaves camera state intact. No card on initial load.
- Routes brighten on gate/stroke hover or keyboard focus, then immediately
  restore their transport styling. Selected marker targeting is independent.
- Camera snapshots retain the prior top-down framing even when a history change
  or another map reconstruction occurs while in perspective.

## Baseline and automated checks

Baseline commands were run before editing:

| Command | Baseline result |
| --- | --- |
| `npm test` | Exit 1: 114 Node tests, 105 passed, 9 failed |
| `npm run validate` | Exit 0: strict release and cross-file validation passed |
| `npm run connections:check` | Exit 0: graph and derived positions current |
| `npm run build` | Exit 0: build and output audit passed |

The nine pre-existing failures were hardcoded assumptions about the older live
demo's maximum IDs, coordinates and dates. Current authored demonstration data
was already valid and current. The original accepted v1.2 JSON from commit
`4ff0ecb` is now copied byte-for-byte into `tests/fixtures/v1_2/`, and the existing
generator regression cases use that fixed input. Their assertions, rejection
cases and safety/recovery tests are preserved. ID Finder's live smoke/CLI tests
derive the current maximum; its synthetic exact-value/duplicate tests remain.
The live dataset continues to be checked independently by validation, freshness,
viewer tests and browser navigation. No live demo record was changed to pass tests.

Final commands:

| Command | Result |
| --- | --- |
| `npm test` | Exit 0; legacy checks passed; **121/121** Node tests passed, 0 failed/skipped; strict live-demo validation passed |
| `npm run validate` | Exit 0; strict v1.2 release, three systems and cross-file constraints passed |
| `npm run connections:check` | Exit 0; generated graph and gate positions current, read-only |
| `npm run demo` | Exit 0; unchanged legacy console snapshots, 0–1200 A.E. |
| `npm run build` | Exit 0; 21 modules transformed; six distributable files; output audit passed |
| `git diff --check` | Exit 0; no whitespace errors (Git emitted CRLF conversion notices) |

Seven new Node tests cover framing/equal scale, invalid extents/nonmutation,
pan/zoom extrema, grid orientation/world geometry, exact scale labels, perspective
camera snapshots and independent hover/selection styling. Existing historical,
v1.1, v1.2 schema/generation, ID Finder and recovery coverage remains passing.

Vite retains its existing advisory for the main chunk exceeding 500 kB (about
630 kB minified / 162 kB gzip). No warning threshold was raised or dependency added.

## Browser checks

Playwright MCP used the running loopback development server at
`http://127.0.0.1:5173/Velara_Atlas/` and `npm run preview -- --port 4173 --strictPort`
at `http://127.0.0.1:4173/Velara_Atlas/`.

| Suite | Result |
| --- | --- |
| `tests/browser-layout3_6.mjs` | Passed on dev and production preview: square/centered chart, stationary overlays, vertical range keyboard/numeric/exact-year controls, year filtering, popup close/Escape/focus, no initial card, 8×8/H8, wheel zoom and drag bounds, Reset, gate hover, actual canvas route-stroke picking, keyboard highlight/blur, independent selection, perspective and camera restoration across history/map navigation |
| `tests/browser-navigation-v1_2.mjs` | Passed on dev: all three systems, all **33 objects** pointer-selected, **14** exclusive local endpoints, all **three interstellar routes** and explicit destinations, inclusive activation boundaries, perspective in every system, two Cantum records |
| `tests/browser-checkpoint3.mjs` | Passed on dev: chronological search, crew/population, system-only nebula/year boundary, unknown-parent return, layers, synthetic unplaced/fallback/partial/error+retry states, and nonsquare input rejected without rescaling |
| `tests/browser-touch3_6.mjs` | Partial verification on dev and preview: emulated tap selection/close, vertical slider, return navigation, injected pinch and bounded pan passed; **post-gesture tap check failed** (see below) |

Layout cases include desktop **1440×1000**, portrait **390×844** and **320×568**,
and landscape **844×390**, with narrow perspective and popup fitting. Screenshots
were inspected for the complete system chart and a narrow centered InfoCard.
Fresh normal dev and preview pages had **zero console errors or warnings**.
Synthetic failed-load and nonsquare inputs deliberately produced initialization
errors; each suite returned to a clean page afterward.

The touch suite uses Chromium CDP injection in a separate emulated mobile context.
After the raw multi-touch sequence, a subsequent Sector button tap produced
pointer events without a click and timed out. The suite reports this as
`postGestureTap.passed: false`; it does not silently treat that check as a pass.
Ordinary emulated taps and return navigation before that sequence passed.
The cause is unresolved; physical-device touch and post-pinch taps require
follow-up verification. Cross-browser, screen-reader, full contrast and
large-dataset performance audits were not performed in this focused task.

## Build and data boundary

The unchanged explicit input allowlist still permits only viewer code, the two
modern core modules, installed dependencies and the seven named live-demo JSON
files. Vite `publicDir` remains disabled and source maps remain disabled. The
six output files are HTML/CSS/JS with working `/Velara_Atlas/assets/` paths;
the audit found no canonical/private/source-map references or unexpected files.
The frozen regression fixture is not a browser or build input. This targeted
audit is not a substitute for the future publication/security review.

Confirmed untouched: `examples/demo_atlas/` (including navigation declarations,
gate coordinates, generated links and nebula), `public/data/`, all schemas and
generator scripts, both historical resolvers, `src/core/cartography.mjs`, Cantum
influence and zone rendering calculations. Private source folders were not read.
No Checkpoint 4 assets, portrait, final materials, editor or deployment work began.

## Complete changed-file inventory

Modified:

```text
AGENTS.md
README.md
docs/NEXUS_VISUAL_IDENTITY.md
docs/VIEWER_PROTOTYPE.md
docs/VIEWER_SPECIFICATION.md
package.json
src/viewer/index.html
src/viewer/main.mjs
src/viewer/map-scene.mjs
src/viewer/style.css
tests/browser-checkpoint3.mjs
tests/browser-navigation-v1_2.mjs
tests/idfind.test.mjs
tests/navigation-v1_2.test.mjs
vite.config.mjs
```

Added:

```text
docs/LAYOUT_REVISION_3_6.md
docs/CHECKPOINT_3_6_RESULTS.md
src/viewer/chart-layout.mjs
tests/browser-layout3_6.mjs
tests/browser-touch3_6.mjs
tests/layout.test.mjs
tests/fixtures/v1_2/README.md
tests/fixtures/v1_2/cantums.json
tests/fixtures/v1_2/connections.json
tests/fixtures/v1_2/presentation.json
tests/fixtures/v1_2/sector.json
tests/fixtures/v1_2/systems/sys_0001.json
tests/fixtures/v1_2/systems/sys_0002.json
tests/fixtures/v1_2/systems/sys_0003.json
```

Generated `dist/` and `.playwright-mcp/` screenshots remain ignored. No lockfile
or dependency changes. Work stops here for creator review.
