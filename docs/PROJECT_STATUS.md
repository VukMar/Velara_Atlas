# Project status

**Current authority: creator-authorized scope updated 2026-10-27; completed approvals retain their dates.** This page owns project completion and authorization status. Subject specifications and versioned schemas own technical rules; historical reports record their original checkpoints. Read [INDEX](INDEX.md) for navigation and [AGENTS](../AGENTS.md) for working constraints.

## Completed and approved

| Workstream | Current decision |
| --- | --- |
| Original Development Checkpoint 4 | **Complete and creator-approved, including final integrated acceptance** |
| Checkpoint 4.1 Phases 1-3 and 4.2A-I | Complete and creator-approved |
| Architecture Optimization Roadmap, Phases 1-6 | Complete and creator-approved |
| NEXUS Public Entrance Integration | **Complete and creator-approved, 2026-10-26; manual visual and functional acceptance completed** |
| Checkpoint 5 Phase 1 - GitHub Pages deployment preparation | Complete and creator-approved, 2026-10-27; historical preparation/versioning milestone |
| Checkpoint 5 - First Public Deployment | **Complete and creator-approved, 2026-10-27; first noncanonical public pre-release live** |
| Cantum Visual Stages 1-4 and intermediate calibration | Retained implemented baseline |
| Windows CI reliability maintenance | Merged in [PR #2](https://github.com/VukMar/Velara_Atlas/pull/2), included in `main` at `f0d8d14` |

**Cantum Visual Stage 5 remains deferred and was not required for the completed Checkpoint 5 launch.** Deferral does not authorize visual tuning or a canonical radius decision.

## NEXUS Public Entrance Integration — Complete and Creator-Approved (2026-10-26)

The creator tested and explicitly approved the completed two-page implementation, including manual visual and functional acceptance. The audited Vite build includes `src/viewer/index.html` (NEXUS public landing page) and `src/viewer/demo.html` (the existing noncanonical interactive Atlas). Both share the approved first-entry experience, completion and global audio preference. The landing page initializes no Atlas renderer or Demo dataset. Commands and the `/Velara_Atlas/` base remain unchanged. See [the subsequent architecture amendment](PUBLIC_ENTRANCE.md) and [verification results and limits](PUBLIC_ENTRANCE_VERIFICATION.md). Checkpoint 4.2G-I records retain their original approved audiovisual authority.

For a future separately approved canonical release, index.html becomes the actual canonical MCR Velara Sector Atlas; demo.html is retired or archived only following separate creator approval. Current landing copy is temporary presentation, not Canon. This milestone does not complete or authorize Checkpoint 5, Canon migration, Atlas Creator or public deployment. Push and deployment remain separately gated.

## Checkpoint 5 — Phase 1: GitHub Pages Deployment Preparation — Complete and Creator-Approved (2026-10-27)

> Historical preparation-stage record: the pre-deployment statements in this section describe Phase 1, before the successful public release recorded below.

The creator reviewed and approved the manual-only main-branch Pages workflow, its operating instructions and the audited two-page dist/ artifact path. Automatic Ubuntu/Windows verification, required checks before upload/publication, least-privilege deployment and ignored build output are preserved. The authorized closeout also adopts the deliberate pre-release version rebaseline to 0.5.0 and the authoritative [versioning policy](VERSIONING_POLICY.md); this does not represent percentage completion. Documentation, verification, one commit and a normal push to main are authorized for this closeout. See the [operating guide, original verification and closeout amendment](GITHUB_PAGES_DEPLOYMENT.md).

The workflow is prepared and reviewed; its first live Pages deployment has not been executed. Hosting, public URLs, artifact transfer/OIDC and the actual deployment action have no live verification from this work. GitHub-side configuration, public deployment and other Checkpoint 5 work remain separately gated. No tag, GitHub Release, Canon migration or Atlas Creator is authorized.

## Checkpoint 5 — First Public Deployment — Complete and Creator-Approved (2026-10-27)

The initial public-launch objective is complete: GitHub Pages is configured using GitHub Actions, and the audited two-page NEXUS homepage/noncanonical Demo is published as the first public pre-release, v0.5.0. The manual-only deployment workflow and automatic Ubuntu/Windows verification are preserved. The creator performed and approved live website verification, including the public entrance, Demo, first-entry and shared audio behavior.

GitHub independently reports successful build and deploy jobs in [manual deployment run 40587944992](https://github.com/VukMar/Velara_Atlas/actions/runs/40587944992), publishing commit `77d2ab0ea484770eb6e40f6d0ac5aaa581d74209`. Package metadata at that exact commit records 0.5.0; the deployment log reports the [live homepage](https://vukmar.github.io/Velara_Atlas/). The [Demo](https://vukmar.github.io/Velara_Atlas/demo.html), evidence sources, creator-confirmed scope and remaining coverage limits are documented in the [deployment record](GITHUB_PAGES_DEPLOYMENT.md#first-successful-public-deployment---2026-10-27). This documentation-closeout commit is distinct from the published commit and is not deployed by an ordinary push.

## Next direction - creator-led canonical worldbuilding

The next workstream is development and approval of the actual MCR Velara Sector's lore, followed by canonical dataset planning, separately authorized integration and a future creator-approved canonical public release. See [Stages A-D in the roadmap](DEVELOPMENT_ROADMAP.md#future-canonical-direction---not-current-authorization). These stages grant no implementation or disclosure authority. Canon migration, Atlas Creator, replacement of the public Demo and further deployments remain separately gated. Version 1.0.0 is reserved for the first approved canonical public launch; the local authoring CLI exists, while a graphical editor does not.

## Implemented product and environment boundaries

The read-only NEXUS viewer loads only the v1.3 NONCANONICAL Demo: four released system charts, one archival-only system and two TEST factions. Implemented capabilities include historical navigation/InfoCards, routes and catalogue/search, physical celestial models/proxies, 2D/3D cameras, zones, approximate governing-Cantum influence, original NEXUS artwork, targeting, motion and approved audio.

Development/calibration uses separate finite registered synthetic scenarios with replayable presets. Protected legacy v0.1 Canon, frozen v1.1/v1.2 fixtures and v1.2 examples remain separate. There is no public dataset selector or automatic Canon migration.

The Demo uses a provisional shared 24-ly influence radius; frozen v1.2 and calibration radii remain unchanged. No canonical radius or new worldbuilding facts are established by this page.

Production is an audited static two-page website (NEXUS homepage and separate Demo) with `publicDir: false`, exact registered inputs, pinned original assets and private/Canon exclusions. There is no backend or write endpoint. The audited two-page site is live on GitHub Pages. Future publication still requires a successful authorized manual dispatch; a repository push or passing verification does not change the published website.

## Verified baseline and limits

At this audit's start, local `main` matched `origin/main` at `f0d8d140f6b8c61dc5c6585edf34c49aa485201f`. Its [post-merge CI run](https://github.com/VukMar/Velara_Atlas/actions/runs/40368118735) passed both Ubuntu and Windows Node 24 jobs, including tests, read-only connection freshness, validation, builds and release audits. These results supersede older reports that say hosted CI is pending. CI never regenerates navigation.

Historical browser counts, dates, measurements and limitations remain in [the evidence archive](archive/README.md) and [performance/readiness records](PERFORMANCE_AND_RELEASE_READINESS.md). Creator acceptance does not imply newly executed physical-device, Firefox/Safari, screen-reader or GPU-memory certification. Those limits remain explicitly recorded.

For current setup/check commands use [README](../README.md); for detailed operations use [LOCAL_DEVELOPMENT](LOCAL_DEVELOPMENT.md).
