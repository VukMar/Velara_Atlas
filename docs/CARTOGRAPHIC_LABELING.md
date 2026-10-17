# Velara Atlas — Cartographic Typography and Adaptive Labels

**Status:** CREATOR-APPROVED DESIGN DIRECTION — implementation not yet authorized by this document alone.  
**Target:** Focused post-Checkpoint-3.6 refinement, before the final NEXUS asset/icon implementation.  
**Scope:** World-space Cantum region lettering in Sector View; adaptive screen-space navigational captions in both map levels; independent layer controls.  
**Baseline:** Existing square chart and 8×8 system grid, floating panels, camera modes/gesture controls, Schema v1.2 navigation, historical resolver, and Cantum influence visualization.  
**Design authorities:** `docs/VIEWER_SPECIFICATION.md`, `docs/NEXUS_VISUAL_IDENTITY.md`, `docs/CANTUM_TERRITORY_RENDERING.md`, `docs/DATA_MODEL.md`, and `AGENTS.md`. This specification adds only the labeling behavior approved in the conversation; it does not supersede unrelated requirements.

## 1. Why two different label systems

The Sector View should convey political/geographic identity at wide zoom without turning into a crowded set of interface overlays. The System View should make the names of stars, planets, moons, stations, short-range gates, Jump Gates and Jump Holes easier to associate with their markers. Implement two coordinated, but technically independent, layers:

- **Cantum names** are cartographic typography in **world X/Z coordinates**, behind markers and routes; their apparent pixel size *changes with chart zoom*. Render only in Sector View.
- **Object captions** are projected **screen-space typography** beneath each object's visible marker/sprite; font sizes remain approximately constant in CSS pixels while the caption follows the object's actual XYZ position. Use in Sector and System views with adaptive decluttering.

Both layers use names resolved for the current A.E. year. Do not modify underlying data, invent names/dates, change system coordinates, or expose unreleased objects. Support UTF-8 text and the browser's available fonts.

## 2. Cantum name placement — approved Option B

**One name per sufficiently large connected geographic region**, rather than one long name spanning all the holdings of a Cantum.

- Derive eligible contributors from existing `territoryGroups(view, sector, presentation)` and Cantum display names from **currently resolved** `view.cantums` (not ID, prefix, `letter`, private data, or a hard-coded string).
- Derive connectivity from **that Cantum's own influence field**, using the **same bubble/radius/falloff and field-threshold semantics** as the existing territory overlay. This is *not* gate-route connectivity, graph connectedness, or an assertion of an exact legal border.
- Sample a bounded, deterministic per-Cantum visibility/field mask in X/Z (e.g., 128×128 or equivalent). Find connected components conservatively (four-neighbor flood fill, or geometry with equivalent conservative connectivity). Reject subthreshold noise and too-small components. Do not merge regions solely because cells touch diagonally.
- Do **not** derive component connectivity from the final blended RGBA influence texture, since it combines different Cantums and loses territorial identity. Reuse/extract a pure per-Cantum field calculation where practical, without changing the existing opacity/color/merging algorithm or its protected caps.
- For each surviving component, find an interior label anchor where the field is high enough, reasonably far from the contour and with room for the *entire* current name. Prefer positions away from dense system markers/route junctions. Use deterministic tie-breaks and avoid jumps/flicker from minor camera changes.
- Derive general orientation from the component's dominant X/Z axis (e.g., weighted PCA of its contributing region). Keep readable, upright lettering; constrain excessive rotations and fall back to horizontal for near-circular components or unstable axes. Straight, gently angled labels only in this iteration; no curved text.
- Use spaced, restrained typography and subtle Cantum-linked color. Names should be perceptible but visually subordinate to individual system markers, route strokes and hover targeting. Avoid bright glow, text boxes, thick outlines and unsupported font downloads.
- Derive text width and world-space height from region geometry (not arbitrary fixed CSS positioning). Fit the complete name inside the component with padding and a minimum practical legibility threshold. Reduce size or **omit the region label** when it cannot fit. Never truncate, abbreviate, invent a nickname or wrap the name across multiple lines to force it to fit.
- One Cantum may produce multiple separate labels if its component(s) qualify; tiny holdings may produce none. At the early historical years, if the Cantum is not eligible, has no resolved name, or has no contributing positioned systems, show no territorial text. Do not suggest that historic administrative Cantums were sovereign states.
- Recompute when historical year changes alter effective names, Cantum membership, visibility, status or system placements. Cache the component results against the relevant resolved inputs; do not recompute field connectivity on every pan/zoom frame.

### Zoom and viewpoint

- At the overview scale (fit zoom), regional letters should be readable enough to identify a sizable region, **without demanding prominence in tiny regions**.
- At mid zoom, gently reduce their opacity; at close zoom, fade to zero so system marker captions take precedence. Use continuous transitions and a small hysteresis/deadband for any discrete thresholds to prevent flicker.
- World-space placement and glyph size must not be rebuilt/rescaled to a fixed CSS size on every zoom: **the words should zoom as part of the geography**. Per-frame opacity/projection updates are fine.
- Maintain the same world-space location in 3D Sector View where sensible; fade/hide when foreshortening or projection makes the lettering unreadable. Never place territorial text in System View.
- Place the text slightly above the chart's territory/grid plane to avoid z-fighting but visually behind routes, systems, hovering/selected markers and screen-space captions. It must not intercept clicks, taps, drags, or route picking.

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

Add independent Map Layers toggles (default on):

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

**World anchoring:** A world-space name enlarges/repositions on zoom while staying tied to the same region X/Z coordinates; it is not a fixed HUD overlay. 3D switching does not add names to System View; steep perspective hides unreadable typography. System markers and routes render above regional text and can still receive pointer events.

**Caption behavior:** At wide zoom show the important labels; as zoom increases more lower-priority labels become eligible without overlapping. Caption text stays approximately the same CSS-pixel size at different zoom levels and remains centered **beneath** its marker. Collision winners are stable. Hover/focus/selection overrides passive declutter. Unplaced or historically unreleased objects never leak names; hiding marker layers hides their captions. Numeric and non-Latin name characters are handled safely.

**Controls and regression:** Independent toggles work in both camera modes and appropriate map levels. Catalogue selection, Escape/InfoCard close, route-hover behavior, one-finger touch pan, pinch, two-finger rotation where implemented, timeline scrubbing, 2D bounded zoom, square chart/grid and the H8 measurement annotation still work. Test at normal desktop, narrow portrait and mobile landscape widths. `npm test`, `npm run validate`, `npm run connections:check`, `npm run build` and relevant browser tests pass. Record any real-device checks separately from emulator-only checks.

## 6. Explicit exclusions and workflow

- No canonical `public/data/` migration, changes to `src/timeline/resolve.mjs`, navigation schema, ID Finder, generated gate placements/registry, sector coordinates or political facts.
- No final icon pack, MCR logo, NEXUS portrait, new worldbuilding names, curved political lettering, local editor, deploy, or wholesale UI redesign.
- The already requested H8 sector-width double-headed arrow is an **independent small refinement**; preserve it if implemented locally. Do not overwrite or silently duplicate that work.
- Inspect `git status` and the current local checkout before edits. Never assume that GitHub `main` includes uncommitted work. Create a short implementation plan, work in reviewable stages, and stop for creator review. Do **not** commit/push/deploy without permission.
- Update `docs/VIEWER_SPECIFICATION.md` and `docs/NEXUS_VISUAL_IDENTITY.md` to describe the finished behavior; add a short implementation/results note. Do not weaken other approved contracts.
