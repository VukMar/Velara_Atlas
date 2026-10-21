# v1.2 entity-family reference - NONCANONICAL

Ten focused examples teach the supported families. Enum variations belong here,
not in separate files. Existing demo values and previously approved synthetic
station/box snippets are reused; no official lore or new registrations are added.
The star, station and zone names identify noncanonical examples. Keep every ID
stable when editing an existing record. New identities need their own approved
IDs; never merge these copies into the demo as additional entities with duplicate
IDs. Each listed prefix is followed by at least four decimal digits; names never
serve as relationship keys.

## Choose an example and validation stage

Targets below mean `schemas/atlas.schema.json#/$defs/<definition>`.
An **object snippet** is a complete object for its definition, not a complete file
or a self-contained dataset. It has no file-level `schemaVersion`.

| File | ID / family | Definition | Kind and role |
| --- | --- | --- | --- |
| [sector-system.json](sector-system.json) | `sys_0001` | `sectorSystem` | Sector-index object, released-detail case |
| [cantum.json](cantum.json) | `can_0001` | `cantum` | Cantum object with optional registered demo sigil |
| [celestial-body.json](celestial-body.json) | `cb_0001` | `celestial` | Star object; other supported celestial types use the same definition |
| [station.json](station.json) | `sta_9901` | `station` | Previously approved synthetic shipyard station; other variants use the same shape |
| [gate-short-range.json](gate-short-range.json) | `gat_0001` | **`gateAuthoring`** | Authoring object: **initial position always null** |
| [gate-interstellar.json](gate-interstellar.json) | `gat_0004` | `gate` | Jump Gate object with authored XYZ and one interstellar declaration |
| [jump-hole.json](jump-hole.json) | `jhl_0001` | `jumpHole` | Natural passage object, with discovery and one paired hole |
| [spatial-zone.json](spatial-zone.json) | `zon_9901` | `zone` | Previously approved synthetic box; belongs in `zones[]` |
| [system-detail.json](system-detail.json) | `sys_0001` | `systemDetail` | Compact complete release file: existing System A map and star only |
| [presentation.json](presentation.json) | `can_`-keyed styles | `presentationFile` | Complete presentation file, retaining existing per-Cantum `radiusLY` |

The two complete files use `schemaVersion: "1.2.0"`. The system and presentation
wrappers are `system-detail.schema.json` and `presentation.schema.json`. The
short-range object uses `gateAuthoring`; a whole authoring envelope instead uses
`systemAuthoring` / `system-authoring.schema.json`. Do not validate its null
positions as release `gate` / `systemDetail` records.

## Shared fields, history and coordinates

For celestial bodies, stations, gates and Jump Holes, required common keys are
`id`, `entityType`, `objectType`, `discoveredAE`, `nameHistory`, `position`, `icon`
and `infoCard`; family-specific requirements follow below. A required nullable
property must still be present. `icon` can be null for the classified fallback or
a schema-valid override; an override does not register an asset or expand the
production allowlist. Only supported keys may be added.

All InfoCards require `affiliation`, `class`, `crew`, `population`, `armament` and
`description`. Each is null or a dated nonempty record array. Count records require
`count` and nullable `note`; class records require `code` and `label`; descriptions
require `text`. Affiliation records require nullable `entityId` (`can_`, `pol_` or
`org_`); armament records require `summary` and `systems`. Every dated record
requires `fromAE` and `untilAE`; `datePrecision` is optional. Null count is unknown,
zero is known zero; null armament is not a claim of being unarmed. Reference an
approved affiliation ID without deriving administrative Cantum membership from it.

`fromAE` is inclusive, `untilAE` exclusive, null end ongoing. Preserve historical
name intervals and uncertainty (`datePrecision`); do not overlap intervals in the
same field. Discovery, construction, colonization and decommissioning are distinct.
Scalar years are nonnegative integers; required scalar dates may be null where
the definition permits it. Optional `knownByAE` records confirmed knowledge when
exact discovery is null, not an exact
discovery date or year zero. Name arrays can be null; no fictional name is inferred.

