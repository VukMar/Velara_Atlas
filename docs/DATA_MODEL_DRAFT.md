# Velara Atlas — InfoCard & entity data model (proposal v0.2)

**Status: REVIEW DRAFT — not an approved canon or drop-in replacement for the v0.1 engine.** Everything named `demo_` and any station statistics or locations in the examples are **noncanon**. The two Cantum examples reproduce the existing v0.1 chronology; 320/360/900/1200 boundaries retain their existing approximate/snapshot qualifications.

## 1. Entities and ownership

1. **Sector** (`sector.json`): one geographical coordinate context; it references the existing historical polity/era data (`political.json`) and indexes star systems; not itself a government. `title` is geographical, while NEXUS's historical header comes from `political.eraTitles`.
2. **Cantum** (`political.json > cantums[]`): permanent ID, `letter`, `names` (v0.1), `statusHistory`, plus reusable `infoCard`. Illustrative examples show individual Cantum entries; do **not** maintain both individual files and duplicated entries in `political.json`.
3. **Star system** (`sector.json > systems[]`): one permanent ID, `discoveredAE`, optional `colonizedAE`, `positionLY`, `nameHistory`, regional history (`cantumHistory`), `publicDetailPath`, and `infoCard`. `publicDetailPath: null` activates the NEXUS fallback. Illustrative star-system entry in examples is inserted under `sector.systems[]`, not separately duplicated.
4. **Celestial body** (`systems/<system-id>.json > objects[]`): `entityType: celestial_body`, plus `objectType: star | planet | moon | ...`, independent position, names, dates, icon, and `infoCard`.
5. **Station** (`systems/<system-id>.json > objects[]`): `entityType: station`, `objectType` for a subtype, `constructedAE`, names, position, icon, and `infoCard`.

## 2. Universal InfoCard shape

Every entity supports exactly the same six optional keys:

```json
{
  "infoCard": {
    "affiliation": null,
    "class": null,
    "crew": null,
    "population": null,
    "armament": null,
    "description": null
  }
}
```

**Each non-null key is an array of non-overlapping historical records.** Every record has `fromAE` (inclusive) and `untilAE` (exclusive, `null` = still active). Use the existing `atYear(history, yearAE)` helper to select a record; treat `null` as no published data. Do not assume a category always has all fields.

- **affiliation** entry: `{ "fromAE": 460, "untilAE": null, "entityId": "cantum_a" }`; `entityId` is a permanent foreign key to an established Cantum, polity or organization, never a display name. A dated `entityId: null` can explicitly signify independent/unaffiliated status, while a whole-field `null` means no affiliation record is provided. **Political control** and **local administrative assignment** are different concepts. Future models may split station operator versus jurisdiction if needed.
- **class** entry: `{ "fromAE": 460, "untilAE": null, "code": "orbital_security_station", "label": "Orbital Security Station" }`; this is an InfoCard classification, **not** the structural `entityType` / `objectType`.
- **crew** entry: `{ "fromAE": 460, "untilAE": null, "count": 120, "note": null }`; generally stations. A crew number is never inferred from class.
- **population** entry: same shape as `crew`; used for a colonized planet and optional aggregate population in Cantums or systems. Count may be `null` when settlement is established but precise population is not. Not the same as zero.
- **armament** entry: `{ "fromAE": 460, "untilAE": null, "summary": "Point-defense batteries", "systems": [{ "type": "point_defense_battery", "label": "Point-Defense Battery", "quantity": 4 }] }`; `systems: []` with summary 'Unarmed' means confirmed none; entire `armament: null` means no public record, **not** confirmed unarmed.
- **description** entry: `{ "fromAE": 460, "untilAE": null, "text": "..." }`. Use a period so later story developments are not described on earlier timeline settings. This text should be public-safe; the local authoring repository may have unpublished narrative in separately excluded files.

All dates are integers in A.E. New dates not supported by canonical prose remain `null` at the property level; do not invent dates to complete arrays. Existing v0.1 `datePrecision` values such as `circa`, `confirmed_by`, `within_window` and `atlas_snapshot` should be retained; a rounded year is not automatically exact.

## 3. Field behavior and layout

- Every InfoCard is rendered from **the state resolved for the selected A.E. year**, not from the newest value. Null values are omitted by default; optional NEXUS styling may show 'Unrecorded' for selected fields.
- A planet may be `uncolonized` and `affiliation/population/crew/armament/class: null`, with only `description` set. `objectType: planet` still tells the renderer which icon to draw.
- A colonized planet fills `population` instead of `crew`. Station uses `crew` instead of `population` as the default. No conversion or inference between them.
- `discoveredAE` controls chronological appearance of a star system or celestial body; `constructedAE` controls when a station exists. In practice the object should not render before either its known/discovery date or its construction date.
- `positionLY` is sector-space XYZ in light-years. `position` is local system-space XYZ in declared map units. Both project X/Z horizontally, Y vertically.
- The system map availability is determined by a released `publicDetailPath`. A system can be visible in a historical sector view while having `publicDetailPath:null`; the viewer displays the NEXUS fallback. An available detail JSON may be partial and **must never contain unreleased objects**.
- `id`, `entityType` and reference IDs do not change with a rename. `nameHistory` or the political file's `names` supplies historically valid display names. A permanent `id` must never be recycled.

## 4. Special warning about the existing v0.1 project

This draft extends the model: the v0.1 `resolve.mjs` knows name/discovery/visibility but **does not yet resolve InfoCards**. We must add an InfoCard resolver and tests before using this draft with a graphical interface. It must also treat `discoveredAE:null` as *unknown*, not as year 0; JavaScript's numeric comparison of null otherwise produces erroneous visibility.

Do not copy the example records into `public/data` as canon. In particular, the demo star system, planets and station are invented for testing. No production file should contain editorial notes, spoilers, or private extraction provenance.

## 5. Extraction instructions for the agent

1. Read the author-approved RTF lore as text, without modifying it. Cite the RTF file and relevant section in a **private review report** for every proposed fact.
2. Match an existing permanent ID before creating a new one. Never create a second ID simply because a place was renamed.
3. Only fill documented data. Use `null` for unknown/not provided. **Never** turn missing crew, population or armament into zero; never invent numbers, classes or political affiliations.
4. Keep `entityType`, `objectType` and `infoCard.class` distinct.
5. Preserve `discoveredAE`, `colonizedAE`, `constructedAE`, name history and political affiliations as separate concepts. Do not assume a colonization year is a name-adoption year.
6. Generate tentative records outside `public/data`; user reviews them before their inclusion in production. If a claim is approximate, preserve its uncertainty.
7. Generate *only* an approved public subset for publication. Remove secret entries and fields entirely, rather than setting `hidden: true` in public JSON.
8. Validate IDs, foreign keys, period overlap, enum values and path references; run automated tests before asking the user to merge changes.
