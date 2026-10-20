# Velara Atlas — NEXUS Visual Identity

**Version:** 1.0.0 · **Milestone:** 5 — Approved creative direction · **Date:** 2026-10-15  
**Status:** Approved visual identity; exact theme tokens remain tuneable. Checkpoint 3.6 implements the map-first layout and restrained surfaces. Checkpoint 4.1 Phase 3 adds fourteen original starter SVGs, procedural physical models and bounded inspection; final artistic refinement, elaborate targeting-ring art and curator imagery remain deferred. Current data support is defined by the v1.2 schema; current rendering evidence is in [Phase 3 results](CHECKPOINT_4_PHASE3_RESULTS.md).

## 1. Purpose and source references

The Velara Atlas is an interactive historical and navigational archive **curated by NEXUS** for Maric Cosmic Records (MCR). Its look inherits the user's established visual language rather than recreating a game HUD or introducing an unrelated science-fiction aesthetic.

Approved reference material supplied during design:

- **MCR insignia** — `Hud Profile Picture.png`: large blue segmented rings, vivid cyan center emblem, technical radial geometry, extensive black negative space.
- **NEXUS visual form** — `NEXUS Visual Form V2.png`: fine turquoise/cyan human wireframe on black, triangular mesh contours and controlled luminous detail. The supplied image is a *front-facing* reference. The creator-supplied side-profile PNG exists at `public/assets/nexus/nexus-side-profile.png`; its viewer/InfoCard integration remains deferred. Do not substitute an invented identity.
- **NEXUS opening-interface screenshot** — the user-provided frame from the YouTube sequence: black background, restrained blue rectangular status frame, small circular connected record nodes, cyan/blue emphasis, green `CONNECTION ESTABLISHED` status. The screenshot is a style reference, **not** a directive to turn every celestial body into a node.
- **Viewer behavior** — `docs/VIEWER_SPECIFICATION.md` v1.1 and `docs/CANTUM_TERRITORY_RENDERING.md` (approved Milestone 3). Their navigation, layering, chronology, and territorial rules remain authoritative.

Do not use unlicensed screenshots, Freelancer/Discovery game assets, or an externally copied logo. Use the owner's supplied MCR/NEXUS assets where authorized, and create original atlas symbols.

## 2. Non-negotiable visual principles

1. **Preserve the 3D geography.** Default map: top-down orthographic on X/Z; optional camera-tiltable 3D. NEXUS's circular motifs are *hover/selection overlays*, never a replacement for planets, stations, gate markers, or spatial geometry.
2. **Black first.** Map space is almost black, with a discreet navigational grid. Floating panels and the centered InfoCard use slightly lighter translucent blue-black surfaces. Bright colors carry meaning; do not fill the screen with bright cyan lines.
3. **Information first.** Objects, connections, labels and timeline remain legible at a glance. Decorative holographic elements cannot block pointer interactions or obstruct InfoCard content.
4. **Curator, not wallpaper.** NEXUS appears contextually in selected InfoCards, direct archival communications, introductory states, and fallback screens. Her form is not a permanent full-height mascot over the map.
5. **Institutional geometry plus delicate wireframe.** Radial technical forms and 1px-like outlines reference the MCR insignia; restrained triangular mesh details reference NEXUS's visual form.
6. **Single shared renderer.** The same world coordinates and object IDs must drive 2D markers, 3D geometry, targeting overlays and information panels.
7. **Do not invent canon through styling.** Colors for individual canonical Cantums must be approved separately. A missing planet subtype must not silently be presented as canonically rocky or oceanic.

## 3. Proposed theme tokens (initial implementation values)

These hex values are implementation starting points sampled approximately from the references and supplemented by readable UI colors; **do not present them as a final pixel-perfect brand palette**. Fine-tune through screenshot review and automated contrast checks.

