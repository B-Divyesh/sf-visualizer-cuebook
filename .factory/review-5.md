# Adversarial first-read review 5 — Cuebook

**Verdict: FAIL**

Reviewed 2 September 2026 against live <https://visualizer-cuebook.sociobot.in> and repository revision `95e070d8e21ce53de650b149099ea946951847e6`. The 25 deployed runtime files match the clean production build byte for byte. There is one major finding and three minor findings. All 19 declared claim commands pass independently, but three public statements remain outside `.factory/claims.json`. A PASS requires zero findings and no untested claim.

## Cold first screen

Fresh Chromium contexts opened the live home page at 390×844 and 1440×900. Nothing was scrolled before these answers were recorded.

| Question | Answer from the first screen | Result |
| --- | --- | --- |
| What does this do? | It builds repeatable visual-scene cues against a track. | Clear from “Build repeatable visual cues for your track.” |
| For whom? | DJs, VJs, and educators rehearsing scene changes. | Explicit in the next sentence. |
| What should I select first? | “Try it with sample data.” | Clear and visually primary. The adjacent copy says it opens a 12-second rehearsal and leaves the saved set unchanged. |

The first screen passes at both widths. At 390 px, the demo result and all three privacy, offline, and cost facts are visible above the fold. The page loaded with one product-origin request set and no console or page error.

## Findings

### Major

#### F-5-1 — The site-data deletion promise is unlisted and untested

- **Exact quote/location:** live `/privacy/`, “Use browser site-data controls to remove all local data.” The preceding paragraph also offers “site-data controls” as a way to manage the stored set.
- **Evidence:** `.factory/claims.json` has a `delete-local-set` claim for the in-product **Start a new set** action, but no claim for browser site-data controls. `rg` found no test that clears origin data or asserts that IndexedDB, Cache Storage, service-worker state, and other local namespaces are gone.
- **Why this fails:** this is a privacy control a visitor may rely on to remove everything Cuebook stored. A different deletion path cannot prove the absolute “all local data” statement.
- **Concrete fix:** add a `clear-site-data` claim and one tagged test. Seed a complete real project and service-worker caches, clear all data for the Cuebook origin in a fresh browser context, reopen the site, and assert that no project, audio blob, Cuebook cache, or Cuebook storage key remains. Otherwise remove this sentence and mention only the tested **Start a new set** action.

### Minor

#### F-5-2 — The README’s browser-suite assertions are not in the claim map

- **Exact quote/location:** `README.md`, “Browser tests use Playwright 1.58.2. They cover demo isolation, cues, downloads, phone and desktop layouts, accessibility, and offline reload.”
- **Evidence:** the package is pinned and the complete 34-test suite passed, but no `.factory/claims.json` entry names either the version or the stated coverage. The claims contract requires every public claim-like sentence to have an entry and one tagged test.
- **Why this fails:** contributors are asked to rely on a specific runner version and a defined coverage list without a claim-map owner. The prose can drift while unrelated tests still pass.
- **Concrete fix:** replace both sentences with “Run `npm run test:e2e` for browser checks.” If the version and coverage inventory must remain public, add a `browser-suite-contract` claim whose tagged test verifies the exact pin and each named behavior.

#### F-5-3 — The README’s deployment-config assertion is unlisted

- **Exact quote/location:** `README.md`, “The factory deployment uses this file for routes, security headers, caching, and the designed 404 page.”
- **Evidence:** `static-deployment` claims only that Cuebook builds as a static app without a backend or required environment variable. Its tagged test does not assert the deployed routes, response headers, cache policy, or 404 response. Untagged tests and this review verified those behaviors, but they are not mapped to this sentence.
- **Why this fails:** an operator may rely on the sentence when deploying, yet the named claim test can pass if the deployment contract regresses.
- **Concrete fix:** delete the sentence and keep the preceding deployment instruction, or add a `deployment-config` claim with a tagged test for the exact route, header, cache, and 404 behavior.

#### F-5-4 — The demo route hides its h1 and reuses the home description

