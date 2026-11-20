# Manual GitHub Pages deployment

> **2026-11-19 canonical application integration:** the repository now serves the canonical Atlas at `/Velara_Atlas/` through `index.html`. The former two-page teaser/Demo architecture is superseded; its dated evidence below is historical. See [canonical integration](CANONICAL_APPLICATION_INTEGRATION.md) for active paths, commands, checks and review limits. The October 27 noncanonical release is now historical; the canonical publication record below owns the current deployed version.

## First Canonical Public Deployment — Velara Atlas 1.0.0 — 2026-11-20 UTC

The first canonical Atlas 1.0.0 publication is independently verified from the exact manual deployment run, its two job logs, artifact metadata and package metadata at the published SHA. The accepted implementation was merged in PRs #4/#5; pre-deployment documentation reconciliation was completed in PR #6. [PROJECT_STATUS](PROJECT_STATUS.md) owns current milestone and authorization status.

| Publication evidence | Verified value and source |
| --- | --- |
| Workflow / run | Deploy Velara Atlas to GitHub Pages; [44833559920](https://github.com/VukMar/Velara_Atlas/actions/runs/44833559920), attempt **1**, `workflow_dispatch`, branch `main`, completed `success` |
| Exact published commit | [`e6689347b8d1e6a9313c9bb6f8b5ee2ede96ff19`](https://github.com/VukMar/Velara_Atlas/commit/e6689347b8d1e6a9313c9bb6f8b5ee2ede96ff19), from this run's `head_sha` and deployment log |
| Published package version | **1.0.0**, read from [package.json at that SHA](https://github.com/VukMar/Velara_Atlas/blob/e6689347b8d1e6a9313c9bb6f8b5ee2ede96ff19/package.json) |
| Workflow start | **2026-11-20T23:01:00Z** |
| Deployment success reported | **2026-11-20T23:02:05Z**; deploy log line at `23:02:05.3284988Z`: `Reported success!` |
| Workflow completion | **2026-11-20T23:02:07Z**, distinct from deployment-success reporting |
| Serbia-local publication date | November 21, 2026, shortly after midnight (00:02 CET); authoritative timestamps above use UTC |
| Build job | [136624241181](https://github.com/VukMar/Velara_Atlas/actions/runs/44833559920/job/136624241181), completed `success` |
| Deploy job | [136624613272](https://github.com/VukMar/Velara_Atlas/actions/runs/44833559920/job/136624613272), completed `success` |
| Audited Pages artifact | `github-pages`, ID **14676474077**, [artifact from this run](https://github.com/VukMar/Velara_Atlas/actions/runs/44833559920/artifacts/14676474077); compressed size 4,806,420 bytes; digest `sha256:83a9eb41d0f93f04efd99a2da3430dfce7b2dd3d46637a29af5801fab889710b` |
| Public URL | [Velara Atlas](https://vukmar.github.io/Velara_Atlas/); deploy log reports `Evaluated environment url: https://vukmar.github.io/Velara_Atlas/` |

The build job used **Node 24.22.3**. Its successful steps include locked dependency installation (`npm ci`), read-only `connections:check`, **388/388 tests with zero failures**, `release:check`, both tracked-diff guards and upload of only audited `dist/`. The release audit verified 33 website files / **5,600,994 bytes**, all sixteen pinned SVGs, three PNGs and eight MP3s, base-relative assets and the selected canonical dataset, with no archived Demo/private/source-map references. The deploy job found the run's single named artifact and published that artifact for the exact SHA above. These results come from this manual publication run, not an unrelated CI run. Artifact download availability is retention-limited; the ID/digest preserve its recorded identity.

### Independent live-site verification and acceptance limits

Observed November 20, 2026, **23:18-23:19 UTC** (November 21 locally). Environment: Windows, installed headless **Chrome 157.0.8103.79**, SwiftShader software WebGL and reduced motion. Desktop viewport 1440x1000; separate touch-emulated 390x844 and 844x390 contexts. Playwright connector transport was unavailable; the existing local Playwright/Chrome installation completed these read-only checks without adding dependencies or changing the website.

| Intended live check | Result and evidence |
| --- | --- |
| Canonical Atlas at public root | **Verified:** HTTP 200, rendered sector canvas and 70 system markers at 1200 A.E. |
| NEXUS first entry | **Verified for silent entry:** native welcome displayed, Enter silently opened the chart. Enter with audio was **not performed** in these live checks. |
| Returning Visitor and audio preferences | **Verified:** reload skipped the completed welcome and retained silent preference; Audio On persisted after another real reload, then was muted. Physical speaker output/fidelity was **not tested**. |
| Canonical Catalogue | **Verified:** 77 records at 1200 A.E. (70 systems and seven Cantums), modal opened and sampled records were selectable. |
| History updates visible records | **Verified:** 900 A.E. reduced the Catalogue to 57 records and the Drevnasel InfoCard displayed 900 A.E.; Latest restored 1200. |
| Description / Technical InfoCards | **Verified:** Drevnasel Description (1,698 characters) and Technical facts (229 characters) displayed; tabs switched. |
| Cantum lettering / influence | **Verified:** actual overview screenshot visually inspected; six geographic names and colored influence fields rendered at 1200 A.E., matching the viewport's six-name count. |
| Map controls and bottom toolbars | **Verified:** top/perspective mode switch, modal Help and mutually exclusive Controls/Layers/History toolbars. The full inactivity/gesture regression matrix was **not repeated**. |
| System archival fallback | **Verified for Putluk:** Enter System opened the named NEXUS archival view; Return to Sector restored the map. Every system was **not individually entered**. |
| Mobile/responsive layout | **Verified in emulation:** 390x844 and 844x390 had square charts and no document overflow; Catalogue selection and the bounded Putluk Description card worked. Portrait/landscape screenshots were visually inspected. Physical mobile devices were **not tested**. |
| Runtime / missing resources | **Verified within these sessions:** no observed page errors, error-level console messages or HTTP responses >=400. This is bounded session coverage, not a universal guarantee. |

**Acceptance boundary:** the creator confirmed that the merged application worked as intended **before deployment**. That implementation acceptance is distinct from the workflow evidence and independent live checks above. Creator post-deployment public acceptance has **not been supplied for this closeout**. Physical-device interaction, Firefox/Safari, screen readers, speaker fidelity and hardware/GPU/performance certification were not performed. Preserve these limits; successful publication does not certify every environment.

### Documentation-closeout regression boundary

> Historical initial finding at `cfc08de466057da1c76b836e1f2af7faefb85403`: the separately authorized PR #7 follow-up corrects the test description and assertion to require the published-release heading while preserving every other check. The paragraph below retains the original finding; current correction verification is recorded in the PR description.

The README now identifies the published release instead of the former candidate. `tests/canonical-integration.test.mjs:27` still asserts `/Repository version 1\.0\.0 — canonical launch candidate/`. That assertion is obsolete after publication and needs a separately scoped test-only correction. Application/test files remain unchanged in this documentation task; no claim is made that the post-edit full suite passes. The 388 passing tests above belong to the verified deployed artifact.

This closeout keeps version **1.0.0**, creates no subsequent software release, tag or GitHub Release, and performs no merge or deployment. Its documentation commit is distinct from the published SHA. Future content, protected legacy migration, deferred Cantum Stage 5 and Atlas Creator remain separately gated.

> **Historical October 27 closeout summary:** the following paragraph records the earlier noncanonical pre-release, not the latest published version.

**Checkpoint 5 — First Public Deployment — Complete and Creator-Approved (2026-10-27).** Velara Atlas v0.5.0 is now an operational noncanonical public pre-release on GitHub Pages. The creator configured Pages, manually deployed the approved site, tested the live website and confirmed acceptance. Further deployments require separate authorization; this task documents the existing release and does not deploy it again. [VERSIONING_POLICY](VERSIONING_POLICY.md) distinguishes repository and published versions; no increment is appropriate for this documentation-only closeout.

## Canonical 1.0.0 pre-deployment reconciliation - 2026-11-20

> Historical preparation record, superseded by the canonical deployment above. The then-current 0.5.0 publication statements and prospective checklist below preserve their pre-deployment context; they are not current publication status.

PRs #4/#5 are merged and the creator accepts the canonical application. Repository metadata remains 1.0.0; [PROJECT_STATUS](PROJECT_STATUS.md) owns current approval gates. The latest verified successful Pages run is still October 27's `40587944992`, publishing 0.5.0 at `77d2ab0ea484770eb6e40f6d0ac5aaa581d74209`. No 1.0.0 deployment is recorded here. Documentation reconciliation is followed by creator review/merge, inspection of the resulting main commit and separate manual deployment authorization.

The unchanged workflow uses only `workflow_dispatch`, requires main, verifies under Node 24, runs the release audit and uploads only audited `dist/`. Deployment depends on the successful build. A documentation commit or successful CI does not publish.

### Evidence to record after an authorized canonical deployment

- [ ] Actual workflow run URL/ID and attempt.
- [ ] Exact published commit SHA and package version at that SHA.
- [ ] Successful build/deployment job results and publication timestamp.
- [ ] Live URL, verification date and the actual functional/browser/device checks performed, including any limitations.
- [ ] Creator acceptance of that deployed public application.

Do not prefill a future deployment SHA from the current main tip. Preserve the complete previous release record below.

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

Both jobs require `refs/heads/main`; selecting another branch skips them without uploading or deploying. The build checks out the dispatch's exact `github.sha`, installs Node 24 and locked dependencies, then runs connection freshness, all tests and `release:check`. That last command builds and audits the canonical single page once. Any failure or tracked-file change blocks upload. Only the audited `dist/` directory becomes the `github-pages` artifact.

The build token has only `contents: read`; the separate deployment job needs a successful build and has only `pages: write` and `id-token: write`. It uses the `github-pages` environment and reports the deployed URL. Configure Pages has `enablement: false`: it reads existing settings and does not enable Pages automatically. All actions use full upstream SHA pins. The `github-pages` concurrency group serializes runs with `cancel-in-progress: false`, preserving a running deployment; GitHub may replace an older pending run with a newer pending run.

`dist/` stays ignored because it is generated, audited output, rebuilt from the selected commit and lockfile on the runner. Never commit it, upload the source repository, create a gh-pages branch or add a personal token. The original `/Velara_Atlas/` base, npm scripts, dataset/asset admission, read-only viewer are preserved; the canonical single-page architecture supersedes the former two-page application.

## Creator setup and release procedure

Initial GitHub Pages configuration is complete for the published site. Retain these setup/change and future-release instructions as an operating reference; use them only after separate approval. No settings change or deployment is part of this documentation closeout:

1. For separately approved setup/configuration changes, in **Settings > Pages > Build and deployment > Source**, select **GitHub Actions**. Do not select a branch publishing source. Check that repository Actions policy permits the pinned official actions. Configure the `github-pages` environment's deployment branch rule for main; add required reviewers if available and desired.
2. Approve the exact main commit to publish. Under **Actions > Deploy Velara Atlas to GitHub Pages > Run workflow**, select **main** and trigger it deliberately. A push or pull request alone cannot start this workflow.
3. Inspect both jobs' logs: checkout SHA, tests, release-audit inventory, tracked-diff guard, Pages artifact and deployment outcome. If any required step fails, investigate it before another manual attempt; do not bypass audits. The environment/deployment result exposes the Pages URL.
4. After each authorized deployment, verify the canonical Atlas root: welcome/returning-Visitor rules, saved audio preference, canonical history/InfoCards and archival fallback, original media, mobile layout and browser/network errors. Record acceptance against that deployment's exact SHA, independently of automatic CI.

## Identify or restore a release

Record the successful workflow run URL, full commit SHA, package.json version at that SHA and deployment URL. Inspect the `github-pages` environment's deployment history and linked run to identify the published commit; do not infer the published version from the current tip of main or from CI success.

To redeploy an earlier approved version, obtain separate approval, open its original successful main deployment run and choose **Re-run all jobs** when available. This rebuilds and audits the original SHA/ref, rather than reusing an expired artifact or current main. If that run cannot be rerun, prepare a separately reviewed revert commit on main and dispatch it manually after approval. Do not reset branch history, bypass checks or dispatch a non-main branch.

## Sources and verification boundary

The workflow follows GitHub's [Pages custom workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). GitHub documents that [reruns retain the original SHA/ref](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs). Pins were checked against official releases: [configure-pages v6.0.0](https://github.com/actions/configure-pages/releases/tag/v6.0.0), [upload-pages-artifact v5.0.0](https://github.com/actions/upload-pages-artifact/releases/tag/v5.0.0), [deploy-pages v5.0.1](https://github.com/actions/deploy-pages/releases/tag/v5.0.1); checkout/setup-node reuse the existing verification workflow's v6 pins.

The first manual public deployment and creator live acceptance are complete as recorded above; read-only metadata verifies the successful deployment path for that release. This documentation-only closeout authorizes a normal commit/push to main, which cannot dispatch Pages. The initial public-launch objective of Checkpoint 5 is complete. Future deployments, further canonical content and Atlas Creator remain separately authorized; no new infrastructure work starts automatically. Historical pre-deployment verification records below retain their original boundaries.


## Initial implementation verification - 2026-10-27

Local verification (before creator approval, 2026-10-27): actionlint 1.7.12 passed YAML/Actions syntax for both workflows; static trigger/branch/dependency/permissions/order checks passed, including 12 branch/result cases. Connections and validation passed; `npm test` passed 371/371 (158.953 seconds, no skips/failures). `npm run release:check` passed with both HTML pages, 46 files / 5,409,690 bytes and all pinned assets. A local tar inspection matched all 46 audited dist files byte-for-byte; no upload/deployment action ran. Diff/scope checks passed and verify.yml is unchanged. Only one normal release build was run; no redundant `npm run build` was added. Local execution used Node 20.5.1 and workspace-local TEMP/TMP; a fresh hosted Node 24 `npm ci` and deployment remain unverified. The existing large-Demo-chunk advisory remains. Local logs/tools/archive are ignored and no repository dependency was added.


## Creator-approved closeout verification - 2026-10-27

The creator explicitly specified the new repository version: 0.5.0 (Pre-release). This deliberate milestone rebaseline is applied consistently to package.json, both root lockfile version fields and README; all other package/lockfile data, dependencies and commands are unchanged. [VERSIONING_POLICY](VERSIONING_POLICY.md) now governs future closeout decisions. The approved deploy-pages.yml is byte-for-byte unchanged from review; verify.yml and the existing application, datasets, assets, base path and security allowlists are unchanged.

Fresh local checks passed: `npm run connections:check`, `npm run validate`, `npm test` (371/371, zero failures/skips, 167.279 seconds), `npm run release:check`, actionlint 1.7.12 for both workflows, manual-only/main/dependency/permission/artifact static checks, version consistency, 152 relative document targets, and working/staged diff review. Production output includes dist/index.html and dist/demo.html: 46 files / 5,409,690 bytes, all sixteen exact SVGs, three PNGs and eight MP3s. dist/ and local tooling/logs remain ignored. The existing Demo chunk-size advisory remains.

Local execution used Node 20.5.1 and workspace-local TEMP/TMP. No new browser/device or live Pages certification is claimed. The authorized normal push may start automatic verification; inspect the new commit's actual GitHub run before claiming hosted CI passed. GitHub Pages configuration, OIDC/artifact transfer and the first live deployment remain for the creator's separately authorized next step. This closeout creates no tag or GitHub Release and triggers no Pages deployment.


## Documentation-only final closeout verification - 2026-10-27

Version impact: no increment, as explicitly directed and required for this documentation-only publication record; package.json, both root lockfile fields and README remain 0.5.0. Eight documentation files changed; all other tracked bytes, including both workflows, source, assets, datasets, schemas, package files and Vite configuration, match the initial clean checkout. Local checks passed for 161 relative document targets, the two new cross-reference anchors, milestone consistency, historical Phase 1/G-I/verification retention, actionlint 1.7.12, automatic/manual workflow triggers and working/staged diff review.

No application test suite, build, browser/device test, settings change or deployment was rerun for this documentation-only closeout. Successful hosted build/deploy and Ubuntu/Windows verification are evidence retrieved for the published commit above; live website behavior is creator-tested and accepted. The new documentation commit/push is a separate repository change and does not replace that published commit. No tag, GitHub Release or Canon implementation is part of this work.
