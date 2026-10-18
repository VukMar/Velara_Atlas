# Checkpoint 3.8 — Zone geometry and interaction results

Implemented for creator review on 2026-10-18. The actual approved specification
is [ZONE_GEOMETRY_INTERACTION_SPEC.md](ZONE_GEOMETRY_INTERACTION_SPEC.md);
the requested `ZONE_GEOMETRY_INTERACTION.md` filename was absent. The existing
specification was preserved without renaming or editing it. The inspected baseline
was `77906c5`; only that specification was untracked before work began.

## Implementation phases

**A — Geometry/validation.** `src/core/zone-geometry.mjs` is shared by validator
and viewer, with no DOM/Three.js dependency. It provides true ellipsoid/AABB
intersection, interval intersection for boxes, simple concave polygon triangulation
and piecewise rectangle clipping, projected footprint tests, finite ray-volume
intervals, valid visible witnesses and bounded seeded particles. Positive XYZ
volume is required; touching alone fails. Existing polygon degeneracy checks are
retained; invalid/self-intersecting footprints fail with named errors. Conventional
repeated closing vertices are accepted. Only v1.2 system-zone containment is
relaxed in `scripts/check-relations.mjs`. v1.1/sector containment and ordinary
object/gate bounds remain strict. No schema fields/version changed.

**B — Rendering.** `src/viewer/zone-layers.mjs` renders clipped system footprints
and twelve bounded horizontal cloud slices in perspective, plus up to 96
deterministic particles by default. Ellipsoid fragment masks use authored
membership; top-down projection accounts for map Y clipping. Boxes/polygons use
clipped pieces. Giant volumes covering the chart remain visible through interior
slices/particles. Source size does not increase tessellation or sampling attempts.
Overlap alpha is attenuated by visible zone count. Old `createZone(zone)` and
local `zoneContains`/`zoneParticles` behavior remains available for legacy/sector
consumers. GPU geometries/materials are disposed on map/year changes.

**C — Interaction.** `AtlasMap` resolves markers first, routes second, then
visible system-zone intersections. Concave footprint gaps and XYZ clipping apply
to picking; camera-inside rays are supported. Smaller clipped areas/volumes win
zone overlaps, then stable IDs. Zone hover brightens the region and displays a
plain-text, pointer-transparent, viewport-clamped tooltip. It is separate from
object captions and works with Object Names off. Origin-anchored system-zone
buttons/captions are removed. Catalogue/Selection and the existing InfoCard expose
all eligible records, true reference origins, categories and recorded dimensions.
Focus targets a deterministic visible witness using clipped extent and existing
camera limits. The Spatial zones layer controls both rendering and picking.

**D — Documentation/QA.** Data model, viewer specification/prototype, architecture,
repository structure and README describe the implemented scoped rules. The build
allowlist adds only the exact new pure geometry module. No dependency was added.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | Passed: 135 tests, legacy chronology and strict demo validation; seven new geometry/rendering test groups |
| `npm run validate` | Passed: schema and cross-file checks |
| `npm run connections:check` | Passed, read-only; generated outputs remain current |
| `npm run demo` | Passed: legacy console chronology |
| `npm run build` | Passed: protected input/output audits and repository base path |
| `tests/browser-zones3_8.mjs` | Passed on dev: four memory-only giant/partial ellipsoid, box and polygon cases; overlap/object/route priority, historical names, layers, InfoCard/Focus, disposal, inside-camera picking, mobile tooltips and touch tap/drag/pinch/orbit |
| `tests/browser-labeling.mjs` | Passed on dev: accepted lettering/caption behavior and layer preferences |
| `tests/browser-layout3_6.mjs` | Passed on dev and production preview: square grid, H8 double arrow, bounded camera, InfoCard, route hover/focus and narrow layouts |
| `tests/browser-navigation-v1_2.mjs` | Passed on dev: 33 object targets, 14 local endpoints, three interstellar routes, history/destinations and perspective |
| `tests/browser-checkpoint3.mjs` | Passed on dev: chronology, fallback/partial/unplaced data and load-error recovery |
| `tests/browser-touch-camera.mjs` | Passed on dev: native 2D/3D pan, pinch/orbit, finger transitions and post-gesture actions |
| `tests/browser-documentation3_6.mjs` | Passed on production preview: documented workflow, GET-only observed requests, no external/canonical requests |
| `tests/browser-touch3_6.mjs` | Passed on production preview: selection/close/history/navigation, pinch/pan and post-gesture tap |

Pure tests include nonzero map origins, true ellipsoid rejection beyond AABB
overlap, Y-offset projection, tiny slivers, face/corner contact, concave/disconnected
polygon pieces, vertex-free edge crossings, rays from inside/outside, deterministic
overlap ties, bounded particles, nonmutation and full GPU disposal. A small stress
case checks three source volumes of order 10^12 against a 20-unit chart under a
two-second ceiling; source volume does not scale allocation or attempt count.
Browser synthetic records are intercepted in memory, never written to demo JSON.

## Limitations and review notes

- 3D clouds are approximate visual slices/particles, not closed surface meshes or
  physically integrated volumetric fog. CPU footprint/ray membership comes from
  authored geometry, independent of visual tessellation. Ellipsoid shader edges
  are subject to GPU float precision.
- Ellipsoid overlap area/volume uses bounded deterministic quadrature; close-size
  overlaps can be ordered differently from an exact analytic volume comparison.
  Box/polygon prism measures are exact to ordinary floating-point precision.
- Particle rejection is capped at 40 attempts per requested point, with a hard
  maximum of 256 requested points. Very thin intersections may return fewer;
  a valid witness supplies one point if no random candidate is accepted. Sampling
  is decorative, not a physical density model.
- Simple concave polygons are supported; holes and self-intersecting polygons are
  not. Calculations use JavaScript doubles; sub-representable slivers and extreme
  coordinate dynamic ranges cannot have arbitrary mathematical precision.
- Focus preserves the existing zoom maximum and map clamp. Extremely thin edge
  slivers may not center exactly at the witness once those limits apply.
- v1.2 has no zone-expiry field. No expiry was invented or resolver changed;
  discovery/known-by eligibility and resolved name boundaries are tested.
- Desktop, portrait and landscape layouts and Chromium CDP touch were tested.
  Physical Android/iOS hardware and other browsers were not tested.
- Vite retains the main-chunk warning above 500 kB (approximately 654 kB,
  171 kB gzip). No bundling-policy or framework change was made.

No canonical data, demo JSON, frozen fixtures/schema, permanent IDs, history
resolver, generator, connection outputs, Cantum field/caption helpers or H8 arrow
implementation was changed. Existing labeling behavior passed regression checks.
No artwork, editor, deployment, commit or push is included. Ready for creator
review.
