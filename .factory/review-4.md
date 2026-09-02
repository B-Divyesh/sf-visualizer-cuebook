# Adversarial first-read review 4 — Cuebook

**Verdict: FAIL**

Reviewed 2 September 2026 against live <https://visualizer-cuebook.sociobot.in> and candidate `d83ddcebee08cb831dbe8e23de28778eebc93a1d`. All 25 deployed public files match a clean production build byte for byte.

There are two blocking reopened findings, four major findings, and one minor finding. All 15 declared claim commands pass independently from a clean clone, but five public claims remain outside `.factory/claims.json`. A PASS requires zero findings and no untested claim.

## Cold first screen

Fresh Chromium contexts opened the live home page at 390×844 and 1440×900. Nothing was scrolled before these answers were recorded.

| Question | Answer from the first screen | Result |
| --- | --- | --- |
| What does this do? | It builds repeatable visual-scene cues against a track. | Clear from “Build repeatable visual cues for your track.” |
| For whom? | DJs, VJs, and educators rehearsing scene changes. | Explicit in the next sentence. |
| What should I select first? | “Try it with sample data.” | Clear and visually primary. The adjacent copy says it opens a 12-second rehearsal and leaves the saved set unchanged. |

The first screen passes at both widths. At 390 px, it also shows the real first step and all three privacy, offline, and cost facts. Evidence: `evidence/review-4/home-mobile.png` and `home-desktop.png`.

## Findings

### Blocking

#### F-1-20 — Reopened: untested audio formats are still recommended

- **Exact quote/location:** live invalid-file error, “Choose an audio file such as MP3, WAV, M4A, or OGG.” Source: `src/main.ts:278-280`. The media error also says, “Try MP3, WAV, or M4A.”
- **Evidence:** `.factory/claims.json` has no format-support claim. Tests import generated WAV only. On the live 390 px page, selecting `notes.txt` displayed the quoted recommendation. Review 1 required named formats to be tested or replaced with “Choose an audio file your browser can play.” The README was corrected, but the same unsupported recommendation remains in product errors.
- **Why this fails:** a visitor is told to try formats that the tested browser matrix does not prove. This is a half-fix of the earlier finding, so the history rule makes it blocking again.
- **Concrete fix:** use “Choose an audio file your browser can play” in both format errors, or add original MP3, WAV, M4A, and OGG fixtures and claim tests in every supported browser.

#### F-3-9 — Reopened: the recording recovery still uses browser jargon

- **Exact quote/location:** live demo recording fallback, “This browser cannot capture track audio. Use a browser that supports track-audio capture.” Source: `src/main.ts:725-750`; test: `tests/e2e/cuebook.spec.ts:608-610`.
- **Evidence:** the live fallback displays the exact phrase “track-audio capture.” The claim test now requires that phrase. Review 3 rejected it as jargon. Polish 3 changed the README but left the product recovery message and locked it into the test.
- **Why this fails:** a DJ, VJ, or educator cannot act on an implementation term that does not name a browser or a usable fallback. This is a half-fix of the earlier finding, so it is blocking again.
- **Concrete fix:** write “This browser cannot include the track in a recording. Try another browser, or export the cue file instead.” Update the recovery assertion to check those two actions.

### Major

#### F-4-1 — The local-deletion privacy claim is unlisted and untested

- **Exact quote/location:** live `/privacy/`, “Use Start a new set to delete the active track and set.”
- **Evidence:** no entry in `.factory/claims.json` states that **Start a new set** deletes the IndexedDB project and audio blob. None of the tagged claim tests confirms deletion from storage.
- **Why this fails:** this is a privacy control a visitor may rely on when removing a local track. Rendering the button does not prove the data is gone.
- **Concrete fix:** add a `delete-local-set` claim. Seed a complete project, accept **Start a new set**, assert the `current` IndexedDB record and blob are absent, reload, and confirm the empty first-use screen.

#### F-4-2 — “No accounts” is an unlisted privacy claim