Sector `positionLY` is XYZ in **ly** and may be null for an unplaced system.
Local `position` is absolute XYZ in **CNU**: **1 CNU = 10,000 km**. X/Z is the map
plane; Y is elevation. Null is never replaced by `(0,0,0)`. `map.size` is the full
extent. `orbitingId` identifies a parent but never computes a relative position.
Positions and histories are immutable from viewer interactions.

## Sector, system and Cantum records: sec_, sys_, can_

- **`sec_`**: a complete `sector` file requires `schemaVersion`, `id`, `entityType`,
  `title`, `map`, `timeline`, `infoCard`, `cantumsPath`, `connectionsPath`, `systems`
  and `nexusPresentation`. `zones` and nullable `presentationPath` are optional.
  Inspect [the actual sector](../../public/datasets/demo/sector.json), not a copied registry.
- **`sys_` sector entry** (`sectorSystem`): required `id`, `entityType`,
  `discoveredAE`, `colonizedAE`, `positionLY`, `nameHistory`, `cantumHistory`,
  `publicDetailPath`, `infoCard`; optional `knownByAE` and nullable `controlHistory`.
  Dates, placement and histories retain their nullable meanings. A released entry
  uses `systems/sys_XXXX.json`; `publicDetailPath: null` selects archival fallback
  once historically known. It does not mean an empty detail file. An unplaced
  known system can remain catalogued without a marker. See `sys_0004` in the
  actual sector for fallback; do not create a detail for it. Unknown discovery
  plus a supported `knownByAE` is a separate knowledge case, not a new entity type.
- **`sys_` detail** (`systemDetail`): required `schemaVersion`, `id`,
  `entityType: "system_detail"`, `map`, `objects`; optional `zones`. Objects belong
  in `objects[]`, spatial zones in `zones[]`. Use square X/Z dimensions for the
  viewer and the absolute-zero system grid. The compact file is not a complete
  dataset or a replacement for a live connected system.
- **`can_`** (`cantum`): required `id`, `entityType`, `letter`, `nameHistory`,
  `statusHistory`, `infoCard`. Histories can be null. Optional `sigil` is a nullable
  registry identifier, never a URL/path; omitted/null means none. These objects
  belong in a `cantumsFile` envelope requiring `schemaVersion` and `cantums`.
  Membership is authored in system `cantumHistory`, independently from naming,
  control and InfoCard affiliation. See [the real registry](../../public/datasets/demo/cantums.json).

Presentation is separate from history. Its Cantum-keyed colors and existing
24/18-ly `radiusLY` values are demonstration settings, not canonical territory.
Retain the current field structure, thresholds, defaults and calculations.
No global-radius redesign is part of this library.

## Celestial bodies: cb_

`celestial` supports `star`, `planet`, `moon`, `planetoid`, `asteroid`, `comet`,
`other` through `objectType`. In addition to the common required keys, supply
nullable `orbitingId` and `colonizedAE`. Celestial objects belong in `objects[]`.

Optional `visualVariant` is permitted **only for planets**: `rocky`, `gas`, `water`,
`unknown`; omission uses the neutral rendering path. A gas giant remains a planet.
A moon can reference its parent through `orbitingId` while keeping absolute local
CNU coordinates. Optional positive finite `physicalDiameterKm` is omitted when
unknown; explicit null is invalid. Never infer it from type, variant or navigation
boundary. Optional `navigation` can make a body a local anchor.

Star/planet/moon/planetoid/asteroid records are present in the live demo. Comet and
`other` are schema-supported and use the implemented generic small-body/proxy
path; no new comet/other browser or visual verification is claimed here. Adapt
supported fields on an approved record rather than copying a new enum-only file.
See [System A](../../public/datasets/demo/systems/sys_0001.json),
[System B](../../public/datasets/demo/systems/sys_0002.json) and
[System C](../../public/datasets/demo/systems/sys_0003.json) for working variations.

## Stations: sta_

