# Canonical Velara candidate: review PR implementation report

15 November 2026. This transfers the existing inspected candidate into a reproducible review branch. The creator authorized publication of the 70 historically known systems and seven Cantums. This migration does not approve additional historical claims, repair unresolved behavior, replace the Demo, or deploy the website. Project version remains **0.5.0**, as requested.

## Source and coordinate verification

Worldbuilding D-130 / PR #43 revision: **`0ef93d16d70ce9633451acd8612c8e5ac39c11b1`**. Sources are the [historical registry](https://github.com/VukMar/MCR_Worldbuilding/blob/0ef93d16d70ce9633451acd8612c8e5ac39c11b1/02_Canon/Sector_Registry/Velara_System_and_Cantum_Historical_Registry_0-1200_AE.md) and [approved coordinate v1.1 artifact](https://github.com/VukMar/MCR_Worldbuilding/blob/0ef93d16d70ce9633451acd8612c8e5ac39c11b1/03_Working/Proposals/Velara_Sector_3D_Coordinate_Candidates_v1.1.md). Source documents were read without modification and are not copied into this repository.

All **70/70** authorized positions match the synchronized D-130 source comparison, with **zero mismatches**. Every five-file runtime input is byte-identical to the prior working candidate, including numeric precision. X is `mapper_x - 32.5`; Z is `32.5 - mapper_y`; Y retains the approved elevation. No reflection, rescaling, regeneration or relocation occurs here. Orientation tests project lower-left to bottom-left, upper-right to upper-right and increasing Mapper y toward screen top using the unchanged Atlas camera.

`coordinates-70.json` contains the authorized comparison and a fingerprint explicitly scoped to these 70 records. The complete private source artifacts, their confidential references and extraction caches remain outside Git. `review-manifest.json` pins the reviewed input and output bytes. `crosswalk.json`, its human-readable companion and `identity-lock.json` preserve permanent assignments without allocating or renumbering identities.

## Preserved historical and graphical implementation

The sector chart remains centered at zero, **55 × 10 × 55 LY**, with X/Z projection and Y elevation. The separate Mapper planning grid remains 65 × 65. Official registration controls visibility; scientific discovery, settlement and naming are independent. Polyeput's 105 survey visibility and 150 proper name, survey-only names and the three 1175 Pustosh display transitions are retained.

Seven permanent Cantum identities follow government formation rather than alphabetical designation:

| Designation | Atlas identity | Historical name | Formation | Provisional color |
| --- | --- | --- | --- | --- |
| A | can_1000001 | Drevnasel | 0 | #57B8D9 |
| B | can_1000002 | Cantum; Visshum from 360 | 345 | #D88962 |
| C | can_1000003 | Okeanberg | 480 | #72BC89 |
| D | can_1000004 | Rekdolin | 548 | #C08ACE |
| G | can_1000005 | Vodravan | 725 | #D97FA1 |
| F | can_1000006 | Gornebes | 730 | #799DE5 |
| E | can_1000007 | Zaklun | 745 | #E0C36B |

The existing preview adapters group influence by direct administration, retain stable colors through independence, supply the current-year Cantum key and date-correct cards, and preserve known-null versus unrecorded administration. Shared core/viewer changes make this grouping opt-in; the ordinary Demo still groups by governing authority. The existing rendering, cameras, selection, assets, audio and NEXUS behavior are reused.

The palette and **4-LY radius** remain provisional visualization calibration, not approved territorial facts. Soft influence fields are not legal borders. All seven nameplates/colors appear in applicable historical periods; six source-supported successor fields appear at 1200. No sigils or territorial polygons were added.

## Findings retained for review

- There are 70 records and **69 visible systems at 1200**. Putluk's Year 0 foundation is preserved, but its registration and precise visibility rule remain unresolved. It stays hidden; no fallback date or known-by milestone was introduced.
- At 1200, visible systems comprise **15 recorded administrative memberships, 11 explicit administrative absences and 43 unrecorded administrations**. Unrecorded systems remain uncolored. The 11 absences include all eight neutral border systems and the three Pustosh systems. Survey affiliation, proximity and occupation do not fill these gaps.
- At Year 0, the founding Cantum is selectable but has no visible system contributor. At 745 seven governments exist but six fields render. Rekdolin remains a selectable historical identity at 1200 without invented sovereign territory. These are intentional review findings, unchanged in this transfer.
- Circa-970 Okeanberg uses the selected visualization anchor with its H qualification. The 1000 confirmation is not a new independence event or prematurely displayed prose. Local liberation, withdrawal, civil administration and effective control retain their separate boundaries and gaps. Liberation does not automatically restore administration.
- Histories use an exclusive technical end of 1201 for the inclusive integer-year 1200 observation; this introduces no event in 1201. Uncertain local handovers remain unrecorded rather than exact invented events.
- The Continuance has no independent entity, search target, color, nameplate or sovereign overlay. Existing Cantum structures cannot fully represent a distinct unified sovereign polity. A minimal future political-entity representation would be needed for that separate capability; it is deferred and unnecessary for this administrative view. Private membership provenance was not published as an additional unreviewed registry.
- Every system has `publicDetailPath: null` and uses the existing NEXUS archival fallback. System descriptions and unknown physical, demographic or military attributes remain null. Proposed system narration is excluded. Source-backed Cantum summaries are those already present in the inspected candidate.
- Connections and factions are empty validated registries. The private extraction's historical transport relationships lack complete technical endpoints/lifetimes and remain excluded, with no fictional objects or navigable routes.
- The existing candidate badge, title, footer wording, timeline interaction and graphical presentation are preserved, including wording inherited from the private preview. This PR does not redesign them.

## Packaging and disclosure

`dataset/` contains the five actual v1.3 runtime JSON files. `inputs/reviewed-records.json` freezes their reviewed historical records; `migrate.mjs` materializes the same bytes with exact coordinate formatting and locked identities. This is reproducible snapshot materialization, not a public reimplementation of private-source extraction. The full extraction process and source archives stay private.

The review package includes only the authorized 70-system crosswalk and seven Cantums. It omits the three undiscovered records, their identifiers and tuples, complete source registry/coordinate documents, private provenance, proposed unreleased system prose, temporary extraction caches and unrelated concepts. A private-informed audit compares repository/review text against confidential source identifiers, complete XYZ tuples, source documents and draft descriptions without embedding that denylist in Git. Additional scans check credentials and machine-specific paths. Screenshots contain the Atlas canvas and approved review content only.

The original six generic implementation changes are preserved: core cartography, influence envelopes, territorial labels, their synthetic regression tests, territory API documentation and package test registration. New packaging lives under `canonical-review/`. Package scripts add explicit review launch/check/rebuild/test commands; the existing verification workflow runs review checks after the normal build. A short README/local-development pointer documents this separately authorized environment. Default Vite production selection, exact input/output audits, `publicDir: false`, `/Velara_Atlas/`, Demo data, legacy data, landing page, approved media and deployment workflow remain unchanged.

## Launch and verification

From a fresh Git checkout: `npm ci`, then **`npm run canonical:dev`**. Open **http://127.0.0.1:5175/Velara_Atlas/demo.html**. Stop an existing listener on 5175 first. Normal Demo remains `npm run demo` on port 5173. See [README](README.md) for reproduction and browser-harness commands.

The verification results and representative screenshots are recorded in [evidence/VERIFICATION.md](evidence/VERIFICATION.md). The browser comparison checked the complete resolved view and administrative groups at 44 years against the still-running original preview before switching servers; all 44 were identical. No historical content was changed to satisfy tests.

This branch is for review only. No merge, deployment, version change or further issue correction is included.
