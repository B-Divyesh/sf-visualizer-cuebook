# Adversarial first-read review 2 — Cuebook

**Verdict: FAIL**

Reviewed 1 September 2026 against live <https://visualizer-cuebook.sociobot.in> and source revision `04132e1213c7aa16f72874c908c612bcb8d762b4`. The live app assets match the clean local production build.

There are nine blocking findings, five major findings, and four minor findings. All 15 declared claim commands pass, but several tests do not prove the public statement they name and several public statements remain outside `.factory/claims.json`. A PASS requires zero findings and no untested claim.

## Cold first screen

Fresh Chromium contexts opened the live home page at 390×844 and 1440×900. Nothing was scrolled before recording these answers.

| Question | Mobile and desktop answer | Result |
| --- | --- | --- |
| What does this do? | It builds repeatable timed visual cues against my audio. | Clear from “Build repeatable visual cues for your audio.” |
| For whom? | DJs, VJs, and educators rehearsing scene changes. | Explicit in the next sentence. |
| What should I select first? | “Try it with sample data.” | Clear, visually primary, and its next result is stated beside it. |

The first screen passes. At 390 px it also shows the three short facts before the fold. The desktop first screen adds the product-specific cue-landscape artwork.

## Findings

### Blocking

#### F-2-1 — The offline fallback is unstyled, logs a CSP error, and omits the site skeleton

- **Location/quote:** live `/offline.html`; `public/offline.html:2`, “The studio shell has not finished saving yet.”
- **Evidence:** the response sends `style-src 'self'`, but the document puts all styles in an inline `<style>`. Chromium logs “Applying inline style violates ... `style-src 'self'`” and renders a white, browser-default page. The route has no meta description, canonical, Open Graph/Twitter metadata, favicon, skip link, header, or footer. Its title, “Cuebook is offline,” also misses the route pattern.
- **Why this fails:** an offline PWA exposes this fallback precisely when recovery guidance matters. It fails the no-console-error gate and loses Cuebook’s visual identity and navigation.
- **Concrete fix:** move the CSS to a same-origin stylesheet, use `Offline setup — Cuebook`, rewrite the h1 as “Reconnect once to finish offline setup,” and add the shared metadata, skip link, header, and footer. Add a browser test under the production CSP that expects zero console errors.

#### F-2-2 — Prior F-1-10 remains open: legal-page touch targets are still below 44 px

- **Location/quote:** live `/privacy/` and `/terms/`; `src/legal.css:4`.
- **Evidence:** at 390 px, the Cuebook brand link measures 85×26 CSS pixels. The privacy email link measures 161.8×19; the terms email link measures 164.5×19. The CSS applies 44 px only to `header nav a`, `footer a`, and `.return-link`.
- **Why this fails:** the earlier review required every interactive target to reach the 44×44 mobile baseline. The repair covered only some selectors.
- **Concrete fix:** give `.brand` and `main a` a minimum 44 px hit area. Extend the 390 px bounding-box test to every visible link, button, input, and select on every route.

#### F-2-3 — Prior F-1-14 is only cosmetically fixed: the billing test repeats the page’s price instead of proving it

- **Location/quote:** landing/Plus dialog, “Plus is a US$12 one-time license” and “No subscription”; claim `billing-contract`; `tests/e2e/cuebook.spec.ts:461`.
- **Evidence:** `@claim:billing-contract` asserts that the DOM contains hard-coded `US$12` and `No subscription`. It reads no recorded billing fixture and does not compare the page with an authoritative product contract.
- **Why this fails:** a test that repeats the same hard-coded sales copy cannot detect a stale or incorrect price. The prior finding required a recorded billing fixture.
- **Concrete fix:** check in an authorized billing-contract fixture containing price, currency, cadence, checkout path, merchant, and refund owner. Compare every displayed purchase fact with it, or remove the claims.

#### F-2-4 — Prior F-1-15 remains open: refund statements are unlisted and untested

