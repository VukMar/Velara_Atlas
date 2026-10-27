# Manual GitHub Pages deployment

**Checkpoint 5 — Phase 1: GitHub Pages Deployment Preparation — Complete and Creator-Approved (2026-10-27).** The creator approved the workflow and this documentation/versioning/verification commit-and-push closeout. The first live deployment has not been executed; repository configuration and every public deployment still require separate authorization. No hosting/public-URL/deployment-action result is claimed. [VERSIONING_POLICY](VERSIONING_POLICY.md) distinguishes the approved repository version from any actually published version.

## What runs

`.github/workflows/verify.yml` remains the automatic read-only CI check for pull requests and pushes to main. It cannot publish. The separate **Deploy Velara Atlas to GitHub Pages** workflow has exactly one trigger:

```yaml
on:
  workflow_dispatch:
```

Both jobs require `refs/heads/main`; selecting another branch skips them without uploading or deploying. The build checks out the dispatch's exact `github.sha`, installs Node 24 and locked dependencies, then runs connection freshness, all tests and `release:check`. That last command builds and audits both pages once. Any failure or tracked-file change blocks upload. Only the audited `dist/` directory becomes the `github-pages` artifact.

The build token has only `contents: read`; the separate deployment job needs a successful build and has only `pages: write` and `id-token: write`. It uses the `github-pages` environment and reports the deployed URL. Configure Pages has `enablement: false`: it reads existing settings and does not enable Pages automatically. All actions use full upstream SHA pins. The `github-pages` concurrency group serializes runs with `cancel-in-progress: false`, preserving a running deployment; GitHub may replace an older pending run with a newer pending run.

`dist/` stays ignored because it is generated, audited output, rebuilt from the selected commit and lockfile on the runner. Never commit it, upload the source repository, create a gh-pages branch or add a personal token. The original `/Velara_Atlas/` base, npm scripts, dataset/asset admission, read-only viewer and two-page architecture are unchanged.

## Creator setup and release procedure

Perform these steps only after separate approval to configure/publish:

1. With the reviewed workflow on main and separate configuration approval, in **Settings > Pages > Build and deployment > Source**, select **GitHub Actions**. Do not select a branch publishing source. Check that repository Actions policy permits the pinned official actions. Configure the `github-pages` environment's deployment branch rule for main; add required reviewers if available and desired.
2. Approve the exact main commit to publish. Under **Actions > Deploy Velara Atlas to GitHub Pages > Run workflow**, select **main** and trigger it deliberately. A push or pull request alone cannot start this workflow.
3. Inspect both jobs' logs: checkout SHA, tests, release-audit inventory, tracked-diff guard, Pages artifact and deployment outcome. If any required step fails, investigate it before another manual attempt; do not bypass audits. The environment/deployment result exposes the Pages URL.
4. Expected URLs, once an authorized release succeeds: [NEXUS homepage](https://vukmar.github.io/Velara_Atlas/) and [noncanonical Demo](https://vukmar.github.io/Velara_Atlas/demo.html). Verify the welcome/returning-Visitor rules, shared audio preference, Demo navigation/disclosure, original media, mobile layout and absence of browser/network errors. These URLs are targets, not evidence of current deployment.

## Identify or restore a release

Record the successful workflow run URL, full commit SHA, package.json version at that SHA and deployment URL. Inspect the `github-pages` environment's deployment history and linked run to identify the published commit; do not infer the published version from the current tip of main or from CI success.

To redeploy an earlier approved version, obtain separate approval, open its original successful main deployment run and choose **Re-run all jobs** when available. This rebuilds and audits the original SHA/ref, rather than reusing an expired artifact or current main. If that run cannot be rerun, prepare a separately reviewed revert commit on main and dispatch it manually after approval. Do not reset branch history, bypass checks or dispatch a non-main branch.

## Sources and verification boundary

The workflow follows GitHub's [Pages custom workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). GitHub documents that [reruns retain the original SHA/ref](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs). Pins were checked against official releases: [configure-pages v6.0.0](https://github.com/actions/configure-pages/releases/tag/v6.0.0), [upload-pages-artifact v5.0.0](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0), [deploy-pages v5.0.1](https://github.com/actions/deploy-pages/releases/tag/v5.0.1); checkout/setup-node reuse the existing verification workflow's v6 pins.

Creator review is complete and this closeout authorizes a normal commit/push to main; automatic verify.yml may run on that push. The first live Pages deployment, repository/environment configuration, artifact transfer and OIDC remain unverified and require separate authorization. Canon migration, Atlas Creator and other Checkpoint 5 work remain separate.


## Initial implementation verification - 2026-10-27

Local verification (before creator approval, 2026-10-27): actionlint 1.7.12 passed YAML/Actions syntax for both workflows; static trigger/branch/dependency/permissions/order checks passed, including 12 branch/result cases. Connections and validation passed; `npm test` passed 371/371 (158.953 seconds, no skips/failures). `npm run release:check` passed with both HTML pages, 46 files / 5,409,690 bytes and all pinned assets. A local tar inspection matched all 46 audited dist files byte-for-byte; no upload/deployment action ran. Diff/scope checks passed and verify.yml is unchanged. Only one normal release build was run; no redundant `npm run build` was added. Local execution used Node 20.5.1 and workspace-local TEMP/TMP; a fresh hosted Node 24 `npm ci` and deployment remain unverified. The existing large-Demo-chunk advisory remains. Local logs/tools/archive are ignored and no repository dependency was added.


## Creator-approved closeout verification - 2026-10-27

The creator explicitly specified the new repository version: 0.5.0 (Pre-release). This deliberate milestone rebaseline is applied consistently to package.json, both root lockfile version fields and README; all other package/lockfile data, dependencies and commands are unchanged. [VERSIONING_POLICY](VERSIONING_POLICY.md) now governs future closeout decisions. The approved deploy-pages.yml is byte-for-byte unchanged from review; verify.yml and the existing application, datasets, assets, base path and security allowlists are unchanged.

Fresh local checks passed: `npm run connections:check`, `npm run validate`, `npm test` (371/371, zero failures/skips, 167.279 seconds), `npm run release:check`, actionlint 1.7.12 for both workflows, manual-only/main/dependency/permission/artifact static checks, version consistency, 152 relative document targets, and working/staged diff review. Production output includes dist/index.html and dist/demo.html: 46 files / 5,409,690 bytes, all sixteen exact SVGs, three PNGs and eight MP3s. dist/ and local tooling/logs remain ignored. The existing Demo chunk-size advisory remains.

Local execution used Node 20.5.1 and workspace-local TEMP/TMP. No new browser/device or live Pages certification is claimed. The authorized normal push may start automatic verification; inspect the new commit's actual GitHub run before claiming hosted CI passed. GitHub Pages configuration, OIDC/artifact transfer and the first live deployment remain for the creator's separately authorized next step. This closeout creates no tag or GitHub Release and triggers no Pages deployment.