| Token / example CSS variable | Initial value | Purpose |
|---|---|---|
| `--nx-black` | `#000000` | Map backdrop and archival negative space |
| `--nx-surface` | `#081722` | Catalogue and InfoCard panels |
| `--nx-surface-raised` | `#102735` | Focused controls, cards and inset rows |
| `--nx-grid` | `#17394A` | Subtle X/Z grid and chart aids |
| `--nx-stroke` | `#2376A3` | Borders, radial segments, quiet dividers |
| `--nx-brand-blue` | `#228BCB` | MCR-blue identity linework |
| `--nx-active-cyan` | `#00D6FF` | Selection, active controls, targeting ring |
| `--nx-wire-teal` | `#24C9C6` | NEXUS wireframe motif, secondary interaction |
| `--nx-status-success` | `#25B878` | Explicit operational success/connected status only |
| `--nx-warning` | `#E6BA7B` | Archival limitation/warning; avoid fake errors |
| `--nx-text` | `#E1EFF5` | Primary copy |
| `--nx-text-muted` | `#94B2C2` | Explanatory text and metadata |
| `--nx-neutral-region` | `#73808C` | Fallback for missing approved Cantum style |

- Do **not** use NEXUS cyan as a default Cantum color: the archive's UI identity and in-universe political group identity are independent.
- Use a small, predictable set of semantic colors. Green is reserved for real status such as a successfully established connection; unknown survey data is **not** a green success.
- Keep Cantum influence fills subdued using the existing approved territory-overlay alpha/merge controls; do not overwrite the specification's opacity caps.
- Prefer gradients and bloom only sparingly on interactions; no high-intensity glow on the whole map or every label.

## 4. Typography and iconography

- Technical but legible: use a clean UI sans-serif for descriptions and controls, with a restrained monospaced face for coordinates, catalog codes and status strings. A good no-download starting stack is `system-ui, Segoe UI, sans-serif` and `ui-monospace, Consolas, monospace`. Open-source downloadable fonts can be considered later with verified licensing.
- Desktop descriptive text should normally be **14–16 CSS px or larger**; metadata **12–13 CSS px minimum** when space is limited. Avoid all-caps body paragraphs. Short NEXUS labels may be uppercase.
- Numeric coordinates use tabular figures where available, always with units (`ly`, `CNU`), and signed Y elevation when meaningful.
- Base navigation symbols use original SVG with readable strokes, consistent viewBox/optical weight, and a sensible minimum clickable area. Icons are not allowed to interfere with selected-object overlays or replace semantically meaningful labels.
- The full MCR insignia belongs on landing/introductory archival states; a compact, readable emblem may be used in the navigation header.

## 5. Map visual layers and 2D/3D behavior

Draw order back → front (preserve the earlier Milestone 3 contract):

1. Near-black map / restrained starfield and background.
2. Coordinate grid and reference guides.
3. Metaball-like Cantum influence regions (sector only), soft and nearly transparent.
   Stage 1 Cantum names use a decorative projected DOM overlay; marker captions,
   targeting and grid annotations remain above it, with no opaque nameplate panel.
4. Nav routes (short-range in systems; Jump Gate and Jump Hole routes in sector view).
5. Spatial objects (2D icons in top-down; appropriate physical/simple 3D rendering in perspective).
6. Historical names, spatial labels and visible coordinate readouts.
7. Hover/selection targeting and direct interface overlays.

**Implemented cartographic typography:** [Cartographic labeling](CARTOGRAPHIC_LABELING.md)
adds restrained, spaced system-font Cantum names per sufficiently large connected
influence component. Historical names and memberships remain authoritative. Text
uses the existing fitted geography for X/Z anchors; small or unnamed regions have
none. Stage 1 displays horizontal camera-facing nameplates at bounded 14–24 CSS
pixels, with Cantum-specific tint, weight 600 and restrained shadow. The provisional
height is highest eligible contributor Y plus modest clearance, independently of
the unchanged flat influence surface. Names fade at close zoom, remain readable
at low camera tilt and never receive pointer events. Their
Cantum-linked tint is independent of NEXUS interface colors and influence opacity
caps. The **Cantum Names** control is sector-only and independent of shading.

