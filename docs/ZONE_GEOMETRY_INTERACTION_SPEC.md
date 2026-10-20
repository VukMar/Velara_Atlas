# Velara Atlas — Checkpoint 3.8: Spatial Zone Geometry & Interaction

**Status:** Implemented Checkpoint 3.8 behavior contract. See
[historical verification](ZONE_GEOMETRY_INTERACTION_RESULTS.md); future changes
require a separate scoped authorization.
**Date:** 2026-10-17  
**Repository baseline audited:** `VukMar/Velara_Atlas`, `main` commit `77906c5e6449` (2026-10-17); Codex must inspect its actual local checkout and preserve newer or uncommitted work.  
**Scope:** Allow v1.2 **system** zones to extend beyond system chart boundaries; clip what is rendered and hit-testable; make visible zone area hoverable/selectable in 2D and 3D with object-first priorities. Protect accepted cartographic typography, touch controls, H8 arrow, history, navigation and canon.  
**Authority:** `AGENTS.md`, `docs/DATA_MODEL.md`, `docs/VIEWER_SPECIFICATION.md`, `docs/CARTOGRAPHIC_LABELING.md`, `docs/CANTUM_TERRITORY_RENDERING.md` and Schema v1.2. This document supersedes only the older *full containment requirement for v1.2 system spatial zones*. Frozen v1.1 and sector-zone rules are not silently migrated.

## 1. Core semantics

A `zon_XXXX` describes an authored **world-space 3D volume**, not a point marker. Its `position` is the geometry's reference origin and **may be outside** the system chart. Its shape may be larger than the chart in X, Y, and/or Z. Preserve the existing `geometry.kind` shapes (ellipsoid, axis-aligned box, polygon_volume), current local-coordinate semantics, historical records, category, permanent ID and InfoCard.

The system chart is the finite 3D axis-aligned box defined by `map.origin` and `map.size`. A zone assigned to the system must overlap that box with **positive volume**, even if its center and most of its shape lie outside. Merely touching a chart face, line or corner is not sufficient. A zone with no 3D intersection fails validation; do not silently move, rescale, cut or delete authored source geometry. `sector.zones` retain existing behavior until separately approved; frozen v1.1 validation must continue to enforce its earlier all-inside contract. Nothing relaxes bounds of stars, planets, stations, gates, short-range derived gate positions, map extents or Cantum territory.

The **visible zone** is the intersection of the authored zone volume with the 3D chart box. The viewer displays and interacts only with that visible intersection. Map grid remains the fixed 8×8 chart. The JSON remains the single source of actual zone shape; clipping never rewrites records.

## 2. Validation and intersection helpers

Prefer an independent pure, testable module for zone geometry (`src/core/zone-geometry.mjs` or similar), shared by validator and viewer without DOM/Three.js imports. Keep the older `zoneContains(zone, localPoint)` behavior intact for existing consumers, or introduce explicitly named world-coordinate helpers. Never mix local and world coordinates silently.

* **Ellipsoid:** Transform the chart AABB into ellipsoid-local coordinates. Test true ellipsoid–AABB intersection using the squared normalized distance from the center to the nearest point of the chart box, not merely overlap of axis-aligned bounding boxes. Require positive-volume overlap and finite positive radii.
* **Box:** Intersect each of the zone's world-space XYZ axis intervals with the map's intervals; require strictly positive intersection widths.
* **Polygon volume:** Translate local footprint vertices by `zone.position.x/z`, and vertical interval by `zone.position.y`. Require positive overlap of Y intervals and **positive area** overlap between polygon footprint and chart's X/Z rectangle (including edge crossing where neither shape contains a vertex). Preserve existing polygon degeneracy checks; reject invalid/nonfinite geometry. Do not assume all footprint polygons are convex.
* Handle large numbers and off-map origins without precision loss, hangs or massive allocations. Provide clear validation errors naming the zone ID and reason (`non-intersecting zone`, `invalid geometry`, etc.).
* For v1.2 **system details**, replace `bounds(z.position)` and “entire geometry inside map” requirements with correct positive intersection checks. Keep schema shape and chronology unchanged, and keep frozen v1.1 **and sector zone** compatibility intentionally version-scoped.
* Do not alter `scripts/connections.mjs` outputs or repurpose navigation boundary spheres as zones.

