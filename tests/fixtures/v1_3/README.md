# NONCANONICAL v1.3 Phase 3C integration fixture

These synthetic TEST records are isolated developer evidence, not MCR history,
runtime Demo data, a production publication candidate or a frozen v1.2 migration.
See [the provisional contract](../../../docs/DATA_MODEL_V1_3_PROPOSAL.md).

Seven JSON files form the fixture: sector, Cantums, an empty connections registry,
one system detail, a compact faction registry and two authoritative faction files.
No presentation file or new territory behavior is needed. Registry files use
`schemaVersion: "1.3.0"`; faction files also carry that version explicitly.

| Identity | Authored test history |
| --- | --- |
| `fac_9901` | Intelligence organization; name/class changes at 500; lawful 300–899, unlawful 900–999, lawful again from 1000; affiliated to A 300–699 and explicitly independent from 700 |
| `fac_9902` | Unlawful independent organization from 200 |
| `can_9901` / A | Explicitly independent from 0 |
| `can_9902` / B | Independent before 800; governed by A 800–999; independent again from 1000 |
| `can_9903` / C | Independent before 850; governed by B 850–1099; independent from 1100 |
| `can_9904` / D | Superior relationship unrecorded; first recorded name at 400 |
| `sys_9901` | Directly administered by B throughout; released TEST star and station |
| `sys_9902` | Directly administered by C throughout; intentionally archival-only |
| `sta_9901` | References `fac_9901`, showing its historical name in the pure InfoCard presentation result |

All intervals have inclusive `fromAE` and exclusive `untilAE`; the table's inclusive
year ranges are shorthand. The first faction name retains `circa` precision.
It is not promoted to an exact real/canonical event date. Static `factionType`
and dated descriptive class remain separate from lawful/unlawful classification.
Before a name or affiliation period exists, the resolver reports uncertainty
instead of borrowing a future name or declaring independence.

At 850–999, C's chain is C → B → A. At 1000–1099 it is C → B, with B as the
verified independent root. Direct system administration never changes. D's
unknown superior never produces a proven sovereign root.

Run `node --test tests/entities-v1_3.test.mjs tests/idfind.test.mjs` from the
repository root. For manual inspection without a new launcher/CLI root flag:

```bash
node --input-type=module -e "import fs from 'node:fs'; import {readDatasetSource} from './scripts/demo-files.mjs'; import {structuralErrors} from './scripts/atlas-validation.mjs'; import {validateRelationships} from './scripts/check-relations.mjs'; import {createEntityIndex,resolveInfoCardPresentation,resolveGoverningCantum} from './src/core/infocard-resolver.mjs'; const {dataset:d}=readDatasetSource('tests/fixtures/v1_3',fs,{versions:['1.3.0']}); console.log(structuralErrors(d),validateRelationships(d)); const index=createEntityIndex(d); console.log(resolveInfoCardPresentation(d.detailFiles.get('sys_9901').objects[1],499,index).affiliation); console.log(resolveGoverningCantum('can_9903',850,index));"
```

Both error lists should be empty; the station uses `TEST Intelligence Office`,
and C's verified governing root is `can_9901`. Change only the query year in the
command to inspect transitions. Do not change the active Demo or run its writing
generator against this fixture: v1.3 generator activation is deferred to Phase 3D.
Negative tests mutate temporary copies and preserve this accepted test baseline.
