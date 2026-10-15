# Velara Atlas — Viewer Specification

**Document status:** Approved Milestone 3 functional specification  
**Version:** 1.0 (viewer requirements; **not** JSON Schema v1.0)  
**Approved:** 2026-10-15  
**Audience:** Project owner, Codex, and future contributors  
**Implementation status:** Specification only. The Three.js viewer is **not implemented** by this document.

## 1. Purpose and governing principles

The Velara Atlas is a **read-only, JSON-driven, historical navigational atlas**, curated in-universe by **NEXUS** for Maric Cosmic Records / *The New World*. It represents authored three-dimensional space through a clear, mostly top-down navigation interface in the spirit of classic space-game charts, with an optional perspective view. All artwork, copy, and application assets must be original or appropriately licensed; **do not copy Freelancer or Discovery assets**.

The Atlas must support incremental worldbuilding. An astronomical system may be historically known and listed in the archive even when its detailed navigational map has not yet been released. A published detailed map may contain only some of its objects. Missing details are **not** grounds for inventing geometry, dates, names, or lore.

The viewer must remain **data-driven**: adding another supported object, system, Cantum, or valid dated record does not require modifying renderer code. Adding a **new unsupported entity or geometry type** can require an explicit schema and renderer extension.

### Non-negotiable boundaries

- **Public viewer only:** GitHub Pages–compatible, static, no publicly writable API, editing controls, or admin login. A local editor is a **separate future milestone**.
- **Public data only:** Everything a browser fetches, everything committed to the public repo, and everything emitted in a production bundle is assumed publicly accessible. Never ship hidden spoilers under `hidden: true` or rely on client-side authorization to protect them.
- **Historical truth is separate from publication:** Date filters determine what was known or existed at a selected year; release/publishing determines which approved details are downloadable. The former must never override the latter.
- **Stable IDs:** IDs never change when names, coordinates, affiliations, descriptions, or political control change.
- **No invented canon:** Use only approved public JSON and the historical resolver's documented rules. Demo records are intentionally noncanonical.
- **Testable separation:** JSON loading, historical resolution, navigation graph processing, camera control, and UI rendering should be independently testable wherever practical.

## 2. Authority and dependencies

Use the repository's existing source of truth, in this priority for matters of scope:

1. `docs/DATA_MODEL.md` and `schemas/` — approved **JSON Schema v1.0.0** structure and types.
2. `docs/DATA_RULES.md` — existing Continuance chronology and date caveats.
3. `docs/ARCHITECTURE.md` and `docs/CONTENT_WORKFLOW.md` — viewer/publication boundaries.
4. `examples/demo_atlas/` — **noncanonical** test fixture (not official sector geography).
5. `AGENTS.md` — agent workflow and canon guardrails.

The v0.1 `src/timeline/resolve.mjs` and old `public/data/*.json` are **not yet migrated** to the v1.0.0 schema. Implementing this specification requires planned adapter/migration work and regression tests; do not silently overwrite legacy canon or treat passing old tests as proof of new-feature support.

**Planned schema additions are called out in §11.** They are approved *viewer behavior* but not yet encoded by JSON Schema v1.0.0. Implement those as a versioned schema update, not as undocumented ad hoc JSON properties.

## 3. Spatial conventions and map hierarchy

### Two map levels

| Level | Contains / renders | Coordinate unit | Data source |
|---|---|---|---|
| **Sector map** | Cantum territory overlays, positioned star-system markers, interstellar Jump Gate / Jump Hole connections | `ly` (light-years) | `sector.json`, `cantums.json`, `connections.json` and later region records |
| **System map** | Celestial bodies, stations, short-range gates and routes, Jump Gates, Jump Holes, spatial zones | **CNU** (Continuance Navigation Unit) | `systems/sys_XXXX.json` and relevant `connections.json` entries |

All maps have their **own** independent `(0, 0, 0)` origin; `map.size.x/y/z` indicates **full** extents, not half-extents. The X/Z plane is the standard chart surface, with Y representing elevation. The sector and system contexts cannot be directly mixed: an interstellar route is drawn **between sector star-system positions** in light-years, not as a line between two endpoints in unrelated CNU spaces.

CNU is approved MCR terminology: a standard in-universe navigational distance measure for interplanetary positions and routes. Its conversion to kilometers is **not defined**; do not infer one.

