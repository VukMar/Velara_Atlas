# Project status

**Current authority: creator-confirmed, 2026-10-26.** This page owns project completion and authorization status. Subject specifications and versioned schemas own technical rules; historical reports record their original checkpoints. Read [INDEX](INDEX.md) for navigation and [AGENTS](../AGENTS.md) for working constraints.

## Completed and approved

| Workstream | Current decision |
| --- | --- |
| Original Development Checkpoint 4 | **Complete and creator-approved, including final integrated acceptance** |
| Checkpoint 4.1 Phases 1-3 and 4.2A-I | Complete and creator-approved |
| Architecture Optimization Roadmap, Phases 1-6 | Complete and creator-approved |
| NEXUS Public Entrance Integration | **Complete and creator-approved, 2026-10-26; manual visual and functional acceptance completed** |
| Cantum Visual Stages 1-4 and intermediate calibration | Retained implemented baseline |
| Windows CI reliability maintenance | Merged in [PR #2](https://github.com/VukMar/Velara_Atlas/pull/2), included in `main` at `f0d8d14` |

**Cantum Visual Stage 5 is deferred and is not required now. It does not block Checkpoint 5 release planning.** Deferral does not authorize visual tuning or a canonical radius decision.

## NEXUS Public Entrance Integration — Complete and Creator-Approved (2026-10-26)

The creator tested and explicitly approved the completed two-page implementation, including manual visual and functional acceptance. The audited Vite build includes `src/viewer/index.html` (NEXUS public landing page) and `src/viewer/demo.html` (the existing noncanonical interactive Atlas). Both share the approved first-entry experience, completion and global audio preference. The landing page initializes no Atlas renderer or Demo dataset. Commands and the `/Velara_Atlas/` base remain unchanged. See [the subsequent architecture amendment](PUBLIC_ENTRANCE.md) and [verification results and limits](PUBLIC_ENTRANCE_VERIFICATION.md). Checkpoint 4.2G-I records retain their original approved audiovisual authority.

For a future separately approved canonical release, index.html becomes the actual canonical MCR Velara Sector Atlas; demo.html is retired or archived only following separate creator approval. Current landing copy is temporary presentation, not Canon. This milestone does not complete or authorize Checkpoint 5, Canon migration, Atlas Creator or public deployment. Push and deployment remain separately gated.

## Next separately authorized work

The next possible workstream is **Checkpoint 5 release preparation**. Its scope must be authorized by the creator before work starts. No implementation or release work is authorized merely by this status update.

Canon migration, graphical Atlas Creator and public deployment each require separate creator authorization. GitHub Pages is the target host; a configured repository-subpath base and local production preview do not constitute deployment. The local authoring CLI is implemented; a graphical editor is not.

## Implemented product and environment boundaries

The read-only NEXUS viewer loads only the v1.3 NONCANONICAL Demo: four released system charts, one archival-only system and two TEST factions. Implemented capabilities include historical navigation/InfoCards, routes and catalogue/search, physical celestial models/proxies, 2D/3D cameras, zones, approximate governing-Cantum influence, original NEXUS artwork, targeting, motion and approved audio.

Development/calibration uses separate finite registered synthetic scenarios with replayable presets. Protected legacy v0.1 Canon, frozen v1.1/v1.2 fixtures and v1.2 examples remain separate. There is no public dataset selector or automatic Canon migration.

The Demo uses a provisional shared 24-ly influence radius; frozen v1.2 and calibration radii remain unchanged. No canonical radius or new worldbuilding facts are established by this page.

Production is an audited static two-page website (NEXUS homepage and separate Demo) with `publicDir: false`, exact registered inputs, pinned original assets and private/Canon exclusions. No backend, write endpoint or publishing workflow is implemented.

## Verified baseline and limits

At this audit's start, local `main` matched `origin/main` at `f0d8d140f6b8c61dc5c6585edf34c49aa485201f`. Its [post-merge CI run](https://github.com/VukMar/Velara_Atlas/actions/runs/40368118735) passed both Ubuntu and Windows Node 24 jobs, including tests, read-only connection freshness, validation, builds and release audits. These results supersede older reports that say hosted CI is pending. CI never regenerates navigation.

Historical browser counts, dates, measurements and limitations remain in [the evidence archive](archive/README.md) and [performance/readiness records](PERFORMANCE_AND_RELEASE_READINESS.md). Creator acceptance does not imply newly executed physical-device, Firefox/Safari, screen-reader or GPU-memory certification. Those limits remain explicitly recorded.

For current setup/check commands use [README](../README.md); for detailed operations use [LOCAL_DEVELOPMENT](LOCAL_DEVELOPMENT.md).
