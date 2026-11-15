# Velara Atlas — Cantum Territory Rendering Rules

**Status:** Approved Milestone 3 rendering contract, technical default parameters subject to visual tuning.  
**Version:** 1.0 · Companion to `docs/VIEWER_SPECIFICATION.md` v1.1  
**Scope:** **Sector map only**. This defines NEXUS political **influence shading**, not exact sovereign borders and not the star-system spatial-zone renderer.

**Implementation status:** Implemented by `src/core/cartography.mjs` and
`src/viewer/cartographic-layers.mjs`. Completed, creator-approved Phase 3D validates the v1.3 Demo's separate
`presentation.json`; frozen v1.1/v1.2 and calibration behavior are retained. Checkpoint 3.6 changed
chart framing and panels only, preserving the algorithm, contributors and caps.

## Approved normal-Demo governance example

The completed, creator-approved Phase 3F v1.3 showcase has four released systems,
one archival-only entry and two TEST factions. Cantum B is independent during
`[700,800)`, subordinate to A during `[800,1000)`, then independent again. At
799/800/999/1000 compare flat fields, perspective envelopes and governing labels.
Administrative memberships and the shared 24-ly radius are unchanged.
See [DEMO_SHOWCASE](DEMO_SHOWCASE.md) for the full walkthrough; these TEST dates
and measurements assert no MCR canon.

## 1. Concept and source of truth

For each ultimate governing Cantum (direct Cantum for legacy v1.2), generate a translucent, softly bounded X/Z region from system-centered influence bubbles, then merge bubbles **within that governing group** using a continuous metaball-style field. A single isolated system makes an island. Two or more close systems merge into an organic region. Unconnected far-away systems remain separate islands. **Never stretch artificial corridors** merely to connect separated holdings. Gate routes do not determine territory.

This layer depicts the **distribution of mapped Cantum-associated systems**, not the exact extent of law, ownership of the intervening void, or volumetric boundaries. NEXUS should label it **“Cantum influence / approximate chart overlay”** or comparable language, not “exact sovereign border.” A system's membership must not be derived from the resulting color field.

### Authoritative input filter

For chosen year `Y`:

1. Read **public released** sector-index systems and Cantums only. Private records are not available to the renderer.
2. Include a system only if its discovery/confirmed public historical knowledge at `Y` is established under the **approved resolver**; unknown `discoveredAE: null` is *not* automatically treated as discovery in year zero.
3. Include the system only if `positionLY` has finite numeric X/Z coordinates in `ly` and the system is inside the sector's declared map bounds. Y is **not** used to calculate this 2D projected shading. Systems without plotted coordinates can still be in the catalogue, but cannot contribute bubbles.
4. Determine the historically valid Cantum from the system's effective `cantumHistory` at `Y` (`fromAE` inclusive, `untilAE` exclusive). A null, absent, conflicting or unresolved membership contributes no bubble. `controlHistory`, `infoCard.affiliation`, labels, geographic proximity and travel links do **not** replace this source. Cantum existence/status data must also be historically eligible at `Y`; otherwise omit the contribution and flag inconsistent records in validation.
5. Include a known public system **even if** `publicDetailPath` is null or its inner map is partially authored. The presence of a system-level detail file is irrelevant for sector territory shading.
6. In v1.3 resolve the administrative Cantum's dated `infoCard.affiliation` chain
   using `resolveGoverningCantum()`. Require an eligible independent root; missing
   governance is Not recorded and produces no sovereign bubble. Group all accepted
   X/Z points by that governing ID before computing a field. In v1.2, retain direct
   administrative grouping. Cantums with no eligible positioned systems have no generated region; retain their other public catalogue information.

**Important:** At historical years before a system joins a Cantum, its marker may be visible but it should not generate that Cantum's bubble. Keep direct administration distinct from sovereignty. Effective null-target Cantum affiliation proves independence; absent history never does. No fictional Demo declaration asserts canonical Continuance history.

## 2. Exact field and compositing algorithm (initial recommended implementation)

**Coordinates are world-space `ly` in the sector X/Z plane**, not CNU, and **bubble radii are `ly`**, never screen pixels. One bubble is centered at each eligible system `(x_i, z_i)` and uses the shared v1.3 `radiusLY > 0` (`r_c` below). Frozen v1.2 uses its Cantum's authored radius.

