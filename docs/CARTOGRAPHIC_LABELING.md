# Velara Atlas — Cartographic Typography and Adaptive Labels

**Status:** Implemented labeling contract with later Cantum Stage 1-4 amendments.
See [original evidence](archive/reports/CARTOGRAPHIC_LABELING_RESULTS.md); this specification
does not authorize further visual changes.
**Original target:** post-Checkpoint-3.6 labeling. Starter icons/physical models and
Cantum Stages 1-4 are now implemented; final artistic refinement remains deferred.
**Scope:** World-space Cantum region lettering in Sector View; adaptive screen-space navigational captions in both map levels; independent layer controls.  
**Baseline:** Existing square chart and 8×8 system grid, floating panels, camera modes/gesture controls, Schema v1.2 navigation, historical resolver, and Cantum influence visualization.  
**Design authorities:** `docs/VIEWER_SPECIFICATION.md`, `docs/NEXUS_VISUAL_IDENTITY.md`, `docs/CANTUM_TERRITORY_RENDERING.md`, `docs/DATA_MODEL.md`, and `AGENTS.md`. This specification adds only the labeling behavior approved in the conversation; it does not supersede unrelated requirements.

## World-space typography and coordinated visibility - 2026-11-20

The subsequent creator request revises draft PR #5 from starting SHA
`bd8d2dafab722b0a98b2beb9c1f6c39589e27717`. This is the current presentation
contract; it supersedes the earlier 14-24 CSS-pixel clamp, camera-facing DOM
plates, screen-space edge containment and 1x-5x zoom-only fade. Historical
Stage 1-4 and initial PR #5 reports retain their original evidence.

Visible names use locally generated CanvasTextures on fixed Three.js X/Z planes.
Their normal is +Y; texture top points toward -Z, so the standard top and
perspective cameras read unmirrored text. They never billboard, bend, wrap,
abbreviate or stretch glyphs. Camera movement and viewport resizing change only
projection and opacity, never the saved anchor, aspect ratio or world dimensions.
Perspective naturally foreshortens the lettering; there is no tilt compensation.
Decorative meshes have no entity identity or raycast target. Ordinary depth
testing remains enabled, depth writing is disabled, and existing marker/route/
reticle priorities and accessible Catalogue/Selection alternatives remain.

Actual browser shaping measures complete resolved names, available system-font
fallbacks, weight 600, .06em tracking, .08em padding, and an optional registered
1em sigil with .35em gap at a 64px **source** font. These source pixels define
texture proportions, not displayed size. The unchanged 128x128 Gaussian mask,
four-neighbor components, inner threshold and 24-cell eligibility minimum feed a
12-iteration monotonic maximum-rectangle search at every eligible cell. Row-run
intersection tests the entire padded rectangle within the same component, never
bridging holes or disconnected islands. One sampled cell protects each edge;
a further 90% proportional safety scale keeps lettering away from the contour.

Presentation-only upper bounds are 60% of the chart span in width and 12% in
height before the safety scale. Candidates within 85% of the largest safe height
compete on the existing 15px reference marker budget, then the 4px visible-symbol
budget, usable size, interior depth, clearance and field-weighted balance, with
stable cell-index ties. This prevents marker avoidance from shrinking broad
regions back into small annotations. The minimum practical source-font equivalent
is 14px on a 768px reference chart, an eligibility floor rather than a display
clamp. Where a full name cannot fit, the registered 24/768-span sigil-only rule
remains; otherwise omit it. Multiple qualifying components still receive separate
identities. Overlapping Cantums are neither partitioned nor politically redefined.

Every variant stores its component's contributing system IDs. Top mode uses the
highest historically eligible local contributor Y plus the existing modest
chart-relative clearance. Perspective additionally clears the envelope half-height
and actual envelope extrema beneath the whole fitted rectangle, including edge
samples. These elevations are computed during map replacement, not camera frames;
a remote same-Cantum island does not supply the local star maximum.