- **Exact quote/location:** live `/?demo=1` and `/demo/`; the only h1 is “Build repeatable visual cues for your track.” with class `sr-only`, rendered as a clipped 1×1 px element. The standard meta description remains “Build repeatable visual cues for your track in this private, offline rehearsal tool.”
- **Evidence:** the route title and social metadata correctly say “Demo — Cuebook,” but the focused route heading is not visible and neither the h1 nor standard description identifies the sample rehearsal. Axe reports no violation because the hidden heading remains in the accessibility tree.
- **Why this fails:** the site-structure contract requires one h1 that is the route headline. A sighted visitor gets no visible page headline, while route focus lands on a clipped home heading. The metadata is also inconsistent with the route-specific title and social description.
- **Concrete fix:** use a visible demo h1 such as “Rehearse five sample visual cues.” Keep the editable set title below it. Set the standard description to the existing demo social description: “Try a 12-second Cuebook rehearsal with five editable sample cues.” Retain focus and announcement tests for direct load, forward navigation, and Back.

## Copy audit

Counts use whitespace-delimited words, ignore punctuation-only separators, and treat hyphenated terms as one word. Commands are not sentences. Navigation labels, headings, actions, facts, alt text, and fallback copy are included because they affect first-read clarity.

No landing or README sentence exceeds 22 words. No banned marketing adjective, metaphor heading, inconsistent product term, or noun-only action was found. F-5-2 and F-5-3 are claim-map defects rather than plain-language defects.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Cuebook | 1 | Pass; wordmark |
| Demo / Privacy / Terms | 1 each | Pass; navigation destinations |
| Saved locally | 2 | Pass; `cue-workflow` |
| Private visual rehearsal | 3 | Pass; category label |
| Build repeatable visual cues for your track. | 7 | Pass; `deterministic-scenes` |
| For DJs, VJs, and educators who need repeatable scene changes from their own track. | 14 | Pass |
| Try it with sample data | 5 | Pass; result-naming action |
| Choose your track | 3 | Pass; result-naming action |
| Import a cue file | 4 | Pass; result-naming action |
| Opens a 12-second rehearsal with five editable cues. | 8 | Pass; `demo-sandbox` |
| Your saved set stays unchanged. | 5 | Pass; `demo-sandbox` |
| Your track stays in this browser. | 6 | Pass; `local-privacy` |
| Saved sets work offline. | 4 | Pass; `offline-reload` |
| All rehearsal tools are free. | 5 | Pass; `free-access` |
| Five lime cue beacons positioned across an abstract glass rehearsal timeline | 11 | Pass; useful image alt text |
| Five saved cues trigger repeatable scene changes. | 7 | Pass; `deterministic-scenes` |
| Sample cue sheet | 3 | Pass; section label |
| See the cue sheet before you import | 7 | Pass; section heading |
| Each cue lists its time, scene, and note before you import a track. | 13 | Pass; matches the preview |
| Opening contour | 2 | Pass; sample note |
| Break into shards | 3 | Pass; sample note |
| Closing horizon | 2 | Pass; sample note |
| How it works | 3 | Pass; section heading |
| Rehearse a scene change in three steps | 7 | Pass; section heading |
| Choose a track | 3 | Pass; step heading |
| Keep it in this browser. | 5 | Pass; `local-privacy` |
| Mark each change | 3 | Pass; step heading |
| Pick a scene at the playhead. | 6 | Pass; `cue-workflow` |
| Play it again | 3 | Pass; step heading |
| Check the same run before you perform. | 7 | Pass; `deterministic-scenes` |
| Privacy and limits | 3 | Pass; section label |
| What Cuebook keeps on this device | 6 | Pass; section heading |
| Your track and set stay in this browser. | 8 | Pass; `local-privacy` |
| Beat numbers use the BPM and offset you enter. | 9 | Pass; `beat-grid` |
| Export a cue file to keep a copy. | 8 | Pass; `cue-workflow` |
| Read the privacy details | 4 | Pass; result-naming link |
| Cuebook keeps one track and its cues in this browser. | 10 | Pass; `local-privacy` |
| Built by Param Factory · v1.0.10 | 5 | Pass; credit and build id |
| Cuebook needs JavaScript to load a local track and render rehearsals. | 11 | Pass; useful fallback |
| Your track never leaves this device. | 6 | Pass; `local-privacy` |

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Cuebook | 1 | Pass; document title |
| Cuebook helps DJs, VJs, and educators rehearse visual changes against their own tracks. | 13 | Pass |
| Try the demo with sample data: `https://visualizer-cuebook.sociobot.in/?demo=1`. | 7 | Pass |
| It opens a 12-second rhythm with five editable cues. | 9 | Pass; `demo-sandbox` |
| Your saved set stays unchanged. | 5 | Pass; `demo-sandbox` |
| What it does | 3 | Pass; heading |
| Keeps one track and its set in this browser. | 9 | Pass; `local-privacy` |
| Marks each cue at the current playback time. | 8 | Pass; `cue-workflow` |
| Shows beat numbers from the BPM and offset you enter. | 10 | Pass; `beat-grid` |
| Replays Contour, Orbit, and Shards at the same track time. | 10 | Pass; `three-scenes`, `deterministic-scenes` |
| Imports and exports a Cuebook cue file. | 7 | Pass; `cue-workflow` |
| Audio is not included. | 4 | Pass; `json-no-audio` |
| Installs on your device and reopens a saved set offline. | 10 | Pass; `pwa-install`, `offline-reload` |
| Keeps cue sheets with more than five cues. | 8 | Pass; `cue-capacity` |
| Records a rehearsal when your browser can include the track audio. | 11 | Pass; `rehearsal-recording` |
| Tracks are not uploaded. | 4 | Pass; `local-privacy` |
| Cuebook has no analytics or trackers. | 6 | Pass; `no-tracking-runtime` |
| It loads no scripts or fonts from other sites. | 9 | Pass; `no-tracking-runtime` |
| Choose an audio file your browser can play. | 8 | Pass; direct compatibility guidance |
| Every current rehearsal tool is available without charge. | 8 | Pass; `free-access` |
| See privacy and terms. | 4 | Pass; direct links follow |
| Run locally | 2 | Pass; heading |
| Cuebook requires Node.js 20 or newer for local builds. | 9 | Pass; `node-20-build` |
| Open the local URL Vite prints. | 6 | Pass; setup instruction |
| Keyboard controls outside form fields: | 5 | Pass; heading |
| Space: play or pause | 4 | Pass; keyboard instruction |
| M: mark a cue at the current playback time | 9 | Pass; keyboard instruction |
| Left / Right: nudge the playhead by one second | 9 | Pass; keyboard instruction |
| Test and build | 3 | Pass; heading |
| Browser tests use Playwright 1.58.2. | 5 | F-5-2; unlisted claim |
| They cover demo isolation, cues, downloads, phone and desktop layouts, accessibility, and offline reload. | 14 | F-5-2; unlisted claim |
| Claim checks are mapped in `.factory/claims.json`. | 6 | Pass; repository contract test confirms unique mappings |
| `npm run build` writes static files to `dist/`, with `dist/index.html` at its root. | 13 | Pass; `static-deployment` |
| No backend or environment variable is required. | 7 | Pass; `static-deployment` |
| Deploy | 1 | Pass; heading |
| Build `dist/` and deploy it as a static site with `public/staticwebapp.config.json` at the site root. | 15 | Pass; deployment instruction |
| The factory deployment uses this file for routes, security headers, caching, and the designed 404 page. | 16 | F-5-3; unlisted claim |
| Project notes | 2 | Pass; heading |
| The researched scope is in `.factory/brief.json`. | 6 | Pass; direct file reference |
| The visual system and how the artwork was made are in `.factory/design.md`. | 12 | Pass; direct file reference |
| Verification details are in `.factory/handoff.md`. | 5 | Pass; direct file reference |
| Licensed under the MIT License. | 5 | Pass; `LICENSE` exists and contains MIT terms |

