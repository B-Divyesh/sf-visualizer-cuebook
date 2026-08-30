# Adversarial first-read review 1 — Cuebook

**Verdict: FAIL**

Reviewed 2026-08-30 against live <https://visualizer-cuebook.sociobot.in> and source revision `3d2b77364e7e0bf89ab97501a702ad2b5f4967e0`. The deployed `index.html`, app JavaScript, and app CSS match the local production build byte for byte.

There are four blocking findings, 18 major findings, and 15 minor findings. All 11 declared claim commands pass, but the site has false or untested copy outside those claim definitions. A PASS requires zero findings and no untested claim.

## Cold first screen

I opened fresh Chromium contexts at 390×844 and 1440×900 without scrolling.

| Question | Mobile answer | Desktop answer | Result |
| --- | --- | --- | --- |
| What does this do? | It lets me place timed visual-scene cues on my own audio and rehearse them. | Same. The cue-beacon artwork reinforces timing. | Clear from “Make every visual cue land on time” plus the supporting sentence. |
| For whom? | DJs, VJs, and educators. | DJs, VJs, and educators. | Explicit. |
| What should I select first? | “Try it with sample data.” It is the bright first action. | “Try it with sample data.” | Clear. |

The cold first screen therefore passes the three-question clarity check. At 390 px the visible screen also includes all three facts. It does not say what the sample action will open next to the action; see F-1-32.

## Findings

### Blocking

#### F-1-1 — Demo mode reads and writes the real license namespace

- **Location/quote:** `/demo/`, “Demo — sample data, nothing is saved”; `src/main.ts:141,165-191`; `src/license.ts:19-52`.
- **Evidence:** With `sb_license:visualizer-cuebook` and its valid cache set before opening `/demo/`, the live demo displayed “Plus unlocked.” After entering `demo-write-sentinel` through the demo’s restore control, live demo mode wrote that token and a verification cache to the real app’s `localStorage`. The verification request was intercepted; no external service was contacted for this check.
- **Why this fails:** Project data is held in memory, but the paid-license state is neither isolated nor read-only. The banner’s absolute “nothing is saved” statement is false, and demo actions can alter real user state.
- **Concrete fix:** Make all license functions demo-aware. In demo mode, use an in-memory fixture verdict and never read, write, or delete `sb_license:*`. Disable checkout/restore or label them as simulated. Extend `@claim:demo-sandbox` with sentinel real project and license values; exercise restore, invalid restore, reset, reload, and exit, then assert every real key is unchanged.

#### F-1-2 — The sample track is silent, so the main rehearsal job is not genuinely tryable

- **Location/quote:** live `/demo/`, `sample-rehearsal.wav`; README: “It opens with five realistic cues”; `.factory/demo.md`: “a 12-second local WAV placeholder”; `src/main.ts:544-585` calls `makeSilentWav` and never writes any PCM sample after the WAV header.
- **Evidence:** The demo shows five useful-looking cue rows, but the generated audio buffer contains only zero-valued samples. Selecting Play gives no audible transitions to rehearse.
- **Why this fails:** Cuebook’s job is to rehearse scene changes against audio. A silent placeholder proves canvas and timeline controls, not that job. “Realistic” is also inaccurate copy.
- **Concrete fix:** Ship an original, audible 12–20 second rhythm sample with clear sections aligned to the five cues. Record its provenance. Add a test that decodes the sample, confirms non-zero audio energy, starts playback, crosses at least two cues, and observes the matching scene changes. Rewrite the README to describe the actual sample.

#### F-1-3 — The demo banner is not persistent during the long editor flow

- **Location/quote:** `/demo/`, “Demo — sample data, nothing is saved”; `src/styles.css:54` sets `.demo-banner { position: relative; }`.
- **Evidence:** On the 390 px demo, the cue list extends several screens. After scrolling, the banner, “Reset demo,” and “Start for real” are no longer visible.
- **Why this fails:** A visitor editing lower cue rows loses the required continuous indication that this is a sandbox and must scroll to the top to reset or leave it.
- **Concrete fix:** Keep a compact sticky demo bar visible below the header, including “Reset demo” and “Start for real.” Verify it remains visible at the last cue on 390 px and does not obscure focused controls.

#### F-1-4 — The `/demo*` deployment rule turns invalid URLs into HTTP 200 app pages

