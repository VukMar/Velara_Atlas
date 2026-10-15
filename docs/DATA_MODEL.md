# Velara Atlas — JSON Data Contract v1.1.0

**Scope:** Author-approved structural schema and **noncanonical demonstration records only**. This document supersedes the structural conventions in `DATA_MODEL_DRAFT.md` v0.2 but **does not automatically migrate** the old v0.1 political history, `sector.json`, or `src/timeline/resolve.mjs`. Those require a separate migration and regression tests.

## Identity and naming

All entities have stable, globally unique IDs. The prefix is a type discriminator, **not** a discovery order: `sec_0001` sector; `can_0001` Cantum; `sys_0001` star system; `cb_0001` celestial body (star, planet, moon, asteroid, planetoid, etc.); `sta_0001` station; `gat_0001` gate; `jhl_0001` Jump Hole; `lnk_0001` navigational link. At least four digits; never reuse or rename an issued ID. Counters run across the whole atlas, not within each system.

`nameHistory` holds dated names. A survey name can appear before a colonization name. A system's current name and its permanent ID are separate. The `cantumHistory` field represents regional administration; `controlHistory` is reserved for political control. Neither should be inferred from another.

## Required objects and files

| File / entry | Purpose |
|---|---|
| `sector.json` | One sector coordinate context, an index of star systems, common NEXUS fallback text and dataset paths |
| `cantums.json` | Cantum names, status histories, universal InfoCards |
| `systems/sys_XXXX.json` | Per-system CNU map and `objects[]` (celestial bodies, stations, gates and Jump Holes) |
| `connections.json` | **Single source of truth** for all short-range and interstellar routes |

Each new noncanonical demo file's schemaVersion is 1.1.0. Individual objects are identified by `entityType` and sometimes `objectType`; their `infoCard.class` is human-readable metadata, not the object-type discriminator.

The sector file's system list is the **catalogue index**. `publicDetailPath: null` means a visible, discovered system opens a NEXUS archival fallback. A non-null path points to a released detail file. Do not publish empty, secret or unreleased object records merely to conceal them behind UI flags.

## Coordinates and distance units

Sector X/Y/Z uses **light-years (`ly`)**. Individual system X/Y/Z uses **Continuance Navigation Units (`CNU`)**, the established standardized interplanetary navigational distance used by the Continuance. The exact CNU-to-kilometer ratio remains undecided; do not guess one.

`map.origin` is `(0,0,0)`; `map.size` is **full width, full height and full depth**, not half-size. With X size 100000, valid X positions lie between -50000 and +50000. X/Z is the top-down plane, Y is elevation. All coordinates are static, author-assigned chart positions; orbital mechanics and animated movements are out of scope. Optional `orbitingId` provides relationship metadata but does not compute position or enforce orbit distances.

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

## Gate / Jump Hole route contract

There are three navigational object types:

- `gat_XXXX`, `objectType: short_range_gate`: intrasystem device, may have **multiple** links to distinct short-range gates within its system.
- `gat_XXXX`, `objectType: jump_gate`: interstellar device, **one fixed corresponding gate on the other side**; zero links permitted while undeveloped/unconnected, **never two**. To connect System A to B and C requires **two** interstellar gates in System A.
- `jhl_XXXX`, `objectType: jump_hole`: natural interstellar passage, modeled as one-to-one paired Jump Hole endpoints for this schema; subject to the same exclusivity rule. Its discovery date is distinct from when its passage becomes usable.

Connections are stored once in `connections.json`: `lnk_XXXX`, `linkType`, `transportType`, two endpoints (each `systemId` and `objectId`), `direction`, `fromAE`, `untilAE`. `transportType` is `short_range_gate`, `jump_gate` or `jump_hole`. `direction` may be `bidirectional`, `a_to_b`, or `b_to_a`. The two endpoints must agree with the transport type and be in the same system for short-range links or **different** systems for interstellar links. **No gate-to-hole mixed connections. If a destination system is a published **fallback** with no released detail file, the public validator permits a reference to its endpoint ID without pretending to validate the unpublished object itself; the private canonical validator must verify that endpoint before release.**

A Jump Gate or Jump Hole endpoint may appear in **at most one interstellar connection across the entire released dataset**, not merely one at a time. Reconfiguration of a gate to point to a different destination is deliberately out of scope for v1.0. Historical activation uses `fromAE` on the connection. The sector renderer draws interstellar connections between system positions; the system renderer draws local gate lines between local positions. Do not mix CNU and ly coordinates in a single line.

## Validation scope and limitations

Structural JSON Schema Draft 2020-12 checks types, enums, required fields, ID patterns and JSON shape. `scripts/check-relations.mjs` checks cross-file IDs, link endpoint types, route cardinality, bounds, orbital parents, referenced Cantums and overlap of dated fields. Neither script reads or verifies MCR historical prose. That remains the creator's responsibility.

This schema does **not** define Cantum border polygons, detailed nebula volumes, asteroid-field procedural generation, star systems with orbital animation, private publication manifests, or detailed polity entities. They can be versioned later; do not invent incompatible new keys in v1.0 files.

The demonstration data in `examples/demo_atlas` is **not canon**. Its system names, coordinates, years, populations and equipment exist only to exercise code. No 43 real systems are included here.

## v1.1 extension note

New demo schema accepts nullable icon overrides, optional planet/station visualVariant, confirmed-known-by dates distinct from exact discovery, zon_XXXX ellipsoid/box/polygon-volume records, and a separate presentation.json file for Cantum colors, radius and transparency. Gate and Jump Hole pairing rules are unchanged. The published v0.1 canonical chronology is NOT migrated by this change; permanent-ID conversion requires creator approval. See LEGACY_MIGRATION_PLAN.md.