## 3. Visual representation and clipping

**2D orthographic System View:** Show a restrained translucent **X/Z projection of the portion of the 3D zone overlapping the map's Y extent**, clipped to the 8×8 square chart. The footprint must be accurate to the intersected volume: for an ellipsoid whose center Y lies outside the chart, its visible projected radius can be smaller than the full ellipsoid radius. For boxes use rectangular footprint; for polygon volumes use the true polygon intersection. Do not paint areas that do not belong to the visible volume. Keep the grid, objects, routes, labels and selection feedback legible. Do not fake nebula origins or rely on the location of the zone label to visualize the zone.

**3D perspective System View:** Restrict rendered zone volume/effects to the chart's true XYZ limits, including camera orbit and camera-inside-zone situations. A suitable implementation might use GPU clipping planes for meshes plus a bounded/intersection-aware volume treatment; choose the smallest robust method. Rendering only the outer shell of an enormous nebula is insufficient when the entire mapped chart is inside that nebula: it must still have a subtle visible environmental representation. No out-of-chart particles or zone surface should render. Do not permit materials' `depthTest: false` or `renderOrder` to obscure/select over objects; preserve existing legibility. Geometric/visual approximation is acceptable for clouds but the membership boundary and picking must be derived from the authored volume.

**Particles:** Deterministically sample **within the clipped visible intersection**, not the entire huge source volume. Avoid rejection loops whose work scales with the unbounded zone size; bound memory, iterations and point count by viewport/chart and presentation limits. Honor all historical and layer visibility conditions. Preserve existing deterministic seeds/expectations where possible; update current-version tests carefully and retain frozen regression behavior.

Overlapping zone fills must remain subdued and should not become a bright solid mass. Scene cleanup must dispose geometries, textures and materials across timeline/system changes.

## 4. Selection and hover — explicit priority

Use one unified pointer hit-resolution path, independent of whether a zone origin is onscreen:

1. **Visible object/marker** (including existing accessible projected DOM hit controls).
2. **Visible navigational connection** (current route picking, respect route visibility and historical eligibility).
3. **Visible spatial zone intersection**, as the background fallback.
4. **Empty chart**.

This priority governs hover, click/tap and focus behavior. Objects in a nebula are never made harder to pick by the nebula. Invisible/expired/layer-disabled zones are excluded. A dense overlapping set of zones uses deterministic topmost selection: favor the smallest **visible clipped volume** (or projected footprint in 2D), with permanent ID tie-break; make other zones accessible in the Catalogue. Avoid adding a large chooser UI in this task.

**2D hit testing:** From the viewport pointer ray, determine chart X/Z position and test against the **projected visible zone footprint**, not a single arbitrary chart-floor Y slice. Reject positions outside the chart. Make the result consistent across zoom, pan and map origin offsets.

**3D hit testing:** Cast camera ray against the **zone volume clipped to the chart AABB**, using true volume intersection, not only triangle intersections with an un-clipped outer mesh. Include the camera-inside-zone and camera-inside-chart cases; use finite ray intervals and reject intersections visible only outside map bounds. First run ordinary object/route selection priority to preserve current behavior. Do not force a zone mesh to intercept all pointer events.

**Hover:** On entering only a visible zone region, slightly brighten its visible shape and show a small NEXUS-style **zone-name tooltip near the pointer**, clamped to the square viewport. Use the historical resolved name, category when helpful, plain text (never injected HTML), no permanent origin-anchored zone caption. Tooltip follows cursor, hides on exit, moves out of the way of object interaction, never intercepts events (`pointer-events:none`). Do not have this passive tooltip participate in object-caption collision/priority logic. `Object Names` off must not suppress essential hover feedback.

**Select:** Clicking/tapping empty area inside a zone opens the existing centered InfoCard with same record ID, category/history, recorded dimensions and description. Do not introduce separate zone InfoCard rendering. Selecting via Catalogue or keyboard must remain available. Do not open info on drag/pinch/orbit; preserve pointer/touch gesture guardrails.

**Focus selection:** If a zone origin is outside the chart, focus a deterministic **visible internal point** (e.g., center/centroid of the clipped footprint or first valid interior point), and clamp camera to map limits. Never send camera toward the off-map authored origin. The InfoCard may continue displaying the true authored origin; make clear that it is the geometric reference and not necessarily visible.