- **Location/quote:** `public/staticwebapp.config.json:18`, `"route": "/demo*"`.
- **Evidence:** Live responses: `/demo/nope` → 200, `/demo-extra` → 200, and `/demonstration` → 200. `/unknown/nested` correctly returns the designed 404. The former URLs load the home app because demo detection accepts only exact `/demo`.
- **Why this fails:** Unknown routes can bypass the designed 404, search engines receive false 200 responses, and a mistyped demo URL silently opens the wrong state. This is a partial regression of the handoff’s unknown-route repair.
- **Concrete fix:** Replace the wildcard with exact `/demo` and `/demo/` routes. Add deployment tests for `/demo`, `/demo/`, `/demo/nope`, `/demo-extra`, `/demonstration`, and an unrelated nested path, asserting both HTTP status and page title.

### Major

#### F-1-5 — The landing page stops after the hero and omits the required product structure

- **Location:** live `/`; `src/main.ts:21-37,129`.
- **Evidence:** The page goes from the first screen directly to the footer. It has no live product preview, no “How it works” three-step section, no plain limitations/privacy section, and no visible paid-tier section with exact price. Pricing exists only behind the header button.
- **Why this fails:** A first-time visitor cannot verify the workflow or limitations before choosing a file or opening a modal.
- **Concrete fix:** After the first screen, show an interactive or faithful preview, three named steps, a clear “What stays on your device / what Cuebook does not do” section, and the Free/Plus comparison with the verified price.

#### F-1-6 — Privacy, Terms, and 404 metadata is incomplete; icon metadata is incomplete site-wide

- **Location:** `/privacy/`, `/terms/`, and the designed 404 heads; home `index.html:7-22`.
- **Evidence:** Privacy and Terms have no canonical, Open Graph, Twitter-card, or apple-touch metadata. The 404 has no canonical/social/apple metadata. Home uses a 192 px PNG for both favicon and apple-touch icon; there is no served SVG favicon or 180 px apple-touch icon.
- **Why this fails:** Shared/legal routes do not meet the same discoverability and install metadata standard as home.
- **Concrete fix:** Add route-specific canonical and social tags, the product social image, a public SVG favicon, and a 180×180 apple-touch icon to every HTML route. Add static metadata assertions per route.

#### F-1-7 — Legal and 404 routes do not use the common header, footer, or skip link

- **Location:** `privacy/index.html:3`, `terms/index.html:3`, `404.html:12-15`.
- **Evidence:** These routes use two plain header links rather than the product header, have no skip link, and their footer has no Privacy/Terms links or build/version text.
- **Why this fails:** Navigation and accessibility change between routes, contrary to the common site skeleton.
- **Concrete fix:** Render one shared header/footer skeleton on all routes: wordmark, Demo, Privacy, skip link, product one-liner, Privacy, Terms, Param Factory credit, and build id. Keep the route-specific main content.

#### F-1-8 — Navigation does not move focus or announce the new route

- **Location:** home → demo and browser Back.
- **Evidence:** After selecting “Try it with sample data,” `document.activeElement` is `<body>`. After Back it remains `<body>`. There is no route announcement region.
- **Why this fails:** Keyboard and screen-reader users are not placed at the new page heading and receive no explicit route-change announcement.
- **Concrete fix:** On navigation/load, focus the route’s `<h1>` with `tabindex="-1"` and announce its text through an `aria-live="polite"` region. Add forward, Back, and deep-link focus tests.

#### F-1-9 — The demo has two Axe landmark violations

- **Location:** `/demo/` at 390 px and desktop.
- **Evidence:** Axe reports `landmark-complementary-is-top-level` for the timing `<aside>` nested within `<main>`, and `region` for the demo banner’s `<strong>` and “Start for real” link outside a landmark. Home, Privacy, Terms, and 404 had no Axe violations.
- **Why this fails:** Screen-reader landmark navigation exposes invalid or uncontained content in the main product view.
- **Concrete fix:** Use a labelled `<section>` for the timing panel unless it is truly complementary, and wrap the full demo banner in a labelled landmark. Run Axe against the seeded demo at both viewports with zero violations, not only serious/critical filtering.

#### F-1-10 — Multiple interactive targets are smaller than 44×44 CSS pixels

