# Velara Atlas — Visual Asset Policy and Fallback Contract

**Version:** 1.0.0 · **Milestone 5 companion** · **2026-10-15**  
**Status:** Rendering/fallback policy approved. Phase 3 implements fourteen original starter SVGs, the explicit icon registry and procedural physical models using the existing noncanonical v1.2 data. Final artistic refinement and NEXUS portrait integration remain separate work; this policy does not authorize canonical changes.

## 1. Separation of content and presentation

- `entityType`, `objectType`, stable ID, position, system affiliation, and `connections.json` define **what an object is and does**. Styling never changes its physical position, historical record, or gate reachability.
- Optional `visualVariant` selects a supported visual subclass: planets use `rocky`, `gas`, `water`, `unknown`; stations use `regular`, `shipyard`, `unknown`. Missing subtype must remain visually neutral. These are data conventions, not inferred lore.
- The required `icon` key accepts null, a validated registry identifier, or a safe `custom/...` relative SVG/PNG/WebP path. Null requests default rendering; it does not mean an unknown identity. Schema acceptance does not mean the current prototype loads custom artwork.
- The explicit renderer registry centralizes default paths instead of duplicating them in every object's JSON. Preserve existing supported registry identifiers when extending it.
- For the MVP, **no object is required to have a custom texture, sprite or 3D model**.

**Checkpoint 4.1 scale policy:** [The scale contract](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md)
defines 1 CNU = 10,000 km and optional positive celestial `physicalDiameterKm`.
Physical size is authored independently of icon/category/variant and zoom; no
type multiplier is permitted. Future camera-projected physical models and distant
SVG proxies share exact XYZ and transition continuously. Category apparent minima
are centralized renderer settings, never enlarged physical geometry or per-record
fields. Unknown measurements use a neutral navigational fallback. Stations and
all gate/hole categories initially have fixed apparent icons; megastructure
models require separate approval. Phase 3 implements the scale contract; its
starter assets are functional navigation symbols, not final commissioned art.
Stellar glow and hit targets remain separate from size.

## 2. Approved defaults by object kind

| `entityType` / `objectType` | Visual variant | 2D top-down | 3D perspective |
|---|---|---|---|
| Celestial / `star` | default | Star marker | Light-emissive sphere |
| Celestial / `planet` | `rocky` | Rocky planet SVG | Procedural rocky sphere |
| Celestial / `planet` | `gas` | Gas-giant SVG | Sphere with modest bands |
| Celestial / `planet` | `water` | Water-planet SVG | Blue/water sphere |
| Celestial / `planet` | unknown/unspecified | **Neutral planet SVG** | Neutral unclassified sphere |
| Celestial / `moon` | default | Moon SVG | Authored physical-size sphere; neutral proxy when size unknown |
| Celestial / `planetoid` or `asteroid` | default | Small-body SVG | Authored physical-size simplified geometry; neutral proxy when size unknown |
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
      nexus-side-profile.png    # supplied; integration is outside Phase 3
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

The fourteen listed SVG icons now exist as the original Phase 3 starter library.
Existing NEXUS PNG files are untouched and are not copied by this build. Textures
remain optional/deferred. Do not fabricate an artist-approved NEXUS side profile.

Use original, scalable, locally bundled SVGs for general navigation. Do not hotlink third-party assets. Resolve assets using the application's deployment base (e.g., Vite's `import.meta.env.BASE_URL` or its equivalent): GitHub Pages often serves the app under `/Velara_Atlas/`, not `/`.

## 4. Registry category mapping (implemented by `src/viewer/icon-registry.mjs`)

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

## 5. Current schema support and remaining renderer work

The approved v1.1 migration already added nullable icons and visual variants;
v1.2 retains them. `schemas/atlas.schema.json` and its wrappers validate current
demo records; the frozen v1.1 schema independently preserves regression cases.
The `icon` property remains required on local objects. Relative custom paths must
match `custom/` plus safe path segments and an allowed extension; traversal,
absolute paths and arbitrary remote URLs are not schema-valid.

Phase 3 uses structural kind/variant mapping for SVG proxies and procedural model
colors. Known celestial geometry uses authored physical radius; unknown diameters
stay proxies. Stations/gates/holes have fixed apparent symbols. The same projected
button owns image, caption and identity, so billboards face the screen without
moving their XYZ anchors. Supported registry overrides and defaults fall back to
generic SVG then built-in primitive. No custom file sources are currently approved;
unrecognized or unsafe authored paths fall back without being fetched.

