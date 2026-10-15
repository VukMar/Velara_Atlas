# Velara Atlas — Source lore, JSON and public release workflow

**Status:** Proposed safe content pipeline. No automated publisher has been implemented yet.

## Principle: three states, two timelines

Every record may involve (1) **in-universe historical timing** and (2) **real-world studio release status**. These are independent. At 1200 A.E. a system may be fully known in-universe but not have a public detail map until the author releases it. A partially released system may later gain new planets, stations or descriptions without shifting their fictional discovery dates.

| Situation | Sector map | System click |
| --- | --- | --- |
| Not discovered by selected historical year | Not shown | No selectable record |
| Discovered, index published, detail not released | Shown if a canonical position is available | NEXUS archival fallback |
| Index and partial public details released | Shown | Shows released objects valid for selected year |
| Full public detail released | Shown | Shows all **released** objects valid for selected year |

'Full' means the latest authorized public atlas edition, not necessarily everything that secretly exists in the writer's canon.

## Source extraction and approval loop

1. **Read original RTF reference** from the private source directory, without overwriting it. Where helpful, make a temporary *local-only* text/Markdown extraction.
2. **Propose structured candidate data** in a private location. Identify each item's source document/section and whether it is direct, approximate, inferred, or missing.
3. **Review with creator:** approve or reject proposed identities, dates, descriptions, affiliations, object classifications, and any conversions from prose to structured values. No silent gap-filling.
4. **Resolve references:** reuse existing permanent IDs; create new IDs only after checking registry collisions; ensure spatial units and date fields are unambiguous.
5. **Commit approved canonical data** to a private, backed-up authoring source, if such a structured source exists. Original RTF prose remains authoritative where no accepted structured record exists.
6. **Select publication scope:** explicitly approve which system index entries, objects, InfoCard fields, and descriptions can be public. Unknown and secret are different; don't leak by using a hidden flag.
7. **Generate/review public JSON**, validate it, run tests, inspect rendered results, and review the Git diff before commit/push.
8. **Publish:** only the reviewed data and assets are committed to the public repository and built/deployed as a static site.

At the foundation stage, steps 5–8 can be manual. A publishing tool is planned later; **do not imply it exists today**.

## Extraction standards

- `null` means unknown/unprovided; it is not `0`, `false`, 'unarmed', or 'uninhabited'.
- Count fields (`crew`, `population`, armament quantity) must be sourced. Zero is allowed only when an absence is actually confirmed.
- Record a system's discovered year separately from its colonization year, historical name adoption, and political assignment. Station construction and discovery are separate where documented.
- Respect `fromAE` inclusive, `untilAE` exclusive, and `datePrecision` qualifiers. Preserve contradictions as flagged questions for the creator.
- An InfoCard's historical description must not mention later developments at earlier selected dates.
- Naming conventions: approved proper place names follow the MCR Continuance Naming Protocol; existing approved names stay unchanged. If a source requires a newly coined name, request a separate naming approval; do not improvise replacements during extraction.
- Public descriptions must be specifically approved for the reader. Private notes, editorial remarks, future story revelations, and hidden objects must be absent **from all files committed to public Git**, not only from `public/data/`.

## Release checklist (manual until scripted)

- [ ] New entries use permanent IDs and valid foreign-key references.
- [ ] Selected year changes only historically appropriate values; null/unknown discovery dates are handled explicitly.
- [ ] All included content is approved for public release (including examples, docs, code comments, test fixtures, build assets).
- [ ] JSON is valid; schema/relationship validation runs when implemented.
- [ ] `npm test` passes and significant output has been reviewed.
- [ ] NEXUS fallback works for indexed systems with no published details.
- [ ] Previewed pages contain no concealed plot spoilers in visible UI, source JSON, HTML, browser bundles, or network requests.
- [ ] `git status` and `git diff --staged` show only intentional changes; no private source files or local reference caches.
- [ ] Build `dist/` (when available) has been inspected for inadvertent confidential files and assets.

## If private lore was accidentally committed

Stop publishing. Removing a file in a new commit does not erase it from public Git history. Treat the content as disclosed, check deployed artifacts and caches, and carefully plan history cleanup/credential rotation if relevant. Never assume `.gitignore` or a new commit makes previously published secrets private again.
