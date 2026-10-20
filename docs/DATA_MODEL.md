# Velara Atlas — JSON Data Contract v1.2.0

**Scope:** Author-approved structural schema and **noncanonical demonstration records only**. This document supersedes the structural conventions in `DATA_MODEL_DRAFT.md` v0.2 but **does not automatically migrate** the old v0.1 political history, `sector.json`, or `src/timeline/resolve.mjs`. Those require a separate migration and regression tests.

## Identity and naming

All entities have stable, globally unique IDs within a dataset. The prefix is a type discriminator, **not** a discovery order: `sec_0001` sector; `can_0001` Cantum; `sys_0001` star system; `cb_0001` celestial body (star, planet, moon, asteroid, planetoid, etc.); `sta_0001` station; `gat_0001` gate; `jhl_0001` Jump Hole; `lnk_0001` navigational link; `zon_0001` spatial zone. At least four digits; never reuse or rename an issued ID. Counters span the dataset, not each system. Frozen test snapshots are independent datasets, not duplicate production definitions. `npm run idfind -- all` provides read-only demo suggestions; it never reserves IDs.

`nameHistory` holds dated names. A survey name can appear before a colonization name. A system's current name and its permanent ID are separate. The `cantumHistory` field represents regional administration; `controlHistory` is reserved for political control. Neither should be inferred from another.

## Optional Cantum visual identity — Stage 2

Current v1.2 Cantum records may author `sigil` as null or a registry identifier:
1–64 characters, matching `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`. Omission and explicit
null both mean no sigil, with no generic unknown-icon fallback. Well-formed but
unregistered IDs also render name-only. Paths, URLs, extensions and scripts are
not identifiers. This field belongs only to Cantums and never determines system
membership, political status or territory geometry.

The modern resolver forwards authored string/null values only after existing
Cantum eligibility succeeds; omission stays omitted. This is static metadata,
not a dated sigil history. The additive extension keeps `schemaVersion: "1.2.0"`;
old records remain valid. Frozen v1.1 schemas/fixtures and canonical records are
unchanged. The explicitly noncanonical demo assigns `test-cantum-a` to `can_0001`
and null to `can_0002`; it adds no political facts.

## Required objects and files

| File / entry | Purpose |
|---|---|
| `sector.json` | One sector coordinate context, an index of star systems, common NEXUS fallback text and dataset paths |
| `cantums.json` | Cantum names, status histories, universal InfoCards |
| `systems/sys_XXXX.json` | Per-system CNU map and `objects[]` (celestial bodies, stations, gates and Jump Holes) |
| `connections.json` | Generated, Git-tracked runtime graph; authoring declarations live in system objects |

Each current noncanonical demo file's schemaVersion is 1.2.0. Frozen v1.1 regression fixtures live under `tests/fixtures/v1_1/`, with `schemas/atlas-v1_1.schema.json`; historical semantics are unchanged. Individual objects are identified by `entityType` and sometimes `objectType`; their `infoCard.class` is human-readable metadata, not the object-type discriminator.

The original accepted v1.2 scenarios are also frozen in `tests/fixtures/v1_2/`;
the current `public/datasets/demo/` remains author-editable. Current learning
references live in `examples/v1_2/`; legacy regression inputs are preserved in
`tests/fixtures/legacy_examples/`, and obsolete proposal shapes are archived in
`docs/archive/json-proposals/`. See [examples](../examples/README.md).

The sector file's system list is the **catalogue index**. `publicDetailPath: null` means a visible, discovered system opens a NEXUS archival fallback. A non-null path points to a released detail file. Do not publish empty, secret or unreleased object records merely to conceal them behind UI flags.

## Coordinates and distance units

Sector X/Y/Z uses **light-years (`ly`)**. Individual system X/Y/Z uses **Continuance Navigation Units (`CNU`)**, the standardized interplanetary navigational distance used by the Continuance. **1 CNU = 10,000 kilometers**, universally across systems. Existing coordinates, extents, zones, navigation boundaries and connections are not rescaled.

`map.origin` is `(0,0,0)`; `map.size` is **full width, full height and full depth**, not half-size. With X size 100000, valid X positions lie between -50000 and +50000. X/Z is the top-down plane, Y is elevation. All coordinates are static, author-assigned chart positions; orbital mechanics and animated movements are out of scope. Optional `orbitingId` provides relationship metadata but does not compute position or enforce orbit distances.