At a sample map-plane point `(x,z)` define squared distance and influence:

```text
d2_i = (x - x_i)^2 + (z - z_i)^2
f_i  = exp( -ln(2) * d2_i / (r_c * r_c) )
F_c(x,z) = sum(f_i for all eligible systems i in Cantum c)
```

This choice means an isolated bubble's field is `1` at the star and `0.5` at one radius. The sum creates natural smooth merges where fields overlap. It is deterministic and continuous. **Do not normalize by number of systems**; normalization would prevent nearby bubbles from joining as intended.

Compute visibility and opacity:

```text
smoothstep(a,b,v):
  t = clamp((v-a)/(b-a), 0, 1)
  return t*t*(3-2*t)

strength_c = smoothstep(0.35, 0.65, F_c)
alpha_c    = 0.16 * strength_c
```

These are **tunable starting defaults**, not canon. The sample uses a **maximum alpha of 0.16 per Cantum**, with a soft transition (no hard solid boundary). At most, **0.22 total overlay alpha** may cover a pixel where multiple Cantums' colors overlap. In an overlap, compute a **deterministic alpha-weighted mix** of participating Cantum colors, then draw the result once with `alpha = min(0.22, sum(alpha_c))`; do **not** rely on unordered translucent overdraw or bright additive blending. Overlap does **not** imply political merger or shared control. A faint optional contour may be considered at Milestone 5, but avoid strong outlines by default.

**Fixed-radius rule:** Prefer each Cantum's explicit `radiusLY` in public presentation config. If it is missing, use the **same documented global fallback radius** `0.08 * min(sector.map.size.x, sector.map.size.z)` for all Cantums. The fallback is computed from the *declared sector map size*, **never** from distance to nearest stars, the number of visible systems, or camera zoom. The demo fixture may set `radiusLY: 24` in its **noncanonical presentation settings** to show merging between System A and B; this does not set the canon's scale. Optionally support per-system radius overrides **later**, but not required for v1.

**Empty groups:** produce no region; do not draw an unplaced or inferred center. A 2D bubble near an edge must be clipped by declared map bounds, never painted outside them.

## 3. Appearance defaults and layer ordering

- **Color source:** an explicitly declared, **public-safe**, Cantum-ID-keyed theme color. Do not derive colors from names or from historical lore. Missing colors should log a development warning and use a configured neutral grey fallback rather than fabricating an official Cantum color.
- **Base appearance:** low-opacity fill (peak 0.16), softened contour through the field function, restrained colors; do not render bright neon goo, heavy bloom or opaque blobs. Avoid visibly smeared text/marker edges.
- **Optional blur:** a subtle final antialias/softening pass (for example 2–4 CSS pixels) is permissible, but the field `smoothstep` is the primary soft boundary. Do not use arbitrary large blur that obscures territory shapes.
- **Shape scale:** changing camera zoom/pan **does not change world-space bubble radius or topology**. No pop-in, seam jumps or color flicker when the camera moves. Render smooth projected boundaries at sufficient precision; adjust pixel resolution or use GPU shading as needed.
- **Hard layer order, back → front:** `(1)` background/starfield; `(2)` coordinate grid; `(3)` Cantum influence shading; `(4)` interstellar route strokes; `(5)` star/system markers; `(6)` names and labels; `(7)` hover/selection and direct UI. Every marker remains crisp, fully clickable, and readable above the territory. Territory never intercepts pointer/raycast events or adds an InfoCard selection target.
- **Sector perspective mode (Stage 3 supersedes the always-floor-mounted, nonvolumetric presentation):** use flattened world-space envelopes derived from the same authoritative X/Z Gaussian field. They are a chart visualization, not newly authored sovereignty volumes. Top-down still uses the original flat RGBA shading. Grid remains on `map.planeY`; perspective nameplates sit above their local envelope surface. See the Stage 3 contract below.
- **Toggle:** “Cantum influence regions” (or similar), OFF hides only the overlay; it does **not** recolor system markers, remove connections, change Cantum affiliations, or affect searching.
- **Stage 2 sigils:** Stage 1 nameplates are approved. Each already eligible
  nameplate may now include its Cantum's optional registered sigil, sharing the
  anchor, fade, containment and Names toggle. `test-cantum-a` is the sole approved
  noncanonical demonstration asset; null/omission/unknown/failure is text-only.
  This does not change contributors, fields, colors, radii, flat surfaces or
  connected-component eligibility in Stage 2. Stage 4 extends identity eligibility
  below without changing the field; see [Stage 2 results](archive/reports/CANTUM_SIGILS_STAGE2_RESULTS.md).
