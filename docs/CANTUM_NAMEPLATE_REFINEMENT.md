# Adaptive horizontal Cantum nameplate refinement

The 2026-11-20 creator task refines geographic fitting while retaining the existing
nameplate appearance. Creator visual approval is pending. This work is isolated
on `refine/cantum-adaptive-nameplates`, stacked on PR #4 at
`e1ae55c1ea65477b003278bc49f2090fa662172f`. Neither PR is merged or deployed.
Version remains **1.0.0 canonical launch candidate** by explicit creator request;
this preparation refinement warrants no version increment.

## Implementation

`territorial-labels.mjs` retains Gaussian fields, thresholds, 128×128 sampling,
four-neighbor components, the 24-cell minimum, historical identities and bounded
eight-input cache. Every full-name candidate uses a horizontal rectangle. Row
runs intersect across its entire measured height plus one-cell padding per side;
all eligible interior cells compete, including broad lobes outside the previous
deepest-64 shortlist. Candidates first prefer the existing conservative 15px
marker budget, then avoidance of the existing 4px visible symbol where full
clearance is impossible. Usable width, interior depth, rectangle-to-marker
clearance and weighted-center proximity rank candidates; cell index resolves ties.
Eligible unassociated system markers also participate in full-name scoring.

`cantum-nameplates.mjs` measures complete resolved names with hidden DOM probes
at the fixed 768px reference overview, using the existing font clamp (20.736px at
that reference). Actual browser shaping, font weight/family, letter spacing,
padding, line height, registered sigil size and gap determine the complete box.
Measurements round upward to 1/64px. Placeholders reserve sigil dimensions without
another image request; probes are removed synchronously. Map span / 768 converts
the box into geographic dimensions. No topology or measurement runs per frame.

