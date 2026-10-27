# Manual GitHub Pages deployment

**Checkpoint 5 — First Public Deployment — Complete and Creator-Approved (2026-10-27).** Velara Atlas v0.5.0 is now an operational noncanonical public pre-release on GitHub Pages. The creator configured Pages, manually deployed the approved site, tested the live website and confirmed acceptance. Further deployments require separate authorization; this task documents the existing release and does not deploy it again. [VERSIONING_POLICY](VERSIONING_POLICY.md) distinguishes repository and published versions; no increment is appropriate for this documentation-only closeout.

## First successful public deployment - 2026-10-27

| Release evidence | Recorded value and source |
| --- | --- |
| Release / classification | Velara Atlas v0.5.0 - Noncanonical public pre-release |
| Release date / hosting | October 27, 2026 / GitHub Pages |
| Homepage | https://vukmar.github.io/Velara_Atlas/ |
| Separate noncanonical Demo | https://vukmar.github.io/Velara_Atlas/demo.html |
| Manual workflow run | [40587944992](https://github.com/VukMar/Velara_Atlas/actions/runs/40587944992), attempt 1, `workflow_dispatch`, branch `main`, completed `success` |
| Exact published commit | [`77d2ab0ea484770eb6e40f6d0ac5aaa581d74209`](https://github.com/VukMar/Velara_Atlas/commit/77d2ab0ea484770eb6e40f6d0ac5aaa581d74209), read from the deployment run's `head_sha`, not inferred from current main |
| Published package version | `0.5.0`, independently read from [package.json at the published SHA](https://github.com/VukMar/Velara_Atlas/blob/77d2ab0ea484770eb6e40f6d0ac5aaa581d74209/package.json) |
| Build job | [122484327296](https://github.com/VukMar/Velara_Atlas/actions/runs/40587944992/job/122484327296), completed `success`; Node 24 setup, npm ci, freshness, tests, release audit, tracked-change guard and audited artifact upload each succeeded |
| Deployment job | [122484724528](https://github.com/VukMar/Velara_Atlas/actions/runs/40587944992/job/122484724528), completed `success`; Pages metadata and artifact deployment steps succeeded |
| Deployment URL from log | `https://vukmar.github.io/Velara_Atlas/`; the deploy log reports success and this evaluated environment URL |
| Run completion | `2026-10-27T21:35:54Z` (GitHub timestamp) |
| Automatic verification for published SHA | [40586031779](https://github.com/VukMar/Velara_Atlas/actions/runs/40586031779), completed `success`; both Ubuntu and Windows jobs succeeded |
| Creator acceptance | Confirmed live homepage/Demo availability, successful GitHub Pages configuration and functioning website, including first-entry/shared audio behavior |

Evidence was independently retrieved through read-only GitHub workflow-run/job metadata, the deployment log and the package file at the run's exact SHA. Successful live site configuration, availability and functional acceptance are creator-confirmed. This closeout did not perform additional browser/HTTP, physical-device, screen-reader, non-Chromium or scaling tests. The existing limitations remain; successful deployment is not universal certification.

The published deployment commit above is distinct from the new documentation-closeout commit. Repository and published versions both remain 0.5.0 here, but their commit SHAs differ after this closeout. An ordinary documentation push may start verification and does not update the public website. No tag or GitHub Release is created.

## What runs

`.github/workflows/verify.yml` remains the automatic read-only CI check for pull requests and pushes to main. It cannot publish. The separate **Deploy Velara Atlas to GitHub Pages** workflow has exactly one trigger:

```yaml
on:
  workflow_dispatch:
```

Ordinary pushes run verification, not Pages deployment. Only a successful separately authorized manual deployment replaces the currently published website.

Both jobs require `refs/heads/main`; selecting another branch skips them without uploading or deploying. The build checks out the dispatch's exact `github.sha`, installs Node 24 and locked dependencies, then runs connection freshness, all tests and `release:check`. That last command builds and audits both pages once. Any failure or tracked-file change blocks upload. Only the audited `dist/` directory becomes the `github-pages` artifact.

The build token has only `contents: read`; the separate deployment job needs a successful build and has only `pages: write` and `id-token: write`. It uses the `github-pages` environment and reports the deployed URL. Configure Pages has `enablement: false`: it reads existing settings and does not enable Pages automatically. All actions use full upstream SHA pins. The `github-pages` concurrency group serializes runs with `cancel-in-progress: false`, preserving a running deployment; GitHub may replace an older pending run with a newer pending run.

`dist/` stays ignored because it is generated, audited output, rebuilt from the selected commit and lockfile on the runner. Never commit it, upload the source repository, create a gh-pages branch or add a personal token. The original `/Velara_Atlas/` base, npm scripts, dataset/asset admission, read-only viewer and two-page architecture are unchanged.

## Creator setup and release procedure

Initial GitHub Pages configuration is complete for the published site. Retain these setup/change and future-release instructions as an operating reference; use them only after separate approval. No settings change or deployment is part of this documentation closeout:

1. For separately approved setup/configuration changes, in **Settings > Pages > Build and deployment > Source**, select **GitHub Actions**. Do not select a branch publishing source. Check that repository Actions policy permits the pinned official actions. Configure the `github-pages` environment's deployment branch rule for main; add required reviewers if available and desired.
2. Approve the exact main commit to publish. Under **Actions > Deploy Velara Atlas to GitHub Pages > Run workflow**, select **main** and trigger it deliberately. A push or pull request alone cannot start this workflow.
3. Inspect both jobs' logs: checkout SHA, tests, release-audit inventory, tracked-diff guard, Pages artifact and deployment outcome. If any required step fails, investigate it before another manual attempt; do not bypass audits. The environment/deployment result exposes the Pages URL.
4. After each authorized deployment, verify the [live NEXUS homepage](https://vukmar.github.io/Velara_Atlas/) and [noncanonical Demo](https://vukmar.github.io/Velara_Atlas/demo.html): welcome/returning-Visitor rules, shared audio preference, Demo navigation/disclosure, original media, mobile layout and browser/network errors. Record acceptance against that deployment's exact SHA, independently of automatic CI.

## Identify or restore a release

Record the successful workflow run URL, full commit SHA, package.json version at that SHA and deployment URL. Inspect the `github-pages` environment's deployment history and linked run to identify the published commit; do not infer the published version from the current tip of main or from CI success.

To redeploy an earlier approved version, obtain separate approval, open its original successful main deployment run and choose **Re-run all jobs** when available. This rebuilds and audits the original SHA/ref, rather than reusing an expired artifact or current main. If that run cannot be rerun, prepare a separately reviewed revert commit on main and dispatch it manually after approval. Do not reset branch history, bypass checks or dispatch a non-main branch.

## Sources and verification boundary

The workflow follows GitHub's [Pages custom workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). GitHub documents that [reruns retain the original SHA/ref](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs). Pins were checked against official releases: [configure-pages v6.0.0](https://github.com/actions/configure-pages/releases/tag/v6.0.0), [upload-pages-artifact v5.0.0](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0), [deploy-pages v5.0.1](https://github.com/actions/deploy-pages/releases/tag/v5.0.1); checkout/setup-node reuse the existing verification workflow's v6 pins.

The first manual public deployment and creator live acceptance are complete as recorded above; read-only metadata verifies the successful deployment path for that release. This documentation-only closeout authorizes a normal commit/push to main, which cannot dispatch Pages. The initial public-launch objective of Checkpoint 5 is complete. Future deployments, Canon migration/integration and Atlas Creator remain separately authorized; no new infrastructure work starts automatically. Historical pre-deployment verification records below retain their original boundaries.


## Initial implementation verification - 2026-10-27

Local verification (before creator approval, 2026-10-27): actionlint 1.7.12 passed YAML/Actions syntax for both workflows; static trigger/branch/dependency/permissions/order checks passed, including 12 branch/result cases. Connections and validation passed; `npm test` passed 371/371 (158.953 seconds, no skips/failures). `npm run release:check` passed with both HTML pages, 46 files / 5,409,690 bytes and all pinned assets. A local tar inspection matched all 46 audited dist files byte-for-byte; no upload/deployment action ran. Diff/scope checks passed and verify.yml is unchanged. Only one normal release build was run; no redundant `npm run build` was added. Local execution used Node 20.5.1 and workspace-local TEMP/TMP; a fresh hosted Node 24 `npm ci` and deployment remain unverified. The existing large-Demo-chunk advisory remains. Local logs/tools/archive are ignored and no repository dependency was added.


## Creator-approved closeout verification - 2026-10-27

The creator explicitly specified the new repository version: 0.5.0 (Pre-release). This deliberate milestone rebaseline is applied consistently to package.json, both root lockfile version fields and README; all other package/lockfile data, dependencies and commands are unchanged. [VERSIONING_POLICY](VERSIONING_POLICY.md) now governs future closeout decisions. The approved deploy-pages.yml is byte-for-byte unchanged from review; verify.yml and the existing application, datasets, assets, base path and security allowlists are unchanged.

Fresh local checks passed: `npm run connections:check`, `npm run validate`, `npm test` (371/371, zero failures/skips, 167.279 seconds), `npm run release:check`, actionlint 1.7.12 for both workflows, manual-only/main/dependency/permission/artifact static checks, version consistency, 152 relative document targets, and working/staged diff review. Production output includes dist/index.html and dist/demo.html: 46 files / 5,409,690 bytes, all sixteen exact SVGs, three PNGs and eight MP3s. dist/ and local tooling/logs remain ignored. The existing Demo chunk-size advisory remains.

Local execution used Node 20.5.1 and workspace-local TEMP/TMP. No new browser/device or live Pages certification is claimed. The authorized normal push may start automatic verification; inspect the new commit's actual GitHub run before claiming hosted CI passed. GitHub Pages configuration, OIDC/artifact transfer and the first live deployment remain for the creator's separately authorized next step. This closeout creates no tag or GitHub Release and triggers no Pages deployment.


## Documentation-only final closeout verification - 2026-10-27

Version impact: no increment, as explicitly directed and required for this documentation-only publication record; package.json, both root lockfile fields and README remain 0.5.0. Eight documentation files changed; all other tracked bytes, including both workflows, source, assets, datasets, schemas, package files and Vite configuration, match the initial clean checkout. Local checks passed for 161 relative document targets, the two new cross-reference anchors, milestone consistency, historical Phase 1/G-I/verification retention, actionlint 1.7.12, automatic/manual workflow triggers and working/staged diff review.

No application test suite, build, browser/device test, settings change or deployment was rerun for this documentation-only closeout. Successful hosted build/deploy and Ubuntu/Windows verification are evidence retrieved for the published commit above; live website behavior is creator-tested and accepted. The new documentation commit/push is a separate repository change and does not replace that published commit. No tag, GitHub Release or Canon implementation is part of this work.
