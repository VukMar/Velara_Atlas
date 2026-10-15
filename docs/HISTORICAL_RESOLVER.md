# Noncanonical v1.1 historical resolver — Checkpoint 1

`src/core/history.mjs` resolves **released v1.1 JSON only**. It has no imports,
I/O, renderer, DOM, loading, framework or backend dependency. It does not adapt
legacy v0.1 records or replace `src/timeline/resolve.mjs`. The fixtures in
`examples/demo_atlas/` remain noncanonical and outside `public/data/`.

Inputs must already pass the strict Ajv schema and cross-file relationship
checks. These functions are historical selectors, not a second schema validator
or a publication/security filter. Never supply private records to a public app.
All returned JSON objects and arrays are fresh copies: callers can edit a result
without changing input or another snapshot. Input order is preserved.

## API

Every `yearAE` argument must be a **nonnegative safe integer**; zero is valid.
Invalid years throw `RangeError`, including null, strings, booleans, fractions,
negative numbers, infinities and unsafe integers. The functions do not clamp to
the sector timeline: a future UI must enforce its dataset's supported range.

| Export | Contract |
| --- | --- |
| `assertYear(yearAE)` | Validate and return the year. |
| `activeAt(record, yearAE)` | `fromAE <= yearAE < untilAE`; only explicit null means ongoing. Reject malformed interval endpoints. |
| `atYear(history, yearAE)` | Copy the matching dated record, or return null for absent history/gaps. Throw for multiple matching records. No sorting. |
| `resolveInfoCard(infoCard, yearAE)` | Independently select all six fields: affiliation, class, crew, population, armament, description. |
| `resolveKnowledge(entity, yearAE)` | Return `{known, basis, fromAE, discoveredAE, knownByAE}`. Basis is `discovered`, `known_by` or `unknown`. |
| `isHistoricallyVisible(entity, yearAE)` | Require chronological knowledge and, for stations/gates, construction/decommissioning eligibility. |
| `resolveCantum(cantum, yearAE)` | Resolve names/status/InfoCard; return null when neither a name nor status interval applies. |
| `resolveObject(entity, yearAE)` | Resolve an eligible local object or zone, otherwise null. Copy its static spatial/type metadata. |
| `resolveObjects(detail, yearAE)` | Resolve/filter `objects[]` in source order. |
| `resolveZones(container, yearAE)` | Resolve/filter optional `zones[]` on a sector or system detail. |
| `resolveSystem(system, yearAE, detail = null)` | Resolve index eligibility, placement, publication and optional supplied public detail. |
| `resolveCatalogue(sector, yearAE)` | Eligible system states, including unplaced and archival records. Details are not loaded. |
| `resolveConnections({sector, connections, detailFiles}, yearAE)` | Filter dated links against eligible indexed systems and available endpoint details. `detailFiles` is a Map keyed by system ID, as in the existing validator. |

`atYear` also handles other approved dated values without interpreting their
payload. Selected dated records keep their `datePrecision`, start/end and other
metadata. Approximate and confirmed-by boundaries remain qualified display
boundaries. The module never infers an event date from those labels.

Entity snapshots expose `name`/`nameRecord`, `cantumId`/`cantumRecord`,
`status`/`statusRecord`, `controlId`/`controlRecord`, and `infoCard`. An absent or
not-yet-applicable record is null. Administration, control, status and InfoCard
affiliation resolve independently. None supplies a default for another.
Full source history arrays are not included in entity snapshots.

## Knowledge, existence and colonization

- Exact integer `discoveredAE` starts visibility inclusively. With
  `discoveredAE: null`, an optional integer `knownByAE` starts conservative
  visibility inclusively, retaining `discoveredAE: null` and basis `known_by`.
  Neither date means the entity is not chronologically displayable. Other fields
  such as names, construction and population do not establish public knowledge.
- `resolveKnowledge` is a low-level diagnostic selector: it may report a future
  public knowledge threshold with `known: false`. Use eligible entity snapshots
  for catalogue/InfoCard content, rather than displaying that diagnostic directly.
- Stations and gates must also have reached any recorded `constructedAE` and
  must precede any recorded `decommissionedAE` (exclusive). Null construction
  does not invent a date: confirmed knowledge is evidence the object existed by
  that year. Decommissioned objects are omitted from active maps; this does not
  assert physical destruction or erase the underlying archival record.
- `colonization` is `not_yet_colonized` before a recorded settlement year,
  `colonized` from that year, or `unknown` when no year is recorded. It describes
  the initial settlement milestone, not proof of present habitation or permanent
  occupancy. An existing planet remains visible before settlement. Null does not
  prove an uninhabited planet, and no population count is derived from this state.