### Terminology

| Concept | Public term | Result |
| --- | --- | --- |
| One track-and-cues workspace | set | Consistent |
| Imported media | track; “audio file” only for format guidance | Consistent |
| Portable timing file | cue file | Consistent |
| Visual modes | Contour, Orbit, Shards | Consistent |
| Browser video output | rehearsal recording | Consistent |
| Isolated sample mode | demo | Consistent |

All landing actions use verbs that name the result. Navigation links use destination names, as expected.

## Demo, sandbox, privacy, and offline checks

- One click on **Try it with sample data** opened `/?demo=1` with “Neon classroom rehearsal,” `sample-beacon-rhythm.wav`, a 12-second duration, five populated cues, the scene canvas, transport, and recording action already visible.
- The persistent banner said “Demo — sample data, nothing is saved” and kept **Reset demo** and **Start for real** visible. At the fifth cue on a 390×844 screen, the sticky banner remained at y=64–149.
- After title and cue edits, **Reset demo** restored the original title, first note, and all five cues. Reload also discarded a second edit.
- A complete real IndexedDB sentinel, including audio bytes and cue data, was identical before and after demo edit, reset, reload, and exit.
- A live full workflow imported and played a real WAV, marked and edited a cue, exported it, played and edited the demo, exported it, reset, exited, and reloaded offline. All 38 requests were same-origin or local `blob:` requests. There were no console or page errors.
- After the service worker was ready and the browser went offline, the live real set reopened with its track and the “Offline and ready” banner.
- F-5-1 records the one remaining untested privacy statement; the observed product behavior itself passed.

