# Cuebook independent verification 3 — FAIL

**Date:** 2026-08-28  
**Candidate:** `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7`  
**Live URL:** <https://visualizer-cuebook.sociobot.in>  
**Method:** clean detached checkout at the exact candidate; no product source was changed.

## Verdict

**FAIL — do not release.** The deployment-only failure from verification 1 is resolved: HTTPS works and the live files are byte-identical to the candidate build. The normal rehearsal workflow, PWA behavior, accessibility, privacy smoke checks, and budgets pass. But the cue-sheet import path still silently accepts semantically invalid data, which can produce an unreachable cue and an invalid/unusable beat grid in the active rehearsal. The related range-feedback, truncation disclosure, live caching, and response-policy issues also remain.

## Blocking defects

### P1 — semantic-invalid cue JSON is reported as imported and leaves an unrehearsable project

With a loaded 3.000-second WAV, I imported syntactically valid `cuebook/v1` JSON containing a cue at `99` seconds plus `timing: { bpm: "not-a-number", beatOffset: -5 }`.

- The app reported **“Cue sheet imported. Check that the audio matches.”**
- The sole cue showed `99.000`, while its editor `max` was `3`; it cannot be reached on the loaded track.
- BPM rendered blank because it received a string and Beat 1 offset rendered `-5` despite its minimum of zero.

`parseCueFile` validates only presence of `timing` and cue time/scene type; it does not validate finite/ranged timing values or reconcile cue times against the loaded audio. Reject such a file before replacing the active project, or visibly normalize it and require an explicit duration-mismatch decision.

This directly undermines the brief's repeatable, exact timing cue sheet.

### P2 — invalid BPM/offset entries are silently clamped in state but remain visibly incorrect

After audio import, entering `19` BPM then blurring left the control showing `19`; entering `-1` offset left it showing `-1`. The internal model clamps them to BPM `20` and offset `0`, so the displayed timing settings disagree with the beat computations and eventual saved/exported values until reload. Normalize the fields to the accepted values or display a range error.

### P2 — free-tier import discards a cue without retaining its warning

Importing a valid six-cue file while locked stored five cues, but the limit toast is immediately overwritten by **“Cue sheet imported. Check that the audio matches.”** The user is not told that a cue was omitted. Preserve/combine the warning before mutating/replacing user data.

### P2 — content-hashed live assets are revalidated every 30 seconds

Live `/assets/app-6q2OwFvn.js` and `/assets/app-CI8R8FTv.css` both return `Cache-Control: public, must-revalidate, max-age=30`. These content-hashed immutable assets need a long-lived immutable policy for the PWA performance/caching contract.

### P3 — live browser response-policy hardening is incomplete

The live origin provides HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`, but no `Content-Security-Policy`, `Permissions-Policy`, or clickjacking protection (`frame-ancestors`/`X-Frame-Options`). `manifest.webmanifest` is served as `application/octet-stream`, not a manifest JSON MIME type. Configure these at deployment.

## Passed checks

| Area | Result | Fresh evidence |
| --- | --- | --- |
| Clean install | PASS | Detached candidate: `npm ci` installed 60 packages; audit reported 0 vulnerabilities. |
| Unit tests | PASS | `npm test`: 1 Vitest file, 4/4 tests passed. |
| Type check / exact production build | PASS | `npm run build` ran `tsc --noEmit && vite build`, producing `dist/`. No separate lint script is configured. |
| Repository browser tests | PASS | `npm run test:e2e`: 4/4 Playwright Chromium tests passed. |
| Bundle budget | PASS | App JS 31,267 B raw / 10.56 kB gzip (≤200 kB); CSS 15,224 B raw / 4.39 kB gzip (≤50 kB); font 13,292 B; hero WebP 29,712 B. |
| Lighthouse, local exact production output | PASS | Mobile scores: Performance 93, Accessibility 100, Best Practices 100, SEO 100. FCP 1.0 s, LCP 1.4 s, CLS 0.054, TBT 320 ms. |
| Live candidate identity | PASS | HTTPS loaded normally. SHA-256 matched local `dist/` for root `8027d16f…314636ec`, JS `27694cc9…b15120`, CSS `b38e9368…e450d4`, service worker, manifest, privacy, and terms. |
| Normal rehearsal flow | PASS | Imported WAV, chose scenes and boundary scene values, scrubbed/seeked, added five cues (including keyboard `M`), enforced the sixth-cue Plus dialog, edited/deleted/re-added, exported JSON without audio bytes, and verified persistence after reload. No console/page errors. |
| Paid recording path | PASS | With an optimistic locally cached valid test license (no billing call), a Chromium recording started and stopped, downloading `record-rehearsal.webm` with the “Rehearsal video saved.” confirmation. |
| Invalid basic input/recovery | PASS | Non-audio selection produced an actionable audio-format error; malformed JSON produced its parse error and left the editor usable. Semantic-invalid JSON is the P1 failure above. |
| Desktop/mobile/keyboard | PASS | At 390×844, live `scrollWidth - clientWidth = 0`. First Tab reaches the visible skip link and Enter focuses `main`; keyboard `M`, Space, and arrow handling work outside form fields. |
| Accessibility/motion | PASS | Independent axe scans of onboarding and studio had zero serious/critical findings. One `h1`, `main`, title, `lang=en`, alt text, and designed 3px cyan focus state are present. Reduced motion yields `hero-art` transform `none` and `scroll-behavior: auto`. |
| PWA offline/update | PASS | Live controlled page used `cuebook-v1.0.0-shell` and `runtime`; after offline reload its saved studio, cue, and offline banner remained. In a separate local exact-build profile, replacing only the worker version produced the in-app “An update is ready. Refresh when your rehearsal is paused.” notice and the v1.0.1 shell cache. |
| Privacy/network | PASS | Normal live rehearsal traffic contained only same-origin and `blob:` requests; no analytics, CDN runtime/font, tracker, or audio upload was observed. Source inspection confirms IndexedDB local audio/project storage and JSON export excludes audio. The only outbound endpoint is the documented Sociobot license verify/checkout API, activated only by license use. |

## Live headers and cache evidence

`/`, JS, CSS, manifest, and service worker all returned HTTPS 200 with HSTS/referrer/nosniff. Root and all observed static artifacts use `public, must-revalidate, max-age=30`; the manifest returned `application/octet-stream`. The missing policies and immutable cache policy are deployment configuration defects, not a mismatch of product artifacts.

## Required remediation

1. Validate every imported timing value and cue time before changing the active project; reject or explicitly reconcile duration mismatches.
2. Make BPM/offset invalid-value handling truthful in the controls and retain the free-tier truncation warning.
3. Configure immutable hashed-asset caching, a valid manifest MIME type, CSP, Permissions Policy, and frame protection at the host.
4. Re-run independent verification against the remediated SHA and its live deployment.