- **Location:** all routes; live measurements at 390 px.
- **Evidence:** Main brand link 119×24; main footer Privacy 47×20 and Terms 38×20; legal header links 85×26 and 159×26; legal email link about 162×19; 404 return link 149×19. Demo range inputs render 24 px high and the editable project title 33 px high.
- **Why this fails:** These targets miss the stated mobile touch-target baseline.
- **Concrete fix:** Give every interactive link/control at least a 44 px hit box, including header/footer links, inline legal links, the project title, and each range control’s interactive wrapper. Add bounding-box checks at 390 px.

#### F-1-11 — The mobile recording action is an unexplained red dot

- **Location:** `/demo/` at 390 px; `src/styles.css:195-196` hides the text with `font-size: 0` and injects “●”.
- **Evidence:** The transport displays Play, time, and an isolated red dot. Its accessible name remains “Record rehearsal,” but sighted touch users get no visible label.
- **Why this fails:** A first-time visitor cannot identify a paid core action from the visual control.
- **Concrete fix:** Keep visible “Record” text or use a standard record icon with an adjacent label. Preserve the full accessible name and 44 px target.

#### F-1-12 — The headline makes an unlisted timing guarantee

- **Location/quote:** landing, “Make every visual cue land on time.”
- **Evidence:** No `claims.json` entry measures cue-to-output timing or the brief’s ±150 ms success target. `deterministic-scenes` only compares canvas pixels at the same requested media time.
- **Why this fails:** “Every” and “on time” promise performance the sandbox never measures; “land” is also figurative.
- **Concrete fix:** Use “Build repeatable visual cues for your audio.” If timing accuracy is retained as a claim, add a measured end-to-end timing claim and test with a stated tolerance.

#### F-1-13 — “Unlimited cues” exceeds the tested Plus claim

- **Location/quote:** Plus dialog and README, “Cuebook Plus adds unlimited cues…”
- **Evidence:** The listed `plus-recording` claim and test import six cues. They do not establish an unlimited or documented high limit.
- **Why this fails:** The copy broadens “more than five” into an unbounded promise.
- **Concrete fix:** Say “more than five cues” or add an `unlimited-cues` claim with a high-volume import/edit/export test and documented browser-storage limits.

#### F-1-14 — Price and subscription claims are unlisted

- **Location/quote:** Plus dialog, “US$12 one time” and “No subscription”; README, “The US$12 one-time Plus license…”
- **Evidence:** No claim entry asserts the displayed price or billing model.
- **Why this fails:** These are purchase facts a visitor may rely on.
- **Concrete fix:** Add one commercial-contract claim backed by a recorded billing fixture that asserts US$12, one-time payment, and no recurring plan, or remove the statements until they are verifiable.

#### F-1-15 — Checkout, verification, merchant, and refund statements are unlisted

- **Location/quote:** dialog, “Checkout is hosted by Sociobot, with Dodo as merchant of record. Refunds are handled there.” README: “checkout and verification use only the Sociobot billing API.”
- **Evidence:** `plus-license` tests a mocked verification response but does not assert checkout host, merchant, refund handling, or exclusivity of billing traffic. The external checkout link was not requested because this work order forbids connecting to resources outside `sf-visualizer-cuebook`.
- **Why this fails:** The public commercial statements have no sandbox-verifiable contract and the external link remains untested in the permitted scope.
- **Concrete fix:** Add a recorded billing-contract fixture and same-origin app request assertions for each statement. Keep live external checkout verification in an authorized billing review, not this product review.

#### F-1-16 — The IndexedDB implementation claim is unlisted and uses internal jargon

- **Location/quote:** README, “Keeps one active audio track and cue sheet locally in IndexedDB.”
- **Evidence:** `cue-workflow` proves reload persistence, not the named storage implementation.
- **Why this fails:** A nontechnical user does not need “IndexedDB,” while a technical reader has no claim test for it.
- **Concrete fix:** Rewrite as “Stores one track and its cue sheet in this browser.” Extend the local-storage claim to assert the expected database only if naming IndexedDB remains useful.

#### F-1-17 — Millisecond and beat-position claims are unlisted and densely technical

