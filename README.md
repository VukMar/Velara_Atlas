# Velara Atlas

A historical, interactive atlas for the fictional MCR / The New World setting, presented through NEXUS. The local viewer uses vanilla JavaScript, Three.js and Vite.

**Checkpoint 4 is complete and creator-approved, including final integrated acceptance.** The Architecture Optimization Roadmap (Phases 1-6) is complete. Cantum Visual Stage 5 is deferred and does not block release planning. Checkpoint 5 release preparation requires separate creator authorization; Canon migration, Atlas Creator and public deployment remain separately gated. See [current project status](docs/PROJECT_STATUS.md).

The [public entrance amendment](docs/PUBLIC_ENTRANCE.md) describes the two-page structure. The homepage is temporary presentation, reserved for the future canonical Atlas; the Demo remains explicitly noncanonical. Canonical population/migration, Demo retirement/archival and public deployment need separate approval. NEXUS Public Entrance Integration is complete and creator-approved (2026-10-26), including manual visual and functional acceptance. Automated checks and their limits are recorded in the [verification report](docs/PUBLIC_ENTRANCE_VERIFICATION.md).

## What works now

The read-only NONCANONICAL Demo contains four released system charts, one archival-only system and two TEST factions. It supports historical names and InfoCards, catalogue/search, local and interstellar routes, 2D/3D cameras, physical celestial models, spatial zones and approximate Cantum influence. NEXUS artwork, targeting, Focus/chart transitions, first-entry preferences, voice and interface audio are implemented. Follow the [Demo walkthrough](docs/DEMO_SHOWCASE.md).

Development/calibration is a separate synthetic preview with named scenarios and replayable presets. Legacy v0.1 records remain protected under `public/data/`; there is no Canon launcher, graphical editor or deployment workflow.

## Setup and run

Use **Node.js 24 LTS**, matching the Ubuntu/Windows CI matrix, and run from the repository root:

```bash
npm ci
npm run demo
```

Open **http://127.0.0.1:5173/Velara_Atlas/** for the NEXUS welcome and teaser. Choose **Indulge your curiosity** to open the interactive simulation at **http://127.0.0.1:5173/Velara_Atlas/demo.html**. First entry and audio preference are shared by both pages; returning visits never autoplay the welcome. Use Map controls, History, Catalogue and Map layers to explore. Select a marker and choose Enter system, or double-click it; Sector View returns to the overview. Stop the server with Ctrl+C.

| Command | Purpose |
| --- | --- |
| `npm run demo` | Validate and serve the NEXUS homepage and separate NONCANONICAL Demo on 5173 |
| `npm run dev` | Synthetic Development/calibration on 5174 at `/Velara_Atlas/__calibration/` |
| `npm run preview:calibration` | Alias for Development; do not run both on the same port |
| `npm run build` | Validate, build `dist/` and audit the output |
| `npm run preview` | Preview that build on 4173 at `/Velara_Atlas/` |
| `npm run history:demo` | Separate legacy console chronology; no browser server |

Detailed controls, scenario formats, browser callbacks and diagnostics are in [local development](docs/LOCAL_DEVELOPMENT.md).

## Checks

```bash
npm run connections:check
npm test
npm run validate
npm run build
npm run history:demo
npm run idfind -- all
npm run release:check
git diff --check
```

CI runs the repository checks on Ubuntu and Windows with Node 24. Navigation checks are read-only: after an authorized navigation edit, run `npm run connections` manually, review the generated diff, then run the checks above. Do not use generation as CI repair. See [navigation authoring and recovery](docs/NAVIGATION_AUTHORING.md).

`npm run release:check` performs a local audited two-page build; it does not publish. Vite keeps `publicDir: false`, exact dataset/asset admission and production disclosure checks. The `/Velara_Atlas/` base supports repository-subpath URLs; it is not evidence of a deployed site.

## Documentation and authoring

Start with the [documentation index](docs/INDEX.md), which separates current specifications, operating guides and historical evidence.

- [Project status and approval gates](docs/PROJECT_STATUS.md)
- [Architecture and module ownership](docs/ARCHITECTURE.md)
- [Repository structure and publication boundaries](docs/REPOSITORY_STRUCTURE.md)
- [Active data model](docs/DATA_MODEL.md), [accepted v1.3 contract](docs/DATA_MODEL_V1_3_PROPOSAL.md) and [v1.2 examples](examples/README.md)
- [Safe local manual authoring](docs/MANUAL_AUTHORING.md) and [ID Finder](docs/LOCAL_DEVELOPMENT.md#id-finder-read-only-authoring-utility)
- [Content/disclosure workflow](docs/CONTENT_WORKFLOW.md) and [Canon migration safeguards](docs/LEGACY_MIGRATION_PLAN.md)
- [Codex working instructions](AGENTS.md)

Do not invent canon or commit private lore, unreleased records or source documents anywhere in public Git. Historical visibility and editorial publication are separate decisions.

## Attribution and licensing

Velara, the Continuance setting, NEXUS and associated MCR worldbuilding belong to their respective creator(s). A public software/content license has not been selected; public visibility does not grant reuse rights. Design inspiration grants no permission to use third-party game artwork.

This is a fictional setting; the atlas does not chart real astronomical positions.
