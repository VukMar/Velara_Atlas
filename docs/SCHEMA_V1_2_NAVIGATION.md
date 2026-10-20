# Velara Atlas — Schema v1.2 Navigation Authoring & Generation Specification

**Status:** CREATOR-APPROVED DESIGN SPECIFICATION — implemented for the noncanonical demonstration; no canonical migration authorized.
**Scope:** Object-authored connections, exclusive gate pairing, navigational-boundary placement written back into approved system JSON, standalone offline registry generation, and a second noncanonical demonstration Cantum.  
**Basis:** Existing Velara Atlas v1.1 data contract, Checkpoint 3 historical viewer and connector audit, and creator-approved direction in the October 2026 design discussion.  
**Implementation boundary:** This design approval is not a blanket authorization to modify the repository. Obtain a focused Codex implementation handoff. Do not change canonical `public/data/`, the legacy resolver, or private lore. Confirm the local workspace has an accepted, committed Checkpoint 3 baseline before implementation.

**Current dataset location (architecture Phase 2):** `public/datasets/demo/`.
The old `examples/demo_atlas/` paths in the original design/delivery sections
below retain their historical context; use [the authoring guide](NAVIGATION_AUTHORING.md)
for current generator and recovery paths. No navigation semantics changed.

**Current implementation note:** The focused handoff was completed in `4ff0ecb`.
The exact names `navigation`, `localLinks`, `interstellarConnection` and
`positionMode` are implemented by current v1.2 definitions and offline tools.
Use [NAVIGATION_AUTHORING.md](NAVIGATION_AUTHORING.md) for commands, six-decimal
rounding, allowlists and recovery; [the original results](NAVIGATION_V1_2_RESULTS.md)
retain acceptance evidence. Design examples and the original implementation
sequence below are preserved as approved history, not a pending migration task
or a current live-demo inventory. [The current audit](REPOSITORY_AUDIT_3_6.md)
records subsequent layout/tests. No Checkpoint 4 or canonical authorization follows.

## 1. Purpose

Make routine Atlas worldbuilding easy: an author adds systems and objects, declares a navigation connection once inside the appropriate object, runs `npm run connections`, reviews the modified system JSON plus generated `connections.json`, then commits/pushes those files together. **The browser must not construct the navigation graph or run the generator.** It continues to consume a normal `connections.json` object in the existing viewer/resolver format.

The source of truth *for authoring* becomes the object's declaration; `connections.json` is the deterministic, generated *runtime index*. The original `lnk_XXXX` stable identity, `fromAE` inclusive / `untilAE` exclusive historical interval, direction, and endpoint rules are retained.

## 2. Invariants (approved direction)

1. A physical short-range gate has **at most one fixed paired short-range gate over the entire record**, never branching. A body may host any number of *separate* local gate endpoints for different connections. An unconnected gate may exist, but a connected gate has only one partner.
2. A Jump Gate pairs with at most one Jump Gate in a different system for its lifetime. A Jump Hole pairs with at most one Jump Hole in a different system. Neither may connect to the other type. No historical repointing of any gate/hole endpoint in v1.2.
3. Connections are **authored exactly once**, not independently on both endpoints. The reverse lookup is generated. A single authored link does not imply bidirectional travel: direction remains explicit.
4. All physical gate/hole entities and their permanent IDs, construction/discovery dates, names, InfoCards and object classification are **author-created**, not auto-invented by a connection generator.
5. Local links connect a dedicated pair of short-range gates **within one system**. Interstellar links pair dedicated Jump Gates or Jump Holes **across different systems**. The Sector View only plots interstellar links in light-years; a System View plots local links in CNU.
6. Gate construction, decommissioning, discovery/confirmed knowledge and link activation are independent facts. A connection never makes a gate available before the relevant historically eligible date.
7. `orbitingId` and static manually authored XYZ for moons remain unchanged in v1.2. Differentiated visual marker sizes are approved for Checkpoint 4; nebula visuals stay within System View. Do not conflate these with navigation geometry.
8. **No separate generated positions sidecar.** `npm run connections` writes calculated XYZ solely into `position` on explicitly boundary-derived short-range gate records, and writes the familiar generated `connections.json`. The viewer reads both as ordinary published JSON.

## 3. Navigation boundary, not a spatial-zone record

