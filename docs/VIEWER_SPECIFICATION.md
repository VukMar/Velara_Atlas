# Velara Atlas — Viewer Specification

**Document status:** Approved Milestone 3 functional specification  
**Version:** Milestone 3 v1.1 behavior, revised by navigation v1.2, Checkpoint 3.6 layout, cartographic labeling and Checkpoint 3.8 zones (separate from the JSON Schema version)
**Approved:** 2026-10-15 (territory-overlay revision, superseding the manual-boundary default)  
**Audience:** Project owner, Codex, and future contributors  
**Implementation status:** At `190bd21`, the local noncanonical viewer includes Checkpoint 4.1 Phase 3 models/proxies, the sector grid, Cantum Stages 1–4 and intermediate calibration, preserving Checkpoint 3.8 zones, labeling and Checkpoint 3.6 layout. Final artistic refinement, deployment and canonical migration remain separate. The [documentation index](INDEX.md) distinguishes current status from historical verification reports.

> **Checkpoint 3.6 layout revision:** [Layout and interaction revision](LAYOUT_REVISION_3_6.md)
> supersedes the former persistent bottom timeline, permanent side columns/right InfoCard,
> and selection-driven route highlighting. The sections below now use a centered
> square chart, floating panels, vertical History and a dismissible centered
> InfoCard. Schema v1.2 separately supersedes old local-gate branching examples.

Current completion/approval is recorded in [PROJECT_STATUS](PROJECT_STATUS.md). Dated phase amendments preserve their original review context; their historical pending-work statements do not reopen completed gates.

## 1. Purpose and governing principles

The Velara Atlas is a **read-only, JSON-driven, historical navigational atlas**, curated in-universe by **NEXUS** for Maric Cosmic Records / *The New World*. It represents authored three-dimensional space through a clear, mostly top-down navigation interface in the spirit of classic space-game charts, with an optional perspective view. All artwork, copy, and application assets must be original or appropriately licensed; **do not copy Freelancer or Discovery assets**.

The Atlas must support incremental worldbuilding. An astronomical system may be historically known and listed in the archive even when its detailed navigational map has not yet been released. A published detailed map may contain only some of its objects. Missing details are **not** grounds for inventing geometry, dates, names, or lore.

The viewer must remain **data-driven**: adding another supported object, system, Cantum, or valid dated record does not require modifying renderer code. Adding a **new unsupported entity or geometry type** can require an explicit schema and renderer extension.

### Non-negotiable boundaries

- **Public viewer only:** GitHub Pages–compatible, static, no publicly writable API, editing controls, or admin login. A visual local editor is **deferred as an optional future feature**; initial positioning/editing uses validated JSON in VS Code and, optionally, lightweight local-only debug readouts.
- **Public data only:** Everything a browser fetches, everything committed to the public repo, and everything emitted in a production bundle is assumed publicly accessible. Never ship hidden spoilers under `hidden: true` or rely on client-side authorization to protect them.
- **Historical truth is separate from publication:** Date filters determine what was known or existed at a selected year; release/publishing determines which approved details are downloadable. The former must never override the latter.
- **Stable IDs:** IDs never change when names, coordinates, affiliations, descriptions, or political control change.
- **No invented canon:** Use only approved public JSON and the historical resolver's documented rules. Demo records are intentionally noncanonical.
- **Testable separation:** JSON loading, historical resolution, navigation graph processing, camera control, and UI rendering should be independently testable wherever practical.

## 2. Authority and dependencies

Use the repository's existing source of truth, in this priority for matters of scope:

1. `docs/DATA_MODEL.md` and `schemas/atlas-v1_3.schema.json` - active **v1.3** NONCANONICAL Demo structure, with `schemas/atlas.schema.json` retaining v1.2 compatibility; `docs/SCHEMA_V1_2_NAVIGATION.md` owns approved navigation design and `docs/NAVIGATION_AUTHORING.md` its operational workflow.
2. `docs/DATA_RULES.md` — existing Continuance chronology and date caveats.
3. `docs/ARCHITECTURE.md` and `docs/CONTENT_WORKFLOW.md` — viewer/publication boundaries.
4. `public/datasets/demo/` — **noncanonical** test fixture (not official sector geography).
5. `AGENTS.md` — agent workflow and canon guardrails.
6. `docs/CANTUM_TERRITORY_RENDERING.md` — approved algorithm and render-order rules for the generated Cantum overlay (companion to this viewer specification).

The v0.1 `src/timeline/resolve.mjs` and `public/data/*.json` are **not migrated**. The viewer reuses the separate `src/core/history.mjs` for v1.1/v1.2 records; it does not adapt or overwrite canonical legacy data. Frozen regressions preserve older contracts.

**Implemented compatibility and remaining work are distinguished in §14.** Do not introduce undocumented JSON properties or change historical semantics as a presentation adjustment.

## 3. Spatial conventions and map hierarchy

### Two map levels

| Level | Contains / renders | Coordinate unit | Data source |
|---|---|---|---|
| **Sector map** | Procedurally merged Cantum influence overlays, positioned star-system markers, interstellar Jump Gate / Jump Hole connections | `ly` (light-years) | `sector.json`, `cantums.json`, `connections.json` and public presentation settings |
| **System map** | Celestial bodies, stations, short-range gates and routes, Jump Gates, Jump Holes, spatial zones | **CNU** (Continuance Navigation Unit) | `systems/sys_XXXX.json` and relevant `connections.json` entries |

All maps have their **own** independent `(0, 0, 0)` origin; `map.size.x/y/z` indicates **full** extents, not half-extents. The X/Z plane is the standard chart surface, with Y representing elevation. The sector and system contexts cannot be directly mixed: an interstellar route is drawn **between sector star-system positions** in light-years, not as a line between two endpoints in unrelated CNU spaces.

CNU is approved MCR terminology: a standard in-universe navigational distance measure for interplanetary positions and routes. **1 CNU = 10,000 kilometers**, universally across systems. Existing coordinates, extents, zones and connections retain their authored CNU values. Systems may have different square X/Z chart dimensions and independently authored Y extents; star placement need not coincide with chart center.

### Static geography

Coordinates are manually authored, absolute within the containing map, and do **not** model real orbital motion. A moon can have an `orbitingId` relationship with a planet while retaining a fixed, independently editable XYZ position. Changing the year does not animate or relocate objects unless a future, separately approved historical-position model supplies that behavior.

A null `positionLY` in the sector registry denotes an unplaced system: include it in an eligible catalogue but **do not render a marker**, manufacture coordinates, or move the camera to the origin.

## 4. Camera modes and input behavior

### Default camera — approved

- On both map levels, open in **orthographic top-down X/Z navigation** (camera viewing along the Y axis).
- Both camera modes use a centered **square viewport** independent of panel visibility. In 2D, fit the **complete declared square X/Z chart**, with identical horizontal/vertical world scale, even when no markers are eligible. Report invalid unequal X/Z extents instead of silently rescaling authored data.
- **Wheel / trackpad:** zoom about the pointer. Minimum 2D zoom is the full-map fitted state; prevent further zoom-out. Clamp pan, focus and zoom-to-cursor so the visible chart stays within declared boundaries. **Left drag on empty map:** pan; distinguish a click from a drag.
- **Top / 3D toggle:** switch to an orbitable, tilted **perspective** view showing actual Y elevation. Preserve the current map, selected object, date, and data. Switching back restores a comprehensible orthographic chart.
- **Reset View:** restore full-map framing; **Focus Selection** may center/zoom on a positioned object within 2D bounds and closes the InfoCard for inspection. Preserve perspective controls and per-map camera state, including the preceding top-down view. Camera changes never write to JSON.
- 3D orbit/tilt is available only in perspective mode. Provide usable mouse and touch controls, clear affordances, and camera limits that avoid getting lost inside the scene.
- Map bounds come from JSON. The viewer should not falsely clamp data by assuming every authoring map is exactly the same size; emit validation errors for ordinary object positions outside declared bounds. The Checkpoint 3.8 zone-origin exception below applies only to v1.2 system zones.
- 2D labels/selection targets remain legible; handle markers with identical X/Z but different Y without losing access to the underlying entities (e.g., selection list or disambiguation when projected icons overlap).

