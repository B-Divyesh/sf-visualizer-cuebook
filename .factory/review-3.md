# Adversarial first-read review 3 — Cuebook

**Verdict: FAIL**

Reviewed 2 September 2026 against live <https://visualizer-cuebook.sociobot.in> and source revision `a36b949949b45df9e35f68d8efbf46f50e64590b`. All 25 public build files match the local production build byte-for-byte.

There is one blocking finding, five major findings, and eight minor findings. All 15 declared claim commands pass, but one earlier claim-coverage finding is only partly fixed, two public claims lack complete claim tests, one quantitative claim is not listed, and the copy audit has unresolved flags. A PASS requires zero findings and no untested claim.

## Cold first screen

I opened fresh Chromium contexts at 390×844 and 1440×900 without scrolling or restoring browser data.

| Question | Mobile answer | Desktop answer | Result |
| --- | --- | --- | --- |
| What does this do? | It builds repeatable visual-scene cues against a track. | Same; the cue-beacon illustration also suggests timed scene changes. | Clear from “Build repeatable visual cues for your track.” |
| For whom? | DJs, VJs, and educators. | DJs, VJs, and educators. | Explicit in the sentence below the headline. |
| What should I select first? | “Try it with sample data.” | “Try it with sample data.” | Clear; it is the first and visually primary action. |

At 390 px, the first screen also shows what the demo opens and all three privacy/offline/cost facts. The clarity check passes at both widths.

## Findings

### Blocking

#### F-1-19 — Reopened: the privacy request test still does not cover the claimed workflow

- **Location/quote:** `.factory/claims.json`, `local-privacy`: “records all requests during sample playback, editing, export, reset, and exit”; `no-tracking-runtime`: “record requests through home and demo flows and inspect built HTML/CSS/JS origins.”
- **Evidence:** `tests/e2e/cuebook.spec.ts:322-329` opens the demo and selects Orbit. It does not play audio, edit a cue, export, reset, exit, or import a real track. The broader test at lines 406-415 opens home and demo, exports, and resets, but still omits track import, playback, editing, exit, and offline reload. This is less coverage than the concrete repair required by F-1-19. The commands pass because the omitted actions never run.
- **Why this fails:** “Tracks are not uploaded” and the broader no-tracking statement remain without the complete automated request evidence promised by the claim sandbox. This earlier finding is half-fixed, so the history rule makes it blocking again under its original id.
- **Concrete fix:** Expand the tagged privacy test in a fresh context. Import a generated track on the real path, play it, mark and edit a cue, export, enter the demo, play and edit it, export, reset, exit, prime offline mode, and reload. Record the whole request log and assert that every non-`blob:` request is same-origin. Inspect built HTML, CSS, and JavaScript for runtime origins. Keep exactly one tagged test per claim id.

### Major

#### F-3-1 — The 12-second demo claim is not listed

- **Location/quote:** landing, “Opens a 12-second rehearsal with five editable cues.”; README line 7, “It opens a 12-second rhythm with five editable cues.”
- **Evidence:** `.factory/claims.json` contains no claim that states the 12-second duration. `@claim:demo-sandbox` checks the title, cue count, and non-zero audio energy, but not `#track-duration`. `@claim:json-no-audio` incidentally expects duration metadata, but its declared claim is only about excluding audio bytes.
- **Why this fails:** The duration is a quantitative promise with no matching claim entry and test.
- **Concrete fix:** Extend the `demo-sandbox` claim text to include the 12-second duration and assert the displayed `0:12.000` duration in that tagged test, or remove “12-second” from both sentences.

#### F-3-2 — The landing claim that cues trigger scene changes is not tested

- **Location/quote:** landing figure caption, “Five saved cues trigger repeatable scene changes.”
- **Evidence:** `@claim:demo-sandbox` counts five cues and checks audio energy but never plays across a cue. `@claim:deterministic-scenes` compares one canvas frame before and after seeking away; it does not assert that a saved cue changes the scene at its time.
- **Why this fails:** Five inert rows and a deterministic canvas could pass both tests without any cue triggering a scene change.
- **Concrete fix:** Add the behavior to a claim entry. Play the sample across at least two cue boundaries, assert the scene and cue label change at the saved times, return to the same times in a second run, and assert the same scenes recur. If timing is stated, include a measured tolerance.

