# Velara Atlas — Visual Asset Policy and Fallback Contract

**Version:** 1.0.0 · **Milestone 5 companion** · **2026-10-15**  
**Status:** Rendering and fallback **behavior approved**; exact asset identifiers and nullable-icon data fields require a deliberate **versioned schema migration**. Do not modify existing canonical JSON on the basis of this document alone.

## 1. Separation of content and presentation

- `entityType`, `objectType`, stable ID, position, system affiliation, and `connections.json` define **what an object is and does**. Styling never changes its physical position, historical record, or gate reachability.
- `visualVariant` (proposed) selects a default visual subclass, such as `rocky` or `shipyard`.
- `icon` (proposed nullable override) points to a creator-supplied **public asset**, when present. `null` means use the default. Older existing icon identifiers must be migrated or mapped, not discarded.
- The renderer consults one central **visual registry** so the default paths do not need to be copied into every object's JSON.
- For the MVP, **no object is required to have a custom texture, sprite or 3D model**.

## 2. Approved defaults by object kind

| `entityType` / `objectType` | Visual variant | 2D top-down | 3D perspective |
|---|---|---|---|
| Celestial / `star` | default | Star marker | Light-emissive sphere |
| Celestial / `planet` | `rocky` | Rocky planet SVG | Procedural rocky sphere |
| Celestial / `planet` | `gas` | Gas-giant SVG | Sphere with modest bands |
| Celestial / `planet` | `water` | Water-planet SVG | Blue/water sphere |
| Celestial / `planet` | unknown/unspecified | **Neutral planet SVG** | Neutral unclassified sphere |
| Celestial / `moon` | default | Moon SVG | Smaller procedural sphere |
| Celestial / `planetoid` or `asteroid` | default | Small-body SVG | Small simplified geometry |
| Station | `regular` | Standard station SVG | Camera-facing billboard |
| Station | `shipyard` | Shipyard SVG | Camera-facing billboard |
| Station | unknown/unspecified | Neutral station SVG | Neutral billboard |
| `gat` (short-range) | default | Short-range gate SVG | Anchored billboard |
| `gat` (interstellar) | default | Jump Gate SVG | Anchored billboard |
| `jhl` | default | Jump Hole SVG | Restrained anomaly/billboard effect |

Gate classifications must follow the **actual existing schema fields** when implementing the registry, not be guessed from prefix `gat` alone (both short-range and interstellar gates share it). An invalid or unknown type gets a neutral unknown symbol plus validation warning.

**Fallback order:**

1. Valid custom `icon` override, when supported and explicitly provided.
2. Known `entityType` + `objectType` + optional `visualVariant` registry default.
3. Generic original `unknown.svg` navigational symbol if the registry key is unsupported or the default asset fails.
4. A built-in vector/primitive drawing fallback if even `unknown.svg` cannot be loaded.

Never show a broken-image UI or invent a celestial classification. A planet with no approved subtype should use neutral planet styling. `icon: null` is not an indication of missing worldbuilding data; it means "use the normal renderer".

## 3. Proposed public asset paths

```text
public/
  assets/
    nexus/
      mcr-insignia.png          # owner-supplied and cleared for public distribution
      nexus-form.png            # owner-supplied front-facing reference/optional fallback use
      nexus-side-profile.png    # PENDING: user-supplied side-profile PNG
    icons/
      celestial/
        star.svg
        planet-rocky.svg
        planet-gas.svg
        planet-water.svg
        planet-unknown.svg
        moon.svg
        small-body.svg
      stations/
        regular.svg
        shipyard.svg
        unknown.svg
      navigation/
        short-range-gate.svg
        jump-gate.svg
        jump-hole.svg
      generic/
        unknown.svg
    textures/                  # optional; avoid large assets in first prototype
```

This directory tree is a **target layout**. The actual icons and NEXUS side-profile image are **not included** in the Milestone 5 documentation package. Empty directories do not have to be committed. Do not fabricate an artist-approved NEXUS side profile from the front-facing image.