### Static geography

Coordinates are manually authored, absolute within the containing map, and do **not** model real orbital motion. A moon can have an `orbitingId` relationship with a planet while retaining a fixed, independently editable XYZ position. Changing the year does not animate or relocate objects unless a future, separately approved historical-position model supplies that behavior.

A null `positionLY` in the sector registry denotes an unplaced system: include it in an eligible catalogue but **do not render a marker**, manufacture coordinates, or move the camera to the origin.

## 4. Camera modes and input behavior

### Default camera — approved

- On both map levels, open in **orthographic top-down X/Z navigation** (camera viewing along the Y axis).
- Default framing fits the **positioned, historically eligible, publicly released** content, respecting declared map bounds and sensible padding. When no markers are eligible, fit the declared map bounds and show an informative empty view.
- **Wheel / trackpad:** zoom about the pointer when practical; clamp to useful limits. **Left drag on empty map:** pan. A click should not be mistaken for a pan.
- **Top / 3D toggle:** switch to an orbitable, tilted **perspective** view showing actual Y elevation. Preserve the current map, selected object, date, and data. Switching back restores a comprehensible orthographic chart.
- **Reset View:** frame the current map again; **Focus Selection** may center on a selected positioned object. Camera state changes never write to JSON.
- 3D orbit/tilt is available only in perspective mode. Provide usable mouse and touch controls, clear affordances, and camera limits that avoid getting lost inside the scene.
- Map bounds come from JSON. The viewer should not falsely clamp data by assuming every authoring map is exactly the same size; emit validation errors for positions genuinely outside declared bounds.
- 2D labels/selection targets remain legible; handle markers with identical X/Z but different Y without losing access to the underlying entities (e.g., selection list or disambiguation when projected icons overlap).

### Selection rules

| Context | Input | Result |
|---|---|---|
| Both | Hover (pointer devices) | Highlight marker and reveal name/short label |
| Both | Single-click / tap object | Select it and update the NEXUS InfoCard |
| **Sector** | Double-click star system, or use **Enter System** | Open its public system detail, or the NEXUS archival fallback if known but unreleased |
| **System** | Double-click positioned object, or **Focus** | Center/zoom toward that object; does not change system |
| System | Select short-range gate | Highlight its eligible local links and linked gate markers |
| System | Select Jump Gate / Jump Hole | Display paired destination system and **View Destination System** action when available |
| Both | Click empty space / Escape | Deselect or dismiss the current noncritical overlay |
| Both | Return to Sector / breadcrumb | Change navigation level **without resetting the selected A.E. year** |

Following an interstellar destination must be an **explicit user action**, not an automatic teleport on selecting the gate.

## 5. Object rendering: icons and optional 3D

The approved approach is **hybrid**:

| Data-driven object | Top-down (primary) | Optional 3D representation |
|---|---|---|
| Star | Distinct star icon | Simple glowing sphere |
| Planet | Planet icon | Simple sphere; optional authored texture later |
| Moon / planetoid / asteroid | Differentiated celestial icon | Simplified small geometry |
| Station | Class-specific symbol | Marker or simple structure; model later |
| Short-range gate | Local gate icon | Simple gate structure |
| Interstellar Jump Gate | Distinct jump icon | Recognizable spatial gate structure |
| Jump Hole | Anomaly icon | Stylized spatial anomaly |
| Spatial zone | Projected translucent shape | Procedural or simplified translucent volume |

Use the object's **`entityType` / `objectType`** for logic, and an `icon` or style identifier for representation. Never determine behavior by comparing lore names (e.g. `if name === 'Putluk'`). Assets and theme styling must be replaceable without altering coordinates or canonical history.

Phase-one assets may be procedural placeholder geometry and simple original SVG icons. Complex models, cinematic effects, animation, full orbital dynamics, and final NEXUS art direction are **not required for the first functioning viewer**.

### Spatial zones — approved viewer extension

Add `zon_XXXX` **spatial-zone** support through a versioned schema expansion. Supported geometry kinds:

- **Ellipsoid:** XYZ center and 3D radii.
- **Box:** XYZ center and XYZ extents, with a documented rotation convention if orientation is added.
- **Polygon volume:** authored X/Z polygon plus vertical Y bounds; display its footprint in top-down view and extrusion/volume in 3D.