- **Location/quote:** Plus dialog, “Refunds are handled there”; Terms, “Refunds are handled by the merchant of record and revoke the license.”
- **Evidence:** `billing-contract` names price, subscription, checkout host, and merchant. Neither its claim nor its test mentions refund handling or license revocation.
- **Why this fails:** refund handling is a purchase term a visitor may rely on. The earlier finding explicitly included it, but the repair omitted it.
- **Concrete fix:** include the exact refund and revocation behavior in the billing fixture and claim test, or remove those statements and link to the authoritative hosted policy.

#### F-2-5 — Prior F-1-17 remains open: the beat calculation is still an unlisted public claim

- **Location/quote:** README line 13, “Shows beat numbers from the BPM and offset you enter”; landing, “Cuebook does not ... detect beats automatically”; studio, “Cuebook always saves the exact audio time.”
- **Evidence:** `tests/utils.test.ts` checks `timeToBeat`, but `.factory/claims.json` contains no beat-grid claim and no uniquely tagged browser test for the displayed value or exact-time statement.
- **Why this fails:** the wording is shorter than before, but the promised output remains outside the required claim map.
- **Concrete fix:** add a `beat-grid` claim and tagged demo test that changes BPM and offset, checks displayed cue beats, and confirms cue time is unchanged. Rewrite the landing limitation as “Beat numbers use the BPM and offset you enter.”

#### F-2-6 — Prior F-1-18 remains open: each scene still has two public names

- **Location/quote:** landing/README/buttons use “Contour, Orbit, and Shards”; live canvas and cue rows use “Contour field, Signal orbit, and Glass shards”; `src/utils.ts:3-7`.
- **Evidence:** the live demo’s first frame says `CONTOUR FIELD`; each cue editor exposes the long names; the adjacent picker uses the short names.
- **Why this fails:** users must infer that each long name and short name are the same selection. The prior repair claimed these names were normalized, but the shared values were not changed.
- **Concrete fix:** use `Contour`, `Orbit`, and `Shards` in overlays, cue rows, README, and controls. Keep descriptive phrases only as separate explanations.

#### F-2-7 — Prior F-1-30 remains open: the header button reverts to a noun label

- **Location/quote:** live header, “Cuebook Plus”; `src/main.ts:837-839`.
- **Evidence:** the template starts as “See Plus options,” but `updateLicenseUi()` replaces it with “Cuebook Plus” for every locked visitor.
- **Why this fails:** the button does not name the result of pressing it, and it is the only header action visible on the 390 px home screen.
- **Concrete fix:** keep “See Plus options” while locked and use “Manage Plus license” when unlocked. Assert the final rendered label after boot.

#### F-2-8 — Prior F-1-34 remains open: cue-file terminology still changes to JSON during the workflow

- **Location/quote:** live import-before-track toast, “Cue JSON loaded. Choose its matching audio track to continue”; import-limit dialog, “The source JSON stays unchanged”; `src/main.ts:146,655`.
- **Evidence:** primary actions say “Import a cue file,” but the next state changes the same object to “Cue JSON” and “source JSON.”
- **Why this fails:** the repair normalized the buttons but not the full workflow.
- **Concrete fix:** use “Cue file loaded. Choose its matching track to continue” and “The source cue file stays unchanged.” Introduce “Cuebook cue file (JSON)” once only where the format matters.

#### F-2-9 — Prior F-1-36 remains open: the imported media still changes names

- **Location/quote:** headline/support copy says “your audio”; the file action says “Choose your audio track”; the workflow and README otherwise say “track”; the import toast says “audio track.”
- **Evidence:** `.factory/copy-audit.md` declares the required term to be `track`, but the live first screen and workflow still mix `audio`, `audio track`, and `track` for the selected media.
- **Why this fails:** the previous finding required one public term and the polish record says it was normalized. It was not.
- **Concrete fix:** use “track” for the imported item everywhere: “Build repeatable visual cues for your track,” “their own track,” “Choose your track,” and “matching track.” Reserve “audio file” for format or storage explanations.

### Major

#### F-2-10 — The rate-limit claim test manufactures the behavior it claims to verify

