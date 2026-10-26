# NEXUS Public Entrance Integration — Complete and Creator-Approved (2026-10-26)

The creator completed manual visual and functional testing and explicitly approved the implementation. Automated verification and its remaining coverage limits are recorded separately in [PUBLIC_ENTRANCE_VERIFICATION](PUBLIC_ENTRANCE_VERIFICATION.md). This amendment extends the approved Checkpoint 4.2G-I behavior; those completed records remain historical evidence.

## Website and content boundary

The same audited Vite build emits exactly two webpages under the unchanged `/Velara_Atlas/` base:

| Route / source | Responsibility |
| --- | --- |
| `/Velara_Atlas/` / `src/viewer/index.html` | Permanent public entry point; temporary NEXUS presentation, reserved for the future canonical MCR Velara Sector Atlas |
| `/Velara_Atlas/demo.html` / `src/viewer/demo.html` | Existing read-only NONCANONICAL simulation, with a Homepage link |

The homepage teaser is creator-selected temporary UI copy, not Canon, and is text-only. It is kept in landing HTML, separate from the immutable approved opening JSON and historical records. The preview invitation explicitly states `NONCANONICAL DEMONSTRATION — FICTIONAL TEST RECORDS`. The Demo retains its existing disclosure, four released charts, archival-only system and TEST records. Canonical population/migration require separate approval. The temporary Demo may be retired or archived only with a future approved canonical release. Push, Canon migration, Atlas Creator and public deployment remain separately authorized workstreams.

`npm run demo` still serves Vite on 5173; the homepage is at the base route and the interactive map is at `demo.html`. `npm run build` emits both pages; `npm run preview` serves them on 4173. No command names, base path, data/schema contracts, asset pins or calibration/scenario inputs change. Isolated map-fixture browser URLs also use `demo.html`; calibration retains `__calibration/`.

## Future canonical release

The current index.html remains the NEXUS landing page and demo.html remains the explicitly noncanonical simulation. In a future separately approved canonical release, index.html becomes the actual canonical MCR Velara Sector Atlas. The Demo is retired or archived only following separate creator approval. Canonical population/migration, Atlas Creator and public deployment are not implemented or authorized by this completed milestone; no release date is set.

## Opening and audio ownership

Both pages instantiate one existing `createAudioController` and one `createOpeningView`. The audio controller remains the sole preference/migration and speech owner; its three localStorage keys and all migration semantics are unchanged. No copied preference implementation or second master exists. `opening-content.mjs` shares exact approved JSON validation and original artwork URLs. `entry-voice.mjs` exposes only the original acknowledgment URL; `voice-assets.mjs` retains the Demo fallback recording as well.

Homepage ready means validated welcome content plus mounted accessible controls. It makes no chart-ready claim and imports no Three.js, renderer, dataset or historical engine. Pending first entry shows the same approved modal. Audio entry synchronously requests acknowledgment from the gesture; silent/Escape persists OFF without speech. Entry reveals the teaser and focuses its ordinary Demo link. Returning completion reveals the teaser with saved audio and no acknowledgment autoplay. Storage failure preserves the current document's in-memory choice; a later document may need entry again.

Demo ready still requires validated records/content and actual successful chart construction. Direct newcomers receive its original welcome and map-focus return. Homepage completion suppresses a second welcome in the Demo. Existing map narration, effects, ambience, history and cancellation remain unchanged. Homepage supplies no interface sound URLs, so no ambience/effect media is created. Mute, Demo-link navigation, pagehide and disposal stop/release homepage speech. Missing portrait/media leaves text and actions usable. Technical welcome-load failure exposes Retry and never shows the connection-established dialog.

`opening.css` contains the unchanged shared dialog styles. `landing.css` reuses that composition with a static black background; `style.css` retains the Demo layout. No original binary or opening script changes.

## Build/security and verification

Vite explicitly names both HTML inputs. Its landing-entry chunk closure has a finite module allowlist, including shared/dynamic imports, excluding all Demo/Three.js/history/calibration modules. Existing global registered-input completeness and pinned source audits remain. Output auditing requires both pages and their exact navigation destinations/disclosures, checks their combined resource reachability, restricts landing media to the original insignia/front portrait/acknowledgment, and retains exact SVG/PNG/MP3, forbidden-reference, identity, base-URL and source-map checks. `publicDir: false`, strict serving and static validated imports remain.

Browser callbacks that exercise maps now target `demo.html`. `tests/browser-public-entrance.mjs` runs against development or production preview with isolated Visitor contexts and covers entry choices, cross-page preferences, returning silence, failures, focus, responsive/reduced-motion presentation and absence of map/data loading. Existing opening/audio/interface and map suites remain applicable. Browser callback files use the repository's existing Playwright MCP harness; they are not part of `npm test`.

Exact results, limits and file-by-file changes are recorded in [PUBLIC_ENTRANCE_VERIFICATION](PUBLIC_ENTRANCE_VERIFICATION.md). Approval of this amendment's implementation is not deployment or canonical-release approval.