The Checkpoint 3.6 viewer additionally requires square X/Z extents and validates
that constraint at startup/build without changing this general schema or JSON.
Its 8×8 system grid measures navigational cell width, not physical body size.
Each system may have different square X/Z dimensions and an independently authored
Y extent. A star need not be at the chart center. The system grid and annotations
remain on absolute Y = 0 CNU, independently of stellar position and vertical bounds.

**Checkpoint 3.8 exception — v1.2 system spatial zones only:** A zone's `position`
is its authored geometric reference origin, not an ordinary object position. Its
origin and dimensions may extend outside the system map if the volume has a
strictly positive 3D intersection with the chart's XYZ box. Face/edge/corner
contact alone is rejected. Ellipsoids use true normalized distance to the box;
polygon volumes require positive Y overlap and positive clipped footprint area,
including concave polygons and edge crossings. Invalid/self-intersecting or
degenerate polygons are rejected. The visible intersection is derived without
altering stored geometry. All local footprint vertices/heights remain relative
to the authored zone origin. Stars, planets, stations, gates and navigation
boundaries retain strict chart bounds. Frozen v1.1 and sector zones retain full
containment. This changes scoped relational validation, with no new JSON field
or schema version. See [approved scope](ZONE_GEOMETRY_INTERACTION_SPEC.md) and
[implementation evidence](ZONE_GEOMETRY_INTERACTION_RESULTS.md).

`positionLY: null` is valid for a system that has not yet been spatially placed. Such a system can be listed in the catalogue (if its visibility is otherwise known), but **must not** be assigned `(0,0,0)` automatically or plotted on the spatial map. A null discovery date is **unknown**, not year 0. The UI must avoid claiming the system was known at an earlier date based on `null`.

## History and InfoCard

`fromAE` is inclusive; `untilAE` is exclusive; `null` means no documented end. No two periods for the same field may overlap. An unknown scalar may be `null` and must never be silently converted to zero or a fabricated date. Add `datePrecision` (`exact`, `circa`, `confirmed_by`, `within_window`, `atlas_snapshot`, or `unknown`) whenever the canon requires qualification.

All entities have the universal InfoCard fields:

```json
{
  "affiliation": null,
  "class": null,
  "crew": null,
  "population": null,
  "armament": null,
  "description": null
}
```

Each non-null field is a nonempty array of **dated records**. Celestial bodies may only need `description`; colonized planets generally use `population`, and stations generally use `crew`, but those are display conventions rather than artificially restrictive schemas. A whole-field `null` means no released record; a dated `count: null` means a known subject whose quantity is unknown; a dated `count: 0` means confirmed zero. An armament `null` is **not** evidence that something is unarmed.

Celestial subtypes all have `entityType: celestial_body`, with `objectType` distinguishing `star`, `planet`, `moon`, `planetoid`, `asteroid`, `comet`, `other`. No object subtype demands its own schema file. `orbitingId` can point to a celestial body in the same system; every object's coordinates remain absolute **within the system map**, never relative to its parent.

Historical existence and historical **discovery** are distinct. A station has `constructedAE` / `decommissionedAE`; a Jump Hole has `discoveredAE` but may predate discovery. Visibility logic must account for both recorded existence and discovery. Changes of historical label, occupancy or affiliation do **not** automatically shift coordinates.

### Physical celestial diameter — Checkpoint 4.1 Phase 1

Celestial bodies may optionally author `physicalDiameterKm`: a positive finite
number (`type: "number"`, `exclusiveMinimum: 0`). Omission means unknown;
explicit `null`, zero, negative and nonnumeric values are invalid. This static
measurement applies to all celestial subtypes, never to stations, gates, Jump
Holes or zones. `diameterCNU = physicalDiameterKm / 10000`; it is independent of
zoom, icons, `visualVariant`, `navigation.boundaryRadiusCNU` and zone dimensions.
No type implies a physical size or multiplier. Gas giant remains a planet's
`gas` visual variant. Artificial structures initially use fixed apparent icons.

