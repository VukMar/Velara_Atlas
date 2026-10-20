# JSON authoring catalogue v1.2 - NONCANONICAL

Use the [master schema](../schemas/atlas.schema.json) for exact structure,
[the data model](../docs/DATA_MODEL.md) for meaning, and
[navigation authoring](../docs/NAVIGATION_AUTHORING.md) for generation/recovery.
This library is reference-only: the viewer reads [the live demo](../public/datasets/demo/sector.json),
not these files. Every fictional name, date, measurement and coordinate here is
already noncanonical demonstration material or explicitly labeled synthetic.
No example registers IDs, changes canon, or grants publication permission.

## Start with a complete dataset

The seven files `sector.json`, `cantums.json`, `presentation.json`, `connections.json`
and `systems/sys_0001.json` through `sys_0003.json` form a coherent snapshot of the
live demo at `6e026cb` (2026-10-20). Relative paths resolve within `v1_2/`.
All seven reuse the existing demo bytes; they are educational copies, not a
second runtime source or an automatically synchronized authoring workspace.
The fourth system is archival-only; it has no detail file.

For a small starting detail envelope, read `system-detail.json`, containing only
System A's star and map. It is a schema-valid **file**, not a complete dataset;
it must not replace the connected System A detail without corresponding,
creator-authorized index/declaration changes. The other snippets are independent
extracts or synthetic alternatives, not additional records to merge into the snapshot.

## File catalogue and validation targets

Definitions in this table are `schemas/atlas.schema.json#/$defs/<name>`.
Complete files also validate with the corresponding existing wrapper in `schemas/`.
A snippet has no file-level `schemaVersion`; do not add unsupported envelope keys.
Every complete file below has `schemaVersion: "1.2.0"`.

| File | Definition / wrapper | Kind | Purpose and source |
| --- | --- | --- | --- |
| [sector.json](v1_2/sector.json) | `sector` / `sector.schema.json` | Complete file, snapshot | Sector LY map, dated system index, registry paths and NEXUS fallback text |
| [sector-system-released.json](v1_2/sector-system-released.json) | `sectorSystem` | Object snippet | `sys_0001` from the demo index; non-null `systems/sys_0001.json` detail path |
| [sector-system-archival.json](v1_2/sector-system-archival.json) | `sectorSystem` | Object snippet | `sys_0004`, positioned/known from 900 A.E.; `publicDetailPath: null` |
| [sector-system-known-by.synthetic.json](v1_2/sector-system-known-by.synthetic.json) | `sectorSystem` | Synthetic snippet | Unknown discovery, confirmed `knownByAE: 900`, unplaced `positionLY: null`, no Cantum/detail; not a new registration |
| [cantums.json](v1_2/cantums.json) | `cantumsFile` / `cantums.schema.json` | Complete file, snapshot | Two demo Cantums; registered demonstration sigil versus explicit null |
| [cantum-with-sigil.json](v1_2/cantum-with-sigil.json) | `cantum` | Object snippet | Exact `can_0001` record, including optional `sigil: "test-cantum-a"` |
| [presentation.json](v1_2/presentation.json) | `presentationFile` / `presentation.schema.json` | Complete file, snapshot | Existing per-Cantum colors and **24/18-ly `radiusLY`** values; no new global radius |
| [connections.json](v1_2/connections.json) | `connectionsFile` / `connections.schema.json` | Complete **generated output** | Exact graph snapshot; never maintain manually; declarations in system objects own it |
| [systems/sys_0001.json](v1_2/systems/sys_0001.json) | `systemDetail` / `system-detail.schema.json` | Complete release file, snapshot | System A: objects, paired gates, declarations, generated positions and ellipsoid zones |
| [systems/sys_0002.json](v1_2/systems/sys_0002.json) | `systemDetail` / `system-detail.schema.json` | Complete release file, snapshot | System B: gas/unknown planets, moon, station, gates/hole and polygon volume |
| [systems/sys_0003.json](v1_2/systems/sys_0003.json) | `systemDetail` / `system-detail.schema.json` | Complete release file, snapshot | System C: peripheral star, planets, planetoid, asteroid and creator-tested transfers |
| [system-detail.json](v1_2/system-detail.json) | `systemDetail` / `system-detail.schema.json` | Minimal complete file | Original Phase 2 learning envelope, with existing System A star/map only |
| [system-authoring.json](v1_2/system-authoring.json) | `systemAuthoring` / `system-authoring.schema.json` | Complete **authoring input** | System A copy with only boundary-derived short-range gate positions set to null |
| [celestial-star.json](v1_2/celestial-star.json) | `celestial` | Object snippet | Exact known-size System A star `cb_0001` |
| [celestial-comet.synthetic.json](v1_2/celestial-comet.synthetic.json) | `celestial` | Synthetic snippet | Schema-supported comet; unknown physical diameter omitted; not demonstrated by live demo |
| [celestial-other.synthetic.json](v1_2/celestial-other.synthetic.json) | `celestial` | Synthetic snippet | Schema-supported `other` celestial type; no fabricated physical diameter |
| [station-shipyard.synthetic.json](v1_2/station-shipyard.synthetic.json) | `station` | Synthetic snippet | `visualVariant: "shipyard"`, with required construction/discovery/decommissioning/orbit fields |
| [station-unknown.synthetic.json](v1_2/station-unknown.synthetic.json) | `station` | Synthetic snippet | Explicit neutral `unknown` station variant; no affiliation/crew assumptions |
| [gate-short-range.authoring.json](v1_2/gate-short-range.authoring.json) | `gateAuthoring` | **Authoring** object snippet | `gat_0001`, `positionMode: "boundary_derived"`, `position: null`; requires the accompanying declarations/paired records |
| [navigation-local.json](v1_2/navigation-local.json) | `navigation` | Declaration snippet | Invisible `boundaryRadiusCNU` and `localLinks`, copied from `cb_0002` |
| [local-link.json](v1_2/local-link.json) | `localLink` | Declaration snippet | One dated/directed source-anchor declaration; dedicated source/target gate IDs |
| [interstellar-connection.json](v1_2/interstellar-connection.json) | `interstellarDeclaration` | Declaration snippet | `gat_0004` to matching System B gate; authored on one endpoint only |
| [info-card.json](v1_2/info-card.json) | `infoCard` | Shared object snippet | Exact station InfoCard: dated affiliation/class/crew/armament/description and null population |
| [zone-box.synthetic.json](v1_2/zone-box.synthetic.json) | `zone` | Synthetic snippet | Box geometry uses full `size` XYZ in the containing map's units; category `other` |

