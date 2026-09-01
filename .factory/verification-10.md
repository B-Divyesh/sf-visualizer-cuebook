# Cuebook independent verification 10 — PASS

**Verdict: PASS.** Candidate `1458690be3485dd2c82d69b4a15380096045c392` is the exact deployment at <https://visualizer-cuebook.sociobot.in>. The local-first PWA meets the researched brief: it imports user-owned audio, maintains manual time/beat cues, previews three deterministic scenes, exports cue JSON without audio bytes, records where supported, and works offline after first visit. All declared claim tests pass. No release-blocking defect was found.

Verification performed from a clean dependency install on 2026-09-01. Product source was not changed.

## Required first-read check

**PASS.** A cold 1440 × 900 visit showed:

- **What it does:** “Build repeatable visual cues for your audio.”
- **For whom:** “For DJs, VJs, and educators who need repeatable scene changes from their own audio.”
- **What to do first:** the visible, one-click **Try it with sample data** action; adjacent copy says it opens a 12-second rehearsal with five editable cues while leaving the saved set unchanged.

The first screen also plainly states that audio stays in the browser, saved sets work offline, and five cues are free. The action opened `/demo/` with the persistent “Demo — sample data, nothing is saved” banner, Reset demo, Start for real, a 12-second generated WAV, and five cues.

## Claims contract

**PASS: 15/15.** `.factory/claims.json` exists and each exact command was run independently from the demo entry point after `npm ci`; all passed. `npm run test:claims` also passed all 15 tagged tests.

| Claim | Result | Evidence |
| --- | --- | --- |
| `cue-workflow` | PASS | Local WAV import, marking, reload persistence, and cue-file download completed. |
| `offline-reload` | PASS | Saved studio re-opened in a dedicated offline browser context. |
| `local-privacy` | PASS | Demo editing, playback, export, reset, and exit stayed within allowed local traffic. |
| `json-no-audio` | PASS | Export held only `audio.name` and `audio.duration`; no audio bytes. |
| `free-five` | PASS | Six-cue import confirms before truncation and retains the five-cue limit. |
| `plus-license` | PASS | Recorded valid response stored the token, cleaned the URL, and unlocked controls. |
| `license-rate-limit` | PASS | Recorded fixture verifies the UI’s rate-limit recovery state. |
| `plus-recording` | PASS | Supported capture downloads WebM; unsupported capture gives recovery guidance. |
| `three-scenes` | PASS | Contour, Orbit, and Shards are selectable. |
| `deterministic-scenes` | PASS | Returning to the same time gives identical canvas pixels. |
| `pwa-install` | PASS | Manifest, icons, standalone display, and active service worker were found. |
| `demo-sandbox` | PASS | Sample flow and reset leave real-project and license sentinels untouched. |
| `no-tracking-runtime` | PASS | Home/demo runtime uses no third-party scripts, trackers, or font CDN. |
| `billing-contract` | PASS | US$12 one-time contract and Sociobot checkout URL match the fixture. |
| `static-deployment` | PASS | Fresh static build runs without runtime environment configuration. |

## Clean-checkout quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 140 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | PASS | 3 files, 10 tests. |
| `npm run typecheck` | PASS | No TypeScript errors. |
| `npm run lint` | PASS | No ESLint findings. |
| `npm run build` | PASS | `tsc --noEmit && vite build` produced `dist/`. |
| `npm run test:e2e` | PASS | 26 Playwright tests in an isolated run. |
| `npm run test:claims` | PASS | 15 claim tests in an isolated run. |

This is a static PWA, so package-consumer, CLI, backend health/concurrency, persistence-boundary, and sign-in-provider checks do not apply. No `verify-url.sh` was present in this checkout; its required title/lang/main/alt/console checks were performed directly in Playwright.

## Functional, accessibility, and privacy checks

