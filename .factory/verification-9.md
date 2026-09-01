# Cuebook independent verification 9 — FAIL

**Verdict: FAIL.** Candidate `40dfb4f502ef4006ff290f0b94b101ca3e79056e` is deployed at <https://visualizer-cuebook.sociobot.in> and its tested application assets match the candidate exactly. The core local-first rehearsal experience passes its functional, privacy, accessibility, PWA, and build checks. Release remains blocked by one unverified production requirement: the optional Sociobot license-verification endpoint has no documented client request allowance, so the required allowance boundary and `429`/`Retry-After` behavior cannot be confirmed. A lower-severity route build-label discrepancy is also recorded.

**Method:** clean checkout at the stated candidate on 2026-09-01. Product source was not changed. The report follows the supplied brief, claims registry, and work order.

## Release-blocking finding

### P1 — license verification has no documented request allowance

**Confirm and check that:** the optional Plus license verification API documents a per-client allowance and, after that allowance is exceeded, returns HTTP `429` with a `Retry-After` response header.

Evidence:

- The product calls `GET https://api.sociobot.in/api/v1/products/visualizer-cuebook/verify?license=…` in `src/license.ts` when a real license is restored or captured.
- Repository and product-text searches found no documented request allowance, rate-limit policy, or expected `Retry-After` value for that request.
- One safe invalid-license verification on 2026-09-01 returned HTTP `200`, `{"expires_at":null,"reason":"invalid","valid":false}`, and no allowance or rate-limit response headers. Its response uses `Cache-Control: no-store`.
- With no published allowance, there is no defined boundary to confirm. Additional repeated traffic was not generated against the shared billing service.

Impact: a user-facing paid-feature verification path does not have observable evidence for the required availability boundary. The observed allowance is **not documented**; no `429` or `Retry-After` result was observed.

Required correction: publish the allowed verification request count/window and provide a repeatable product-scope check that confirms the next request returns `429` with `Retry-After`.

## Other finding

### P3 — legal routes show a stale build label

**Confirm and check that:** every route footer identifies the deployed build consistently.

The home route reports `v1.0.5`; the deployed Privacy and Terms routes report `v1.0.2`. The deployed bytes match the candidate, so this is a candidate content issue rather than a deployment mismatch. Update the legal-route footer when the application version changes.

## Required first-read check

**Confirm and check that:** a cold landing screen says what Cuebook does, who it serves, and what to select first; confirm a one-click sample is present.

**PASS.** A fresh 1440 × 900 browser showed `Build repeatable visual cues for your audio.`, then `For DJs, VJs, and educators who need repeatable scene changes from their own audio.` The visible first action is `Try it with sample data`; its adjacent text says it opens a 12-second rehearsal with five editable cues while the saved set remains unchanged. The screen also states the three plain facts: audio stays in the browser, saved sets work offline, and five cues are free. One click opened `/demo/` with a persistent `Demo — sample data, nothing is saved` banner and five editable cues.

## Declared claim checks

**Confirm and check that:** every exact command in `.factory/claims.json` runs independently through the product demo entry point.

**PASS: 14/14.** After `npm ci`, each exact command passed separately; the additional `npm run test:claims` run also passed all 14 tagged checks.

| Claim | Result | Observable check |
| --- | --- | --- |
| `cue-workflow` | PASS | Generated WAV, cue, note, reload, and cue-file download completed. |
| `offline-reload` | PASS | A dedicated context reopened the saved studio after offline reload. |
| `local-privacy` | PASS | The demo rehearsal flow recorded only permitted local traffic. |
| `json-no-audio` | PASS | Downloaded cue JSON held audio metadata without audio bytes. |
| `free-five` | PASS | A six-cue import asked before shortening and preserved the free limit. |
| `plus-license` | PASS | Recorded valid verification stored the token, cleared the URL, and enabled Plus controls. |
| `plus-recording` | PASS | The supported path downloaded WebM; the unsupported path gave recovery guidance. |
| `three-scenes` | PASS | Contour, Orbit, and Shards each reached the selected state. |
| `deterministic-scenes` | PASS | Returning to a playhead time gave the same canvas pixels. |
| `pwa-install` | PASS | Manifest, icons, standalone display, and active worker were present. |
| `demo-sandbox` | PASS | Five audible sample cues reset without changing real project or license sentinels. |
| `no-tracking-runtime` | PASS | Home and demo runtime requests remained on the product origin. |
| `billing-contract` | PASS | US$12 one-time terms and recorded checkout contract matched. |
| `static-deployment` | PASS | Fresh `dist/` ran the demo without runtime environment configuration. |

The claim-contract unit check confirms one tagged browser test for every declared claim. Landing, legal-page, and README promise text was cross-checked against the registry; no separate unlisted promise was found.

## Clean-checkout quality checks

**Confirm and check that:** installation, all available test suites, static checks, and the exact production build pass from the candidate.

