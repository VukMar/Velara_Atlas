# Velara Atlas — NEXUS Visual Identity

**Version:** 1.0.0 · **Milestone:** 5 — Approved creative direction · **Date:** 2026-10-15  
**Status:** Approved visual identity; exact theme tokens remain tuneable. Checkpoint 3.6 implements the map-first layout and restrained surfaces. Checkpoint 4.1 Phase 3 adds fourteen original starter SVGs, procedural physical models and bounded inspection. Checkpoints 4.2A branding, 4.2B archival presentation, 4.2C unified reticles, 4.2D System minima, 4.2E Focus motion and 4.2F chart navigation are complete and creator-approved (2026-10-23); 4.2G opening is complete and creator-approved (2026-10-24), while audio and later refinement remain separately gated. The active noncanonical Demo uses the [accepted v1.3 contract](DATA_MODEL_V1_3_PROPOSAL.md); frozen v1.2 references remain supported. [Checkpoint 4.1 Phase 3 results](CHECKPOINT_4_PHASE3_RESULTS.md) retain their historical verification context.

## 1. Purpose and source references

The Velara Atlas is an interactive historical and navigational archive **curated by NEXUS** for Maric Cosmic Records (MCR). Its look inherits the user's established visual language rather than recreating a game HUD or introducing an unrelated science-fiction aesthetic.

Approved reference material supplied during design:

- **MCR insignia** — `Hud Profile Picture.png`: large blue segmented rings, vivid cyan center emblem, technical radial geometry, extensive black negative space.
- **NEXUS visual form** — `NEXUS Visual Form V2.png`: fine turquoise/cyan human wireframe on black, triangular mesh contours and controlled luminous detail. The supplied image is a *front-facing* reference. The creator-supplied `public/assets/nexus/nexus-side-profile.png` is now integrated in ordinary InfoCards by completed 4.2A; the front-facing reference remains reserved. Do not substitute an invented identity.
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
it. Stage 2 did not implement sigil-only islands or 3D influence surfaces.
Subsequent Stages 3–4 and calibration are committed in `190bd21`; see
[the current Cantum contract](CANTUM_TERRITORY_RENDERING.md) for envelopes and
small-island eligibility. This does not authorize Stage 5 refinement.

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

The following retains the original proposal. Completed 4.2C below supersedes
its sizing/fade/spin proposals with the creator-approved exact treatment.

- **Idle:** no targeting rings by default. Do not convert the entire sector into a flat node diagram.
- **Hover:** one soft, thin, segmented cyan circular reticle appears centered on the hovered visible object's screen-projected anchor. Optional short label/ID; avoid a full-screen information dump.
- **Selected:** reticle persists, clearer than hover; use radial segments and small alignment ticks inspired by MCR insignia. Hovering another object must not obscure the committed selection state.
- **Deselect:** reticle fades briefly; selecting a new object transfers it without camera jumps.
- **Implementation:** CSS/SVG screen-space overlay driven by Three.js projection, or camera-facing sprite with constant pixel size; selected geometry still occupies correct XYZ coordinates. Pure screen-space overlay is often easiest for stable readability.
- **Sizing proposal:** 40–64 CSS-pixel diameter for ordinary markers at typical zoom, adjustable for accessibility; avoid scaling reticles with huge celestial radii or zoom so far that they cover nearby objects. Targeting geometry should not mask labels; collision/offset logic may be needed.
- **Visibility:** offscreen or genuinely hidden objects must not leave ghost reticles; overlapping top-down projections need a documented disambiguation UI. Overlay does not intercept map selection; use `pointer-events: none` for purely decorative SVG/CSS reticles.
- **Motion (original Milestone 5 proposal, superseded only where noted):** modest fade in/out (roughly 120–180 ms), no constant spin; respect `prefers-reduced-motion` by disabling nonessential transitions. The later approved 4.2C cyan hover treatment uses subtle rotation while the gold selection lock remains static; see 4.2 amendment.

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
- A schema-valid `icon: null` requests object-kind/variant fallback. Current object schemas require the `icon` key; defensive missing-value handling is not permission to omit required fields. Future custom-file rendering must fall back safely on load failure; the current viewer uses the Phase 3 starter SVG registry and procedural physical models.
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

