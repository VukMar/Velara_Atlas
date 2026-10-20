# Current JSON learning references — NONCANONICAL

This directory is reference-only. The supported dataset contract is **v1.2.0**:
[master schema](../schemas/atlas.schema.json), [data model](../docs/DATA_MODEL.md)
and [navigation authoring](../docs/NAVIGATION_AUTHORING.md).

The working demo is [public/datasets/demo](../public/datasets/demo/sector.json).
The viewer and mandatory regression inputs do not use this directory. These
learning files are excluded from production and do not reserve IDs or establish
Continuance canon. They reuse already public, explicitly noncanonical demo values;
never merge their duplicate IDs into the demo as new entities.

| File | Validate against master-schema definition | What it teaches |
| --- | --- | --- |
| [v1_2/celestial-star.json](v1_2/celestial-star.json) | `#/$defs/celestial` | Known physical diameter, static CNU position, dated name and six-field InfoCard; `cb_0001` copied from demo System A |
| [v1_2/system-detail.json](v1_2/system-detail.json) | `#/$defs/systemDetail` | Complete minimal detail envelope with System A's existing map and its star only; not a complete dataset or replacement for the live system |
| [v1_2/presentation.json](v1_2/presentation.json) | `#/$defs/presentationFile` | Existing validated demonstration field/color settings, keyed by demo Cantum IDs |

The star file is an object example, not a file envelope with `schemaVersion`.
The complete system and presentation files contain `schemaVersion: "1.2.0"`.
All three are validated against their actual definitions during Phase 2; the
[results](../docs/PHASE_02_DATASET_MIGRATION_RESULTS.md) record that check.
Use the installed Ajv Draft 2020-12 validator for those definitions; schema IDs
are offline identifiers, not network endpoints. Dataset-wide validation additionally
requires a sector, Cantums, connections and appropriate references; use the
working demo and `npm run validate` for that full workflow.

Legacy regression examples now live in
[tests/fixtures/legacy_examples](../tests/fixtures/legacy_examples/README.md).
Superseded proposal JSON is retained in
[docs/archive/json-proposals](../docs/archive/json-proposals/README.md), with old
names, values and formats intact. Those shapes are not current templates.
