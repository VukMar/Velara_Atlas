# Review migration verification

Local checks on 15 November 2026, Windows, Node **20.5.1**, npm **9.8.0**. Fresh checkouts should use Node 24, matching the existing CI matrix. These results do not claim remote CI, other browsers, physical devices or deployment coverage.

| Command or check | Actual result |
| --- | --- |
| `npm run connections:check` | PASS; read-only generated navigation check |
| `npm test` | PASS; 374 Node tests, legacy check script and Demo validation |
| `npm run validate` | PASS; strict v1.3 Demo validation |
| `npm run build` | PASS; default Demo/landing build and output audit |
| `npm run release:check` | PASS; audited local release build, no publication |
| `npm run canonical:check` | PASS; exact five-file inventory, schema, relationships and navigation freshness |
| `npm run canonical:rebuild` | PASS; five outputs byte-identical to the pre-migration working candidate |
| `npm run canonical:test` | PASS; 20 portable review tests |
| Existing private migration and Cantum suites | PASS; 20 tests with only the superseded publication-boundary assertion adapted in a separate private test copy |
| Private-informed content audit | PASS; confidential identities/tuples, full private sources, draft system descriptions, credentials and machine paths excluded |
| `git diff --check` | PASS |
| Clean local clone | PASS; `npm ci`, `npm run canonical:rebuild`, `npm run build`, all 20 `canonical:test` tests and clean Git diff, with independent dependencies and no original private-workspace inputs |

The untouched original private suite's former requirement that only six generic files could be dirty failed when the newly authorized review package appeared. That old no-publication assertion was replaced in a separate private copy by an audit against the confidential source records. Its historical, extraction, source-pin, identity, coordinate, transport and resolver assertions were retained and passed. The original private tests/source archives remain outside this PR. The portable tests retain applicable historical assertions and replace private-source dependencies with the authorized frozen review subset.

An initial sandboxed default test run had temporary-directory/realpath access failures (331 passed, 43 failed). Repeating the same commands with the required filesystem access passed all 374 tests. A test-loader record-order mismatch during packaging was corrected in the loader; no runtime JSON changed. There are no remaining local check failures. The existing large-chunk build advisory remains.

## Browser evidence

Chromium at **1440 × 1000** compared the complete resolved view and administrative groups at **44 historical years** between the original running private preview and the branch launcher. Every snapshot matched exactly. Years included formation/name/independence boundaries and each year 1167–1175.

The packaged browser callback separately passed all 44 snapshots, all seven historical nameplates/colors across their supported periods, both camera modes, historical Rekdolin selection, qualified Okeanberg InfoCards, marker picking and NEXUS archival fallback. It recorded no application errors. Four non-runtime review inputs were explicitly requested through the Vite filesystem route and all returned **403**; the exact input boundary remains enforced.

The independent Demo was inspected at 1200 and 850: five/four visible TEST systems, respectively; 24-LY radius; 160 × 60 × 160 LY chart; two governing groups at 1200 and one combined group at 850. The candidate's Cantum key was absent from the Demo. Its data, homepage, assets, production selector and deployment workflow have no changes.

Representative screenshots from the original visually inspected candidate are safe review content. Runtime bytes and browser state are identical after transfer:

| Year/view | Evidence |
| --- | --- |
| 345, original second-Cantum name | [Top-down screenshot](cantums-345-top.png) |
| 745, seven identities and six supported fields | [Top-down screenshot](cantums-745-top.png) |
| 1200, six successor fields | [Top-down screenshot](cantums-1200-top.png) |
| 1200, perspective camera | [3D screenshot](cantums-1200-3d.png) |

No merge, deployment or version change was performed. Remote CI results should be read on the PR after push.
