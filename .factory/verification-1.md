# Cuebook independent verification 1 — FAIL

**Date:** 2026-08-27  
**Candidate:** `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7`  
**Required live URL:** <https://visualizer-cuebook.sociobot.in>  
**Verifier:** independent factory QA, clean detached checkout at the candidate

## Verdict

**FAIL — do not release.** The candidate builds and works locally, but the required live URL does not establish a valid TLS connection and does not route to the candidate when certificate verification is bypassed. A user cannot load the product, so the PWA, privacy, accessibility, caching, and product workflow cannot be delivered at the promised URL.

## Blocking defect

### P0 — live deployment is unavailable and does not match the candidate

- Fresh Chromium navigation to the required URL failed with `net::ERR_CERT_COMMON_NAME_INVALID`.
- `curl` with normal TLS validation failed with: `SSL: no alternative certificate subject name matches target host name 'visualizer-cuebook.sociobot.in'`.
- The presented certificate is `CN=*.msha-slice-7-eus2-0-ase.p.azurewebsites.net`, issued by `Microsoft TLS G2 RSA CA OCSP 04`, valid 2026-07-21 through 2027-01-17. Its SAN list contains only Azure `msha-slice` names, not `visualizer-cuebook.sociobot.in`.
- With certificate checking explicitly disabled solely to diagnose routing, `GET /`, `/assets/app-6q2OwFvn.js`, `/manifest.webmanifest`, `/sw.js`, and `/terms/` returned Azure's 404 “Web Site not found” response (2,667 bytes), not candidate artifacts. The response body’s SHA-256 was `1e0878f232e32cf44e87ba00bd6957c1ebdfc9bc7c1c0a1389f8c62e6ae3311a`, versus local candidate `dist/index.html` `8027d16f7d50c8b5687fa53a64e7b45fb570e6945d8f06faf20246dc314636ec`.
- Therefore live candidate identity, browser response policies, host caching, and live Lighthouse could not be confirmed. Deployment configuration must bind the domain to the static artifact and issue a certificate containing the domain before re-verification.

## Product defects found locally

### P2 — invalid timing values remain visibly wrong after being silently clamped

**Reproduction:** import a valid WAV, enter `999` in BPM and blur; enter `-1` in Beat 1 offset and blur.

**Observed:** the app internally clamps the saved values to the documented ranges (BPM 300 and offset 0), but the inputs continue to display `999` and `-1` until reload. The playhead beat immediately reflects the hidden clamped model, not the displayed field. This makes the shown beat-grid configuration disagree with the cue calculations during rehearsal.

**Expected:** normalize the displayed field to the accepted value and/or give an explicit range error at blur. This matters to the brief’s repeatable timing goal even though exact cue timestamps use the media clock.

### P3 — free-tier import truncation warning is overwritten immediately

**Reproduction:** as a non-Plus user, import a valid `cuebook/v1` file containing six cues.

**Observed:** only five cues are imported (correct enforcement), but the intended “Imported the first 5 cues” toast is immediately replaced by “Cue sheet imported. Check that the audio matches.” The user is not told their sixth cue was dropped.

**Expected:** retain or combine the limit warning so the data-loss/limit outcome is clear.

## Clean-checkout execution

A detached clean clone of the candidate was created under `/tmp/cuebook-qa.uZp9w6`; `npm ci` completed with 60 packages and **0 vulnerabilities**.

| Check | Result | Evidence |
| --- | --- | --- |
| Unit tests | PASS | `npm test`: 4/4 Vitest tests passed. |
| Browser integration tests | PASS | `npm run test:e2e`: 4/4 Playwright Chromium tests passed. |
| Type check + exact production build | PASS | `npm run build` ran `tsc --noEmit && vite build`; emitted `dist/`. |
| Bundle budgets | PASS | App JS 31,267 B raw / 10.56 KB gzip (≤200 KB); app CSS 15,224 B raw / 4.39 KB gzip (≤50 KB); local font 13,292 B (≤120 KB); hero WebP 29,712 B (≤300 KB). |
| Lighthouse, local production preview | PASS | Mobile: Performance 94, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.6 s, CLS 0.054, TBT 260 ms. |
| Local console/page errors | PASS | None in normal import, cue, export, persistence, offline, and update checks. |

## Independent functional browser evidence

Using the locally built production output in Chromium:

- Imported a representative 3-second WAV, scrubbed to `0:01.500`, selected Orbit, set a cue note, created a cue, edited cue time above track duration (correctly clamped to `3.000`), and confirmed storage persistence after reload.
- Confirmed keyboard-only `M` adds a cue when focus is outside form controls; the first Tab reaches a visible designed skip link with a 3px focus outline. Space and arrow shortcuts are implemented and exposed in the UI.
- Invalid non-audio input recovered with “Choose an audio file such as MP3, WAV, M4A, or OGG.” Invalid JSON recovered with a visible parse error. An import over the free limit stored exactly five cues (with the warning problem above).
- Exported JSON was named `owned.cuebook.json`, contained format/title/audio metadata/timing/cues/export time, and did **not** contain an `audioBlob` or audio bytes.
- At 390×844 there was no horizontal overflow (`scrollWidth=390`, `clientWidth=390`); Record was 44×44 px and Mark cue was 324×50 px. Desktop and mobile screenshot review found the purpose-built luminous-glass system readable and coherent.
- `prefers-reduced-motion: reduce` changed the hero transform to `none`, transition duration to `0.01ms`, and document scrolling to `auto`.
- Axe scans of both onboarding and imported studio had **zero serious or critical findings**. The local Lighthouse accessibility audit also scored 100.
- Service worker: after reload it controlled the page and used `cuebook-v1.0.0-shell`/`runtime` caches. With Playwright offline mode, reload retained the saved studio and showed the offline banner. A simulated new service-worker script created `cuebook-v1.0.1-shell` and displayed “An update is ready. Refresh when your rehearsal is paused.”

## Privacy, network, and response-policy evidence

- Static source inspection and normal-case browser request capture found no analytics, advertising, third-party scripts, CDN fonts, or audio upload. Audio is kept in IndexedDB; JSON export intentionally excludes it.
- The only non-local application endpoint is the documented Sociobot license verification/checkout API, used only when a license token is restored/captured. Normal rehearsal activity produced only same-origin and `blob:` requests.
- The candidate has local `/privacy/` and `/terms/` pages, an MIT license, a manifest with 192/512/maskable icons, a versioned start URL, and a service worker with versioned caches.
- Live response headers and cache policy are **not acceptable/assessable as a product deployment** because the endpoint is TLS-invalid and returns the unrelated Azure 404 page. The diagnostic 404 cannot evidence candidate headers or asset caching.

## Required next step

Repair the production domain binding and TLS certificate, deploy the candidate `dist/` to that binding, and request a fresh verification. Also fix the two local UX defects above before treating the build as release-ready.
