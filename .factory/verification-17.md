# Cuebook rehearsal verification 17 — PASS

**Verdict: PASS.** This independent verification found **zero findings** at every severity and **zero untested public claims**.

**Verified:** 6 September 2026  
**Implementation candidate:** `35910c82d1880b87ff0bc6be97127c5d60dc8a56` (`test: stabilize deterministic scene claim`)  
**Documentation baseline:** `6695a7aa5120a1a645b002564e343ad464717087` (`docs: record deterministic scene repair verification`)  
**Live URL:** <https://visualizer-cuebook.sociobot.in>

## First screen

Before scrolling, fresh 1440×900 desktop and 390×844 phone contexts stated:

- **Job:** Build repeatable visual cues for your track.
- **Audience:** DJs, VJs, and educators who need repeatable scene changes from their own track.
- **First action:** **Try it with sample data**. It opens a 12-second rehearsal with five editable cues and leaves the saved set unchanged.

The desktop first action was visible at scroll position zero. The phone direct demo opened at scroll position zero with the demo heading and sample editor in view.

## Clean local checks

The checkout began at the supplied clean base. `npm ci` installed 142 packages and reported zero vulnerabilities.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 10 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — `dist/index.html` produced |
| `npm run test:e2e` | PASS — 38/38 |
| `@claim:deterministic-scenes --repeat-each=5` | PASS — 5/5 |
| Every exact command in `.factory/claims.json` | PASS — 22/22 individually |
| `npm run test:claims` | PASS — 22/22 combined |

The former verification-16 blocker is closed. The repaired in-page media-time observer kept each repeated deterministic-scene assertion inside the intended cue interval; the full suite and all five repeat runs passed.

The built app JavaScript is 40.20 KB raw / 12.50 KB gzip and app CSS is 17.64 KB raw / 4.85 KB gzip. These are within the product budgets. The local `dist/assets/app-CFB2VUvS.js` SHA-256 is `87241799e7af4ee962d5977ca6b03f8a27effb9cd924aa97470439b9ab7733eb`, exactly matching the live asset. The test-only implementation commit therefore has the expected unchanged live runtime.

## Declared claims

All 22 manifest entries were run with their exact declared command from the clean setup and have an individual output file in `qa-artifacts/verification-17/claim-*.txt`.

| Claim IDs | Result |
| --- | --- |
| `cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `cue-capacity`, `rehearsal-recording` | PASS |
| `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `free-access` | PASS |
| `beat-grid`, `accessibility-in-free`, `static-deployment`, `delete-local-set`, `clear-site-data`, `no-accounts` | PASS |
| `node-20-build`, `browser-suite-contract`, `deployment-config`, `content-ownership` | PASS |

Live landing copy and README were cross-checked against the manifest. No material public statement lacks a declared, passing claim test.

## Live product checks

Fresh browser evidence is in `qa-artifacts/verification-17/live-browser.json`, screenshots, and route reports.

- Desktop and phone sample flows opened a populated **Neon classroom rehearsal**, 0:12.000 track, five cues, and persistent `Demo — sample data, nothing is saved` banner with **Reset demo** and **Start for real**.
- Editing cue 1, then resetting, restored `Opening contour` and five cues.
- A real three-second WAV plus a saved cue/note was seeded before entering demo. Its saved IndexedDB snapshot, including audio byte size and cue values, was byte-for-byte equivalent after demo edit, reset, and exit.
- A real editor accepted `M` outside form fields, sent the skip link to `main`, normalized BPM 19 to 20 and offset −1 to 0 with an actionable recovery message, rejected malformed cue JSON and non-audio input, and kept no phone overflow at 200% root text size.
- Deleting a cue opened the confirmation dialog with focus on **Keep cue**; keeping retained one cue and confirming removed it. This closes the former destructive-action recovery finding.
- The live service worker was active and controlling the page, `registration.update()` completed, and caches were present. After priming, the real set reloaded offline with `Offline and ready. Your saved set is on this device.` The phone demo also reloaded with five cues under reduced motion.
- Request capture through real import, playback artifacts, demo, reset, exit, service-worker update, and offline reload contained only the Cuebook origin and `blob:` URLs. There were no analytics, trackers, uploads, accounts, billing, fonts, or scripts from other sites.
- Console and page-error collections were empty. Playwright Axe found zero violations on desktop home and reduced-motion phone demo. The required URL verifier also reported zero console errors and valid title, language, one h1, main landmark, image alt text, and button labels for home, demo, Privacy, Terms, and offline setup.

