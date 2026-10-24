# Velara Atlas — Visual Asset Policy and Fallback Contract

**Version:** 1.0.0 · **Milestone 5 companion** · **2026-10-15**  
**Status:** Rendering/fallback policy approved. Phase 3 implements fourteen original starter SVGs, the explicit icon registry and procedural physical models using the existing noncanonical v1.2 data. Completed, creator-approved 4.2A (2026-10-23) adds exact two-PNG admission for header/ordinary InfoCard branding; completed 4.2B adds the specifically approved third PNG and universal UI content below; completed 4.2C adds independent exact UI-reticle admission. Later artistic refinement remains separate work. This policy does not authorize canonical changes.

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
NEXUS PNG originals remain untouched. Completed 4.2A explicitly bundles only
`mcr-insignia.png` and `nexus-side-profile.png`; subsequent 4.2B explicitly admits
the existing `nexus-form.png` original for archival use (Section 9).
Textures remain optional/deferred. Do not fabricate a NEXUS side profile.

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

The starter/sigil inventory permits exactly these fifteen SVGs. Completed 4.2C
adds one separately verified UI reticle (Section 10), never through this profile.
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

**Original planning addition; 4.2A–C are now complete and creator-approved.** Production retains
`publicDir: false`, exact approved file admission, fourteen navigation
icons plus the separately registered Test sigil, limited SVG profile and
the audited bundle. The two 4.2A PNGs and specifically approved front-facing
`nexus-form.png` are admitted. 4.2C additionally admits the exact original UI
reticle; completed 4.2G reuses the existing PNGs for its opening. Audio remains excluded.

| Phase | Approved source or pending asset | Purpose |
| --- | --- | --- |
| 4.2A — complete/creator-approved | `public/assets/nexus/mcr-insignia.png`, `nexus-side-profile.png` | Header and ordinary InfoCards; exact source/output verification below. |
| 4.2B — complete/creator-approved | Existing approved `nexus-form.png` | Archival presentation; exact third-PNG admission, Section 9. |
| 4.2G — complete/creator-approved | Existing `nexus-form.png` and `mcr-insignia.png` | Opening reuses exact bundled originals; one additional exact UI-content JSON module, no new binary assets or audio. |
| 4.2C — complete/creator-approved | `public/assets/ui/nexus-reticle.svg` | Immutable 128×128 artwork, independent pinned admission; cyan hover/static gold selection. |
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
canonical/private/external-input checks. The 4.2A audit now handles approved PNGs
as binary buffers; future audio needs its own explicitly approved binary handling,
without treating arbitrary bytes as UTF-8. Verify missing/corrupt-asset fallback,
base-relative loading, release-check results and browser requests.
Preserve originals when generating optimized derivative images.