- **Exact quote/location:** live `/privacy/`, “Cuebook has no accounts and does not upload your creative work.”
- **Evidence:** `local-privacy` tests uploads and `static-deployment` tests the static build, but no claim entry states or tests the account assertion.
- **Why this fails:** account creation changes the privacy model and is a statement a visitor can rely on.
- **Concrete fix:** add `no-accounts` to `.factory/claims.json` with a static/runtime test for no sign-in, identity endpoint, credential storage, or auth request; alternatively remove “has no accounts.”

#### F-4-3 — The phone header removes navigation on the product routes

- **Exact location:** live `/` and `/demo/` at 390 px; `src/styles.css:189-192`, `.top-nav { display: none; }`.
- **Evidence:** the phone header shows only the Cuebook wordmark. Demo, Privacy, and Terms are absent. The same links remain visible in the phone headers on Privacy, Terms, offline setup, and 404, so the shared header changes by route.
- **Why this fails:** the required consistent header is not present on the two main product routes. Phone users cannot reach Privacy or Terms from the header and receive a different navigation model from legal routes.
- **Concrete fix:** keep a compact visible navigation or add a labelled menu with Demo, Privacy, and Terms. Test visibility, keyboard operation, focus return, and 44 px targets at 390 px on every route.

#### F-4-4 — The README’s Node version promise is unlisted

- **Exact quote/location:** `README.md`, “Node.js 20 or newer is required.”
- **Evidence:** no claim entry runs the build and tests on Node 20 or declares an enforced package engine. This review ran Node 22.23.2 only.
- **Why this fails:** a contributor may choose Node 20 based on the statement, but the sandbox does not verify the stated lower bound.
- **Concrete fix:** add `"engines": {"node": ">=20"}` and a `node-20-build` claim executed in Node 20, or replace the sentence with the exact tested runtime version.

### Minor

#### F-4-5 — The ownership statement is not tied to a testable contract source

- **Exact quote/location:** live `/terms/`, “Cuebook does not distribute, license, or claim ownership of your files or cue sheet.”
- **Evidence:** no claims entry or checked-in legal contract fixture covers this statement.
- **Why this fails:** this is a legal promise a visitor may rely on, but it can drift independently of the source of truth.
- **Concrete fix:** add a checked-in legal-contract fixture and a static claim test that compares the rendered Terms text to it, or remove the unsupported sentence.

## Copy audit

