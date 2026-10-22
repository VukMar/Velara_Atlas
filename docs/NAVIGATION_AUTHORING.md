# Noncanonical v1.2/v1.3 navigation workflow

The creator-approved [navigation specification](SCHEMA_V1_2_NAVIGATION.md)
supersedes the v1.1 short-range branching rule. System object declarations are
the **authoring source of truth**. `connections.json` is the **generated,
Git-tracked runtime index**. The read-only viewer uses the same graph shape and
ordinary stored XYZ. Historical semantics remain compatible with the pure modern
resolver; the current viewer layout follows Checkpoint 3.6. This guide authorizes
neither Checkpoint 4 work nor canonical migration.

```text
Edit system JSON -> npm run connections -> npm run connections:check -> npm test -> npm run build -> review git diff -> commit/push manually
```

No command commits, pushes or deploys. Track both the graph and affected system
JSON together. Do not hand-edit the generated graph. Builds/dev startup run only
validation and the read-only freshness check; they never repair stale files.

## Approved normal-Demo chronology

The completed Phase 3F showcase adds only `lnk_0012` in `sys_0005`: physical gates
`gat_0021` / `gat_0022` are constructed at 350 / 352 A.E.; their bidirectional
route activates at 353. Their positions were generated explicitly from authored
boundaries. All eleven earlier links and gate coordinates remain unchanged.
See [DEMO_SHOWCASE](DEMO_SHOWCASE.md) for the ordinary viewer walkthrough.

## Authoring and release contracts

`schemas/atlas-v1_3.schema.json` defines the active Demo's v1.3.0 envelopes.
`schemas/atlas.schema.json` and its wrappers retain v1.2.0 for frozen/reference
records. Navigation authoring and geometry are shared across these versions. **Creator-confirmed creation rule:** every NEW short-range gate starts
with `position: null` and `positionMode: "boundary_derived"`. The author never
manually enters its XYZ. Create the gate records with permanent IDs, required
history, icon and InfoCard, and author the matching navigation relationships on
the relevant anchor objects. Complete dedicated pairs/declarations before generation;
a derived gate absent from authored links is rejected.