Zone types can include nebulae, asteroid fields, radiation clouds, and dust clouds. A zone has a stable ID and the universal historical InfoCard where appropriate. A named individual asteroid or planetoid remains a `cb_XXXX` celestial body; decorative particles/rocks should be procedurally rendered, **not stored individually**. Author-defined boundaries govern actual region geometry; deterministic seeds govern visual variation only. Procedural effects must never change boundaries, ownership, or route logic.

## 6. Gate networks and route visualization

**All navigational connections come from one authoritative `connections.json`**. The viewer never creates a connection solely because two gates appear close together.

| Route kind | Endpoint rule | Cardinality |
|---|---|---|
| Short-range (`short_range_gate`) | Two `gat_XXXX` short-range gates in **the same** system | A gate may have multiple eligible links |
| Interstellar Jump Gate (`jump_gate`) | Two `gat_XXXX` Jump Gates in **different** systems | Each physical gate endpoint belongs to **at most one** interstellar link in the whole dataset |
| Jump Hole (`jump_hole`) | Two `jhl_XXXX` Jump Hole endpoints in **different** systems | One-to-one paired endpoints, at most one link per endpoint |

A system connecting to systems B and C through Jump Gates requires **two separate gates** in the origin system. Multiple Jump Gate routes or Jump Hole routes between the same pair of systems are possible **only via distinct endpoint pairs**. No gate-to-hole mixed pairing. Link direction (`bidirectional`, `a_to_b`, `b_to_a`) must be reflected in the details and, where legible, a directional indicator.

**On the sector map:**

- Draw eligible interstellar links between positioned source and destination **systems**.
- Use visually distinguishable **solid** lines for Jump Gate routes and **dashed** lines for Jump Hole routes (subject to final theme tuning).
- If both routes connect the same two systems, use non-overlapping offset/curved strokes and independent hit targets. Do not silently merge them.
- Selecting a link identifies its kind, endpoints, historic availability, and the corresponding systems. An unavailable or unplotted endpoint cannot produce a fabricated line.

**On a system map:**

- Draw eligible **short-range links** using the gates' local CNU positions.
- Selecting a local gate highlights **all** its relevant links (branching is supported).
- Show interstellar gates/holes at local coordinates, with paired destination metadata; **do not draw a world-spanning line in local CNU space**.
- The **View Destination System** action opens the destination detail or its archival fallback as appropriate.

Filter routes by their dated availability, their endpoint historical visibility/existence, and public disclosure. A Jump Hole may exist physically long before it becomes known or traversable. The existing v1.0.0 schema deliberately **does not allow repointing** a single interstellar gate to another destination over time; do not invent that behavior.

## 7. Historical timeline — continuous, persistent

A **persistent historical timeline** appears along the bottom in both sector and system views.

- Default to **1200 A.E.** for the initial demo and current approved display design; actual supported minimum and latest published year come from dataset configuration, not unbounded hardcoding.
- Slider allows selection of **any whole supported year** (1-year steps).
- Provide a **direct numeric year input**, previous/next **recorded event** controls, and optional historically grounded event markers/tooltips. The next/previous controls step to events actually present in public records, **not invented milestone dates**.
- Provide **Reset to Latest** using the latest published year, not the user's current real-world calendar year.
- Changing year updates names, political affiliations, state/ownership where supported, populations, crew, armament, descriptions, existence, discovery, navigational links, overlays, and Cantum statuses as permitted by published records.
- Preserve current map, zoom, panel visibility, and camera position wherever possible. If the current map or selected object becomes historically unavailable, clear the invalid selection and show an appropriate unobtrusive notice or return to the eligible parent map. Do not display future facts.
- Resolve `fromAE` inclusive, `untilAE` exclusive, and open-ended `untilAE: null`; never treat unknown `null` year as 0 or assume an approximate historical transition is an exact legal event.

### Historical uncertainty and partial chronological knowledge

For a record with `discoveredAE: null`, **do not guess its discovery year**. The model may later add a separate **confirmed-known-by** datum (`knownByAE` or an equivalent documented construct); this is **not part of the current v1.0.0 schema**. Until a versioned rule exists, the renderer should not infer visibility at arbitrary earlier years simply because an undated record exists. Confirmed public knowledge at a date and exact discovery are distinct.