| Check | Result | Evidence |
| --- | --- | --- |
| Locked dependency install | PASS | `npm ci` installed 140 packages; audit reported 0 vulnerabilities. |
| Unit and contract checks | PASS | `npm test`: 3 files and 9 tests passed. |
| Type check | PASS | `npm run typecheck` completed with no errors. |
| Lint | PASS | `npm run lint` completed with no findings. |
| Exact production build | PASS | `npm run build` ran `tsc --noEmit && vite build` and created `dist/`. |
| Full browser suite | PASS | `npm run test:e2e` completed with 25 passing checks (`test-results/.last-run.json` reports `passed`). |
| Consolidated declared claims | PASS | `npm run test:claims` completed with 14 passing checks (`test-results/.last-run.json` reports `passed`). |

This is a static PWA, not a library or CLI; a consumer-package check does not apply.

## Functional, input-recovery, and browser checks

**Confirm and check that:** the brief's smallest useful rehearsal works with normal data, timing boundaries, invalid input, recovery, and repeatable visual cues.

**PASS.** The full browser suite exercises local WAV import, marking and editing cues, immediate reload persistence, cue JSON export/import, three scene choices, deterministic canvas output, timing normalization, invalid JSON handling, input-before-audio recovery, free-limit confirmation, shorter-audio replacement confirmation, cue-deletion confirmation, demo reset and exit, and WebM recording guidance. The direct live demo also showed five audible sample cues in the isolated demo namespace.

**Confirm and check that:** desktop and 390 px mobile use remain keyboard-operable, readable, motion-aware, and free of serious browser errors.

**PASS.** The live desktop and 390 × 844 demo had zero serious or critical axe findings. Mobile `scrollWidth` and `clientWidth` were both 390. Reduced-motion media was active. The skip link received a visible `rgb(88, 230, 210) solid 3px` focus outline; the suite confirms `M` marks a cue outside form inputs without trapping focus. Live console and page error collections were empty.

## Privacy, PWA, headers, budgets, and deployment parity

**Confirm and check that:** normal rehearsal use keeps user audio local and does not make unlisted outgoing requests.

**PASS.** A fresh live demo flow recorded 14 requests, all to `https://visualizer-cuebook.sociobot.in`; no third-party script, font, analytics, tracker, or audio-transfer request appeared. The normal demo had no license token, so it did not request the optional billing API. The dedicated local privacy claim includes editing, export, reset, playback, and exit.

**Confirm and check that:** the PWA controls the live page, reloads its demo offline, and has an update-ready worker design.

**PASS.** The live registration was `activated`, controlled the page, and covered the product origin; `registration.update()` completed. After offline reload, the demo still showed its studio, five cues, and offline banner. The candidate worker uses versioned shell/runtime caches, `skipWaiting`, `clients.claim`, and the application listens for `updatefound` to show a refresh notice.

**Confirm and check that:** live browser responses apply the required protection and caching policy.

**PASS.** `/`, `/demo/`, `/privacy/`, `/terms/`, manifest, `robots.txt`, and `sitemap.xml` returned 200; an unknown page returned the styled 404 with HTTP 404. Responses include CSP with `frame-ancestors 'none'`, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and the configured Permissions-Policy. Hashed assets use one-year immutable caching, `sw.js` is `no-cache`, and the manifest uses one-day caching.

**Confirm and check that:** first-load assets fit the static-product budgets.

**PASS.** Fresh production build sizes: app JavaScript 45,445 bytes raw / 13.96 kB gzip; app CSS 17,525 bytes raw / 4.87 kB gzip; largest image 29,712 bytes; self-hosted font 13,292 bytes. These are within the supplied 200 kB JavaScript, 50 kB CSS, 300 kB hero-image, and 120 kB font budgets. A fresh standalone Lighthouse CLI run could not complete because its Chromium tab exited in this container; the browser, axe, response, and bundle evidence above was collected successfully.

**Confirm and check that:** live files are from the candidate rather than an older deployment.

**PASS.** Fresh SHA-256 equality was observed for candidate build and live artifacts:

| Artifact | SHA-256 |
| --- | --- |
| app JS | `fcbb543738d1fd865fd9e77f99773039ec0ba8336135531b37eed70b40bdbb97` |
| app CSS | `656f6bb19558258f56349f811b9f67246a5c3e56029c0a20a07a76ef2efdd203` |
| service worker | `d8f3bf11546ccf198493a991ba8f7f4a43f178a4688e0d00f292471cb9843dd8` |
| manifest | `56e220d983833cbd4410b94ff2a56234355dd851e688ffb6028fecd01b5a0e36` |

Cuebook has no product-origin backend, account, or sign-in flow, so backend concurrency, health identity, server persistence, and sign-in-provider checks do not apply. The external license check is covered by the P1 finding above.

## Release decision

**FAIL.** Confirm and check that the documented Plus verification allowance can be observed and enforced with `429` and `Retry-After` before release. Also align the legal-route version label with the deployed application version.