One smoothstep coordinates the hierarchy: at 1.00x and through 1.15x, Cantum
opacity is .46 and passive sector system-caption opacity is zero. Between 1.15x
and 1.50x, let `t = smoothstep((zoom - 1.15) / .35)`; Cantum opacity is
`.46 * (1 - t)` and passive system opacity is `t`. At 1.325x they are .23/.50;
at and above 1.50x they are 0/1. Hover, keyboard focus and selection retain
full-strength captions, including with Object Names off. Object Names off hides
all passive captions. Cantum Names off, or no eligible full-name resources,
bypasses passive suppression. System View captions are unaffected. Collision,
layer and historical filtering remain authoritative; markers never crossfade.
Influence fill remains independently controlled.

Topology/fit retains the bounded eight-input cache and is independent of camera
and viewport. Each resolved map owns one shared unit-plane geometry and at most
one texture/material per Cantum/variant, reused by its components. Each raster is
bounded to 2048x512, generated at up to 3x source resolution with filtered mipmaps.
Textures, materials, geometry and guarded detached image handlers are released on
history replacement, map navigation and teardown before generic scene disposal.
There are no font downloads, dependencies, public data/schema changes or new
runtime assets. Platform font metrics can vary; very long names may be omitted,
and low-angle/mobile text can naturally become small or foreshortened. Review
screenshots and limits are in [the PR #5 record](CANTUM_NAMEPLATE_REFINEMENT.md).

## 1. Why two different label systems

**Current amendment:** the world-space contract above supersedes Stage 1's
camera-facing renderer. Field/component and object-caption rules remain in force.

The Sector View should convey political/geographic identity at wide zoom without turning into a crowded set of interface overlays. The System View should make the names of stars, planets, moons, stations, short-range gates, Jump Gates and Jump Holes easier to associate with their markers. The implementation has two coordinated, technically independent layers:

- **Cantum names** use stable geographic X/Z anchors in Sector View, rendered as fixed upward-facing X/Z texture planes sized to each component. They have no hit targets or new selection identities.
- **Object captions** are projected **screen-space typography** beneath each object's visible marker/sprite; font sizes remain approximately constant in CSS pixels while the caption follows the object's actual XYZ position. Use in Sector and System views with adaptive decluttering.

Both layers use names resolved for the current A.E. year. Do not modify underlying data, invent names/dates, change system coordinates, or expose unreleased objects. Support UTF-8 text and the browser's available fonts.

## 2. Cantum name placement — approved Option B

**One name per sufficiently large connected geographic region**, rather than one long name spanning all the holdings of a Cantum.

- Derive eligible contributors from existing `territoryGroups(view, sector, presentation)` and Cantum display names from **currently resolved** `view.cantums` (not ID, prefix, `letter`, private data, or a hard-coded string).
- Derive connectivity from **that Cantum's own influence field**, using the **same bubble/radius/falloff and field-threshold semantics** as the existing territory overlay. This is *not* gate-route connectivity, graph connectedness, or an assertion of an exact legal border.
- Sample a bounded, deterministic per-Cantum visibility/field mask in X/Z (e.g., 128×128 or equivalent). Find connected components conservatively (four-neighbor flood fill, or geometry with equivalent conservative connectivity). Reject subthreshold noise and too-small components. Do not merge regions solely because cells touch diagonally.
- Do **not** derive component connectivity from the final blended RGBA influence texture, since it combines different Cantums and loses territorial identity. Reuse/extract a pure per-Cantum field calculation where practical, without changing the existing opacity/color/merging algorithm or its protected caps.
- For each surviving component, find an interior label anchor where the field is high enough, reasonably far from the contour and with room for the *entire* current name. Prefer positions away from dense system markers/route junctions. Use deterministic tie-breaks and avoid jumps/flicker from minor camera changes.
- Keep every complete name straight and horizontal in X/Z, facing +Y; no curved baseline or camera-facing rotation.
- Use spaced, restrained typography and subtle Cantum-linked color. Names should be perceptible but visually subordinate to individual system markers, route strokes and hover targeting. Avoid bright glow, text boxes, thick outlines and unsupported font downloads.
- Derive text width and world-space height from region geometry (not arbitrary fixed CSS positioning). Fit the complete name inside the component with padding and a minimum practical legibility threshold. Reduce size or **omit the region label** when it cannot fit. Never truncate, abbreviate, invent a nickname or wrap the name across multiple lines to force it to fit.
- One Cantum may produce multiple separate labels if its component(s) qualify; tiny holdings may produce none. At the early historical years, if the Cantum is not eligible, has no resolved name, or has no contributing positioned systems, show no territorial text. Do not suggest that historic administrative Cantums were sovereign states.
- Recompute when historical year changes alter effective names, Cantum membership, visibility, status or system placements. Cache the component results against the relevant resolved inputs; do not recompute field connectivity on every pan/zoom frame.

### Zoom and viewpoint

Use the current world-space elevation, projection and 1.15x-1.50x coordinated
crossfade contract above. No Cantum identities appear in System View. World
lettering remains fixed to its component; screen edges never relocate it.

## 3. Adaptive object labels

Reuse and improve the existing HTML projected marker-label architecture in `src/viewer/map-scene.mjs` and `src/viewer/style.css` unless measurements demonstrate it is inadequate. Keep the **actual marker click target** distinct from its visible caption; captions must not obstruct map gestures.

- Put names **centered directly below** the corresponding marker/sprite, with a small pixel gap accounting for the visible marker radius. Use consistent text styling, subtle contrast or shadow rather than opaque pills and large backgrounds.
- The caption follows the marker's true XYZ projection in both orthographic 2D and optional 3D; text stays at a controlled, readable CSS-pixel size across zoom levels. Hide it if the corresponding object is offscreen, filtered, historically ineligible, visually occluded when detectable, or its marker layer is disabled.
- Apply **adaptive density** based on map level, object type, camera zoom, projected object spacing, viewport size and competing labels. Establish deterministic priority and basic screen-space rectangle collision suppression; account for marker footprints, other captions, chart annotations such as the H8 sector-width display, and floating panel coverage where feasible.
- Prioritize: focused/hovered/selected objects first; Sector View star systems next; System View star and major planets next; Jump Gates/Jump Holes and key stations next; moons, smaller stations and short-range gates at progressively closer zoom. Routes and spatial zones normally keep their present hover/focus names rather than crowding the chart with permanently shown captions.
- At full system fit, show star/planet captions where they fit but do not promise all of them in a crowded system. Reveal additional moons/stations/gates as zoom and separation allow. Never permanently hide an object merely because its name was decluttered: marker and keyboard/catalogue access remain.
- Resolve label collision ties predictably by historical/semantic priority, then stable ID ordering. Avoid oscillation between labels near a zoom threshold (hysteresis or stable cached choices). Use a bounded, efficient algorithm suitable for expansion beyond the three-system demo.
- A hovered, keyboard-focused or selected object must be identifiable even if it would normally fail adaptive decluttering. If multiple equally prioritized objects overlap, show the active one and suppress lower-priority labels; never mutate coordinates to separate them.
- Selecting a marker still opens the existing centered NEXUS InfoCard; captions do **not** open a second info popup. Retain existing hover-route highlighting, object picking, navigation, touch gestures and focus behavior.
- An Object Names toggle hides passive captions but should still permit temporary hover/focus/selected identification for accessibility and interaction. The persistent catalogue/Selection control continues to expose all eligible names.

### Label controls

Implemented independent Map Layers toggles (default on):

- **Cantum Names** — offered on Sector View only; independent from Cantum influence fill visibility. Turning off the colored influence overlay does not automatically suppress regional names.
- **Object Names** — offered for Sector and System View; governs adaptive passive captions without concealing markers or essential interactive identification.

Preserve per-map-view toggle preferences through year changes, map navigation and 2D/3D switching consistent with the existing layer-preference behavior. No new public JSON field or schema version is needed; these are presentation defaults unless a separately approved future migration is warranted.

## 4. Rendering and performance strategy

Prefer a pure testable geometry/declutter calculation plus thin renderer integration:

1. `src/core/...` or small `src/viewer/...` pure helpers to derive per-Cantum connected components, candidate anchors, orientation and fit; a separate helper for caption priority/layout. Names and positions must be treated as input values, not authored new atlas entities.
2. Use existing Three.js; world-space Cantum text may use generated CanvasTexture or another **original, locally rendered** technique. Ensure correct disposal of geometries, materials and textures when years/maps change; do not leak GPU memory during timeline scrubbing.
3. Reuse HTML marker button/label projection and CSS in the existing map scene; keep semantic text and touch-target accessibility. Decorative territorial labels should be `aria-hidden` because accessible Cantum names remain in the catalogue and InfoCards.
4. Cache region topology by effective year/data, not by camera position. Project screen-space caption anchors as needed on camera changes. Avoid per-frame full DOM regeneration and repeated expensive text-measurement work.
5. Preserve the strict public-safe demo asset/data allowlist, GitHub Pages `/Velara_Atlas/` base, no backend, no external paid assets, and no extra dependency without explicit justification.
6. Avoid modifying existing Cantum territory alpha caps (per-Cantum 0.16 / total 0.22), the color field shape or generated interstellar/local connections.

## 5. Acceptance tests and concrete cases

Add pure Node tests and browser tests in the existing suites as appropriate; preserve all existing assertions.

**Region/chronology:** Two systems in the same continuous influence component produce one regional name; multiple disconnected sufficiently large components produce one each; a tiny disconnected island produces none. Distinct Cantums never merge region names because their fills overlap. A missing/unknown Cantum name or a noneligible historical Cantum produces no label. Changing the historical year updates the text from resolved nameHistory and revises component membership at exact boundaries; no future-name leakage. The actual demo's second Cantum starts no earlier than its effective historical year; a tiny one-system region may have no displayed name if it cannot fit.

**World anchoring:** fixed X/Z dimensions/orientation, +Y plane normals,
component-specific star/envelope clearance, proportional viewport scaling,
natural perspective foreshortening and no camera-facing rotation. See the current
amendment and PR #5 review evidence.

**Caption behavior:** At wide zoom show the important labels; as zoom increases more lower-priority labels become eligible without overlapping. Caption text stays approximately the same CSS-pixel size at different zoom levels and remains centered **beneath** its marker. Collision winners are stable. Hover/focus/selection overrides passive declutter. Unplaced or historically unreleased objects never leak names; hiding marker layers hides their captions. Numeric and non-Latin name characters are handled safely.

**Controls and regression:** Independent toggles work in both camera modes and appropriate map levels. Catalogue selection, Escape/InfoCard close, route-hover behavior, one-finger touch pan, pinch, two-finger rotation where implemented, timeline scrubbing, 2D bounded zoom, square chart/grid and the H8 measurement annotation still work. Test at normal desktop, narrow portrait and mobile landscape widths. `npm test`, `npm run validate`, `npm run connections:check`, `npm run build` and relevant browser tests pass. Record any real-device checks separately from emulator-only checks.

## 6. Explicit exclusions and maintenance workflow

- No canonical `public/data/` migration, changes to `src/timeline/resolve.mjs`, navigation schema, ID Finder, generated gate placements/registry, sector coordinates or political facts.
- No final icon pack, MCR logo, NEXUS portrait, new worldbuilding names, curved political lettering, local editor, deploy, or wholesale UI redesign.
- The H8 width arrow is already implemented; preserve it and do not repeat the original refinement task.
- Inspect `git status` and the current local checkout before edits. Never assume that GitHub `main` includes uncommitted work. Create a short implementation plan, work in reviewable stages, and stop for creator review. Do **not** commit/push/deploy without permission.
- The original implementation handoff is complete. Future changes need a current creator request; historical delivery instructions do not authorize new files or visual work. Preserve the viewer/NEXUS/Cantum contracts.
