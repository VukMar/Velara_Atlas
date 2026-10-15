# Velara Atlas — NEXUS Visual Identity

**Version:** 1.0.0 · **Milestone:** 5 — Approved creative direction · **Date:** 2026-10-15  
**Status:** Visual behavior and asset *policy* approved; exact theme token values remain tuneable during visual QA. This document is a design contract, **not evidence of a completed viewer or updated JSON Schema**.

## 1. Purpose and source references

The Velara Atlas is an interactive historical and navigational archive **curated by NEXUS** for Maric Cosmic Records (MCR). Its look inherits the user's established visual language rather than recreating a game HUD or introducing an unrelated science-fiction aesthetic.

Approved reference material supplied during design:

- **MCR insignia** — `Hud Profile Picture.png`: large blue segmented rings, vivid cyan center emblem, technical radial geometry, extensive black negative space.
- **NEXUS visual form** — `NEXUS Visual Form V2.png`: fine turquoise/cyan human wireframe on black, triangular mesh contours and controlled luminous detail. The supplied image is a *front-facing* reference; the proposed **side-profile PNG for InfoCards has not yet been provided** and must not be substituted with an invented identity.
- **NEXUS opening-interface screenshot** — the user-provided frame from the YouTube sequence: black background, restrained blue rectangular status frame, small circular connected record nodes, cyan/blue emphasis, green `CONNECTION ESTABLISHED` status. The screenshot is a style reference, **not** a directive to turn every celestial body into a node.
- **Viewer behavior** — `docs/VIEWER_SPECIFICATION.md` v1.1 and `docs/CANTUM_TERRITORY_RENDERING.md` (approved Milestone 3). Their navigation, layering, chronology, and territorial rules remain authoritative.

Do not use unlicensed screenshots, Freelancer/Discovery game assets, or an externally copied logo. Use the owner's supplied MCR/NEXUS assets where authorized, and create original atlas symbols.

## 2. Non-negotiable visual principles

1. **Preserve the 3D geography.** Default map: top-down orthographic on X/Z; optional camera-tiltable 3D. NEXUS's circular motifs are *hover/selection overlays*, never a replacement for planets, stations, gate markers, or spatial geometry.
2. **Black first.** Map space is almost black, with a discreet navigational grid. Sidebars use slightly lighter blue-black surfaces to maintain readability. Bright colors carry meaning; do not fill the screen with bright cyan lines.
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
4. Nav routes (short-range in systems; Jump Gate and Jump Hole routes in sector view).
5. Spatial objects (2D icons in top-down; appropriate physical/simple 3D rendering in perspective).
6. Historical names, spatial labels and visible coordinate readouts.
7. Hover/selection targeting and direct interface overlays.

**2D:** default top-down navigational icons, readable labels, real X/Z projection of stored XYZ positions. Y remains available in InfoCard and optional elevation overlay.  
**3D:** stars and planets use simplified procedural spheres; stations and built gates use camera-facing billboards at real XYZ positions initially; Jump Holes can use a restrained anomalous geometry/effect. A billboard is a navigational sign, not a claim that the station physically has the shape of its icon. Elaborate 3D station/gate models are deliberately outside the first viewer scope.  
**Zones:** ellipsoid, box and polygon-volume spatial zones remain true 3D geographic volumes; in top-down view use projected shapes. Their atmospheric particles are separate from their authoritative geographic bounds.

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

The approved right-hand InfoCard remains persistent and collapsible; the left-hand catalogue and bottom timeline remain as specified in Milestone 3.

### Ordinary InfoCard

- Primary focus: selected entity's historical title and approved six-field InfoCard data — affiliation, class, crew, population, armament, description; show only relevant populated fields or honest “not recorded” states.
- Include a **small NEXUS side-profile PNG overlay** as the narrator/curator visual when the asset is supplied by the creator. Suggested place: header-side or bottom/right protected margin, not underneath text. Portrait can fade into the panel with a turquoise edge accent.
- Do not assume the front-facing `NEXUS Visual Form V2.png` is the desired side-view asset. Until the side-profile exists, show a minimal NEXUS monogram/status label or omit the portrait without changing layout.
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

See `docs/VISUAL_ASSET_POLICY.md` for the authoritative initial category matrix, public asset paths, visual registry contract, null/unknown handling, and staged schema changes. Core rules:

- **Star / planet / moon / planetoid / asteroid:** top-down navigational icons; perspective procedural celestial geometry. Planet variants: rocky, gas, water; add a neutral *unknown* default that does not fabricate canon.
- **Stations:** `regular`, `shipyard` defaults. Top-down icon, perspective billboard initially.
- **Short-range gate:** one default icon/marker; may have multiple local links.
- **Interstellar Jump Gate:** one default; each physical gate pairs with exactly **one** corresponding interstellar gate.
- **Jump Hole:** one default; follows the paired endpoint rule in the current v1.0 transport network.
- An `icon` that is `null` or absent should resolve from object kind + declared visual variant. A missing custom file must fall back to safe default asset, then to an internal generic symbol; never produce a broken-image placeholder.
- Icon customization must not grant additional navigational behavior. The relationship/connection JSON remains authoritative.

## 9. Interaction feedback and accessible operation

- Visual states must distinguish **hover, selected, keyboard focus, inactive, unavailable, warning, operational success and technical error**. Do not rely on color alone: use shape, stroke style, label or text.
- Keyboard: catalogue search, arrows/tab navigation of reachable controls, Enter to open, Escape to dismiss, obvious Focus Selection and Return actions. Map markers should have keyboard-operable alternatives via the catalogue.
- Touch: tapping selects, second explicit action enters a system, pinch zoom/pan supported, no hover-only essential information.
- Support high-DPI screens, readable focus rings, text zoom to 200%, reduced motion, and sufficient text contrast; verify accessibility rather than assuming glow is readable.
- Header/panel decorative elements have no pointer hit boxes; do not compromise panning, zoom or click target selection.

## 10. Responsive layout

**Desktop:** top bar, collapsible left catalogue, dominant center map, collapsible right InfoCard, always-accessible bottom historical timeline.  
**Narrow/mobile:** map stays primary; side panels become drawers; InfoCard portrait becomes smaller or disappears; timeline remains operable via compact slider/year input and may expand as a controlled drawer/strip. Don't permanently shrink the navigable map to accommodate both sidebars.

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
- Jump Gate/Jump Hole icon type does not alter the one-partner relationship constraint; short-range branching works.
- MCR insignia and supplied NEXUS portrait render without deformation or illegible cropping; no assumed side portrait.
- On a narrow screen, text remains readable and the portrait cannot obscure InfoCard contents.
- Fallback screen differs from fetch/data errors; historical names and years remain correct.
- Cantum colors remain independent of NEXUS UI color tokens; metaball shading stays *under* routes and star markers.
- GitHub Pages release contains no local-only/private material and correctly loads assets through a configured base path.

## 12. Explicitly deferred (not prerequisites for Codex viewer MVP)

Full 3D station/gate models; orbital physics; animated avatar/voice; mandatory custom art for each system; an interactive full map editor; exact political borders; live AI chat or unapproved NEXUS lore generation. These features may be added without changing the core visual policy.

---

**Authority:** For data structure follow `docs/DATA_MODEL.md` + `schemas/`. For viewer behavior follow `docs/VIEWER_SPECIFICATION.md`. For generated Cantum overlays follow `docs/CANTUM_TERRITORY_RENDERING.md`. This document governs presentation; it may not override chronology, geography, publication controls, or transport constraints.
