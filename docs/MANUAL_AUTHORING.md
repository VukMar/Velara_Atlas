# Safe local manual authoring (v1.3 NONCANONICAL Demo)

Phase 3E is complete and creator-approved. Its implementation and completion
documentation are committed together. Phase 3F is the next proposed integration
checkpoint, not started and requiring separate authorization; overall Phase 3 is
not complete. This guide grants no publication or deployment approval. The viewer
stays read-only. Canon under `public/data/`, calibration, schemas and frozen fixtures
are not authoring targets. Neither Phase 3F nor a graphical Atlas Creator is implemented.

## Create an empty system

Run from the repository root:

```bash
npm run atlas:new-system -- --help
npm run atlas:new-system -- --suggest
npm run atlas:new-system -- --size-x 100000 --size-y 10000 --size-z 100000
```

The last command previews a registration and a new detail file without creating
files, locks or ID reservations. The sizes above are **illustrative chart sizes**,
not defaults: choose explicit sizes for your chart. Positive finite dimensions
are required in CNU; X and Z must be equal for the current viewer. Origin
`{x:0,y:0,z:0}`, `unit: "CNU"`, `projection: "topdown_xz"` and `planeY: 0` are
technical chart conventions, not astronomical facts. Sector positions use ly;
local object positions use CNU (1 CNU = 10,000 km); Y is elevation.

Repeat the preview with `--apply` to create the detail and append its registration:

```bash
npm run atlas:new-system -- --size-x 100000 --size-y 10000 --size-z 100000 --apply
```

Only run that command when you intend to modify the active Demo. Review the diff
before any commit. The CLI has no dataset/root/path/URL selector and cannot target
Canon. A service-level root/IO argument exists solely for controlled tests.

ID Finder supplies the next `sys_` identity using BigInt suffix comparison.
`--id sys_XXXX` selects an explicit unused identity, including a free gap.
Registered details, archival-only entries and direct unregistered system files
all count. Collisions fail with a suggested alternative; suggestions never reserve
an ID. Invalid current data or malformed unregistered records withhold creation.
Archival systems cannot be promoted through this command.

Optional, explicitly authored inputs:

| Options | Meaning |
| --- | --- |
| `--name TEXT --name-from-ae N` | Both required together; one open-ended name period with `kind: "author_supplied"`. This kind records provenance, not date precision. |
| `--discovered-ae N` | Exact recorded discovery year; omit unknown dates. |
| `--known-by-ae N` | Alternative confirmed-known-by year; discovery remains null. Mutually exclusive with `--discovered-ae`. |
| `--colonized-ae N` | Independent colonization year. |
| `--position X,Y,Z` | Explicit finite sector coordinates in ly. |
| `--cantum can_XXXX --cantum-from-ae N` | Both required together; one open-ended administrative assignment to an existing Cantum. |

Years must be nonnegative safe integers. Explicit zero means 0 A.E.; omitted
years never become zero. The helper does not infer dates, date precision,
politics, governing relationships or names. For richer intervals/uncertainty,
edit the generated JSON according to the current schema and validate it.

## Generated records and validation

The sector entry has `id`, `entityType: "star_system"`, `discoveredAE`,
`colonizedAE`, `positionLY`, `nameHistory`, `cantumHistory`,
`publicDetailPath: "systems/<matching-id>.json"` and `infoCard`. Unknown values
are null. `knownByAE` appears only when supplied. Each of the six InfoCard fields
(`affiliation`, `class`, `crew`, `population`, `armament`, `description`) starts
null. No faction, population, history or description is invented.

The complete detail file contains `schemaVersion: "1.3.0"`, the matching `id`,
`entityType: "system_detail"`, the explicit CNU map and empty `objects: []` and
`zones: []`. No stars, stations or gates are automatically created.

The helper checks actual v1.3 `sectorSystem` and `systemDetail` definitions,
then the complete proposed dataset's schemas, relationships and navigation
freshness before writing. Existing invalid/stale data blocks creation. Creation
does not change the graph or run generation. Existing sector bytes/order are
preserved around one insertion; new JSON uses two spaces and a final LF.