This is an additive current v1.2 schema extension shared by release and authoring
validation; no version bump, required-field change or existing-record migration.
Frozen schemas/fixtures and canonical v0.1 remain unchanged. Phase 1 added no
measurements or runtime consumption. Phase 2 now populates representative
noncanonical demo measurements. Phase 3 forwards authored values through resolved
celestial records and uses fixed physical radii with distant SVG proxies. Omitted
measurements still have no inferred physical geometry. The physical
projection, neutral unknown fallback and separate apparent minima are specified
in [the celestial scale contract](CHECKPOINT_4_CELESTIAL_SCALE_SPEC.md).

## Gate / Jump Hole route contract

There are three navigational object types:

- `gat_XXXX`, `objectType: short_range_gate`: intrasystem device, at most **one fixed lifetime partner** in its system. Separate links around one anchor require separate physical gates. This supersedes v1.1 branching.
- `gat_XXXX`, `objectType: jump_gate`: interstellar device, **one fixed corresponding gate on the other side**; zero links permitted while undeveloped/unconnected, **never two**. To connect System A to B and C requires **two** interstellar gates in System A.
- `jhl_XXXX`, `objectType: jump_hole`: natural interstellar passage, modeled as one-to-one paired Jump Hole endpoints for this schema; subject to the same exclusivity rule. Its discovery date is distinct from when its passage becomes usable.

Connections are authored once in system objects and compiled into `connections.json`: `lnk_XXXX`, `linkType`, `transportType`, two endpoints (each `systemId` and `objectId`), `direction`, `fromAE`, `untilAE`. `transportType` is `short_range_gate`, `jump_gate` or `jump_hole`. `direction` may be `bidirectional`, `a_to_b`, or `b_to_a`. Endpoints must match the transport type and occupy the same system for short-range links or **different** systems for interstellar links. **No gate-to-hole mixing.** A published fallback system may expose an expressly authorized endpoint ID without released detail; public validation leaves that object unverified. A future canonical release process must verify approved endpoint facts without publishing private details; no private canonical validator is claimed to exist today.

A Jump Gate or Jump Hole endpoint may appear in **at most one interstellar connection across the entire released dataset**, not merely one at a time. Reconfiguration to another destination is deliberately unsupported in v1.2; local short-range endpoints are also lifetime-exclusive. Historical activation uses `fromAE` on the connection. Sector strokes join system positions in ly; local strokes join gate positions in CNU. Never mix those coordinate contexts.

## Validation scope and limitations

Structural JSON Schema Draft 2020-12 checks types, enums, required fields, ID patterns and JSON shape. `scripts/check-relations.mjs` checks cross-file IDs, link endpoint types, route cardinality, bounds, orbital parents, referenced Cantums and overlap of dated fields. Neither script reads or verifies MCR historical prose. That remains the creator's responsibility.

This schema defines spatial-zone geometry and public presentation settings. It does **not** define exact Cantum border polygons, orbital simulation, private publication manifests or detailed polity entities. Unsupported extensions require a versioned approval; do not invent ad hoc keys.

The demonstration data in `public/datasets/demo` is **not canon**. Its system names, coordinates, years, populations and equipment exist only to exercise code. No 43 real systems are included here.

## v1.1 extension note

The v1.1 extension added nullable icon overrides, optional planet/station visualVariant, confirmed-known-by dates, three zone geometries and separate validated presentation settings. v1.2 retains these fields and supersedes the older short-range branching/navigation-authoring rules; Checkpoint 3.8 additionally replaces full containment with positive-volume intersection for v1.2 system zones only. Final icon/variant rendering remains Checkpoint 4 work. Published v0.1 canonical chronology is not migrated; permanent-ID conversion requires approval. See [migration safeguards](LEGACY_MIGRATION_PLAN.md).

## v1.2 navigation authoring

System objects are the authoring source of truth. Eligible anchors use `navigation.boundaryRadiusCNU` and `navigation.localLinks[]`; Jump Gates/Holes may use one `interstellarConnection`. Connected short-range gates must be `positionMode: "boundary_derived"`; their normal `position` XYZ is written by the manual generator. Only the `systemAuthoring` schema permits a temporary null position for those gates. Release `systemDetail` validation requires XYZ. All other object coordinates remain absolute and required.

Run `npm run connections`, then the read-only `npm run connections:check`; tests, validation and builds refuse stale output. No browser generation, positions sidecar or automatic repair exists. See [approved design](SCHEMA_V1_2_NAVIGATION.md) and [workflow, precision, migration and recovery](NAVIGATION_AUTHORING.md).
