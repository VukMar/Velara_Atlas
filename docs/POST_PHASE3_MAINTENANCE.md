# Post-Phase-3 maintenance — approved System C baseline

Phases 1–3 are creator-approved. Inspection began on clean local `main` at
`16668e2d4583ca829a554b4495036d4243188021`. The Phase 3 implementation originally
preserved Phase 2 JSON; the creator subsequently made intentional System C
changes while testing. The earlier phase reports retain their original evidence.
The committed records are now the approved source of truth. This maintenance
changes tests and documentation only; it does not regenerate navigation.

## Verified creator changes

Compared with the Phase 2 baseline `94a3fba`:

- System C now has ten objects, including new short-range gates `gat_0019` and
  `gat_0020`, both constructed/discovered at 613 A.E. Their exclusive,
  bidirectional `lnk_0011` starts inclusively at 613 A.E., without an end date.
  It links the existing `cb_0011` anchor to `cb_0012`; the water world now has a
  1,000-CNU navigation boundary. This boundary is independent of its unchanged
  6,800-km physical diameter.
- `gat_0012` moved to `(-20000,-800,-40000)`. Existing boundary-derived gates
  `gat_0013` and `gat_0014` now occupy `(16636.554549,2478.007512,6277.753114)`
  and `(-18760.504135,-689.097738,-38434.321013)`.
- New derived positions are `gat_0019` at
  `(19261.984746,2373.8944,6212.188277)` and `gat_0020` at
  `(41426.37057,-1597.224727,-25187.358308)`, all in local XYZ CNU.
- `cb_0012` and `cb_0013` discovery/name histories now start at 610 A.E., formerly
  680 and 740 respectively. Their descriptions still begin at 680 and 740;
  these independent histories are valid, and later descriptions remain hidden
  at discovery. The asteroid remains discovered at 820 A.E.
- System C has two local transfers from 613 onward (`lnk_0007`, `lnk_0011`).
  The whole demo has 38 detailed objects, 16 exclusive short-range endpoints
  and eleven connections, including the same three interstellar connections.
  The ten older connection records are unchanged.

Schema/reference/ID/history/bounds checks pass, as do read-only generated-graph
and boundary-placement freshness checks. No genuine authored-data defect was
found. Celestial XYZ, physical measurements, chart extents, zones and the
archival-only System D remain unchanged by these creator edits.

## Regression and documentation synchronization

`tests/demo-expansion.test.mjs` retains its complete graph fingerprint and pure
generation/freshness/exclusivity checks. Its approved `JSON.stringify` graph
SHA-256 is now
`54745da730e07c4cbb0439c7a46c9582531ab41477a24d583c56a36acc36a724`.
The water-world boundary expectation is explicit; the other new frontier bodies
still have no navigation declaration. A focused regression checks discovery,
independent later descriptions, gate eligibility, both transfer directions and
exact exclusive endpoint identities at 613 and 1200 A.E.

`browser-navigation-v1_2.mjs` keeps all existing pointer, destination, exclusive
partner, historical, perspective and archival checks. It additionally exercises
the two early discoveries, withheld descriptions and the new local transfer
before/at its activation. Existing fixture-based chronology tests retain their
frozen expectations; they do not describe the current demo.

Phase 2/3 reports receive addenda rather than rewritten implementation history.
README, architecture, scale specification, roadmap and AGENTS now distinguish
the original implementation from subsequent creator testing. NEXUS identity
documentation confirms the supplied asset exists at
`public/assets/nexus/nexus-side-profile.png`; viewer integration remains deferred
and it is excluded from the current explicit demo asset bundle.

## Verification

| Check | Result |
| --- | --- |
| Focused demo-expansion tests | PASS: 6/6 |
| `npm test` | PASS: 155/155 Node tests, legacy chronology and demo validation |
| `npm run validate` | PASS: strict v1.2, references, IDs, histories, XYZ bounds and freshness |
| `npm run connections:check` | PASS: read-only graph and derived positions current |
| `npm run demo` | PASS: legacy chronology demonstration |
| `npm run build` | PASS: 20 audited outputs, including exactly 14 approved SVGs; no canonical/private/source-map references |
| `browser-navigation-v1_2.mjs` | PASS: 38 pointer-selected objects, 16 exclusive local endpoints, three interstellar routes, new discoveries/613 transfer, three released maps and archival fallback |
| `browser-celestial4_1.mjs` | PASS: all 13 known-size bodies in both cameras, seven transition samples, layers/history/mobile/DPR 2, occlusion/picking, repeated-map geometry counts 13/13/13/13, archival/icon-failure fallback; no console errors |
| `browser-checkpoint3.mjs` | PASS: chronology/search, population/crew, parent clearing, fallback/unplaced/partial distinctions, failed/missing/malformed detail errors with Retry, non-square rejection |
| `browser-layout3_6.mjs` | PASS: square framing, floating panels, InfoCard/focus, H8 arrows, pan/zoom, hover/focus routes, perspective restoration and three mobile layouts |
| `browser-grid-zero.mjs` | PASS: all three released systems, both cameras/preferences, absolute-zero grid/H8 and unchanged sector floor; 23 objects above and 14 below zero; no console errors |
| `git diff --check` | PASS |
| Preservation against inspected HEAD | PASS: no changes in `examples/`, `src/`, `schemas/`, `public/`, `scripts/`, frozen fixtures, Vite configuration or package manifest |

All requested command and browser categories ran successfully. The first run of
the extended navigation browser test expected a local partner name; inspection
confirmed the existing destination UI displays system name and endpoint ID.
The test now checks the exact partner ID and bidirectional availability, and
the complete suite passed. No production behavior was changed to satisfy it.
Separate zone/label/touch browser suites were not rerun for this tests/docs-only
maintenance; existing Node coverage remains passing, and the browser layout,
grid and celestial suites include mobile/camera/interaction regression checks.

The existing >500-kB production-chunk advisory remains; this maintenance does
not change bundling. Browser checks use Chromium emulation, not physical mobile
devices or cross-browser certification. No commit, push, deployment, schema,
renderer, asset, canonical/frozen-data or demo JSON change is part of maintenance.
Stop here. The next planned stage is **Checkpoint 4.2 — Visual Identity and SVG
Icon Refinement**, requiring separate creator authorization.