The fourteen navigation `ICON_PATHS` entries remain unchanged. Stage 2 adds only
`SIGIL_PATHS = ['cantums/test-cantum-a.svg']`, through a separate closed
`sigil-registry.mjs` mapping and static Vite URL. The asset is an original,
noncanonical development fixture, not an MCR political emblem. Cantum `sigil`
null/omission/unknown ID means no image; loading failure removes the image and
retains the name without any generic fallback or empty slot. IDs never construct
paths or network URLs. The existing navigation-icon fallback chain is unchanged.

The build permits exactly these fifteen SVGs through the combined explicit inventory.
`publicDir: false` remains mandatory. The build validates a narrow SVG element
profile and requires exact approved asset content/name in output; no general SVG
sanitization or arbitrary custom loader is claimed. This preserves canonical and
private-data scans. [Scale/transition and camera details](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md)
and [browser/build evidence](CHECKPOINT_4_PHASE3_RESULTS.md) record implementation.

No additional schema migration or canonical change is needed for the already
supported null/variant fields. Any future stored-shape extension requires its
own coordinated schema, validator, fixture and data-model update. Keep the
Checkpoint 3.6 chart/layout, history, connection and influence contracts intact.

## 6. Scope, accessibility, and performance

- Do not request unnecessary high-poly geometry, photorealistic textures, full models or texture downloads for the MVP.
- Maintain visual marker hit areas independently from icon pixel dimensions; hovering/tapping small objects must remain workable.
- Test 1x and 2x/high-DPI displays, browser zoom and mobile drawer layouts.
- In 3D mode, billboards face the camera **without changing** their world positions and are depth-aware enough not to misleadingly obscure important geometry.
- Do not create unbounded GPU textures/sprites for each record; reuse geometry and materials where practical.
- Fallbacks must be visually neutral, non-disruptive and transparent about unknown visual subtypes.

**Authority:** This document governs appearance/fallback policy; [DATA_MODEL.md](DATA_MODEL.md) and schemas govern valid JSON. [Viewer behavior](VIEWER_SPECIFICATION.md) governs the Checkpoint 3.6 square chart and overlays. Canonical public v0.1 records remain unchanged pending separately approved migration.

## 7. Planned Checkpoint 4.2 PNG / UI SVG / audio admission

**Planning-only addition.** Existing production policy still has
`publicDir: false`, exact approved file admission, fourteen navigation
icons plus the separately registered Test sigil, limited SVG profile and
the audited bundle. The approved NEXUS PNGs and new reticle SVG exist
as sources but are not yet admitted to the release build.

| Phase | Approved source or pending asset | Purpose |
| --- | --- | --- |
| 4.2A/B/G | `public/assets/nexus/mcr-insignia.png`, `nexus-form.png` and `nexus-side-profile.png` | Header, InfoCard, archival and short opening contexts; retain original artwork. |
| 4.2C | `public/assets/ui/nexus-reticle.svg` | Final immutable 128×128 artwork for cyan hover and static gold selection. |
| 4.2H | Creator-approved prerecorded welcome and fallback clips, filenames/formats TBD | Two spoken situations; never publish drafts. |
| 4.2I | A few creator-approved short UI cue files, names/formats TBD | Playback integrated last and respecting mute. |

For **each authorized phase**, verify the concrete asset and publication
rights. Add exact trusted source imports/registry paths, never wildcard
`public/` copying, dynamic user-controlled filenames or remote
hotlinks; preserve GitHub Pages `/Velara_Atlas/` URL correctness.
Admit UI SVG via an **independent restricted profile/exact-asset rule**
instead of weakening `scripts/svg-assets.mjs` starter icon validator.
Any recoloring must preserve exact reticle linework.

Extend `vite.config.mjs` source allowlist and
`scripts/audit-demo-build.mjs` output tests **only** for approved additions:
audited binary extension/bytes or hashes, allowed names/URLs, size and
completeness, resource reachability, no extra outputs, and negative
canonical/private/external-input checks. Existing text-only audit reads
must be adapted to correctly handle PNG/audio binary data rather than
treating arbitrary bytes as UTF-8. Verify missing/corrupt-asset fallback,
base-relative loading, release-check results and browser requests.
Preserve originals when generating optimized derivative images.

Every file committed to this public repository is public even if unused
by the app. Audio files, voice scripts and any sound effects require
creator approval before Git admission. 4.2G has **no playback**,
4.2H implements voice/control, 4.2I implements SFX last. Exact file
formats, audio preferences and reticle displayed sizes remain phase
review decisions, not established implementation. See
[DEVELOPMENT_ROADMAP](DEVELOPMENT_ROADMAP.md#checkpoint-42--nexus-visual-and-audiovisual-completion-planned).
