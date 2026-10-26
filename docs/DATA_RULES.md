# Historical data rules — draft v0.1

1. **No year folders.** One JSON record per enduring entity; history uses `fromAE` inclusive and `untilAE` exclusive (`null` means still applicable). The engine reads one selected year and selects the corresponding intervals.
2. **Separate IDs from names.** IDs (`cantum_b`, `sys_demo_001`) never change when a proper name changes. Use `names`/`nameHistory` arrays rather than renaming file paths.
3. **Separate political labels from geography.** `eraTitles` determines NEXUS's era title; `unifiedState.names` tracks the government's name; `cantums[].names` names administrative/historical Cantums; `systems[].nameHistory` names star systems. Drevnasel as a state, Cantum, or system is not automatically the same entity.
4. **Do not infer exact history from approximate dates.** `datePrecision: circa` is a **map-display boundary** pending refined dating. `first_confirmed_by` at 600 A.E. does not mean a Cantum was founded in that year. `atlas_snapshot` at 1200 A.E. does not mean all sovereignty was gained on 1 January 1200 A.E.
5. **Timeline before disclosure.** A public record's `discoveredAE` determines earliest chronological visibility. Disclosure means the data file is actually published, not `hidden: true` in public JSON. No public knowledge of secret objects may be encoded or hinted at in a downloadable record.
6. **Object dates are distinct.** `discoveredAE` = first public in-universe record. `colonizedAE` = initial settlement; `constructedAE` for stations, gates, etc. Naming transitions have their own start years; a survey name may be replaced after colonization.
7. **No coordinates invented.** `positionLY:null` means a system cannot yet be drawn on the sector map. Once canonical placement is chosen, set `{x,y,z}` in light-years. Each system's local coordinates use its own declared units.
8. **Public detail path controls fallback.** `publicDetailPath:null` means NEXUS fallback even after the system is chronologically known. When partial maps are published, the file contains only released objects; not a full list with hidden flags.
9. **Historical belonging and statehood differ.** Cantums began as administrative subdivisions of one centralized constitutional republic, *not* federated sovereigns. The 1200 A.E. political map has six sovereign Cantums A/B/C/E/F/G and the historic D/Rekdolin region inside C/Okeanberg. Border polygons and individual system control histories will be added after canon placement.
10. **Political periods are not borders.** A sovereignty label does not assert control of every historical Cantum system during wars. Every mapped system should eventually have its own dated `controlHistory` (and optional separate `administrativeRegionHistory`).
11. **No unpublished folder in build.** `private/` is a local-only directory ignored by Git; keep it outside `public/`. Git ignore doesn't remove files already tracked by Git. Review production output and repository history before publishing.
12. **Survey names are identifiers, not geography canon.** The naming protocol applies to approved proper named star systems if adopted as a rule; catalog designations may remain technical IDs.

## Outstanding canon decisions
- Exact adoption years/first sector-visible years of Okeanberg, Rekdolin, Zaklun, Gornebes and Vodravan (all established by around 600 A.E.). The `600` visibility boundary is *conservative*, not asserted founding date.
- Exact separation dates for Gornebes and Vodravan (sometime after 1138 and by 1167 A.E., per the working chronology).
- Resolution of intermediate Rekdolin control following independence, conquests and eventual incorporation into Okeanberg by 1200.
- Exact legal dissolution date of the unified state; 1200 is a display/snapshot cutoff for a sector of six sovereign powers.
- Founding system's official star-system name and canonical coordinates; no made-up spatial positioning included.
- Proper distinction among discovery, classification, first mapped year, and classified knowledge for future storylines.

## Protected legacy display context

The founding civilization is Drevnasel; the Visshum name, Drevnasel as the founding/capital Cantum, and unified name The Continuance emerge around the draft 360 A.E. display boundary. These cautions are retained from the former detailed AGENTS instructions. Cantums initially were administrative divisions of a centralized republic, not federal sovereign states. The 1200 A.E. snapshot shows six sovereign Cantums, with Rekdolin a historic region within Okeanberg. Existing `datePrecision` notes qualify these boundaries; never claim precise legal event dates. Consult the committed [legacy political records](../public/data/political.json); no canonical facts are changed by this documentation move.
