# Settlement/cartography review verification

Local environment: Windows, Node 20.5.1/npm 9.8.0. CI uses Node 24 on Ubuntu and Windows. These results concern PR #4's settlement correction; older `cantums-*` screenshots retain the superseded pre-clarification appearance.

The local standard checks passed: `connections:check`, `npm test` (**374 tests**, plus legacy/Demo checks), `validate`, `build`, and `release:check`. Candidate schema/navigation, deterministic rebuild and **31 canonical tests** passed, including the all-70 audit reproducibility assertion. `git diff --check` passed. Hosted matrix results for the final SHA are reported on the updated PR.

Tests now cover all integer years 0–1200, every settlement's preceding/at/following years, 17 systems without documented settlement, seven formation boundaries, c.970 transfers, annexation versus civil administration, occupation/liberation gaps, all eight neutral borders, three Pustosh withdrawals, Lesgrad's continued affiliation, exact coordinate tokens, 2-LY radius, fitted labels, InfoCard distinctions, historical alias search, disclosure and unchanged production output. A machine audit generated from the resolver covers all 70 identities.

The browser callback **passed all 47 selected years with zero application/console errors**, including 1004, 1126, 1137 and 1138 in addition to formation, naming, sovereignty, withdrawal and settlement checkpoints. It checked every rendered contributor's settlement/association, all seven historical labels across applicable years, the known-by Putluk card and survey search, regional-only and neutral/excluded cards, separate occupation, both cameras, archival fallback and five denied non-runtime input requests. The 1200 perspective view had six envelopes and six visible nameplates. [Machine results](affiliation-browser-results.json) and requested screenshots are retained below. The independent Demo passed a separate browser check at 1200 and 850: radius 24 LY, five/four systems, governing groups two/one, with no candidate key.

The walkthrough exposed an existing candidate key error at unrecorded Cantum-status intervals: calling `replaceAll` on a null status. The key now displays a historical-status gap instead of inventing a government. Initial browser-harness issues (hidden search input and compositor inspection property) were corrected in the callback. No historical data was changed for those harness errors.

A local repeat of the default suite, concurrent with browser verification, had 373 passes and one `ENOTEMPTY` failure in an existing inventory-test temporary-directory cleanup hook. Its assertions did not report a map/data failure. Both an earlier full run and the final isolated retry **passed all 374**, without changing the test or historical data. Hosted CI is independently required for the final commit.

| Requested year/view | Screenshot |
| --- | --- |
| 0 | [Top-down](affiliations-0-top.png) |
| 345 | [Top-down](affiliations-345-top.png) |
| 745 | [Top-down](affiliations-745-top.png) |
| 970 | [Top-down](affiliations-970-top.png) |
| 1008 | [Top-down](affiliations-1008-top.png) |
| 1138 | [Top-down](affiliations-1138-top.png) |
| 1175 | [Top-down](affiliations-1175-top.png) |
| 1200 | [Top-down](affiliations-1200-top.png), [perspective](affiliations-1200-3d.png) |

Default production and the independent Demo retain the 24-LY radius and governing aggregation. No deployment, merge, version change, other-browser or physical-device coverage is claimed. The existing large-bundle advisory remains. All private source material and confidential identities/positions stay outside Git.