## Declared claim results

The repository was cloned with `git clone --no-local` to `/tmp/cuebook-review5-bUi5Me/repo`, followed by `npm ci`. Every exact command in `.factory/claims.json` was run separately.

| Claim id | Exact command | Result |
| --- | --- | --- |
| `cue-workflow` | `npm run test:e2e -- --grep @claim:cue-workflow` | PASS, 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 1 test |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | PASS, 1 test |
| `json-no-audio` | `npm run test:e2e -- --grep @claim:json-no-audio` | PASS, 1 test |
| `cue-capacity` | `npm run test:e2e -- --grep @claim:cue-capacity` | PASS, 1 test |
| `rehearsal-recording` | `npm run test:e2e -- --grep @claim:rehearsal-recording` | PASS, 1 test |
| `three-scenes` | `npm run test:e2e -- --grep @claim:three-scenes` | PASS, 1 test |
| `deterministic-scenes` | `npm run test:e2e -- --grep @claim:deterministic-scenes` | PASS, 1 test |
| `pwa-install` | `npm run test:e2e -- --grep @claim:pwa-install` | PASS, 1 test |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS, 1 test |
| `no-tracking-runtime` | `npm run test:e2e -- --grep @claim:no-tracking-runtime` | PASS, 1 test |
| `free-access` | `npm run test:e2e -- --grep @claim:free-access` | PASS, 1 test |
| `beat-grid` | `npm run test:e2e -- --grep @claim:beat-grid` | PASS, 1 test |
| `accessibility-in-free` | `npm run test:e2e -- --grep @claim:accessibility-in-free` | PASS, 1 test |
| `static-deployment` | `npm run test:e2e -- --grep @claim:static-deployment` | PASS, 1 test |
| `delete-local-set` | `npm run test:e2e -- --grep @claim:delete-local-set` | PASS, 1 test |
| `no-accounts` | `npm run test:e2e -- --grep @claim:no-accounts` | PASS, 1 test |
| `node-20-build` | `npm run test:e2e -- --grep @claim:node-20-build` | PASS, 1 test |
| `content-ownership` | `npm run test:e2e -- --grep @claim:content-ownership` | PASS, 1 test |

F-5-1, F-5-2, and F-5-3 identify the unlisted claim-like sentences found by the cross-check. No declared claim test failed.

## Structure, links, accessibility, and identity

- PASS: home, Privacy, Terms, offline setup, and the designed 404 use correct route titles, descriptions, canonical and social metadata, favicons, one visible focused h1, and shared header/main/footer structure. F-5-4 records the demo exception.
- PASS: `/unknown/nested`, `/demo/nope`, `/demo-extra`, and `/demonstration` return the designed HTTP 404. `/demo`, `/demo/`, and `/?demo=1` open the isolated demo.
- PASS: every crawled same-origin navigation link returns 200. `mailto:` and current-page fragment links are explicit. Home → demo → browser Back restores the URL, title, announcement, and h1 focus; F-5-4 records that the demo target is visually clipped.
- PASS: live Axe scans report zero violations on home, both demo entries, Privacy, Terms, offline setup, and 404. The 390 px routes have no horizontal overflow or visible interactive target below 44×44 px.
- PASS: reduced-motion mode removes animation and reduces transitions to `0.00001s`. Live pages have no product console error.
- PASS: CSP, privacy/security headers, immutable asset caching, manifest, icons, robots, sitemap, and service worker are served. Initial JavaScript is 39.38 kB raw and 12.27 kB gzip.
- PASS: all 25 deployed runtime files match the clean `dist/` build. `staticwebapp.config.json` is correctly consumed by the host and is not publicly served.
- PASS: the dark rehearsal surface, glass timing landscape, lime cue beacons, cyan trace, cue rail, and deterministic canvas are distinct and follow `.factory/design.md`. This is not a generic SaaS template.