`gateAuthoring` and the complete `systemAuthoring` contract accept those initial
null positions. `gate` / `systemDetail` is the release stage and requires finite
XYZ. `npm run connections` computes the gate coordinates from authored navigation
relationships, writes positions into the corresponding system JSON records and
generates/updates `connections.json`. Follow with `npm run connections:check` to
verify consistency without rewriting data. The generator does not create the
physical gate records for the author. See [the focused example](../examples/v1_2/gate-short-range.json)
and [family guide](../examples/v1_2/README.md#gates-gat_---authoring-versus-generated-release).

Existing schema-valid legacy unconnected/XYZ states are retained for compatibility;
they do not alter the new-short-range-gate creation rule. Interstellar Jump Gates
and Jump Holes retain independently authored XYZ and their existing pairing rules.
No schema or generator change is implied by this documentation.

Celestial bodies, stations, Jump Gates and Jump Holes can declare an invisible
positive `navigation.boundaryRadiusCNU`. A local link lives once in its source
anchor's `navigation.localLinks[]`, naming `targetObjectId`, `sourceGateId`,
`targetGateId`, link `id`, direction and dated interval. Both anchors need
boundaries and both gates must be dedicated derived short-range gates in the
same system. A body may have several links using different physical gates.
Existing unconnected records may retain their compatible stored form; do not
use that as a workflow for manually positioning new short-range gates. A derived
gate with no declaration is rejected. Boundaries are navigation parameters, not zones,
celestial dimensions or gravity claims.

A Jump Gate/Hole may author one `interstellarConnection`: `id`,
`targetSystemId`, `targetObjectId`, direction and interval. Its target must be
the same transport type in another system. No reciprocal duplicate, endpoint
reuse or historical repointing is permitted, even in disjoint time intervals.
Source endpoint A determines directional meaning. No direction is assumed.

Every link preserves `fromAE <= year < untilAE` (null ongoing). Exact discovery,
confirmed-known-by and construction thresholds are checked separately for
released endpoints and local anchors. Known decommissioning requires a bounded
link ending no later than that year. Unknown dates stay unknown; supplied
`datePrecision` is copied, never promoted to exact. An expressly authored
public fallback endpoint ID is allowed under the existing disclosure contract;
it stays unverified, without reading or inventing unreleased object details.

## Generator and rewrite boundary

`scripts/navigation.mjs` is a nonmutating graph/coordinate compiler.
`scripts/connections.mjs` is the manual offline writer/check command. It accepts
only `--check`; no custom directory, URL, private folder or arbitrary data path
is accepted by the CLI. `scripts/dataset-inventory.mjs` derives registered paths
from the validated sector beneath `public/datasets/demo/`; `demo-files.mjs`
retains exact raw text and system-to-file associations for the writer. Only
`systems/<matching-system-id>.json` declarations are admitted; null is archival.
Unregistered files are not writer targets. Symlink/reparse paths are refused. The IO root argument
in exported functions exists for isolated failure tests, not a publishing API.

The compiler uses full XYZ CNU and `u = (B-A)/|B-A|`, placing gates at `A+rA*u`
and `B-rB*u`. Results round to **six decimal CNU places**, with negative zero
normalized to zero. Finite coordinates, complete boundary spheres and rounded
results must fit full declared map extents. Zero separation, touching/overlapping
boundaries and rounded coincident gate positions fail. Nothing converts ly to
CNU, models orbits, or changes moon-relative placement.

The writer may replace only:

- `public/datasets/demo/connections.json`: complete source-version v1.2/v1.3 registry, sorted by
  permanent link ID, deterministic two-space JSON and final LF.
- `position` value spans of explicitly derived short-range gates in the
  allowlisted system files. Other fields, unrelated positions, histories,
  `orbitingId`, object order and bytes outside those value spans are preserved.

`connections:check` recalculates both outputs, names stale link/gate IDs and
fails nonzero while writing nothing. Registry format/order is also checked.
Running generation again when current opens no output files for writing.
There is no positions sidecar or runtime/build generator.

## Safe replacement and manual recovery

All input declarations and the complete prospective release dataset are
validated in memory first. Changed files are staged alongside their targets;
previous bytes are backed up and verified. Staged JSON is parsed and validated
again. Inputs are checked for concurrent edits before replacement. Every
replacement is verified with a fresh read and freshness validation before
backups are cleaned up. Multi-file replacement **is not atomic**.

The writer creates `public/datasets/demo/.connections-recovery.json` exclusively
as its lock/journal, recording approved relative targets, stage/backup paths and
SHA-256 hashes. Temporary files end in `.connections-<uuid>.tmp` and `.bak`.
These recovery artifacts are ignored by Git and excluded by the build allowlist;
the generated graph itself is tracked. Writers and checks refuse a pending
journal. Ordinary failures attempt verified restoration. If restoration fails,
the journal/backups remain and the command reports failure with their location.

For interruption, failed rollback or cleanup:

1. Stop other generator processes and retain all journal/stage/backup files.
   Inspect the journal locally; targets must be `connections.json` or one of the
   registered system details declared by the sector, all within `public/datasets/demo/`.
2. Compare each target and backup with `previousSHA256`/`nextSHA256`. A backup
   may be absent if interruption preceded backup creation. Do not overwrite a
   concurrently edited file: compare and preserve it separately first.
3. To restore a prior artifact, copy its **verified** backup to that exact target.
   For `previousMissing: true`, remove a newly created target only after checking
   that its current hash matches `nextSHA256`. Never bulk-delete the demo folder.
   Recover absent backups from the secured Checkpoint 3 commit only after review;
   do not blindly replace newly authored system declarations with an older file.
4. Once files are inspected/restored, remove only the transaction's exact staged,
   backup and journal files. Run `npm run connections:check`; if authored inputs
   intentionally changed, run the manual generator, then check/test/build and
   review Git diff. A failed check must not be ignored for publication.

Tests inject staging, replacement and rollback failures, including the retained
recovery journal. They cannot guarantee behavior under power loss, filesystem
corruption or hostile concurrent edits. Backups are on the same filesystem;
they are a recovery aid, not independent disaster-recovery storage.

## Historical demonstration migration

This section records the original `4ff0ecb` migration, not a current live-data
inventory. The fixed `tests/fixtures/v1_2/` preserves its nine-link scenarios;
the live demo is author-editable and currently has an additional local link.
Read actual declarations and run the read-only checker/ID Finder for today's
records. Do not overwrite live edits using this historical table.

Checkpoint 3 was secured in `32f43d6` before editing. The six accepted v1.1 links
are preserved in frozen public-safe `tests/fixtures/v1_1/` files. Tests verify
the exact migration below, retaining each original link ID, dates and direction.
When the existing index is still v1.1, generation also explicitly refuses to lose
any accepted link or silently change its interval, direction, transport or endpoint
systems. After v1.2 generation, intentional additions/removals follow declarations.

| Link | v1.2 dedicated endpoints | Change |
| --- | --- | --- |
| `lnk_0001` | A `gat_0001`–`gat_0002` | Retained; colony-to-station boundaries |
| `lnk_0002` | A `gat_0009`–`gat_0003` | New source gate replaces reused `gat_0001` |
| `lnk_0003` | B `gat_0005`–`gat_0006` | Retained; planet-to-station boundaries |
| `lnk_0004` | B `gat_0010`–`gat_0007` | New source gate replaces reused `gat_0005` |
| `lnk_0005` | A `gat_0004`–B `gat_0008` | Existing Jump Gate pairing retained |
| `lnk_0006` | A `jhl_0001`–B `jhl_0002` | Existing Jump Hole pairing retained |
| `lnk_0007` | C `gat_0013`–`gat_0014` | New local pair, active from 720 |
| `lnk_0008` | A `gat_0011`–C `gat_0012` | New Jump Gate pair, active from 850 |
| `lnk_0009` | A `gat_0015`–`gat_0016` | Relay station to Jump Gate boundary, from 550 |

System C is discovered at 600, uses its survey name until 700 and belongs to
`can_0002` from 700. Its orange territory (`#C99160`, radius 18 ly) is a separate
fixture presentation choice. Original blue `can_0001` keeps A/B and radius 24 ly,
with contributors at 210/330. All new names/dates/boundaries/colors are test-only,
not Continuance history. System A's nebula and asteroid field, System B's polygon
hazard, existing non-short-range positions and all original histories remain.

## Compatibility and verification

The old schema's `$id` is preserved in `atlas-v1_1.schema.json`; the v1.2 schema
has a distinct `$id`. Main wrappers reference the current v1.2 definitions.
Frozen v1.1 tests retain their original branching and historical regression
expectations. Navigation safety/migration regressions use the fixed v1.2 snapshot;
strict release/freshness and viewer/browser checks also exercise the live demo. Canonical
v0.1 history and its resolver remain unchanged. The historical resolver ignores
authoring declarations and needs no adapter or new history interpretation.

The current MCP suites `tests/browser-checkpoint3.mjs` and
`tests/browser-navigation-v1_2.mjs` require the graphical Demo server (`npm run demo`, port 5173) because they inspect or
intercept its public demo modules. `tests/browser-layout3_6.mjs` and
`tests/browser-touch3_6.mjs` support the graphical Demo or production preview under
`/Velara_Atlas/`. They are MCP entry points, not automatically discovered Node
tests. See [current verification and limits](REPOSITORY_AUDIT_3_6.md).
The [original implementation report](NAVIGATION_V1_2_RESULTS.md) remains historical
evidence for generation, migration and recovery; its counts/layout are not current.

## v1.3 activation and migration review

The compiler validates the source version and emits that same graph version.
Phase 3D migration changed the live graph only from `1.2.0` to `1.3.0`; every
link property and derived XYZ remains unchanged. The explicit offline command
updated the graph, then read-only checks and idempotence verified it. No version
masking, writer redesign, build-time repair or new route is introduced. Frozen
v1.2 generator/recovery tests remain, with additional v1.3 writer coverage.
See the [exact crosswalk](DATA_MODEL_V1_3_PROPOSAL.md#phase-3d-demo-migration-crosswalk).

## Separate system-creation transaction

Completed, creator-approved Phase 3E provides `atlas:new-system`. It creates an
empty detail and registers it, but never generates
navigation or gates. See [MANUAL_AUTHORING](MANUAL_AUTHORING.md) for creation and
an explicit 350/352/353 A.E. TEST gate chronology. Authoring drafts, schema-valid
inputs and navigation-current releases are different stages.

A pending `.new-system-recovery.json`, recovery lock or orphan authoring artifact
blocks navigation commands and Demo startup/build. It is a different operation
from this guide's `.connections-recovery.json`; neither journal format nor the
navigation recovery procedure changed. Finish creator-reviewed authoring recovery
before running generation. Never delete evidence merely to bypass these guards.