- **Location/quote:** README, “Marks millisecond timestamps from the media clock and shows advisory beat positions from a manual BPM/offset.”
- **Evidence:** No claim test asserts millisecond preservation, browser media-clock capture, or the displayed beat calculation.
- **Why this fails:** The sentence combines three technical promises without proof.
- **Concrete fix:** Split it: “Marks each cue at the current playback time. Shows a beat number from the BPM and offset you enter.” Add claim tests that assert saved precision and calculated beat values.

#### F-1-18 — The scene sentence contains an unlisted originality claim and inconsistent names

- **Location/quote:** README, “Replays three original Canvas scenes—Contour field, Signal orbit, and Glass shards—deterministically from saved cue parameters.” The live picker and `three-scenes` claim use “Contour,” “Orbit,” and “Shards.”
- **Evidence:** Tests prove selection and repeatable pixels, not “original.” The names differ between README, overlay, cue rows, and controls.
- **Why this fails:** The sentence adds an untested provenance claim and makes users learn two names for each scene.
- **Concrete fix:** Use “Replays the Contour, Orbit, and Shards scenes the same way at the same playback time.” Keep provenance in the design document or add a static provenance check.

#### F-1-19 — The no-tracking/runtime/CDN statement is broader than the privacy claim entry

- **Location/quote:** README, “There are no analytics, trackers, third-party runtime scripts, or CDN font requests.”
- **Evidence:** `local-privacy` is defined as “Audio stays in the browser and is not uploaded.” Its minimal request-log test does not enumerate every application flow or the separate no-analytics/script/font statements.
- **Why this fails:** The page makes four privacy/security promises under a narrower claim id.
- **Concrete fix:** Add a separate `no-tracking-runtime` claim. Exercise home, demo, import, export, playback, reset, offline reload, and simulated license handling; assert the allowed request list and inspect built script/font origins.

#### F-1-20 — The format-support statement is unlisted

- **Location/quote:** README, “MP3, WAV, M4A, OGG, and other formats supported by your browser can be used.”
- **Evidence:** Tests only provide generated WAV files.
- **Why this fails:** Naming MP3, M4A, and OGG implies verified support that the suite does not check.
- **Concrete fix:** Either test small original fixtures for each named format in the supported browser matrix or write “Choose an audio file your browser can play.”

#### F-1-21 — The deployment requirement statement is unlisted

- **Location/quote:** README, “No backend or environment variable is required.”
- **Evidence:** No claim entry tests a clean static deployment without environment configuration.
- **Why this fails:** This is an operational promise a deployer may rely on.
- **Concrete fix:** Add a static-deployment claim that builds in a clean environment, scans for required variables/server calls, serves `dist/`, and runs the core workflow.

#### F-1-22 — The no-product-id/no-secret statement is unlisted

- **Location/quote:** README, “The factory registers the billing product separately; the app intentionally contains no provider product ID or secret.”
- **Evidence:** No claim entry scans source and built output for provider identifiers or secrets.
- **Why this fails:** This is a security claim without a test.
- **Concrete fix:** Add a static secret/provider scan claim, or replace the sentence with an implementation note that names only the observable checkout URL policy.

### Minor

#### F-1-23 — The README opening uses jargon and a desk metaphor

- **Location/quote:** “Cuebook is a private, offline-first visual rehearsal desk for bedroom DJs, VJs, and educators.”
- **Why this fails:** “Offline-first” is product jargon and “rehearsal desk” does not name an operation.
- **Concrete fix:** “Cuebook helps DJs, VJs, and educators rehearse visual changes against their own audio.”

#### F-1-24 — A README sentence exceeds the 22-word cap

- **Location/quote:** “Import a track you own, place exact time/beat cues, attach deterministic visual scenes, and replay the same transitions from the browser’s audio clock.” — 23 words.
- **Why this fails:** It compresses import, marking, scene assignment, replay, precision, and implementation into one sentence.
- **Concrete fix:** “Import your track and mark each scene change. Cuebook replays those changes from the track’s playback time.”

#### F-1-25 — “PWA” is unexplained user-facing jargon

- **Location/quote:** README, “Installs as a PWA and reopens the complete saved set offline.”
- **Why this fails:** The benefit is install/offline use; the implementation acronym does not help a first-time user.
- **Concrete fix:** “Install Cuebook on your device and reopen your saved set offline.”

#### F-1-26 — The recording note exposes browser API names instead of the useful limitation