`*.synthetic.json` files use clearly labeled test names and independent `*_9901` /
`*_9902` IDs. Year zero and coordinates `(0,0,0)` in those snippets are explicit test
values, not inferred placements or unknown dates. Do not combine independent
snippets by filename or treat their IDs as newly reserved entities.

## Entity coverage inside the complete files

The pointers below locate **object snippets inside complete files**. They are
validated against the listed definition as well as through their file wrapper.
Look up by permanent ID when editing; array indices are snapshot locations only.

| Family / variant | File and JSON pointer | Definition | Meaning |
| --- | --- | --- | --- |
| Planet, rocky | `systems/sys_0001.json /objects/1` (`cb_0002`) | `celestial` | Survey/colonized names, `colonizedAE`, dated population/description and navigation anchor |
| Planet, water | `systems/sys_0001.json /objects/2` (`cb_0003`) | `celestial` | Supported water visual variant |
| Planet, gas | `systems/sys_0002.json /objects/2` (`cb_0007`) | `celestial` | Gas remains a planet variant, not a new entity type |
| Planet, unknown | `systems/sys_0002.json /objects/3` (`cb_0008`) | `celestial` | Required nullable icon/orbit fields; omitted physical diameter means unknown |
| Planet, variant omitted | `systems/sys_0003.json /objects/1` (`cb_0011`) | `celestial` | Variant is optional; renderer uses a neutral default |
| Moon | `systems/sys_0001.json /objects/3` (`cb_0004`) | `celestial` | `orbitingId` relationship; position is still absolute local CNU |
| Planetoid | `systems/sys_0003.json /objects/6` (`cb_0013`) | `celestial` | Known-size small body |
| Asteroid | `systems/sys_0003.json /objects/7` (`cb_0014`) | `celestial` | Existing 64-km example; physical diameter and navigation scale differ |
| Station, regular | `systems/sys_0001.json /objects/4` (`sta_0001`) | `station` | Construction/discovery, null decommissioning, crew history and local anchor links |
| Short-range gate, release | `systems/sys_0001.json /objects/7` (`gat_0001`) | `gate` | Generated finite CNU position paired with authoring-null example above |
| Interstellar Jump Gate | `systems/sys_0001.json /objects/10` (`gat_0004`) | `gate` | Authored position; one lifetime interstellar partner |
| Jump Hole | `systems/sys_0001.json /objects/11` (`jhl_0001`) | `jumpHole` | Discovery, not construction; matching hole endpoint in System B |
| Ellipsoid zone | `systems/sys_0001.json /zones/0` (`zon_0002`) | `zone`, `zoneGeometry` | Radius XYZ around authored reference origin |
| Polygon-volume zone | `systems/sys_0002.json /zones/0` (`zon_0003`) | `zone`, `zoneGeometry` | Local X/Z footprint with relative minY/maxY; no automatic orbital coordinates |
| Historical name intervals | `sector-system-released.json /nameHistory` and `systems/sys_0001.json /objects/1/nameHistory` | each `namePeriod` | Inclusive start, exclusive end; survey and settled names preserve identity |
| Generated edge / endpoints | `connections.json /connections/0` | `connection`, `endpoint` | Runtime result, distinct from authored declarations |