- **Other spatial zones:** nebula, radiation and asteroid-field volumes are independent **system-map features**. Do not merge their geometry with Cantum influence shading.

## 4. Implemented public-safe presentation settings

`schemas/atlas-v1_3.schema.json#/$defs/presentationFile` validates the active Demo.
The v1.2 master and wrapper remain unchanged for legacy/reference files. The sector's optional `presentationPath`
identifies it; the current demo loader explicitly imports the allowlisted file.
This minimal example uses current v1.3 structure and noncanonical fixture values:

```json
{
  "schemaVersion": "1.3.0",
  "territoryOverlay": {
    "enabledByDefault": true,
    "radiusLY": 24,
    "fallbackRadiusFraction": 0.08,
    "opacityMaxPerCantum": 0.16,
    "opacityCapTotal": 0.22,
    "fieldThresholdStart": 0.35,
    "fieldThresholdEnd": 0.65,
    "fallbackColor": "#73808C",
    "cantums": {
      "can_0001": { "color": "#638FBD" }
    }
  }
}
```

The color and radius for `can_0001` here apply **only to the noncanonical test dataset**. Final UI palette and any approved canonical Cantum colors belong to Milestone 5. Use finite positive radii, bounded alpha values, valid colors, and `0 ≤ thresholdStart < thresholdEnd`; enforce this in presentation validation. **Do not add arbitrary presentation keys to canonical `sector.json` without updating its schema.**

## 5. Runtime and performance contract

- The public viewer only **reads** JSON; no local editor or server write path is required.
- Rebuild contributor lists/field geometry when the **selected year, published system positions, membership history, palette or configured radius** changes. Use only dated Cantum superior affiliation for governance; **do not** infer it from object/faction affiliation, use unreleased details, or treat the changing viewport as a geopolitical event.
- Pan/zoom may reproject a cached field texture or use a GPU shader in world coordinates; it must preserve deterministic region boundaries. An offscreen/low-resolution field with smooth interpolation is acceptable if edges look clean at ordinary zoom levels. Avoid naive full-resolution CPU loops over every system for every animation frame.
- Precompute bounding rectangles or cull negligible contributions outside a safe multiple of each radius for performance. Cache reusable data; update only when necessary.
- Missing/stale/malformed style settings must not crash or block star navigation: warn, use safe defaults, or disable the overlay while preserving all map markers. Invalid historical membership is a data-validation issue, not a reason to invent a bubble.
- Do not expose hidden records through theme keys, debug text, hover targets, or offline cache files.

## 6. Acceptance tests and visually important cases

1. **A/B regression scenario:** The frozen accepted fixtures retain `can_0001` with no contributors before 210 A.E., A at 210–329 and A+B at 330+. With `radiusLY: 24`, those fields join. The live Demo also includes a separately colored System C/Cantum 2; read current authored dates/positions rather than inferring them from this original scenario. All systems and interstellar strokes remain above influence shading.
2. **Zoom stability:** Zooming from wide to close does not change physical radius in `ly` or change which groups merge. Pan cannot move bubbles away from systems.
3. **Disconnected holdings:** Two widely separated systems of the same Cantum remain two islands rather than being joined by a fabricated corridor.
4. **Multiple Cantums (additional noncanonical test):** Different Cantums retain separate fields and IDs. At overlap, colors blend deterministically, stay subdued and do not cover system labels. No single Cantum is silently assigned the contested area.
5. **Historical transfer:** Change a demo system's effective `cantumHistory` at a test year. The contributor leaves the original Cantum field and enters the new Cantum field; neither the spatial coordinates nor the entity ID changes.
6. **Historically unknown/unplaced:** A system not yet discovered is absent from the field; a known unplaced system remains catalogued but contributes no bubble; an undeveloped positioned known system **does** contribute a bubble.
7. **Overlay toggle:** Hide/show shading without altering navigation, route rendering, search, timeline or InfoCards.
8. **2D/3D layering:** In both camera modes, terrain shading cannot obscure, intercept clicks on, or draw in front of the stars, labels, routes or selection markers.
9. **Valid JSON only:** Current presentation settings are checked by strict v1.3 schema and relationship validation; tests retain frozen v1.1 coverage. Canonical political files are not migrated or used as viewer inputs.
10. **Build integrity:** Production bundle contains only explicitly released JSON and safe palette values. No private region/lore notes or local editor code.