A positioned **anchor object** may have optional `navigation.boundaryRadiusCNU` (strictly positive finite number). Initial supported anchors: celestial bodies, stations, Jump Gates and Jump Holes; a short-range gate is an endpoint rather than its own placement anchor. A boundary is an **invisible sphere**, centered on that object's authored, absolute XYZ coordinate, in the system's CNU units. It is not a `zon_XXXX` environmental zone, sovereignty region, collision volume, or lore claim about gravity. It is an explicit navigation-authoring parameter.

An anchor without a boundary can exist normally. To automatically place gates for a local route, **both** anchor objects must have a boundary. No guessed radius/default is silently assigned. Coordinates and boundaries must fit the system's declared map limits or produce a useful validation error.

## 4. Authored connection declarations (proposed field names)

This proposal introduces two distinct declarations while preserving the same generated connection structure.

### 4.1 Local link — inside an anchor object's `navigation.localLinks[]`

The entry lists the destination **anchor** and the existing short-range gate IDs for each end. It is authored on exactly one of the two anchors; that anchor is source/endpoint A for direction semantics. The destination anchor needs a boundary but no duplicate link entry.

```json
{
  "navigation": {
    "boundaryRadiusCNU": 2500,
    "localLinks": [
      {
        "id": "lnk_0100",
        "targetObjectId": "cb_0005",
        "sourceGateId": "gat_0100",
        "targetGateId": "gat_0101",
        "direction": "bidirectional",
        "fromAE": 420,
        "untilAE": null
      }
    ]
  }
}
```

This is an **illustrative fragment** of a planet/station/etc., not a standalone valid v1.2 record. `datePrecision` may be included if the existing historical contract supports it. For a date without exact-year certainty, do not invent a precise construction or establishment year.

The generator resolves the containing system ID and anchor IDs, verifies that both short-range gate records exist in that system, and generates one `short_range` connection with `transportType: "short_range_gate"`, `endpointA: sourceGateId`, `endpointB: targetGateId`, and the authored ID/dates/direction.

### 4.2 Interstellar link — a single `interstellarConnection` on a Jump Gate or Jump Hole

```json
{
  "id": "gat_0102",
  "entityType": "gate",
  "objectType": "jump_gate",
  "position": {"x": 18000, "y": 500, "z": -12000},
  "interstellarConnection": {
    "id": "lnk_0101",
    "targetSystemId": "sys_0003",
    "targetObjectId": "gat_0103",
    "direction": "bidirectional",
    "fromAE": 610,
    "untilAE": null
  }
}
```

Again, a **fragment**: retain all other required v1.1 fields in actual gate records. The containing object is `endpointA`, and its target is `endpointB`. The generator infers `transportType` (`jump_gate` or `jump_hole`) and `linkType: "interstellar"` from entity types; the destination cannot define the same connection again. Full one-to-one pairing is validated **globally** across all released records, not only per year. Both ends retain absolute authored XYZ positions.

An unconnected Jump Gate or Jump Hole can omit `interstellarConnection`. Authoring a destination's unreleased endpoint ID is permissible only if the current explicit public-release policy authorizes that identifier; unknown private details must never leak into a generated artifact.

## 5. Auto-positioning of local gate pairs

Gate identity, history, and placement mode are authored manually. Only a gate with `objectType: "short_range_gate"` and explicit `positionMode: "boundary_derived"` may have its `position` field rewritten by the generator. Connected gates initially may declare `position: null` while authoring; after successful generation their `position` contains a normal finite XYZ object. A `short_range_gate` not in boundary-derived mode is never silently moved. In this initial revision, every connected short-range gate must opt into boundary-derived placement; manually positioned connected short-range gates are deferred to a later explicit design decision.

The two gate IDs in each authored local link identify *which* gate belongs to each anchor; a gate must belong to exactly one lifetime link. The generator must verify both gates are marked `positionMode: "boundary_derived"`. The viewer never calculates gate positions. The generator must not rewrite other record fields, reorder `objects[]`, or change author-written coordinates of planets, stations, Jump Gates, Jump Holes, moons or other bodies.

Let `A`, `B` be the two anchor centers in **3D CNU**, `rA`, `rB` their respective navigation radii, and `u = (B - A) / |B - A|`:

- `sourceGatePosition = A + rA * u`
- `targetGatePosition = B - rB * u`

Reject zero center-to-center distance, `rA + rB >= distance(A,B)` (touching or overlapping boundaries), nonfinite values, and positions outside map bounds. Calculate in XYZ (not merely the X/Z plane), retaining authored Y elevation. Numeric serialization must be deterministic and use an agreed finite precision, e.g. a fixed decimal-rounding policy documented by the generator. Ensure rounded coordinates remain within bounds. This is static chart placement, **not** orbital motion.