**PASS.** Local browser tests cover normal WAV import, cue editing, cue JSON import/export, invalid JSON recovery, out-of-range BPM normalization, audio-before-cue recovery, destructive-change confirmation, free-limit confirmation, demo reset/exit, keyboard shortcuts, and recording recovery. A live demo end-to-end run exported five cues. Its JSON keys were `format`, `title`, `audio`, `timing`, `cues`, and `exportedAt`; `audio` was only `{name, duration}`.

Live desktop and 390 × 844 mobile checks found no console or page errors and no axe serious/critical findings (in fact, no axe violations). At 390 px, `scrollWidth === clientWidth === 390`; `prefers-reduced-motion: reduce` was active. The skip link received a designed `rgb(88, 230, 210) solid 3px` focus outline. Page semantics included the appropriate title, `lang`, one H1, and main landmark.

The live demo request log contained only `visualizer-cuebook.sociobot.in` HTML, JS, CSS, self-hosted font/art, and a same-origin `blob:` generated audio URL. There were no analytics, tracker, third-party script, CDN font, or audio-upload requests. Normal demo behavior made no billing request.

## PWA, deployment, headers, budgets, and rate limit

**PASS.** The live service worker was activated and controlled the page. In a separate context, `/demo/` loaded online, the context was made offline, and reload retained the demo studio and banner. The worker uses an update-capable registration; `sw.js` is served `no-cache`.

`/`, `/demo/`, `/privacy/`, `/terms/`, manifest, and service worker returned 200; an unknown route returned the designed 404 with HTTP 404. Live responses supply CSP including `frame-ancestors 'none'`, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`. Hashed assets use a one-year immutable cache; manifest caching is one day.

Production bundle sizes are within budget: application JS 46,160 bytes raw, application CSS 17,525 bytes raw, largest image 29,712 bytes, and self-hosted font 13,292 bytes.

The client allowance is documented in README as a burst of **30** license checks per source client with a replenishing allowance. After a full refill, fresh invalid-token requests 1–30 each returned the expected `200` `{"valid":false,"reason":"invalid"}` body. Request 31 returned **429** with **`Retry-After: 4`**. The required production rate-limit behavior is therefore enforced.

Candidate/live SHA-256 parity:

| Artifact | SHA-256 |
| --- | --- |
| `/` | `ed264bb3a4adc84f01a524fd3b8d26d689750b7a30e34d969757a10f238499cc` |
| `assets/app-J0c8pzUA.js` | `d5d9c3adda628e7c94f50a064a6463c0d76ce0013031197c587eb90183d10861` |
| `assets/app-LosMPPYx.css` | `656f6bb19558258f56349f811b9f67246a5c3e56029c0a20a07a76ef2efdd203` |
| `/sw.js` | `6a73cbac1607651831606b5018ed4699fe8d39852d318295893564f741c19e32` |
| `/manifest.webmanifest` | `2ebd93763bf65d781d1c96d6a507857b0ad1ede395b7bb7457fffd33370ae72c` |

## Non-blocking finding

### P3 — rate-limit helper is not safe with a partially depleted bucket

`npm run verify:license-rate-limit` waits a fixed 35 seconds, then unconditionally parses each of its first 30 responses as JSON. Twice, when the shared source-client allowance had not fully refilled, it encountered a plaintext 429 among those responses and exited with `SyntaxError: Unexpected token 'T', "Too Many R"... is not valid JSON`. The API itself passed the subsequent controlled 30/31 boundary check above.

Impact: this is verifier-tooling fragility, not a product runtime failure or unmet rate-limit requirement. Improve the helper to either wait/retry on a pre-boundary 429 or report the partial allowance clearly before attempting the 30-request proof.

## Release decision

**PASS.** Candidate deployment parity, claims, core rehearsal workflow, local privacy, offline PWA behavior, accessibility, headers, budgets, and live rate-limit enforcement all pass. The P3 helper issue is recorded for a future maintenance change.
