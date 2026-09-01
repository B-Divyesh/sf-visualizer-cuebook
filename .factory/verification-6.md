# Cuebook independent verification 6 — FAIL

**Verdict: FAIL — candidate `800c18f755915a81aa26f320fe04807f6ba29fd7` must not be released until the claims contract is corrected.**

Verified on 2026-09-01 against https://visualizer-cuebook.sociobot.in from a clean checkout at the candidate commit. No product code was changed.

## Release-blocking finding

### P1 — rehearsal-recording promise is absent from `.factory/claims.json`

Cuebook promises the paid capability in several visitor-facing places:

- landing pricing: “Plus is a US$12 one-time license for more than five cues and rehearsal recording”;
- Plus dialog: “downloadable rehearsal recordings”;
- README: “Plus adds more than five cues and rehearsal recording” and “Record rehearsals in desktop Chrome or Firefox”;
- Terms: “rehearsal video recording.”

The product does have `@claim:plus-recording saves a WebM rehearsal with a cached valid license` in `tests/e2e/cuebook.spec.ts`, and that test passed. However, `.factory/claims.json` contains 13 IDs and no `plus-recording` entry. Its `billing-contract` entry checks displayed commercial terms only; it does not declare or test the observable recording result. `npm run test:claims` consequently selected 14 tagged tests for 13 declared claims.

This is an unlisted claim under the required claims contract. Add a `plus-recording` entry whose test is the existing tagged test (and define supported-browser/recovery behavior), or remove the recording promise and its claim test. Until then, the visitor-facing capability is not fully represented in the required proof manifest.

## Cold first read

**PASS.** A fresh Chromium visit to `/` returned HTTP 200, no console/page errors, title `Cuebook — visual cues for your audio`, and one H1: “Build repeatable visual cues for your audio.” The first screen says it is for “DJs, VJs, and educators,” explains repeatable scene changes from their own audio, and provides the one-click **Try it with sample data** link. It opens `/demo/` with a 12-second rehearsal and five editable cues.

## Local quality gates

`npm ci` was required before the browser test package was available; after installing the lockfile dependencies, every declared `test` command in `.factory/claims.json` was run separately against the production-preview demo entry point.

| Check | Result | Evidence |
| --- | --- | --- |
| 13 declared claim commands | PASS | `cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `free-five`, `plus-license`, `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `billing-contract`, `static-deployment` all passed separately. |
| Consolidated claim runner | PASS, with contract discrepancy | `npm run test:claims` completed with `test-results/.last-run.json` status `passed`; it ran 14 tagged tests, exposing the unlisted `plus-recording` tag. |
| Unit tests | PASS | `npm test`: 9 tests in 3 files passed. |
| Type check / lint | PASS | `npm run typecheck` and `npm run lint` passed. |
| Full browser suite | PASS | `npm run test:e2e`: all 22 tests passed. |
| Production build | PASS | `npm run build` completed and produced `dist/`. App JS: 40.10 kB raw / 12.84 kB gzip; CSS: 17.30 kB raw / 4.82 kB gzip. |

## Independent live product checks

- Demo: selected Orbit, exported a cue file, reset the sample, and confirmed the persistent “Demo — sample data, nothing is saved” banner and restored five cues.
- Accessibility: Playwright Axe found zero serious or critical findings on live home and demo. The skip link has a `rgb(88, 230, 210) solid 3px` visible focus ring; Enter moved focus to `main`.
- Mobile/reduced motion: at 390×844, `scrollWidth` and `clientWidth` were both 390; reduced-motion was active and there were no running animations or console errors.
- Privacy: the full home/demo interaction request log contained only `https://visualizer-cuebook.sociobot.in` resources and browser-generated `blob:` URLs. No analytics, tracker, CDN font/runtime, or audio-upload request was observed. Console and page errors were empty.
- PWA: an active service-worker controller controlled the live demo. After first load, an offline reload retained the studio and showed the offline banner. `registration.update()` completed successfully.
- Routes: `/`, `/demo/`, `/privacy/`, and `/terms/` each returned 200; `/demo/nope` returned 404.

## Deployment identity, headers, and caching

The fresh production build matches the deployment byte-for-byte for the primary artifacts:

| Artifact | SHA-256 |
| --- | --- |
| `assets/app-C3iipUuf.js` | `da46ffd05422ced58802b110984e27bec0a9937def147e0baf27f99a1229d980` |
| `assets/app-BGpF-uV8.css` | `8e661b8038b4d668533806f50d83f52fcbf21e24d51b3d7409a2e0540a251a9b` |
| `sw.js` | `1ae8a594e5190a06598a7bd3e8987a5b48526ccee51ba9d9d96ce425490744b2` |

Live responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, referrer policy, permissions policy, and `X-Frame-Options: DENY`. The hashed application asset is `public, max-age=31536000, immutable`; the service worker is `no-cache`; the manifest is served as `application/manifest+json` with a one-day cache. Initial JS/CSS/font/image sizes are within the stated static-PWA budgets.

Cuebook is a static PWA with no product-origin server endpoint, so no product request allowance applies. The optional license verification/checkout endpoint is external to this product scope; its recorded-fixture claim passed, but it was not contacted or allowance-tested.

## Required next step

Add the missing `plus-recording` declaration to `.factory/claims.json` with the existing tagged test, then rerun the declared-claim commands and independent verification.