## Completed Architecture Phase 4 configuration boundary

Phase 4 modularization/configuration is complete and creator-approved, preserving
the approved NEXUS appearance and ordinary Demo. `visual-config.mjs` retains the
existing fixed pixel minima and handoff values and provides a closed, immutable
`createVisualConfig` factory for scene background, marker selection, route hover,
route opacity and selection timing. Defaults are unchanged; CSS remains the owner
of panel/theme typography and responsive rules. See [exact settings and ownership](ARCHITECTURE.md#safe-presentation-configuration).

This is not a public settings editor. Units, IDs, history, physical dimensions,
navigation, the authored universal territory radius and release safeguards are
not visual tunables. Extend only through the owning module and regression tests.
Phase 5 local preview implementation is complete and creator-approved;
new effects/artwork, Atlas Creator and deployment require separate authorization.

## Local Development tuning (completed Phase 5)

Only the loopback Development preview exposes background/selected-marker colors
and selection delay. All values pass `createVisualConfig`; named presets and
Replay restore validated presentation and camera state. Radius experiments remain
local reduced-format overrides. No normal-Demo settings panel, art, physical/history
controls, persistence or publication is added. See [local preview guide](../README.md#named-local-preview-scenarios-completed-phase-5).
Phase 5 is complete and creator-approved; Phase 6 is complete and creator-approved. The current architecture optimization roadmap is complete; subsequent development, Canon migration, Atlas Creator and deployment require separate authorization.

## Checkpoint 4.2 approved direction / planned implementation amendment (2026-10-23)

Older Milestone 5 targeting and voice deferment notes above remain historical
design context. The final approved artwork is
`public/assets/ui/nexus-reticle.svg`, committed at
`6b4bc5f92e1ef7fc7fd1740da5cc3d2217b8a1f0` with a 128×128
viewBox. It must not be redrawn, simplified or reinterpreted. Phase
4.2C: same artwork in both views, a **cyan `#00d6ff` rotating hover/
keyboard focus** state and **gold `#e6ba7b` nonrotating persistent
selected lock**, slightly larger. Both can appear on separate entities;
hover cannot replace the existing selection lock. The preliminary
15–25% enlargement is a review target, not an approved exact measurement.
Reticle position follows the real projected anchor and respects clipping,
visibility, touch/keyboard and `prefers-reduced-motion`; overlay cannot
interfere with picking or captions. Keep existing starter navigation SVGs.

**4.2C implementation and creator approval (2026-10-23):** both map levels use
the unchanged original as a CSS alpha mask. Cyan `#00d6ff` hover/keyboard focus
is 60 CSS px and rotates clockwise once per 30 seconds. Gold `#e6ba7b` selection
is 72 px (20% larger), static and persistent; it suppresses cyan on the same
entity while allowing cyan on another. Reduced motion removes rotation without
pulsing or replacement motion. No entry/exit fade is implemented. Original
geometry, fine opacity and transparency remain; state colors replace source hues.
The 128×128 Chromium raster comparison differs by at most 1/255 alpha.

Only the two active indicators exist, aligned to final shared projected anchors
for visible positioned systems/bodies/stations/gates/holes. No targeting is added
to routes, zones, unpositioned records or archival screens. Rebuilds, historical
invalidation, clipping, layers and depth occlusion remove stale indicators.
They are decorative, accessibility-hidden and pointer-transparent. Keyboard
outlines and selected captions remain; the obsolete generic proxy circle is
retired. Fixed size can overlap in dense views or sit inside large inspected
bodies; the creator approved these proportions and responsive presentation.
No marker/hit-area sizing, Focus animation, map transition or audio is included.
See [exact UI SVG admission](VISUAL_ASSET_POLICY.md#10-implemented-checkpoint-42c-ui-svg-admission).

**4.2A implementation and creator approval (2026-10-23):** unchanged
`mcr-insignia.png` appears beside `VELARA ATLAS` at 32 CSS px (24 px at widths
≤600 px), retaining the title, noncanonical disclosure, navigation/year and units.
The original transparent side-profile is contained in a separate area beside the
ordinary InfoCard heading, above facts/actions: 96 px normally, 64 px at widths
≤600 px or for more than twelve facts / descriptions longer than 600 characters.
It is hidden at widths ≤360 px or heights ≤600 px. No crop, recolor, frame artwork
or image mutation is used. Logo alt text identifies Maric Cosmic Records; the
portrait has empty alt text and `aria-hidden` beside the existing NEXUS label.
Image errors hide the failed image and collapse its slot; listeners use the shell
lifetime. Centered dialog, close/Escape, focus return, facts and actions remain
unchanged, and opening an InfoCard never sizes the square chart.

The two PNGs are explicitly bundled and audited; see the
[implemented binary policy](VISUAL_ASSET_POLICY.md#8-implemented-checkpoint-42a-png-admission).
Creator approval accepts this ordinary-card/header treatment. At the 4.2A
closeout, archival/opening use remained deferred; the subsequent approved 4.2B
correction below admits the front-facing image for archival use only.

**4.2B complete and creator-approved (2026-10-23):** the creator
approved the archival layout and the unchanged front-facing
`nexus-form.png` for direct communication with the Visitor. This supersedes the
reserved-only note above for this one context; ordinary InfoCards continue using
the side-profile. Preserve the full 2752×1536 image's proportions/transparency and
the accepted archival typography, spacing, controls and historical context.
The archival title, subtitle and exact creator-authored message now come from the
single universal `public/content/nexus/fallback-data.json`, independent of worlds.
See [the content contract](DATA_MODEL.md#universal-nexus-ui-content--42b-correction).
The dedicated archival section is a navigation destination, not a second modal.
It preserves the square chart and restrained dark background, cyan/teal identity
and status, quiet dividers and generous spacing. Desktop portrait width is
`clamp(120px,36%,240px)`; mobile uses 96 px beside the historical identity, hiding
the portrait at widths ≤360 px or heights ≤600 px. Small/short/enlarged-text
presentations scroll internally so the explanation and Return remain reachable.
Image failure hides the decorative image without losing content/actions. Entry
focuses the historical heading; routine refresh does not repeat that focus change.

Approved title: `NEXUS // ARCHIVAL NOTICE`. Approved subtitle:
`DETAILED SURVEY UNAVAILABLE`. Approved exact message:

> Ah, this one. Yes, the system is documented. Unfortunately, its detailed survey isn't included in your edition of the archive. How disappointing. For you, I mean.

This public UI wording may be used for the separately authorized 4.2H fallback
recording; it is not historical metadata. No playback, recording or audio controls
are implemented. The closeout approves 4.2B only; 4.2C–I, final Checkpoint 4
acceptance and Cantum Stage 5 remain outstanding.

The original broad voice deferral was for the first viewer. The narrow
**planned** Checkpoint 4.2H exception is just two prerecorded,
creator-approved speeches: welcome and archival fallback; ordinary
InfoCards are **not narrated**. 4.2G designs opening without playback;
4.2I adds a few optional short sounds **last**. Still deferred:
animated speaking avatar, AI dialogue, on-demand voice API, ambience,
music and routine audio commentary. Speech text and recordings require
separate creator approval. See the [phase roadmap](DEVELOPMENT_ROADMAP.md#checkpoint-42--nexus-visual-and-audiovisual-completion-planned).

## Checkpoint 4.2E approved Focus motion — 2026-10-23

The creator approved a restrained **550ms** Focus camera movement with
**smoothstep `t*t*(3-2*t)` easing**, geometric viewing-scale/zoom/clipping
interpolation and a stable, exact inspection/anchor/zone endpoint. It is a
navigational camera action; there is no overshoot, shake, flourish, simulated
travel, object animation or independent reticle movement. Existing cyan/gold
reticles follow the same projected anchors throughout.

Manual input, subsequent camera commands, history/navigation and teardown cancel
cleanly from the visible view. Reduced motion uses immediate framing and no
replacement effect. Selection, ordinary InfoCards, physical scale, 4.2D minima,
header/archival imagery and approved dialogue remain unchanged. This completed
phase supersedes earlier Focus-motion deferment only. At its closeout, 4.2F–I
remained planned and separately gated, with final Checkpoint 4 acceptance and
Cantum Stage 5 pending. That phase included no opening, audio or map-navigation
transition. Software rendering
may deliver a frame after the configured deadline; see [verification and limits](DEVELOPMENT_ROADMAP.md#phase-42e--focus-selection-animation).

## Checkpoint 4.2F approved chart reveal — 2026-10-23

The creator approved a **420ms** destination-chart reveal with
**`cubic-bezier(.42,0,.58,1)`** easing: opacity 1 → .86 at 24% → 0 over a dark
`rgba(2,12,19,.82)` surface. An inset 1px cyan `#55d9e340` edge and restrained
teal `#17646b30` shadow supply the archival accent. The effect covers chart
content below targeting and floating controls; it adds no text or artwork.
Archival entry uses only a 2px `#55d9e380` perimeter, with no mask over the
approved portrait, universal message or Return action.

Sector→System, System→Sector and valid System→System actions change the active
archival chart immediately, then reveal it. There is no physical travel, flight,
shake, particle effect, sound or second scene. Existing camera snapshots and
550ms Focus movement are unchanged. Input, commands, history, replacement
navigation, errors and teardown cancel cleanly. Reduced motion uses direct
navigation without a replacement effect. Keyboard/touch access and destination
focus remain intact. The treatment preserves the square chart and A–E visuals.

This supersedes chart-transition deferment only. At the 4.2F closeout, 4.2G–I remained planned,
unimplemented and separately gated; final Checkpoint 4 acceptance and Cantum
Stage 5 remain pending. See [verification and limits](DEVELOPMENT_ROADMAP.md#phase-42f--map-navigation-transitions).

## Checkpoint 4.2G approved Atlas opening — 2026-10-24

The creator approved the ready-only, black opening dialog with restrained cyan
rectangular framing, green `NEXUS // CONNECTION ESTABLISHED` identity, readable
`VELARA ATLAS` branding and unchanged MCR insignia. The original front-facing
NEXUS form is the dominant character image, contained without distortion or face
cropping. Desktop separates portrait and copy with a quiet divider; narrow layouts
stack and reduce artwork, while short landscape gives priority to copy/actions.
Text and buttons remain reachable through bounded vertical scrolling. Image
failure hides the artwork while preserving all essential text and entry actions.

The universal introduction in `public/content/nexus/opening-data.json` is the
**approved 4.2G script for future 4.2H voice production**:

- Title: `NEXUS // CONNECTION ESTABLISHED`
- Subtitle: `VELARA ATLAS`
- Message: "Ah, a Visitor. Welcome to the Velara Atlas. You may explore this edition of the archive by system and by year. History has a habit of resisting simple explanations. Fortunately, you have me. Do try to keep up."

This approval establishes public UI copy, not new historical facts. No welcome
recording or playback has been implemented or admitted. The two visible actions
are `Enter with audio` and `Enter silently`; the approved note is "Voice playback
is not available in this preview. Both entry options currently open the Atlas
without sound." Escape enters silently. Both choices enter immediately, preserving
the initialized chart and recording only in-memory intent. Show once on each
successful fresh page load; no persistence or reopening during navigation/remount.

An optional **240ms ease-out opacity appearance** is the only new motion.
Reduced motion skips it; entry is never delayed. Native dialog focus isolation,
visible action focus, map focus return and technical-error visibility are retained.
A–F presentation, artwork and dialogue remain unchanged. H–I remain planned and
separately gated, with final Checkpoint 4 acceptance and Cantum Stage 5 pending.
