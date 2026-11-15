# Settlement eligibility and historical cartography correction

This review iteration updates PR #4 on `review/canonical-velara-cantum-migration`. It uses the existing D-130 registry at **`0ef93d16d70ce9633451acd8612c8e5ac39c11b1`** and the creator's explicit settlement, Putluk, Lesgrad and 2-LY clarifications. Worldbuilding is unchanged. The candidate is for visual/historical review only; version stays **0.5.0**. No merge or deployment is authorized.

## Historical rules and counts

Without a documented permanent settlement by the selected year, a system has **no Cantum administration, governing Cantum or cartographic association**. Registration still makes it visible. Lack of a settlement milestone does not establish zero inhabitants, activity or habitability. Settlement does not by itself prove current habitation or population.

The pure, candidate-only `associations.mjs` resolver applies these priorities: settlement eligibility; explicit unaffiliated/neutral/excluded status; effective dated direct administration; individually reviewed regional association for an existing Cantum; otherwise an explained gap. It reads `cartographic-associations.json`, which reviews each of the 70 source entries against its regional inventory, settlement and Cantum chronology. It never derives runtime ownership from a prefix or writes regional associations into `cantumHistory`. All 17 systems without a settlement have empty regional-association periods.

| 1200 A.E. result | Count |
| --- | ---: |
| Historically visible systems | 70 |
| Documented permanent settlement | 53 |
| No documented permanent settlement | 17 |
| Explicitly unaffiliated settled systems | 11 |
| Recorded direct administration | 17 |
| Settled, direct administration unrecorded | 25 |
| Cartographically associated | 42 |
| Of those, derived regional association only | 25 |

The earlier 26 settled/unrecorded entries included Lesgrad. Correcting its continued Visshum affiliation moves it to the recorded group, leaving **25 unrecorded and 17 recorded**. The associated total is derived from individual records; no renderer count target is hardcoded.

Putluk retains `discoveredAE: null`, its original identity, position and administration, and now has **`knownByAE: 0`, `colonizedAE: 0`**. It is visible, searchable and selectable at every year 0–1200, without a Year 0 registration event. Lesgrad retains separate wartime 1168–1175 and continuing post-surrender 1175–1200 coverage; the segment boundary is not a new political transition. Other administrative endpoints were reviewed; the conservative conquest/handover gaps are retained rather than extended.

## Associations, qualifications and unresolved intervals

The [70-system human audit](AFFILIATION_AUDIT.md) and [machine-readable audit](AFFILIATION_AUDIT.json) contain registration, settlement, all representative-year administration/cartography/control states, source justification, neutral/excluded boundaries and settlement ±1-year checks. The 25 remaining unrecorded administrations are individually justified for derived regional coloring, without manufacturing local government records.

Rekput keeps Az-18 identity, Drevnasel regional association before c.970, recorded Rekdolin administration at the qualified 970 anchor, and postwar Drevnasel affiliation from 1175. Glagoli-6/7/8 switch to Okeanberg at the same qualified c.970 boundary; 1000 remains confirmation, not a new independence event. The six-system 1008 annexation outcome supports **derived Okeanberg cartography**, qualified confirmed-by, without inserting local civil administration records or reviving sovereign Rekdolin.

Genuine gaps remain uncolored: pre-formation settlements with relative central-oversight records but no precise local cartographic handover; individual captures/handoffs during 1004–1008; and the 1126–1175 conquest/occupation/liberation intervals until a dated affiliation or explicit absence applies. Military Visshum control stays separate and supplies no Visshum administrative/cartographic substitution. Okeanberg restoration occurs at 1175; liberation alone does not restore administration. All eight border systems are neutral from 1175. The three Pustosh systems are excluded from their separate 1172/1173/1174 withdrawal boundaries, with display-name changes still at 1175.

## Visual and InfoCard integration

The candidate uses **2 LY exactly**, the creator's maximum for this review. All seven existing colors remain stable. Only eligible associated systems contribute; disconnected Gaussian islands are permitted, with no invented linking corridors. The chart is unchanged at **55 × 10 × 55 LY**, centered at zero. All 70 literal D-130 XYZ tokens and permanent IDs are unchanged, verified against the pinned coordinate ledger and prior committed dataset.

Compact name fitting lowers the candidate's label threshold and chooses one fitted nameplate per contributing Cantum. Font size follows its fitted area; fields are never enlarged to make room. The ordinary viewer keeps its existing fitting defaults. The preview key also handles historically unrecorded Cantum-status intervals without converting them into governments.

Candidate InfoCards distinguish no documented settlement, regional-only association, proven administration, neutral borders, abandoned/excluded Pustosh systems and separately recorded control. They use Cantum names and readable qualifications. Original survey designations and only already-established historical aliases are searchable; future proper names do not appear early. No system narration, interiors, endpoints, factions or replacement governments were invented. The Continuance remains confined to relevant historical descriptions: no polity registry, label or unified color. A separate future political-entity representation remains deferred.

## Integration, CI and launch

Changes are concentrated in the candidate's resolver/provenance, dataset inputs, fixed-root preview, InfoCard adapter, tests, audit and evidence. Shared cartography adds an opt-in `cartographic` basis; labels add opt-in compact fitting. Governing/admin defaults stay intact. Three exact public-safe review runtime files are admitted in the isolated preview; arbitrary directories, roots and non-runtime source/audit inputs remain denied. The provenance JSON is hash-pinned and rechecked on load. Default `publicDir: false`, output/disclosure audits, Demo selection, assets and deployment workflow are unchanged.

The identity collision test now scans **all tracked retained JSON, modules, Markdown and HTML outside the authorized candidate**, including frozen fixtures, and verifies that the expected retained corpus exists. It has no `origin/main` or remote-history dependency, works in shallow Actions merge checkouts, and broadens rather than skips the collision audit.

Launch from this branch with `npm ci` then **`npm run canonical:dev`**; open **http://127.0.0.1:5175/Velara_Atlas/demo.html**. Stop an older candidate listener first. Normal Demo remains `npm run demo` on port 5173. Reproduce with `npm run canonical:rebuild`, regenerate the audit with `npm run canonical:audit`, build the normal output, then run `npm run canonical:test`.

See [verification and screenshots](evidence/VERIFICATION.md). Hosted Ubuntu and Windows results for the final pushed SHA are required before calling this PR technically verified; read the latest PR checks and the delivery report. Local success alone is insufficient. Confidential references and private source artifacts remain excluded from this branch.