#### F-3-3 — The recording claim test validates only the filename

- **Location/quote:** README line 18, “Records rehearsals in browsers that support track-audio capture.”; `.factory/claims.json`, `rehearsal-recording`: “Cuebook saves a WebM rehearsal…”
- **Evidence:** `tests/e2e/cuebook.spec.ts:387-404` waits for a download and checks only that its suggested name ends in `-rehearsal.webm`. It never reads the download, checks a non-trivial byte size, or verifies that the WebM contains video and track audio.
- **Why this fails:** An empty, corrupt, or canvas-only file would satisfy the current assertion even though the exported rehearsal would not do the promised job.
- **Concrete fix:** Read the downloaded file, assert a non-trivial size, and inspect it with a local WebM parser or `ffprobe` fixture to confirm one video stream and one audio stream. Keep the existing unsupported-capture recovery assertion.

#### F-3-4 — Demo mode gives contradictory save messages

- **Location/quote:** live desktop `/demo/`: “Demo — sample data, nothing is saved” and, in the header at the same time, “Saved locally”; source `src/main.ts:19,22`.
- **Evidence:** The live demo initially reports `#save-state` as “Saved locally.” It returns to that text after demo edits even though reload discards them. The real IndexedDB sentinel remained unchanged during independent testing, so this is a copy/state defect rather than an isolation failure.
- **Why this fails:** A first-time visitor cannot tell whether demo edits persist. The two simultaneous statements make opposite claims.
- **Concrete fix:** In demo mode, replace the save status with “Demo changes reset on reload” and never call the demo state “Saved locally.” Keep the existing banner.

#### F-3-5 — The demo isolation test does not perform its declared sequence against existing real data

- **Location/quote:** `.factory/claims.json`, `demo-sandbox`: “seed a real IndexedDB project; exercise demo edit, reset, reload, and exit; assert the real project is unchanged.”
- **Evidence:** `tests/e2e/cuebook.spec.ts:276-301` edits, reloads, and resets the demo before it creates the real set. After creating the real set, it only enters and exits the demo; it does not edit, reset, or reload while the real sentinel exists.
- **Why this fails:** A regression that writes real storage only when editing or resetting a demo over an existing project could pass this test.
- **Concrete fix:** Seed the real project first. Snapshot its title, audio metadata/blob size, timing, and cues. Then enter the demo, edit a cue and title, reset, edit again, reload, exit, and assert the complete real snapshot is unchanged.

### Minor

#### F-3-6 — The landing skip link names a destination that is not present

- **Location/quote:** landing, “Skip to cue editor”; source `index.html:24` targets `#main`.
- **Why this fails:** On a fresh landing page the cue editor is hidden. The link moves focus to the marketing main area, not an editor.
- **Concrete fix:** Use “Skip to main content” on the landing page. “Skip to cue editor” may remain on `/demo/` if its label is set by route.

#### F-3-7 — “Preview” is a context-free decorative label

- **Location/quote:** landing section label, “Preview.”
- **Why this fails:** The word does not say what is being previewed and would fit any product page.
- **Concrete fix:** Remove it or rewrite it as “Sample cue sheet.”

#### F-3-8 — The README changes “demo” to “isolated sample”

- **Location/quote:** README line 5, “Try the isolated sample.”
- **Why this fails:** The same mode is called “demo” in navigation, the URL, the banner, and `.factory/copy-audit.md`’s terminology table.
- **Concrete fix:** “Try the demo with sample data: <https://visualizer-cuebook.sociobot.in/demo/>.”

#### F-3-9 — “Track-audio capture” is browser jargon

- **Location/quote:** README line 18, “Records rehearsals in browsers that support track-audio capture.”
- **Why this fails:** A DJ or educator should not need to know a browser capture capability name to understand the limitation.
- **Concrete fix:** “Records a rehearsal when your browser can include the track audio.”

