# Milestone 6 — Checkpoint 3 historical viewer

The local app is a **read-only, noncanonical demonstration** using only
`examples/demo_atlas/`. Checkpoints 1–2 are creator-approved; Checkpoint 3 adds
historical navigation and cartography and awaits review. No canonical migration,
publication, editor, final icon library, portrait or polished NEXUS art is implied.

## Run and verify

```text
npm ci
npm run dev
npm test
npm run validate
npm run demo
npm run build
npm run preview
```

Development: `http://127.0.0.1:5173/Velara_Atlas/` (or the printed port).
Production preview: `http://127.0.0.1:4173/Velara_Atlas/`. The console `demo`
command remains the unchanged legacy political-history demonstration. It is
separate from the browser app. No command commits, pushes or deploys anything.
No dependency was added in Checkpoint 3.

## Phase A — Timeline and catalogue

- The slider steps through whole years and numeric input rejects invalid years.
  Names, object/zone visibility, administrative membership, control and all six
  InfoCard fields resolve through the unchanged `src/core/history.mjs`.
- `src/core/cartography.mjs` composes the historical map/catalogue, scoped routes
  and overlay contributors. Search examines only effective names and permanent
  IDs. No future alias is used as a search match. Type filters and keyboard
  buttons cover Cantums, systems, local objects, zones and routes.
- Selection clears if its record becomes ineligible; an unknown parent system
  returns to the eligible sector. Otherwise year changes retain map, camera and
  selection. Panel collapse and layer choices are independent from chronology.
- The v1.1 timeline has `startAE` and `defaultAE`, with no latest-year field.
  This demo explicitly uses those as lower/upper bounds (currently 0–1200) and
  starts at `defaultAE`. A general latest-published-year schema decision remains
  future work; no undocumented JSON key was introduced.
- Previous/next **exact record** controls use exact scalar discovery dates and
  interval boundaries explicitly marked `datePrecision: exact`. Construction,
  settlement, route activation and other intervals lacking precision metadata
  are conservatively omitted from these jumps. `knownByAE`, `circa`,
  `confirmed_by` and other qualifications never become invented exact events.
  The continuous slider still resolves every supported year, including changes
  omitted from record jumps.
- The left catalogue and right record panel collapse on desktop and act as
  overlays/drawers on narrow screens. The timeline remains available at the
  bottom. The Selection menu remains a compact keyboard alternative to markers.

## Phase B — Routes and perspective

`connections.json` is the sole graph. The historical resolver filters links and
released endpoints before display. Short-range branching is retained. Each
interstellar gate/hole remains paired under the existing global validator;
direction is copied, displayed and used for endpoint departure metadata. Viewing
a destination is explicit and never a claim about pathfinding or travel time.

Sector interstellar strokes interpolate between system XYZ positions in **ly**;
local strokes use gate XYZ positions in **CNU**. Gate links are solid, Jump Holes
dashed. Multiple links for the same system pair use separate offset curves and
selection anchors, preserving their exact authored endpoints. One-way links get
directional arrows. Missing sector placement yields no fabricated stroke.
Selecting a local gate highlights its active branches and linked gates.

Archival endpoint references permitted by public validation are retained with
their explicit unverified-detail flag. No unpublished endpoint object is created
or required. A fallback system can still contribute an influence bubble if its
sector position and membership are known.

Top-down orthographic X/Z is the initial camera on each map; Y remains genuine
scene elevation. Switch to 3D for a perspective camera, right-drag orbit or use
Camera elevation. Pan, zoom, Reset view and Focus selection are available in
both modes. Camera state is retained per map; switches never relocate objects.
Station/gate markers face the perspective camera; natural bodies still use
temporary neutral geometric markers. There is no orbital simulation or CNU
conversion. Dense or coincident projected records remain available in the
catalogue; nearby hit areas shrink without changing geometry.

## Phase C — Zones and Cantum influence

`src/viewer/cartographic-layers.mjs` renders ellipsoid, box and polygon-volume
geometry at authored XYZ positions. The demo nebula `zon_0001` is local to System A,
alongside its asteroid field; System B retains its polygon hazard. The nebula's
center `(-11000, 1200, -6000)` and radii `(6500, 1800, 3800)` are independently
authored noncanonical CNU values, with no ly-to-CNU conversion. Its discovery
year remains 160 A.E. Synthetic tests retain coverage for sector-level zones.
Polygon footprints use local X/Z vertices and min/max Y bounds. Subdued particles
use a deterministic ID-derived seed, rejection-sampled inside those bounds; they
never define or enlarge geography. Focus selection makes the tiny local demo
zones inspectable. Zones follow discovery/known-by dates; v1.1 has no zone-expiry
field, so no expiry is invented.

