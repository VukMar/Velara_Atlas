# Velara Atlas

**Repository version 1.0.0 — canonical launch candidate** · [Versioning policy](docs/VERSIONING_POLICY.md)

The repository now implements the canonical historical Velara Sector Atlas at `/Velara_Atlas/`: one interactive application with the original NEXUS first-entry modal and audio preferences. It contains 70 registered systems, seven historical Cantums and 234 approved descriptions under the existing v1.3 contract. Every system currently uses the archival fallback for unavailable interior charts; no interiors or routes were invented.

The canonical Atlas and Holographic Transmission InfoCard have passed creator visual inspection. The subsequent navigation/control-bar refinement awaits final UI review in [PR #4](https://github.com/VukMar/Velara_Atlas/pull/4). The candidate has not been deployed. The [published website](https://vukmar.github.io/Velara_Atlas/) remains the creator-approved October 27, 2026 **0.5.0 noncanonical pre-release**. Repository pushes perform verification only; merge and Pages deployment require separate authorization. [Deployment evidence](docs/GITHUB_PAGES_DEPLOYMENT.md#first-successful-public-deployment---2026-10-27).

## Run locally

Use Node.js 24 LTS, matching CI, from the repository root:

```sh
npm ci
npm run atlas
```

Open **http://127.0.0.1:5173/Velara_Atlas/**. New visitors choose **Enter with audio** or **Enter silently**; returning visitors keep their existing completion and audio preferences. Use Catalogue to select a system or Cantum. Its InfoCard opens on **Description**; **Technical** contains all recorded facts. The header, NEXUS portrait, tabs and actions stay visible while the active content scrolls. Changing History updates the selected year and record while retaining the tab; selecting another record resets to Description. Map controls provide top-down/perspective views, pan, zoom and Focus. Entering a system opens its NEXUS archival fallback until an interior chart is published.

| Command | Scope |
| --- | --- |
| `npm run atlas` | Validate and serve the canonical application on 5173 |
| `npm run demo` | Compatibility alias for `npm run atlas`; uses Canonical |
| `npm run dev` / `npm run preview:calibration` | Separate synthetic calibration on 5174 at `/Velara_Atlas/__calibration/` |
| `npm run build` | Validate Canonical, build the single-page site and audit `dist/` |
| `npm run preview` | Serve the built canonical site on 4173 |
| `npm run release:check` | Local canonical build and resource/disclosure audit; no deployment |
| `node tests/preview-archived-demo.mjs` | Explicit NONCANONICAL regression fixture on 5177 at `/Velara_Atlas/` |
| `npm run history:demo` | Protected legacy console chronology |

The old public `demo.html` route is retired. Historical Demo data and HTML are retained in [the archived fixture](tests/fixtures/archived-demo/README.md), excluded from production. Calibration, legacy v0.1 data and frozen versioned fixtures remain separate.

## Checks

The top row opens Catalogue, Map Controls, Layers and History. Catalogue is a modal archival search; selecting a result transitions to its InfoCard. The other three utilities share one bottom toolbar, reserving space below the square chart. Their 10-second inactivity dismissal pauses for hover, keyboard focus, active editing/gestures and Map Controls Help. Use the far-right **?** for supported pointer, touch and keyboard controls. [Current interface contract](docs/VIEWER_SPECIFICATION.md#current-navigation-and-control-bars--2026-11-19).

```sh
npm test
npm run validate
npm run connections:check
npm run build
npm run release:check
git diff --check
```

Production validation and read-only connection freshness select `public/datasets/canonical/`. Generic engine tests explicitly use isolated synthetic or archived fixtures; canonical integration tests pin all five production file hashes to the approved candidate. Builds retain `publicDir: false`, exact input admission, complete registered imports, resource reachability and pinned media integrity. No arbitrary dataset selector, runtime JSON fetching, writable endpoint or editor exists.

Only the explicitly invoked `npm run connections` writer changes navigation output; startup, tests, builds and CI never repair it. [Navigation and recovery](docs/NAVIGATION_AUTHORING.md). The creator explicitly authorized staging repository version 1.0.0 for the canonical launch candidate. This does not complete the public launch or authorize a tag, Release or deployment.

## Documentation

Start with [INDEX](docs/INDEX.md), [current status](docs/PROJECT_STATUS.md), [integration and validation](docs/CANONICAL_APPLICATION_INTEGRATION.md), [architecture](docs/ARCHITECTURE.md), [data model](docs/DATA_MODEL.md), [local development](docs/LOCAL_DEVELOPMENT.md) and [AGENTS](AGENTS.md). Completed checkpoint and public-release records remain historical evidence.

Velara, the Continuance setting, NEXUS and associated MCR worldbuilding belong to their creator(s). A public software/content license has not been selected; visibility does not grant reuse rights. This is a fictional setting. Private lore, unpublished source notes and extraction caches must remain outside public Git.