#### F-3-10 — The README privacy sentence uses unexplained runtime/CDN jargon

- **Location/quote:** README line 20, “Cuebook has no analytics, trackers, third-party runtime scripts, or CDN font requests.”
- **Why this fails:** “Runtime scripts” and “CDN” describe implementation, not the privacy result.
- **Concrete fix:** “Cuebook has no analytics or trackers. It loads no scripts or fonts from other sites.”

#### F-3-11 — “Responsive layout” is avoidable test jargon

- **Location/quote:** README line 54, “They cover demo isolation, cues, downloads, responsive layout, accessibility, and offline reload.”
- **Why this fails:** “Responsive” names an implementation technique rather than the layouts that are checked.
- **Concrete fix:** “They cover demo isolation, cues, downloads, phone and desktop layouts, accessibility, and offline reload.”

#### F-3-12 — “CSP” is an unexplained acronym

- **Location/quote:** README line 68, “The factory deployment uses this configuration for routes, CSP, caching, and the designed 404 page.”
- **Why this fails:** A reader must already know the acronym to use the sentence.
- **Concrete fix:** “The factory deployment uses this file for routes, security headers, caching, and the designed 404 page.”

#### F-3-13 — “Generated-art provenance” is specialist wording

- **Location/quote:** README line 74, “The visual system and generated-art provenance are in `.factory/design.md`.”
- **Why this fails:** “Provenance” obscures the useful information in the linked document.
- **Concrete fix:** “The visual system and how the artwork was made are in `.factory/design.md`.”

## Copy audit

Counts use whitespace-delimited words, ignore punctuation-only separators, and treat hyphenated terms as one word. The tables include headings, actions, navigation labels, alt text, and the no-script fallback; shell commands are not sentences. No sentence exceeds 22 words and no banned marketing adjective appears. “Pass” below means the unit has no separate copy finding; claim-test findings are referenced where applicable.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Skip to cue editor | 4 | F-3-6 |
| Cuebook | 1 | Pass; wordmark |
| Demo / Privacy / Terms | 1 each | Pass; navigation destinations |
| Saved locally | 2 | Pass on the real landing path; F-3-4 in demo mode |
| Private visual rehearsal | 3 | Pass |
| Build repeatable visual cues for your track. | 7 | Pass; behavior maps to `deterministic-scenes` |
| For DJs, VJs, and educators who need repeatable scene changes from their own track. | 14 | Pass |
| Try it with sample data | 5 | Pass; result-naming action |
| Choose your track | 3 | Pass; result-naming action |
| Import a cue file | 4 | Pass; result-naming action |
| Opens a 12-second rehearsal with five editable cues. | 8 | F-3-1 |
| Your saved set stays unchanged. | 5 | Pass; `demo-sandbox` |
| Your track stays in this browser. | 6 | Pass; `local-privacy`, but see F-1-19 |
| Saved sets work offline. | 4 | Pass; `offline-reload` |
| All rehearsal tools are free. | 5 | Pass; `free-access` |
| Five saved cues trigger repeatable scene changes. | 7 | F-3-2 |
| Five lime cue beacons positioned across an abstract glass rehearsal timeline | 11 | Pass; image alt text |
| Preview | 1 | F-3-7 |
| See the cue sheet before you import | 7 | Pass |
| Each cue lists its time, scene, and note before you import a track. | 13 | Pass; visible preview matches |
| Opening contour | 2 | Pass; sample cue note |
| Break into shards | 3 | Pass; sample cue note |
| Closing horizon | 2 | Pass; sample cue note |
| How it works | 3 | Pass |
| Rehearse a scene change in three steps | 7 | Pass |
| Choose a track | 3 | Pass |
| Keep it in this browser. | 5 | Pass; `local-privacy`, but see F-1-19 |
| Mark each change | 3 | Pass; `cue-workflow` |
| Pick a scene at the playhead. | 6 | Pass; `cue-workflow` |
| Play it again | 3 | Pass |
| Check the same run before you perform. | 7 | Pass; `deterministic-scenes` |
| Privacy and limits | 3 | Pass |
| What Cuebook keeps on this device | 6 | Pass |
| Your track and set stay in this browser. | 8 | Pass; `local-privacy`, but see F-1-19 |
| Beat numbers use the BPM and offset you enter. | 9 | Pass; `beat-grid` |
| Export a cue file to keep a copy. | 8 | Pass; `cue-workflow` |
| Read the privacy details | 4 | Pass; result-naming link |
| Cuebook keeps one track and its cues in this browser. | 10 | Pass; footer |
| Built by Param Factory · v1.0.8 | 5 | Pass; footer credit/build id |
| Cuebook needs JavaScript to load a local track and render rehearsals. | 11 | Pass; no-script fallback |
| Your track never leaves this device. | 6 | Pass; no-script fallback, but see F-1-19 |

