# Living NONCANONICAL Demo showcase

Phase 3F implementation and the normal graphical Demo showcase are complete and
creator-approved. Overall Architecture Phase 3, including 3A-3F, is complete.
Implementation and completion documentation are committed together. Architecture Phase 4
viewer modularization/configuration is complete and creator-approved; the approved
Demo data, default appearance, interactions and walkthrough remain unchanged.
Phases 5 and 6 are complete and creator-approved. The architecture optimization
roadmap is complete; the Demo remains unchanged by those phases. See [readiness evidence](PERFORMANCE_AND_RELEASE_READINESS.md). No deployment, Canon migration
or graphical Atlas Creator is implemented.

## Open the ordinary Atlas

```bash
npm run demo
```

Open **http://127.0.0.1:5173/Velara_Atlas/**. Everything below is available in this
normal graphical Demo; no fixture server is needed. All added names, dates,
measurements and positions are explicit TEST choices, not MCR history.

## Political walkthrough

Use History's year input and Map controls' 2D/3D switch:

| Year | Expected result |
| --- | --- |
| 799 | Test Cantum (`can_0001`, A) is blue; TEST Second Cantum (`can_0002`, B) is independent and orange. |
| 800 | B becomes subordinate to A. All four eligible member systems enter one governing-A Gaussian field, with A's color and political name/sigil. No duplicate B political field/nameplate. |
| 999 | Subordination still applies; interval endings are exclusive. |
| 1000 | B is independent again. Its orange field and eligible political label return. |

During subordination, select **Test System C / `sys_0003`**: its InfoCard retains
**Administrative Cantum: TEST Second Cantum**, while **Governing Cantum: Test
Cantum** identifies A. Select B itself to inspect its direct superior. Existing
system memberships were not edited. The political change is authored only in
B's dated `infoCard.affiliation`; no `suzerainHistory` exists.

Perspective envelopes use the same grouping as flat shading and retain genuine
system elevations. The shared radius remains **24 ly**; thresholds, opacity and
envelope calculations are unchanged. These are approximate influence fields,
not legal borders or canonical measurements. Labels remain subject to the
existing fit/visibility rules. Detached sigil-only edge cases also remain
available in specialized calibration and the isolated integration test.

## New system and physical route

Select **TEST System E Showcase / `sys_0005`**, then **Enter system**.
It is discovered at 300 A.E.; at 299 it is absent from map/search. Its sector
position is `(-5, 2, 0)` ly and its administrative membership is A from 300.
Its explicit TEST chart is 100,000 x 10,000 x 100,000 CNU, with the standard
zero-origin X/Z frame. Colonization remains unknown/null.

| Record | Identity / position in CNU | Historical appearance |
| --- | --- | --- |
| TEST Showcase Primary | `cb_0015`, `(0, 0, 15000)` | 300 |
| TEST Showcase Planet | `cb_0016`, `(-10000, 0, 0)`; orbiting the star | 300 |
| TEST Intelligence Station | `sta_0003`, `(10000, 0, 0)`; orbiting the planet | Constructed/discovered 300 |
| TEST Planet Gate | `gat_0021`, generated `(-9000, 0, 0)` | Constructed/discovered 350 |
| TEST Station Gate | `gat_0022`, generated `(8000, 0, 0)` | Constructed/discovered 352 |
| Dedicated bidirectional route | `lnk_0012` | Active from 353 |

Check years **300, 349, 350, 352, 353**. One physical gate can exist before its
partner; both can exist before the route becomes operational. At 353 hover or
keyboard-focus either gate to highlight the route, then inspect its exclusive
destination. Both gates began with null `boundary_derived` positions. The existing
explicit `npm run connections` writer generated their XYZ from the planet's
1,000-CNU and station's 2,000-CNU navigation boundaries. No gate algorithm changed.

Star/planet diameters are explicit TEST values (1,080,000 km / 12,400 km).
The station's organization is distinct from the system's administrative/governing
Cantum. Missing population, crew and other histories remain null.

## Historical faction InfoCards

Select `sta_0003` inside the new system, changing History between inspections:

| Year | Faction displayed | Legal status / institutional affiliation |
| --- | --- | --- |
| 300 | Not recorded | No station affiliation period until 320; no organization is inferred. |
| 499 | TEST Intelligence Office (`fac_0001`) | Lawful; Test Cantum |
| 500 | TEST Cantum A Intelligence Office (same ID) | Lawful; Test Cantum |
| 699 / 700 | Same later name | Lawful; affiliation changes from Test Cantum to explicit Independent at 700. |
| 899 / 900 | Same later name | Lawful before 900; unlawful from 900, explicitly Independent. |
| 1000 | Same later name | Lawful again; still Independent. |

In Sector View, use Selection or Catalogue to inspect **TEST Independent Network
/ `fac_0002`**. It is an unlawful, explicitly independent TEST faction from 200;
its independence is a dated null-target period, not missing history. Search uses
the name effective at the selected year, never a future faction name. The first
intelligence name period retains its source fixture's circa precision; the 500
rename and legality boundaries are explicit exact TEST dates.

At 900 or later, open **TEST D Unreleased Survey / `sys_0004`** to confirm its
unchanged NEXUS archival notice. It still has no detail file or invented objects.

