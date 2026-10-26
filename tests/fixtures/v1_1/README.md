# Frozen noncanonical v1.1 regression dataset

Byte copies of the six accepted Checkpoint 3 demo JSON files from `32f43d6`, captured before the v1.2 migration. They retain the approved system-only nebula and the older branching local-gate contract. Not canon and never a viewer/build input. Validate with `schemas/atlas-v1_1.schema.json`. Existing history/schema/cartography regressions use this snapshot; new navigation regressions use the separate frozen v1.2 fixture, and viewer tests use the active v1.3 Demo under `public/datasets/demo/`.
