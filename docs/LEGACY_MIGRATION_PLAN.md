# Canonical legacy data migration safeguards

Status: PLAN ONLY. Do not modify public canonical data without creator approval.

The existing public/data/political.json and sector.json and timeline resolver use legacy v0.1 historical records/IDs. The v1.1 schema and examples/demo_atlas are NONCANONICAL.

1. Preserve all tested chronology (0, 320, 359, 360, 900, 970, 1199, 1200 A.E.), six sovereign Cantums and Rekdolin/Okeanberg history.
2. Propose a stable identity crosswalk from legacy cantum_a style and sys_foundation IDs to new can_XXXX and sys_XXXX formats. Require creator approval before assigning new canonical IDs.
3. Preserve dates, precision, political distinctions, all nulls and known-by uncertainty. Do not infer exact discoveries from historical snapshots.
4. Convert only creator-approved public facts. Demo galaxies, planets, fictional station statistics and gate routes must never be promoted to canon.
5. Implement and test a v1.1 pure resolver for dated InfoCards, discovery, construction/decommissioning, zones and archival fallback. Maintain legacy regression checks.
6. Audit final published JSON, Git history and website build for private source disclosure prior to approved release.

This PR upgrades only noncanonical fixtures, structural schema, tests and docs. It does not migrate canonical public files.