## Routes, legal pages, and headers

Home, `?demo=1`, `/demo/`, `/privacy/`, `/terms/`, `/offline.html`, and `/404.html` returned 200 with their own plain route titles, canonical links, descriptions, one visible h1, and `main`. An unknown route returned the designed **Page not found** page with deliberate HTTP 404; this is expected behavior, not a defect. Every internal rendered link returned 200; the two legal contact links are `mailto:` links.

`robots.txt` allows indexing and names `sitemap.xml`; the sitemap lists home, demo, Privacy, and Terms. The live manifest declares standalone display, dark colors, versioned start URL, 192/512 icons, and a 512px maskable icon. Live headers include a self-only CSP, HSTS, `nosniff`, `DENY` framing, referrer policy, and permissions policy. Hashed assets are one-year immutable; `sw.js` is `no-cache`; HTML is revalidated after 30 seconds.

There is no product backend, account system, license endpoint, payment flow, or API. Backend tenant isolation, restart persistence, health endpoint, request allowance, and 429/`Retry-After` checks do not apply.

## Earlier finding disposition

I inspected `review-1` through `review-5`, `verification-1` through `verification-16`, and the cumulative repair maps. Their current disposition is verified below.

| Earlier work | Current disposition and current evidence |
| --- | --- |
| Verification 1–4: unavailable deployment, invalid cue timing/import, range feedback, truncation, caching, and response policy | Closed. Live runtime hash matches `dist`; full browser suite covers semantic validation and import recovery; live invalid-input checks show recovery; current headers and immutable asset policy are present. |
| Verification 6–8: missing recording claim, immediate-save race, shorter replacement, cue delete recovery, demo entry position | Closed. `rehearsal-recording`, `cue-workflow`, and the complete suite pass; live delete confirmation/recovery passed; desktop/phone demo enters at scroll zero. |
| Verification 9–11: paid/license allowance, stale legal version, unavailable checkout, narrow targets, demo overflow | Closed by removal of unsupported paid features and claims; free-access/no-account request tests pass. Current legal pages show v1.0.12, phone width is 390/390, and target/layout checks pass in the full suite. |
| Verification 15: imported editor was off screen | Closed. The full suite verifies imported and restored editors are in view and focused at desktop and phone widths. |
| Verification 16: deterministic-scenes test race | Closed. Full suite is 38/38 and the exact claim passes 5/5 repeated runs. |
| Review findings F-1-1–F-1-37, F-2-1–F-2-18, F-3-1–F-3-13, F-4-1–F-4-5, and F-5-1–F-5-4, including minor copy, terminology, metadata, and touch-target findings | Closed. Current copy audit has no flags; claims cover retained promises; live route/metadata/a11y/link checks and the 22 claim runs pass. No earlier minor finding reopened. |

## Evidence files

- Command output: `qa-artifacts/verification-17/{unit-tests,typecheck,lint,build,e2e-full,deterministic-repeat-5,claims-combined}.txt`
- Exact individual claim output: `qa-artifacts/verification-17/claim-*.txt`
- Live browser details: `qa-artifacts/verification-17/live-browser.json`, `live-routes.json`, `live-recovery.json`, and `live-delete-recovery.json`
- Screenshots: `qa-artifacts/verification-17/live-home-desktop.png`, `live-demo-desktop.png`, and `live-demo-phone.png`
- URL verifier reports: `qa-artifacts/verification-17/verify-url/`

No product source, infrastructure, DNS, billing, secrets, or external service settings were changed during this verification.
