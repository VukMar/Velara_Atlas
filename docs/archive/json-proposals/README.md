# Historical JSON proposals — superseded, not v1.2 templates

Architecture Phase 2 preserved these eight former standalone `examples/*.json`
files byte-for-byte from `6ae6ee2160f36e2ff2ac76319d1399be2b0e2247`. They have no
positive runtime or regression-reader dependency. Their document value is the
original v0.2 proposal shapes, old IDs, InfoCard examples and design history.
They are excluded from browser inputs and production output.

| Retained file | Actual version / historical shape |
| --- | --- |
| [cantum_a.json](cantum_a.json) | No schemaVersion; legacy `cantum_a`, `names`, `letter`, `regionFirstAttestedByAE` plus proposed InfoCard |
| [celestial_star.json](celestial_star.json) | No schemaVersion; v0.2-style `obj_demo_star` and old icon name |
| [celestial_colonized_planet.json](celestial_colonized_planet.json) | No schemaVersion; v0.2-style `obj_demo_colony_planet`, legacy affiliation ID |
| [celestial_uncolonized_planet.json](celestial_uncolonized_planet.json) | No schemaVersion; v0.2-style `obj_demo_unsettled_planet` |
| [full_noncanonical_system_detail.json](full_noncanonical_system_detail.json) | Explicit `0.2-draft`; `map_units`, `referencePlaneY`, old IDs |
| [sector.json](sector.json) | Explicit `0.2-draft`; old sector/view/political-path structure |
| [star_system_sector_entry.json](star_system_sector_entry.json) | Explicit `0.2-draft`; legacy ID and `visibility` shape |
| [station.json](station.json) | No schemaVersion; v0.2-style `obj_demo_station`, old station/icon classification |

Versionless objects are classified by their actual legacy fields and their
relationship to the explicitly `0.2-draft` examples; no version field was added.
Some retained prose refers to already public chronology. Archival retention does
not approve it as new canonical data or migrate `public/data/`. The related
`cantum_b.json` proposal now has a regression role in
[legacy_examples](../../../tests/fixtures/legacy_examples/README.md).

Historical reports remain unchanged, including their original `examples/` paths.
For any former standalone filename, its basename identifies the corresponding
file here or in the legacy fixture directory. Current learning material is in
[examples](../../../examples/README.md); use the
[data model](../../DATA_MODEL.md) and [current schema](../../../schemas/atlas.schema.json).
See [Phase 2 results](../reports/PHASE_02_DATASET_MIGRATION_RESULTS.md) for the complete
old-to-new map and hash evidence.