- **Location/quote:** README, “Rehearsal recording works best in desktop Chromium because it requires `HTMLMediaElement.captureStream` and `MediaRecorder`.”
- **Why this fails:** The API names do not tell the user what to do.
- **Concrete fix:** “Record rehearsals in desktop Chrome or Firefox. Other browsers may not capture track audio.” Put API names in a developer note if needed.

#### F-1-27 — The test-suite sentence exceeds the 22-word cap

- **Location/quote:** “The Playwright suite pins version 1.58.2 and checks the demo, cue creation and persistence, JSON download, 390 px layout, accessibility, license returns, and offline reload.” — 25 words.
- **Why this fails:** The list is hard to scan.
- **Concrete fix:** “Browser tests use Playwright 1.58.2. They cover demo isolation, cues, downloads, mobile layout, accessibility, licenses, and offline reload.”

#### F-1-28 — The hero artwork caption is an information-free slogan

- **Location/quote:** “Five moments. One repeatable run.”
- **Why this fails:** It does not explain the artwork or tell the visitor what the product does.
- **Concrete fix:** “Five saved cues trigger repeatable scene changes.” Add the corresponding count/behavior to an existing claim, or remove the caption.

#### F-1-29 — The Plus dialog heading is a mood claim, not a section name

- **Location/quote:** “Rehearse without limits.”
- **Why this fails:** It is not meaningful out of context and is contradicted by documented browser, latency, and one-project limits.
- **Concrete fix:** “Cuebook Plus features.”

#### F-1-30 — The header’s Plus button does not name an action

- **Location/quote:** button “Cuebook Plus.”
- **Why this fails:** A button should say what selecting it will do.
- **Concrete fix:** “See Plus options.”

#### F-1-31 — The license button does not name its result

- **Location/quote:** button “Verify.”
- **Why this fails:** The object and result are unclear when controls are read out of context.
- **Concrete fix:** “Verify license.”

#### F-1-32 — The sample action does not state its immediate result beside the button

- **Location/quote:** “Try it with sample data.”
- **Why this fails:** The required next-step explanation appears only in the README, not beside the primary landing action.
- **Concrete fix:** Add “Opens a 12-second rehearsal with five editable cues; your saved set stays unchanged.” Only use this after F-1-1 and F-1-2 are fixed and tested.

#### F-1-33 — “Cue JSON” is unexplained on the first screen

- **Location/quote:** button “Import cue JSON.”
- **Why this fails:** DJs or educators who do not already know the file format cannot tell whether this imports audio, settings, or a saved set.
- **Concrete fix:** “Import a cue file,” with helper text “JSON from Cuebook; audio is not included.”

#### F-1-34 — Cue-file terminology changes across the interface and README

- **Location/quotes:** “Import cue JSON,” “Import JSON,” “Export JSON,” “portable `cuebook/v1` JSON,” and “export cue timing as JSON.”
- **Why this fails:** These labels refer to the same portable file with different names.
- **Concrete fix:** Use “cue file” in user actions and “Cuebook cue file (JSON)” on first explanation. Reserve `cuebook/v1` for the developer format note.

#### F-1-35 — Workspace terminology is not consistently bounded

- **Location/quotes:** landing/footer and app use “set”; README uses “audio track and cue sheet”; Privacy uses “cue project.”
- **Why this fails:** “Set,” “cue sheet,” and “project” can sound like three saved objects even though v1 stores one workspace.
- **Concrete fix:** Define “set” as one track plus its cues. Use “cue sheet” only for the ordered cue list and remove “cue project” from public copy.

#### F-1-36 — Audio terminology changes for the same imported object

- **Location/quotes:** “Choose your audio track,” README “Import a track,” Privacy “audio file,” and demo “sample-rehearsal.wav.”
- **Why this fails:** The copy switches among track, audio, and file without a functional distinction.
- **Concrete fix:** Use “track” in user copy and “audio file” only where file-format or storage behavior is being explained.

#### F-1-37 — The 404 h1 is metaphorical

- **Location/quote:** 404 h1, “This page is not in the cue sheet.”
- **Why this fails:** A heading must name the state when heard out of context.
- **Concrete fix:** Use “Page not found.” Keep product character in supporting copy or art.

## Copy audit

Counts use whitespace-delimited words. Headings, controls, and standalone fragments are included because they also need to make sense out of context. `Pass` means the unit is within 22 words and has no separate clarity flag; it does not override product findings elsewhere.

