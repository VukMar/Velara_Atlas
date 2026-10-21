# Proposed v1.3 entities and historical relationships — Phase 3C

**Status:** Architecture Phase 3C is complete and creator-approved. Its isolated
implementation and completion documentation are committed together. This remains
a provisional, test-only v1.3 contract; the active graphical Demo remains **v1.2**.
Phase 3D is the next proposed checkpoint and is not authorized. These TEST records introduce no MCR canon.

The exact provisional contract is [atlas-v1_3.schema.json](../schemas/atlas-v1_3.schema.json).
It uses Draft 2020-12 and offline references to established v1.2 spatial/property
definitions, with separate v1.3 envelopes and historical reference definitions.
It does not replace [the active v1.2 contract](DATA_MODEL.md), its wrappers or the
frozen v1.1/v1.2 regressions. Units, geometry, permanent identity, discovery,
construction, local-gate authoring and inclusive-start/exclusive-end conventions
are retained. v1.3 historical years must be nonnegative safe integers; null is
unknown/open-ended only where the field permits it, never year zero.

## Registry and faction files

A v1.3 sector requires `factionsPath: "factions.json"`. That registry contains
only `schemaVersion: "1.3.0"` and `factions[]` entries with `id` and `path`:

```json
{"id":"fac_9901","path":"factions/fac_9901.json"}
```

Names and histories appear only in the referenced record. The registry owns
registration; file identity must match. Paths must be precisely
`factions/<matching-faction-id>.json`, never URLs, absolute paths, alternate
separators, traversals, nested directories or symlink/reparse redirects. The
technical inventory sorts entries deterministically; source order is not rewritten.
Missing, duplicate, mismatched and malformed records fail rather than disappear.

Each complete faction file requires:

| Field | Meaning |
| --- | --- |
| `schemaVersion` | Exactly `1.3.0` |
| `id`, `entityType` | Permanent `fac_` plus at least four digits; `faction` |
| `factionType` | Descriptive organizational category, a lowercase underscore-separated slug of at most 64 characters, such as `intelligence_service`; not a canonical taxonomy or legal status |
| `nameHistory` | Dated names, or explicit null if not recorded |
| `legalStatusHistory` | Dated `lawful`/`unlawful` records, or null for unrecorded classification |
| `infoCard` | The existing six historical fields, including institutional `affiliation` |

`factionType` describes the organization. Dated `infoCard.class` can record changing
historical classifications for display; neither determines legal status. Rename,
reclassification or reassignment never changes the permanent ID. Continuance-era
names and later Cantum names require explicit authored intervals; the hierarchy
does not infer them. No separate institutional-affiliation property is introduced.

Non-null faction affiliation must target a registered Cantum and be covered by
explicit **lawful** status throughout its interval. Every unlawful interval must
be covered by explicit independent affiliation. Missing legal history is not
lawful; missing affiliation is not independence. A lawful faction may be either
independent or Cantum-affiliated. Physical operations inside a territory imply
neither affiliation nor sovereignty.

`can_` remains territorial Cantum identity. `fac_` denotes organizations, including
government, police, military, intelligence, private, research or unlawful groups.
No polity registry is added. `pol_` is reserved; `org_` remains legacy v1.2 only.
New v1.3 InfoCard/control references support registered `can_`/`fac_` identities;
unsupported namespaces fail instead of being reclassified as factions.

## Affiliation, administration and control

| Owner | Meaning of effective `infoCard.affiliation` |
| --- | --- |
| Cantum | Direct governing/suzerain Cantum; only `can_` targets |
| Faction | Official institutional Cantum relationship; only `can_` targets |
| Station and other supported records | Recorded relationship to registered `can_` or `fac_` |

System `cantumHistory` continues to identify **direct administration**.
`controlHistory` remains a separate dated field. Neither system membership,
control, object affiliation, location nor map color defines a Cantum's superior.
There is no `suzerainHistory` or duplicate faction-affiliation field.

| Condition at selected year | Result |
| --- | --- |
| Effective affiliation record with `entityId: null` | Independent |
| Null affiliation history or no effective period | Not recorded |
| Unknown/unsupported referenced ID | Unresolved; dataset validation fails |
| Registered entity with no effective name | Name not recorded; no future alias fallback |

The new null interpretation is opt-in v1.3 behavior, not a reinterpretation of
frozen v1.2 records. `datePrecision` and complete selected period records survive
resolution; approximate dates are not upgraded to exact historical claims.

## Pure resolution APIs