- **Location/quote:** README lines 59-61; claim `license-rate-limit`, “Sociobot accepts a burst of 30 license checks per source client, then returns 429 with Retry-After.”
- **Evidence:** the tagged test intercepts the URL and itself returns 30 status-200 responses followed by a status 429. No captured fixture or authorized service contract is read. It proves only that Cuebook displays a supplied 429.
- **Why this fails:** a synthetic response cannot establish an external service’s allowance. The claim remains untested even though the command passes.
- **Concrete fix:** narrow the claim to “Cuebook preserves the token and shows retry guidance after a 429,” which the test proves. Keep gateway limits in gateway-owned documentation, or attach authorized contract evidence.

#### F-2-11 — “Accessibility features” is vague and absent from the claim map

- **Location/quote:** landing, “Free includes ... accessibility features”; Plus dialog, “... accessibility stay free.”
- **Evidence:** no claim entry defines which features this means. Axe and keyboard tests exist, but they are not mapped to this public phrase.
- **Why this fails:** the visitor cannot tell what is included, and the blanket word can imply broader conformance than the suite proves.
- **Concrete fix:** use “Keyboard controls and screen-reader labels are included in Free,” then add one tagged claim test for those named behaviors.

#### F-2-12 — Firefox recording support is stated but not tested

- **Location/quote:** README line 21, “Record rehearsals in desktop Chrome or Firefox.”
- **Evidence:** Playwright is configured only for Chromium. `@claim:plus-recording` records in Chromium and merely checks that fallback text contains “Chromium or Firefox.”
- **Why this fails:** rendering a browser name in recovery text does not prove recording works in that browser.
- **Concrete fix:** run the recording claim in desktop Firefox, or write “Record rehearsals in browsers that support track-audio capture.”

#### F-2-13 — The one-day license-cache statement is unlisted

- **Location/quote:** README line 59, “Cuebook checks a restored license, then caches its verdict for one day.”
- **Evidence:** no claim entry tests the 86,400,000 ms boundary. `plus-license` checks only token storage, URL cleanup, and unlocked state.
- **Why this fails:** cache duration affects when a paid entitlement is rechecked.
- **Concrete fix:** add a `license-cache-day` claim with a fake clock that verifies reuse before 24 hours and a new request at or after 24 hours.

#### F-2-14 — The allowance-replenishment statement is unlisted

- **Location/quote:** README line 61, “The allowance replenishes, so there is no fixed reset window.”
- **Evidence:** no tagged test advances time and observes replenishment. The mocked boundary has no refill model.
- **Why this fails:** this operational promise is broader than the declared 30-request boundary and retry-header behavior.
- **Concrete fix:** remove the sentence or add an authorized contract test that measures refill behavior without touching unrelated services.

### Minor

#### F-2-15 — Demo social metadata still describes the home route

- **Location/quote:** live `/demo/`; document title is “Demo — Cuebook,” but `og:title` and `twitter:title` remain “Cuebook — visual cues for your audio.”
- **Why this fails:** sharing the demo URL does not identify the sample workspace.
- **Concrete fix:** set route-specific Open Graph and Twitter titles/descriptions and assert their contents per route.

#### F-2-16 — The preview sentence claims a playhead that the preview does not show

- **Location/quote:** landing preview, “A track, a clear playhead, and the next scene stay together while you rehearse.”
- **Evidence:** the preview contains three static rows with time, scene, and note. It has no playhead and does not identify a next scene.
- **Why this fails:** the sentence describes UI that is not present in its section.
- **Concrete fix:** “Each cue lists its time, scene, and note before you import a track.”

#### F-2-17 — “Shape the next moment” is a metaphorical section heading

- **Location/quote:** demo editor h2, “Shape the next moment.”
- **Why this fails:** heard out of context, it does not name the cue-creation controls below it.
- **Concrete fix:** “Add the next cue.”

#### F-2-18 — “New set” is not a result-naming verb action

- **Location/quote:** demo editor button, “New set.”
- **Why this fails:** it names an object rather than the destructive action that follows.
- **Concrete fix:** “Start a new set.”

## Copy audit

Counts use whitespace-delimited words. The landing table includes headings, actions, facts, footer copy, and the Plus dialog. No audited unit exceeds 22 words and no banned marketing adjective appears.

### Landing and Plus dialog