**Cantum Visual Patch Stage 2:** an optional sigil may sit beside a complete
name inside the existing decorative nameplate. The approved demonstration SVG
`cantums/test-cantum-a.svg` uses original cyan/blue geometry and is explicitly
noncanonical. It is 24 CSS pixels at desktop overview, bounded responsively to
18–24 px, upright in both cameras. Text tint stays Cantum-specific and independent
of the SVG palette. Null/omission, unknown identifiers or asset failure leave only
the name, with no unknown icon or reserved slot. The whole group shares fading,
projection and edge containment; grid annotations and marker controls stay above
it. No sigils for tiny unlabeled islands or 3D influence surfaces are implemented.

Object captions use the existing projected HTML layer, centered beneath markers,
with controlled screen-space font sizes, subtle shadow and no opaque pills.
Deterministic priorities/collision suppression favor systems, stars and planets;
zoom reveals smaller objects where space permits. **Object Names** hides passive
captions while focus, hover and selection preserve identification. Markers and
catalogue access survive decluttering. Names use released, historically resolved
text only. These controls retain session preferences through timeline, navigation
and 2D/3D changes. [Results and limits](CARTOGRAPHIC_LABELING_RESULTS.md) record
verification; final assets/reticles remain separate work.

**2D:** default top-down navigational icons, readable labels, real X/Z projection of stored XYZ positions. Y remains available in InfoCard and optional elevation overlay.  
**3D:** stars and planets use simplified procedural spheres; stations and built gates use camera-facing billboards at real XYZ positions initially; Jump Holes can use a restrained anomalous geometry/effect. A billboard is a navigational sign, not a claim that the station physically has the shape of its icon. Elaborate 3D station/gate models are deliberately outside the first viewer scope.  
**Zones:** ellipsoid, box and polygon-volume spatial zones remain true 3D geographic volumes; in top-down view use projected shapes. Their atmospheric particles are separate from their authoritative geographic bounds.

**Checkpoint 4.1 sizing contract (Phase 3 implemented):**
[Celestial scale](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md) fixes 1 CNU = 10,000 km.
2D/3D share authored XYZ and optional physical diameters; projected physical size
and centralized apparent minima remain separate. Presentation-default priority:
star → gas giant → regular planet → moon → asteroid/planetoid → station/Jump Gate
→ short-range gate. This guides navigational legibility, never physical size
restrictions or type multipliers. Gas giant remains a planet visual variant.
Camera-facing distant SVG proxies transition continuously to correctly scaled
models without duplicate disks or selection changes. Unknown diameters use neutral
proxies, structures use fixed apparent icons, and stellar glow/hit targets do not
define physical diameter. The initial library uses transparent geometric 64×64
SVGs, simple symbolic material colors and a thin shared hover/focus/selection
indicator; it is not final commissioned artwork. No portrait/fallback redesign
or detailed surface texturing is part of this phase. See the scale contract for
CSS minima, smoothstep handoff and physical-inspection limits.

## 6. MCR/NEXUS segmented targeting motif

- **Idle:** no targeting rings by default. Do not convert the entire sector into a flat node diagram.
- **Hover:** one soft, thin, segmented cyan circular reticle appears centered on the hovered visible object's screen-projected anchor. Optional short label/ID; avoid a full-screen information dump.
- **Selected:** reticle persists, clearer than hover; use radial segments and small alignment ticks inspired by MCR insignia. Hovering another object must not obscure the committed selection state.
- **Deselect:** reticle fades briefly; selecting a new object transfers it without camera jumps.
- **Implementation:** CSS/SVG screen-space overlay driven by Three.js projection, or camera-facing sprite with constant pixel size; selected geometry still occupies correct XYZ coordinates. Pure screen-space overlay is often easiest for stable readability.
- **Sizing proposal:** 40–64 CSS-pixel diameter for ordinary markers at typical zoom, adjustable for accessibility; avoid scaling reticles with huge celestial radii or zoom so far that they cover nearby objects. Targeting geometry should not mask labels; collision/offset logic may be needed.
- **Visibility:** offscreen or genuinely hidden objects must not leave ghost reticles; overlapping top-down projections need a documented disambiguation UI. Overlay does not intercept map selection; use `pointer-events: none` for purely decorative SVG/CSS reticles.
- **Motion:** modest fade in/out (roughly 120–180 ms), no constant spin; respect `prefers-reduced-motion` by disabling nonessential transitions. Timing is a tuneable default, not required game-like animation.