Counts use whitespace-delimited words and treat hyphenated terms as one word. Navigation labels, headings, actions, facts, alt text, and fallback copy are included because they affect a first read. No unit exceeds 22 words, uses a banned marketing adjective, changes the established terms, or uses a non-result action. The two product-error defects are recorded as F-1-20 and F-3-9 because those errors are outside the landing/README tables.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| Cuebook | 1 | Pass; wordmark |
| Demo / Privacy / Terms | 1 each | Pass; destinations |
| Saved locally | 2 | Pass; `local-privacy` |
| Private visual rehearsal | 3 | Pass; product category |
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
| Five lime cue beacons positioned across an abstract glass rehearsal timeline | 11 | Pass; purposeful alt text |
| Five saved cues trigger repeatable scene changes. | 7 | Pass; `deterministic-scenes` |
| Sample cue sheet | 3 | Pass; section label |
| See the cue sheet before you import | 7 | Pass; heading names the section |
| Each cue lists its time, scene, and note before you import a track. | 13 | Pass; matches the visible preview |
| Opening contour / Break into shards / Closing horizon | 2 / 3 / 2 | Pass; sample notes |
| How it works | 3 | Pass |
| Rehearse a scene change in three steps | 7 | Pass |
| Choose a track | 3 | Pass |
| Keep it in this browser. | 5 | Pass; `local-privacy` |
| Mark each change | 3 | Pass |
| Pick a scene at the playhead. | 6 | Pass; `cue-workflow` |
| Play it again | 3 | Pass |
| Check the same run before you perform. | 7 | Pass; `deterministic-scenes` |
| Privacy and limits | 3 | Pass |
| What Cuebook keeps on this device | 6 | Pass |
| Your track and set stay in this browser. | 8 | Pass; `local-privacy` |
| Beat numbers use the BPM and offset you enter. | 9 | Pass; `beat-grid` |
| Export a cue file to keep a copy. | 8 | Pass; `cue-workflow` |
| Read the privacy details | 4 | Pass; result-naming link |
| Cuebook keeps one track and its cues in this browser. | 10 | Pass; `local-privacy` |
| Built by Param Factory · v1.0.9 | 6 | Pass; credit and build id |
| Cuebook needs JavaScript to load a local track and render rehearsals. | 11 | Pass; no-script fallback |
| Your track never leaves this device. | 6 | Pass; `local-privacy` |

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Cuebook | 1 | Pass; title |
| Cuebook helps DJs, VJs, and educators rehearse visual changes against their own tracks. | 13 | Pass |
| Try the demo with sample data: `https://visualizer-cuebook.sociobot.in/?demo=1`. | 7 | Pass |
| It opens a 12-second rhythm with five editable cues. | 9 | Pass; `demo-sandbox` |
| Your saved set stays unchanged. | 5 | Pass; `demo-sandbox` |
| What it does | 3 | Pass; heading |
| Keeps one track and its set in this browser. | 9 | Pass; `local-privacy` |
| Marks each cue at the current playback time. | 8 | Pass; `cue-workflow` |
| Shows beat numbers from the BPM and offset you enter. | 10 | Pass; `beat-grid` |
| Replays Contour, Orbit, and Shards at the same track time. | 10 | Pass; `deterministic-scenes` |
| Imports and exports a Cuebook cue file. | 7 | Pass; `cue-workflow` |
| Audio is not included. | 4 | Pass; `json-no-audio` |
| Installs on your device and reopens a saved set offline. | 10 | Pass; `pwa-install`, `offline-reload` |
| Keeps cue sheets with more than five cues. | 8 | Pass; `cue-capacity` |
| Records a rehearsal when your browser can include the track audio. | 11 | Pass; `rehearsal-recording` |
| Tracks are not uploaded. | 4 | Pass; `local-privacy` |
| Cuebook has no analytics or trackers. | 6 | Pass; `no-tracking-runtime` |
| It loads no scripts or fonts from other sites. | 9 | Pass; `no-tracking-runtime` |
| Choose an audio file your browser can play. | 8 | Pass; guidance, but see F-1-20 for contradictory product errors |
| Every current rehearsal tool is available without charge. | 8 | Pass; `free-access` |
| See privacy and terms. | 4 | Pass |
| Run locally | 2 | Pass; heading |
| Node.js 20 or newer is required. | 6 | F-4-4 |
| Open the local URL Vite prints. | 6 | Pass |
| Keyboard controls outside form fields: | 5 | Pass |
| Space: play or pause | 4 | Pass |
| M: mark a cue at the current playback time | 9 | Pass |
| Left / Right: nudge the playhead by one second | 9 | Pass |
| Test and build | 3 | Pass; heading |
| Browser tests use Playwright 1.58.2. | 5 | Pass; package pin matches |
| They cover demo isolation, cues, downloads, phone and desktop layouts, accessibility, and offline reload. | 14 | Pass; suite contents confirmed |
| Claim checks are mapped in `.factory/claims.json`. | 6 | Pass |
| `npm run build` writes static files to `dist/`, with `dist/index.html` at its root. | 13 | Pass; `static-deployment` |
| No backend or environment variable is required. | 7 | Pass; `static-deployment` |
| Deploy | 1 | Pass; heading |
| Build `dist/` and deploy it as a static site with `public/staticwebapp.config.json` at the site root. | 15 | Pass |
| The factory deployment uses this file for routes, security headers, caching, and the designed 404 page. | 16 | Pass |
| Project notes | 2 | Pass; heading |
| The researched scope is in `.factory/brief.json`. | 6 | Pass |
| The visual system and how the artwork was made are in `.factory/design.md`. | 12 | Pass |
| Verification details are in `.factory/handoff.md`. | 5 | Pass |
| Licensed under the MIT License. | 5 | Pass |

### Terminology