## 7. Explicit future possibilities (not required for initial viewer)

- Manually drawn exact political borders, if desired, as a **separate selectable overlay** with independently dated geographic shapes. These do not replace the default soft influence layer without explicit approval.
- Per-system bubble radius/weighting, narrative annotations, regional exceptions, opacity/contour fine-tuning, and export-friendly poster mode.
- A local-only debug overlay displaying source systems and their contribution radii, if useful when tuning the visual field in VS Code.

---

**Implementation note:** The renderer uses a cached 256×256 world-space RGBA
field, deterministic overlap mixing and the approved Gaussian/smoothstep formula.
Style tuning requires its own authorized visual work and must preserve membership,
fixed ly radii, opacity caps, disclosure and layer order. See
[implementation notes](archive/reports/VIEWER_PROTOTYPE.md) and [historical audit](archive/reports/REPOSITORY_AUDIT_3_6.md).
No territory calculations or settings were changed in the documentation audit.

## Stage 3 dual presentation and bounded envelope geometry

The Gaussian sum, resolved membership/contributor selection, configured radii,
thresholds and colors remain authoritative in X/Z. Y never determines affiliation,
merging or island eligibility. Orthographic mode preserves the existing flat
256x256 RGBA texture and its 0.16 per-Cantum / 0.22 total caps exactly. Perspective
hides that floor mesh and uses only the envelope composite. The Influence toggle
controls the active representation; Names/sigils remain separately controlled.

Stage 3 originally used clamp(radiusLY * .30, 4, 9): 7.2 ly for the demo's 24-ly
radius and 5.4 ly for its 18-ly radius. The authorized intermediate calibration
supersedes this with clamp(radiusLY * .30, .5, 3); both wide-area demo half-heights
are now 3 ly, without changing radii or positions. At each horizontal sample, the centerline
is a Gaussian-distance-weighted inverse-square interpolation of the eligible
contributors' authored Y. Exact contributor locations interpolate their own Y;
coincident X/Z locations use their mean elevation. Remote islands therefore do
not inherit one another's maximum Y. Computation uses relative exponents for
numeric stability. Positions are never moved. If coincident elevations exceed
the available height budget, current eligible IDs are recorded in the envelope's
limitations array; the viewer does not invent a bigger boundary or move stars.

Geometry samples a bounded 128x128 chart grid, splits each cell into four
center-to-corner triangles and clips each triangle against fieldThresholdStart.
Shared edges use canonical cached roots with 24 bisections. Upper/lower surfaces
taper with sqrt(t * (2 - t)), where t is the clamped field interval between start
and end thresholds. Surface opacity uses the original smoothstep interval.
Contour vertices meet at the centerline. All XYZ coordinates are clipped to map
bounds; chart-edge cuts receive closing side faces. Zero-area triangles after
Float32 conversion are omitted, with consistent outward winding.

For the 160-ly chart, the grid step is 1.25 ly and the conservative horizontal
sampling tolerance is one cell diagonal, about 1.77 ly, plus Float32 rounding.
Contour vertices use the true field; straight segments interpolate between them.
Sub-cell features/narrow necks remain limited by sampling, rather than acquiring
new political meaning. Geometry can taper inward vertically; authored Y does not
join detached X/Z regions or split their existing horizontal footprint. Chart
clipping can produce a planar cut face at an authored bound.