### Selection rules

| Context | Input | Result |
|---|---|---|
| Both | Hover (pointer devices) | Highlight marker and reveal name/short label |
| Both | Single-click / tap object | Select it and update the NEXUS InfoCard |
| **Sector** | Double-click star system, or use **Enter System** | Open its public system detail, or the NEXUS archival fallback if known but unreleased |
| **System** | Double-click positioned object, or **Focus** | Center/zoom toward that object; does not change system |
| System | Hover/focus short-range gate or connection stroke | Temporarily highlight eligible corresponding links; restore normal styling on exit/blur |
| System | Select Jump Gate / Jump Hole | Display paired destination system and **View Destination System** action when available |
| Both | Click empty space / Escape | Deselect or dismiss the current noncritical overlay |
| Both | Return to Sector / breadcrumb | Change navigation level **without resetting the selected A.E. year** |

Following an interstellar destination must be an **explicit user action**, not an automatic teleport on selecting the gate.

Selection opens a centered dismissible InfoCard and retains selected-object
targeting independently of route hover. A selected record alone must not keep
routes or partner markers highlighted. Keyboard focus supplies equivalent route
feedback; touch selection exposes the same record/actions without requiring hover.

### Unified NEXUS targeting — completed 4.2C

**Creator-approved, 2026-10-23.** Sector and System View use the exact original
`nexus-reticle.svg`: 60 CSS px cyan hover/keyboard focus with a slow 30s rotation,
and 72px static gold selection. Selection suppresses hover on the same object;
another object can remain cyan. Reduced motion removes rotation. Focus Selection
retains the gold lock after closing the InfoCard; normal dismissal clears it with
existing focus return. The decorative overlay is accessibility-hidden and cannot
intercept pointer/touch/keyboard input; explicit keyboard outlines remain.