**3D label behavior:** Tooltip should remain near pointer and readable in CSS pixels, not a billboard at a distant zone origin. No arbitrary generated zone marker at `(0,0,0)`.

## 5. Layer, history, labels and scope protection

Preserve the completed `Cantum Names` world-space lettering and `Object Names` adaptive caption behavior. Zone tooltip is a **separate interaction-only overlay**; it must not add an always-on zone label. `Spatial zones` toggle controls both visible geometry and zone hit testing. Existing 2D/3D camera gestures, map fit/clamp, H8 width arrow, record modal, route-hover highlighting, NEXUS palette, system navigation and year scrubbing must continue to work.

Only historically eligible zones appear and respond at the selected A.E. year; unknown discovery dates remain unknown, never year zero. Respect read-only and noncanonical boundaries. Current scope is noncanonical v1.2 **system** zones; no canonical data migration, local editor, schema-wide redesign, Cantum-region geometry changes or release/asset artwork.

## 6. Original implementation phases (completed)

The following delivery sequence is retained as design provenance, not a pending
assignment. The current implementation and original evidence are linked above.

**Phase A: Pure geometry and validation.** Add robust intersection and point/ray/footprint helpers; update v1.2 system-zone validation only; test all three kinds, off-map origin, giant containing zone, tiny sliver, edge-only contact, disjoint Z/Y volume, translated polygon and polygon edge crossing; preserve v1.1/sector behavior and all other object bounds.

**Phase B: Rendering.** Implement clipped 2D footprints, constrained 3D visualization/particles and bounded deterministic sampling, including when the zone surrounds the whole chart. Keep visible interfaces and labeled objects intact. Verify historical and layers toggles.

**Phase C: Interaction.** Integrate object/route-first picking, 2D footprint hit tests, 3D ray/volume hits, zone hover highlight and cursor tooltip, InfoCard and visible-region Focus; preserve mobile controls and caption priorities.

**Phase D: Documentation and QA.** Update `docs/VIEWER_SPECIFICATION.md`, `docs/DATA_MODEL.md`, zone-related renderer/authoring notes, and `AGENTS.md` only if needed. Describe that zone coordinates may be outside map and only the intersection is displayed. Note version-scoped compatibility. Add focused tests/browser regression evidence in a brief result report.

## 7. Verification / acceptance

* Run `npm test`, `npm run validate`, `npm run connections:check`, `npm run demo`, `npm run build`, and applicable browser suites (dev plus preview where scripts support preview).
* Assert no changes to `public/data/`, frozen `schemas/atlas-v1_1.schema.json`, frozen v1.1 fixtures, core historical meaning, object coordinates, navigation generator, existing connection IDs, completed labeling and H8 arrow.
* Full-map 2D: a giant nebula whose center is offscreen, but whose volume covers a chart corner, renders only the intersecting area, highlights on hover, displays the correct name, opens InfoCard, and Focus stays inside the chart.
* A planet/station/gate or route inside the nebula wins hover/click; the nebula tooltip must not block it. Leaving both clears highlighting.
* A zone fully covering the chart can be hovered/clicked anywhere that is not an object/route, including when camera is inside it in 3D. 3D orbit never leaks zone mesh/particles outside true XYZ chart box.
* Test ellipsoid, box and polygon volume; overlap priority, layer hiding, discovery/known-by filtering (no zone-expiry field), focus and keyboard catalogue access, tap versus pinch/drag, changes from 2D to 3D, narrow layouts, Y offsets, nonzero map origins and geometry touching only a boundary.
* Validate that the new logic performs bounded work for a source volume orders of magnitude larger than the chart; include a small stress test.
* Keep the build's protected-data exclusion and static-read-only constraints intact; no external dependencies unless requested.
* Explicitly document whether 3D behavior is full geometric accuracy or restrained approximate rendering. Do not claim physical-device testing from browser emulation alone.

## 8. Maintenance authority

This zone behavior is implemented. The original implementation authorization is
completed; this document confers no new task. Follow the current creator request
and [AGENTS](../AGENTS.md) before future changes. Preserve the version-scoped
contracts above and use the historical report for its actual verification limits.
No final art, portrait, deployment, orbital mechanics, general editor, commit or
push is authorized by reading this specification.