Perspective shading uses a private geometry-only raster pass into a half-float
RGBA target: premultiplied weighted colors and alpha accumulate without depth
writes/testing. One screen-space chart-layer pass normalizes the accumulated
color and clamps final alpha to the configured cap, never above .22. Each face
starts at half the configured per-Cantum maximum (at most .08). Thus front/back
surfaces and overlapping different Cantums stay subdued, order-independent up to
floating-point rounding, without bright additive output or opaque stacking.
The required renderable half-float color-buffer capability is verified in the
Chromium browser checks. No full-scene raymarching or external rendering system
is introduced. Stars/routes draw afterward; neither shells nor composite can be
picked. Grid elevation, name/sigil identities and their layer preferences stay
unchanged. Depth testing is disabled for chart layers to prevent z-fighting.

Perspective nameplates retain accepted X/Z/component eligibility and use the
local sampled upper surface plus min(map.size.y * .03, map.size.x * .01) ly
clearance (1.6 ly in the demo). Top-down retains the Stage 1 provisional Y.
Detached islands use their local surface, not the highest distant island.

Mesh data are cached for eight resolved input sets, keyed by eligible IDs, XYZ,
colors/radius, thresholds, bounds and resolution. Panning/orbit/zoom never rebuild
geometry. Map/year updates use the cache; private geometries, materials and
render targets are disposed on replacement. The event-driven renderer resizes
the target to its actual drawing buffer, including DPR changes. Target memory
is eight bytes per drawing-buffer pixel. System zones and celestial rendering
are independent. Stage 4 identity rules below leave these envelopes unchanged;
Stage 5 polish remains deferred.
See [Stage 3 results](archive/reports/CANTUM_ENVELOPES_STAGE3_RESULTS.md) for evidence and limits.

## Stage 4 detached-island identities

Stages 1–3 are creator-approved. Stage 4 extends the existing `territorialLabels()`
result with `name-with-optional-sigil` or `sigil-only`. The original full-name pass,
including its metrics, candidates and fitting thresholds, runs first unchanged.
Every previously fitting island keeps its complete name and optional sigil.
Only a component that fails that pass can receive a sigil-only fallback. Without
a registered sigil, that component has no identity marker. Names are never
abbreviated and no generic emblem is substituted. Missing/blank resolved names
or inactive Cantums produce neither variant. Catalogue/InfoCard identity remains
the Cantum, never a new territory-island record.

`ISLAND_IDENTITY_POLICY` centralizes a fixed 768 CSS-pixel overview reference,
24-pixel sigil diameter, minimum 24 sampled component cells and one-cell padding
on every side. At the default 128x128 resolution on the 160-ly chart, the glyph
represents a 5-ly square; its padded 7.5-ly square must fit entirely inside the
same four-neighbor component. Both geographic dimensions therefore have to
accommodate the padded square. The cell-count test rejects poorly resolved
fragments; the padding accounts for boundary sampling tolerance. These are
presentation thresholds, not authored political or physical measurements.
No camera zoom, tilt, pan or mobile resize participates in classification.

Candidate centers are sampled cells at or above `fieldThresholdEnd`. All cells
covered by the padded square must belong to that component at
`fieldThresholdStart`. Prefer candidates clear of system markers at the reference
overview (15px marker radius plus 12px sigil radius), then interior depth and
proximity to the component's field-weighted center. If complete separation is
impossible, prefer maximum marker clearance among valid interior candidates.
Cell index resolves ties. No field, topology, membership or route calculation
changes. Sampling can omit narrow, sub-cell or clipped fragments deliberately.

The existing decorative `CantumNameplates` overlay owns both variants. A sigil-only
plate contains one image and no text/empty slot. Both share the existing 18–24px
CSS sizing, camera-facing projection, viewport containment, zoom-only fade and
independent Names toggle. Perspective anchors sample their own local Stage 3
upper surface plus the existing clearance. An invalid/missing surface hides the
plate. Top-down full-name heights stay unchanged; sigil-only provisional heights
use only contributors in that component. An absent or invalid local anchor is
omitted rather than relocated. Influence visibility stays independent.