## 7. NEXUS presence and InfoCards

> **Checkpoint 3.6 revision:** [Layout and interaction revision](LAYOUT_REVISION_3_6.md)
> supersedes the persistent right InfoCard, side columns and bottom timeline here
> and in the responsive layout below. Use a centered dismissible InfoCard,
> floating panels and vertical History around a square chart. The approved palette,
> readability, geography and deferred artwork requirements continue to apply.

Selection opens a centered dismissible InfoCard; no card appears before selection.
Its top-right close control and Escape clear selection, return focus appropriately
and preserve the camera. Catalogue, controls, layers and vertical History are
compact floating panels. The header retains location/year. Panels never reserve
columns or move/resize the square chart. This replaces the original right-hand
card and bottom timeline layout while preserving all historical content/actions.

### Ordinary InfoCard

- Primary focus: selected entity's historical title and approved six-field InfoCard data — affiliation, class, crew, population, armament, description; show only relevant populated fields or honest “not recorded” states.
- Include a **small NEXUS side-profile PNG overlay** as the narrator/curator visual when its integration is separately authorized; the supplied asset is `public/assets/nexus/nexus-side-profile.png`. Suggested place: header-side or bottom/right protected margin, not underneath text. Portrait can fade into the panel with a turquoise edge accent.
- Do not assume the front-facing `NEXUS Visual Form V2.png` is the desired side-view asset. Until the supplied side-profile is integrated, retain the existing NEXUS status label or omitted portrait without changing layout.
- If there is insufficient width (phone layouts, text-heavy panels), reduce or hide the portrait before reducing text readability.

### Direct NEXUS archival messages

- For meaningful messages (survey notices, date-related archive caveats, intentional entry or brief contextual records), a more prominent PNG can accompany concise text.
- Messages are scripted/static archival text associated with approved records, **not** AI-generated live speech or new lore by default.
- Avoid interrupting normal browsing with unsolicited popups, forced animations or looping voice.

### Unavailable-system fallback

- Use NEXUS's image prominently (approved front-facing reference or supplied side profile, depending on composition) and a restrained segmented emblem/scan motif.
- Recommended heading: `NEXUS // ARCHIVAL NOTICE` and `DETAILED SURVEY UNAVAILABLE`.
- Explain that a **historically acknowledged** system has no **published detailed chart**; do not suggest the system is fictional/nonexistent or that information is secretly being hidden for narrative drama.
- Preserve system name, selected A.E. year, back/breadcrumb actions and catalogue access where historically permissible.
- A network request failure, invalid JSON, missing icon, or bad data schema uses a **technical error UI** with retry, never the archival fallback.

## 8. Default visual asset set and fallback behavior

See [VISUAL_ASSET_POLICY.md](VISUAL_ASSET_POLICY.md) for the category matrix, implemented starter asset paths, explicit registry and current schema support. Nullable icons and optional variants remain schema-valid; final artistic refinement is deferred. Core rules:

- **Star / planet / moon / planetoid / asteroid:** top-down navigational icons; perspective procedural celestial geometry. Planet variants: rocky, gas, water; add a neutral *unknown* default that does not fabricate canon.
- **Stations:** `regular`, `shipyard` defaults. Top-down icon, perspective billboard initially.
- **Short-range gate:** one default icon/marker; at most one fixed lifetime link in v1.2. An anchor can have multiple links through separate physical gate pairs.
- **Interstellar Jump Gate:** one default; each physical gate pairs with exactly **one** corresponding interstellar gate.
- **Jump Hole:** one default; follows v1.2 exclusive lifetime pairing.
- A schema-valid `icon: null` requests object-kind/variant fallback. Current object schemas require the `icon` key; defensive missing-value handling is not permission to omit required fields. Future custom-file rendering must fall back safely on load failure; the current prototype uses temporary geometric markers.
- Icon customization must not grant additional navigational behavior. The relationship/connection JSON remains authoritative.