## Intentional before/after data comparison

Baseline: `7af7d7461a81ca6dcd696a61e7a71355fd76027d`.

| Surface | Before | Approved Phase 3F change |
| --- | --- | --- |
| Sector catalogue | Four entries; three released details | Append `sys_0005`; four released details, same archival `sys_0004` |
| Existing details | `sys_0001`, `sys_0002`, `sys_0003` | Byte-for-byte unchanged, including all IDs, positions, history and navigation |
| New detail | Absent | Five objects above; no speculative extra population |
| Faction registry | Empty | Register `factions/fac_0001.json` and `factions/fac_0002.json` |
| Cantum B affiliation | Independent `[700, null)` | Independent `[700,800)`, A `[800,1000)`, independent `[1000,null)` |
| Cantum A / other B properties | Existing names, status, InfoCards and sigils | Unchanged |
| Authored navigation | Eleven existing declarations | Add only `lnk_0012` on the new planet, dedicated to the two new gates |
| Generated navigation | Eleven links | Append the new link; every old link's endpoints, direction, dates and XYZ stay unchanged |
| Presentation | Shared 24-ly radius and established colors/thresholds | Byte-for-byte unchanged; aggregates intentionally reflect the new system/political periods |
| Protected Canon / schemas / frozen fixtures / calibration | Existing committed records | Unchanged |

The Phase 3E service created/registered the empty system using ID Finder, then
explicit TEST objects were authored and the offline generator was invoked.
The sector-derived inventory admits the new system/factions without editing
viewer, Vite or script file lists. Restart Demo after registration changes.

Existing Demo-specific tests now expect the extra detail, faction identities and
ID maxima. The old graph digest still verifies **all original links**, excluding
only `lnk_0012`. Independent-transfer tests explicitly author independent Cantums
in their memory-only variants; the integrated tests exercise actual subordination.
No assertions about permanent IDs, geometry, chronology or publication are removed.

## Verification and separate environments

```bash
npm test
npm run validate
npm run connections:check
npm run build
npm run history:demo
npm run idfind -- all
npm run atlas:new-system -- --help
```

Phase 3F closeout verification: **245 automated tests pass**, including five new
integrated/preservation tests; all **17 applicable Chromium suites pass**, including
this normal-Demo walkthrough and the nine calibration comparisons. Strict validation,
freshness, the 24-file/15-approved-SVG build audit, terminal history, ID Finder and
CLI help pass. HTTP checks admit registered factions and reject Canon, calibration
sources, authoring tools and unregistered data. No runtime/schema/security source
changes were needed. These execution results support the separately recorded creator approval.

The existing large-bundle advisory remains; physical touch hardware and non-Chromium
browsers are unverified. In this Windows automation session, terminal Ctrl+C did
not release the two preview processes; only the verified task-owned processes
were stopped, and their temporary directories were removed with the established
fixture path/realpath guards. No unrelated process or file was removed.

`tests/phase3f-integration.test.mjs` derives a temporary copy of the curated Demo,
creates another TEST system through the real authoring service, copies/remaps
the five showcase objects, generates its complete route, and checks histories,
governance, flat/envelope fields, detached political identity, eager loading,
negative variants and the audited build. No temporary record enters the live Demo.
`tests/browser-phase3f-showcase.mjs` runs the boundary walkthrough above against
the **normal Demo on 5173**, including InfoCards, resources, mobile and controls.
Existing browser suites and negative/recovery/frozen regressions remain separate.

- `npm run dev` / `npm run preview:calibration`: specialized 5174 calibration,
  preserving its 15 systems and nine radius/camera comparisons.
- `node tests/preview-governance.mjs`: isolated governance/faction edge cases on 5175.
- `node tests/preview-system-authoring.mjs`: isolated authoring system on 5176.

These previews use their own datasets; Demo never imports them. Stop each with
Ctrl+C to close its server and clean temporary files. The public build still
uses `publicDir: false`, exact registered JSON/asset admission and output audits.
There is no public write endpoint, arbitrary dataset selector or Canon launcher.

## Feature-to-review policy

For future **separately authorized** viewer-facing work:

```text
Implement feature -> automated tests -> representative NONCANONICAL Demo update
-> creator visual review -> corrections -> explicit creator approval
-> documentation closeout + commit + push (when separately authorized)
```

Add a representative example when a significant visible feature is ready for
review and the existing Demo cannot show it adequately. Internal refactoring,
security, documentation and nonvisual tooling do not require filler entities.
TEST edge cases, specialized Development/calibration, the curated Demo and Canon
remain distinct. A Demo showcase authorizes no canonical content or deployment.

## Completed Phase 5 Development preview

Phase 5 expands only Development, leaving this approved normal-Demo walkthrough
and all Demo JSON unchanged. Use `npm run dev` (or `preview:calibration`) on
5174 for **Original Cantum scale** and **Island merging and elevation**, with
JSON-defined presets, Replay, safe visual controls and read-only diagnostics.
See [local preview operations](../README.md#named-local-preview-scenarios-completed-phase-5).
Automated TEST fixtures remain separate; Canon has no active viewer dataset.
Phases 5 and 6 are complete and creator-approved. Subsequent development requires
separate authorization; no editor, Canon migration or deployment is implemented.