`station` adds required nullable `constructedAE`, `decommissionedAE`, `orbitingId`
to the common required keys. `objectType` is a nonempty string, not a fixed subtype
registry; the example uses `orbital_station`. Optional station `visualVariant`
values are `regular`, `shipyard`, `unknown`; omission uses the unknown fallback.
`regular` appears in the demo;
shipyard/unknown have registry support but are not additional live-demo stations.

Stations belong in `objects[]`; construction and discovery dates remain separate,
null decommissioning is not an invented end date, and orbit relationships do not
move coordinates. Optional `navigation` allows local links to bodies, stations,
Jump Gates or Jump Holes with appropriate boundaries. Crew, population, class and
armament stay independent dated InfoCard fields, not automatic subtype defaults.

## Gates: gat_ - authoring versus generated release

Both gate types require the common keys plus nullable `constructedAE` and
`decommissionedAE`. `objectType` is `short_range_gate` or `jump_gate`; there is no
station-style visualVariant field. Gate records belong in `objects[]`.

**Creator-confirmed creation rule: a NEW short-range gate ALWAYS starts with
`position: null` and `positionMode: "boundary_derived"`. The author never manually
enters its position.** These two fields are a fragment of the full gate object:

```json
{"position": null, "positionMode": "boundary_derived"}
```

Create the corresponding gate records and define the navigation relationships
on the relevant anchor objects. Each link requires two dedicated physical gates,
matching anchors and valid boundaries. Complete those declarations before running
the generator: a derived gate absent from authored links is currently rejected.
In an authorized working-demo authoring session, run:

```bash
npm run connections
npm run connections:check
```

The first command calculates gate XYZ from the authored navigation relationships,
writes those positions into the corresponding system JSON records, and generates
or updates the central `connections.json`. **After generation, release data has
calculated XYZ, not null.** `connections:check` verifies both results without
rewriting data. The CLI targets `public/datasets/demo/`, not this example library;
these commands were not run in writing mode for Phase 2.2.

The `gateAuthoring` / `systemAuthoring` validation stage accepts the initial null;
`gate` / `systemDetail` requires generated finite XYZ. Retain both schema stages.
Existing schemas accept some legacy unconnected/XYZ states for compatibility;
that does not change the creator's rule for creating new short-range gates.
No schema or generator behavior is changed by documenting this workflow.

A short-range gate itself cannot own `navigation` or `interstellarConnection`.
Its relationship is declared on anchors. An interstellar **Jump Gate** instead
keeps independently authored finite XYZ, may have a boundary/local links, and may
own one `interstellarConnection`. `positionMode: "boundary_derived"` is not valid
for that type. Each physical gate has at most one lifetime partner; do not repoint
it in disjoint periods. The [full authoring guide](../../docs/NAVIGATION_AUTHORING.md)
remains authoritative for required declarations, dedicated pairs, checks and recovery.

## Jump Holes: jhl_

`jumpHole` uses the common required keys with `objectType: "jump_hole"` and its
own authored XYZ. It is a natural passage: **no construction or decommissioning
properties may be invented or added**. Its discovery can differ from link activation.
Optional `knownByAE`, `navigation` and one `interstellarConnection` follow the
same public-knowledge and local-anchor rules. It belongs in `objects[]`.

The focused example is the existing demo `jhl_0001`; its declaration pairs with
`jhl_0002` in System B. Interstellar hole partners must be holes, Jump Gate partners
must be Jump Gates. Never mix gate-to-hole types or create reciprocal duplicate
source declarations. Changing the year filters records/links without moving them.

## Spatial zones: zon_

`zone` requires `id`, `entityType`, `category`, `discoveredAE`, `nameHistory`,
`position`, `geometry`, `infoCard`; optional `knownByAE`. Supported categories are
`nebula`, `asteroid_field`, `hazard`, `other`. Zones use **`zones[]`, not `objects[]`**.
Their position is a geometric reference origin in the containing map's units.

`geometry` is the structurally distinct part, validated against `zoneGeometry`.
These are geometry-only snippets, not whole zone records:

Ellipsoid (`#/$defs/zoneGeometry`):

```json
{"kind":"ellipsoid","radii":{"x":2500,"y":2000,"z":1500}}
```

Box (`#/$defs/zoneGeometry`):