| Concept | Public term | Result |
| --- | --- | --- |
| One track-and-cues workspace | set | Consistent |
| Imported media | track; audio file only for format/capture | Consistent |
| Portable timing file | cue file | Consistent |
| Scenes | Contour, Orbit, Shards | Consistent |
| Browser video output | rehearsal recording | Consistent except F-3-9’s recovery jargon |
| Isolated sample mode | demo | Consistent |

## Demo, sandbox, privacy, and offline checks

- One click on **Try it with sample data** opens `/?demo=1` with “Neon classroom rehearsal,” a 12-second local rhythm, five populated cues, the canvas, transport, and recording action already visible.
- The persistent banner says “Demo — sample data, nothing is saved” and keeps **Reset demo** and **Start for real** visible. Reset restored the title and all five cues after an edit.
- Play advanced from `0:00.000` to `0:00.709` on mobile and `0:00.677` on desktop during the sampled interval.
- The clean-clone `demo-sandbox` test seeds and snapshots a complete real IndexedDB project before demo edit, reset, reload, and exit. The real project remains byte-for-byte unchanged.
- The clean-clone `local-privacy` and `no-tracking-runtime` tests cover real import/play/edit/export and demo play/edit/export/reset/exit/offline reload. The live cold/demo request log contains only the product origin and local `blob:` media URLs.
- The saved real workspace and demo both reload offline in dedicated contexts. Claim tests use independent contexts and do not close a shared browser.

## Declared claim results

The repository was cloned with `git clone --no-local` to `/tmp/cuebook-review4-B1lLRx/repo`, followed by `npm ci`. Every exact command in `.factory/claims.json` was run independently from that clone after clearing a stale preview-process artifact. The full `npm run test:claims` run also passed 15/15.

| Claim id | Exact command | Result |
| --- | --- | --- |
| `cue-workflow` | `npm run test:e2e -- --grep @claim:cue-workflow` | PASS, 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 1 test |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | PASS, 1 test |
| `json-no-audio` | `npm run test:e2e -- --grep @claim:json-no-audio` | PASS, 1 test |
| `cue-capacity` | `npm run test:e2e -- --grep @claim:cue-capacity` | PASS, 1 test |
| `rehearsal-recording` | `npm run test:e2e -- --grep @claim:rehearsal-recording` | PASS, 1 test; copy defect in F-3-9 |
| `three-scenes` | `npm run test:e2e -- --grep @claim:three-scenes` | PASS, 1 test |
| `deterministic-scenes` | `npm run test:e2e -- --grep @claim:deterministic-scenes` | PASS, 1 test |
| `pwa-install` | `npm run test:e2e -- --grep @claim:pwa-install` | PASS, 1 test |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS, 1 test |
| `no-tracking-runtime` | `npm run test:e2e -- --grep @claim:no-tracking-runtime` | PASS, 1 test |
| `free-access` | `npm run test:e2e -- --grep @claim:free-access` | PASS, 1 test |
| `beat-grid` | `npm run test:e2e -- --grep @claim:beat-grid` | PASS, 1 test |
| `accessibility-in-free` | `npm run test:e2e -- --grep @claim:accessibility-in-free` | PASS, 1 test |
| `static-deployment` | `npm run test:e2e -- --grep @claim:static-deployment` | PASS, 1 test |

F-1-20, F-4-1, F-4-2, F-4-4, and F-4-5 identify public statements that have no claims entry.

## Structure, links, accessibility, and identity

