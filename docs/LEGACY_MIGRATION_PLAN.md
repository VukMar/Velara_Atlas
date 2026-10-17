# Canonical legacy migration safeguards

**Status: PLAN ONLY for canonical content.** No canonical migration is authorized.

`public/data/political.json`, `public/data/sector.json` and
`src/timeline/resolve.mjs` retain the legacy v0.1 contract and permanent IDs.
The modern pure resolver, Schema v1.2, generator and three-system viewer are
implemented for **noncanonical `examples/demo_atlas/` only**. Frozen v1.1 and
v1.2 test datasets preserve earlier behavior; none is a canonical release.

## Required before a future canonical migration

1. Secure the creator's explicit scope and a reviewed backup/checkpoint.
2. Propose an identity crosswalk from legacy IDs such as `cantum_a` and
   `sys_foundation` to permanent numbered IDs. Obtain creator approval before
   assigning or translating canonical identities.
3. Preserve tested chronology (including 0, 320, 359, 360, 900, 970, 1199 and
   1200 A.E.), six sovereign Cantums and Rekdolin/Okeanberg history. Retain
   uncertainty and distinguish administration, control, naming and affiliation.
4. Convert only approved public facts. Never copy invented demonstration names,
   coordinates, gates, dates, population or equipment into canonical records.
5. Reuse the existing modern resolver where compatible, with explicit adapter
   or migration tests. The resolver already supports dated InfoCards, knowledge,
   existence, zones and archival fallback; preserve the independent legacy tests.
6. Review any adopted v1.2 navigation declarations and dedicated lifetime pairs.
   The current generator/loader are deliberately demo-allowlisted; canonical
   publication needs a separately approved input/release design, not a wider
   directory scan or a path switch in the CLI.
7. Verify schema, references, interval semantics, unknown/null distinctions,
   coordinates/units, generated freshness, historical boundary cases and reader
   disclosure. A known-by date is never an invented exact discovery.
8. Audit reviewed JSON, build output and public Git disclosure before any
   separately authorized release. Do not read private RTF without an explicit
   task, and never commit source lore or hidden records.

The Checkpoint 3.6 audit changes documentation only. It does not perform this
crosswalk, migrate history or rewrite any canonical file. Current structure and
authoring instructions live in [DATA_MODEL.md](DATA_MODEL.md) and
[NAVIGATION_AUTHORING.md](NAVIGATION_AUTHORING.md).