- InfoCard null means no effective published value; `{count: null}` remains an
  effective record with unknown quantity; `{count: 0}` is a recorded zero.
  Null armament never becomes “unarmed.” Descriptions use their own intervals.

## Catalogue, maps and public routes

`resolveSystem` returns these states:

- `not_known`: only ID, year and false catalogue/marker eligibility; no future
  names, InfoCards or details.
- `archival_fallback`: known index with `publicDetailPath: null`. Supplied stale
  detail is ignored. The caller can use the sector's approved NEXUS fallback copy.
- `map_available`: the index provides a public detail path. `detail: null` means
  no detail was supplied to this pure function, not a successful fetch or a
  technical error. A supplied detail must match the system ID. Its copied map,
  filtered objects and zones are returned, including valid empty historical maps.

`positionLY: null` sets `markerEligible: false` without removing a known catalogue
record. No origin or coordinates are manufactured. Sector positions remain ly;
local positions remain in the detail map's CNU context. `orbitingId` never changes
absolute coordinates. Geometry is copied without generating particles or shapes.

There is no full/partial publication flag in v1.1. A released one-object detail
is `map_available`; the resolver does not label it complete, demand other objects,
or invent a `visibility` property. Loading, parsing and validation errors must be
handled separately by a future loader, never relabeled as archival fallback.
Standalone object/zone helpers require the caller to establish parent eligibility;
`resolveSystem` handles the system check before resolving its children.

Connections retain their ID, transport type, direction, endpoints, precision and
interval. They require the selected year to be within the connection interval,
both systems to be known and each released endpoint to be historically visible.
A missing/unloaded released detail or missing released object defers the route.
An indexed archival endpoint is allowed without its unpublished detail and is
marked `unverified_archival` in `endpointVerification.a` or `.b`; inspected
eligible endpoints are marked `verified`. No unpublished object is synthesized.
An unverified route is public route metadata, not a claim that its unpublished
endpoint's construction or operational status was checked. No reachability,
traversability, projected line or endpoint coordinates are inferred. Consumers
must separately check positions for drawing and respect direction for navigation.
The existing validator still enforces graph types, global partner exclusivity
and cross-file references before resolution.

## Contract observations and deferred work

- Older architecture/viewer/visual-policy paragraphs describe zones, nullable
  icons, visual variants, known-by and presentation settings as pending; their
  appended v1.1 corrections and the actual v1.1 schema supersede those statements.
  Wrapper schema titles still say v1.0, but reference the v1.1 definitions.
- The relationship validator checks exact endpoint discovery and construction
  against connection starts, but currently permits a start before `knownByAE` or
  an end after endpoint decommissioning. Resolution filters both historical cases
  conservatively; no schema/validator behavior is changed in this checkpoint.
- Zones have discovery/known-by and dated InfoCards, but no existence/expiry
  interval in v1.1. Their visibility follows knowledge; no zone expiry is invented.
- Timeline configuration defines `startAE` and `defaultAE`, without an explicit
  latest-published-year field. Range configuration for a future UI needs review.
- Optional jumpable event derivation is deferred. Scalar construction,
  settlement and discovery fields lack per-date precision metadata, while period
  boundaries may be qualified or unspecified. A separate event-source contract
  is needed before presenting those dates as exact historical events. In
  particular, `knownByAE`, `circa` and `confirmed_by` are not exact event dates.
- No viewer, Vite/Three.js setup, assets, deployment, editor or canonical migration
  is part of Checkpoint 1. Checkpoint 2 requires explicit creator approval.

## Noncanonical usage

Run from the repository root in Node (or reuse an already validated public record):

```javascript
import {readFileSync} from 'node:fs';
import {resolveSystem} from './src/core/history.mjs';

const sector = JSON.parse(readFileSync('examples/demo_atlas/sector.json', 'utf8'));
const earlier = resolveSystem(sector.systems[0], 209);
const later = resolveSystem(sector.systems[0], 210);
console.log(earlier.name, earlier.cantumId); // TS-01, null
console.log(later.name, later.cantumId);     // Test System A, can_0001
```

`npm test` includes `tests/history-v1_1.test.mjs`, the unchanged legacy checks,
existing transport/schema regressions, and strict demo validation. New tests use
only demo JSON and explicitly synthetic in-memory variants, with schema and
relationship checks on valid variants. No fixture is promoted to public lore.
