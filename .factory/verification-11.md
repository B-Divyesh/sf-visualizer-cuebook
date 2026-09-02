# Cuebook independent verification 11 — FAIL

**Verdict: FAIL.** Candidate `04f96dd522f84583606cd242ab9d3fbebb1b450a` is deployed byte-for-byte at <https://visualizer-cuebook.sociobot.in>, and its free local-first rehearsal flow passes. Release is blocked because the advertised Cuebook Plus purchase link returns HTTP 404. Two responsive accessibility defects are also present.

Verification was performed from a clean candidate checkout on 1–2 September 2026. Product code was not changed.

## Release-blocking and material defects

### P1 — the advertised Cuebook Plus checkout is unavailable

- Home → **See Plus options** → **Buy Cuebook Plus** links to `https://api.sociobot.in/api/v1/products/visualizer-cuebook/checkout`.
- A fresh browser click navigated to that URL and received HTTP `404`, content type `application/json`, with body `{"error":"enabled factory product","status":404}`. There was no redirect to hosted checkout.
- A separate direct GET produced the same 404 and response body. The endpoint advertises GET via its OPTIONS response, so this is not a method mismatch.
- Impact: visitors cannot buy the US$12 one-time license or reach the promised hosted checkout. The paid product contract is not end-to-end functional.
- Required correction: enable/register this exact product slug in the production Sociobot billing service, then verify that the in-product link redirects to working hosted checkout and returns to Cuebook with a license.

### P2 — two desktop navigation targets are narrower than 44 CSS px

- At 1440 × 900 on both home and demo, **Demo** measured `41.609 × 44` CSS px and **Terms** measured `41.234 × 44` CSS px.
- The attached accessibility/design contract requires every interactive target to be at least 44 × 44 CSS px.
- Axe reports no semantic violation because target size is outside its automated coverage.
- Required correction: add enough inline padding or minimum width to `.top-nav a`, then test all visible controls at desktop as well as mobile.

### P2 — the demo has horizontal overflow from 621–768 px

- Live `/demo/` measurements: width 621 had scroll width 667; width 640 had scroll width 684; width 700 had scroll width 737; width 768 had scroll width 798. Widths 390, 620, 900, 901, 1024, 1280, and 1440 did not overflow.
- At 640 px, `.studio-actions`, **Replace track**, and **Start a new set** extended to x=`683.94`, 43.94 px outside the viewport.
- Impact: small-tablet layouts and the equivalent 200% desktop reflow require horizontal scrolling and can clip the set actions.
- Required correction: stack or shrink `.studio-heading` and `.studio-actions` before the overflow starts, then add coverage around 621–768 px and 200% text/zoom.

## Mandatory first-read check

**PASS.** A cold 1440 × 900 live visit showed:

- What it does: “Build repeatable visual cues for your track.”
- Who it is for: “For DJs, VJs, and educators who need repeatable scene changes from their own track.”
- What to do first: the visible **Try it with sample data** action. Adjacent copy explains that it opens a 12-second rehearsal with five editable cues and does not change the saved set.

The action is one click from the first screen. It opened `/demo/` with “Demo — sample data, nothing is saved,” **Reset demo**, **Start for real**, the generated 12-second track, and five populated cues. The same required information and action were visible in the 390 × 844 cold-page capture.

## Claims contract

**PASS: 18/18.** `.factory/claims.json` exists. After `npm ci`, each listed `test` command was run separately from candidate `04f96dd`; every invocation passed its single tagged test.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `cue-workflow` | PASS | Imported generated WAV, marked cue, survived immediate reload, exported cue file. |
| `offline-reload` | PASS | Saved studio reopened in a dedicated offline context. |
| `local-privacy` | PASS | Complete demo flow stayed on the product origin or a local blob URL. |
| `json-no-audio` | PASS | Export had audio name/duration only and no audio bytes. |
| `free-five` | PASS | Six-cue import required confirmation and retained five with notice. |
| `plus-license` | PASS | Recorded valid response stored token, removed it from URL, unlocked controls. |
| `license-rate-limit` | PASS | Recorded 429 fixture retained token and displayed retry guidance. |
| `plus-recording` | PASS | WebM downloaded when supported; unsupported capture gave recovery guidance. |
| `three-scenes` | PASS | Contour, Orbit, and Shards all selected correctly. |
| `deterministic-scenes` | PASS | Same scene/time produced the same canvas hash. |
| `pwa-install` | PASS | Standalone manifest, three icons, active controlling worker. |
| `demo-sandbox` | PASS | Reset/reload/exit did not touch seeded real project or license data. |
| `no-tracking-runtime` | PASS | Runtime assets and complete demo flow used no tracker, CDN, or third-party script. |
| `billing-contract` | PASS | UI matches the recorded US$12/Sociobot/Dodo fixture; this mocked contract test does not prove live checkout availability. |
| `beat-grid` | PASS | BPM/offset changed beat display without moving cue time. |
| `accessibility-in-free` | PASS | Keyboard cue command and labelled controls worked without Plus. |
| `license-cache-day` | PASS | Cached verdict reused before 86,400,000 ms and refreshed at the boundary. |
| `static-deployment` | PASS | Fresh `dist/` demo ran without environment configuration. |

The home, legal, README, and product claims map to these entries. No additional unsupported product claim was found. The checkout defect is an integration failure hidden by the recorded billing fixture, not a claim-test failure.

## Clean-checkout gates