Every file committed to this public repository is public even if unused
by the app. Audio files, voice scripts and any sound effects require
creator approval before Git admission. 4.2G has **no playback**,
4.2H implements voice/control, 4.2I implements SFX last. Exact file
formats and audio preferences remain future phase review decisions. Reticle
display sizes are approved in completed 4.2C below. See
[DEVELOPMENT_ROADMAP](DEVELOPMENT_ROADMAP.md#checkpoint-42--nexus-visual-and-audiovisual-completion-planned).

## 8. Implemented Checkpoint 4.2A PNG admission

**Complete and creator-approved, 2026-10-23.** `app-shell.mjs` uses two literal
local Vite imports for the original PNGs. `vite.config.mjs` adds only those exact
paths to the existing module/filesystem allowlists; `publicDir: false` and
`assetsInlineLimit: 0` remain unchanged. Vite emits separate hashed resources
with `/Velara_Atlas/assets/` URLs. There is no general PNG loader or wildcard
permission to publish files from `public/`.

`scripts/png-assets.mjs` defines the two source names and pins their SHA-256
hashes. Build-start verification rejects changed source bytes. The output audit
reads PNGs as buffers, requires byte equality with the hash-verified originals
and the matching approved filename stem/hash-suffix shape, rejects duplicates,
and requires both images. PNGs never enter UTF-8 content scans. HTML/JS/CSS/SVG
retain the textual canonical/private/source-map scans and selected-Demo identity
checks. Resource edges include PNGs; each approved PNG must be reachable from
`index.html`, including structural audits without a selected dataset. Full
selected-Demo audits continue to require all output files to be reachable.

The original fourteen navigation SVGs plus the Test Cantum sigil still require
the unchanged restricted SVG profile and exact content/name inventory. The
reticle, front-facing NEXUS image, unapproved images, audio and other extensions
are not admitted. Dataset inventory validation and module completeness remain
mandatory. These checks enforce the named inventory, not a general detector of
all possible secrets in arbitrary source code.

Final production inventory: 26 files (HTML, seven JS, one CSS, fifteen SVGs and
two PNGs), 2,492,994 bytes. PNGs are `mcr-insignia-r6lpjvi0.png` (377,504 bytes)
and `nexus-side-profile-r9IZRR3k.png` (1,373,589 bytes); both load with HTTP 200
under `/Velara_Atlas/`. Hash-suffixed output names are build results, not authored
runtime paths. Tests reject missing/corrupt/truncated/appended, extra/renamed,
duplicate and unreferenced PNGs, wrong-base HTML URLs and unsupported image/audio
outputs; protected-input/output checks remain. Browser checks cover image-error
fallback, responsive cards and keyboard focus. Original image bytes are unchanged.
The 1.75 MB PNG addition and existing chunk-size advisory remain limitations;
physical-device, non-Chromium and assistive-technology certification are deferred.

## 9. Implemented Checkpoint 4.2B content and PNG admission

**Complete and creator-approved, 2026-10-23.** The creator explicitly approved
the unchanged existing front-facing `public/assets/nexus/nexus-form.png` for the
archival presentation. This correction supersedes its earlier reserved-only status
and initial two-PNG/reused-side-profile scope:
the exact PNG registry now includes **three** originals, while the header insignia
and ordinary InfoCard side-profile retain their approved use. The existing source
SHA-256 pins, binary output/name comparisons, completeness, duplicate and
reachability checks apply equally to the third image. Original bytes are never
changed; the full front-facing image is contained without cropping or stretching.
At the 4.2B closeout, the reticle, audio and opening screen remained unauthorized
and excluded; the later 4.2C/G sections record their narrowly approved additions.

Universal archival `title`, `subtitle` and `message` live only in
`public/content/nexus/fallback-data.json`; see [the content contract](DATA_MODEL.md#universal-nexus-ui-content--42b-correction).
`nexus-content.mjs` statically imports that exact JSON and the front-facing PNG.
Main loads the module inside its technical-error boundary so a missing, malformed
or invalid configuration cannot become an archival notice. The shared pure
validator requires exactly three nonempty strings and preserves their bytes as
text, including punctuation/spacing. All rendered strings use `textContent`.

The Vite allowlist admits only this exact content-file path. A focused input hook
rejects symlink/reparse redirection, validates the JSON before transformation,
checks production snapshot bytes and requires the module in the build. Demo
registration/module completeness and canonical/private-output checks remain.
`publicDir: false` remains; JSON is bundled as code, not copied or fetched through
a general content endpoint. Changing the three values requires no world/JS edit.

The third source SHA-256 is
`ed1bf244e1d0939ebd962a6e5957bb5d8dfc280de06b2c732b20984b527a1b67`.
Final audit: 28 files (HTML, eight JS, one CSS, fifteen exact SVGs and three exact
PNGs), 4,484,376 bytes. The originals total 3,737,805 PNG bytes. Production URLs
`/Velara_Atlas/assets/mcr-insignia-r6lpjvi0.png`,
`/Velara_Atlas/assets/nexus-side-profile-r9IZRR3k.png` and
`/Velara_Atlas/assets/nexus-form-DP6uMQr-.png` all return HTTP 200. Output names
are build results, not authored paths. Missing, corrupted, unapproved, duplicate
and unreferenced output rejection remains tested. No artwork or SVG policy changed;
no reticle/audio, canonical/private content or separate JSON output was admitted.
The prior Section 8 inventory and limits remain the historical 4.2A evidence.

## 10. Implemented Checkpoint 4.2C UI SVG admission

**Complete and creator-approved, 2026-10-23.** `target-reticle.mjs` uses a literal
Vite-compatible URL for only `public/assets/ui/nexus-reticle.svg`. Its 7,620 bytes
equal the definitive original in `6b4bc5f92e1ef7fc7fd1740da5cc3d2217b8a1f0`.
`scripts/ui-reticle-asset.mjs` pins SHA-256
`8a2312f92187419eac9facdff32c687ebeb13427762d1a1acc0671a5157e3573`.
Vite validates this source at build start, asset-module load and bundle generation,
and admits only its exact module/development filesystem path. `publicDir: false`
and `assetsInlineLimit: 0` remain. The existing 64×64 starter validator/registry
is unchanged and still rejects the 128×128 UI reticle; no generic SVG exemption exists.

The production audit separately compares exact reticle buffer bytes, requires a
`nexus-reticle-[A-Za-z0-9_-]+.svg` output name, exactly one occurrence and
application reachability even in structural audit mode. Mutated/missing,
duplicate, wrongly named, unapproved and unreferenced assets are rejected in
focused actual-build regressions. The existing fifteen SVGs, three PNGs, universal
fallback JSON, registered-module completeness, subpath, private/Canon/source-map
and unsupported-output checks remain intact. Earlier sections retain the 4.2A/B
inventories as historical evidence; this section supersedes their reticle exclusion.

Final audit: **29 files, 4,494,160 bytes**: HTML, eight JS, one CSS, sixteen SVGs
(fourteen navigation, one Test Cantum sigil, one UI reticle) and three PNGs.
`/Velara_Atlas/assets/nexus-reticle-wjkQVr7N.svg` returns HTTP 200 with unchanged
bytes; the hash-suffixed name is a build result, not an authored runtime path.
CSS alpha masking changes only presentation hues and retains source opacity and
linework. No original artwork, other media, audio or extra dataset content was
introduced. Existing bundle-size and cross-browser/device verification limits remain.

## 11. Implemented Checkpoint 4.2D presentation minima

**Complete and creator-approved, 2026-10-23.** System View minimum diameters are
42px star, 36px gas planet, 30px other planet, 24px moon, 21px small body, 18px
structure and 15px short-range gate. The central `visual-config.mjs` table is
their sole runtime definition. Existing category artwork/mapping, neutral
unknown-size fallback, physical dimensions/geometry, 1.35 handoff, projection,
hit areas and independent 60/72px reticles are unchanged. Sector remains 8px.
The [scale amendment](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md#checkpoint-42d-visual-minimum-amendment--approved-2026-10-23)
preserves the original initial values and explains the apparent/physical boundary.

No asset admission or production-audit rule changed. The inventory remains
fourteen navigation SVGs, one Test Cantum sigil, one NEXUS reticle and three
approved PNGs: 29 output files, 4,494,160 bytes. Exact source/output verification,
subpath URLs, completeness/reachability and private/Canon restrictions remain.
The committed `public/assets/nexus/nexus-fallback-message.mp3` remains reserved
for separately authorized 4.2H, byte-identical to baseline `3a1bb44` (305,746 bytes,
SHA-256 `9815ff5b01120100e8825aebb1b2a43a38329c82c8ec020b0cca0bf0011aab72`).
It is not imported, emitted or played. Tests reject its exact source path and
MP3 outputs; browser checks observe zero audio requests. A source-repository file
does not grant application publication or playback permission.

## 12. Implemented Checkpoint 4.2G opening reuse and content admission

**Complete and creator-approved, 2026-10-24.** The opening reuses the already
admitted original `nexus-form.png` and `mcr-insignia.png` through static imports
in the existing NEXUS module. Vite shares their URLs with existing uses; no
second copy, new binary asset, image transform or registry exception is added.
All original image bytes and pins remain unchanged. The ordinary InfoCard keeps
its side-profile; the archival presentation and fallback JSON remain unchanged.

Only `public/content/nexus/opening-data.json` is added to the exact content input
allowlist. It contains exactly nonempty `title`, `subtitle`, `message` strings,
validated independently from the existing fallback. The closed two-file audit
rejects missing/malformed content, symlink/reparse redirects and production bytes
changing during a build, and requires both actual modules in generated chunks.
Strings use `textContent`; no arbitrary content root, world field or runtime
JSON fetch is introduced. Edit only this JSON and rebuild for introduction edits;
the [approved script](DEVELOPMENT_ROADMAP.md#phase-42g--nexus-atlas-opening) is public
UI wording for future separately authorized voice production.

`publicDir: false`, exact hash-pinned PNG/SVG sources, binary output/name equality,
duplicate/completeness/reachability checks and private/Canon/data restrictions
remain intact. Production contains sixteen SVGs (fourteen navigation, one sigil,
one reticle) and three PNGs, with no raw UI JSON or new media. No audio path is
admitted. The reserved fallback MP3 remains byte-identical and absent from the
bundle; entry choices record only in-memory intent, with no playback or storage.
Earlier phase-specific exclusions above describe their historical closeouts;
this section supersedes opening-only deferment, without authorizing H–I.