Timeline content comes from **publicly released** events only. Event markers, search, previews, tooltips, and URLs must not expose private/unreleased history.

## 8. Layout, panels, and responsive behavior

### Desktop shell — approved

```text
+--------------------------------------------------------------------+
| NEXUS / VELARA ATLAS     Sector > Cantum > System     Top / 3D     |
+---------------+----------------------------------+-----------------+
| CATALOGUE     |                                  | NEXUS INFOCARD  |
| search/filter |          MAP VIEWPORT            | selected entity |
| system tree   |          and overlays            | dated fields    |
|               |                                  | connections     |
+---------------+----------------------------------+-----------------+
| HISTORICAL TIMELINE     [--event--slider--event--]   [1200 A.E.]   |
+--------------------------------------------------------------------+
```

- **Top bar:** NEXUS / Atlas identity, current location, breadcrumbs, 2D/3D toggle, layer/settings access, reset/focus controls.
- **Left catalogue:** persistent, **collapsible**, searchable list of currently eligible Cantums, systems, or objects.
- **Center:** the primary interactive map; expands when side panels are collapsed.
- **Right InfoCard:** persistent, **collapsible**; updates on selection. Collapsing does not discard selected entity.
- **Bottom timeline:** persistent and accessible on both map levels.
- **Breadcrumbs:** sector → appropriate Cantum context (where applicable) → system. Cantum status/ownership is time-dependent; don't treat a system as permanently physically nested inside a Cantum.

Use responsive panels/drawers on narrow screens, preserving the interactive map as the main surface. Touch support requires tap selection, pinch zoom, pan, and an accessible mechanism to switch modes/open panels. Final component dimensions, colors, fonts, and imagery belong to **Milestone 5 NEXUS visual identity**, not hardcoded into this behavioral document.

### InfoCard content

The six **approved universal fields**, from the data contract, are:

`affiliation`, `class`, `crew`, `population`, `armament`, `description`.

The card also identifies the selected entity, its name **valid for the chosen year**, kind/classification, coordinate details when available, and relevant navigational destinations/actions. Display only fields appropriate and available for the selected object. For a station use **crew**; for an inhabited planet typically use **population**. An uncolonized planet may show only a description.

A `null` field means **no published value**, **not** zero or negative evidence. Count `0` is a real recorded zero; unknown count stays unknown. Render informative “Not recorded” text only if that improves clarity, not an invented assertion such as “No armament.” The InfoCard is a presentation layer, not the source of object identity or spatial placement.

## 9. Catalogue and search — approved

- **Sector view:** search and list publicly available, historically eligible **Cantums and star systems**. A system lacking sector coordinates may still appear as a searchable record but must not trigger camera movement to an invented marker.
- **System view:** search/list objects **within the current system**, including available spatial zones once supported.
- Search against **the name valid at the selected year**. Earlier/later unpublished names must not leak. Searching historical aliases across eras may be added later, but only with chronology-safe behavior.
- Selecting a result highlights/focuses it when positioned, or opens the available InfoCard/fallback when unplaced or without details.
- Filters by category/type are presentation filters; they do not alter data or the historical state.
- Public indexing is generated from **released records**, not private RTF manuscripts or unpublished JSON.
- Show a clear empty result state and avoid ambiguous duplicate-name selection by displaying classification/system context.

## 10. Overlay layers — approved

All layers are **view filters**, not modifications to source data. Maintain **separate view preferences for sector and system levels**, retained while navigating within the viewer session.

| Sector overlays | System overlays |
|---|---|
| Star-system markers | Celestial-body markers |
| System labels | Stations |
| Cantum territory shapes | Short-range gate routes |
| Jump Gate routes | Jump Gates and Jump Holes |
| Jump Hole routes | Spatial zones |
| Coordinate grid | Coordinate grid |
| Political affiliation colors | Object labels |
| Historical event indicators | Elevation indicators |

### Manually authored Cantum territories

Cantum regions must be **authored**, not automatically inferred from nearby member systems. These are optional geometric records with Cantum IDs and dated validity. Present them as subdued, transparent 2D **X/Z navigation-chart projections**; one Cantum may eventually require multiple disconnected shapes. Political border shapes are map representations, **not assumed full 3D sovereign volumes**. The editor and an explicit schema extension will define how these polygons are created, stored, and changed through history. **If no published geometry exists, show no polygon rather than fabricating one.** The Cantum remains searchable and identifiable without a border.