| Copy unit | Words | Result |
| --- | ---: | --- |
| Cuebook | 1 | Pass; wordmark |
| Demo / Privacy / Terms | 1 each | Pass; navigation |
| Saved locally | 2 | Pass; `cue-workflow` |
| Cuebook Plus | 2 | F-2-7 |
| Private visual rehearsal | 3 | Pass |
| Build repeatable visual cues for your audio. | 7 | F-2-9 terminology; behavior maps to `deterministic-scenes` |
| For DJs, VJs, and educators who need repeatable scene changes from their own audio. | 14 | F-2-9 terminology |
| Try it with sample data | 5 | Pass; `demo-sandbox` |
| Choose your audio track | 4 | F-2-9 terminology |
| Import a cue file | 4 | Pass; `cue-workflow` |
| Opens a 12-second rehearsal with five editable cues. | 8 | Pass; `demo-sandbox` |
| Your saved set stays unchanged. | 5 | Pass; `demo-sandbox` |
| Audio stays in this browser. | 5 | Pass; `local-privacy` |
| Saved sets work offline. | 4 | Pass; `offline-reload` |
| Five cues are free. | 4 | Pass; `free-five` |
| Five saved cues trigger repeatable scene changes. | 7 | Pass; `demo-sandbox`, `deterministic-scenes` |
| Preview | 1 | Pass |
| See the cue sheet before you import | 7 | Pass |
| A track, a clear playhead, and the next scene stay together while you rehearse. | 14 | F-2-16 |
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
| Cuebook does not stream, sync, or detect beats automatically. | 9 | F-2-5; network parts map to privacy claims |
| Export a cue file to keep a copy. | 8 | Pass; `cue-workflow` |
| Read the privacy details | 4 | Pass |
| Pricing | 1 | Pass |
| Cuebook Free and Cuebook Plus | 5 | Pass |
| Free includes five cues, every scene, cue-file export, and accessibility features. | 11 | F-2-11; other parts are mapped |
| Plus is a US$12 one-time license for more than five cues and rehearsal recording. | 14 | F-2-3; other behavior is mapped |
| See Plus options | 3 | Pass |
| Cuebook keeps one track and its cues in this browser. | 10 | Pass; `local-privacy` |
| One-time license | 2 | Pass |
| Cuebook Plus features | 3 | Pass |
| Cuebook Plus adds more than five cues and downloadable rehearsal recordings. | 11 | Pass; `free-five`, `plus-recording` |
| Core cue-file export, all scenes, and accessibility stay free. | 9 | F-2-11; other parts are mapped |
| US$12 one time. | 3 | F-2-3 |
| No subscription. | 2 | F-2-3 |
| Buy Cuebook Plus | 3 | Pass as action; contract is F-2-3/F-2-4 |
| Already purchased? | 2 | Pass |
| Paste your license. | 3 | Pass |
| Verify license | 2 | Pass |
| Checkout is hosted by Sociobot. | 5 | F-2-3/F-2-4 |
| Dodo is the merchant of record. | 6 | F-2-3/F-2-4 |
| Refunds are handled there. | 4 | F-2-4 |

