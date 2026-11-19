# Canonical candidate description migration

Local validation completed 2026-11-19. After reviewing the candidate in the Atlas, the creator approved the migration and authorized its commit and push to existing PR #4. This approval covers public Git disclosure of the imported descriptions and this technical document. Merge and website deployment remain separately gated.

The one-time import replaces only `systems[].infoCard.description` in `canonical-dataset-test/sector.json` and `cantums[].infoCard.description` in `canonical-dataset-test/cantums.json`, using the approved JSON objects without rewriting their text.

| Collection | Entities | Previous descriptions | Imported descriptions |
| --- | ---: | ---: | ---: |
| Star systems | 70 | 87 | 199 |
| Historical Cantums | 7 | 27 | 35 |
| Total | 77 | 114 | 234 |

Cantum counts are Drevnasel 9, Visshum 5, Okeanberg 6, Rekdolin 6, Zaklun 3, Gornebes 3 and Vodravan 3. Visshum's fifth and final description starts in 1175; no separate 1200 description is introduced.

All 70 system identities matched uniquely through historical names and stable source identities, independently verified against the approved XYZ positions. All seven Cantum IDs and letters were verified individually. No new entity was added. Temporary identity matching and source evidence remain outside this repository.

Every imported four-field object matches its pinned source exactly, including `text`, paragraph breaks, `fromAE`, `untilAE` and `datePrecision`. The collection retains 209 `exact`, seven `circa` and 18 `confirmed_by` records. Numeric ends are exclusive and starts inclusive; intervals are ordered, contiguous and non-overlapping within each collection. Each final endpoint is null, meaning no scheduled successor. Historical knowledge remains bounded by 1200 A.E.; null adds no future facts or continuing political conditions.

Comparison with the starting candidate verifies identical bytes outside the 77 permitted description-value spans. All other fields, including unrelated numeric 1201 endpoints, are preserved. `connections.json`, `factions.json` and `presentation.json` are byte-identical. The engine, schemas, resolvers, navigation, assets, NEXUS homepage and noncanonical Demo are unchanged.

Validation used the supported dataset loader and actual Atlas functions against the candidate explicitly. Strict v1.3 schema, cross-file relationships and read-only connection freshness passed. Exact-source comparisons cover all 234 records. Historical checks cover every year from 0 through 1200: 92,477 direct description selections and 92,477 Atlas entity/year checks, plus 1,171 explicit boundary cases and initial visibility for all 70 systems. Targeted checks cover qualified dates, historical Pustosh names, Visshum's transition and historical Rekdolin after 1175. State/model checks retain selection across 224 forward/backward transitions.

Shumdom remains visible from 760 with no description until 776; Morluk remains visible from 812 with no description until 838. The resolver correctly returns null descriptions during these gaps. Their first descriptions align with official registration; earlier Atlas visibility and technical-ID display are retained. Aligning the earlier visibility dates with the registration convention would be a separate historical-data decision.

| Repository check | Dataset/scope | Final exit code |
| --- | --- | ---: |
| `npm test` | Existing legacy, versioned, synthetic and normal-Demo regressions; 371 passed, zero failed/skipped | 0 |
| `npm run connections:check` | Fixed noncanonical Demo | 0 |
| `npm run validate` | Fixed noncanonical Demo | 0 |
| `npm run build` | NEXUS homepage and noncanonical Demo, including output audit | 0 |
| `npm run release:check` | Local two-page Demo build/disclosure audit; no deployment | 0 |
| `git diff --check` | Local change whitespace | 0 |

The first sandboxed test run exited 1 with 43 temporary-path access failures; rerunning with the required filesystem access passed all 371 tests. Local checks used Node 20.5.1/npm 9.8.0; no new Node 24 or hosted-CI run is claimed. The ordinary commands do not validate this candidate; the separate candidate checks above do.

Chromium verified 87 open-InfoCard cases using the original viewer and a byte-identical isolated candidate. Year changes in both directions preserved the selected entity and exact description. No browser errors occurred. Long descriptions scroll without horizontal overflow at 1440×1000 and 390×844. Existing `#description` styling uses `white-space: normal`, so paragraph breaks collapse visually even though dataset and DOM strings preserve them. This presentation defect is reported for separate review; no UI change is included. Mobile-size browser emulation is not physical-device or cross-browser certification.

The normal-Demo browser smoke check also passed: five original system IDs, four detail files, two factions and the unchanged 24-ly radius, with zero browser errors. The NEXUS landing page created no renderer canvas.

Private source copies, tooling, per-record hashes, temporary matching and screenshots remain outside Git. The production output audit excludes candidate data. The approved change comprises the two candidate JSON files and this document; it does not change the live website. No version increment is recommended for this candidate integration; version 0.5.0 is unchanged.