### Landing and Plus dialog

| Copy unit | Words | Result |
| --- | ---: | --- |
| Private visual rehearsal | 3 | Pass |
| Make every visual cue land on time. | 7 | F-1-12 |
| For DJs, VJs, and educators who need repeatable scene changes from their own audio. | 14 | Pass |
| Try it with sample data | 5 | F-1-32 |
| Choose your audio track | 4 | Pass |
| Import cue JSON | 3 | F-1-33, F-1-34 |
| Audio stays in this browser. | 5 | Pass; mapped to `local-privacy` |
| Saved sets work offline. | 4 | Pass; mapped to `offline-reload` |
| Five cues are free. | 4 | Pass; mapped to `free-five` |
| Five moments. | 2 | F-1-28 |
| One repeatable run. | 3 | F-1-28 |
| Cuebook runs locally. | 3 | Pass; mapped to local workflow/privacy claims |
| Cuebook Plus | 2 | F-1-30 |
| One-time unlock | 2 | Pass |
| Rehearse without limits. | 3 | F-1-29 |
| Cuebook Plus adds unlimited cues and downloadable rehearsal recordings. | 9 | F-1-13 |
| Core cue export, all scenes, and accessibility stay free. | 9 | Pass; covered by cue workflow, scene, free-tier, and Axe checks |
| US$12 one time. | 3 | F-1-14 |
| No subscription. | 2 | F-1-14 |
| Buy Cuebook Plus | 3 | Pass |
| Already purchased? | 2 | Pass |
| Paste your license. | 3 | Pass |
| Verify | 1 | F-1-31 |
| Checkout is hosted by Sociobot, with Dodo as merchant of record. | 11 | F-1-15 |
| Refunds are handled there. | 4 | F-1-15 |

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Cuebook | 1 | Pass |
| Cuebook is a private, offline-first visual rehearsal desk for bedroom DJs, VJs, and educators. | 14 | F-1-23 |
| Import a track you own, place exact time/beat cues, attach deterministic visual scenes, and replay the same transitions from the browser’s audio clock. | 23 | F-1-24 |
| Live product: `https://visualizer-cuebook.sociobot.in` | 3 | Pass |
| Try the isolated sample: `https://visualizer-cuebook.sociobot.in/demo/`. | 5 | Pass |
| It opens with five realistic cues, never reads your saved set, and resets on reload. | 15 | F-1-1, F-1-2 |
| What it does | 3 | Pass |
| Keeps one active audio track and cue sheet locally in IndexedDB. | 11 | F-1-16 |
| Marks millisecond timestamps from the media clock and shows advisory beat positions from a manual BPM/offset. | 16 | F-1-17 |
| Replays three original Canvas scenes—Contour field, Signal orbit, and Glass shards—deterministically from saved cue parameters. | 15 | F-1-18 |
| Imports and exports portable `cuebook/v1` JSON without including audio. | 9 | F-1-34; no-audio result mapped to `json-no-audio` |
| Installs as a PWA and reopens the complete saved set offline. | 11 | F-1-25 |
| Provides five free cues. | 4 | Pass; mapped to `free-five` |
| The US$12 one-time Plus license adds unlimited cues and WebM rehearsal recording; checkout and verification use only the Sociobot billing API. | 21 | F-1-13, F-1-14, F-1-15 |
| Audio is never uploaded. | 4 | Pass; mapped to `local-privacy` |
| There are no analytics, trackers, third-party runtime scripts, or CDN font requests. | 12 | F-1-19 |
| See privacy and terms. | 4 | Pass |
| Run locally | 2 | Pass |
| Requirements: Node.js 20 or newer. | 5 | Pass |
| Open the local URL Vite prints. | 6 | Pass |
| MP3, WAV, M4A, OGG, and other formats supported by your browser can be used. | 14 | F-1-20 |
| Rehearsal recording works best in desktop Chromium because it requires `HTMLMediaElement.captureStream` and `MediaRecorder`. | 13 | F-1-26 |
| Keyboard controls outside form fields: | 5 | Pass |
| Space: play or pause | 4 | Pass |
| M: mark a cue at the current audio time | 9 | Pass |
| Left/Right: nudge the playhead by one second | 7 | Pass |
| Test and build | 3 | Pass |
| The Playwright suite pins version 1.58.2 and checks the demo, cue creation and persistence, JSON download, 390 px layout, accessibility, license returns, and offline reload. | 25 | F-1-27 |
| Claim checks are mapped in `.factory/claims.json`. | 6 | Pass |
| The production command is exactly `npm run build`; static output is written to `dist/`, with `dist/index.html` at its root. | 19 | Pass |
| Preview that output with: | 4 | Pass |
| Deploy the contents of `dist/` to any static host that serves directory indexes. | 13 | Pass |
| No backend or environment variable is required. | 7 | F-1-21 |
| The factory registers the billing product separately; the app intentionally contains no provider product ID or secret. | 17 | F-1-22 |
| Project notes | 2 | Pass |
| The researched scope is in `.factory/brief.json`, the original visual system and generated-asset provenance are in `.factory/design.md`, and verification details are in `.factory/handoff.md`. | 22 | Pass |
| Licensed under the MIT License. | 5 | Pass |

