# Milestone 6 — Viewer implementation through Checkpoint 3.6

The local app is a **read-only, noncanonical demonstration** using only
`examples/demo_atlas/`. Checkpoint 3 is secured in `32f43d6`, navigation v1.2 in
`4ff0ecb`, and the Checkpoint 3.6 layout in `7d9231c`. No canonical migration,
publication, editor, final icon library, portrait or polished NEXUS art is implied.

> **Current layout: Checkpoint 3.6.** [The explicit layout revision](LAYOUT_REVISION_3_6.md)
> supersedes the original sidebars/bottom timeline and selection-driven route highlighting.
> The implementation notes below have been synchronized. Full-map square framing,
> floating overlays and centered InfoCards are now implemented; [current evidence](CHECKPOINT_3_6_RESULTS.md)
> records its original checks and limitations. [The repository audit](REPOSITORY_AUDIT_3_6.md)
> records the current rerun. Historical resolution, cartography and data remain unchanged.

## Run and verify

```text
npm ci
npm run dev
npm test
npm run validate
npm run connections:check
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
- Catalogue, controls, layers and vertical History are closed-by-default floating
  panels. The header retains the selected year. Selection opens a centered
  dismissible InfoCard; closing it clears selection and returns focus without
  resetting the camera. The Selection menu is a keyboard alternative to markers.
- The chart is centered and square in both modes. Top-down Reset fits the complete
  X/Z extent; pan/cursor zoom/focus remain bounded and zoom cannot go below that
  full-map fit. System grids are world-space 8×8 A–H/1–8 with cell width in H8.

## Phase B — Routes and perspective

`connections.json` is the sole runtime graph, generated manually from v1.2
system-object declarations. The unchanged historical resolver filters links and
released endpoints before display. Short-range endpoints use exclusive lifetime pairs. Each
interstellar gate/hole remains paired under the existing global validator;
direction is copied, displayed and used for endpoint departure metadata. Viewing
a destination is explicit and never a claim about pathfinding or travel time.

Sector interstellar strokes interpolate between system XYZ positions in **ly**;
local strokes use gate XYZ positions in **CNU**. Gate links are solid, Jump Holes
dashed. Multiple links for the same system pair use separate offset curves and
selection anchors, preserving their exact authored endpoints. One-way links get
directional arrows. Missing sector placement yields no fabricated stroke.
Hover/focus a gate or stroke to temporarily highlight eligible routes; exit/blur
restores styling. Selecting a record retains independent object targeting and
opens the InfoCard, without persistent route/partner highlighting.

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

`src/viewer/cartographic-layers.mjs` retains the earlier ellipsoid, box and
polygon-volume renderer for sector/frozen consumers. Checkpoint 3.8 system zones
use `zone-layers.mjs` and the shared pure `src/core/zone-geometry.mjs`. Their
authored origins and dimensions may extend outside the system, but validation,
visible geometry and hit testing require positive intersection with chart XYZ.
Ordinary object/gate bounds, v1.1 and sector containment remain unchanged.

The nebula `zon_0001` remains local to System A alongside its asteroid field;
System B retains its polygon hazard. Read current JSON for authored CNU origins
and dimensions; old reports contain historical fixture values, not authoring
defaults. No ly-to-CNU conversion is performed. Polygon vertices/heights remain
relative to the zone origin. Top-down footprints account for chart Y clipping;
3D uses twelve bounded, membership-masked cloud slices plus deterministic
clipped-intersection particles. This is an environmental approximation, not a
solid-volume surface mesh. Particle work is capped independently of source size.

Objects and routes win picking before background zones. Visible regions have
plain-text pointer tooltips and the existing InfoCard; system zones have no
origin-anchored caption/button. Focus uses a visible witness and clipped extent.
Spatial zones controls geometry and picking together. Zones follow discovery/
known-by dates; v1.1/v1.2 has no zone-expiry field, so no expiry is invented.
See [specification](ZONE_GEOMETRY_INTERACTION_SPEC.md) and
[Checkpoint 3.8 verification](ZONE_GEOMETRY_INTERACTION_RESULTS.md).

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
labels/UI. Background layers do not write depth. Grid/influence are decorative;
system zones use pure clipped-volume picking after object and route checks.
Geometry, materials and textures are disposed on map reconstruction. Rendering
is event-driven with a capped device-pixel ratio. Layer preferences are separate
for each map and do not modify data or catalogue eligibility.

## Public-demo build boundary

`demo-data.mjs` explicitly imports the demo sector, Cantums, connections and
presentation file. It preloads exactly the three allowlisted **released** system
details so historical endpoint eligibility can be checked before route drawing.
This is an intentional small-demo preload, not arbitrary filesystem loading.
Archival systems with null paths do not trigger detail imports. A general large
dataset loader and runtime Ajv integration are deferred; dev/build commands run
the existing strict Ajv and relationship validation first.

Vite's root remains `src/viewer/`, `publicDir` is disabled, and the dev server
binds to loopback with filesystem restrictions. The production input plugin
allows only viewer code, the two modern core modules, seven exact demo JSON paths
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

The reusable **Playwright MCP** files take the connected page as their entry
point: pass an absolute `filename` to `browser_run_code_unsafe`; no extra npm
package is needed. `tests/browser-checkpoint3.mjs` covers chronology and synthetic
unplaced/fallback/partial/error+retry/invalid-square states on dev.
`tests/browser-navigation-v1_2.mjs` checks live-demo objects and destinations on
dev. `tests/browser-layout3_6.mjs` verifies overlays, grid, bounds, focus and narrow
2D/3D behavior on dev or preview; `tests/browser-touch3_6.mjs` separately reports
emulated-touch results, including its failed post-gesture tap. Deliberate error
tests return to a clean page. See [current results](REPOSITORY_AUDIT_3_6.md).

`tests/browser-documentation3_6.mjs` checks the documented panel/record review
workflow across all three systems and observes same-origin GET-only requests,
with no canonical/private-source fetch. It supports dev and production preview;
this targeted observation complements rather than replaces the build audit.

A historical Checkpoint 3 20-step browser scrub measured roughly **65–79 ms** per automation
round trip, with bounded label counts. This is a small-demo observation, not a
large-dataset frame-rate guarantee. Normal fresh-page navigation has zero console
errors/warnings. The production build remains compatible with `/Velara_Atlas/`;
the existing advisory about a Three.js chunk exceeding 500 kB remains visible.

Actual touch/pinch hardware, comprehensive accessibility/contrast audits,
cross-browser coverage and large-dataset GPU/CPU budgets remain unverified.
Narrowing a desktop viewport preserves its camera scale; Reset view recovers
framing if needed. Final materials/icons, targeting rings, NEXUS portraits and
visual polish are Checkpoint 4 work. Checkpoint 3.6 layout and documentation work
does not change authored demo data, canonical JSON, schemas, generators, either
historical resolver, Cantum calculations or nebula placement.

## v1.2 compatibility update

The v1.2 implementation added `sys_0003` and offline graph/position generation;
it reused the existing historical/cartographic behavior. Checkpoint 3.6 later
refined camera/layout/interaction. `npm run connections:check` guards validation,
dev and build, including direct Vite builds. See [authoring details](NAVIGATION_AUTHORING.md),
the [historical navigation report](NAVIGATION_V1_2_RESULTS.md) and
[current repository audit](REPOSITORY_AUDIT_3_6.md).