## Earlier finding verification

Every earlier `.factory/review-*.md`, `.factory/polish-*.md`, and the prior handoff was read. Each earlier finding was rechecked against the matching live build and current source/tests. No earlier finding is reopened.

### Review 1

| Earlier id | Round 5 status | Current verification |
| --- | --- | --- |
| F-1-1 | Fixed | Demo state is memory-only; the complete real IndexedDB sentinel survived edit/reset/reload/exit unchanged. |
| F-1-2 | Fixed | The 12-second sample has non-zero PCM energy and audible cue tones under `demo-sandbox`. |
| F-1-3 | Fixed | The banner and both exit/reset actions remain sticky through the last phone cue. |
| F-1-4 | Fixed | Invalid demo-like paths return the designed HTTP 404. |
| F-1-5 | Fixed | Landing includes preview, three steps, privacy/limits, and no paid tier to disclose. |
| F-1-6 | Fixed | All public routes retain complete metadata and icons. |
| F-1-7 | Fixed | Legal, offline, and 404 routes retain shared header/footer/skip structure. |
| F-1-8 | Fixed | Route navigation and Back focus and announce the h1. F-5-4 is a new visible-heading issue, not loss of focus. |
| F-1-9 | Fixed | Live Axe reports zero violations. |
| F-1-10 | Fixed | All measured visible phone controls are at least 44×44 px. |
| F-1-11 | Fixed | **Record rehearsal** remains visibly labelled on phones. |
| F-1-12 | Fixed | The unsupported “every cue lands on time” guarantee remains absent. |
| F-1-13 | Fixed | Unlimited wording remains absent; more-than-five behavior is tested. |
| F-1-14 | Fixed | Price and subscription sales claims remain absent. |
| F-1-15 | Fixed | Checkout, merchant, verification, and refund copy remains absent. |
| F-1-16 | Fixed | Public copy uses browser/device language instead of IndexedDB jargon. |
| F-1-17 | Fixed | BPM/offset output is plain and tested by `beat-grid`. |
| F-1-18 | Fixed | Contour, Orbit, and Shards remain the only public scene names. |
| F-1-19 | Fixed | Both privacy claims exercise the complete real/demo/offline flow; the live flow was also repeated. |
| F-1-20 | Fixed | Live invalid-file guidance says “Choose an audio file your browser can play.” |
| F-1-21 | Fixed | `static-deployment` builds and serves the core app without backend or environment configuration. |
| F-1-22 | Fixed | Provider-id and secret statements remain absent. |
| F-1-23 | Fixed | README opens with the audience and job in direct words. |
| F-1-24 | Fixed | No README sentence exceeds 22 words. |
| F-1-25 | Fixed | PWA jargon remains absent from user copy. |
| F-1-26 | Fixed | Recording copy names the observable limitation and recovery choices. |
| F-1-27 | Fixed | The browser-suite prose is short; F-5-2 is a new claim-map issue. |
| F-1-28 | Fixed | Artwork caption describes cue-trigger behavior. |
| F-1-29 | Fixed | The obsolete paid-dialog heading remains absent. |
| F-1-30 | Fixed | The obsolete Plus action remains absent. |
| F-1-31 | Fixed | The obsolete license-verification action remains absent. |
| F-1-32 | Fixed | Demo result and storage effect remain adjacent to the first action. |
| F-1-33 | Fixed | The import action consistently says **Import a cue file**. |
| F-1-34 | Fixed | Cue-file terminology remains consistent. |
| F-1-35 | Fixed | “Set” consistently names the track-and-cues workspace. |
| F-1-36 | Fixed | “Track” consistently names imported media. |
| F-1-37 | Fixed | The designed 404 h1 remains “Page not found.” |

### Review 2