A gate keeps one stable chart position independently of the selected historical year; historical filters determine whether it and its route can be shown. A boundary-derived gate absent from all authored links is an authoring error, not an instruction to invent coordinates. An unconnected gate may retain an ordinary hand-authored XYZ and should have no boundary-derived position mode.

**Example fragment of a new local gate before generation:**

```json
{
  "id": "gat_0100",
  "entityType": "gate",
  "objectType": "short_range_gate",
  "positionMode": "boundary_derived",
  "position": null
}
```

This is a **fragment only**, not a full valid gate record: the existing dates, history, `icon` and `infoCard` are still required. After running the generator, only `position` changes from `null` (or from its former computed value) to the calculated XYZ.

**Schema handling:** v1.2 authoring validation may accept `position: null` **only** for `short_range_gate` with `positionMode: "boundary_derived"`; publication validation and `connections:check` must require every such gate to have a valid computed XYZ. The schema must continue to require absolute XYZ for other objects and for non-derived gates. Do not loosen validation for the entire object union.

## 6. Runtime compatibility: one generated registry, updated system records

`npm run connections` is a **standalone, manually invoked Node.js authoring command**. It reads the vetted noncanonical `sector.json` and its approved system-detail files, derives all physical route pairings and local gate coordinates, validates the complete resulting dataset, and writes **only two classes of output**:

1. **`examples/demo_atlas/connections.json`** — a deterministic, viewer-compatible connection registry using the existing `.connections` array and fields: `id`, `linkType`, `transportType`, `endpointA/B`, `direction`, `fromAE`, `untilAE` and optional `datePrecision`. `schemaVersion` updates in concert with the approved v1.2 dataset migration.
2. **The existing affected `examples/demo_atlas/systems/sys_XXXX.json` files** — update *only* `position` of explicitly `boundary_derived` short-range gates, calculated from authored anchor centers and boundary radii. All unrelated source fields, other object positions, and historical data are left unchanged.

There is **no `gate-positions.json`** and no positions merge step for the renderer, catalogue, or history resolver. After generation, the viewer reads ordinary system XYZ and the ordinary generated connection graph, just as it already does. The authored relationship definitions remain in system JSON; the registry is a reproducible output, **not** a second source of truth.

The script need not start the Atlas, invoke Vite, reach GitHub, or access the network. It must not generate links automatically merely because objects are spatially near one another; only explicit authored declarations become routes.

## 7. Standalone commands, validation and safe writes

- **`npm run connections`**: explicitly run by the author after changing system JSON; no automatic execution on browser startup or development-server launch. Read only allowlisted public-safe demonstration files referenced by a vetted sector registry, and do all calculations **in memory** before writing. Confirm all source declarations and both proposed output classes pass structural and relationship validation. Deterministically sort the generated link records; preserve system file ordering wherever practical, changing only the necessary gate `position` values. Repeating the command with unchanged authoring inputs must produce byte-identical generated content and no additional Git diff.
- **`npm run connections:check`**: recompute the expected registry and all derived gate positions **without writing anything**. Fail if `connections.json` is missing/stale or if any gate's committed position does not match its computed position. Include this check in regular validation/test/build commands, but **never** auto-generate on build. This makes forgetting the manual command visible before publishing.
- **Before first migration**: preserve the legacy/demo `connections.json` in version history, and map every existing demo link to exactly one new authored declaration. Fail the transition rather than quietly deleting links that haven't been migrated.
- **Pre-write safety**: validate every input, gate identity, map bound, endpoint, historical period, updated detail object, and the generated registry *before* touching files. Use temporary staged files and verified backups; replace only files whose contents changed. If a write fails, restore from backup where possible and report a clear recovery procedure. **Filesystem operations across multiple files are not guaranteed to be one atomic transaction**; a failed write must never be reported as successful. A subsequent `connections:check` must catch any partial state.
- **Review and commit**: show which links were added/removed and which gate positions changed, preferably with a dry-run preview, and commit both the changed system files and generated `connections.json` together. Track the generated file in Git; never add it to `.gitignore`.

The generator must not traverse unrestricted paths, ingest `.rtf` lore, `private/`, `unreleased/`, `.local-references/`, arbitrary network URLs, or canonical v0.1 data. Initial implementation is restricted to `examples/demo_atlas`; future canonical publishing is a separate creator-approved undertaking.

## 8. Validation contracts