Additional product copy is covered by F-2-8 (“Cue JSON” / “source JSON”), F-2-17 (“Shape the next moment”), and F-2-18 (“New set”).

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Cuebook helps DJs, VJs, and educators rehearse visual changes against their own audio. | 13 | F-2-9 terminology; workflow mapped |
| Try the isolated sample: `https://visualizer-cuebook.sociobot.in/demo/`. | 5 | Pass |
| It opens a 12-second rhythm with five editable cues. | 9 | Pass; `demo-sandbox` |
| Your saved set and license stay unchanged. | 7 | Pass; `demo-sandbox` |
| What it does | 3 | Pass |
| Keeps one track and its set in this browser. | 9 | Pass; `local-privacy` |
| Marks each cue at the current playback time. | 8 | Pass; `cue-workflow` |
| Shows beat numbers from the BPM and offset you enter. | 10 | F-2-5 |
| Replays Contour, Orbit, and Shards at the same track time. | 10 | Pass; `deterministic-scenes`; see F-2-6 |
| Imports and exports a Cuebook cue file. | 7 | Pass; `cue-workflow` |
| Audio is not included. | 4 | Pass; `json-no-audio` |
| Installs on your device and reopens a saved set offline. | 10 | Pass; `pwa-install`, `offline-reload` |
| Free includes five cues. | 4 | Pass; `free-five` |
| Plus adds more than five cues and rehearsal recording. | 9 | Pass; `free-five`, `plus-recording` |
| Tracks are not uploaded. | 4 | Pass; `local-privacy` |
| Cuebook has no analytics, trackers, third-party runtime scripts, or CDN font requests. | 12 | Pass; `no-tracking-runtime` |
| Choose an audio file your browser can play. | 8 | Pass; format guidance |
| Record rehearsals in desktop Chrome or Firefox. | 7 | F-2-12 |
| See privacy and terms. | 4 | Pass |
| Run locally | 2 | Pass |
| Node.js 20 or newer is required. | 6 | Pass; setup requirement |
| Open the local URL Vite prints. | 6 | Pass |
| Keyboard controls outside form fields: | 5 | Pass |
| Space: play or pause | 4 | Pass |
| M: mark a cue at the current playback time | 9 | Pass |
| Left / Right: nudge the playhead by one second | 9 | Pass |
| Test and build | 3 | Pass |
| Browser tests use Playwright 1.58.2. | 5 | Pass; package pin confirmed |
| They cover demo isolation, cues, downloads, mobile layout, accessibility, licenses, and offline reload. | 13 | Pass; suite confirmed |
| Claim checks are mapped in `.factory/claims.json`. | 6 | Pass |
| License verification allowance | 3 | Pass as heading |
| Cuebook checks a restored license, then caches its verdict for one day. | 12 | F-2-13 |
| The Sociobot endpoint allows 30 immediate checks per source client. | 10 | F-2-10 |
| An immediate 31st check returns `429` with `Retry-After` in seconds. | 10 | F-2-10 |
| The allowance replenishes, so there is no fixed reset window. | 10 | F-2-14 |
| Cuebook keeps the pasted token after a `429`. | 8 | Pass; `license-rate-limit` UI behavior |
| It shows the delay when browsers can read that header, with safe wait guidance otherwise. | 15 | Pass; `license-rate-limit` UI behavior |
| The browser suite uses the recorded boundary on every run. | 10 | F-2-10; no fixture is loaded |
| This opt-in check verifies the live endpoint with safe invalid tokens. | 11 | Pass as script documentation; not run because shared services are out of scope |
| The live check waits 35 seconds for the client allowance to refill. | 12 | F-2-14 |
| It then verifies 30 invalid responses and the required 31st response. | 11 | F-2-10 |
| `npm run build` writes static files to `dist/`, with `dist/index.html` at its root. | 13 | Pass; `static-deployment` |
| No backend or environment variable is required. | 7 | Pass; `static-deployment` |
| Project notes | 2 | Pass |
| The researched scope is in `.factory/brief.json`. | 6 | Pass |
| The visual system and generated-art provenance are in `.factory/design.md`. | 9 | Pass |
| Verification details are in `.factory/handoff.md`. | 5 | Pass |
| Licensed under the MIT License. | 5 | Pass; `LICENSE` present |

### Terminology table

| Concept | Terms found | Required term |
| --- | --- | --- |
| Imported media | audio, audio track, track, audio file | track; use audio file only for format/storage |
| Portable timing file | cue file, Cue JSON, source JSON | cue file; introduce “Cuebook cue file (JSON)” once if needed |
| Scene | Contour / Orbit / Shards; Contour field / Signal orbit / Glass shards | Contour / Orbit / Shards |
| Workspace | set; cue sheet for the ordered cue list | set |
| Paid tier | Cuebook Plus, then Plus | Cuebook Plus on first mention; Plus thereafter |
| Isolated sample | demo, isolated sample | demo |

## Demo, sandbox, privacy, and offline evidence

