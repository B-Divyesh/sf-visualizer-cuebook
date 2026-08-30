# Cuebook independent verification 5 — PASS

**Verdict: PASS — release candidate `de2fbd51eba8b794baa30365f53ad2fe5688725e` is acceptable at https://visualizer-cuebook.sociobot.in.**

Verification was performed on 2026-08-30 from a clean, unchanged checkout at that exact commit. No product source was modified. The earlier deployment-only failure is resolved: HTTPS works and the deployed root, JavaScript, CSS, service worker, manifest, Privacy, and Terms files match this candidate's fresh production build byte-for-byte.

## Cold first read

A fresh Chromium visit to `/` returned HTTP 200 with no console or page errors. The first screen says: “Make every visual cue land on time.” It identifies “DJs, VJs, and educators” and directs them to **Try it with sample data**. The same first view gives the three plain facts: audio stays in the browser, saved sets work offline, and five cues are free. The link opens `/demo/` in one click.

## Required clean-checkout quality gates

| Check | Result | Evidence |
| --- | --- | --- |
| Install | PASS | `npm ci`: 140 packages installed; audit reported 0 vulnerabilities. |
| Every declared claim command | PASS | Each of the 11 `test` fields in `.factory/claims.json` was invoked separately against the production-preview demo entry point. The consolidated `npm run test:claims` cross-check completed 11/11. |
| Unit tests | PASS | `npm test`: 3 files, 9 tests passed. |
| Type check | PASS | `npm run typecheck` passed. |
| Lint | PASS | `npm run lint` passed. |
| Browser integration | PASS | `npm run test:e2e` passed all 17 Chromium tests. |
| Exact production build | PASS | `npm run build` ran `tsc --noEmit && vite build` and emitted `dist/`. |

### Claim evidence

All eleven declared claims passed: `cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `free-five`, `plus-license`, `three-scenes`, `deterministic-scenes`, `pwa-install`, `plus-recording`, and `demo-sandbox`.

The browser suite exercised a generated local WAV, cue creation, JSON download, reload persistence, separate-context offline reload, same-origin request capture, free-limit confirmation, three scene selection, exact canvas frame repeatability, manifest/controller, recording download, demo reset/isolation, and a recorded successful license-verification response. There is one test per claim id, as required.

## Independent product exercise

- Imported a representative local WAV on the live deployment, selected Orbit, made a cue, exported `verify.cuebook.json`, and observed `Saved locally` with no console/page errors.
- Boundary and recovery checks live: a cue at `0.000` seconds is retained; malformed JSON produces its parse error; an invalid BPM in cue JSON produces “Cue timing BPM must be a number from 20 to 300”; entering BPM `19` normalizes visibly to `20`; a six-cue free import opens a confirmation dialog, and cancelling leaves the existing one-cue set unchanged.
- With only a cached local fixture license (no billing request), live `/demo/` accepted six cues and downloaded `six-rehearsal.webm` after recording.
- Live demo loaded five sample cues, displayed the persistent “Demo — sample data, nothing is saved” banner, and was isolated from the normal IndexedDB project in the declared suite.

## Accessibility, responsive, privacy, and PWA

- Playwright Axe scans found **zero serious or critical** findings on the live landing page, imported studio, and 390×844 reduced-motion demo. This is the required Playwright Axe integration equivalent to the Axe CLI check.
- First Tab reaches the visible 44 px skip link; Enter moves focus to `main`. Keyboard `M` creates a cue only outside form controls. At 390 px, `scrollWidth - clientWidth = 0`; reduced motion yields `scroll-behavior: auto` and no hero transform.
- Normal live rehearsal traffic contained only the product origin and `blob:` URLs; there were no analytics, CDN runtime/font/script requests, trackers, or audio upload. Browser console/page errors were empty. Source and export exercise confirm the audio blob remains in IndexedDB and JSON contains metadata/cues only.
- A live page had an activated service-worker controller. After saving local audio, an offline reload retained the studio and showed the offline banner. A separate in-memory service-worker version simulation of the exact built shell triggered the in-app notice: “An update is ready. Refresh when your rehearsal is paused.”

## Deployment identity, headers, and budgets

Fresh local `dist/` hashes match the live URL:

| File | SHA-256 |
| --- | --- |
| `index.html` | `63a18df306377b48b4a0b7ff9de3240774f0f116864d52e745b347c6521a255c` |
| `assets/app-CHLZr0RO.js` | `c89d5f360c3a050965c5a55822a3f15ddf05eef2a24965138ea6d5090b45f2eb` |
| `assets/app-D9H_P3iS.css` | `54eaea92980ea8c3a9483a681b0385b4117b564f6380aa581e1d9769feb60ae6` |
| `sw.js` | `0beef69b374498d1e0a99baeb4e22b4ebf5515d94022fccf114d0f7d41836025` |
| `manifest.webmanifest` | `4f67a39a7dd64b81dba739b183360dec964744704120fd37edfec03e1f65bb20` |

`/`, `/demo/`, `/privacy/`, `/terms/`, `/manifest.webmanifest`, and `/sw.js` return 200; an unknown URL returns the designed body with HTTP 404. Live headers include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, referrer and permissions policies, and `X-Frame-Options: DENY`. Hash-named JS/CSS assets are `public, max-age=31536000, immutable`; the manifest is `application/manifest+json` and the service worker is `no-cache`.

Budgets pass: app JS is 37,616 B raw / 12,300 B gzip (under 200 KB), CSS is 15,939 B raw / 4,540 B gzip (under 50 KB), self-hosted font is 13,292 B (under 120 KB), and hero WebP is 29,712 B (under 300 KB).

## Severity and limits

No P0, P1, P2, or P3 product defects were found in this verification.

Cuebook itself is a static PWA with no product-origin server endpoint, so no product request allowance applies. The optional Plus verification endpoint is the external Sociobot billing API. Per the work order's explicit prohibition on connecting to non-`sf-visualizer-cuebook` resources, it was not contacted or load-tested for 429/`Retry-After`; its browser return flow was instead verified with the recorded fixture required by the claim. This is a constrained external-infrastructure check, not an observed product-origin defect.