[`src/core/infocard-resolver.mjs`](../src/core/infocard-resolver.mjs) has no DOM,
filesystem, Three.js or field-rendering dependency. It reuses `assertYear()`,
`atYear()` and `resolveInfoCard()` from the existing historical resolver.

- `createEntityIndex(dataset)` accepts only the explicitly loaded v1.3 context,
  indexes Cantums/factions and rejects duplicate identities.
- `resolveEntityReference(id, yearAE, index)` returns identity, entity type, year,
  `status`, `name`, `label`, selected name/InfoCard/legal records, descriptive
  faction type and direct affiliation metadata. Status is `resolved`,
  `name_not_recorded` or `unresolved`.
- `resolveAffiliation(history, yearAE, index)` adds `independent` and `not_recorded`
  results and retains the selected affiliation in `record`.
- `resolveInfoCardPresentation(entity, yearAE, index)` returns all six selected
  InfoCard fields, replacing affiliation with the structured presentation result.
  A station's `affiliation.label` therefore uses the correct-year faction name.
- `resolveGoverningCantum(cantumId, yearAE, cantumsById)` returns direct Cantum,
  direct superior and period, traversed `path`/`steps`, and `governingCantumId`.
  Only status `independent_root` establishes a verified independent root.
  `not_recorded` leaves the root null, even after a partial chain. Unknown records
  return `unresolved`; cycles/overlapping effective parents return `invalid`.

Resolved history values are independent copies; callers must not mutate the
input index/records themselves. Invalid selected years throw rather than coerce.
No function fills historical gaps, repairs input or changes stored administration.

## Loading, validation and ID Finder

Phase 3B's inventory defaults remain v1.2-only. Internal explicit opt-in supports
the isolated fixture:

```js
import fs from 'node:fs';
import {readDatasetSource} from '../scripts/demo-files.mjs';
const {dataset} = readDatasetSource('tests/fixtures/v1_3', fs, {versions:['1.3.0']});
```

The import above is relative to a file in `tests/`; from root-level `node -e`, use
`./scripts/demo-files.mjs`. The result retains raw `texts` and adds `factions`
(registry) and `factionFiles` (Map keyed by permanent ID) to the dataset. Call
`structuralErrors(dataset)` and `validateRelationships(dataset)` before using it;
loading alone is structural, not full relational validation or publication approval.
No public root-selection flag, URL loader, browser route or Canon source is added.
Default `readDemoSource()`, Vite and the navigation command reject v1.3 selection.

`atlas-validation.mjs` compiles v1.1, v1.2 and provisional v1.3 separately.
`check-relations.mjs` reuses existing spatial/orbit/graph checks and adds
`entity-relations.mjs` for registry identity, references, legality and governance.
All historical `fromAE` and non-null `untilAE` boundaries are checked. Relationships
are constant between boundaries, so the checks cover short past cycles and the
final ongoing tail, not just the current year or sampled snapshots. Overlaps,
self-parenting, missing targets, unsupported superiors and cycles are errors.

ID Finder now accepts `fac` and retains `--demo`/`--public`, non-reserving
suggestions and legacy handling. Only a v1.3 sector enables bounded faction
registry/file diagnostics. Registered index/file mirrors count once; direct
unregistered faction files are labeled collision diagnostics and never join the
publication inventory. Internal `scanDataset({datasetRoot})` supports isolated
tests/review; no equivalent CLI flag is accepted. The live Demo has no factions.

## Test fixture and review

The [fixture guide](../tests/fixtures/v1_3/README.md) documents the TEST timelines.
Run from the repository root:

```bash
node --test tests/entities-v1_3.test.mjs tests/idfind.test.mjs
npm test
npm run validate
npm run connections:check
npm run build
```

Tests exercise the station's resolved presentation without activating v1.3 in
the graphical viewer. The existing Demo input audit rejects both the fixtures
and new resolver as bundle inputs. Calibration remains its separate JSON-backed
local environment; its facts and three radius choices are unchanged.

## Deferred Phase 3D integration

The live Demo stays v1.2. v1.3 navigation compilation, generation and freshness
activation are **not implemented**: the existing compiler explicitly rejects
v1.3. No validator disguises v1.3 data as v1.2. The fixture uses an empty graph;
structural/relational acceptance is not a complete v1.3 navigation-release claim.

A separate approved Phase 3D task must finalize pending v1.3 presentation fields,
coordinated Demo migration and navigation compatibility, activate the InfoCard UI,
and design/implement ultimate-governor field grouping and a universal radius.
This proposal deliberately retains existing per-Cantum presentation references;
it does not define or activate the future shared-radius renderer. Canon migration,
Atlas Creator, new-system tooling, new artwork and deployment remain separate.
