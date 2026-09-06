# Cuebook repeatable visual cue review 6 — PASS

**Verdict: PASS.** This strict review found **zero findings at every severity** and **zero untested public claims**.

**Reviewed:** 6 September 2026

**Implementation candidate:** `35910c82d1880b87ff0bc6be97127c5d60dc8a56` (`test: stabilize deterministic scene claim`)

**Documentation baseline:** `e269941fad55019c8a54a8c875c65787bc204b30` (`docs: record independent verification 17`)

**Live URL:** <https://visualizer-cuebook.sociobot.in>

The implementation commit changes only the deterministic-scene browser test. The local production JavaScript and CSS hashes match the live assets, so the live runtime is the reviewed implementation artifact. No product code, infrastructure, DNS, billing, secrets, or other service was changed.

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts were opened at scroll position zero. Before scrolling, both answered:

- **Job:** Build repeatable visual cues for your track.
- **Audience:** DJs, VJs, and educators who need repeatable scene changes from their own track.
- **First action:** **Try it with sample data**. Adjacent text says it opens a 12-second rehearsal with five editable cues and leaves the saved set unchanged.

The action and the three facts about local tracks, offline saved sets, and free tools were visible in the first phone viewport. The headline names the job, the audience sentence is direct, and the action opens the populated sample in one click.

## Clean checkout checks