```json
{"kind":"box","size":{"x":1000,"y":1000,"z":1000}}
```

Polygon volume (`#/$defs/zoneGeometry`):

```json
{"kind":"polygon_volume","footprint":[{"x":-200,"z":-100},{"x":100,"z":-100},{"x":200,"z":200},{"x":-100,"z":200}],"minY":-100,"maxY":100}
```

An ellipsoid uses radii, a box uses full XYZ size, and a polygon volume uses an
X/Z footprint with relative minY/maxY. Copying a geometry variation still requires
an approved origin, historical data, InfoCard and valid chart intersection.
The v1.2 system-zone positive-volume intersection exception does not relax
ordinary object bounds, sector zones or frozen v1.1 containment. There is no
zone-expiry field. The live demo contains ellipsoid and polygon-volume cases;
the compact box example remains explicitly synthetic.

## Navigation connections: lnk_

`lnk_` IDs identify connections, not extra `objects[]` entities. Authored local
links are `localLink` records inside an anchor's `navigation.localLinks`. The
`navigation` definition also permits a positive invisible `boundaryRadiusCNU`.
This actual `cb_0002.navigation` snippet illustrates their complete shape:

```json
{
  "boundaryRadiusCNU": 1800,
  "localLinks": [
    {
      "id": "lnk_0001",
      "targetObjectId": "sta_0001",
      "sourceGateId": "gat_0001",
      "targetGateId": "gat_0002",
      "direction": "bidirectional",
      "fromAE": 350,
      "untilAE": null
    }
  ]
}
```

A `localLink` requires `id`, `targetObjectId`, `sourceGateId`, `targetGateId`,
`direction`, `fromAE`, `untilAE`; optional `datePrecision`. Both anchors need
valid boundaries; two distinct dedicated short-range gate records must exist in
the same system. Boundaries are navigation parameters, not body sizes or zones.
One anchor can have multiple links through separate gate pairs.

An `interstellarDeclaration` requires `id`, `targetSystemId`, `targetObjectId`,
`direction`, `fromAE`, `untilAE`; optional `datePrecision`. Its context is the
`interstellarConnection` property shown in the Jump Gate and Jump Hole examples.
Targets are matching types in different systems, lifetime-exclusive and authored
once. An expressly public archival endpoint remains unverified without details;
do not invent or publish its unreleased object.

The generated `connection` form adds `linkType`, `transportType` and two endpoints
(each `systemId`, `objectId`), retaining ID, direction and interval. `direction`
is `bidirectional`, `a_to_b` or `b_to_a`; transports are `short_range_gate`,
`jump_gate`, `jump_hole`. A `connectionsFile` envelope has `schemaVersion` and
`connections`. Inspect [the actual generated registry](../../public/datasets/demo/connections.json)
as output; never hand-maintain it. No copied graph or declaration-only JSON file
is needed in this library.

## Complete files and validation

`system-detail.json` is a compact complete file, not a whole sector dataset. A
system with newly created short-range gates first validates as `systemAuthoring`;
after generation its same file validates as `systemDetail`. A second nearly
identical system-authoring learning copy is unnecessary. The actual schema
definitions remain distinct. Do not insert the null authoring gate into the
compact release example and claim it passes release validation.

Use installed Ajv Draft 2020-12 in strict mode with the definitions listed in the
catalogue. Complete files use their current wrappers; do not add unsupported
`schemaVersion` properties to object snippets. Shape validity does not establish
cross-file IDs, map bounds, nonoverlapping histories, correct local/interstellar
partners or generated freshness. Use [the real demo](../../public/datasets/demo/sector.json)
and [navigation authoring](../../docs/NAVIGATION_AUTHORING.md) for a full dataset.

All ten examples and the geometry/navigation fragments are schema-checked during
Phase 2.2. The short-range example is checked with **`gateAuthoring`**, including
rejection by release `gate` while its position is null. Reference snippets are not
registered runtime data, automatically scanned inputs or targets of the generator.
No test or runtime code depends on this directory. Production exclusions and
`publicDir: false` remain unchanged.