All landing buttons use verbs that name the result. The navigation uses destination names, as expected for links.

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Cuebook | 1 | Pass; document title |
| Cuebook helps DJs, VJs, and educators rehearse visual changes against their own tracks. | 13 | Pass |
| Try the isolated sample: `https://visualizer-cuebook.sociobot.in/demo/`. | 5 | F-3-8 |
| It opens a 12-second rhythm with five editable cues. | 9 | F-3-1 |
| Your saved set stays unchanged. | 5 | Pass; `demo-sandbox` |
| What it does | 3 | Pass |
| Keeps one track and its set in this browser. | 9 | Pass; `local-privacy`, but see F-1-19 |
| Marks each cue at the current playback time. | 8 | Pass; `cue-workflow` |
| Shows beat numbers from the BPM and offset you enter. | 10 | Pass; `beat-grid` |
| Replays Contour, Orbit, and Shards at the same track time. | 10 | Pass; `three-scenes`, `deterministic-scenes` |
| Imports and exports a Cuebook cue file. | 7 | Pass; `cue-workflow` |
| Audio is not included. | 4 | Pass; `json-no-audio` |
| Installs on your device and reopens a saved set offline. | 10 | Pass; `pwa-install`, `offline-reload` |
| Keeps cue sheets with more than five cues. | 8 | Pass; `cue-capacity` |
| Records rehearsals in browsers that support track-audio capture. | 8 | F-3-3, F-3-9 |
| Tracks are not uploaded. | 4 | F-1-19 |
| Cuebook has no analytics, trackers, third-party runtime scripts, or CDN font requests. | 12 | F-1-19, F-3-10 |
| Choose an audio file your browser can play. | 8 | Pass |
| Every current rehearsal tool is available without charge. | 8 | Pass; `free-access` |
| See privacy and terms. | 4 | Pass |
| Run locally | 2 | Pass; heading |
| Node.js 20 or newer is required. | 6 | Pass; setup requirement |
| Open the local URL Vite prints. | 6 | Pass; setup instruction |
| Keyboard controls outside form fields: | 5 | Pass |
| Space: play or pause | 4 | Pass |
| M: mark a cue at the current playback time | 9 | Pass |
| Left / Right: nudge the playhead by one second | 9 | Pass |
| Test and build | 3 | Pass; heading |
| Browser tests use Playwright 1.58.2. | 5 | Pass; package pin matches |
| They cover demo isolation, cues, downloads, responsive layout, accessibility, and offline reload. | 12 | F-3-11 |
| Claim checks are mapped in `.factory/claims.json`. | 6 | Pass |
| `npm run build` writes static files to `dist/`, with `dist/index.html` at its root. | 13 | Pass; `static-deployment` |
| No backend or environment variable is required. | 7 | Pass; `static-deployment` |
| Deploy | 1 | Pass; heading |
| Build `dist/` and deploy it as a static site with `public/staticwebapp.config.json` at the site root. | 15 | Pass; deployment instruction |
| The factory deployment uses this configuration for routes, CSP, caching, and the designed 404 page. | 15 | F-3-12 |
| Project notes | 2 | Pass; heading |
| The researched scope is in `.factory/brief.json`. | 6 | Pass |
| The visual system and generated-art provenance are in `.factory/design.md`. | 9 | F-3-13 |
| Verification details are in `.factory/handoff.md`. | 5 | Pass |
| Licensed under the MIT License. | 5 | Pass |

