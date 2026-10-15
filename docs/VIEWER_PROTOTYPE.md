# Milestone 6 — Checkpoint 2 prototype

This is a **local, read-only, noncanonical demonstration**, not the completed
Milestone 3/5 viewer or a canonical atlas release. The Checkpoint 2 authorization
permits the initial viewer; older foundation descriptions saying no renderer
exists predate this checkpoint. The approved designs remain the future target.

## Run and build

```text
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/Velara_Atlas/`, or Vite's printed URL if that port is
occupied. For static output, use `npm run build`, then `npm run preview` and open
`http://127.0.0.1:4173/Velara_Atlas/`. No deployment is configured or performed.
Vite 6 supports the existing Node 20.5.1 environment; Three.js is the sole new
runtime package. Dependencies are locked in `package-lock.json`.

## Implementation

- `src/viewer/index.html`, `main.mjs` and `style.css`: minimal semantic shell,
  fixed snapshot, navigation, projected labels, accessible selection control and
  information display. Record content is inserted with DOM `textContent`.
- `demo-data.mjs`: explicit sector JSON import and an exact two-path allowlist of
  lazy detail imports from `examples/demo_atlas/`. No directory glob, arbitrary
  URL fetch, private folder read or canonical data import. Vite rewrites dynamic
  imports and assets for the configured `/Velara_Atlas/` base.
- `map-scene.mjs`: Three.js scene, orthographic camera, temporary geometric
  markers and OrbitControls for panning/zooming. Rendering happens on changes,
  with a ResizeObserver for layout changes and a capped device-pixel ratio.
  Old geometry/materials are disposed when changing maps.
- `src/core/history.mjs`: the unchanged Checkpoint 1 resolver supplies system
  eligibility, historical names, dated InfoCards and system objects. There is no
  duplicate history implementation. The selected year is the demo sector's
  `timeline.defaultAE`, currently 1200 A.E.

Sector meshes use authored `positionLY` directly in **ly**. Local meshes use
authored absolute `position` directly in **CNU**, retaining real Y elevation and
`orbitingId`; no CNU conversion or orbit simulation is performed. Orthographic
top-down projection looks along negative Y with X horizontal and Z vertical.
It does not flatten stored or scene coordinates. Camera framing fits eligible
positions with padding; empty maps fall back to declared full extents. No mesh
is created for null placement.

Marker shapes distinguish stars/systems (spheres), neutral celestial bodies
(icosahedra), stations (boxes), local gates (tetrahedra), Jump Gates (octahedra)
and Jump Holes (toruses). Colors and constant screen-size markers are temporary
display aids, not political colors, physical dimensions or planet subtype facts.
Selection changes color and reveals its name/record. Idle objects have no
targeting rings or animated effects. Final SVG/default appearances are deferred.
Transparent hit areas shrink near neighboring projected anchors so a moon's
button cannot cover the center of a nearby planet. This never moves a mesh or
changes an authored coordinate; coincident objects remain accessible via Selection.

Click/tap or use Selection to choose an entity. Enter system or double-click a
system opens its detail. Sector View returns to the parent with its prior camera
position/zoom and parent system selected. Drag empty space to pan, scroll/pinch
or use +/− to zoom, and Reset view to recover framing. A focused canvas supports
arrow-key pan and +/− zoom. Escape deselects. The simple selection menu is an
accessibility alternative, not the future searchable catalogue interface.

The information display shows effective name, type, ID, XYZ with units,
available InfoCard values and an authored orbital-parent ID where present. It
never treats missing weapons data as unarmed or unknown population as zero.
Loading errors are technical notices, separate from archival fallback. Graphics
initialization/context failures have explicit notices.

## Demo build boundary

Vite's root is `src/viewer/`; `publicDir: false` prevents copying `public/` into
the build. The dev server binds to loopback, restricts filesystem access to the
viewer/core/demo/dependency directories, and denies canonical data, Git metadata,
RTF and common private paths. This is a local development configuration, not a
general confidentiality guarantee or a hardened public server.

The `explicit-demo-inputs` build plugin rejects bundled repository modules
outside viewer code, the modern resolver, the three explicitly listed fixture
JSON files and installed dependencies. `scripts/audit-demo-build.mjs` checks
generated files, asset paths and known forbidden references. The build contains
HTML/CSS/JS only, including two lazy detail chunks; no raw `public/data`, source
maps, RTF, credentials, local editor or private files are deliberately included.
The audit is specific to this prototype, not a substitute for the later full
publication review.

`npm run build` runs strict existing fixture validation before bundling and the
output audit afterwards. `npm run dev` validates before starting; edited data
still needs validation again before relying on it. Runtime schema validation,
general JSON/network loading and complete release auditing are later work.

## Verification and remaining scope

`npm test` includes focused checks for every fixture marker's identity/XYZ,
orthographic X/Z camera framing, empty/unplaced framing, input nonmutation and
the build allowlist. The legacy resolver, canonical data and existing tests are
unchanged. The required validation, console demo and production-build commands
remain available. Browser verification results are reported with the checkpoint
handoff; unit tests alone do not prove WebGL or pointer/touch behavior.

Live Playwright verification now confirms both sector markers, selection,
Enter system and double-click navigation, 10 System A objects and 11 System B
objects, celestial-object identity/XYZ readouts, built-object selection, button
and mouse-wheel zoom, mouse/keyboard pan, Reset view, return navigation and
preserved sector framing. A 390-pixel viewport also passes nearby planet/moon
selection and return navigation after resetting its framing, without horizontal
page overflow. Resizing preserves the current camera scale; use Reset view if
markers move offscreen when narrowing the viewport. Actual touch/pinch gestures
and broad cross-browser/accessibility testing remain unverified.

The browser checks found and fixed a transparent moon hit area intercepting
clicks on System B's nearby planet, plus an automatic favicon request returning
404. The page now declares an empty favicon. A fresh page reports zero browser
console errors and warnings after navigation through both systems. Network
inspection shows viewer/dependency modules and the three allowlisted demo JSON
imports only. Generated Playwright evidence is ignored under `.playwright-mcp/`.

This checkpoint has no perspective camera toggle, timeline UI, search/catalogue
panels, Cantum overlay, zone graphics, route drawing/pathfinding, final celestial
materials, icon library, targeting-ring system, portraits, local editor,
canonical migration, authentication or deployment. Connection fixtures remain
unchanged; no route is inferred from marker proximity or orbital metadata.
The existing zone records also remain unchanged and are not drawn yet.

The application currently requires WebGL and a modern browser. Dense projected
markers may overlap; Selection provides access to all eligible objects. Mobile
layout stacks the record under the map; full responsive drawers and complete
accessibility/performance QA belong to later checkpoints. Three.js may produce
Vite's advisory warning for a minified chunk larger than 500 kB; no limit is
disabled to hide it. Checkpoint 3 requires explicit creator approval.