## 9. Interaction feedback and accessible operation

- Visual states must distinguish **hover, selected, keyboard focus, inactive, unavailable, warning, operational success and technical error**. Do not rely on color alone: use shape, stroke style, label or text.
- Keyboard: catalogue search, arrows/tab navigation of reachable controls, Enter to open, Escape to dismiss, obvious Focus Selection and Return actions. Map markers should have keyboard-operable alternatives via the catalogue.
- Touch: tapping selects, second explicit action enters a system, pinch zoom/pan supported, no hover-only essential information.
- Support high-DPI screens, readable focus rings, text zoom to 200%, reduced motion, and sufficient text contrast; verify accessibility rather than assuming glow is readable.
- Header/panel decorative elements have no pointer hit boxes; do not compromise panning, zoom or click target selection.

## 10. Responsive layout

**Desktop:** compact header and centered square chart; floating Catalogue, Map controls, Map layers and vertical History. The selected year stays visible when History is closed. Record selection opens a centered dismissible InfoCard. The system chart has restrained A–H/1–8 world-space labels and an H8 CNU cell-width annotation.

**Narrow/mobile:** fit the complete default square without page overflow. Panels and the InfoCard remain bounded/scrollable overlays; opening them never changes chart dimensions or center. Keep close/focus controls accessible and reduce/hide any future portrait before reducing text readability. The same square viewport applies to perspective. See [layout behavior](VIEWER_SPECIFICATION.md) and [revision rationale](LAYOUT_REVISION_3_6.md).

## 11. Implementation order and acceptance criteria

### Suggested delivery order (not a new milestone request)

1. Ship pure CSS theme tokens, accessible panels, labels and grid on top of the working Milestone 3 viewer.
2. Implement neutral original SVG icon defaults and a variant resolver; test path/base handling under the GitHub Pages subdirectory.
3. Implement procedural star/planet geometry and perspective billboards.
4. Add hover/selection reticle anchored to correct projected object and respect 2D/3D switching.
5. Add NEXUS archival message/fallback UI; integrate supplied side-profile later without restructuring InfoCards.
6. Tune palette, responsive layout, reduced-motion rules and territory transparency after actual screenshots.

### Must-pass demonstrations

- Top-down vs perspective renders objects at the same XYZ coordinates, only changing their representation.
- A 3D planet is a sphere; a 3D station is a properly anchored billboard; both remain selectable and legible.
- `icon: null` falls back predictably; missing custom asset causes no broken-image element.
- Hover reticle tracks selected marker during camera pan, zoom and tilt; its size remains readable in CSS pixels.
- An unclassified planet uses a neutral rendering, not an invented rocky/water/gas subtype.
- Styling does not alter v1.2 lifetime exclusivity for any gate/hole. Multiple local relationships use distinct physical gate pairs; frozen v1.1 branching tests are separate historical coverage.
- MCR insignia and supplied NEXUS portrait render without deformation or illegible cropping; no assumed side portrait.
- On a narrow screen, text remains readable and the portrait cannot obscure InfoCard contents.
- Fallback screen differs from fetch/data errors; historical names and years remain correct.
- Cantum colors remain independent of NEXUS UI color tokens; metaball shading stays *under* routes and star markers.
- GitHub Pages release contains no local-only/private material and correctly loads assets through a configured base path.

## 12. Explicitly deferred (not prerequisites for Codex viewer MVP)

Full 3D station/gate models; orbital physics; animated avatar/voice; mandatory custom art for each system; an interactive full map editor; exact political borders; live AI chat or unapproved NEXUS lore generation. These features may be added without changing the core visual policy.

---

**Authority:** For data structure follow `docs/DATA_MODEL.md` + `schemas/`. For viewer behavior follow `docs/VIEWER_SPECIFICATION.md`. For generated Cantum overlays follow `docs/CANTUM_TERRITORY_RENDERING.md`. This document governs presentation; it may not override chronology, geography, publication controls, or transport constraints.