### Terminology

| Concept | Terms found | Required term | Result |
| --- | --- | --- | --- |
| Track-and-cues workspace | set | set | Pass |
| Imported media | track; audio only for content/format/capture | track | Pass |
| Portable timing file | cue file | cue file | Pass |
| Scenes | Contour, Orbit, Shards | Contour, Orbit, Shards | Pass |
| Isolated sample mode | demo, sample data, isolated sample | demo; sample data only in the entry action | F-3-8 |

## Demo, sandbox, privacy, and offline evidence

- One click from the home page opened `/demo/` with `Demo — Cuebook`, the persistent “Demo — sample data, nothing is saved” bar, “Neon classroom rehearsal,” a generated 12-second rhythm, and five editable cue rows. The initial desktop view already showed the set, track, active cue, scene canvas, and controls; the 390 px view showed the set, track, active cue, canvas, transport, and recording action.
- Live playback crossed all five cues in two runs. Observed scene sequence was Contour → Orbit → Shards → Orbit → Contour. The largest sampled delay after a saved cue time was 72 ms, and the largest difference between corresponding transitions across the two runs was 14 ms.
- Reset restored the title, five cues, and “Opening contour.” The demo bar remained sticky at y=64–149 after scrolling to the bottom of the 390×844 page.
- In a fresh live browser context, I created a real IndexedDB project named “Review 3 real sentinel” with a 32,044-byte WAV and one cue. Demo playback, title and cue edits, export, deletion, reset, and exit left the complete real record unchanged before, during, and after the demo. Returning to the real path restored the same title, track, cue, and note.
- The full live flow produced only `https://visualizer-cuebook.sociobot.in` and `blob:` requests. No third-party request or console error occurred.
- After the service worker controlled the live demo, offline reload restored the demo banner, offline banner, title, and all five cues.
- F-3-4 records the contradictory visible save label. F-1-19 and F-3-5 record missing automated coverage, despite the behavior passing this manual verification.

## Declared claim results

I cloned the repository to `/tmp/cuebook-review3-3eKygh/repo`, ran `npm ci`, and then ran every exact command from `.factory/claims.json` separately.

| Claim id | Exact command | Result |
| --- | --- | --- |
| `cue-workflow` | `npm run test:e2e -- --grep @claim:cue-workflow` | PASS, 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 1 test |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | PASS, 1 test; inadequate flow coverage in F-1-19 |
| `json-no-audio` | `npm run test:e2e -- --grep @claim:json-no-audio` | PASS, 1 test |
| `cue-capacity` | `npm run test:e2e -- --grep @claim:cue-capacity` | PASS, 1 test |
| `rehearsal-recording` | `npm run test:e2e -- --grep @claim:rehearsal-recording` | PASS, 1 test; content assertion missing in F-3-3 |
| `three-scenes` | `npm run test:e2e -- --grep @claim:three-scenes` | PASS, 1 test |
| `deterministic-scenes` | `npm run test:e2e -- --grep @claim:deterministic-scenes` | PASS, 1 test; cue-trigger claim gap in F-3-2 |
| `pwa-install` | `npm run test:e2e -- --grep @claim:pwa-install` | PASS, 1 test |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS, 1 test; sequence gap in F-3-5 |
| `no-tracking-runtime` | `npm run test:e2e -- --grep @claim:no-tracking-runtime` | PASS, 1 test; inadequate flow coverage in F-1-19 |
| `free-access` | `npm run test:e2e -- --grep @claim:free-access` | PASS, 1 test |
| `beat-grid` | `npm run test:e2e -- --grep @claim:beat-grid` | PASS, 1 test |
| `accessibility-in-free` | `npm run test:e2e -- --grep @claim:accessibility-in-free` | PASS, 1 test |
| `static-deployment` | `npm run test:e2e -- --grep @claim:static-deployment` | PASS, 1 test |

