# Canonical candidate review environment

This branch packages the existing 70-system, seven-Cantum candidate for technical and historical review. It preserves the inspected implementation; inclusion in Git is not final historical or graphical acceptance. The default website build still uses the NONCANONICAL Demo.

From a fresh Git checkout of this branch, use Node 24 (the CI version):

```sh
npm ci
npm run canonical:check
npm run canonical:dev
```

Open **http://127.0.0.1:5175/Velara_Atlas/demo.html**. Stop an older candidate server on port 5175 first. The preview uses the existing Vite configuration with a fixed dataset root and loopback binding. It has no build or deployment command, runtime path selector, backend or additional dependencies. The inherited “PRIVATE IMPLEMENTATION CANDIDATE” badges remain unchanged for this review.

In another terminal, `npm run demo` opens the independent NONCANONICAL Demo at **http://127.0.0.1:5173/Velara_Atlas/demo.html**. The NEXUS landing page and `/Velara_Atlas/` base are unchanged.

To reproduce and validate the reviewed candidate:

```sh
npm run canonical:rebuild
npm run build
npm run canonical:test
```

Rebuild materializes the five JSON files from frozen, authorized migration inputs, checks permanent identity assignments and exact D-130 coordinate strings, and verifies output hashes. It does not re-extract the full private Worldbuilding registry. The original private extraction, sources, unpublished prose and confidential references are deliberately omitted. No access to the original temporary workspace is needed.

The portable tests cover orientation, fixed identities, exact reproduction, schema, coordinates, settlement eligibility, full-timeline cartographic grouping, historical boundaries, names, control, neutrality, InfoCards, omitted transport, all-70 audit reproduction, disclosure and production isolation. Run the normal build first because the production-disclosure assertion examines its actual output. CI runs these checks separately after the normal build, without requiring an `origin/main` ref. `npm run canonical:audit` regenerates the complete [70-system audit](AFFILIATION_AUDIT.md).

`browser-review.mjs` is a callback for the existing Playwright MCP harness, not a Node test or new dependency. With the candidate running, invoke `browser_run_code_unsafe` with `filename: "canonical-review/browser-review.mjs"`. It exercises 47 historical snapshots, both cameras, settlement/association cards, survey search, selection and archival fallback. It writes review screenshots to `evidence/`. The provisional influence radius is exactly **2 LY**; only settlement-eligible, historically associated systems contribute. Direct administration and derived cartography remain separate.

See [the implementation report](IMPLEMENTATION_REPORT.md) for the source revision, preserved findings, public-content audit and exact verification results. Do not merge or deploy before review.
