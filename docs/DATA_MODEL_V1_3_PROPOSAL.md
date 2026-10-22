# v1.3 entities, historical governance and influence — accepted Phase 3D contract

**Status:** Phase 3D is complete and creator-approved. Its implementation and
completion documentation are committed together. The active NONCANONICAL Demo
uses this accepted v1.3 contract. Introduced as an isolated Phase 3C proposal,
this document retains its filename for link continuity and its design history.
Phase 3E safe local authoring is complete and creator-approved; Phase 3F integration/showcase and overall Architecture Phase 3 are complete and creator-approved; Phase 4 and later remain unauthorized. Test records and the provisional 24-ly
Demo radius introduce no MCR canon.

The exact v1.3 contract is [atlas-v1_3.schema.json](../schemas/atlas-v1_3.schema.json).
It uses Draft 2020-12 and offline references to established v1.2 spatial/property
definitions, with separate v1.3 envelopes and historical reference definitions.
It extends [the shared model](DATA_MODEL.md) without changing v1.2 definitions,
wrappers or frozen v1.1/v1.2 regressions. Units, geometry, permanent identity, discovery,
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

The shared inventory and navigation loader now support v1.2 and v1.3. Production
selection is still fixed to the approved Demo root. Explicit internal root injection
supports the isolated fixture:

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
`readDemoSource()`, the validated Vite virtual module and navigation commands
accept supported source versions without masking. Every registered detail and
faction record is eagerly preloaded. Only declared paths enter build admission;
`publicDir: false`, exact SVG admission and output audits remain in force.

`atlas-validation.mjs` compiles v1.1, v1.2 and v1.3 separately.
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

Tests exercise pure and graphical station presentation. The existing Demo input
audit rejects isolated fixtures, while explicitly admitting the pure resolver.
`tests/governing-influence.test.mjs` covers radius, temporal grouping, elevation,
labels, InfoCards and versioned navigation/writer safety. The local browser
fixture and MCP entry point are documented in [README](../README.md#historical-governing-influence-phase-3d).
Calibration remains JSON-backed and v1.2-compatible; its facts and radii are unchanged.

## Universal radius and governing fields

v1.3 requires `presentationPath: "presentation.json"` and one finite positive
`presentation.territoryOverlay.radiusLY`. Palette entries allow colors only; per-Cantum radii
are invalid. Opacity, thresholds, enablement and fallback color retain their
existing meanings. `fallbackRadiusFraction` is retained for compatibility but
never supplies a replacement v1.3 radius. A missing/invalid radius fails validation
or political grouping; it is never inferred from chart width. The 3C political fixture is extended with that presentation envelope; its
accepted faction/hierarchy histories stay intact.

`resolveAtlas()` derives `administrativeCantumId` from original `cantumHistory`
and `governingCantumId` from `resolveGoverningCantum()`. Both the administrative
Cantum and governing root require historically eligible status before shading.
Missing governance contributes no sovereign overlay. All valid system points of
one governor are sorted by system ID and combined into one Gaussian sum before
flat pixels, perspective envelopes or islands are calculated. Colors, names and
sigils come from that governor. Administrative identity remains in InfoCards.

Envelope and anchor consumers validate the point's ID, position and derived
governor, preserving legacy direct-Cantum checks for v1.2/calibration. Subordinate
systems retain their own Y elevations. The existing half-height
`clamp(radius * .30, .5, 3)`, interpolation, clipping, opacity and disposal are
unchanged. Cache keys include grouped identity/contributors/coordinates, radii,
thresholds and elevations where relevant; labels also include historical names
and sigils. Conquest and independence cannot reuse a different political state.

## Phase 3D Demo migration crosswalk

Baseline: `bdb19fa8e84ce9dc29ad99e089a7f83b919cea94`. Only the active NONCANONICAL
Demo was migrated. Frozen examples/fixtures and legacy canonical data stay intact.

| Files/values | Authorized change |
| --- | --- |
| `sector.json`, `cantums.json`, `presentation.json`, all three `systems/sys_000*.json` | Envelope `schemaVersion` 1.2.0 to 1.3.0 |
| `sector.json` | Added `factionsPath: "factions.json"` |
| New `factions.json` | Version 1.3.0, empty `factions[]`; no invented institutions |
| `cantums.json` / `can_0001` | Replaced null affiliation with TEST independence `[0, null)`, exact, null entity target; matches existing synthetic eligibility |
| `cantums.json` / `can_0002` | Replaced null affiliation with TEST independence `[700, null)`, exact, null entity target; matches existing synthetic eligibility |
| `presentation.json` | Removed palette radii 24/18; added shared `territoryOverlay.radiusLY: 24`; all other settings unchanged |
| Generated `connections.json` | Explicit `npm run connections` changed only version 1.2.0 to 1.3.0; all links and derived XYZ unchanged |

The 24-ly value is provisional, never canonical. A's field stays the same. B's
isolated half-field radius grows 18 to 24 ly (+33.33%); its unclipped isolated
area at a fixed threshold grows by 16/9 (+77.78%). Chart clipping and overlaps
can affect visible area. At threshold 0.35 the isolated footprint extent grows
from approximately 22.15 to 29.54 ly. On the actual clipped Demo chart, a 256x256 threshold-0.35 sample measures
B at 1,539.0625 to 2,543.75 square ly (3,940 to 6,512 cells); A stays
5,987.5 square ly (15,328 cells). These are sampled overlay footprints, not
legal territory measurements. No opacity/threshold/intensity compensation is applied. These changes are intentionally available for creator visual review.

The v1.3 armament period now correctly references the existing weapon-system
record definition, preserving the Demo's authored weapon descriptions. This fixes
an unused provisional-schema reference to sector-system records exposed during
activation; it does not change weapon records or frozen schemas.

## Deferred work

Phases 3A-3F and overall Architecture Phase 3 are complete and creator-approved.
Phase 4 is next proposed and requires separate authorization. Canon
migration, Atlas Creator, new artwork and deployment are not implemented.

See [MANUAL_AUTHORING](MANUAL_AUTHORING.md) for the v1.3 empty-system helper,
nullable history and complete object/navigation editing workflow.

## Completed Phase 3F showcase

The accepted contract now has a curated normal-Demo example of factions, a new
system and B's dated subordination/independence. This adds no schema fields or
resolver semantics. The preceding Phase 3D crosswalk remains its original migration
evidence. See [DEMO_SHOWCASE](DEMO_SHOWCASE.md) for the subsequent additive data changes.