| Earlier id | Round 5 status | Current verification |
| --- | --- | --- |
| F-2-1 | Fixed | Offline setup has valid same-origin styling, metadata, recovery copy, shared structure, and no console error. |
| F-2-2 | Fixed | Legal-page brand, email, navigation, and footer targets meet 44 px sizing. |
| F-2-3 | Fixed | The removed paid-price surface remains absent. |
| F-2-4 | Fixed | Refund and revocation sales copy remains absent. |
| F-2-5 | Fixed | `beat-grid` changes displayed beats without moving cue time. |
| F-2-6 | Fixed | Scene names remain normalized. |
| F-2-7 | Fixed | The noun-only Plus header button remains absent. |
| F-2-8 | Fixed | Product copy uses “cue file,” not “Cue JSON.” |
| F-2-9 | Fixed | Imported media remains “track.” |
| F-2-10 | Fixed | Unsupported gateway rate-limit copy remains absent. |
| F-2-11 | Fixed | Named keyboard and screen-reader behavior is tested and free. |
| F-2-12 | Fixed | Recording promises only tested browser capability; the WebM test checks video and audio tracks. |
| F-2-13 | Fixed | The obsolete one-day license-cache statement remains absent. |
| F-2-14 | Fixed | The obsolete allowance-replenishment statement remains absent. |
| F-2-15 | Fixed | Demo title and social metadata identify the demo. F-5-4 concerns the separate standard description and visible h1. |
| F-2-16 | Fixed | Preview copy matches the visible time, scene, and note rows. |
| F-2-17 | Fixed | The editor heading remains “Add the next cue.” |
| F-2-18 | Fixed | The destructive action remains “Start a new set,” and deletion is tested. |

### Review 3

| Earlier id | Round 5 status | Current verification |
| --- | --- | --- |
| F-1-19 | Fixed | Complete privacy request coverage remains in both tagged tests and passed live. |
| F-3-1 | Fixed | `demo-sandbox` states and asserts the 12-second duration. |
| F-3-2 | Fixed | `deterministic-scenes` crosses cue boundaries and verifies repeated scenes and frames. |
| F-3-3 | Fixed | Recording verification checks non-trivial WebM bytes plus video and audio tracks. |
| F-3-4 | Fixed | Demo save state consistently says changes reset on reload. |
| F-3-5 | Fixed | Real storage is seeded before demo edit/reset/reload/exit and remains unchanged. |
| F-3-6 | Fixed | Home says “Skip to main content”; demo says “Skip to cue editor.” |
| F-3-7 | Fixed | “Sample cue sheet” remains the preview label. |
| F-3-8 | Fixed | README and product consistently call sample mode a demo. |
| F-3-9 | Fixed | Live fallback says to try another browser or export the cue file; “track-audio capture” is absent. |
| F-3-10 | Fixed | README privacy copy remains free of runtime/CDN jargon. |
| F-3-11 | Fixed | README names phone and desktop layouts. |
| F-3-12 | Fixed | README says “security headers,” not CSP. |
| F-3-13 | Fixed | README explains how artwork was made without “provenance.” |

### Review 4

| Earlier id | Round 5 status | Current verification |
| --- | --- | --- |
| F-1-20 | Fixed | Live invalid-file and media errors use browser-playable guidance without named formats. |
| F-3-9 | Fixed | Live recording recovery uses plain language and gives two actions. |
| F-4-1 | Fixed | `delete-local-set` proves the active project and audio blob are removed. F-5-1 concerns a separate browser-control promise. |
| F-4-2 | Fixed | `no-accounts` checks controls, storage names, identity traffic, and cross-origin requests. |
| F-4-3 | Fixed | Demo, Privacy, and Terms remain visible and keyboard-operable in the 390 px app header. |
| F-4-4 | Fixed | Node `>=20` is declared and Node 20.19.5 builds in `node-20-build`. |
| F-4-5 | Fixed | `content-ownership` compares rendered Terms with the legal contract fixture. |

## Repository verification

From the clean clone:

- `npm ci`: PASS; zero reported vulnerabilities.
- `npm test`: PASS, 10/10.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced. Initial app JavaScript is 39.38 kB raw / 12.27 kB gzip.
- `npm run test:e2e`: PASS, 34/34.
- Every one of the 19 exact claim commands: PASS independently.

## Missed leverage

No additional AI, sync, import, or export feature is warranted. The brief asks for deterministic manual cues, local audio, cue-file import/export, and rehearsal-video export; all are present. AI would add network and key handling without improving the precise manual-timing job. Cloud sync would weaken the local-only privacy model.

## What would make this perfect

List and test the site-data deletion, browser-suite, and deployment-config statements, or remove the unsupported prose. Give the demo a visible route-specific h1 and standard description. Then rerun the cold mobile/desktop pass, all 19 exact claim commands, the full live privacy/offline request flow, Axe, route/link crawl, and the complete earlier-finding matrix. A perfect round has zero unlisted claims and no route whose headline is visually clipped.