`npm ci` installed 142 packages and reported zero vulnerabilities. The checkout had no tracked changes before the review.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 10 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/index.html` produced |
| `npm run test:e2e` | PASS — 38/38 |
| Every exact command in `.factory/claims.json` | PASS — 22/22 individually |
| `npm run test:claims` | PASS — 22/22 combined |
| `@claim:deterministic-scenes --repeat-each=5` | PASS — 5/5 |

The build emits 40.20 KB application JavaScript raw / 12.50 KB gzip and 17.64 KB application CSS raw / 4.85 KB gzip. These are below the product budgets. Local and live asset hashes are identical:

- JavaScript: `87241799e7af4ee962d5977ca6b03f8a27effb9cd924aa97470439b9ab7733eb`
- CSS: `3a6f5edbebf62f4890bcc2cbacc7ccc0b6f59d17578cd892b958e83d92950b11`

## Declared and public claims

All 22 entries were run with their exact declared commands. Each selected one tagged test and passed:

| Claim group | Result |
| --- | --- |
| `cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `cue-capacity`, `rehearsal-recording` | PASS |
| `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `free-access` | PASS |
| `beat-grid`, `accessibility-in-free`, `static-deployment`, `delete-local-set`, `clear-site-data`, `no-accounts` | PASS |
| `node-20-build`, `browser-suite-contract`, `deployment-config`, `content-ownership` | PASS |

The live landing page, product states, legal pages, README, demo notes, and copy audit were cross-checked against the manifest. No material statement lacks a claim entry and test. The retained quantitative statements are asserted, including 12-second demo duration, five sample cues, more-than-five cue support, Node 20, and offline behavior.

## Sample, real data, and rehearsal timing

The desktop action opened **Neon classroom rehearsal** with `sample-beacon-rhythm.wav`, duration `0:12.000`, five populated cues, editable scene controls, and working audio. The persistent label said **Demo — sample data, nothing is saved** and included **Reset demo** and **Start for real**.

Two complete sample rehearsals observed all five cue changes. The largest timing difference was 37 ms, within the researched ±150 ms target. The sample was audible, and returning to saved times retained deterministic scene behavior through the passing claim and repeated test.

A real three-second WAV, cue, note, scene, and audio blob were saved before demo entry. Editing and resetting the demo restored `Opening contour` and all five cues. Leaving the demo returned to a byte-for-byte equivalent real IndexedDB snapshot. Demo state did not read or write the real set.

## Normal, invalid, boundary, and recovery paths

The full browser suite covers real WAV import, immediate cue persistence, edit, seek, export and restore, more-than-five cues, shorter replacement audio, recording and its fallback, project deletion, and browser site-data clearing.

Fresh live checks also confirmed:

- BPM `19` normalizes to `20`; offset `-1` normalizes to `0`; the recovery message gives the accepted range.
- Malformed cue JSON and a non-audio file are rejected without losing the active set.
- Cue deletion opens a dialog with focus on **Keep cue**. Cancel keeps the cue; confirmation removes it.
- The skip link focuses `main`; `M` marks a cue; Space plays and pauses; Right Arrow moves the playhead.
- The imported real set opens in the editor rather than leaving the editor below landing content.

## Phone, keyboard, accessibility, and motion

- The 390 px home and demo had no horizontal overflow, including at 200% root text size.
- The primary action has a visible 3 px cyan focus outline.
- Forward navigation and browser Back move focus to the route h1.
- Playwright Axe found zero violations on the fresh desktop home and reduced-motion phone demo.
- Reduced-motion phone mode had zero running document animations.
- The persistent demo controls remained visible at the fifth cue.
- Route and full-suite checks cover labelled controls, one h1, landmarks, touch targets, dialog focus, and phone navigation.

## Privacy, offline use, and updates

The fresh live request capture covered real import, playback, cue changes, demo entry, sample playback, reset, exit, service-worker update, and offline reload. All requests used the Cuebook origin or browser `blob:` URLs. There were no analytics, trackers, uploads, account, billing, CDN font, or external script requests. Console and page-error collections were empty.

The live service worker was activated and controlled the page. `registration.update()` completed, and versioned shell and runtime caches were present. After priming, the real set reloaded offline with **Offline and ready**. The exact `offline-reload` test separately proves both the saved real set and sample demo in dedicated offline contexts.

## Routes, links, legal pages, and 404

Home, `/demo/`, Privacy, Terms, offline setup, and the designed 404 artifact returned 200 with the expected route title, one h1, `lang=en`, `main`, and footer. Unknown `/definitely-not-a-cuebook-route`, `/demo/nope`, and `/demo-extra` paths returned the designed **Page not found** page with deliberate HTTP 404. Those expected 404 responses are not defects.

Every rendered internal link returned 200; the legal contact links are explicit `mailto:` links. `robots.txt`, sitemap entries, route metadata, standalone manifest, icons, self-only CSP, HSTS, framing protection, referrer policy, permissions policy, immutable hashed-asset caching, and `sw.js` no-cache behavior are present.

## Performance and visual review

Fresh mobile Lighthouse results:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 100 | 100 | 100 | 100 | 1.09 s | 0.053 | 14 ms |
| Demo | 100 | 100 | 100 | 100 | 1.14 s | 0.030 | 53 ms |

The dark rehearsal interface, glass timing landscape, lime cue markers, cyan trace, scored cue rows, and deterministic canvas scenes match `.factory/design.md`. The phone layout drops the hero art and stacks the work controls. The result is task-specific and does not use a generic landing-page treatment.

## Earlier finding disposition

All earlier review and verification reports, including minor findings, were inspected. Current disposition is:

| Earlier findings | Current disposition and proof |
| --- | --- |
| Review 1 `F-1-1`–`F-1-4` | Closed. Demo storage is isolated, the sample has audible PCM, the banner is persistent, and demo-like invalid paths return designed 404 responses. |
| Review 1 `F-1-5`–`F-1-11` | Closed. Landing structure, route metadata/shared landmarks, navigation focus, Axe, 44 px targets, and labelled phone recording are covered by live route and full-suite checks. |
| Review 1 `F-1-12`–`F-1-22` | Closed. Unsupported timing, paid, provider, format, and implementation claims were removed or replaced by the current tested claim set. |
| Review 1 `F-1-23`–`F-1-37` | Closed. The copy audit has no flags; terminology is consistent; actions name results; the 404 h1 is literal. |
| Review 2 `F-2-1`–`F-2-9` | Closed. Offline structure/CSP, legal targets, beat-grid behavior, scene names, and track/cue-file terms pass current route, accessibility, copy, and claim checks. |
| Review 2 `F-2-10`–`F-2-18` | Closed. Unsupported license/rate-limit/Firefox claims are absent; accessibility wording, demo metadata, preview copy, editor heading, and destructive actions are current and tested. |
| Review 3 reopened `F-1-19` and `F-3-1`–`F-3-5` | Closed. Complete same-origin privacy flow, 12-second sample, cue-triggered scenes, WebM content, consistent demo save copy, and seeded real-data isolation pass. |
| Review 3 `F-3-6`–`F-3-13` | Closed. Skip text, labels, demo terminology, recording recovery, README wording, and deployment/art language are plain and consistent. |
| Review 4 reopened `F-1-20`, `F-3-9`, and `F-4-1`–`F-4-5` | Closed. Audio and recording errors are plain; deletion, no-account, phone navigation, Node 20, and ownership claims have passing tests. |
| Review 5 `F-5-1`–`F-5-4` | Closed. Site-data clearing, browser-suite coverage, deployment configuration, and visible demo route identity are each claim-owned and passing. |
| Verification 1 P0 and verifications 1–4 input/caching/policy findings | Closed. TLS/live routing works; invalid cue/timing recovery passes; live assets are immutable and required response headers are present. |
| Verification 6 missing recording claim | Closed by `rehearsal-recording`, including WebM audio/video and fallback checks. |
| Verification 7 immediate-save loss | Closed by `cue-workflow`, which reloads as soon as the new cue appears. |
| Verification 8 shorter replacement, delete recovery, and demo entry | Closed by full-suite replacement and confirmation tests, fresh live delete recovery, and direct demo state. |
| Verification 9 allowance and legal label; verification 10 helper issue | Closed by removal of the unsupported paid/license path. All routes now show v1.0.12. No product API remains to rate-limit. |
| Verification 11 unavailable checkout, narrow targets, and demo overflow | Closed by removal of paid purchase claims and UI, passing target checks, and 390 px/200% no-overflow evidence. |
| Verification 15 imported editor below landing content | Closed. Fresh real import opens the editor, and the full suite checks desktop and phone import/restored-set visibility and focus. |
| Verification 16 deterministic test race | Closed. The full suite passes 38/38 and the exact claim passes 5/5 repeated runs. |
| Verifications 5 and 12–14 | These reports had no open product finding. Their accepted behaviors remain covered by current checks. |

No earlier finding, including a minor one, is open or has regressed.

## Applicability and missed leverage

Cuebook is a static local-first PWA. It has no backend, tenant, account, API, license, checkout, payment, or server-side storage. Backend isolation, restart persistence, health, request allowances, and 429/`Retry-After` checks do not apply.

No missing AI or sync feature warrants a finding. The brief calls for manual dependable timing, local audio, cue-file import/export, deterministic scenes, rehearsal recording, and offline use; each is present. Adding a network model or sync service would not improve the stated timing job and would weaken the local-only privacy model.

## Evidence

- Command output and individual claims: `.factory/qa-artifacts/review-6/`
- Live browser record: `.factory/qa-artifacts/review-6/live-review.json`
- Desktop and phone captures: `.factory/qa-artifacts/review-6/live-*.png`
- Lighthouse summaries: `.factory/qa-artifacts/review-6/lighthouse-summary.txt`
- URL verifier output: `.factory/qa-artifacts/review-6/verify-url/`

**Final verdict: PASS — zero findings and zero untested claims.**
