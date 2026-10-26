# Legacy example regression inputs

Architecture Phase 2 moved these files byte-for-byte from `examples/`, starting
from `6ae6ee2160f36e2ff2ac76319d1399be2b0e2247`. This is a separate legacy fixture
area, not part of the frozen `v1_1/` or `v1_2/` datasets. Do not reinterpret its
IDs, map units or old schema shapes as current v1.2 records or new canonical facts.

| Retained file | Original role / current consumer |
| --- | --- |
| [noncanon_sector_system.json](noncanon_sector_system.json) | Legacy v0.1-style sector entry, no schemaVersion; `tests/check.mjs` history/fallback assertions |
| [noncanon_system_detail.json](noncanon_system_detail.json) | Explicit `0.1.0` detail, old `type`/map-unit shape; `tests/check.mjs` object history assertions |
| [cantum_b.json](cantum_b.json) | Versionless legacy/v0.2-proposal Cantum shape; intentional rejected input in `tests/viewer.test.mjs` build audit |

The two noncanon files remain synthetic legacy inputs. `cantum_b.json` preserves
previously public chronology-derived reference content; retaining it here neither
migrates canon nor approves its old format for current authoring. Every file
remains excluded from the viewer and production build. Original and moved hashes
are recorded in [Phase 2 results](../../../docs/archive/reports/PHASE_02_DATASET_MIGRATION_RESULTS.md).