- PASS: `/`, `/demo/`, `/privacy/`, `/terms/`, `/offline.html`, and the designed 404 have route-specific titles, one h1, descriptions, canonicals, Open Graph/Twitter metadata, favicons, apple-touch metadata, skip links, footers, and build id.
- PASS: `/demo/nope`, `/demo-extra`, `/demonstration`, and unrelated unknown paths return the designed HTTP 404. `/demo`, `/demo/`, and `/?demo=1` open the demo.
- PASS: all crawled same-origin page links return 200; `mailto:` and in-page fragment links are explicit. F-4-3 records the phone-header consistency failure.
- PASS: direct loads focus each route h1. Home → demo → browser Back restores the home title, URL, and h1 focus.
- PASS: Axe reports zero violations on live home, demo, Privacy, Terms, offline setup, and 404. Live verifier runs found one h1, `lang=en`, a main landmark, alt text, labelled buttons, and no console errors.
- PASS: reduced-motion mode collapses transitions to `0.00001s` and removes the hero transform. The 390 px layouts have no horizontal overflow; local tests find no visible target smaller than 44×44 px.
- PASS: the 1200×630 social image, manifest, icons, service worker, robots file, sitemap, security headers, and same-origin font are served. JavaScript is 39.37 kB raw / 12.30 kB gzip.
- PASS: all 25 deployed public files match the clean local `dist/` build by SHA-256.
- PASS: the dark rehearsal surface, cue beacons, cyan time trace, glass landscape, cue rail, and deterministic scene canvas are product-specific and match `.factory/design.md`; this is not a generic SaaS template.

## Earlier finding verification

Every earlier review and polish report was read. Each earlier finding was checked against the live site and current source/tests.

### Review 1

| Earlier id | Round 4 status | Verification |
| --- | --- | --- |
| F-1-1 | Fixed | Demo storage stays in memory; complete real IndexedDB snapshot survives edit/reset/reload/exit. |
| F-1-2 | Fixed | Sample PCM has non-zero energy and live playback is audible/advancing. |
| F-1-3 | Fixed | Sticky demo controls remain available through the mobile cue list. |
| F-1-4 | Fixed | Invalid demo-like paths return the designed 404. |
| F-1-5 | Fixed | Landing has preview, three steps, privacy/limits, and no paid tier to disclose. |
| F-1-6 | Fixed | Route metadata and icon assets are complete. |
| F-1-7 | Fixed | Legal/offline/404 routes have shared landmarks and footer. F-4-3 is a new cross-route phone-header issue. |
| F-1-8 | Fixed | Direct navigation and Back focus the destination h1 and app routes announce. |
| F-1-9 | Fixed | Live Axe scans report zero violations. |
| F-1-10 | Fixed | Tested visible mobile targets meet 44×44 px. |
| F-1-11 | Fixed | Record rehearsal remains visibly labelled on mobile. |
| F-1-12 | Fixed | The untested “every cue lands on time” wording is absent. |
| F-1-13 | Fixed | Unlimited-cue wording is absent; more-than-five behavior is tested. |
| F-1-14 | Fixed | Price and subscription claims are absent. |
| F-1-15 | Fixed | Checkout, merchant, refund, and verification claims are absent. |
| F-1-16 | Fixed | Public copy uses browser/device wording, not IndexedDB jargon. |
| F-1-17 | Fixed | Beat output is plain and mapped to `beat-grid`. |
| F-1-18 | Fixed | Contour, Orbit, and Shards are the only public scene names. |
| F-1-19 | Fixed | Full real/demo/offline request flows now run in both privacy claim tests. |
| F-1-20 | **Reopened — BLOCKING** | Named untested formats remain in live product errors. |
| F-1-21 | Fixed | `static-deployment` builds and runs without backend/environment configuration. |
| F-1-22 | Fixed | Provider-id and secret statements are absent. |
| F-1-23 | Fixed | README opens with audience and job in plain words. |
| F-1-24 | Fixed | No README sentence exceeds 22 words. |
| F-1-25 | Fixed | PWA jargon is absent from user copy. |
| F-1-26 | Fixed | Browser API names are absent from user copy; F-3-9 covers the remaining capability jargon. |
| F-1-27 | Fixed | Browser-test description is short and scannable. |
| F-1-28 | Fixed | Artwork caption describes tested cue behavior. |
| F-1-29 | Fixed | Obsolete paid dialog is absent. |
| F-1-30 | Fixed | Obsolete Plus action is absent. |
| F-1-31 | Fixed | Obsolete license action is absent. |
| F-1-32 | Fixed | The first-screen demo result and storage effect are adjacent to the action. |
| F-1-33 | Fixed | First-screen import action says “Import a cue file.” |
| F-1-34 | Fixed | Cue-file terminology is consistent. |
| F-1-35 | Fixed | `set` consistently names the workspace. |
| F-1-36 | Fixed | `track` consistently names imported media. |
| F-1-37 | Fixed | The designed 404 says “Page not found.” |