No banned marketing word appears. “Unlock” is used for the literal paid-license state. The two sentences over the 22-word hard cap are F-1-24 and F-1-27.

### Terminology table

| Concept | Terms found | Required term |
| --- | --- | --- |
| One audio-and-cues workspace | set, cue sheet, cue project | set; reserve cue sheet for the ordered list |
| Imported media | audio, audio track, track, audio file | track; use audio file only for format/storage details |
| Portable timing file | cue JSON, JSON, `cuebook/v1` JSON, cue timing as JSON | cue file; introduce once as “Cuebook cue file (JSON)” |
| Scene names | Contour / Orbit / Shards; Contour field / Signal orbit / Glass shards | Contour / Orbit / Shards |
| Paid tier | Cuebook Plus, Plus | Cuebook Plus on first mention; Plus thereafter |
| Isolated sample | demo, isolated sample | demo |

## Demo, storage, privacy, and offline evidence

- One click from home opens `/demo/` with title `Demo — Cuebook`, the banner, “Neon classroom rehearsal,” a 12-second track, and five cues named Opening contour, First pulse, Break into shards, Return to orbit, and Closing horizon.
- Deleting cue 1 reduced the list to four; “Reset demo” restored five and announced “Demo reset to the five sample cues.” Reload also restores five.
- A clean direct demo load and an offline reload requested only product-origin resources plus a same-origin blob URL. Offline reload retained five cues and showed the offline banner.
- Project storage is correctly in memory in demo mode. License storage is not isolated; see F-1-1.
- The only cross-origin request observed in the exercised demo was the intercepted license verification request after the explicit restore action. No request reached that external resource.
- Normal home/demo loads emitted no console errors. The worker `verify-url.sh` check passed title, `lang=en`, one h1, main, alt text, button labels, and console checks.

## Claims results

Every command below was run separately from no-hardlink clean clone `/tmp/tmp.DV0FzMYNX0/repo` at revision `3d2b773` after `npm ci` installed 140 packages with zero reported vulnerabilities.

| Claim id | Exact command | Result |
| --- | --- | --- |
| `cue-workflow` | `npm run test:e2e -- --grep @claim:cue-workflow` | PASS, 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 1 test |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | PASS, 1 test |
| `json-no-audio` | `npm run test:e2e -- --grep @claim:json-no-audio` | PASS, 1 test |
| `free-five` | `npm run test:e2e -- --grep @claim:free-five` | PASS, 1 test |
| `plus-license` | `npm run test:e2e -- --grep @claim:plus-license` | PASS, 1 test |
| `three-scenes` | `npm run test:e2e -- --grep @claim:three-scenes` | PASS, 1 test |
| `deterministic-scenes` | `npm run test:e2e -- --grep @claim:deterministic-scenes` | PASS, 1 test |
| `pwa-install` | `npm run test:e2e -- --grep @claim:pwa-install` | PASS, 1 test |
| `plus-recording` | `npm run test:e2e -- --grep @claim:plus-recording` | PASS, 1 test |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS, 1 test |

The listed tests pass. F-1-12 through F-1-22 identify public statements absent from, or materially broader than, those entries. F-1-1 identifies sandbox behavior omitted by the existing demo test.

## Structure and link crawl