| Check | Result | Evidence |
| --- | --- | --- |
| Candidate | PASS | Detached clean checkout at `04f96dd522f84583606cd242ab9d3fbebb1b450a`. |
| `npm ci` | PASS | 140 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | PASS | 3 files, 10 tests. |
| `npm run typecheck` | PASS | No TypeScript errors. |
| `npm run lint` | PASS | No ESLint findings. |
| `npm run test:e2e` | PASS | 29 Playwright tests. |
| `npm run build` | PASS | Exact production build emitted `dist/`. |

The E2E suite covered normal import/edit/export/persistence, invalid cue JSON, cues beyond track duration, cue-file-before-track recovery, BPM lower-bound normalization, shorter replacement confirmation, delete confirmation, the free limit, recording recovery, demo isolation, routes, offline reload, and accessibility.

## End-to-end rehearsal evidence

The live demo played, paused, selected Orbit, attempted a sixth cue, showed the five-cue Plus boundary without mutating the sheet, exported, reset to five cues, and exited to the real workspace. Export was `neon-classroom-rehearsal.cuebook.json` with keys `format`, `title`, `audio`, `timing`, `cues`, and `exportedAt`; its audio object was only `{name: "sample-beacon-rhythm.wav", duration: 12}`.

Two full live rehearsals observed scene changes against the audio element clock:

| Cue time | Run 1 | Run 2 | Difference |
| ---: | ---: | ---: | ---: |
| 0.000 s | 0.000 s | 0.000 s | 0 ms |
| 2.400 s | 2.394686 s | 2.400429 s | 6 ms |
| 4.800 s | 4.794479 s | 4.800499 s | 6 ms |
| 7.200 s | 7.194489 s | 7.200251 s | 6 ms |
| 9.600 s | 9.595418 s | 9.600348 s | 5 ms |

Every transition was within 6 ms of its cue and within 6 ms between runs, passing the brief’s ±150 ms success measure.

## Accessibility, mobile, privacy, and PWA

- `/opt/fleet/lib/verify-url.sh` passed live home, demo, Privacy, Terms, and offline setup: correct title/lang/H1/main/alt state and no console/page errors.
- Axe reported zero violations on home, demo, Privacy, Terms, and the designed 404 at both 1440 × 900 and 390 × 844.
- At 390 px, home and demo had `scrollWidth === clientWidth === 390`; all visible controls measured at least 44 × 44 CSS px.
- Keyboard-only smoke test: the route H1 received focus; Tab reached the sample action with a `3px` cyan outline; Enter opened the demo. In the demo, `M` opened the five-cue dialog and moved focus to its labelled close button; Space played/paused; Right Arrow moved the playhead by one second. No trap was found.
- With reduced motion active, the media query matched, the hero transform was `none`, and control transitions were reduced to `0.00001s`.
- The complete live demo request log contained only `visualizer-cuebook.sociobot.in` requests and same-origin blob audio. There were no analytics, trackers, CDN fonts, audio uploads, or unexpected billing calls. Privacy disclosures match the behavior.
- Service worker state was `activated` and controlling. `registration.update()` completed with `/sw.js`; the worker had no waiting update and cache `cuebook-v1.0.7-shell`. A dedicated offline context reloaded `/demo/` with its banner, five cues, and offline status, with no console/page errors.
- Manifest is standalone with 192, 512, and maskable icons. The service worker is served with `Cache-Control: no-cache`.

## Deployment identity, headers, and budgets

- Every one of the 25 browser-served files in the candidate `dist/` matched production byte-for-byte by SHA-256. `staticwebapp.config.json` is correctly consumed by the host and not publicly served.
- Representative hashes: app JS `db8eeba59339c5f7ee01f155bd52bcac176feb26808fb8fe541581bbce733182`; app CSS `656f6bb19558258f56349f811b9f67246a5c3e56029c0a20a07a76ef2efdd203`; service worker `faa485e6bbc2e74f46151bd0de38852d85d9f4e503c1ac4b30720d50dd529a2e`; root HTML `a480520d94bd4b3b3e9ddccd760e7bdd352d05d3e0f14a1cbe3312ae2192b2a9`.
- Home, demo, Privacy, Terms, offline setup, manifest, and worker return 200. An unknown route returns the designed page with HTTP 404.
- Responses include CSP with `frame-ancestors 'none'`, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`, and `X-Frame-Options: DENY`.
- Hashed assets use one-year immutable caching; manifest uses one day; worker uses no-cache; HTML uses 30 seconds with must-revalidate.
- Bundle sizes: app JS 46,662 bytes raw / 14.19 KB gzip; preload JS 711 bytes raw / 0.40 KB gzip; app CSS 17,525 bytes raw / 4.87 KB gzip; font 13,292 bytes; mobile hero 16,254 bytes; largest image 29,712 bytes.
- Mobile Lighthouse home: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1.2 s, CLS 0.052, total blocking time 110 ms.
- Mobile Lighthouse demo: 100/100/100/100; LCP 1.4 s, CLS 0, total blocking time 50 ms.

## License verification allowance

The repository’s production boundary utility specifies a burst allowance of 30 checks per client. After its 35-second refill wait, invalid-license requests 1–30 returned HTTP 200, and request 31 returned **429** with **`Retry-After: 4`**. A second fresh boundary observation with the production origin header again returned 429 on request 31 with `Retry-After: 3`. The required limit is enforced. The static product has no other server endpoint and no sign-in flow.

## Release decision

**FAIL.** Do not release until the production checkout URL stops returning 404. Repair the undersized desktop navigation targets and the 621–768 px demo overflow in the same pass, then rerun claims, live checkout, target-size, reflow, PWA, and deployment-parity checks.
