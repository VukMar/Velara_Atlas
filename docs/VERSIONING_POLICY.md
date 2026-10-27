# Velara Atlas versioning policy

**Authoritative creator-approved policy, adopted 2026-10-27.** Versions use `MAJOR.MINOR.PATCH`. This policy governs version decisions; `package.json` is the authoritative machine-readable version. [PROJECT_STATUS](PROJECT_STATUS.md) separately owns milestone approval and publication gates.

## Development before the canonical release: 0.x.y

Every version beginning with `0.` belongs to the development period before the first canonical Atlas release. The authorized rebaseline to **0.5.0 (Pre-release)** acknowledges the completed historical engine, interactive Atlas, NEXUS audiovisual integration, architecture optimization, public entrance and deployment preparation. It does not mean development is 50% complete.

| Approved change | Version decision |
| --- | --- |
| Significant completed, creator-approved milestone: major viewer functionality, substantial architecture improvement, audiovisual/interface system, significant authoring/history capability, or major infrastructure/public-delivery milestone | Increment the minor component and reset patch to zero, for example `0.5.0` → `0.6.0` |
| Bug fix, small functional improvement, compatibility correction, minor UI refinement, or security/performance fix preserving intended behavior | Increment patch, for example `0.5.0` → `0.5.1` |
| Ordinary documentation correction, test-only maintenance, housekeeping, comments, or another change without meaningful product/delivery impact | No automatic increment |

Judge infrastructure by significance, not changed-file count. Minor numbers are not limited to nine: `0.10.0` and `0.11.0` are valid. A commit alone never requires an increment.

## The canonical launch: 1.0.0

**1.0.0 is reserved for the creator-approved public launch of the first canonical MCR Velara Sector Atlas.** The noncanonical Demo and NEXUS landing page do not qualify. Only the creator can authorize this transition; elapsed time, engineering milestones and version-number progression cannot do so automatically. Canon migration and public deployment retain their separate approval gates.

## After 1.0.0

Follow standard Semantic Versioning:

- **MAJOR:** incompatible public contracts or changes requiring consumer migration.
- **MINOR:** backward-compatible new functionality or substantial feature additions.
- **PATCH:** backward-compatible bug fixes and corrections.

Software compatibility is distinct from fictional history and Canon authority. A content-only change does not necessarily change a software contract; evaluate its release significance and public impact before choosing an increment. An architectural change does not silently become a major release.

## Required closeout decision and synchronization

For each milestone closeout or release, Codex must inspect the current version, classify the approved changes, recommend an increment or no increment, and briefly explain why. Obtain creator approval before applying an increment unless the creator has already explicitly specified the new version. Do not increment on every commit.

For an authorized increment, synchronize `package.json`, root `package-lock.json` metadata (including `packages[""].version`) and the displayed README version. Preserve the package name, dependencies, commands and lockfile integrity unless separately authorized. Link to the authoritative metadata/policy instead of hardcoding competing current versions in unrelated documents; dated milestone records may retain their historical versions.

## Repository version and published version

- **Repository version:** the current approved development version committed to the repository.
- **Published version:** the version and exact Git commit of the most recently deployed public website, identified from a successful deployment record.

Manual GitHub Pages deployment means these can legitimately differ. A commit, push or successful CI run does not prove that the repository version was publicly deployed. If no approved deployment has occurred, do not invent a published version. See the [manual Pages operating guide](GITHUB_PAGES_DEPLOYMENT.md) for deployment evidence and restoration.

Git tags and GitHub Releases may mark separately approved public milestones later; they are not automatic requirements for every commit. A release tag must identify the actual approved commit being released. This closeout creates neither a tag nor a GitHub Release.