Unknown/null/omitted sigils cannot create a small-island plate. An image error
removes a sigil-only plate and its cached DOM anchor completely; a full-name plate
retains its name. Rebuild/disposal removes image listeners. The existing bounded
eight-entry placement cache additionally keys registered-sigil availability.
Camera movement only projects/fades existing markers; it does not resample fields
or rebuild geometry. Synthetic cases are memory-only, with no demo JSON edits.
See [Stage 4 results](archive/reports/CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md). Stage 5 remains
deferred and is not a release-planning blocker; see [PROJECT_STATUS](PROJECT_STATUS.md).

## Intermediate realistic-scale calibration

Stage 4 and the intermediate calibration are committed in `190bd21` and preserved
through architecture Phase 2 at `6e026cb`. The calibration changed only Sector
star-symbol size and the provisional envelope-height clamp, adding an isolated
40-ly preview, now backed by the named calibration JSON. It does not complete Stage 5 or select a
permanent canonical radius. At that calibration checkpoint the Demo authored 24/18-ly radii; the active v1.3 Demo now uses the shared 24-ly radius described below.

Sector star-system spheres keep their color/geometry and use a centralized 4 CSS
pixel visible radius, inverted from the active camera projection. Caption radius
is also 4px, with the existing 4px text gap. Invisible targets still use the
existing neighbor-aware rule (up to 30px diameter). System celestial sizes/minima,
SVGs and physical radii do not change. Stage 4's conservative 15px marker-clearance
budget is retained, preserving identity anchors and allowing room for hit areas.

Explicit 2/2.5/3-ly radii yield nominal vertical half-heights .6/.75/.9 ly under
the new `.5–3` clamp. The Gaussian equation and .35/.65 thresholds are unchanged.
A single 2.5-ly contributor reaches the outer threshold at about 3.077 ly; two
equal contributors can connect at about 7.929 ly separation. These are approximate
chart influence measures, not legal borders. Neither chart width nor star spacing
automatically rewrites radius. Contributor-Y interpolation and the alpha caps
are unchanged. Wide-area demo envelopes are visibly thinner; no new containment,
mesh closure or compositing failure was found in the checks.

Run `npm run dev` (compatibility alias `npm run preview:calibration`) and open
`http://127.0.0.1:5174/Velara_Atlas/__calibration/`. Only this explicit loopback
server installs the preview; graphical Demo/build allowlists remain unchanged.
HTML/modules and finite registry-declared scenario JSON are served from an exact read-only inventory. The real
Atlas renderer, resolver, cameras, layer controls and Stage 4 nameplates show a
named A cluster, sigil-only outpost, name-only B cluster and unassociated controls.
At 128x128 sampling the 40-ly chart has a .3125-ly step / .442-ly diagonal tolerance.
Sub-cell necks remain resolution-limited; larger charts with the same small radii
need separate sampling review, not coordinate/radius rescaling.
See [calibration evidence and viewing instructions](archive/reports/CANTUM_SCALE_CALIBRATION_RESULTS.md).

Architecture Phase 3A operational changes are complete and creator-approved.
Architecture Phases 1?6 are complete; [PROJECT_STATUS](PROJECT_STATUS.md) owns future authorization. The scenario JSON and
cloning adapter preserve these calculations and all existing synthetic facts; see
[current commands, format and tests](LOCAL_DEVELOPMENT.md#local-development-and-future-canon).

## Completed Phase 3D governing-field activation

The active Demo shares a provisional 24-ly radius. B expands from 18 to 24 ly;
A is unchanged. No thresholds, opacities, colors or height formula changed.
See the [data crosswalk and measurable effects](DATA_MODEL_V1_3_PROPOSAL.md#phase-3d-demo-migration-crosswalk).
Subordinate systems enter the governor's single Gaussian field, envelope and
island detection; a same-colored duplicate field is not a merger. Labels/sigils
use the governor while administrative names remain in the catalogue/InfoCards.
Envelope contributors and label elevation anchors use validated group membership
and actual XYZ, including subordinate elevations. Cache keys retain grouped IDs,
positions, radius, thresholds and elevation/identity where consumed. Existing
clear/dispose paths replace WebGL/DOM resources on year changes. Unknown roots
are omitted from political shading and explained as Not recorded in InfoCards.