Use original, scalable, locally bundled SVGs for general navigation. Do not hotlink third-party assets. Resolve assets using the application's deployment base (e.g., Vite's `import.meta.env.BASE_URL` or its equivalent): GitHub Pages often serves the app under `/Velara_Atlas/`, not `/`.

## 4. Registry example (conceptual; JS implementation is not yet committed)

```javascript
const visuals = {
  celestial_body: {
    star: 'icons/celestial/star.svg',
    planet: {
      rocky: 'icons/celestial/planet-rocky.svg',
      gas: 'icons/celestial/planet-gas.svg',
      water: 'icons/celestial/planet-water.svg',
      unknown: 'icons/celestial/planet-unknown.svg'
    },
    moon: 'icons/celestial/moon.svg',
    planetoid: 'icons/celestial/small-body.svg',
    asteroid: 'icons/celestial/small-body.svg'
  },
  station: {
    regular: 'icons/stations/regular.svg',
    shipyard: 'icons/stations/shipyard.svg',
    unknown: 'icons/stations/unknown.svg'
  },
  navigation: {
    short_range_gate: 'icons/navigation/short-range-gate.svg',
    jump_gate: 'icons/navigation/jump-gate.svg',
    jump_hole: 'icons/navigation/jump-hole.svg'
  },
  unknown: 'icons/generic/unknown.svg'
};
```

These are **public-base-relative registry keys** for the renderer to resolve, **not** required fields in every world record. `visualVariant` is optional for 3D geometry; the renderer's neutral fallback remains mandatory.

## 5. Controlled JSON Schema migration required

The actual current **JSON Schema v1.0.0** requires `icon` to be a nonempty string and has not approved `visualVariant`. Therefore objects with `icon: null` or `visualVariant` **do not yet validate**. Do **not** put those proposed fields into `public/data` or the v1.0.0 demonstration fixtures before an agreed, versioned update and validator test.

When implementing the viewer, Codex should propose one coordinated additive schema migration, preserving compatibility and historical behavior:

1. Define optional `visualVariant` enum values for relevant celestial/station subtypes, including `unknown` as neutral.
2. Make `icon` either a validated optional custom override or `null`; preserve/translate the current icon identifiers (`planet_rocky`, etc.) using a compatibility adapter or deliberate fixture migration.
3. Disambiguate gate visual type from schema's actual short-range/interstellar designation; do not infer it only from prefix.
4. Update `schemas/` definitions, affected `examples/`, scripts, tests, `docs/DATA_MODEL.md`, and the declared schema version **together**. Do not rename stable entity IDs.
5. Include absent, null, invalid override path, unknown variant, and missing SVG tests. Validate allowed relative paths; reject traversal (`..`), absolute paths, unapproved remote URLs and scriptable SVG payloads if accepting creator-provided arbitrary SVG.
6. Require no change to the Milestone 3 camera, timeline, connection rules, publication filtering or Cantum-overlay physics.

If the user chooses to keep the existing string `icon` field longer, implement a non-breaking registry adapter first and postpone nullable icon changes. Either path is acceptable if explicitly documented. The first viewer prototype should not be blocked on elaborate final SVG artwork.

## 6. Scope, accessibility, and performance

- Do not request unnecessary high-poly geometry, photorealistic textures, full models or texture downloads for the MVP.
- Maintain visual marker hit areas independently from icon pixel dimensions; hovering/tapping small objects must remain workable.
- Test 1x and 2x/high-DPI displays, browser zoom and mobile drawer layouts.
- In 3D mode, billboards face the camera **without changing** their world positions and are depth-aware enough not to misleadingly obscure important geometry.
- Do not create unbounded GPU textures/sprites for each record; reuse geometry and materials where practical.
- Fallbacks must be visually neutral, non-disruptive and transparent about unknown visual subtypes.

**Authority:** This document governs appearance and fallback. `docs/DATA_MODEL.md` and `schemas/` govern the currently valid stored JSON, until an approved migration changes them.