- PASS: home and demo titles follow the expected pattern; Privacy, Terms, and 404 have route-specific titles.
- PASS: every tested route has `lang=en`, one h1, a main landmark, a meta description, and no console error.
- PASS: home has canonical, Open Graph, Twitter, theme color, manifest, and a real 1200×630 product social image.
- PASS: `/`, `/demo/`, `/privacy/`, `/terms/`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/sw.js`, `/icons/icon-192.png`, and `/assets/cuebook-social.webp` return 200.
- PASS: `/unknown/nested` returns the designed page with HTTP 404. F-1-4 lists demo-prefix exceptions.
- PASS: no dead same-origin link was found. `mailto:` links were treated as explicit non-HTTP links.
- NOT TESTED by constraint: the external Sociobot checkout URL. This is included in F-1-15 rather than contacted.
- PASS: the visual identity is distinct. Deep green glass, lime cue beacons, cyan trace, local Space Grotesk, scored cue rows, and deterministic canvas scenes match `.factory/design.md` and do not resemble a generic centered SaaS/gradient-card template.
- FAIL: metadata, shared skeleton, touch targets, focus, demo landmarks, and landing-section order; see F-1-5 through F-1-11.

## Earlier history re-check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read the entire pre-review `.factory/handoff.md`; it summarizes verification rounds 1–5 and the original build handoff.

| Earlier issue | Live confirmation | Code/test confirmation | Current status |
| --- | --- | --- | --- |
| Domain/TLS and wrong Azure page | HTTPS home returns 200 with the Cuebook title and correct body. | Live/local HTML hash `63a18df3…a255c` matches. | Fixed |
| Semantically invalid cue JSON accepted | Live invalid BPM/out-of-range fixture produced “Cue timing BPM must be a number from 20 to 300,” retained 0 cues, BPM 120, offset 0. | Full e2e regression passes. | Fixed |
| Out-of-track cues accepted, including JSON-before-audio | Covered by full 17-test suite. | Duration validation regressions pass. | Fixed |
| Invalid BPM/offset display disagreed with saved state | Live values `19/-1` normalized visibly to `20/0` with an explanatory toast. | Timing regression passes. | Fixed |
| Six-cue free import silently shortened | Live import opened a confirmation while retaining 0 cues; confirmation imported 5 and stated “first 5 of 6.” | `@claim:free-five` passes. | Fixed |
| Hashed asset caching and response policies missing | Live JS returns `public, max-age=31536000, immutable`; HSTS, CSP, Permissions Policy, referrer, frame, and nosniff headers are present. | Deployment-policy unit test passes. | Fixed |
| Unknown routes did not use designed 404 | `/unknown/nested` returns 404. | Exact 404 rewrite exists. | Partially regressed: F-1-4 |
| Live candidate did not match source | HTML/JS/CSS SHA-256 values match the local `dist/` build. | Production build passes. | Fixed |

No earlier finding id needs to be carried forward because the earlier repository contains no numbered review or polish finding. The partial routing regression receives new review id F-1-4.

## Repository verification

- `npm test`: PASS, 9/9.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run test:e2e`: PASS, 17/17.
- `npm run build`: PASS; `dist/` produced. App JS is 37.62 KB raw / 12.37 KB gzip; app CSS is 15.94 KB raw / 4.53 KB gzip.
- Live Axe at 390 px and 1440 px: home, Privacy, Terms, and 404 have zero violations; demo has the two moderate violations in F-1-9.
- Reduced-motion CSS is present and the 390 px layouts have no horizontal overflow.

## Missed leverage

No separate missed-leverage finding is warranted. The brief implies local audio import, cue-file import/export, repeatable scenes, offline reopening, and rehearsal-video export; all are present. Cloud sync would conflict with the local-first scope unless made explicit and optional. An AI feature would not improve the core deterministic timing job and would add privacy, connectivity, and key-management cost. Automatic beat detection is explicitly advisory/out of v1 scope, so adding model decoration would be inappropriate.

## What would make this perfect

Resolve every finding above, then repeat this review from fresh mobile and desktop contexts. In particular: isolate every demo state including licenses, use audible sample audio, keep the demo banner visible, close the wildcard-routing hole, complete the landing skeleton and route metadata, reach zero Axe/touch/focus issues, normalize terminology, and ensure every retained claim has one sandbox test whose scope matches the exact public sentence. A perfect round has no remaining copy, structure, accessibility, demo, routing, claim, or history finding.
