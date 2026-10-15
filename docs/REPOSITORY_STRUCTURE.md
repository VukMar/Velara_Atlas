# Velara Atlas — Repository structure and file ownership

**Status:** Proposed structure approved for organizing the foundation; create future folders only when needed. This document reflects the currently observed local repository plus planned additions.

## Current files — do not casually move or delete

```text
Velara_Atlas/
├── docs/
│   ├── DATA_RULES.md                 # Existing v0.1 historical data rules
│   └── DATA_MODEL_DRAFT.md           # Adopted v0.2 InfoCard examples; migration pending
├── examples/                         # v0.1 fixtures + v0.2 example entities
├── public/
│   └── data/
│       ├── political.json            # Working timeline/political records
│       ├── sector.json               # Sector index; contains an editorial note to review
│       └── systems/                  # Approved released detail files only
├── src/
│   └── timeline/resolve.mjs          # Working v0.1 timeline helper
├── tests/
│   ├── check.mjs
│   └── demo.mjs
├── .gitignore
├── package.json
└── README.md
```

This documentation package adds `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/REPOSITORY_STRUCTURE.md`, `docs/DEVELOPMENT_ROADMAP.md`, and `docs/CONTENT_WORKFLOW.md`; it replaces the original development-only README with a public-facing README. It deliberately does **not** overwrite existing `DATA_RULES.md`, `DATA_MODEL_DRAFT.md`, resolver code, JSON, or tests.

## Planned additions (create as milestones require)

```text
schemas/                       # JSON Schema and shared schema definitions
scripts/                       # Validation, local import and publishing
src/core/                      # Pure engine-independent model/utilities
src/viewer/                    # Public Three.js map and interaction UI
src/editor/                    # Local-only editor code (exclude from viewer build)
src/ui/                        # NEXUS visual components and theme
public/assets/icons/          # Approved public original icon assets
public/assets/textures/       # Approved public original texture assets
.github/workflows/            # Static site build/deployment (when ready)
```

Do not create empty scaffolding merely to match this tree. `src/timeline/` remains the real path for the current resolver; relocation requires import/test updates and a separate task.

## Ownership and publishing policy

| Path | Source of truth / role | Publish to GitHub? | Served by public website? |
| --- | --- | --- | --- |
| `docs/` | Technical public explanations and decisions | Yes, once reviewed | Not necessarily; but *publicly readable in Git* |
| `examples/` | Noncanonical demonstrations; no unpublished lore | Yes | Ideally excluded from deployed assets |
| `public/data/` | Approved public records | Yes | Yes |
| `public/assets/` | Approved original/licensed media | Yes | Yes |
| `src/`, `scripts/`, `schemas/`, `tests/` | Code, tooling and fixtures | Yes, if no spoilers/secrets | Build-dependent; audit output |
| `.local-references/`, `private/`, `secrets/` | Local private extractions, unpublished drafts | **Never** | **Never** |
| Private sibling directory/repository containing RTF lore | Creator's original authority | **Never in public repository** | **Never** |

**Important:** committing a file to a public GitHub repository publishes its contents even if the file is outside `public/` or not included in GitHub Pages. The website and the repository are two distinct disclosure surfaces.

## Source lore and local caches

Keep original RTF worldbuilding files in a **sibling private folder** or separately permissioned private repository. An agent may read them when explicitly allowed; it must not modify them without permission. Generated plain-text/Markdown extracts belong in an ignored local cache (`.local-references/`) or outside the public repo. Ensure `.gitignore` contains ignore entries for the cache and private folders, but remember that already-tracked files and Git history require separate remediation.

## Example data retention

The two original v0.1 fixtures (`examples/noncanon_sector_system.json` and `examples/noncanon_system_detail.json`) are referenced by tests. Keep them where they are until their test references are updated. The additional v0.2 examples are accepted **reference templates**, not complete canon. Do not de-duplicate or rename them as an unrequested cleanup. When schema v1.0 is signed off, decide whether to archive v0.1 fixtures or migrate tests to v1.0 fixtures.

## Development/checkpoint conventions

- Keep the current `npm test` baseline green before and after organization changes.
- Use versioned documentation/schema migrations rather than silently altering existing records.
- For major changes, commit a checkpoint with a descriptive message; never include local reference caches or unreleased lore.
- Mark unresolved decisions as **open**, not as confirmed canon.
- GitHub Pages configuration, licensing, and project website URL remain pending decisions; don't invent them.