Reticles consume the existing final projected anchors and visibility of positioned
systems, celestial bodies, stations, gates and jump holes in both cameras and
proxy/model representations. Historically absent, layer-hidden, occluded or
offscreen anchors produce none. Rebuild/navigation clears stale targeting;
archival and technical Retry presentation hide the overlay. Unpositioned records,
routes and zones receive no new geometry; their existing semantics remain.
The old generic proxy ring is retired. Marker dimensions, hit areas, authored XYZ,
physical scale, camera behavior, 4.2A InfoCards/header and 4.2B archival content are
unchanged. See [approved treatment](NEXUS_VISUAL_IDENTITY.md#checkpoint-42-approved-direction--planned-implementation-amendment-2026-10-23).

**4.2D apparent-size amendment (complete and creator-approved, 2026-10-23):**
System View now uses centralized 42/36/30/24/21/18/15px minima for star/gas planet/
other planet/moon/small body/structure/short-range gate. These are navigational
pixels, never physical measurements. The original 1.35 smoothstep handoff,
physical models, shared anchors, hit targets and camera behavior are unchanged;
existing caption offsets/collision footprints follow the larger display sizes.
The 60/72px reticles remain independent and unchanged. Original Phase 3 minimum
values elsewhere in this specification describe that historical baseline; the
[scale amendment](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md#checkpoint-42d-visual-minimum-amendment--approved-2026-10-23)
records accepted current values. Sector symbols remain exactly 8px.

### Focus Selection motion — Checkpoint 4.2E

**Complete and creator-approved, 2026-10-23.** Normal-motion Focus uses **550ms**
smoothstep (`t*t*(3-2*t)`) camera movement toward the original inspection,
ordinary-anchor or zone destination. Scale/zoom/clipping interpolate geometrically;
the settled position, controls target, orientation/up, zoom, clipping/projection,
inspection restrictions and saved top view retain their established values.
Inspection constraints activate at arrival, without prematurely pinning movement.

Pointer drag/pan, wheel, touch, keyboard camera actions, Zoom, tilt, Reset, a
second Focus, mode/restore, resize, year/rebuild/disappearance, navigation,
archival entry, context loss and disposal cancel the old operation. Manual input
takes precedence from the visible intermediate free view. Its actual frustum
remains bounded and can be retained in an optional `focusFrame` camera snapshot;
ordinary chart framing/clamping is unchanged. Reading a snapshot does not cancel
Focus. Reduced motion applies the valid endpoint directly; changing to reduced
motion while moving completes it immediately. There is no replacement effect.

The InfoCard closes and returns keyboard focus to the canvas as before; selection
persists. Existing projected anchors drive reticles and proxy/model handoff on
every frame, with no independent object or reticle movement. Map navigation still
commits immediately; the separate 4.2F reveal below adds presentation only. See [accepted results
and limits](DEVELOPMENT_ROADMAP.md#phase-42e--focus-selection-animation).

### Chart navigation reveal — Checkpoint 4.2F

**Complete and creator-approved, 2026-10-23.** Sector→System, System→Sector and
eligible System→System navigation use a 420ms dark/cyan destination reveal with
`cubic-bezier(.42,0,.58,1)` easing. This is a chart-record change, not simulated
travel or a Focus camera animation. History, scene replacement, saved-camera
restoration and destination focus commit synchronously; no obsolete map remains
interactively active while an effect waits. Same-scope requests, selection,
ordinary year refresh and layer/camera changes do not start the effect.

One pointer-transparent, accessibility-hidden viewport decoration sits below
reticles and outside the floating controls' ownership. Archival entry uses only
a perimeter accent, preserving its approved portrait/copy and accessible Return
action. Input, Reset, Focus, mode/zoom/tilt, selection, history refresh/automatic
return, replacement navigation, technical context loss and disposal cancel it.
Reduced motion navigates directly; a live preference change clears the effect.
Keyboard/touch behavior and existing canvas/archival-heading focus are retained.
Failure of the optional animation leaves navigation usable. Technical errors
retain explicit recovery and cannot become an archival notice. Camera snapshots,
550ms Focus, physical scale, geometry, data and assets remain unchanged.
See [accepted results and limits](DEVELOPMENT_ROADMAP.md#phase-42f--map-navigation-transitions).

### Sector chart grid

Sector View uses an **8×8 unnumbered grid** spanning the complete square X/Z
extent. Each cell is `map.size.x / 8` wide and `map.size.z / 8` deep in ly.
All grid vertices and scale endpoints use **`map.planeY`** (currently zero by
schema), independently of map origin Y or vertical extent. Only the bottom-right
cell has a scale: the actual cell width in light-years, with the existing
double-headed width arrow and text above it. The 160-ly demo shows **20 ly**.
There are no column letters, row numbers or H8 designation; its internal marker
is `sector-bottom-right`, with Sector View grid-cell accessibility text.

The same world-to-screen projection handles both cameras. Coordinate grid hides
lines, text and arrow together, retaining independent sector/system preferences.
These transparent visual-only elements never intercept selection. The grid draws
before Cantum influence; its existing separate presentation elevation, geometry,
opacity and historical behavior are preserved. Stage 1 Cantum nameplates use
their own provisional elevated anchors, independently of grid placement.
Chart bounds, camera framing and authored system XYZ do not change.

### System chart grid

Use eight equal columns **A–H** left to right (−X to +X) and eight equal rows
**1–8** top to bottom (−Z to +Z). Borders, grid lines and projected annotations
are anchored in world space at **absolute Y = 0 CNU**, including the H8 arrow
endpoints. This reference does not move with a nonzero map origin or vertical
extent. Objects retain authored XYZ above/below it; map bounds and camera targets
are unchanged. The grid remains transparent line segments below routes/markers,
excluded from picking. Coordinate grid controls lines and annotations together
in both camera modes, retaining existing per-map preferences. H8 displays one cell's navigational width,
`map.size.x / 8`; a 100,000-CNU map shows **12.5K CNU**. This is not a physical
body dimension. Sector View uses its own unnumbered light-year scale described above.

## 5. Object rendering: icons and optional 3D

The approved approach is **hybrid**:

| Data-driven object | Top-down (primary) | Optional 3D representation |
|---|---|---|
| Star | Distinct star icon | Simple glowing sphere |
| Planet | Planet icon | Procedural sphere by approved variant; neutral unknown when unspecified |
| Moon / planetoid / asteroid | Differentiated celestial icon | Simplified small geometry |
| Station | Class-specific symbol | Camera-facing navigational marker initially; detailed models optional later |
| Short-range gate | Local gate icon | Camera-facing marker at authored/derived XYZ initially |
| Interstellar Jump Gate | Distinct jump icon | Camera-facing marker at authored XYZ initially |
| Jump Hole | Anomaly icon | Stylized spatial anomaly |
| Spatial zone | Projected translucent shape | Procedural or simplified translucent volume |

Use the object's **`entityType` / `objectType`** for logic, and an `icon` or style identifier for representation. Never determine behavior by comparing lore names (e.g. `if name === 'Putluk'`). Assets and theme styling must be replaceable without altering coordinates or canonical history.

The current viewer uses restrained procedural physical models and starter SVG proxies as specified below. Complex models, cinematic effects, animation, full orbital dynamics, and final NEXUS art direction remain deferred.

### Checkpoint 4.1 scale contract — Phase 3 rendering

[The celestial scale specification](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md) defines
the approved physical-size and apparent-size contract. Phase 1 implements only
documentation, optional schema support and tests. Reviewed Phase 2 supplied demo
measurements; authorized Phase 3 now implements physical models and SVG proxies.
Celestial `physicalDiameterKm`, when known, converts to CNU by division by 10000.
2D and 3D must use identical authored XYZ and physical diameters, projected through
the active camera. Implemented centralized category minima use
`displayDiameterPx = max(projectedPhysicalDiameterPx, minimumDisplayDiameterPx)`
without inflating physical geometry or authoring per-object pixel sizes.

Distant SVG proxies stay anchored at the physical position and face the camera
in 3D. Transition continuously to correctly scaled celestial models, avoiding
size jumps, duplicate disks and inconsistent selection. Stellar corona/glow and
desktop/touch hit areas remain separate from physical diameter. Unknown diameters
use a neutral navigational fallback without invented measurements. Stations,
Jump Gates, Jump Holes and short-range gates initially use fixed apparent icons;
megastructure representations need separate approval. The implemented CSS minima
are 28/24/20/16/14/12/10 pixels for star/gas planet/other planet/moon/small body/
structure/short-range gate, with a complementary smoothstep handoff from 1.0 to
1.35 times the minimum. Screen-projected HTML SVG billboards share each object's
existing button and XYZ anchor. Focus Selection preserves identity and frames
known bodies in a centered inspection regime; pan is locked there, near/far and
distance limits follow the physical radius, and Reset restores normal chart
navigation. Unknown sizes stay neutral proxies. See the scale specification for
projection math, clipping limits and exact asset allowlists. Existing labels, grid,
zones, routes, history and camera interactions remain authoritative.

### Spatial zones — approved viewer extension

`zon_XXXX` **spatial-zone** support is implemented by the v1.1/v1.2 contract and renderer. Supported geometry kinds:

- **Ellipsoid:** XYZ center and 3D radii.
- **Box:** XYZ center and XYZ extents, with a documented rotation convention if orientation is added.
- **Polygon volume:** authored X/Z polygon plus vertical Y bounds; display its footprint in top-down view and extrusion/volume in 3D.

Zone types can include nebulae, asteroid fields, radiation clouds, and dust clouds. A zone has a stable ID and the universal historical InfoCard where appropriate. A named individual asteroid or planetoid remains a `cb_XXXX` celestial body; decorative particles/rocks should be procedurally rendered, **not stored individually**. Author-defined boundaries govern actual region geometry; deterministic seeds govern visual variation only. Procedural effects must never change boundaries, ownership, or route logic.

**Checkpoint 3.8 — implemented system-zone geometry and interaction:**
[The zone specification](ZONE_GEOMETRY_INTERACTION_SPEC.md) replaces full
containment with strictly positive volume intersection for v1.2 system zones.
Their reference origins and dimensions may extend beyond the map, while only
the intersection with its true XYZ box is rendered and interactive. Ordinary
objects/gates, sector zones and frozen v1.1 containment remain unchanged.

Top-down view projects the intersected volume through the map's Y interval.
An ellipsoid centered above/below that interval therefore has a reduced visible
footprint. Box footprints are clipped rectangles; simple concave polygon volumes
are triangulated and clipped piece by piece, retaining gaps/disconnected pieces.
Perspective uses twelve bounded horizontal cloud slices with authored ellipsoid
membership masks, plus deterministic particles sampled in clipped bounds. This
is a restrained environmental approximation, not a solid boundary mesh or physical
simulation. It remains visible when a giant zone surrounds the chart. Particles,
slice geometry and accepted fragments stay within chart XYZ; timeline/map cleanup
disposes resources. Overlap alpha is attenuated by the visible zone count.

Pointer priority is **objects/marker controls → connections → zones → empty**.
Zone picking uses the true clipped volume/footprint, independently of its origin
or visual slices. Top-down tests projected membership; perspective intersects
finite ray intervals with the chart-clipped volume, including inside cameras.
Overlaps favor smaller visible footprint area in 2D or clipped volume in 3D, then
stable ID. Ellipsoid overlap sizes use bounded deterministic quadrature; prism
sizes are exact. Catalogue/Selection exposes other overlapping records.

Hover subtly brightens the region and shows a plain-text historical name/category
near the pointer, clamped to the viewport and never receiving events. This is
separate from object-caption decluttering and remains available with Object Names
off. System zones have no permanent origin caption/button. Clicking/tapping a
visible zone opens the existing centered InfoCard, including its true geometry
reference origin, category and authored dimensions. Focus uses a deterministic
visible witness point and clipped extent, respecting camera zoom/clamp limits.
The Spatial zones toggle controls rendering and picking together. Discovery/
known-by filtering is unchanged; v1.2 has no zone-expiry field. Do not invent one.

See [verification and limits](archive/reports/ZONE_GEOMETRY_INTERACTION_RESULTS.md).

**2D hover-outline follow-up:** Hover or keyboard focus also outlines the active
system-zone footprint in cyan, at approximately 1.75 CSS pixels through zoom.
Solid contours show authored projected boundaries; dashed contours show chart
clipping, with a tooltip legend. A giant enclosing zone therefore shows a dashed
chart frame, without inventing a physical boundary at that frame. Native SVG
ellipse/rectangle/polygon contours use the existing XYZ intersection and are
clipped to both the footprint and chart. Polygon triangulation seams are never
outlined. The overlay is pointer-transparent, clears on exit/higher-priority
interaction, and is absent in 3D and Sector View. Picking and 3D visualization
remain the approved Checkpoint 3.8 implementation.

## 6. Gate networks and route visualization

**All runtime navigational connections come from generated `connections.json`**. System-object declarations are the v1.2 authoring source of truth; the manual offline generator compiles them. The viewer never generates links or infers them from proximity.

| Route kind | Endpoint rule | Cardinality |
|---|---|---|
| Short-range (`short_range_gate`) | Two dedicated `gat_XXXX` short-range gates in **the same** system | At most one fixed lifetime link per gate; multiple relationships require separate physical gates |
| Interstellar Jump Gate (`jump_gate`) | Two `gat_XXXX` Jump Gates in **different** systems | Each physical gate endpoint belongs to **at most one** interstellar link in the whole dataset |
| Jump Hole (`jump_hole`) | Two `jhl_XXXX` Jump Hole endpoints in **different** systems | One-to-one paired endpoints, at most one link per endpoint |

A system connecting to systems B and C through Jump Gates requires **two separate gates** in the origin system. Multiple Jump Gate routes or Jump Hole routes between the same pair of systems are possible **only via distinct endpoint pairs**. No gate-to-hole mixed pairing. Link direction (`bidirectional`, `a_to_b`, `b_to_a`) must be reflected in the details and, where legible, a directional indicator.

**On the sector map:**

- Draw eligible interstellar links between positioned source and destination **systems**.
- Use visually distinguishable **solid** lines for Jump Gate routes and **dashed** lines for Jump Hole routes (subject to final theme tuning).
- If both routes connect the same two systems, use non-overlapping offset/curved strokes and independent hit targets. Do not silently merge them.
- Selecting a link identifies its kind, endpoints, historic availability, and the corresponding systems. An unavailable or unplotted endpoint cannot produce a fabricated line.

**On a system map:**

- Draw eligible **short-range links** using the gates' local CNU positions.
- Hovering or keyboard-focusing a local gate/stroke highlights its eligible route temporarily. Selection opens metadata/actions and maintains only selected-object targeting. v1.2 does not permit short-range endpoint reuse.
- Show interstellar gates/holes at local coordinates, with paired destination metadata; **do not draw a world-spanning line in local CNU space**.
- The **View Destination System** action opens the destination detail or its archival fallback as appropriate.

Filter routes by dated availability, endpoint historical visibility/existence and public disclosure. A Jump Hole may predate discovery or traversability. Current v1.2 forbids lifetime repointing for every gate/hole type; frozen v1.1 branching tests are historical compatibility coverage, not permission to author branching now.

## 7. Historical navigation — continuous year, vertical panel

The compact side **History** control opens a vertical timeline panel on both map levels. The currently selected year remains visible in the header when the panel is closed. No permanent bottom strip is required; opening History must not resize or shift the chart.

- Default to **1200 A.E.** for the demo. The implemented range uses `timeline.startAE` through `defaultAE` (0–1200 in the current demo); a distinct latest-published-year field is not defined yet. Do not add an undocumented key.
- Slider allows selection of **any whole supported year** (1-year steps).
- Provide direct numeric input, previous/next **exact recorded-year** controls and Reset to Latest. The implemented record jumps use exact scalar discovery dates and interval boundaries explicitly marked `datePrecision: exact`; they omit known-by, construction/settlement without precision metadata, and qualified/unspecified boundaries. Optional richer event markers remain future work.
- Provide **Reset to Latest** using the latest published year, not the user's current real-world calendar year.
- Changing year updates names, political affiliations, state/ownership where supported, populations, crew, armament, descriptions, existence, discovery, navigational links, overlays, and Cantum statuses as permitted by published records.
- Preserve current map, zoom, panel visibility, and camera position wherever possible. If the current map or selected object becomes historically unavailable, clear the invalid selection and show an appropriate unobtrusive notice or return to the eligible parent map. Do not display future facts.
- Resolve `fromAE` inclusive, `untilAE` exclusive, and open-ended `untilAE: null`; never treat unknown `null` year as 0 or assume an approximate historical transition is an exact legal event.

### Historical uncertainty and partial chronological knowledge

For `discoveredAE: null`, **do not guess discovery**. Current v1.1/v1.2 permits a separate `knownByAE` only when exact discovery is unknown. Visibility may begin conservatively from that confirmed year, while keeping discovery null and describing the date as known-by. Without either date, do not assume visibility since zero. Confirmed knowledge and exact discovery remain distinct.

Timeline content comes from **publicly released** events only. Event markers, search, previews, tooltips, and URLs must not expose private/unreleased history.

## 8. Layout, panels, and responsive behavior

### Map-first shell — Checkpoint 3.6

```text
+--------------------------------------------------------------+
| VELARA ATLAS   Sector / current location       selected A.E.  |
+--------------------------------------------------------------+
| Catalogue                                      History      |
|              centered square chart                          |
|              same size with panels open                      |
|              [InfoCard popup only on selection]              |
| Map controls                                   Map layers   |
+--------------------------------------------------------------+
```

- **Header:** compact Atlas identity, noncanonical label, Sector/current location and selected year.
- **Square chart:** centered and fitted in the available area on desktop, narrow and mobile screens; independent of panels and record selection.
- **Floating panels:** searchable catalogue, map controls, layers and vertical History; compact toggles, closed initially, restrained translucent blue-black surfaces and bounded scrolling. They reserve no permanent layout columns.
- **InfoCard:** centered, dismissible popup opened by object, route or catalogue selection. No initial card. A visible top-right close control and Escape clear selection, return focus and preserve the camera. Keep all current record fields, fallbacks, destination actions and technical errors.
- **Navigation:** sector → system with explicit return/destination actions. Cantum administration is historical metadata, not a permanent physical nesting hierarchy.

Panels and the InfoCard must fit narrow screens without clipping or shifting the chart. Preserve keyboard/touch access to years, catalogue, selection, navigation and camera controls. The current post-gesture touch-check limitation is recorded separately in verification reports; it is not a waiver of usable touch behavior. Colors, fonts and future imagery follow **Milestone 5 NEXUS visual identity**.

### InfoCard content

The six **approved universal fields**, from the data contract, are:

`affiliation`, `class`, `crew`, `population`, `armament`, `description`.

The card also identifies the selected entity, its name **valid for the chosen year**, kind/classification, coordinate details when available, and relevant navigational destinations/actions. Display only fields appropriate and available for the selected object. For a station use **crew**; for an inhabited planet typically use **population**. An uncolonized planet may show only a description.

A `null` field means **no published value**, **not** zero or negative evidence. Count `0` is a real recorded zero; unknown count stays unknown. Render informative “Not recorded” text only if that improves clarity, not an invented assertion such as “No armament.” The InfoCard is a presentation layer, not the source of object identity or spatial placement.

## 9. Catalogue and search — approved

- **Sector view:** search and list publicly available, historically eligible **Cantums and star systems**. A system lacking sector coordinates may still appear as a searchable record but must not trigger camera movement to an invented marker.
- **System view:** search/list objects **within the current system**, including historically available spatial zones.
- Search against **the name valid at the selected year**. Earlier/later unpublished names must not leak. Searching historical aliases across eras may be added later, but only with chronology-safe behavior.
- Selecting a result opens its centered InfoCard and selected-object targeting. Focus Selection is a separate camera action; unplaced/fallback records never get invented marker coordinates.
- Filters by category/type are presentation filters; they do not alter data or the historical state.
- Public indexing is generated from **released records**, not private RTF manuscripts or unpublished JSON.
- Show a clear empty result state and avoid ambiguous duplicate-name selection by displaying classification/system context.

## 10. Overlay layers — approved

All layers are **view filters**, not modifications to source data. Maintain **separate view preferences for sector and system levels**, retained while navigating within the viewer session.

| Sector overlays | System overlays |
|---|---|
| Star-system markers | Celestial-body markers |
| System labels | Stations |
| Cantum influence regions (metaball overlay) | Short-range gate routes |
| Jump Gate routes | Jump Gates and Jump Holes |
| Jump Hole routes | Spatial zones |
| Coordinate grid | Coordinate grid |
| Political affiliation colors | Object labels |
| Historical event indicators | Elevation indicators |

The prototype provides independent **Cantum Names** (sector only) and **Object
Names** (both levels), enabled by default. Cantum Names remains independent of
influence shading. Object Names controls passive captions; hover, keyboard focus
and selection retain temporary identification. Hiding an object layer also hides
its captions. Preferences survive year changes, navigation and camera switching,
using the existing per-sector/per-system session preferences.

Route transports remain combined under one Connections toggle. Separate transport,
political marker-color, event-indicator and elevation-guide switches are not
implemented. Grid, influence, zones and entity/route groups have floating controls.
Phase 3 implements starter SVG symbols and simple physical celestial materials
as described in §5. Final artistic refinement remains separate work.

### Cartographic typography and adaptive captions — implemented refinement

[The approved labeling specification](CARTOGRAPHIC_LABELING.md) defines two
independent systems. Sector Cantum lettering uses currently resolved names and
`territoryGroups` contributors. A cached 128×128 per-Cantum Gaussian field mask
uses the overlay's visibility threshold and four-neighbor components. Each
sufficiently large component can receive one complete name; disconnected holdings
never gain a forced bridge or shared spanning name. Weighted principal axes,
interior clearance and padded rectangle fitting determine fixed X/Z positions,
world dimensions and upright angles bounded to ±30°. Unnamed regions are omitted;
Stage 4 provides registered sigil-only identities for eligible smaller islands.
This represents approximate influence geography, not legal borders
or a claim of historical sovereignty.

**Cantum Visual Patch Stage 1:** projected DOM nameplates replace floor-mounted
CanvasTexture meshes. The accepted component fitting still determines eligibility
and stable X/Z anchors; its angle/world dimensions no longer orient or stretch
the displayed text. Names remain horizontal in both cameras at 14–24 CSS pixels
(`clamp(viewport width × .027, 14, 24)`), with weight 600, Cantum tint and a subtle
shadow. A provisional height helper uses the highest currently eligible system Y
for that Cantum plus `min(map.size.y × .05, map.size.x × .02)` ly clearance.
Only systems referenced by the resolved contributor group participate. No
chart-ceiling placement, new measurement or authored coordinate is introduced.
Stage 3 now uses the local envelope upper surface in perspective, as described below;
this provisional contributor height remains the top-down anchor.
Text near viewport edges is contained with a four-pixel margin; this adjusts only
its screen presentation, preserving the projected/world anchor and complete name.

Opacity retains the continuous overview-to-zero fade at 5× fit zoom (peak .46),
without any camera-elevation, orientation or foreshortening cutoff. Anchors outside
the camera frustum or behind the camera are hidden. The decorative `aria-hidden`
overlay has no hit targets or catalogue identities; existing object
captions/controls and grid annotations remain above it. Map/year changes replace
its nodes; scene disposal removes the overlay. There are no text GPU resources
or new animation loops; the topology/placement cache retains eight input sets.
Top-down influence remains flat and unchanged. Stage 2 adds optional sigils;
Stage 3 adds perspective envelopes. Stage 4 extends small-island identities below.
See [Stage 1 results](archive/reports/CANTUM_NAMEPLATES_STAGE1_RESULTS.md).

**Stage 2 optional Cantum sigils:** the closed registry recognizes only
`test-cantum-a` for the noncanonical demo. A valid image is prepended inside the
same nameplate; it shares the existing XYZ anchor, zoom-only opacity and viewport
containment. CSS sizing is `clamp(18px, 1em, 24px)` with a .35em gap when both
items exist. Null, omission or an unknown ID creates no image; a failed asset
removes the image and triggers the existing render path to recontain the text.
Rebuild/disposal removes image error listeners. There is no generic fallback,
new interaction target, permanent loop, new island eligibility or System View
plate. Stage 4 additionally omits the whole plate if a sigil-only image fails.

**Stage 3 perspective influence:** only perspective uses translucent flattened
world-space envelopes derived from the same Gaussian X/Z field. Top-down retains
the original RGBA texture, including mixing/alpha caps. The representations are
mutually exclusive under the existing Influence toggle. Bounds-clipped upper/lower
surfaces now use the intermediate calibration's `clamp(radiusLY * .30, .5, 3)`
half-height (superseding Stage 3's 4–9 ly clamp) and a smooth local elevation
interpolation through eligible contributors. A capped geometry-only accumulation
pass keeps all front/back/overlap alpha at or below .22. It requires a renderable
half-float color target; no volumetric raymarching or new selection identity exists.
Perspective nameplates keep X/Z and eligibility, sitting above the local upper
surface by `min(map.size.y * .03, map.size.x * .01)` ly. Names remain independent
of Influence. See [geometry, tolerance and limits](CANTUM_TERRITORY_RENDERING.md#stage-3-dual-presentation-and-bounded-envelope-geometry)
and [Stage 3 evidence](archive/reports/CANTUM_ENVELOPES_STAGE3_RESULTS.md).

**Stage 4 island identities:** the original full-name fitting pass remains first
and unchanged. An island that cannot fit its complete resolved name may display
only its approved registered sigil; null/omitted/unknown sigils produce no marker.
No abbreviations, generic emblems or island selection entities are introduced.
At least 24 sampled cells and an interior square accommodating a 24px sigil on a
fixed 768px overview, padded by one field cell on every side, are required.
These camera-independent rules omit tiny or poorly resolved fragments. Stable
interior candidates prefer marker clearance and field depth. Full-name and
sigil-only plates share projection, fade, containment and Names visibility;
perspective heights use their local envelope upper surface and existing clearance.
Missing surfaces hide the marker. A failed outpost image removes its entire plate.
Influence shading, geometry, colors and political history remain unchanged.
See [the policy](CANTUM_TERRITORY_RENDERING.md#stage-4-detached-island-identities)
and [Stage 4 evidence](archive/reports/CANTUM_ISLAND_IDENTITIES_STAGE4_RESULTS.md). Stage 5 is deferred.

**Intermediate calibration:** Sector `star_system` spheres have an 8 CSS-pixel
diameter independent of camera zoom, tilt, projection and DPR. The central 4px
radius setting affects only these catalogue symbols. Captions use a 4px visible
radius plus 4px gap; invisible neighbor-aware targets retain their existing
up-to-30px size. All System View celestial minima/physical dimensions remain
unchanged. A separate loopback-only 40-ly calibration preview compares explicit
2/2.5/3-ly territory radii without changing demo/canonical data or Stage 4 placement.
The existing 24/18-ly demo envelopes now have 3-ly half-heights. This is provisional
scale evaluation, not Stage 5 or canonical radius approval. See
[the report](archive/reports/CANTUM_SCALE_CALIBRATION_RESULTS.md).

Projected HTML object captions stay centered beneath marker footprints at readable
CSS font sizes (0.8rem by default), following actual XYZ in both camera modes.
Priority is focus, hover/touch, selection, systems, stars/planets, interstellar
gate/hole objects, stations, moons and short-range gates. Lower categories become
eligible progressively with zoom and a 6% threshold deadband. Stable ID tie-breaks
and a screen-space spatial hash suppress collisions with other captions, marker
footprints, grid annotations (including H8), and floating panels. Detectable
nearer-marker occlusion suppresses passive names. Interaction feedback wins over
passive obstacles; the active caption wins if several active names collide.
Routes/zones retain temporary identification only. Suppression affects text alone;
marker buttons, picking, catalogue and Selection access remain available.

See [implementation evidence and limitations](archive/reports/CARTOGRAPHIC_LABELING_RESULTS.md).

### Generated Cantum regions — approved revision (supersedes manual territories as default)

The sector political overlay uses **soft, semi-transparent, blurred-edge Cantum influence regions** computed from **historically eligible, positioned, publicly released** star systems belonging to each Cantum at the selected A.E. year. Each system contributes an X/Z-centered influence bubble; **same-Cantum bubbles merge by a continuous metaball-like scalar field**. Different Cantums never merge into one political entity. These are **suggestive cartographic regions**, **not legally precise borders**, and do not establish 3D sovereignty. This region layer is below every system marker, interstellar route, label and selection target.

- Use a single approved historical ownership input for system-to-Cantum membership: the effective `cantumHistory` entry at the selected year. Do not assume the current name, InfoCard text, Jump Gate links, proximity or `controlHistory` proves Cantum membership.
- Exclude unplaced (`positionLY: null`), unreleased, future-undiscovered, or unassigned systems. A known-but-unexpanded system **with a sector position** still contributes a bubble; no system detail file is needed.
- A lone system forms one soft bubble. Nearby same-Cantum bubbles join; far-separated clusters remain islands. Never draw a forced bridge across empty space solely to connect all of a Cantum's systems.
- Take color from explicit **public-safe presentation settings** keyed by Cantum ID, not generated from names. Radius is defined in **sector light-years**, not screen pixels or system-level CNU; allow a fixed global default and per-Cantum overrides. Radius is independent of zoom, count of systems, and which systems happen to be visible.
- Changes to selected year can change the contributor set, so regions update automatically with *recorded* discoveries, Cantum formations and membership changes. The overlay never modifies political truth or JSON history.
- Exclude all unpublished data from calculations. A political layer toggle hides/shows the drawing only; no lore data is deleted or inferred.
- No manually authored region polygon is required for version 1. Manual *precise* boundary overlays may be added later as a separately approved feature, not as the default renderer and not as a prerequisite for deployment.

**Implementation contract and numeric defaults:** Follow `docs/CANTUM_TERRITORY_RENDERING.md`, including the exact field, opacity caps, compositing, 3D presentation and performance rules. The active v1.3 schema validates the separate `presentation.json`, including its shared radius; v1.2 retains its separate contract. This is style data, not a legal boundary or canonical migration.

### Elevation

In standard 2D view, a selected object's InfoCard exposes its Y coordinate; an **optional elevation indicator overlay** can mark +/− Y offsets. In 3D mode the full positions are visible, optionally with vertical guides; turning these aids off never changes geometry.

## 11. Archival states, loading, and error handling

The following are **different**, and must be rendered differently:

| State | Expected public behavior |
|---|---|
| **Historically not yet discovered/known** | Absent from current-year map and catalogue; no future-name leakage |
| **Known system; `positionLY: null`** | Searchable archival catalogue entry if chronologically eligible; no sector marker; selecting shows available record / fallback |
| **Known positioned system; `publicDetailPath: null`** | Sector marker and catalogue entry; opening shows **NEXUS archival fallback** |
| **Known system with partial detail JSON** | Open and render exactly the released objects, even if that is just one planet or gate; no empty-map fallback merely for being incomplete |
| **Requested detail fails to fetch, parse, or validate** | **Technical error** with retry; do not mislabel as an archival limitation |
| **Present data but no eligible objects at selected year** | Valid empty historical map with explanatory message; no fabricated objects |

Original proposed NEXUS fallback copy (historical design context, superseded by
the creator-approved 4.2B universal JSON wording below):

> **NEXUS // ARCHIVAL NOTICE**  
> **DETAILED SURVEY UNAVAILABLE**  
> This star system is recognized in the historical record. A detailed navigational reconstruction is not yet available in this edition of the NEXUS archive.

Fallback should show any **already public** system name, selected year, and archival status; include a **Return to Sector** action. Do not call a system “classified” unless canon/publication metadata actually supports that claim. A failed URL/JSON parse is **not** permission to show this notice instead of error feedback.

### Data loading — original Milestone 3 proposal, superseded in part by Architecture Phase 3B

1. Load the sector index first, then the public Cantum and connection registries needed for this map.
2. **Historical proposal, no longer implemented:** **Lazy-load** an individual `systems/sys_XXXX.json` only when the user navigates to that system (or a documented preload action explicitly permits it). The current Demo instead eagerly preloads approved details.
3. **Historical proposal, partly superseded:** Cache successfully fetched public records for session navigation; rerun **historical resolution** when the year changes instead of refetching every object. The current Demo re-resolves time against eagerly loaded data maps.
4. Keep source records immutable from viewer interactions. Validate references to permitted IDs and fail gracefully on missing/invalid data.
5. Use Vite/GitHub Pages–compatible base-relative URLs; avoid hardcoded site-root paths that break repository subpaths.
6. No local editing or saving endpoint in the public bundle.

### Current implementation and Checkpoint 4.2 planning amendment

The numbered section above retains original Milestone 3 intent.
**Actual current Demo behavior:** Architecture Phase 3B and later phases
use a validated sector-derived inventory, eager preload of all registered
released detail/faction modules and strict file/graph freshness checks.
The browser does **not** dynamically fetch a system detail on entry.
§publicDir: false§ and explicit Vite module/admitted asset inventories
remain in effect. The historical state table in Section 11 is still
authoritative: `publicDetailPath: null` gives NEXUS archival fallback
when the system is historically known, while a missing/invalid registered
detail is a technical error with retry. Source ownership is documented in
[ARCHITECTURE](ARCHITECTURE.md#validated-dataset-inventory) and
[local development](LOCAL_DEVELOPMENT.md#registered-demo-systems-and-loading).

**Completed and creator-approved 4.2B (2026-10-23)** changes presentation, not this
state logic. `archival-view.mjs` owns a dedicated nonmodal section inside the
existing square viewport, shown only for resolved `view.state === 'archival_fallback'`.
Name and A.E. year refresh from resolved public history; the exact universal
`title`, `subtitle`, `message` come from validated
`public/content/nexus/fallback-data.json`, never legacy world overrides.
See [approved wording](NEXUS_VISUAL_IDENTITY.md#checkpoint-42-approved-direction--planned-implementation-amendment-2026-10-23).
The approved front-facing portrait is decorative, contained without cropping,
reduced/hidden responsively and hidden on image failure. Text and Return remain
usable with internal scrolling on small/short/enlarged-text screens.

Return uses existing Sector navigation, as does the header control. Explicit entry
focuses the historical heading and closes source floating panels; History and
Catalogue remain available. Routine historical refresh retains focus; leaving
restores map focus. This does not open or replace the ordinary InfoCard dialog.
At 899 A.E. the Demo fallback system is absent and a visitor inside it returns to
Sector; at 900 and 1200 it shows its current resolved public identity/year.
Released partial charts remain maps; valid charts with no eligible objects retain
their ordinary empty-map message. Invalid/missing registered data, content-module
failure and failed startup remain technical errors with Retry. WebGL context loss
hides any prior archival panel and retains technical recovery feedback across
historical refreshes; it cannot become an archival notice.

Completed, creator-approved 4.2A–I retain branding, archival content, targeting,
System minima, Focus motion, decorative chart navigation and the opening below.
4.2H adds two approved prerecorded speeches, persistent audio and first-entry
completion, as specified below. 4.2I adds concurrent interface effects and one
quiet loop under the same master control. Motion honors reduced motion and
lifetime cleanup; no second renderer or extra world data. Later work requires
separate authorization. See the
[Checkpoint 4.2 roadmap](DEVELOPMENT_ROADMAP.md#checkpoint-42--nexus-visual-and-audiovisual-completion-planned).

### Approved 4.2G startup opening — 2026-10-24

**4.2H correction, complete and creator-approved (2026-10-25):** the
fresh-load behavior below records the original 4.2G implementation. The corrected
contract shows this same opening until the first explicit entry decision only.
Completion is stored separately from the global audio Boolean. Returning Visitors
proceed directly to the initialized chart with their saved audio preference and
no welcome playback. Escape completes silent entry. Header toggles do not change
completion; clearing completion restores the welcome. Exact legacy Boolean audio
choices migrate once, while malformed records never prove completion. Storage
failure preserves the current in-memory session. Startup errors retain Retry and
never show a false connection-established screen. The historical G record below
is retained; the H contract following it is current.

After validated Demo/content loading and actual chart construction succeed, a
native named/described opening dialog presents NEXUS's contained front-facing
portrait, MCR insignia, connection heading and welcome. The only introduction
source is `public/content/nexus/opening-data.json`; see the [exact approved script](DEVELOPMENT_ROADMAP.md#phase-42g--nexus-atlas-opening)
for future 4.2H voice production. Text is assigned safely; no world schema or
fallback dialogue changes. No welcome recording or audio playback is implemented.

Show once per successful fresh page load, including reload/Retry. Ordinary
navigation, year changes, Reset, Focus and same-document remount do not reopen it.
There is no remembered browser preference. Both `Enter with audio` and
`Enter silently` close immediately, recording only page-session `audio` or
`silent` intent. Escape also enters silently. The readable preview note states
that neither choice currently plays sound. Entry preserves the exact initialized
year, scope, camera, layers and selection without navigation or scene rebuild.

Initial focus moves to the welcome heading; native modal isolation keeps
background controls inert. Tab reaches both visibly focused entry buttons;
Enter/Space and touch activate them. Entry returns focus to the real map canvas.
Artwork is decorative, contained and hidden on failure; text/actions remain
usable. The dialog is bounded and scrollable at small heights or enlarged text.
The optional 240ms ease-out opacity appearance never delays entry, is skipped
under reduced motion and canceled on a live preference change or disposal.
Startup/content failure leaves technical feedback/Retry without the opening.
Context loss hides it and focuses Retry; teardown closes it and removes owned
listeners/animation. Existing InfoCard Escape and archival navigation remain intact.

### Approved 4.2H voice and first-entry persistence — 2026-10-25

The original opening title, subtitle, message, artwork and 240ms appearance are
unchanged. First entry is pending until `Enter with audio`, `Enter silently` or
Escape completes a decision. Audio entry persists ON/completion, dismisses
immediately and requests the approved entry acknowledgment synchronously from
the gesture. Silent/Escape entry persists OFF/completion without media allocation.
Returning Visitors bypass the opening only after successful startup, restore the
header preference, focus the actual map and never play acknowledgment audio.
Neither path changes the initialized chart, history, camera, selection or layers.
The current explanatory note is "Audio-enabled entry activates NEXUS speech. You
can change this setting in the header."

One native `Audio: On`/`Audio: Off` header button exposes `aria-pressed`, keyboard
and touch activation, a stable width and at least 44px height. It persists audio
independently from completion. OFF immediately stops speech; ON alone never
requests speech. An audio-enabled explicit navigation to a different scope that
resolves to `archival_fallback` requests the original fallback recording. Ordinary
renders, timeline refresh, panels, resize and same-scope actions do not replay it.
Archival text/actions remain usable if playback fails or is denied. Technical
failures never speak or become archival states.

The only storage is three namespaced localStorage values:

| Key | Accepted meaning |
| --- | --- |
| `velara-atlas:audio-enabled:v1` | Exact `true` restores ON; `false`/absent/invalid defaults OFF. |
| `velara-atlas:first-entry-completed:v1` | Only exact `true` proves completed entry. |
| `velara-atlas:first-entry-migration:v1` | One-time marker; exact legacy Boolean preferences migrate only when both entry keys are absent. |

The marker prevents cleared completion from being inferred again from saved
audio, and keeps a modern header-only choice from proving entry. Malformed entry
records do not establish completion. Access/write failure leaves current-session
choices functional; a fresh load may require entry again without persistence.
No cookies, account, world/camera state, playback progress or extra settings.

Only one lazy speech element is active. New speech replaces the previous one;
mute/navigation/year refresh/errors/context loss/pagehide/remount/disposal stop
it, clear its source and detach listeners. Stale promises/events cannot restart
or alter replacement speech. There is no automatic retry, loop, ordinary InfoCard
narration, SFX or new animation owner. Reduced motion retains the same entry and
audio choice semantics. At H closeout, I remained separately gated; its approved
extension follows. Final Checkpoint 4 acceptance and Cantum Stage 5 remain pending.
See [H verification limits](PERFORMANCE_AND_RELEASE_READINESS.md#checkpoint-42h-voice-and-first-entry-closeout--2026-10-25).

### Approved 4.2I audio presentation amendment — 2026-10-25

The creator authorized five interface effects plus one quiet archival-computer
loop, superseding only the original I no-ambience restriction. One generic click
follows eligible native button/summary activation. Successful changed record,
valid Focus, changed chart scope and committed changed year independently request
their dedicated clip. A button-driven action plays both foreground recordings
concurrently; neither substitutes for or intentionally delays the other. Existing
deferred pointer selection timing remains authoritative. Hover/focus, ordinary
filter typing, pan/pinch/orbit and internal rendering do not request foreground
effects. Continuous year updates remain unchanged; one history cue follows
release/commit, with held-key changes coalesced until release.

H's one master toggle and three storage keys remain. Silent entry is silent;
returning ON never autoplays. A permitted deliberate gesture starts ambience,
or it starts after natural audio-entry acknowledgment. It loops at the accepted
0.08 level, without chart/year restarts. Foreground levels are 0.35 (click) and
0.45 (action), speech 1.0. Speech suppresses both effect channels and temporarily
silences the same loop; restoration uses a bounded 180ms volume ramp. OFF pauses
all audio immediately; ON does not replay speech. Hidden documents pause the loop;
teardown releases it and stale callbacks cannot revive muted/disposed sound.
Failed media leaves all text/actions usable. No new visible controls, storage,
artwork, dialogue or timing changes. The creator personally approved the levels,
integrated balance, concurrency, loop and entry/mute behavior. I and the 4.2
audiovisual implementation and final Checkpoint 4 integrated creator acceptance are complete. See [PROJECT_STATUS](PROJECT_STATUS.md) for future gates. See [I verification and limits](PERFORMANCE_AND_RELEASE_READINESS.md#checkpoint-42i-interface-audio-and-ambience-closeout--2026-10-25).

## 12. Initial development fixtures and demo goals

The **only required initial content** is the noncanonical `public/datasets/demo` dataset, including:

- Two noncanonical Cantums, four released systems (`sys_0001`–`sys_0003` plus the Phase 3F `sys_0005` showcase), retaining independent charts, and one additional positioned archival-only system (`sys_0004`, known from 900 A.E., no Cantum assignment or detail JSON).
- Separate A/B **interstellar routes**: one exclusive Jump Gate pair and one exclusive Jump Hole pair; an additional dedicated A/C Jump Gate pair.
- Dedicated, exclusive local short-range pairs authored on eligible anchor objects, including transfer to a Jump Gate navigation boundary.
- Stars, rocky/gas/water/unknown planets, moons, a planetoid, an individual asteroid, stations and dated InfoCard changes. Phase 2 authors physical diameters with one omitted unknown; Phase 3 renders known sizes with distant proxies and Focus inspection. Central/offset/peripheral stars retain independent chart framing. See [Phase 2 data](archive/reports/CHECKPOINT_4_PHASE2_RESULTS.md) and [Phase 3 rendering](archive/reports/CHECKPOINT_4_PHASE3_RESULTS.md).

The live demo is author-editable; fixed regression snapshots preserve earlier acceptance scenarios under `tests/fixtures/v1_1/` and `v1_2/`. Its names, counts, positions and dates are **test data only**. **Do not promote them into official MCR canon.** Canonical systems/Cantums remain outside viewer prototyping.

Create additional **noncanonical fixture variants** as necessary to test an undeveloped system (`publicDetailPath: null`), unplaced coordinates, partial detail, a future discovery, and an intentional fetch/validation failure. Do not change real worldbuilding files just to demonstrate edge cases.

## 13. Acceptance criteria for the first viewer

The first Milestone 3 implementation is complete when all of the following can be demonstrated **without hardcoded lore-specific branches**:

1. Load the current noncanonical demo (four released charts plus one archival-only system) in top-down sector mode at 1200 A.E., with the entire square chart fitted and no initial InfoCard.
2. Positioned systems and independent selectable **Jump Gate and Jump Hole strokes** appear without conflating A/B transports or the additional A/C pairing.
3. Click a system for its historical InfoCard; double-click/Enter opens its system map; breadcrumbs and Return to Sector work.
4. A system map renders the correct CNU-positioned star, planets, moon, station, short-range gates, Jump Gate and Jump Hole from JSON.
5. Hover/focus a dedicated gate or route stroke to brighten only eligible links; leaving restores styling even while an object remains selected. Gate records identify the one lifetime partner and require explicit destination navigation.
6. Switching top-down ↔ perspective changes only the camera/rendering representation; positive/negative Y values become visibly distinct in 3D.
7. Vertical continuous History, typed year, exact recorded-year jumps and reset update names, existence, InfoCards, routes and map eligibility; the closed panel leaves the year visible. Rich event markers remain optional future work.
8. Open/close floating catalogue, controls, layers and History without moving/resizing the chart. Search/filter records, dismiss centered InfoCards with focus return, and retain camera state. Verify A–H/1–8, H8 cell width, minimum 2D zoom, bounds and Reset in narrow and desktop layouts.
9. Noncanonical fallback, partial-detail, unplaced-system and historically unknown records display the correct distinct states; actual load errors show retry feedback.
10. Cantum influence follows current-year `cantumHistory`, fixed ly radii and the approved opacity caps. Frozen fixtures retain A/B one-to-two contributors at 210/330 and a separate System C field; current authored data may change those fixture values. Pan/zoom never changes the field. All three zone geometries remain supported, with the demo nebula in System A, not Sector View.
11. Editing a **supported** object position, name record, or quantity in demo JSON and reloading changes the viewer without code edits.
12. The page runs as a static, read-only site under a GitHub Pages–style repository subpath; private files and editor code are **not included** in its release artifact.
13. Historical resolver, schema validation, route exclusivity, and essential navigation behaviors have automated regression tests; the existing v0.1 test behavior remains intact unless an explicitly approved migration changes it.

### Practical non-goals for the first viewer

- Canonical star-system placement or colonization data extraction from RTF.
- Production-quality NEXUS artwork, animation or voice avatar.
- Author-side visual drag-and-drop editing and file saving (**deferred optional milestone**); for now, edit JSON in VS Code, validate, and reload. Optional local-only coordinate-debug overlay is allowed.
- Simulated orbital mechanics, pathfinding, ship travel simulation, or real-time celestial motion. Physical-diameter rendering is implemented by Checkpoint 4.1 Phase 3; artistic refinement remains deferred.
- Exact/legal political boundary inference, manual polygon authoring, or full volumetric political borders. **Generated decorative Cantum influence regions are in scope** and must not be misrepresented as exact sovereign borders.

## 14. Implemented compatibility and remaining follow-ups

Current status is based on the merged schema, implementation and tests:

| Responsibility | Purpose | Current status |
|---|---|---|
| Zones: ellipsoid, box, polygon volume | Environmental maps | Implemented since v1.1; retained in v1.2 |
| Separate validated `presentation.json` | Cantum colors, ly radii, thresholds and opacity | Implemented; renderer obeys caps and uses world-space caching |
| `knownByAE` | Conservative knowledge with unknown exact discovery | Implemented since v1.1; not an exact event date |
| Dated InfoCards and modern route/object resolution | Historical viewer records | Implemented by `src/core/history.mjs`, independently of legacy v0.1 |
| Object declarations, dedicated gate pairs and generated graph | v1.2 navigation authoring | Implemented offline; build uses read-only freshness |
| Nullable icons and optional visual variants | Data-driven appearance | Starter registry/proxies and procedural materials implemented in Checkpoint 4.1 Phase 3; final artistic refinement deferred |
| Optional celestial `physicalDiameterKm` | Authored physical diameter, 1 CNU = 10,000 km | Phase 3 physical models, SVG proxies, apparent minima and bounded inspection; no inference for omitted sizes |
| Continuous year and exact recorded-year jumps | Historical navigation | Implemented; richer public event registry/markers remain deferred |
| Canonical v0.1 data migration | Real public lore | Separate creator approval and ID crosswalk required |

**Versioning requirement:** Breaking stored-shape changes require coordinated schema version, tests, records, validation and `docs/DATA_MODEL.md` updates after approval. The approved optional `physicalDiameterKm` extension preserves existing v1.2 records and the current version; it requires no migration. Current layout constraints require no schema or historical-data changes.

## 15. Handoff constraints for Codex

Before changes, inspect the current workspace, tests, schemas and documentation. Preserve accepted implementation and report discrepancies. Follow the authorized checkpoint in [the roadmap](DEVELOPMENT_ROADMAP.md); this behavior contract is not blanket authorization to implement future assets, a local editor, canonical migration or deployment. Run meaningful regression/browser checks and report limits without claiming untested features.

**Stop at authorized scope and ask before breaking the approved JSON contract or rewriting canonical records.**

---

**Approval lineage:** Milestone 3 approved real XYZ navigation, soft Cantum influence, hybrid representation, zones, continuous history, search and archival fallback. Schema v1.2 superseded local-gate branching. Checkpoint 3.6 explicitly superseded permanent side columns/bottom timeline and selection-driven route highlighting. This document owns behavior; schemas and `DATA_MODEL.md` own stored structure, and [verification reports](archive/reports/REPOSITORY_AUDIT_3_6.md) record what has actually been tested.

## Completed Phase 4 module compatibility

The implementation separates session state, catalogue, historical InfoCard
model/view, timeline, camera, picking, layers and projected labels. This changes
ownership, not the appearance or behavior specified above. Existing IDs, aria
attributes, selection/hover semantics, camera methods and read-only boundaries
remain the contract. [Architecture ownership](ARCHITECTURE.md#phase-4-viewer-module-ownership)
describes configuration and cleanup. Architecture Phase 4 is complete and
creator-approved, preserving the same ordinary Demo experience; that refactor
added no Demo records or visual redesign. Phases 5 and 6 are also complete and
creator-approved. Development provides separate named local previews. The current
Architecture Optimization Roadmap is complete; subsequent development, deployment,
Canon migration and Atlas Creator require separate authorization.

The active Demo uses the current v1.3 contract in [DATA_MODEL](DATA_MODEL.md).
[Performance and local release readiness](PERFORMANCE_AND_RELEASE_READINESS.md)
records the measured workloads, browser/accessibility probes and known sampling,
device and browser limitations. Local Chromium checks do not certify all browsers,
physical devices or assistive technologies, and a static preview is not deployment.