### Review 2

| Earlier id | Round 4 status | Verification |
| --- | --- | --- |
| F-2-1 | Fixed | Offline setup has valid CSP, metadata, design, recovery copy, header, and footer. |
| F-2-2 | Fixed | Legal links and brand meet touch-target checks. |
| F-2-3 | Fixed | Paid price surface is absent. |
| F-2-4 | Fixed | Refund and revocation surface is absent. |
| F-2-5 | Fixed | `beat-grid` tests displayed beat changes and retained cue time. |
| F-2-6 | Fixed | Scene names are normalized. |
| F-2-7 | Fixed | Plus header action is absent. |
| F-2-8 | Fixed | Product uses `cue file`, not “Cue JSON.” |
| F-2-9 | Fixed | Imported item is consistently a track. |
| F-2-10 | Fixed | External rate-limit claim is absent. |
| F-2-11 | Fixed | Vague accessibility marketing is absent; named controls are tested. |
| F-2-12 | Fixed | Firefox is not promised. |
| F-2-13 | Fixed | License-cache claim is absent. |
| F-2-14 | Fixed | Replenishment claim is absent. |
| F-2-15 | Fixed | Demo social metadata identifies the demo route. |
| F-2-16 | Fixed | Preview copy matches its time, scene, and note rows. |
| F-2-17 | Fixed | Editor heading is “Add the next cue.” |
| F-2-18 | Fixed | Destructive action is “Start a new set.” F-4-1 concerns its unlisted deletion guarantee. |

### Review 3

| Earlier id | Round 4 status | Verification |
| --- | --- | --- |
| F-1-19 | Fixed | Privacy request tests now perform the complete declared real/demo/offline flow. |
| F-3-1 | Fixed | `demo-sandbox` states and asserts the 12-second duration. |
| F-3-2 | Fixed | `deterministic-scenes` plays across cue boundaries and verifies recurrent scenes/frames. |
| F-3-3 | Fixed | Recording test reads WebM bytes and verifies video and audio tracks. |
| F-3-4 | Fixed | Demo header consistently says changes reset on reload. |
| F-3-5 | Fixed | Real project is seeded before the complete demo isolation sequence. |
| F-3-6 | Fixed | Home skip link says “Skip to main content”; demo says “Skip to cue editor.” |
| F-3-7 | Fixed | Context-free “Preview” is now “Sample cue sheet.” |
| F-3-8 | Fixed | README consistently calls the sample mode a demo. |
| F-3-9 | **Reopened — BLOCKING** | Live recording recovery and its test still use “track-audio capture.” |
| F-3-10 | Fixed | README privacy copy is plain and direct. |
| F-3-11 | Fixed | README names phone and desktop layouts. |
| F-3-12 | Fixed | README says “security headers,” not CSP. |
| F-3-13 | Fixed | README explains how artwork was made without “provenance.” |

## Repository verification

From the clean clone:

- `npm test`: PASS, 10/10.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm run test:e2e`: PASS, 28/28.
- `npm run test:claims`: PASS, 15/15.
- Every exact claim command: PASS, one uniquely tagged test each.
- `npm ci`: zero reported vulnerabilities.

## Missed leverage

No additional AI, sync, import, or export feature is warranted. The brief calls for deterministic manual cues, local audio, cue-file import/export, and rehearsal-video export; all are present. Cloud sync would weaken the stated local-only model. AI would add network/key handling without improving the precise manual-timing job.

## What would make this perfect

Close F-1-20 and F-3-9 across every product surface, list and test the four currently unlisted claims, and give the app routes the same usable phone header as the legal routes. Then rerun the cold mobile/desktop review, every exact claim command, live crawl, request log, offline flow, and earlier-finding matrix. A perfect round has no unsupported format recommendation, no browser jargon, no unlisted statement, and no route-specific navigation regression.
