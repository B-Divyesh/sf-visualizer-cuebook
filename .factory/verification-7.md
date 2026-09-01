# Cuebook independent verification 7 — FAIL

**Verdict: FAIL.** Candidate `6ec6aaf30d18370f12883c12fa72723db45a8b22` does not meet the local-first persistence acceptance requirement. Verification was performed on 2026-09-01 from a clean checkout against `https://visualizer-cuebook.sociobot.in`. No product code was changed.

## Release-blocking finding

### P1 — a newly marked cue can be lost on an immediate refresh

**Confirm and check that:** state survives a refresh as required for this offline local-first PWA.

Fresh live-browser evidence with an uploaded three-second WAV file:

| Wait after **Mark cue** before reload | Cues after reload |
| --- | ---: |
| 0 ms | 0 |
| 100 ms | 0 |
| 250 ms | 1 |
| 350 ms | 1 |
| 500 ms | 1 |
| 750 ms | 1 |

The cue row appears immediately and the header changes to `Saving…`, but `queueSave()` defers the IndexedDB write by 250 ms. The prior saved project, which has no cues, is therefore restored when a user refreshes or closes the tab during that interval. The declared `cue-workflow` test waits 500 ms before reloading, so it does not cover this user-visible loss window.

This prevents the product from reliably retaining a just-marked timing transition. Confirm and check that a repair makes the write durable before the action is treated as saved, then add a regression that reloads immediately after marking and retains the cue.

## Cold first read

**PASS.** A fresh, uncached Chromium visit returned HTTP 200 with title `Cuebook — visual cues for your audio`, one H1, and `lang="en"`. The first screen states that Cuebook builds repeatable visual cues from a user's audio, names DJs, VJs, and educators, and offers **Try it with sample data**. That one click opens `/demo/`, a 12-second rehearsal with five editable cues.

## Required claims checks

`.factory/claims.json` exists and contains 14 declared claims. Every listed command was run separately from this clean checkout after `npm ci`; the consolidated `npm run test:claims` result was **14 passed (43.8 s)**. The unit claim-contract check also confirms the declared IDs and `@claim:` browser tests have a one-to-one mapping.

Passed declared claims: `cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `free-five`, `plus-license`, `plus-recording`, `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `billing-contract`, and `static-deployment`.

The P1 above is independent fresh evidence and shows that the current `cue-workflow` claim test has an insufficient timing boundary even though it passes.

## Local checks

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | Lockfile install completed; audit reported 0 vulnerabilities. |
| `npm test` | PASS | 9 tests in 3 files. |
| `npm run typecheck` | PASS | TypeScript completed with no errors. |
| `npm run lint` | PASS | ESLint completed with no findings. |
| `npm run build` | PASS | Produced `dist/`. |
| `npm run test:e2e` | PASS | 22 browser tests passed in 1.0 minute. |
| `npm run test:claims` | PASS | 14 tagged claim tests passed. |

The production build is within the static-PWA initial bundle budgets: app JS is 40.10 kB raw / 12.84 kB gzip and app CSS is 17.30 kB raw / 4.82 kB gzip.

## Independent live product checks

- **Representative workflow:** the demo opened with project `Neon classroom rehearsal`, five cues, and its persistent `Demo — sample data, nothing is saved` controls. Selecting Orbit set its pressed state. Export created valid `cuebook/v1` JSON with five cues and audio metadata only (`sample-beacon-rhythm.wav`, 12 seconds); it contained no audio bytes. Reset restored five cues.
- **Input validation and recovery:** an invalid cue file with non-numeric BPM retained zero cues, preserved BPM 120 and offset 0, and showed `Cue timing BPM must be a number from 20 to 300.` A six-cue Free import displayed the confirmation dialog. Cancel kept the current cue sheet unchanged and displayed its recovery message.
- **Accessibility and keyboard:** Axe found no serious or critical findings on live desktop or 390 × 844 mobile demo pages. The skip link has a visible `rgb(88, 230, 210) solid 3px` focus outline; Enter moved focus to `main`. At 390 px, document `scrollWidth` and `clientWidth` were both 390. Visible controls measured at least 44 px on their shorter dimension; the hidden native file input is excluded from that measurement. Reduced-motion media was active.
- **Console and page errors:** none during the home, demo, export, reset, service-worker, and offline checks.
- **Privacy:** the complete live home/demo interaction request log contained only `https://visualizer-cuebook.sociobot.in` resources and browser-generated `blob:` URLs. No tracking, analytics, CDN, or audio-upload request was observed.
- **PWA/offline:** the live demo had an activated service worker controlling the page. `registration.update()` completed. In a dedicated context, after the first online load, an offline reload retained the studio and displayed the offline banner.
- **Links and routes:** internal links found across home, demo, privacy, terms, and 404 returned HTTP 200. `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200; `/demo/nope` returned the styled 404 with HTTP 404.

## Deployment identity, headers, and caching

The fresh local production output matches the live product byte-for-byte for the principal deployed artifacts:

| Artifact | SHA-256 | Match |
| --- | --- | --- |
| `/` | `0bd395416d90af8d2f75e797c76f5a50c819890f36a3d5d851fbbf04bef7e2de` | yes |
| `/assets/app-C3iipUuf.js` | `da46ffd05422ced58802b110984e27bec0a9937def147e0baf27f99a1229d980` | yes |
| `/assets/app-BGpF-uV8.css` | `8e661b8038b4d668533806f50d83f52fcbf21e24d51b3d7409a2e0540a251a9b` | yes |
| `/sw.js` | `1ae8a594e5190a06598a7bd3e8987a5b48526ccee51ba9d9d96ce425490744b2` | yes |

Live responses include a self-only CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, and Permissions-Policy. The hashed app JS uses `Cache-Control: public, max-age=31536000, immutable`; `sw.js` uses `no-cache`; the manifest uses a one-day cache.

Cuebook is a static application with no product-origin server endpoint or documented product request allowance. The external purchase and license links were not contacted during this verification because they are outside the product origin.

## Required next step

Make local cue edits durable without the 250 ms loss window, add an immediate-refresh regression to the `cue-workflow` claim test, then repeat the declared claims and independent verification.