Comet and `other` are valid schema enumerations and share the implemented generic
small-body/proxy path (source inspection). Their new snippets are schema-checked;
this maintenance task does **not** claim new browser/visual verification for those
types. Shipyard/unknown station variants have registry support but no live-demo
station instance. The box snippet is schema-valid; no box was inserted into the
live demo. Existing checkpoint evidence describes only the scenarios actually tested.

## Required, optional and unknown values

- Every object must supply its definition's required keys, including the complete
  six-key InfoCard. A null InfoCard field means no released record; omit unsupported
  fields. Dated arrays need their required fields, such as `count` **and** nullable
  `note`, or class `code` **and** `label`. Unknown counts may be null; zero is known
  zero. Null armament never proves that an object is unarmed.
- `discoveredAE`, `constructedAE`, `colonizedAE` and `decommissionedAE` have different
  meanings; use only keys supported by that object definition. Required nullable
  dates are still present. Optional `knownByAE` qualifies knowledge when exact
  discovery is null; it does not assert discovery at zero or at the known-by year.
- `fromAE <= year < untilAE`; null end is ongoing. Preserve `datePrecision`
  qualifications and reject overlapping intervals in the same field. Name histories,
  affiliation, administration and control are separate; retain stable IDs.
- Sector `positionLY` is nullable XYZ in **ly**. Local object `position` is absolute
  XYZ in **CNU**, where **1 CNU = 10,000 km**. Null placement is not `(0,0,0)`.
  `orbitingId` names a parent without computing position. `map.size` is full width,
  height and depth; X/Z is the map plane, Y elevation. Viewer square X/Z framing and
  absolute-zero system grid remain separate constraints.
- Optional celestial `physicalDiameterKm` must be finite and positive if present;
  omit it when unknown. Explicit null is invalid. Do not infer size from category,
  visualVariant, map dimensions or navigation boundaries. `visualVariant` is
  permitted on planets and stations only, with their respective enum values.
- Optional Cantum `sigil` is a registry identifier, not a URL/path. Omission/null
  means none; unknown well-formed identifiers do not authorize fetching assets.
- Preserve the existing **per-Cantum `radiusLY`** presentation structure and copied
  demo values. The current documented fallback is not a newly approved global
  radius. Any proposed radius redesign is a separate Phase 3 design review.

## Authoring, generation and validation

1. Use the complete snapshot to understand relationships; use snippets to inspect
   individual shapes. A new system still requires existing explicit loader/tool/Vite
   registration under a separately authorized change. These examples do not add a
   manifest loader, CLI or automatic discovery.
2. Author local links once on source anchors, with matching target anchors and
   distinct dedicated gate pairs. Interstellar declarations live once on a gate or
   hole, with a same-type lifetime partner. Do not repoint physical endpoints.
3. The `position` key is required even during authoring. Only an explicitly
   boundary-derived short-range gate may use null under `gateAuthoring` or
   `systemAuthoring`. Do not remove its key, invent its generated position, or pass
   authoring-null files to the release validator. `gate`/`systemDetail` require XYZ.
4. The offline generator derives eligible gate positions and `connections.json`
   from authored declarations. The CLI currently targets **only the live demo**;
   do not run `npm run connections` expecting it to write this library. No writer
   was run to produce these examples. Read [the authoring guide](../docs/NAVIGATION_AUTHORING.md)
   for the separately authorized working-data procedure and recovery safeguards.
5. Schema checks are necessary, but a complete dataset also needs valid foreign
   keys, unique definitions, map/zone bounds, dated histories, matching endpoints
   and read-only generated freshness. Standalone snippet validity does not establish
   those relationships. The seven-file snapshot passes existing schema, cross-file
   and read-only navigation freshness checks. An in-memory authoring round trip
   reproduces its graph and all generated gate coordinates without writing data.

To validate a specific example with installed dependencies, run from the repository
root (choose its filename and definition from the catalogue):

```bash
node --input-type=module -e 'import fs from "node:fs"; import Ajv from "ajv/dist/2020.js"; const schema=JSON.parse(fs.readFileSync("schemas/atlas.schema.json","utf8")); const ajv=new Ajv({strict:true,allErrors:true}); ajv.addSchema(schema); const check=ajv.compile({$ref:schema.$id+"#/$defs/celestial"}); const value=JSON.parse(fs.readFileSync("examples/v1_2/celestial-star.json","utf8")); if(!check(value)){console.error(check.errors);process.exitCode=1;}'
```

This command performs no network access; schema IDs are offline identifiers.
During Phase 2.1 all **24 JSON files** were checked against their definitions;
all complete envelopes and wrapper targets were checked. No permanent test or
runtime dependency was introduced on this reference directory.

Legacy regression inputs remain in
[legacy_examples](../tests/fixtures/legacy_examples/README.md).
The eight [archived JSON proposals](../docs/archive/json-proposals/README.md)
retain obsolete v0.2 shapes and provenance; use this catalogue for current authoring.
Production source and output audits continue excluding both reference and archived material.