The sector-derived inventory discovers the registered detail automatically.
**Restart `npm run demo` after registration** to regenerate its trusted import
mapping. The viewer still eagerly preloads all released details. Unregistered
files remain collision diagnostics, not published records. Unknown discovery,
name or position can prevent historical display; no visibility rules are bypassed.

## Add objects by editing JSON

Use `npm run idfind -- all` (or `cb`, `sta`, `gat`, `jhl`, `zon`, `lnk`) before
issuing permanent IDs; never reuse them. Edit the system's `objects[]` or
`zones[]` using the [actual v1.3 schema](../schemas/atlas-v1_3.schema.json).
The [v1.2 entity-family references](../examples/v1_2/README.md) remain useful for
shared shapes; their complete envelopes stay v1.2. The active
[working Demo](../public/datasets/demo/sector.json) illustrates v1.3 references.
Do not copy sample IDs or example histories into your system as defaults.

| Family / definition | Manual authoring requirements |
| --- | --- |
| `cb_` / `celestial` | Select a supported star, planet, moon, planetoid, asteroid, comet or other type; author discovery/name, local XYZ and six-field InfoCard. Supported variants are documented in the family guide. Do not infer diameter from type; omit unknown optional `physicalDiameterKm`. |
| Moons and other orbiting objects | `orbitingId` must reference a valid eligible parent in the same system. Follow existing position semantics; declaring a parent does not compute an orbit or coordinates. |
| `sta_` / `station` | Author supported station type/visual variant, construction, discovery and any decommissioning independently. Supply local position and nullable fields exactly as the schema requires. |
| `gat_` / `gateAuthoring`, `gate` | Short-range gates use the complete pair workflow below. Interstellar Jump Gates retain their independently authored position and same-type partner in another registered system. |
| `jhl_` / `jumpHole` | Author discovery, identity and position. A Jump Hole is not a constructed gate; do not invent a construction date. Pair through its interstellar declaration, using another Jump Hole. |
| `zon_` / `zone` | Store in `zones[]`, never `objects[]`. Use the actual ellipsoid, box or polygon-volume definition, map bounds and dated visibility fields. |

Required properties and enum values come from those definitions. Use null only
where permitted; required nonnullable values need explicit author decisions.
InfoCards contain dated fields, not inferred static fiction: affiliation periods
reference existing `fac_` or `can_` records through `entityId`; description periods
may use the supported entity references. Names resolve historically; absent or
broken references cannot be repaired by inventing a faction. Validate the full
dataset for uniqueness, period overlap, parent cycles, references, bounds and
historical eligibility. Administrative membership and governing history remain
distinct; this helper creates no political transition.

## Complete short-range gate pair

1. Allocate two distinct `gat_` identities and one `lnk_` identity.
2. Create **both physical gate records**, with all `gateAuthoring` properties.
   Each new gate **always** starts with `position: null` and
   `positionMode: "boundary_derived"`; never enter its XYZ manually.
3. Select two eligible anchor objects in the same system. Both need positive
   `navigation.boundaryRadiusCNU` and positions whose complete boundaries fit the
   chart. Each connected gate is dedicated to one lifetime link.
4. On one anchor, declare the complete relationship in `navigation.localLinks[]`.
   For example, the following is a **contextual fragment**, not a complete object;
   all IDs must be replaced with real allocated anchors/gates:

   ```json
   {
     "boundaryRadiusCNU": 1000,
     "localLinks": [{
       "id": "lnk_9901",
       "targetObjectId": "sta_9901",
       "sourceGateId": "gat_9901",
       "targetGateId": "gat_9902",
       "direction": "bidirectional",
       "fromAE": 353,
       "untilAE": null
     }]
   }
   ```

   These TEST numbers are illustrative author choices, never defaults. A valid
   chronology is gate A constructed/discovered 350, gate B constructed/discovered
   352, link activated 353 A.E. Physical knowledge/construction visibility is
   independent of route activation. Do not collapse these dates or copy them
   into real records without approval. The target anchor needs its own boundary;
   do not duplicate the same link declaration on it. A missing physical partner
   is not a complete route. Lifetime repointing is prohibited.
