# Cartographic labeling — implementation and verification

Implemented for creator review on 2026-10-17 under the explicit cartographic
typography implementation request. The approved [specification](CARTOGRAPHIC_LABELING.md)
remains the design authority. This does not begin final artwork, canonical migration
or deployment. No commit or push was made.

## Changes

1. `src/viewer/caption-layout.mjs` provides pure priority, zoom eligibility with a
   6% deadband, spatial-hash rectangle collisions and detectable marker occlusion.
   `map-scene.mjs` reuses projected HTML marker buttons, measures text on creation
   or resize and positions captions beneath markers in CSS pixels. Grid/H8 and
   floating-panel footprints suppress passive captions. Focus, hover/touch and
   selection override passive suppression; competing active captions favor the
   active interaction. Route/zone names stay temporary. Captions never capture
   input or remove marker/catalogue access.
2. `src/viewer/territorial-labels.mjs` samples each Cantum independently at 128×128
   using the shared Gaussian `cantumField` calculation. Four-neighbor components,
   boundary clearance, weighted principal axes and padded full-name rectangle
   fitting produce fixed world-space placements. Angles are limited to ±30°;
   near-circular fields use horizontal text. Small regions and unknown names are
   omitted. A bounded eight-entry cache keys effective names, contributors,
   coordinates, map, presentation and font metrics, independently of the camera.
3. `cartographic-layers.mjs` renders original, locally generated system-font
   CanvasTextures on the X/Z chart floor between influence shading and routes.
   They have no DOM accessibility nodes or picking targets. Opacity fades with
   close zoom, small projected height, foreshortening and backward orientation.
   Map rebuilds dispose geometries, materials and textures.
4. `main.mjs` adds default-on **Cantum Names** and **Object Names** controls in
   the existing per-scope preference store. Names and influence shading are
   independent. Sector and individual system preferences survive timeline,
   navigation and camera-mode changes within the session.

Viewer/NEXUS documentation, the README and architecture ownership table now
describe the implemented rules. The H8 arrow and native touchscreen controls were
preserved. The only pre-existing uncommitted file was `CARTOGRAPHIC_LABELING.md`;
its contents were left untouched. No JSON fixture, canonical record, schema,
historical resolver, navigation generator or generated output was changed.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | Passed: 128 Node tests, legacy chronology and strict demo validation |
| `npm run validate` | Passed: strict v1.2 and cross-file checks |
| `npm run connections:check` | Passed, read-only; no generation needed |
| `npm run demo` | Passed: legacy console chronology |
| `npm run build` | Passed: base-path and public-safe input/output audits |
| `tests/browser-labeling.mjs` | Passed on dev: scaling, caption sizing/centering, collisions, interaction priority, independent preferences, historical updates, disposal, mobile sizes and dense UTF-8 markers |
| `tests/browser-layout3_6.mjs` | Passed on dev and production preview: H8 edge alignment, InfoCards, pan/zoom, perspective, route focus/hover, narrow layouts |
| `tests/browser-navigation-v1_2.mjs` | Passed on dev: all 33 object targets across three systems, 14 exclusive local endpoints, three interstellar routes and destinations |
| `tests/browser-touch-camera.mjs` | Passed on dev: native CDP touch pan, pinch/orbit, finger transitions, post-gesture selection and mode restoration |
| `tests/browser-checkpoint3.mjs` | Passed on dev: historical filtering, unplaced/partial/fallback cases and technical-error recovery |
| `tests/browser-documentation3_6.mjs` | Passed on dev: documented workflow, GET-only observed traffic, no external/canonical requests |

The documentation browser suite contained an outdated expectation of 12.5K CNU
for every system. Its measurement assertion now checks the already-authored
System C 120K chart's 15K cell width; A/B still require 12.5K. No chart/data change
was made to satisfy it. Browser suites are Playwright MCP filename entry points,
separate from `npm test`; labeling and source-interception suites require dev.

Pure tests cover joined/disconnected fields, diagonal separation, tiny islands,
overlapping different Cantums, missing/unknown names/status, exact historical
name/membership changes, full-name fitting, deterministic winners, marker and
annotation collisions, interaction overrides and zoom hysteresis.

## Limits and review notes

- Geography is a sampled approximate influence field. Sub-cell bridges can be
  missed; concave, narrow, clipped or long-named holdings may receive no lettering.
  This is intentional omission rather than truncation or invented geography.
  Contributing-system proximity and marker coverage influence anchor scoring, but there is no global
  route-intersection optimizer or cross-Cantum typography packing solver.
- Minimum world height is 2.8% of chart extent, maximum 6.5%, with complete-name
  padding. Small projected text fades between 8 and 12 CSS pixels; close-zoom fade
  reaches zero at 5× fit. These presentation choices are tunable, not canon.
- Dense captions can be suppressed even at full fit. Focus/hover can displace a
  selected caption when they collide. Edge-clipped or panel-covered interaction
  text remains supplemented by accessible button names, Catalogue, Selection and
  the existing InfoCard; objects are never moved to make space.
- A memory-only 300-marker browser case kept all markers and the focused name.
  One observed run measured roughly 225 ms initial setup, 10 ms median and 15.6 ms
  maximum across 20 subsequent renders. These include existing marker/projection,
  DOM and renderer work, are hardware dependent and are not a large-atlas guarantee.
  Existing nearest-target sizing remains quadratic; very large charts may need
  further profiling. Per-Cantum field sampling is rebuild-only, not per-frame.
- Marker occlusion is a conservative projected-center/depth check, not a general
  scene visibility solver. Dense local geometry and overlapping Cantum lettering
  may still benefit from creator-directed visual tuning.
- Chromium portrait (390×844, 320×568), landscape (844×390), desktop and emulated
  touch were tested. Real Android/iOS hardware and other browsers were not tested.
- Vite reports a main chunk above 500 kB (about 641 kB, 166 kB gzip). The warning
  is retained; no framework, font, artwork dependency or bundling-policy change
  was introduced.

Ready for creator review; no canonical release, final NEXUS artwork, deployment,
commit or push is included.