- One click from home opened `/demo/` with `Demo — Cuebook`, a persistent “Demo — sample data, nothing is saved” banner, “Neon classroom rehearsal,” a 12-second generated rhythm, and five editable cues.
- The first 390 px demo viewport already showed the named set, track, cue-driven canvas, transport, and recording action.
- Editing cue 1 and selecting **Reset demo** restored “Opening contour” and all five cues. At the bottom of the editor, the sticky banner remained at y=64–149 in the 844 px viewport.
- `@claim:demo-sandbox` seeded real IndexedDB and license sentinels, exercised demo reload/reset/exit, and passed. Source confirms demo project state is memory-only and demo license functions avoid `sb_license:*`.
- Live requests through home and demo were only product-origin resources and same-origin `blob:` audio. No third-party script, font, tracker, or audio upload appeared.
- After service-worker activation, a live offline reload reopened the five-cue demo. The separate first-load fallback has F-2-1.

## Declared claim results

Each exact command in `.factory/claims.json` ran separately after `npm ci` in clean clone `/tmp/cuebook-review2-aWi5nU/repo`.

| Claim id | Exact command | Result |
| --- | --- | --- |
| `cue-workflow` | `npm run test:e2e -- --grep @claim:cue-workflow` | PASS, 1 test |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 1 test |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | PASS, 1 test |
| `json-no-audio` | `npm run test:e2e -- --grep @claim:json-no-audio` | PASS, 1 test |
| `free-five` | `npm run test:e2e -- --grep @claim:free-five` | PASS, 1 test |
| `plus-license` | `npm run test:e2e -- --grep @claim:plus-license` | PASS, 1 test |
| `license-rate-limit` | `npm run test:e2e -- --grep @claim:license-rate-limit` | PASS, 1 synthetic-response test; F-2-10 |
| `plus-recording` | `npm run test:e2e -- --grep @claim:plus-recording` | PASS, 1 Chromium test; F-2-12 |
| `three-scenes` | `npm run test:e2e -- --grep @claim:three-scenes` | PASS, 1 test |
| `deterministic-scenes` | `npm run test:e2e -- --grep @claim:deterministic-scenes` | PASS, 1 test |
| `pwa-install` | `npm run test:e2e -- --grep @claim:pwa-install` | PASS, 1 test |
| `demo-sandbox` | `npm run test:e2e -- --grep @claim:demo-sandbox` | PASS, 1 test |
| `no-tracking-runtime` | `npm run test:e2e -- --grep @claim:no-tracking-runtime` | PASS, 1 test |
| `billing-contract` | `npm run test:e2e -- --grep @claim:billing-contract` | PASS, 1 self-referential DOM test; F-2-3/F-2-4 |
| `static-deployment` | `npm run test:e2e -- --grep @claim:static-deployment` | PASS, 1 test |

## Structure, links, and accessibility

- PASS: main/legal/404 routes have route titles, `lang=en`, one h1, one main, descriptions, canonicals, social metadata, favicon metadata, skip links, shared navigation, and footers. F-2-15 records the demo social-title mismatch.
- PASS: direct demo links work. Home → Demo and browser Back focus the h1 and update the polite route announcer.
- PASS: `/demo/nope`, `/demo-extra`, `/demonstration`, and unrelated unknown routes return the designed HTTP 404.
- PASS: every same-origin navigation and metadata asset checked returned 200. `mailto:` was treated as explicit. The external checkout endpoint was not contacted because it is outside the authorized product-resource scope.
- PASS: live Axe scans at 390×844 and 1440×900 reported zero violations on home, demo, Privacy, Terms, and 404. No tested route had horizontal overflow. F-2-2 records manual touch-target failures.
- PASS: `/opt/fleet/lib/verify-url.sh` passed home and demo with no console error and correct title/lang/main/h1/alt/button checks. F-2-1 records the separate offline fallback.
- PASS: the dark rehearsal surface, lime cue beacons, cyan trace, cue rows, local display face, and deterministic canvases are product-specific and follow `.factory/design.md`.

## Earlier finding verification

I read `.factory/review-1.md`, `.factory/polish-1.md`, and the prior `.factory/handoff.md`. Every F-1 finding was checked live and in source/tests.