Structural JSON Schema Draft 2020-12 v1.2 validates allowed fields and their shape. Relationship validation and the generator handle cross-file semantics:

- Globally unique `sys_`, `cb_`, `sta_`, `gat_`, `jhl_` and `lnk_` identities. Every `lnk_XXXX` is author-assigned and persistent; never generate IDs from iteration order.
- Every local declaration names two **distinct, existing** short-range gates in **one** system, each gate used by **at most one lifetime link**. Both anchor IDs exist, differ, refer to eligible types, and have positive spherical navigation boundaries. Gate pairing and physical identity do not change across historical years.
- Every interstellar declaration names two distinct Jump Gates or two distinct Jump Holes in **different** systems, with no mixed gate/hole pairs and at most one lifetime partner per endpoint. Reject reciprocal duplicate declarations. An explicit local gate near a Jump Gate remains a different object from that interstellar Jump Gate.
- `fromAE` inclusive, `untilAE` exclusive/null, valid interval order and direction; no invented dates. A route cannot activate before a known gate's construction, discovery/confirmed-knowledge threshold, or applicable publication eligibility, nor extend past known decommissioning without an explicit handling rule. Partial/unknown dates must never be treated as exactly known.
- Explicit `positionMode: "boundary_derived"` for all locally connected short-range gates; no such mode on any nonlocal gate. The generator changes only their `position`, and does not silently override authored manual locations elsewhere.
- Finite **XYZ in CNU**, no zero-distance anchors, touching/overlapping spheres, off-map results, or mixing with sector ly. `position: null` is allowed only as a strictly limited pre-generation authoring state; no unresolved positions may enter the validated viewer build.
- The public generator verifies released endpoint records. Unreleased/fallback references must follow explicit approved disclosure rules and must not silently expose hidden IDs or claim verification of private objects.
- Proposed rewritten system JSON and `connections.json` must both pass structural and relational validation before write; after write the same checks and freshness comparisons must succeed. On failure, preserve the previous valid dataset as far as filesystem rollback allows and exit nonzero.
- The public build audit continues excluding canonical and private material, and refuses obsolete generated graph data or mismatched stored gate positions.

## 9. Demonstration expansion (noncanonical only)

Expand `examples/demo_atlas` to make the new rules observable:

- `can_0001` stays the original **blue** test Cantum with Systems A and B. Keep the historical test of one bubble progressing into a merged two-system influence region.
- Add `can_0002`, a distinct **noncanonical** Cantum with an independently colored territory, and a new **`sys_0003`** (System C), positioned far enough from A/B to make its separate territory legible without implying a new political merger. The color is a presentation setting, not a faction attribute inferred from a name.
- Give System C a star and at least one planet, with its own navigation boundary and dedicated local short-range gate pair. Include correct construction/discovery/route history and all required metadata.
- Add a **new** long-range Jump Gate in System A and one in System C, paired exclusively to connect those two systems. Do not repoint A's existing paired Jump Gate to System B.
- Migrate the noncanonical A/B branching short-range routes into **dedicated one-to-one gate pairs**, authoring the additional physical gate records and their histories. Do not reuse an existing gate for two links.
- Include at least one link declared on a planet or station that targets the navigation boundary around an interstellar Jump Gate, thereby verifying local-to-interstellar transfer without conflating the two different gate types.
- Preserve the independently tested Jump Hole pair between A/B and its historical date filtering. Preserve the recently revised nebula placement **in a System View** rather than reverting it to Sector View. Keep other zone geometry tests intact.
- Update fixture test counts, expected routes, entity IDs and the new demo allowlists explicitly; do not weaken old test cases merely to make them pass.

No fake demo names, years, or RGB values are Continuance canon; the eventual implementation may select clearly noncanonical, mechanically useful fixture values.

## 10. Tests and acceptance criteria

At minimum verify:

1. `npm run connections` runs offline with no Vite/browser; unchanged authored inputs produce byte-identical registry content and **no additional system JSON changes** on the second run.
2. `npm run connections:check` is read-only, succeeds on current outputs, and fails with specific diagnostics after an authored connection, anchor radius, or anchor coordinate changes without regeneration.
3. Invalid endpoints, duplicate `lnk_` IDs, wrong gate types, reused short-range endpoints, duplicate reciprocal declarations, missing boundaries, zero-distance anchors, touching/overlapping boundaries, and off-map gate results are rejected before any write.
4. Exactly the authorized `position` fields of `boundary_derived` short-range gates are rewritten; all other gate/object attributes, author-specified absolute coordinates, and historical records remain unchanged. Existing CNU coordinates are not silently rescaled.
5. Schema explicitly permits pre-generation null only for marked derived gates. Post-generation/build checks reject any residual null derived-gate coordinate. Malformed target files cause safe failure with no intended modifications and actionable diagnostics; simulate a write failure and verify backup/recovery behavior plus detection of partial output.
6. Generated link IDs, endpoint A/B ordering, direction, types, and year intervals reproduce the approved declarations with stable identities. The existing renderer/resolver and InfoCards work **without a separate position sidecar**.
7. The A/B/C demo shows two distinct Cantum colors, distinct territory regions, valid historical membership, A↔B existing Jump Gate/Jump Hole pairs, and the new A↔C Jump Gate pair. Local routes use independently paired gate endpoints, not branching gate reuse.
8. The nebula remains in System View; sector stays focused on systems, routes and Cantum influence. Moon relative-coordinate modeling is deferred; visual marker size hierarchy remains a Checkpoint 4 task.
9. `npm test`, `npm run validate`, `npm run demo`, `npm run build`, browser navigation and production preview all pass. `npm run build` detects stale generated outputs without automatically repairing them. Public output contains only approved noncanonical fixture data.

## 11. Compatibility and implementation order

A focused **pre-Checkpoint-4** Codex task (after explicit implementation authorization):

1. Confirm the current Checkpoint 3 changes are safely committed; inspect and respect `AGENTS.md`, the v1.1 schema, and canonical migration guardrails. Specify v1.2 authoring fields (`navigation`, `localLinks`, `interstellarConnection`, `positionMode`) with strict validation and backward-compatible handling where applicable.
2. Implement the pure connection graph/coordinate generator and **manual** `npm run connections`, with read-only `connections:check`. Do **not** add a gate-position sidecar or add on-load generation to the browser.
3. Migrate existing noncanonical links into object-local authoring declarations and convert demo's branching short-range endpoints to permanent exclusive pairs. Generate their coordinates into the existing system JSON files. Validate the original history and link timing behavior.
4. Add Cantum 2 and System C to the noncanonical fixtures with a contrasting territory color, plus a new exclusively paired A↔C Jump Gate route. Expand safe demo import allowlists and fixture tests as needed; never publish canon or secrets.
5. Keep existing viewer graph consumption intact. Add generation freshness to tests and build audits; verify route selection, perspective and timeline behavior in Playwright and preview. Preserve original v0.1 canonical history.
6. Stop, report a changed-file list and all test results, and wait for approval before Checkpoint 4 visual styling or local-editor work.

Do not rewrite public canonical legacy v0.1 records, add parent-relative moons, simulate moving orbits, or introduce any runtime connection generator. The v1.2 demo must be clearly labeled **NONCANONICAL**.

## 12. Final approved design decisions

The following decisions are **approved** and should be treated as the v1.2 implementation contract:

1. **Single authored source per link**, stored within an eligible system object. Local anchor objects may author multiple `navigation.localLinks[]`; each referenced physical short-range gate is exclusively paired with one other short-range gate for its lifetime. Jump Gates and Jump Holes may each author at most one `interstellarConnection`, paired to the same type in a different system.
2. **Gate/hole identity and history remain manually authored**. The generator never invents permanent infrastructure entities, IDs, or dates, and preserves the existing route schema's endpoint and historical semantics.
3. **One manual standalone command:** `npm run connections`. It creates/updates `examples/demo_atlas/connections.json` and recalculates `position` inside the affected existing system JSON gate records. Only explicitly marked `boundary_derived` short-range gates can be moved.
4. **No `gate-positions.json`**. The viewer uses the same ordinary JSON coordinates and central graph it already understands. No generator runs on Atlas load, dev-server startup, or build.
5. **Read-only consistency check:** `npm run connections:check` guards against stale graph data and stale gate positions; validation/build should fail clearly rather than silently rewrite files.
6. **Demonstration expansion:** add a second clearly noncanonical Cantum and a third noncanonical system, with a visually distinct political color and an additional exclusive Jump Gate connection to System A.
7. **Moon relative positioning deferred**, **system-only nebulae retained**, and **celestial size hierarchy approved for Checkpoint 4**. No canonical history migration authorized.

Exact new JSON property names (`navigation`, `localLinks`, `positionMode`, etc.) are the proposed implementation names in this document and may be refined only if they preserve these semantics and are documented/tested before migration. Implementation work remains subject to a separate, scoped Codex instruction.

