# Checkpoint 4.1 — Celestial dimensions and scale contract

**Status:** Creator-approved design and reviewed Phase 1 schema/docs/tests.
Phase 2 is explicitly authorized for noncanonical demo expansion, existing
archival fallback coverage, tests and documentation only. Physical rendering and
Phase 3/4 remain unauthorized. Creator review is required between phases.

## Units and authored geography

**1 Continuance Navigation Unit (CNU) = 10,000 kilometers**, universally across
Continuance star systems. System XYZ positions and map dimensions remain in CNU;
sector XYZ positions remain in light-years. This definition does not rescale any
existing position, map extent, zone, route, navigation boundary or connection.

Each system may have different map dimensions. The established square X/Z chart
requirement remains; Y extent is authored independently. A star need not occupy
the chart center. Chart framing and star placement are independent. The system
grid, A–H/1–8 annotations and double-headed H8 cell-width measurement remain on
absolute Y = 0 CNU, controlled together by Coordinate grid in either camera mode.
Sector grid behavior is unchanged. No orbital animation, automatic orbital
placement or gravitational simulation is authorized.

## Celestial measurement field

`physicalDiameterKm` is optional on `entityType: "celestial_body"` records for
every existing celestial `objectType`: star, planet, moon, planetoid, asteroid,
comet and other. It is a static authored physical measurement, not a dated
measurement history or a presentation setting.

| Property | Contract |
| --- | --- |
| JSON type | `number`, with `exclusiveMinimum: 0` |
| Values | Positive and finite; fractional kilometers are valid |
| Unknown | Omit the property; explicit `null` is invalid |
| Applicability | Celestial bodies only; no new field on stations, gates, Jump Holes or zones |
| Conversion | `diameterCNU = physicalDiameterKm / 10000` |
| Camera independence | The authored diameter and physical geometry do not change with zoom |

A fictional 600,000-km-diameter star has a physical model diameter of 60 CNU
(radius 30 CNU). This is an illustrative calculation, not an assigned demo or
canonical measurement. Never infer a diameter from `objectType`, `visualVariant`,
an icon, or a navigation boundary. There are no universal physical size
multipliers by category. Gas giant remains `objectType: "planet"` with
`visualVariant: "gas"`.

`navigation.boundaryRadiusCNU` remains an invisible navigation-authoring radius,
not a physical celestial radius. Zone dimensions and transport geometry retain
their separate meanings. The new field introduces no physical-body containment,
collision or gravitational validation: existing object-position, navigation and
zone-intersection rules remain unchanged.

## Compatibility and implementation boundary

The field is an additive extension to the current `schemas/atlas.schema.json`
celestial definition, shared by release `systemDetail` and `systemAuthoring`.
The schema identifier, wrappers and `schemaVersion: "1.2.0"` remain unchanged.
Every previously valid v1.2 record without this property remains valid. Older
copies of the strict v1.2 schema will reject records using the new property;
authors and validators must use the current contract together before Phase 2.
No migration or rewrite of existing records is required.

JSON cannot represent NaN or infinity; the existing strict Ajv validator also
rejects nonfinite JavaScript values during in-memory validation. Frozen v1.1
schema/fixtures, frozen v1.2 scenarios and canonical public v0.1 data are unchanged.

Phase 1 adds no runtime conversion or new resolver behavior. The current
historical resolver does not yet forward this field to resolved viewer objects,
and temporary markers do not consume it. Phase 3 must pass through the released
measurement without changing historical eligibility, names, IDs or authored XYZ.

## Planned renderer contract — Phase 3 only

Both 2D and 3D use identical authored XYZ positions and physical diameters.
Project physical geometry with the active camera, then apply the navigational
representation policy in CSS pixels:

```text
displayDiameterPx = max(projectedPhysicalDiameterPx, minimumDisplayDiameterPx)
```

This is an apparent representation minimum; never enlarge the underlying physical
geometry to meet it. Keep category minima centralized in future renderer
configuration, not in object records. The presentation-default priority is:

**STAR → GAS GIANT → REGULAR PLANET → MOON → ASTEROID / PLANETOID →
STATION / JUMP GATE → SHORT-RANGE GATE.**