## Structure, links, accessibility, and visual identity

- PASS: `/`, `/demo/`, `/privacy/`, `/terms/`, `/offline.html`, and the designed 404 have the required title pattern, `lang=en`, one h1, one main landmark, descriptions, canonicals, Open Graph/Twitter metadata, favicon metadata, skip links, shared navigation, and footers. F-3-6 is the landing skip-link wording defect.
- PASS: home → demo and browser Back focus the route h1 and update the polite route announcer. Direct deep links open the intended route.
- PASS: `/demo/nope`, `/demo-extra`, `/demonstration`, and unrelated unknown paths return the designed HTTP 404.
- PASS: every same-origin page link and metadata asset checked returned 200; `mailto:` links were treated as explicit. The 404 page’s own fragment link remains on its intentional 404 response.
- PASS: live Axe scans at 390×844 and 1440×900 found zero violations on home, demo, Privacy, Terms, offline setup, and 404. Every visible button, link, input, and select measured at least 44×44 CSS px. There was no horizontal overflow.
- PASS: `/opt/fleet/lib/verify-url.sh` passed home, demo, Privacy, Terms, and offline setup with one h1, `lang`, a main landmark, alt text, and no console errors.
- PASS: reduced-motion mode is detected and animated durations collapse to 0.00001 seconds. The live CSP and security headers match the resources in use.
- PASS: `robots.txt`, the four-route sitemap, 1200×630 social image, manifest, icons, and service worker are served. The application JavaScript is 39,211 bytes raw / 12,240 bytes gzip.
- PASS: the dark rehearsal surface, lime beacons, cyan trace, glass landscape, cue rail, and deterministic canvases are visually distinct and match `.factory/design.md`; this is not a generic SaaS template.

## Earlier finding verification

I read `.factory/review-1.md`, `.factory/review-2.md`, `.factory/polish-1.md`, `.factory/polish-2.md`, and the prior handoff. Every earlier finding was checked against both live behavior and current source/tests.

### Review 1

| Earlier id | Status in review 3 | Evidence |
| --- | --- | --- |
| F-1-1 | Fixed | Paid-license code and storage are gone; live demo edits left the real IndexedDB record unchanged. |
| F-1-2 | Fixed | The sample PCM has audible energy; two live plays crossed all five scene cues. |
| F-1-3 | Fixed | The mobile demo bar remains sticky at the bottom of the cue list. |
| F-1-4 | Fixed | Demo-prefix typo routes return the designed HTTP 404. |
| F-1-5 | Fixed | Preview, three-step workflow, and privacy/limits sections are live. There is no paid tier to disclose. |
| F-1-6 | Fixed | Main, legal, offline, and 404 pages include the required metadata and icons. |
| F-1-7 | Fixed | Legal and 404 routes use the shared header, footer, and skip link. |
| F-1-8 | Fixed | Forward, Back, and direct loads focus the h1 and announce app routes. |
| F-1-9 | Fixed | Seeded demo Axe scans report zero violations at both widths. |
| F-1-10 | Fixed | No measured interactive target is smaller than 44×44 px. |
| F-1-11 | Fixed | “Record rehearsal” remains visibly labelled on mobile. |
| F-1-12 | Fixed | The old “every cue…on time” guarantee is absent. |
| F-1-13 | Fixed | “Unlimited cues” is absent; more-than-five behavior has a claim test. |
| F-1-14 | Fixed | Price and subscription copy are absent because no purchase path exists. |
| F-1-15 | Fixed | Checkout, merchant, refund, and verification copy are absent. |
| F-1-16 | Fixed | Public copy uses browser/device language instead of IndexedDB. |
| F-1-17 | Fixed | Beat wording is plain and mapped to `beat-grid`. |
| F-1-18 | Fixed | Contour, Orbit, and Shards are the only scene names. |
| F-1-19 | **Reopened — BLOCKING** | The dedicated claims exist, but the tagged request flows omit the earlier required import/play/edit/exit/offline coverage. |
| F-1-20 | Fixed | README asks for an audio file the browser can play. |
| F-1-21 | Fixed | The static build runs without environment configuration; build and demo pass. |
| F-1-22 | Fixed | Provider-id and secret claims are absent. |
| F-1-23 | Fixed | README opens with the audience and job in plain words. |
| F-1-24 | Fixed | No README sentence exceeds 22 words. |
| F-1-25 | Fixed | The unexplained PWA acronym is absent from user copy. |
| F-1-26 | Fixed | Browser API names are absent from the user-facing recording note; F-3-9 is a separate plain-language issue. |
| F-1-27 | Fixed | The browser-test description is split and under 22 words. |
| F-1-28 | Fixed | The artwork caption states cue behavior; F-3-2 records its missing behavior assertion. |
| F-1-29 | Fixed | The obsolete Plus dialog is gone. |
| F-1-30 | Fixed | The obsolete Plus header action is gone. |
| F-1-31 | Fixed | The obsolete license action is gone. |
| F-1-32 | Fixed | The demo result and real-data effect appear with the first-screen actions. |
| F-1-33 | Fixed | The first-screen import action says “Import a cue file.” |
| F-1-34 | Fixed | Cue-file terminology is consistent in the product and README. |
| F-1-35 | Fixed | `set` names the workspace and `cue sheet` names the ordered cue list. |
| F-1-36 | Fixed | `track` consistently names the imported media; audio is used only for content/format/capture. |
| F-1-37 | Fixed | The 404 h1 is “Page not found.” |