### Elevation

In standard 2D view, a selected object's InfoCard exposes its Y coordinate; an **optional elevation indicator overlay** can mark +/− Y offsets. In 3D mode the full positions are visible, optionally with vertical guides; turning these aids off never changes geometry.

## 11. Archival states, loading, and error handling

The following are **different**, and must be rendered differently:

| State | Expected public behavior |
|---|---|
| **Historically not yet discovered/known** | Absent from current-year map and catalogue; no future-name leakage |
| **Known system; `positionLY: null`** | Searchable archival catalogue entry if chronologically eligible; no sector marker; selecting shows available record / fallback |
| **Known positioned system; `publicDetailPath: null`** | Sector marker and catalogue entry; opening shows **NEXUS archival fallback** |
| **Known system with partial detail JSON** | Open and render exactly the released objects, even if that is just one planet or gate; no empty-map fallback merely for being incomplete |
| **Requested detail fails to fetch, parse, or validate** | **Technical error** with retry; do not mislabel as an archival limitation |
| **Present data but no eligible objects at selected year** | Valid empty historical map with explanatory message; no fabricated objects |

Recommended NEXUS fallback copy (theme/localization editable later):

> **NEXUS // ARCHIVAL NOTICE**  
> **DETAILED SURVEY UNAVAILABLE**  
> This star system is recognized in the historical record. A detailed navigational reconstruction is not yet available in this edition of the NEXUS archive.

Fallback should show any **already public** system name, selected year, and archival status; include a **Return to Sector** action. Do not call a system “classified” unless canon/publication metadata actually supports that claim. A failed URL/JSON parse is **not** permission to show this notice instead of error feedback.

### Data loading

1. Load the sector index first, then the public Cantum and connection registries needed for this map.
2. **Lazy-load** an individual `systems/sys_XXXX.json` only when the user navigates to that system (or a documented preload action explicitly permits it).
3. Cache successfully fetched public records for session navigation; rerun **historical resolution** when the year changes instead of refetching every object.
4. Keep source records immutable from viewer interactions. Validate references to permitted IDs and fail gracefully on missing/invalid data.
5. Use Vite/GitHub Pages–compatible base-relative URLs; avoid hardcoded site-root paths that break repository subpaths.
6. No local editing or saving endpoint in the public bundle.

## 12. Initial development fixtures and demo goals

The **only required initial content** is the noncanonical `examples/demo_atlas` dataset, including:

- One minimal test Cantum.
- Two systems (`sys_0001`, `sys_0002`) with sector positions and independent CNU maps.
- Two separate **interstellar routes** between those systems: one exclusive Jump Gate pair, one exclusive Jump Hole pair.
- Branching short-range gate links inside each system.
- Stars, planets, a moon, stations, and dated InfoCard changes.

The demo is authoritative **for testing data shape only**. **Do not promote demo names, values, dates, or identifiers into official MCR canon.** The known 43 canonical systems and seven named Cantums are intentionally **out of scope for viewer prototyping**.

Create additional **noncanonical fixture variants** as necessary to test an undeveloped system (`publicDetailPath: null`), unplaced coordinates, partial detail, a future discovery, and an intentional fetch/validation failure. Do not change real worldbuilding files just to demonstrate edge cases.

## 13. Acceptance criteria for the first viewer

The first Milestone 3 implementation is complete when all of the following can be demonstrated **without hardcoded lore-specific branches**:

1. The public viewer loads the two-system demo from JSON, in top-down sector mode at 1200 A.E.
2. Both positioned systems appear, with independent selectable **Jump Gate and Jump Hole lines** between them; the two lines are visually distinguishable even though endpoints belong to the same system pair.
3. Click a system for its historical InfoCard; double-click/Enter opens its system map; breadcrumbs and Return to Sector work.
4. A system map renders the correct CNU-positioned star, planets, moon, station, short-range gates, Jump Gate and Jump Hole from JSON.
5. Selecting a branching short-range gate highlights **both** local links. Selecting an interstellar endpoint identifies its one partner and requires explicit navigation to the destination.
6. Switching top-down ↔ perspective changes only the camera/rendering representation; positive/negative Y values become visibly distinct in 3D.
7. Continuous timeline, typed year, event markers and previous/next recorded-event navigation update names, existence, InfoCards, routes, and available maps correctly.
8. Collapse/expand both sidebars, search/filter historically eligible entries, and toggle map overlays without mutating data.
9. Noncanonical fallback, partial-detail, unplaced-system and historically unknown records display the correct distinct states; actual load errors show retry feedback.
10. Once the approved schema extensions are introduced, noncanonical fixtures for **ellipsoid, box, and polygon-volume zones** and a **dated, hand-authored Cantum territory polygon** render and toggle correctly in 2D/3D as applicable; the viewer does not fabricate polygons when none are recorded.
11. Editing a **supported** object position, name record, or quantity in demo JSON and reloading changes the viewer without code edits.
12. The page runs as a static, read-only site under a GitHub Pages–style repository subpath; private files and editor code are **not included** in its release artifact.
13. Historical resolver, schema validation, route exclusivity, and essential navigation behaviors have automated regression tests; the existing v0.1 test behavior remains intact unless an explicitly approved migration changes it.

### Practical non-goals for the first viewer

- Canonical star-system placement or colonization data extraction from RTF.
- Production-quality NEXUS artwork, animation or voice avatar.
- Author-side visual drag-and-drop editing and file saving (**Milestone 4**).
- Simulated orbital mechanics, physically accurate distance conversion, pathfinding, ship travel simulation, or real-time celestial motion.
- Automatic territory generation, automatic political inference, or full volumetric political borders.

## 14. Required compatibility and schema follow-ups

These are **pending technical changes**, not claims about features currently supported by `schemas/atlas.schema.json` v1.0.0:

| Proposed versioned addition | Why needed | Current status |
|---|---|---|
| `zon_XXXX` spatial-zone entities and ellipsoid/box/polygon-volume definitions | Approved zone overlays and 3D shapes | **Not in schema v1.0.0** |
| Authored Cantum territory geometry with dated validity | Approved manual historical border overlays | **Not in schema v1.0.0** |
| Explicit `knownByAE` or equivalent confidence-aware visibility rule | Historically known by a snapshot date but exact discovery year unknown | **Proposal; naming/behavior must be approved** |
| Historical event-marker sources and event date precision | Continuous slider with next/previous real events | **Specify public event registry or derive safely from dated records** |
| Theme/icon metadata as reusable presentation mapping | Original NEXUS visuals, replaceable assets | **Implementation convention; don't embed hardcoded lore** |
| Historical resolver integration for `infoCard` and v1.0.0 paths | Time-sensitive cards, objects, and connections | **Existing v0.1 resolver does not fully support this** |

**Versioning requirement:** When a change modifies stored JSON shape, update the JSON Schema version, tests, sample records, validator, and `docs/DATA_MODEL.md` together. Do **not** relabel the present v1.0.0 schema as though it already supports these additions. Coordinate with the owner before selecting the exact format of newly introduced records.

## 15. Handoff constraints for Codex

Before implementation, Codex must inspect the repository, existing tests, schemas, and documentation. Report discrepancies or file conflicts. Do not reinterpret this approved viewer behavior as permission to implement the local editor or invent canon. Work in small milestones with test results and changed-file summaries; a reasonable order is:

1. Establish Vite/Three.js viewer shell and public-demo data source selection.
2. Add a schema-compatible loader and isolated historical resolver adapter with tests.
3. Render top-down sector scene, two systems, historical interstellar links, and selection.
4. Add system scene, object rendering, local routes, 3D camera toggle, and interstellar navigation.
5. Add catalogue, InfoCard, search, overlays, timeline, and NEXUS fallback/error states.
6. Add approved versioned schema extensions for zones and territory overlays, then render them with simple geometries.
7. Test responsive behavior, build safety, GitHub Pages deployment, and acceptance cases.

**Stop at authorized scope and ask before breaking the approved JSON contract or rewriting canonical records.**

---

**Approval note:** This file consolidates the user's Milestone 3 decisions: top-down default with optional 3D, manually authored political overlays, hybrid markers/geometry, three zone shapes, continuous A.E. history, collapsible sidebars and persistent timeline, date-aware search and overlays, and the NEXUS archival fallback. It is the **behavioral specification**, while the repository's JSON Schema and data-model documentation govern exact file structures.