| Earlier id | Status in review 2 | Evidence |
| --- | --- | --- |
| F-1-1 | Fixed | Demo license path is isolated; sentinel claim passes. |
| F-1-2 | Fixed | Demo PCM has non-zero energy and audible cue tones. |
| F-1-3 | Fixed | Banner remains sticky at the bottom of the mobile editor. |
| F-1-4 | Fixed | Demo-prefix typo routes return HTTP 404. |
| F-1-5 | Fixed | Preview, three steps, limits, and pricing are present. |
| F-1-6 | Fixed | Required metadata and icons are present on main/legal/404 routes. |
| F-1-7 | Fixed | Main/legal/404 routes use header, footer, and skip links. |
| F-1-8 | Fixed | Demo and Back focus the h1 and update the live announcer. |
| F-1-9 | Fixed | Live demo Axe scans report zero violations at both widths. |
| F-1-10 | **Reopened as F-2-2** | Legal brand and email targets remain under 44 px. |
| F-1-11 | Fixed | “Record rehearsal” remains visible at 390 px. |
| F-1-12 | Fixed | Headline no longer promises “every” cue lands “on time.” |
| F-1-13 | Fixed | Public copy says “more than five cues,” not unlimited. |
| F-1-14 | **Reopened as F-2-3** | Added test repeats UI copy; it has no billing fixture. |
| F-1-15 | **Reopened as F-2-4** | Refund and revocation statements remain outside the claim. |
| F-1-16 | Fixed | README uses browser-storage language. |
| F-1-17 | **Reopened as F-2-5** | Beat claim remains outside `claims.json`. |
| F-1-18 | **Reopened as F-2-6** | Long and short scene names both remain live. |
| F-1-19 | Fixed | Dedicated no-tracking claim and request check pass. |
| F-1-20 | Fixed | README uses browser-playable format guidance. |
| F-1-21 | Fixed | Static-deployment claim passes. |
| F-1-22 | Fixed | Provider-ID/secret statement was removed. |
| F-1-23 | Fixed | README opening is direct and concrete. |
| F-1-24 | Fixed | Workflow copy is split into short sentences. |
| F-1-25 | Fixed | README avoids the unexplained PWA acronym. |
| F-1-26 | Fixed as copy; new test gap F-2-12 | API jargon was removed. |
| F-1-27 | Fixed | Browser-test description is split and under the cap. |
| F-1-28 | Fixed | Artwork caption now describes cue behavior. |
| F-1-29 | Fixed | Dialog heading is “Cuebook Plus features.” |
| F-1-30 | **Reopened as F-2-7** | Boot code changes the header back to “Cuebook Plus.” |
| F-1-31 | Fixed | Action is “Verify license.” |
| F-1-32 | Fixed | Sample result appears beside the primary action. |
| F-1-33 | Fixed | Primary action says “Import a cue file.” |
| F-1-34 | **Reopened as F-2-8** | Toast and import-limit dialog still say JSON. |
| F-1-35 | Fixed | `set` names the workspace; `cue sheet` names the ordered list. |
| F-1-36 | **Reopened as F-2-9** | Copy still mixes audio, audio track, and track. |
| F-1-37 | Fixed | The 404 h1 is “Page not found.” |

## Repository verification

- `npm test`: PASS, 10/10.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run test:e2e`: PASS, 26/26.
- `npm run build`: PASS; `dist/` produced. App JavaScript is 46.16 KB raw / 14.19 KB gzip.
- Live/current comparison: all 23 publicly served build artifacts match byte for byte. `staticwebapp.config.json` is host configuration and correctly returns the designed 404 instead of being served.

## Missed leverage

No additional AI, sync, or import/export feature is warranted. Cue-file import/export and rehearsal-video export are present. Cloud sync would conflict with the local-first model. AI would add connectivity and key handling without improving the manual, deterministic timing job.

## What would make this perfect

Close every finding above, then repeat the review from fresh mobile and desktop contexts. Repair and fully structure the offline fallback, cover every touch target, replace circular billing/rate-limit checks with real contract evidence or narrower claims, add tagged tests for beat and cache behavior, normalize all product terms, make every action and heading literal, and set demo-specific social metadata. A perfect result has no reopened finding, unlisted claim, or copy exception.