### Review 2

| Earlier id | Status in review 3 | Evidence |
| --- | --- | --- |
| F-2-1 | Fixed | Offline setup uses the full visual skeleton, external CSS/JS, valid CSP, and literal recovery copy. |
| F-2-2 | Fixed | Legal and main interactive targets measure at least 44×44 px. |
| F-2-3 | Fixed | Billing and price claims are removed. |
| F-2-4 | Fixed | Refund and revocation claims are removed. |
| F-2-5 | Fixed | Beat calculation is in `claims.json` and its tagged test passes. |
| F-2-6 | Fixed | Scene names are consistently Contour, Orbit, and Shards. |
| F-2-7 | Fixed | The Plus header action is removed. |
| F-2-8 | Fixed | Product workflow copy uses `cue file`, not Cue/source JSON. |
| F-2-9 | Fixed | Imported media is consistently called a track. |
| F-2-10 | Fixed | The unavailable license and rate-limit feature is removed. |
| F-2-11 | Fixed | Vague “accessibility features” copy is absent; named keyboard controls remain. |
| F-2-12 | Fixed | Firefox is no longer promised; F-3-3 and F-3-9 are separate recording-content and wording issues. |
| F-2-13 | Fixed | License-cache copy and code are removed. |
| F-2-14 | Fixed | Allowance-replenishment copy and tooling are removed. |
| F-2-15 | Fixed | Demo Open Graph and Twitter titles/descriptions identify the demo route. |
| F-2-16 | Fixed | The preview accurately describes time, scene, and note rows. |
| F-2-17 | Fixed | The editor heading is “Add the next cue.” |
| F-2-18 | Fixed | The action is “Start a new set.” |

## Repository verification

- Clean-clone claim run: 15/15 exact commands passed.
- `npm test`: PASS, 10/10.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm run test:e2e`: PASS, 27/27.
- Live/current comparison: 25/25 public build files match by SHA-256.
- `npm ci`: 0 reported vulnerabilities.

## Missed leverage

No additional AI or sync feature is warranted. The brief calls for deterministic manual cues, local audio, cue-file import/export, and rehearsal-video export; all are present. Cloud sync would conflict with the local-first privacy model. An AI step would add network/key handling without improving the precise manual timing job.

## What would make this perfect

Close F-1-19 and F-3-1 through F-3-13, then rerun the review from fresh mobile and desktop contexts. The perfect version has one complete request-log regression for the claimed privacy flows, a real WebM content assertion, cue-transition behavior coverage, a duration claim that is listed and tested, one unambiguous demo save state, an accurate skip link, and no inconsistent or specialist copy.