This guideline concerns legibility, not restrictions on real physical diameters.
Water/rocky/unknown planets and other celestial categories retain their supported
classifications; unspecified styles use a neutral fallback. Numeric pixel minima
and transition thresholds remain to be tuned and verified in later phases.

Far-away bodies may use SVG navigational proxies. In perspective, proxies face
the camera while remaining anchored at the exact physical position. As a body's
projection becomes naturally legible, transition continuously to its correctly
scaled celestial model. Avoid size jumps, simultaneous duplicate disks and
selection inconsistencies; model and proxy share one permanent object identity.
The same size contract applies in top-down view. Stellar corona/glow is separate
from the physical diameter and must not redefine it.

Unknown diameters use a neutral category navigational representation with the
configured apparent minimum, without assigning a guessed world-space diameter
or claiming a correctly scaled physical model. Desktop/touch hit targets remain
independently usable and keyboard/catalogue access survives representation changes.

Stations, Jump Gates, Jump Holes and short-range gates initially use fixed
apparent navigational icon sizes appropriate to their category. Physical diameters
are not introduced for these structures. Detailed megastructures, including
Dyson-sphere-scale constructs, require a separate approved extension.

## Phased delivery and review gates

1. **Phase 1 — reviewed and approved:** scale specification, authoritative documentation,
   optional celestial schema field and focused schema tests. Stop for review.
2. **Phase 2 — currently authorized noncanonical demo expansion:** preserve existing IDs,
   histories, navigation links, zones and system identities. Keep `sys_0001`'s
   established geography and 100,000-CNU chart; make `sys_0002` a compact developed
   system with a smaller chart, offset star and varied diameters; make `sys_0003`
   a larger sparse frontier chart with a peripheral star and small bodies.
   Distribute representative stars, rocky/gas/water planets, moons, asteroids
   and planetoids without requiring every type in every system. Use plausible
   fictional diameters informed by astronomical examples, without copying the
   Solar System or applying arbitrary render multipliers. Retain unknown/neutral
   classifications. New objects need unique IDs and valid histories; validate
   chart bounds and spatial geometry. If moving navigation-linked anchors, use
   manual `npm run connections`, then freshness checks; never fabricate derived
   gate positions. Also add one explicitly noncanonical catalogued
   system with a new valid ID, known discovery date, sector position and
   `publicDetailPath: null`. Create no detail JSON. Exercise the existing
   `archival_fallback`, NEXUS message and Return to Sector behavior. An empty or
   partial released detail file is not fallback; missing-file, invalid-data and
   network failures remain technical errors. Inspect the explicit input allowlists
   in `scripts/demo-files.mjs`, `src/viewer/demo-data.mjs` and `vite.config.mjs`;
   add only necessary authorized inputs. A fallback-only entry needs no loader.
   Stop for review.
3. **Phase 3 — future renderer and icons:** implement physical scaling, spheres,
   distant SVG proxies, fixed apparent structure markers and neutral fallbacks.
   Preserve the approved `public/assets/` organization, public/private build
   boundary, resolver semantics, labels, zones, routes and camera controls.
   Do not enable unrestricted Vite `publicDir` copying. Stop for review.
4. **Phase 4 — future browser refinement:** test all demo systems, natural/proxy
   transitions, close inspection, apparent minima, mobile controls, zero-plane
   grid toggling and archival fallback. Stop for review.

Phase 1 did not change demo JSON. Phase 2 authors demo measurements and geography
only, with [implementation evidence](CHECKPOINT_4_PHASE2_RESULTS.md). Renderer,
SVG generation, textures, artwork, canonical migration, deployment, commit and
push remain outside the current authorization.

## Verification contract

Focused tests cover positive finite diameters across celestial subtypes, zero,
negative, nonnumeric, nonfinite and null rejection, omitted-field compatibility,
and rejection on unrelated artificial/navigation records in both authoring and
release validation. Run `npm test`, `npm run validate`,
`npm run connections:check` and `npm run build`. Browser scale/transition tests
belong to renderer integration; Phase 1 does not claim those visuals exist.

Data authority: [data model](DATA_MODEL.md) and current schema. Presentation
authority: [viewer specification](VIEWER_SPECIFICATION.md),
[NEXUS identity](NEXUS_VISUAL_IDENTITY.md) and [asset policy](VISUAL_ASSET_POLICY.md).