5. After completing the records, run the existing explicit offline generator:

   ```bash
   npm run connections
   npm run connections:check
   npm run validate
   npm test
   npm run build
   git diff --check
   ```

Only `connections` calculates the gate XYZ and writes them and the central graph.
`connections:check` is read-only. Review both changed system records and the
generated registry. See [NAVIGATION_AUTHORING](NAVIGATION_AUTHORING.md) for all
eligibility, chronology, dedicated-pair, interstellar, geometry and recovery rules.

An incomplete editing draft is not a release. A schema-valid `systemAuthoring`
record may have null derived positions yet still fail relationships or freshness.
A publishable Demo passes release `systemDetail`, full relationships and generated
navigation checks. The new-system command itself always leaves a valid dataset.
The TEST integration in `tests/authoring-scenario.mjs` exercises this entire
sequence on a temporary copy, never the live Demo.

## Safety and explicit recovery

Stop the Demo server and avoid concurrent editors/generation while applying.
The service snapshots all registered inputs plus ID Finder's collision inputs,
checks directory contents, validates before writing, and rechecks inputs and
destinations before installation. Symlink/junction/reparse paths are rejected.
The new detail is installed exclusively via a same-filesystem hard link from its
verified stage, then the verified sector stage replaces the old sector. This
requires local hard-link support; unsupported filesystems fail safely. There is
no claim of OS-level two-file atomicity or protection against a hostile process
changing paths in the final check/replacement interval.

An exclusive `.new-system-recovery.json` records the exact original/proposed
bytes, input SHA-256 hashes, operation identity and writer PID. Verified stages
and a sector backup use `.atlas-new-system-<uuid>.tmp` / `.bak` suffixes.
Ordinary errors roll back when safe; changed user files are never overwritten.
Cleanup failures report validated outputs with pending evidence instead of
claiming rollback. The journal is temporary recovery evidence, not another
registry. Neither authoring evidence nor these tools enter the production build.

Pending authoring state blocks new creation, navigation commands and Demo
startup/build. The navigation writer keeps its separate, unchanged
`.connections-recovery.json` contract; neither operation repairs the other's
state. Do not discard either journal or backup.

After a stopped authoring process, first preserve copies of all evidence and
inspect the journal and current files. Then:

```bash
npm run atlas:new-system -- --recover
npm run atlas:new-system -- --recover --apply
```

Recovery is an explicit **rollback**, not completion of the new registration.
Preview writes nothing; apply restores the exact previous sector, removes only
the verified new detail and removes verified evidence. A separate exclusive
recovery lock prevents two recovery commands. A possibly live writer PID blocks
recovery conservatively. Any changed input, target, artifact, malformed/partial
journal or orphan artifact requires creator inspection; it is not silently
repaired. A crash during recovery may leave the lock: confirm no process is active
and preserve evidence before creator-reviewed lock removal. Do not edit the
journal to force recovery. Re-run validation/freshness and review the diff.

Reusable Node-only services are in `scripts/system-authoring.mjs`; CLI parsing
is separate in `scripts/atlas-new-system.mjs`. They have no Three.js/DOM dependency
and expose no browser endpoint. Future approved Creator work can reuse these
rules without introducing a second data store.

## Test without changing the live Demo

```bash
node --test tests/system-authoring.test.mjs
node tests/preview-system-authoring.mjs
```

The first creates/deletes controlled OS-temp copies and checks preview, failure
injection, recovery, registration, eager loading and an audited build. The second
serves only a temporary TEST dataset at `http://127.0.0.1:5176/Velara_Atlas/`;
stop with Ctrl+C for cleanup. Run `tests/browser-system-authoring.mjs` through the
existing Chromium/MCP harness for discovery, gate chronology and navigation.
Existing Demo (5173), Development/calibration (5174) and governance fixture
(5175) retain their separate workflows. No public CLI test-root selector exists.