Sector political influence follows historically eligible, positioned systems'
effective `cantumHistory`, with an eligible Cantum status record. Affiliation,
control, names, gates and proximity do not supply membership. Radius is fixed in
ly using presentation settings; missing styles use neutral color and a fixed
map-size-based fallback. Malformed thresholds disable the field rather than
blocking navigation. This is approximate chart shading, not legal sovereignty.

The implementation uses the approved Gaussian sum, smoothstep thresholds,
per-Cantum alpha at most **0.16**, and one deterministic alpha-weighted composite
capped at **0.22**. A 256×256 RGBA texture is clipped to declared sector bounds
and displayed on a chart floor in perspective. Up to eight fields are cached by
world inputs, not camera state; pan/zoom never recalculates membership or radius.
Different Cantums remain separate inputs; distant same-Cantum holdings need no
forced bridge. No manual political boundary is introduced.

Explicit render order is grid → influence → zones → routes → markers → DOM
labels/UI. Background layers do not write depth or participate in picking.
Geometry, materials and textures are disposed on map reconstruction. Rendering
is event-driven with a capped device-pixel ratio. Layer preferences are separate
for each map and do not modify data or catalogue eligibility.

## Public-demo build boundary

`demo-data.mjs` explicitly imports the demo sector, Cantums, connections and
presentation file. It preloads exactly the two allowlisted **released** system
details so historical endpoint eligibility can be checked before route drawing.
This is an intentional small-demo preload, not arbitrary filesystem loading.
Archival systems with null paths do not trigger detail imports. A general large
dataset loader and runtime Ajv integration are deferred; dev/build commands run
the existing strict Ajv and relationship validation first.

Vite's root remains `src/viewer/`, `publicDir` is disabled, and the dev server
binds to loopback with filesystem restrictions. The production input plugin
allows only viewer code, the two modern core modules, six exact demo JSON paths
and installed dependencies. The output audit still permits HTML/CSS/JS only and
checks base paths and forbidden references. Canonical `public/data/`, private
lore, source maps, editor code and unrelated examples are not build inputs.
This targeted audit does not replace the later full publication/security review.

## Phase D — Integration evidence and limits

`npm test` runs the unchanged legacy/schema/history suites plus spatial and
cartography tests. New cases cover discovery/name/crew/population boundaries,
unplaced/fallback/partial/empty states, route timing/direction/expiry, separate
strokes, Cantum membership transfer, unknown placement, exact-record filtering,
influence merging/islands/caps, cached fields, seeded zone bounds and nonmutation.

The reusable **Playwright MCP** suite is `tests/browser-checkpoint3.mjs`. With
the dev server running, invoke `browser_run_code_unsafe` with that file's absolute
path as `filename`; it takes the connected page and needs no extra npm package.
It covers chronological search, historical record updates, invalid selection,
branching and explicit destination navigation, 2D/3D controls, zone focus, layer
toggles and narrow layouts. Synthetic network responses exercise fallback,
unplaced, partial and failed-load states without changing fixtures. Expected
errors from the deliberately aborted request are followed by a clean reload.

A 20-step local browser scrub measured roughly **65–79 ms** per automation
round trip, with bounded label counts. This is a small-demo observation, not a
large-dataset frame-rate guarantee. Normal fresh-page navigation has zero console
errors/warnings. The production build remains compatible with `/Velara_Atlas/`;
the existing advisory about a Three.js chunk exceeding 500 kB remains visible.

Actual touch/pinch hardware, comprehensive accessibility/contrast audits,
cross-browser coverage and large-dataset GPU/CPU budgets remain unverified.
Narrowing a desktop viewport preserves its camera scale; Reset view recovers
framing if needed. Final materials/icons, targeting rings, NEXUS portraits and
visual polish are Checkpoint 4 work. Only the approved demonstration nebula's
placement changed in fixture JSON. No canonical JSON, schema, legacy
resolver, private source or deployment configuration was changed.
