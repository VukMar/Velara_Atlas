# Repository structure and ownership

> **2026-10-26 public entrance amendment:** [Two-page website and shared first entry](PUBLIC_ENTRANCE.md). NEXUS Public Entrance Integration is complete and creator-approved, including manual visual/functional acceptance. Public deployment remains separately gated. The Checkpoint 4.2G-I records below retain their historical scope.

This page describes current directory ownership and publication boundaries. [PROJECT_STATUS](PROJECT_STATUS.md) owns completion/authorization; [ARCHITECTURE](ARCHITECTURE.md) describes module interfaces, and [INDEX](INDEX.md) maps documentation authority.

## Current tree

```text
Velara_Atlas/
  README.md                       Introduction, setup, checks and entry points
  AGENTS.md                       Coding-agent constraints
  package.json / package-lock.json Commands and locked dependencies
  .gitattributes                  Stable JSON/SVG bytes; binary PNG/MP3
  .github/workflows/verify.yml     Read-only Ubuntu/Windows Node 24 CI
  vite.config.mjs                  Two-page root/base and strict input/build admission
  docs/
    INDEX.md / PROJECT_STATUS.md   Navigation / current completion and gates
    LOCAL_DEVELOPMENT.md           Local environments, scenarios and checks
    *.md                          Active subject contracts/guides; retained roadmaps
    archive/
      README.md                   Historical evidence index
      reports/                    Sixteen checkpoint/maintenance reports
      completed-tasks/            Completed documentation/migration tasks
      design/                     Superseded data-model proposal
      installation/               Obsolete install procedure; do not execute
      json-proposals/             Eight unchanged historical JSON proposals
      audits/                     Documentation inventory and retention decisions
  schemas/                        Active v1.3; v1.2 master/wrappers; frozen v1.1
  scripts/                        Offline validation, authoring, navigation, ID/build tools
  src/
    core/                         Pure modern history/cartography/geometry
    timeline/resolve.mjs           Independent legacy v0.1 resolver
    viewer/                       index.html/landing.mjs: NEXUS homepage; demo.html/main.mjs: read-only Atlas
  public/
    datasets/demo/                Registered v1.3 NONCANONICAL Demo JSON
      sector.json                 Sole system registration source
      cantums.json / factions.json Political records / faction registration
      presentation.json           Noncanonical presentation values
      connections.json            Generated tracked runtime index
      systems/                    Four released system-detail files
      factions/                   Two registered TEST faction files
    content/nexus/                Two approved universal UI JSON scripts
    assets/
      icons/                      Fourteen navigation SVGs and one TEST Cantum sigil
      ui/                         Exact original NEXUS reticle SVG
      nexus/                      Three original PNGs and eight original MP3s
    data/                         Protected legacy canonical v0.1 records
  examples/v1_2/                   Ten entity-family references and authoring guide
  tests/
    *.test.mjs                    Versioned tests and temporary-dataset integration
    browser-*.mjs                 Browser/MCP callbacks, separate from npm test
    calibration/                  Finite synthetic Development/scenario registry
    performance/                  Seeded test-only workloads and sampling probes
    fixtures/                     Separate legacy/v1.1/v1.2/v1.3 regression inputs
  dist/                           Ignored audited homepage + Demo output
  .playwright-mcp/                 Ignored local reports/screenshots/test output
  node_modules/                   Ignored dependencies
```

This is an ownership summary, not a complete file listing. There is no graphical editor or deployment workflow. Private lore belongs outside public Git; do not inspect private sibling folders without explicit scope.

## Authoring and generated ownership

The Demo's `sector.systems[]` and faction registry declare the only admitted detail paths. The validated inventory drives offline reads, eager browser imports, HTTP admission and build checks; files are not discovered by scanning directories. Restart Demo after registration changes. See [inventory ownership](ARCHITECTURE.md#validated-dataset-inventory) and [manual authoring](MANUAL_AUTHORING.md).

System-object declarations own navigation. Only the offline `connections` command writes `connections.json` and eligible `boundary_derived` gate positions. New gates begin with null position. Checks/build/CI never repair data; pending journals, backups and stages are preserved for recovery. See [NAVIGATION_AUTHORING](NAVIGATION_AUTHORING.md).

The six v1.2 wrapper schemas reference the unchanged v1.2 master. Active v1.3 has separate definitions; frozen v1.1 retains its contract. There is no standalone frozen v1.0 master: the historically named `tests/schema-v1.test.mjs` exercises v1.1 relationships. Authoring-stage null derived positions do not relax release validation.

Frozen fixtures are independent snapshots. Matching IDs across datasets are not duplicate definitions within one dataset. Do not renumber IDs or deduplicate fixtures during cleanup.

## Publication surfaces

| Path | Role | Browser production input |
| --- | --- | --- |
| `public/datasets/demo/` | Eleven registered v1.3 noncanonical JSON files | Exact validated inventory, bundled statically |
| `public/content/nexus/` | Universal fallback/opening UI scripts | Exactly two validated modules |
| `public/assets/` | Approved original media | Exactly sixteen SVGs, three PNGs and eight MP3s; pinned source/output rules |
| `public/data/` | Protected legacy Canon | Excluded |
| `examples/`, `tests/`, `schemas/`, `scripts/`, `docs/` | Development, offline tools and evidence | Excluded as runtime inputs |
| `src/viewer/`, admitted modern core | Read-only application | Explicit admitted modules |
| `dist/` | Local build output | Audited assets beneath `/Velara_Atlas/` |
| Private sources, secrets and caches | Unreleased author material | Never |

Keep `publicDir: false`; do not copy all of `public/`. Source-repository presence does not grant publication permission. The [asset policy](VISUAL_ASSET_POLICY.md) owns exact media/content admission; [CONTENT_WORKFLOW](CONTENT_WORKFLOW.md) owns disclosure safeguards.

Public Git is itself a disclosure surface. A path outside `public/`, an ignored folder, a hidden UI state or a null detail path cannot conceal previously committed secrets.

## Retained history

Standalone reports now live in [archive/reports](archive/README.md#implementation-reports). Their recorded paths, dates, hashes, test counts and working-copy circumstances describe their checkpoints. Current active guide paths remain stable, especially the authoring/recovery and historical API guides referenced by code.

Completed architecture and original-development roadmaps remain at their existing paths for link continuity. They do not authorize future work. [The documentation audit](archive/audits/DOCUMENTATION_AUDIT_2026_10_26.md) classifies every guide/report, records the moves and lists review candidates that were not deleted.
