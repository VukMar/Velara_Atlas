# MCR / Velara Atlas — JSON and timeline foundation v0.1

This is a data-and-timeline starter, **not yet a rendered Three.js atlas**. It is designed for a future GitHub Pages static read-only viewer and separate local editor.

## Files
- `public/data/political.json` — political names, seven Cantums, eras and dated milestones. At 1200 A.E. there are six sovereign Cantums (A, B, C, E, F, G); historical D is within C.
- `public/data/sector.json` — master sector settings and one coordinate-free founding-system placeholder (not visible on map until positioned). Its `publicDetailPath` is null so it resolves to the NEXUS fallback.
- `public/data/systems/` — intentionally empty for approved system details.
- `examples/noncanon_sector_system.json` — example survey-to-settlement system rename with deliberately fictional names and dates.
- `examples/noncanon_system_detail.json` — example per-object discovery and height Y properties.
- `src/timeline/resolve.mjs` — pure JavaScript resolution functions usable in Three.js viewer or Node.
- `tests/check.mjs`, `tests/demo.mjs` — verify logic and print timeline examples.
- `docs/DATA_RULES.md` — critical decisions, precision flags and pending canonical entries.

## Try it
Install Node.js (18+), then run in this folder:

```bash
npm test
npm run demo
```

No external npm dependencies are required for these tests. For the actual map viewer, use Vite + Three.js in a subsequent development phase.

## Visual narrative
At 0–359 A.E. NEXUS describes the founding civilization as `Drevnasel`. At 360–899 she presents `The Continuance`, unified. At 900–1199 she may say `The Continuance — Age of Fragmentation`. At 1200+ the map presents `Velara Sector` with independent Cantums; `The Continuance` remains an important **historical** name, not a current unified state.

## Keep private lore private
This starter can be committed once reviewed. Never put unpublished objects or full private system JSON in `public/`. Only released system objects go into the static build. Store canon master/private detail under a local-only `private/` or separate private repository, and publish deliberately selected records.

## Updating historical records
Use `fromAE` inclusive and `untilAE` exclusive. To add a new name, close the prior interval at the same year the new interval begins. Do not change stable IDs or duplicate files for different years.

## Sources and editorial notes
- Historical milestones and seven Cantum names follow the established creator-directed working canon; inexact dates are explicitly marked `circa` or `confirmed_by`.
- Names and survey codes in `examples/` are noncanonical illustration only.
- All `public/data/` JSON is public once deployed. Do not store plot twists, secret sites, or unpublished story content there.