The original `nameplateProjection()`, `territorialOpacity()`, CSS and sigil-only
fallback are unchanged. Typography stays 14–24 CSS px, weight 600, horizontal and
camera-facing, with the original font family, spacing, tint, shadow, sigil clamp,
edge containment and zoom-only fading. No schema, history, data or asset migration
is involved. [Full active contract](CARTOGRAPHIC_LABELING.md#adaptive-horizontal-fitting-refinement--2026-11-20).

## Before/after method

`tests/browser-adaptive-nameplates.mjs` loads the actual parent algorithm with
`git show` at the pinned SHA, reproduces its 500/64px per-glyph aspect estimates,
and compares it with current placements using independently measured full CSS
boxes. Synthetic shapes from `tests/nameplate-shapes.mjs` are memory-only, never
canonical or production inputs. Canonical comparisons use the actual resolver
and approved dataset. Browser measurement also independently checks a real
registered image, Unicode shaping, added test-only CSS padding and flex gap.

All distances below are in ly unless marked CSS px. Usable horizontal span is
the symmetric interior width after padding, intersected across the complete
padded height. Contour clearance is an approximate lower bound from the nearest
noncomponent sample minus half a cell diagonal; it is not a legal boundary.
The legacy estimated dimensions describe its geometric eligibility box, whose
angle could differ from the displayed text. The current eligibility box equals
the measured complete reference box, with separate one-cell fitting padding.
Marker overlap tests use that actual horizontal reference box, with both the
visible 4px radius and conservative 15px budget. They do not certify caption
separation at every camera or mobile size.

Every previously valid full horizontal box remains eligible in these comparisons;
previously clear visible markers remain clear. No label is added by shrinking,
truncating, stretching, abbreviating or rotating text.

## Synthetic results

| Case / component | Before → after | X/Z anchor before → after (ly) | Usable horizontal span before → after (ly) | Previous horizontal box valid? |
| --- | --- | --- | --- | --- |
| wide / test:0 | name → name | (-17.97, -0.78) → (-0.78, -8.59) | 82.81 → 104.69 | yes |
| tall-narrow | omitted → omitted | — | — | no label |
| tall-with-shoulder / test:0 | name → name | (5.47, 24.22) → (-0.78, 24.22) | 42.19 → 51.56 | yes |
| diagonal / test:0 | name → omitted | (-5.47, -5.47) → (—) | 23.44 → — | no |
| crescent / test:0 | name → name | (-14.84, 38.28) → (-0.78, 35.16) | 32.81 → 67.19 | no |
| L-shaped / test:0 | name → name | (-17.97, 38.28) → (7.03, 35.16) | 54.69 → 104.69 | yes |
| broad-lobe / test:0 | name → name | (-13.28, 33.59) → (0.78, 32.03) | 51.56 → 79.69 | yes |
| disconnected / test:0 | name → name | (-53.91, -5.47) → (-58.59, -10.16) | 42.19 → 45.31 | yes |
| disconnected / test:1 | name → name | (53.91, -5.47) → (58.59, -10.16) | 42.19 → 45.31 | yes |
| tiny | omitted → omitted | — | — | no label |
| small-sigil / test:0 | sigil → sigil | (-0.78, -0.78) → (-0.78, -0.78) | 7.81 → 7.81 | yes |
| dense / test:0 | name → name | (-5.47, -0.78) → (-0.78, -32.03) | 92.19 → 82.81 | yes |
| long-name | omitted → omitted | — | — | no label |
| unicode / test:0 | name → name | (-3.91, -0.78) → (-0.78, -8.59) | 110.94 → 104.69 | yes |

| Case / component | Complete box at reference (CSS px) | Complete reference box (ly) | Legacy estimated box (ly) | Center contour clearance before → after (ly) | Visible 4px symbol overlap before → after | 15px budget overlap before → after |
| --- | --- | --- | --- | --- | --- | --- |
| wide / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 68.57 × 12.95 | 16.08 → 8.27 | yes → no | yes → no |
| tall-narrow | 139.98 × 24.88 | 36.45 × 6.48 | — | — | — | — |
| tall-with-shoulder / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 30.12 × 5.69 | 16.57 → 19.92 | yes → yes | yes → yes |
| diagonal / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 47.06 × 8.89 | 11.10 → — | no → — | yes → — |
| crescent / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 50.02 × 9.45 | 12.25 → 5.15 | yes → no | yes → yes |
| L-shaped / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 54.59 × 10.31 | 13.64 → 8.27 | no → no | yes → no |
| broad-lobe / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 50.02 × 9.45 | 9.94 → 5.15 | yes → no | yes → no |
| disconnected / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 40.34 × 7.62 | 20.60 → 17.65 | no → no | yes → no |
| disconnected / test:1 | 139.98 × 24.88 | 36.45 × 6.48 | 40.34 × 7.62 | 20.60 → 17.65 | no → no | yes → no |
| tiny | 167.97 × 24.88 | 43.74 × 6.48 | — | — | — | — |
| small-sigil / test:0 | 24.00 × 24.00 | 6.25 × 6.25 | 6.25 × 6.25 | 6.71 → 6.71 | yes → yes | yes → yes |
| dense / test:0 | 139.98 × 24.88 | 36.45 × 6.48 | 68.57 × 12.95 | 41.08 → 9.83 | yes → no | yes → no |
| long-name | 2877.77 × 24.88 | 749.42 × 6.48 | — | — | — | — |
| unicode / test:0 | 210.17 × 24.88 | 54.73 × 6.48 | 98.89 × 12.59 | 16.08 → 8.27 | yes → no | yes → no |

The broad lobe gains usable width (51.56 → 79.69 ly) and avoids markers while
accepting less center depth. The crescent moves from an invalid horizontal box to
a valid interior shelf. The diagonal name is intentionally omitted: its old
rotated fit left only 23.44 ly for a 36.45-ly actual horizontal box. The tall narrow
case, tiny holding and 2877.77px complete long name remain omitted. The small
registered-sigil case retains the exact existing fallback anchor and size.
Disconnected regions retain independent identities; the dense case finds a
clear alternative; the complete Unicode name fits without abbreviation.

## Calibration eligibility corrections

The unchanged 40-ly calibration has a complete A name/sigil box of 250.48 ×
24.88 CSS px (13.05 × 1.30 ly at reference) and a B name-only box of 221.11 ×
24.88 CSS px (11.52 × 1.30 ly). At 2/2.5 ly, the A main component cannot fit
that complete box, so it uses its existing registered sigil-only fallback.
At 2 ly, B also cannot fit and has no registered sigil, so it is omitted.
At 3 ly both full names fit; the detached A outpost retains its existing fallback.
The baseline comparison below identifies its previously invalid horizontal boxes.

| Case / component | Before → after | X/Z anchor before → after (ly) | Usable horizontal span before → after (ly) | Previous horizontal box valid? |
| --- | --- | --- | --- | --- |
| calibration-2 / can_9101:0 | sigil → sigil | (11.09, -8.59) → (11.09, -8.59) | 1.56 → 1.56 | yes |
| calibration-2 / can_9101:1 | name → sigil | (-8.91, -1.41) → (-8.91, -1.41) | 10.94 → 10.94 | no |
| calibration-2 / can_9102:0 | name → omitted | (7.97, 8.59) → (—) | 10.94 → — | no |
| calibration-2.5 / can_9101:0 | sigil → sigil | (8.59, -8.91) → (8.59, -8.91) | 2.19 → 2.19 | yes |
| calibration-2.5 / can_9101:1 | name → sigil | (-9.22, -1.41) → (-8.91, -1.41) | 12.19 → 12.19 | no |
| calibration-2.5 / can_9102:0 | name → name | (7.97, 8.59) → (7.97, 8.59) | 12.81 → 12.81 | yes |
| calibration-3 / can_9101:0 | sigil → sigil | (8.59, -8.91) → (8.59, -8.91) | 3.44 → 3.44 | yes |
| calibration-3 / can_9101:1 | name → name | (-9.22, -1.41) → (-8.91, -1.41) | 14.06 → 14.06 | yes |
| calibration-3 / can_9102:0 | name → name | (8.28, 8.59) → (7.97, 5.47) | 14.06 → 12.19 | yes |

| Case / component | Complete box at reference (CSS px) | Complete reference box (ly) | Legacy estimated box (ly) | Center contour clearance before → after (ly) | Visible 4px symbol overlap before → after | 15px budget overlap before → after |
| --- | --- | --- | --- | --- | --- | --- |
| calibration-2 / can_9101:0 | 24.00 × 24.00 | 1.25 × 1.25 | 1.25 × 1.25 | 1.18 → 1.18 | no → no | yes → yes |
| calibration-2 / can_9101:1 | 24.00 × 24.00 | 1.25 × 1.25 | 10.26 × 1.22 | 4.15 → 4.15 | no → no | yes → no |
| calibration-2 / can_9102:0 | 221.11 × 24.88 | 11.52 × 1.30 | 10.28 × 1.23 | 4.15 → — | no → — | yes → — |
| calibration-2.5 / can_9101:0 | 24.00 × 24.00 | 1.25 × 1.25 | 1.25 × 1.25 | 1.60 → 1.60 | no → no | no → no |
| calibration-2.5 / can_9101:1 | 24.00 × 24.00 | 1.25 × 1.25 | 11.37 × 1.35 | 5.09 → 5.09 | no → no | yes → no |
| calibration-2.5 / can_9102:0 | 221.11 × 24.88 | 11.52 × 1.30 | 11.98 × 1.43 | 5.09 → 5.09 | no → no | yes → yes |
| calibration-3 / can_9101:0 | 24.00 × 24.00 | 1.25 × 1.25 | 1.25 × 1.25 | 2.16 → 2.16 | no → no | no → no |
| calibration-3 / can_9101:1 | 250.48 × 24.88 | 13.05 × 1.30 | 13.08 × 1.55 | 6.03 → 6.03 | no → no | yes → yes |
| calibration-3 / can_9102:0 | 221.11 × 24.88 | 11.52 × 1.30 | 13.08 × 1.56 | 6.03 → 3.22 | no → no | yes → no |


## Canonical 1200 A.E.

Six names remain eligible: Drevnasel, Visshum, Okeanberg, Vodravan, Gornebes and
Zaklun. Existing visible-symbol overlaps fall from five to one at the reference
scale. Gornebes remains the crowded case; every candidate satisfying the complete
name fit still fails visible-symbol clearance. All six still intersect the
conservative 15px budget. Separate Cantums remain independent overlapping fields.

| Case / component | Before → after | X/Z anchor before → after (ly) | Usable horizontal span before → after (ly) | Previous horizontal box valid? |
| --- | --- | --- | --- | --- |
| canonical-1200 / can_1000001:0 | name → name | (7.09, -8.81) → (8.81, -7.09) | 9.02 → 14.18 | yes |
| canonical-1200 / can_1000002:0 | name → name | (-15.25, -17.40) → (-16.54, -16.11) | 9.88 → 9.88 | yes |
| canonical-1200 / can_1000003:0 | name → name | (-10.53, -8.81) → (-10.10, -10.10) | 9.02 → 9.02 | yes |
| canonical-1200 / can_1000005:0 | name → name | (13.96, 1.93) → (13.96, 1.93) | 7.30 → 7.30 | yes |
| canonical-1200 / can_1000006:0 | name → name | (5.37, 5.80) → (5.37, 5.80) | 7.30 → 7.30 | yes |
| canonical-1200 / can_1000007:0 | name → name | (-2.79, 3.22) → (-2.79, 4.08) | 9.88 → 9.02 | yes |

| Case / component | Complete box at reference (CSS px) | Complete reference box (ly) | Legacy estimated box (ly) | Center contour clearance before → after (ly) | Visible 4px symbol overlap before → after | 15px budget overlap before → after |
| --- | --- | --- | --- | --- | --- | --- |
| canonical-1200 / can_1000001:0 | 103.38 × 24.88 | 7.40 × 1.78 | 13.44 × 3.38 | 3.54 → 3.99 | yes → no | yes → yes |
| canonical-1200 / can_1000002:0 | 87.83 × 24.88 | 6.29 × 1.78 | 11.25 × 3.33 | 3.75 → 2.58 | yes → no | yes → yes |
| canonical-1200 / can_1000003:0 | 114.80 × 24.88 | 8.22 × 1.78 | 9.56 × 2.18 | 4.73 → 4.08 | yes → no | yes → yes |
| canonical-1200 / can_1000005:0 | 98.39 × 24.88 | 7.05 × 1.78 | 7.31 × 1.91 | 2.45 → 2.45 | no → no | yes → yes |
| canonical-1200 / can_1000006:0 | 100.02 × 24.88 | 7.16 × 1.78 | 7.84 × 2.05 | 3.05 → 3.05 | yes → yes | yes → yes |
| canonical-1200 / can_1000007:0 | 70.95 × 24.88 | 5.08 × 1.78 | 8.80 × 3.20 | 4.12 → 4.50 | yes → no | yes → yes |

## Historical eligibility

| A.E. | Previous labels | Refined labels | Previously valid horizontal names retained |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 / 0 |
| 299 | 1 | 1 | 0 / 0 |
| 300 | 1 | 1 | 0 / 0 |
| 344 | 1 | 1 | 0 / 0 |
| 345 | 1 | 1 | 0 / 0 |
| 359 | 1 | 1 | 0 / 0 |
| 360 | 1 | 1 | 0 / 0 |
| 699 | 1 | 1 | 1 / 1 |
| 700 | 1 | 1 | 1 / 1 |
| 799 | 1 | 1 | 1 / 1 |
| 800 | 1 | 1 | 1 / 1 |
| 999 | 3 | 2 | 2 / 2 |
| 1000 | 4 | 3 | 3 / 3 |
| 1174 | 6 | 6 | 6 / 6 |
| 1175 | 6 | 6 | 6 / 6 |
| 1199 | 6 | 6 | 6 / 6 |
| 1200 | 6 | 6 | 6 / 6 |

Okeanberg is intentionally omitted at 999–1000 A.E.: the previous horizontal
anchor offered 6.45 ly for its 8.22-ly reference name, and no complete padded
horizontal candidate fits that component. There is no registered canonical sigil
to authorize a substitute. Its later 1199–1200 name remains eligible. At 299–300,
Drevnasel instead gains a valid horizontal anchor. The actual Cantum rename at
359/360 and postwar changes at 1174/1175 are checked in the real UI; repeated
year updates expose only currently resolved names with one DOM root and stable
GPU texture counts.

## Performance and limitations

Illustrative cold-placement browser timings (milliseconds, single local samples):

| Case | Previous | Refined |
| --- | --- | --- |
| wide | 61.80 | 31.90 |
| broad-lobe | 33.00 | 27.70 |
| small-sigil | 4.20 | 3.30 |
| dense | 53.70 | 36.80 |
| canonical-1199 | 84.40 | 56.10 |

These software-WebGL samples are not a hardware benchmark. Cache hits can round
to zero. There is no demonstrated material performance regression; tiny/fallback
cases can vary by sub-millisecond or low-millisecond noise. Camera motion only
projects existing anchors. Resource checks cover repeated updates, removal of
measurement probes, stale-image listeners and DOM/GPU counts; they are not heap
or GPU-memory certification.

Reference-overview eligibility does not promise screen-space territorial
containment at every mobile width, zoom or low-angle perspective. The original
14px floor and viewport containment can make text larger relative to geography
on small charts; tilt can crowd separate names. Dense system captions can still
overlap decorative nameplates. Geographic fit takes precedence over adding
labels; no cross-Cantum partitioning or new caption decluttering is introduced.
System-font fallback differs by platform. Firefox, Safari and physical mobile
hardware were not tested; creator visual acceptance remains required.

## Reproducing review

Run `npm ci`, then `npm run atlas`, and open
`http://127.0.0.1:5173/Velara_Atlas/`. Enter silently or use the existing audio
choice. At 1200 A.E. inspect top-down and perspective views, low tilt/orbit,
overview/zoom, independent Names/Influence toggles, Catalogue, InfoCards, History
and system archival navigation. Check 299, 359/360, 999/1000, 1174/1175 and 1200.
Inspect 1440×1000, 390×844, 320×568 and 844×390 viewports.

Run browser callback files through the existing Playwright callback runner from
the repository root. Use reduced motion for fixed-size assertions so reserved
toolbar resize animation does not contaminate them. The browser MCP transport
was unavailable during this task; verification used the already-installed
Playwright and Chrome with software WebGL, without adding project dependencies.
Run one preview configuration at a time to avoid their shared Vite dependency
cache being invalidated by other server/test configurations.

Local screenshot evidence is ignored under `.playwright-mcp/`:
`cantum-before-desktop.png`, `cantum-after-desktop.png`,
`cantum-after-perspective.png`, `cantum-after-390x844.png`,
`cantum-after-320x568.png` and `cantum-after-844x390.png`.
The callback returns full numerical comparison JSON for independent inspection.
Screenshots were visually inspected; use the live preview instructions when
reviewing the PR on another machine. No screenshot is added as a production asset.

## Modified-file inventory

- `src/viewer/territorial-labels.mjs`: horizontal fitting and candidate scoring.
- `src/viewer/cantum-nameplates.mjs`: complete CSS-box measurements and eligible marker inputs.
- `tests/nameplate-shapes.mjs`: memory-only representative shape factory.
- `tests/labeling.test.mjs`: deterministic horizontal geometry/measurement regressions.
- `tests/island-identities.test.mjs`: clarifies the retained fallback test title; assertions unchanged.
- `tests/browser-adaptive-nameplates.mjs`: baseline comparisons, real canonical browser and screenshot checks.
- `tests/browser-cantum-sigils.mjs`: checks the existing responsive CSS clamp instead of assuming every desktop chart reaches 24px.
- `tests/browser-cantum-calibration.mjs`: checks measured full-name eligibility and the retained outpost/transfer rules at all three radii.
- `docs/CARTOGRAPHIC_LABELING.md`, `docs/CANTUM_TERRITORY_RENDERING.md`, `docs/VIEWER_SPECIFICATION.md`: active refinement contract.
- `docs/PROJECT_STATUS.md`: isolated authorization and review gate.
- `docs/LOCAL_DEVELOPMENT.md`: explains corrected identity variants in the unchanged calibration fixtures.
- `docs/CANTUM_NAMEPLATE_REFINEMENT.md`: this comparison/validation evidence.

## Validation and preservation

Final required commands all exited **0** under **Node.js 24.22.3**:
`npm ci`, `npm test`, `npm run validate`, `npm run connections:check`,
`npm run build`, `npm run release:check` and `git diff --check`.
The full suite passed **385 tests, zero failures/skips**. The build/release audit
verified the selected canonical dataset and all 33 output files, including the
sixteen exact SVGs, three exact PNGs and eight exact MP3s. The existing large-JS-
bundle advisory remains; no dependency or warning threshold was changed.

Six Chromium browser callbacks passed: `browser-labeling.mjs`,
`browser-cantum-sigils.mjs`, `browser-adaptive-nameplates.mjs`,
`browser-control-bars.mjs`, `browser-release-readiness.mjs` and
`browser-cantum-calibration.mjs`. The adaptive callback compares 13 memory-only
shapes, 17 canonical historical snapshots and three existing calibration radii.
It retains every previously valid horizontal full name and every previously
clear visible symbol. Calibration verifies all nine radius/camera combinations,
historical transfer, touch/picking, high DPI, resource reuse and mobile views.
Canonical checks include the real Cantum rename, postwar years, Catalogue,
InfoCards, Help, exact toolbar deadlines, archival navigation and responsive
portrait/landscape layouts. Normal runs report no runtime/console errors; one
deliberately aborted sigil request verifies the existing image-failure fallback.

The independent diff audit permits only the fourteen files inventoried above.
It confirms that `fieldComponents()`, `nameplateProjection()`,
`containNameplate()`, `territorialAnchorY()`, `territorialOpacity()` and the
sigil-only fallback code are unchanged. No protected data, core/resolver/schema,
coordinates, political history, influence/camera rendering, chart/grid, NEXUS
interface/audio owner, artwork or deployment workflow changed. Historical reports
remain intact; package metadata stays at 1.0.0.

All five canonical files match the parent **byte for byte**, preserving all 234
descriptions. SHA-256:

| File | Hash |
| --- | --- |
| `cantums.json` | `a5519e3735d47a091a5e47de63f2b88d680aa3413c218190b58b4d1c5a0b0c5c` |
| `connections.json` | `217779677717f8a86e7684230de849f0305cb090abceb882cbb68eb594db0809` |
| `factions.json` | `2f17c91597a35d61d4a40d62e93bc44f0fb32e3e4aefcde946a47df64dccce36` |
| `presentation.json` | `4165d339ba486e381af34643ce0fe530df2a7d27b2e440e230678cc88e82d5a7` |
| `sector.json` | `5d0244e429daec57a5f876bc363ad11dbc5998b9e88be41b7b35cefc04201b3c` |

Local validation does not constitute creator acceptance, hosted-CI certification
or publication. Integration into PR #4, either merge, Pages dispatch, tag and
Release remain separately gated. Stop for creator visual review.
