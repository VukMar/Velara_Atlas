# Project status

**Current status - 2026-11-20:** Canonical Atlas integration, the Holographic Transmission InfoCard, NEXUS navigation/control bars and world-anchored Cantum typography with final hierarchy polish are merged into `main` at `bc4c529664fce1df4dab4117bb3f0794a41f5531`. The creator confirms that the merged application works as intended. Repository version is **1.0.0**. Current work is documentation reconciliation before manual public deployment. The latest verified public deployment remains the October 27 noncanonical **0.5.0** release. Documentation approval, successful CI and merging do not publish the website. Further canonical content, protected legacy migration, Atlas Creator, deployment, tags and GitHub Releases require separate authorization.

This page owns completion and authorization status. Subject specifications and versioned schemas own technical rules; dated reports preserve their original checkpoints. [INDEX](INDEX.md) maps authority; [AGENTS](../AGENTS.md) defines working constraints.

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
| Canonical Atlas, Holographic InfoCard and navigation/control bars | Complete, creator-accepted and merged in [PR #4](https://github.com/VukMar/Velara_Atlas/pull/4), 2026-11-20 |
| World-anchored Cantum typography and final hierarchy polish | Complete, creator-accepted; [PR #5](https://github.com/VukMar/Velara_Atlas/pull/5) merged into PR #4 and included in main, 2026-11-20 |
| Windows CI reliability maintenance | Merged in [PR #2](https://github.com/VukMar/Velara_Atlas/pull/2), included in `main` at `f0d8d14` |

**Cantum Visual Stage 5 remains deferred and was not required for the completed Checkpoint 5 launch.** Deferral does not authorize visual tuning or a canonical radius decision.

## NEXUS Public Entrance Integration — Complete and Creator-Approved (2026-10-26)

> Historical two-page milestone: canonical integration below supersedes its future-promotion statements and application paths.

The creator tested and explicitly approved the completed two-page implementation, including manual visual and functional acceptance. The audited Vite build includes `src/viewer/index.html` (NEXUS public landing page) and `src/viewer/demo.html` (the existing noncanonical interactive Atlas). Both share the approved first-entry experience, completion and global audio preference. The landing page initializes no Atlas renderer or Demo dataset. Commands and the `/Velara_Atlas/` base remain unchanged. See [the subsequent architecture amendment](PUBLIC_ENTRANCE.md) and [verification results and limits](PUBLIC_ENTRANCE_VERIFICATION.md). Checkpoint 4.2G-I records retain their original approved audiovisual authority.

For a future separately approved canonical release, index.html becomes the actual canonical MCR Velara Sector Atlas; demo.html is retired or archived only following separate creator approval. Current landing copy is temporary presentation, not Canon. This milestone does not complete or authorize Checkpoint 5, Canon migration, Atlas Creator or public deployment. Push and deployment remain separately gated.

## Checkpoint 5 — Phase 1: GitHub Pages Deployment Preparation — Complete and Creator-Approved (2026-10-27)

> Historical preparation-stage record: the pre-deployment statements in this section describe Phase 1, before the successful public release recorded below.

The creator reviewed and approved the manual-only main-branch Pages workflow, its operating instructions and the audited two-page dist/ artifact path. Automatic Ubuntu/Windows verification, required checks before upload/publication, least-privilege deployment and ignored build output are preserved. The authorized closeout also adopts the deliberate pre-release version rebaseline to 0.5.0 and the authoritative [versioning policy](VERSIONING_POLICY.md); this does not represent percentage completion. Documentation, verification, one commit and a normal push to main are authorized for this closeout. See the [operating guide, original verification and closeout amendment](GITHUB_PAGES_DEPLOYMENT.md).

The workflow is prepared and reviewed; its first live Pages deployment has not been executed. Hosting, public URLs, artifact transfer/OIDC and the actual deployment action have no live verification from this work. GitHub-side configuration, public deployment and other Checkpoint 5 work remain separately gated. No tag, GitHub Release, Canon migration or Atlas Creator is authorized.

## Checkpoint 5 — First Public Deployment — Complete and Creator-Approved (2026-10-27)

The initial public-launch objective is complete: GitHub Pages is configured using GitHub Actions, and the audited two-page NEXUS homepage/noncanonical Demo is published as the first public pre-release, v0.5.0. The manual-only deployment workflow and automatic Ubuntu/Windows verification are preserved. The creator performed and approved live website verification, including the public entrance, Demo, first-entry and shared audio behavior.

GitHub independently reports successful build and deploy jobs in [manual deployment run 40587944992](https://github.com/VukMar/Velara_Atlas/actions/runs/40587944992), publishing commit `77d2ab0ea484770eb6e40f6d0ac5aaa581d74209`. Package metadata at that exact commit records 0.5.0; the deployment log reports the [live homepage](https://vukmar.github.io/Velara_Atlas/). The [Demo](https://vukmar.github.io/Velara_Atlas/demo.html), evidence sources, creator-confirmed scope and remaining coverage limits are documented in the [deployment record](GITHUB_PAGES_DEPLOYMENT.md#first-successful-public-deployment---2026-10-27). This documentation-closeout commit is distinct from the published commit and is not deployed by an ordinary push.

## Canonical application integration - complete, merged and creator-accepted

The 2026-11-19 task authorizes promotion of the approved PR #4 candidate, root application integration, Demo archival, paragraph rendering, tests/documentation and commit/push to the existing PR. `index.html` now runs the canonical Atlas from `public/datasets/canonical/`: 70 systems, seven historical Cantums, 199 system descriptions and 35 Cantum descriptions. The five JSON files are byte-identical to approved revision `fa53a770eb848f45031dce4da7787dc2a26c7bb5`; unrelated dates, coordinates and histories are preserved.

The existing NEXUS opening and single audio controller remain. The two-page teaser/Demo arrangement is superseded in the repository. The Demo is retained under `tests/fixtures/archived-demo/` for isolated regressions, never as a production fallback. Calibration and protected legacy v0.1 data remain separate. No individual canonical system interiors or physical routes are added.

Production remains static and read-only with `publicDir: false`, exact inventory-based imports, pinned media and complete output reachability. The single canonical HTML entry is `index.html`. [Integration report and verification](CANONICAL_APPLICATION_INTEGRATION.md).

The subsequent creator task explicitly authorizes the Holographic Transmission InfoCard and staging repository version **1.0.0 as the canonical launch candidate**, with validation, commit/push and PR #4 updates. The centered card is bounded to 600 × 720 CSS pixels, retains a compact mobile NEXUS portrait, opens on Description and preserves Technical/Description selection across historical-year updates. See [current visual contract](NEXUS_VISUAL_IDENTITY.md#ordinary-infocard) and [candidate verification](CANONICAL_APPLICATION_INTEGRATION.md#holographic-infocard-and-100-candidate--2026-11-19).

The creator accepted the integrated Atlas/InfoCard, navigation/control bars and final Cantum result. PR #5 merged into PR #4's branch at `707b0cf2cbd3b6a4eb9311fd47250e7bb3a75bbf` (2026-11-20 22:12:20 UTC); PR #4 then merged into main at `bc4c529664fce1df4dab4117bb3f0794a41f5531` (22:12:33 UTC). The two commits have identical implementation trees. Documentation reconciliation is the current pre-deployment activity. Public 1.0.0 launch is not complete; publication and future content remain separately authorized.

## Verified baseline and limits

### Accepted Cantum hierarchy and navigation

The accepted world-space result includes component fit/elevation, fixed horizontal orientation, camera behavior and the coordinated 1.15x-1.50x crossfade. Final implementation `3d77c43be42cb785aceaa7d1bfde9f8aade3c7e8` draws names at 4.5 after markers at 4 with .82 overview opacity and retained depth tests. Canonical data, field geometry and protected behavior are unchanged. [Dated fitting, polish and validation evidence](CANTUM_NAMEPLATE_REFINEMENT.md) retains earlier review states as history.

The accepted interface uses four top utilities, modal Catalogue, three exclusive reserved-space horizontal bottom toolbars, protected 10-second inactivity dismissal and modal Map Controls Help. [Current behavior](VIEWER_SPECIFICATION.md#current-navigation-and-control-bars--2026-11-19) and [dated verification](CANONICAL_APPLICATION_INTEGRATION.md#navigation-and-responsive-control-bars--2026-11-19).

Review provenance: the initial fitting task started from `bd8d2dafab722b0a98b2beb9c1f6c39589e27717` against parent PR #4 HEAD `e1ae55c1ea65477b003278bc49f2090fa662172f`. The creator approved world size, fit, placement/orientation, component elevation, camera behavior and zoom crossfade at `62c4927a69aaf370fe07d5d615007f2553bfbc3f` before the final compositing polish. These earlier approvals and SHAs remain historical evidence, not pending gates.

### Verified main and publication boundary

The audited main baseline is `bc4c529664fce1df4dab4117bb3f0794a41f5531`. [Post-merge verification run 44827014130](https://github.com/VukMar/Velara_Atlas/actions/runs/44827014130) passed Ubuntu and Windows Node 24 jobs, including tests, read-only connection freshness, validation, builds and release audits. CI never regenerates navigation and does not deploy. The previously recorded `f0d8d140f6b8c61dc5c6585edf34c49aa485201f` / [run 40368118735](https://github.com/VukMar/Velara_Atlas/actions/runs/40368118735) baseline belongs to the earlier Windows CI maintenance audit.

Version decision: **no increment** for this documentation-only reconciliation; repository metadata stays 1.0.0. Latest verified publication remains [October 27's 0.5.0 deployment](GITHUB_PAGES_DEPLOYMENT.md#first-successful-public-deployment---2026-10-27). This documentation branch is authorized for validation, commit/push and an open PR only; creator review/merge and any manual deployment follow separately.

Historical browser counts, dates, measurements and limitations remain in [the evidence archive](archive/README.md) and [performance/readiness records](PERFORMANCE_AND_RELEASE_READINESS.md). Creator acceptance does not imply newly executed physical-device, Firefox/Safari, screen-reader or GPU-memory certification. Those limits remain explicitly recorded.

For current setup/check commands use [README](../README.md); for detailed operations use [LOCAL_DEVELOPMENT](LOCAL_DEVELOPMENT.md).
