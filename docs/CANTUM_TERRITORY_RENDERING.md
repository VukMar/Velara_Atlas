# Velara Atlas — Cantum Territory Rendering Rules

**Status:** Approved Milestone 3 rendering contract, technical default parameters subject to visual tuning.  
**Version:** 1.0 · Companion to `docs/VIEWER_SPECIFICATION.md` v1.1  
**Scope:** **Sector map only**. This defines NEXUS political **influence shading**, not exact sovereign borders and not the star-system spatial-zone renderer.

## 1. Concept and source of truth

For each Cantum, generate a translucent, softly bounded X/Z region from system-centered influence bubbles, then merge bubbles **within that Cantum** using a continuous metaball-style field. A single isolated system makes an island. Two or more close systems merge into an organic region. Unconnected far-away systems remain separate islands. **Never stretch artificial corridors** merely to connect separated holdings. Gate routes do not determine territory.

This layer depicts the **distribution of mapped Cantum-associated systems**, not the exact extent of law, ownership of the intervening void, or volumetric boundaries. NEXUS should label it **“Cantum influence / approximate chart overlay”** or comparable language, not “exact sovereign border.” A system's membership must not be derived from the resulting color field.

### Authoritative input filter

For chosen year `Y`:

1. Read **public released** sector-index systems and Cantums only. Private records are not available to the renderer.
2. Include a system only if its discovery/confirmed public historical knowledge at `Y` is established under the **approved resolver**; unknown `discoveredAE: null` is *not* automatically treated as discovery in year zero.
3. Include the system only if `positionLY` has finite numeric X/Z coordinates in `ly` and the system is inside the sector's declared map bounds. Y is **not** used to calculate this 2D projected shading. Systems without plotted coordinates can still be in the catalogue, but cannot contribute bubbles.
4. Determine the historically valid Cantum from the system's effective `cantumHistory` at `Y` (`fromAE` inclusive, `untilAE` exclusive). A null, absent, conflicting or unresolved membership contributes no bubble. `controlHistory`, `infoCard.affiliation`, labels, geographic proximity and travel links do **not** replace this source. Cantum existence/status data must also be historically eligible at `Y`; otherwise omit the contribution and flag inconsistent records in validation.
5. Include a known public system **even if** `publicDetailPath` is null or its inner map is partially authored. The presence of a system-level detail file is irrelevant for sector territory shading.
6. Group accepted X/Z points by their effective Cantum ID. Cantums with no eligible positioned systems have no generated region; retain their other public catalogue information.

**Important:** At historical years before a system joins a Cantum, its marker may be visible but it should not generate that Cantum's bubble. Even within the politically unified Continuance period, reflect the historical Cantum administration rather than assuming all systems were always independently sovereign.

## 2. Exact field and compositing algorithm (initial recommended implementation)

**Coordinates are world-space `ly` in the sector X/Z plane**, not CNU, and **bubble radii are `ly`**, never screen pixels. One bubble is centered at each eligible system `(x_i, z_i)` and uses its Cantum's fixed radius `r_c > 0`.

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
- **Sector perspective mode:** maintain the same X/Z historical footprint as an unobtrusive chart/reference-plane projection underneath system markers, **not a true three-dimensional sovereignty volume**. It may lie on a visual chart floor below the marker layer; preserve explicit render ordering and prevent depth-test artifacts from drawing the territory on top of stars. Toggling perspective cannot recompute membership or shift circles.
- **Toggle:** “Cantum influence regions” (or similar), OFF hides only the overlay; it does **not** recolor system markers, remove connections, change Cantum affiliations, or affect searching.
- **Other spatial zones:** nebula, radiation and asteroid-field volumes are independent **system-map features**. Do not merge their geometry with Cantum influence shading.

## 4. Presentation settings (proposed new public-safe file)

The existing JSON Schema v1.0.0 contains no Cantum palette/radius contract. Add a **small validated presentation configuration** during implementation, stored separately from canon/history. This proposed shape is **illustrative pending a versioned validation schema**, not a claim that it already passes `atlas.schema.json`:

```json
{
  "territoryOverlay": {
    "enabledByDefault": true,
    "fallbackRadiusFraction": 0.08,
    "opacityMaxPerCantum": 0.16,
    "opacityCapTotal": 0.22,
    "fieldThresholdStart": 0.35,
    "fieldThresholdEnd": 0.65,
    "fallbackColor": "#73808C",
    "cantums": {
      "can_0001": { "color": "#638FBD", "radiusLY": 24 }
    }
  }
}
```

The color and radius for `can_0001` here apply **only to the noncanonical test dataset**. Final UI palette and any approved canonical Cantum colors belong to Milestone 5. Use finite positive radii, bounded alpha values, valid colors, and `0 ≤ thresholdStart < thresholdEnd`; enforce this in presentation validation. **Do not add arbitrary presentation keys to canonical `sector.json` without updating its schema.**

## 5. Runtime and performance contract

- The public viewer only **reads** JSON; no local editor or server write path is required.
- Rebuild contributor lists/field geometry when the **selected year, published system positions, membership history, palette or configured radius** changes. **Do not** recalculate affiliation from an InfoCard, use unreleased details, or treat the changing viewport as a geopolitical event.
- Pan/zoom may reproject a cached field texture or use a GPU shader in world coordinates; it must preserve deterministic region boundaries. An offscreen/low-resolution field with smooth interpolation is acceptable if edges look clean at ordinary zoom levels. Avoid naive full-resolution CPU loops over every system for every animation frame.
- Precompute bounding rectangles or cull negligible contributions outside a safe multiple of each radius for performance. Cache reusable data; update only when necessary.
- Missing/stale/malformed style settings must not crash or block star navigation: warn, use safe defaults, or disable the overlay while preserving all map markers. Invalid historical membership is a data-validation issue, not a reason to invent a bubble.
- Do not expose hidden records through theme keys, debug text, hover targets, or offline cache files.

## 6. Acceptance tests and visually important cases

1. **Two-system demonstration:** With `can_0001` and the existing `examples/demo_atlas` fixture, before 210 A.E. there are **no** eligible Cantum bubbles; at 210–329 only System A contributes; at 330+ both System A and B contribute. When `radiusLY: 24`, their field should join. Both stars are clearly drawn above the shaded region. Their interstellar Jump Gate and Jump Hole routes remain visible above it.
2. **Zoom stability:** Zooming from wide to close does not change physical radius in `ly` or change which groups merge. Pan cannot move bubbles away from systems.
3. **Disconnected holdings:** Two widely separated systems of the same Cantum remain two islands rather than being joined by a fabricated corridor.
4. **Multiple Cantums (additional noncanonical test):** Different Cantums retain separate fields and IDs. At overlap, colors blend deterministically, stay subdued and do not cover system labels. No single Cantum is silently assigned the contested area.
5. **Historical transfer:** Change a demo system's effective `cantumHistory` at a test year. The contributor leaves the original Cantum field and enters the new Cantum field; neither the spatial coordinates nor the entity ID changes.
6. **Historically unknown/unplaced:** A system not yet discovered is absent from the field; a known unplaced system remains catalogued but contributes no bubble; an undeveloped positioned known system **does** contribute a bubble.
7. **Overlay toggle:** Hide/show shading without altering navigation, route rendering, search, timeline or InfoCards.
8. **2D/3D layering:** In both camera modes, terrain shading cannot obscure, intercept clicks on, or draw in front of the stars, labels, routes or selection markers.
9. **Valid JSON only:** Optional public presentation config is checked by its own schema/tests before deployment. Current `schemas/atlas.schema.json` v1.0.0 and canonical political files remain unchanged until an approved coordinated extension.
10. **Build integrity:** Production bundle contains only explicitly released JSON and safe palette values. No private region/lore notes or local editor code.

## 7. Explicit future possibilities (not required for initial viewer)

- Manually drawn exact political borders, if desired, as a **separate selectable overlay** with independently dated geographic shapes. These do not replace the default soft influence layer without explicit approval.
- Per-system bubble radius/weighting, narrative annotations, regional exceptions, opacity/contour fine-tuning, and export-friendly poster mode.
- A local-only debug overlay displaying source systems and their contribution radii, if useful when tuning the visual field in VS Code.

---

**Implementation note:** This contract defines **approved behavior** plus **proposed initial numeric style defaults**. Tune the numbers against real screenshots in Milestone 5 without altering who belongs to which Cantum, the field's world-space nature, public/private separation or layer order.
