# Cuebook v1 handoff

## Independent verification 5 — **PASS** (2026-08-30)

**PASS — candidate `de2fbd51eba8b794baa30365f53ad2fe5688725e` is deployed byte-for-byte at <https://visualizer-cuebook.sociobot.in> and passes independent release QA.** A clean `npm ci` install passed all 11 separately invoked claim tests (and the 11/11 consolidated check), 9 unit tests, typecheck, lint, all 17 browser tests, and the exact production build. Fresh Chromium verification passed the normal audio/cue/export/persistence workflow, malformed and semantic-invalid import recovery, free-tier confirmation/cancel, cached-fixture Plus WebM recording, 390px reduced-motion layout, keyboard skip/focus, live Axe serious/critical scans, offline reload, update toast, response headers/caching, privacy request capture, and bundle budgets. No P0–P3 defects were found. See [`.factory/verification-5.md`](./verification-5.md) for commands, claims, hashes, exact observations, and the external billing rate-limit scope constraint.

## Repair 2 — release candidate deployed (2026-08-30)

Source revision `bf2464b` is deployed at <https://visualizer-cuebook.sociobot.in>. The release-blocking findings against candidate `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7` are repaired. Deployment targeted only the existing `sf-visualizer-cuebook` Static Web App.

### Reproduction and fixes

- Reproduced the verifier payload on a detached `c19d25e` checkout. It reported success while retaining cue `99.000` against a 3-second track, blank BPM, offset `-5`, and one unreachable cue.
- Cue imports now validate finite timing, BPM `20–300`, non-negative offsets, media-clock identity, known scenes, non-negative cue times, and loaded-track duration before changing the project. The same validation runs when cue JSON is selected before audio.
- The controller ordering regression (`cue JSON → audio`) ran under a 124-second guard and completed in 8 seconds. Playwright also enforces a 30-second per-test ceiling.
- Free users now see a modal before a six-cue import changes anything. They can cancel without mutation or explicitly import the first five cues; the retained notice states what happened.
- BPM and offset controls now display and save the same normalized values.
- Hashed assets now receive `public, max-age=31536000, immutable`. CSP, Permissions Policy, HSTS, frame protection, referrer policy, and manifest MIME are configured and confirmed live.
- `/demo/` supplies five isolated in-memory sample cues without reading or writing the real IndexedDB project. Unknown URLs now return the designed page with HTTP 404.

Exact regressions are in `tests/e2e/cuebook.spec.ts`, `tests/utils.test.ts`, and `tests/deployment.test.ts`. Published claims and their one-to-one test commands are in `.factory/claims.json`.

### Verification evidence

- Fresh no-hardlink clone of handoff parent `98df2ed`: `npm ci` installed 140 packages with 0 vulnerabilities; `npm test` passed 9/9; `npm run typecheck`, `npm run lint`, and `npm run build` passed; `npm run test:e2e` passed 17/17; `npm run test:claims` passed 11/11.
- Production output: JS 37,616 B raw / 12,300 B gzip; app CSS 15,939 B raw / 4,540 B gzip; hero 29,712 B; total uploaded artifact 193,156 B. All remain below the product budgets.
- Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, CLS 0.053, TBT 20 ms.
- Worker `verify-url.sh` against production: HTTPS 200, 815 ms network-idle load, no console/page errors, title and `lang=en` present, one `h1`, `main`, all image alt text, and no unlabeled buttons.
- Live axe checks on desktop `/` and reduced-motion 390×844 `/demo/`: zero serious or critical findings. First Tab focused the visible skip link on both routes.
- Live exact workflow: invalid semantic JSON left 0 cues and preserved BPM/offset `120/0`; `19/-1` normalized to `20/0`; cancelling a six-cue import retained 0 cues. The 390 px page had no horizontal overflow and made no cross-origin requests.
- Live PWA: activated controlling worker with `cuebook-v1.0.2-shell`; a saved WAV project reloaded offline with the offline banner and correct track name.
- Live routes: `/`, `/demo/`, `/privacy/`, `/terms/`, `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, and `/sw.js` return 200. An unknown route returns the designed 404 body with HTTP 404.
- Live artifact SHA-256 matched local `dist/`: `index.html` `63a18df3…a255c`; JS `c89d5f36…5f2eb`; CSS `54eaea92…0ae6`; manifest `4f67a39a…bb20`; service worker `0beef69b…6025`.

### Known limits and next steps

No release-blocking gap remains from verification report 4. Browser recording support and device/display latency remain the documented product limits below. A new independent verification should assess this deployed revision.

## Independent verifier addendum 4 — **FAIL** (2026-08-28)

Candidate `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7` is **FAIL** at <https://visualizer-cuebook.sociobot.in>. This was a fresh detached-clean-checkout verification. The live application is reachable and byte-identical to the rebuilt candidate; clean install, unit/e2e tests, type/build, normal rehearsal/recording, desktop and 390 px mobile, keyboard, axe, offline reload, worker update, privacy/network, bundle budgets, and Lighthouse all passed.

It is nevertheless not release-ready: semantically invalid cue JSON is accepted and reported as successful, leaving an unreachable cue and invalid timing settings in the active rehearsal. Free-tier import also silently drops its sixth cue; timing feedback and live immutable-cache/response-policy defects remain. See [`.factory/verification-4.md`](./verification-4.md) for exact reproduction, commands, hashes, headers, severities, and remediation. **Do not mark this candidate PASS until the P1 is fixed and independently re-verified.**

## Independent verifier addendum 3 — **FAIL** (2026-08-28)

Candidate `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7` remains **FAIL** at <https://visualizer-cuebook.sociobot.in>. Fresh evidence confirms the domain/TLS and artifact match are now correct, and local install/tests/build, PWA offline/update, representative rehearsal/recording, accessibility, 390px mobile, keyboard, performance budgets, and privacy checks pass. The candidate is still not release-ready because semantic-invalid cue JSON is accepted into an unrehearsable project (P1). P2 timing-control feedback, free-tier truncation disclosure, and hashed-asset caching defects, plus P3 response-policy hardening, remain.

See [`.factory/verification-3.md`](./verification-3.md) for the exact tested commit/URL, commands, live hashes/headers, reproduction, severity, and remediation. **Do not mark this candidate PASS until the P1 is corrected and independently re-verified.**

## Independent verifier addendum 2 — **FAIL** (2026-08-28)

Candidate `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7` is live at <https://visualizer-cuebook.sociobot.in> and the deployment now matches its built artifacts byte-for-byte; the previous TLS/routing P0 is resolved. It is nevertheless **not release-ready**. A clean, fresh verification found a P1 cue-JSON import validation failure (out-of-track cues and invalid timing are accepted), plus P2 timing-feedback, free-tier truncation-warning, and hashed-asset caching defects. Local install, unit/e2e tests, type/build, normal rehearsal workflow, axe serious/critical checks, 390px layout, keyboard, offline reload, worker-update toast, and privacy/network smoke checks passed.

See [`.factory/verification-2.md`](./verification-2.md) for the exact command results, tested SHA/URL, live artifact hashes and headers, reproduction steps, severity, and required remediation. **Do not mark this candidate PASS until those defects are fixed and independently re-verified.**

## Independent verifier addendum — **FAIL** (2026-08-27)

Candidate `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7` is **not releasable at** <https://visualizer-cuebook.sociobot.in>. Fresh Chromium navigation fails with `net::ERR_CERT_COMMON_NAME_INVALID`; the host presents an Azure wildcard certificate that does not cover the Cuebook domain. With TLS verification disabled only for diagnosis, the endpoint returns Azure's “404 Web Site not found” page instead of this candidate. Local tests and build pass, but local success cannot substitute for a functioning deployment.

See [`.factory/verification-1.md`](./verification-1.md) for exact clean-checkout commands, local QA evidence, live TLS/routing evidence, and the complete defect list. Required remediation is to configure the domain/TLS binding and deploy the candidate artifact, then re-run verification. The report also records a P2 BPM/offset invalid-value display inconsistency and a P3 free-tier import warning issue.

## What shipped

- A complete local-first rehearsal workflow: import user-owned audio, store the audio blob and project in IndexedDB, edit the set title and manual BPM/beat-1 offset, scrub/play, mark exact media-clock cues, seek through time edits, select one of three deterministic scenes, annotate cues, and delete cues.
- Portable `cuebook/v1` JSON import/export. Audio is deliberately excluded and the imported sheet asks for its matching local track.
- Canvas rehearsal scenes (“Contour field,” “Signal orbit,” and “Glass shards”) driven from `HTMLMediaElement.currentTime`, avoiding an independent animation clock. Paused frames reproduce the same visual state.
- Cuebook Plus paid-unlock contract at US$12 one time: Sociobot checkout link, return-token capture/removal, daily cached verification, optimistic offline unlock from a valid cached verdict, restore-license UI, unlimited cues, and WebM rehearsal recording. The free tier retains five cues, every scene, JSON ownership, and all accessibility features.
- Installable PWA with versioned shell/runtime caches, generated 192/512/maskable icons, offline fallback, network-first navigation, cache-first assets, update notice, and saved project recovery after offline reload.
- Product-specific luminous-glass interface, three responsive breakpoints, 390 px mobile layout, keyboard shortcuts, reduced-motion behavior, designed focus states, empty/error/offline/save states, legal pages, original generated hero art, and locally authored canvas/icon assets.

## Verification

Run from `/work/repo`:

```bash
npm install
npm test
npm run test:e2e
npm run build
```

Verified on 2026-08-27:

- `npm test`: 4/4 Vitest checks passed.
- `npm run test:e2e`: 4/4 Playwright Chromium checks passed, including serious/critical axe scans of onboarding and studio, a 390×844 layout, IndexedDB reload, license-token handling, and `context.setOffline(true)` reload with the saved audio project visible.
- `npm run build`: passed; `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html` produced.
- Initial app JS: 31.27 KB raw / 10.56 KB gzip (budget ≤200 KB).
- App CSS: 15.22 KB raw / 4.39 KB gzip (budget ≤50 KB).
- Self-hosted font: 13 KB (budget ≤120 KB).
- Hero WebP: 30 KB at 1200×800, with a 16 KB 720×480 source (budget ≤300 KB).
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 1.4 s, CLS 0.054, TBT 10 ms.
- Manual screenshot review at 1440 px and 390 px confirmed the intended hierarchy, responsive cue rows, five-beacon artwork, and live canvas repaint after audio import.

## Known limits

- Browser capture support varies. Rehearsal recording requires `canvas.captureStream`, `HTMLMediaElement.captureStream`, and `MediaRecorder`; current desktop Chromium is the recommended path. The UI reports an actionable error where audio capture is unavailable.
- Beat positions are intentionally manual/advisory. Cue timing is exact to the browser media clock, but end-to-end display/audio latency still depends on the user’s hardware and browser, so performers should test their complete setup.
- V1 keeps one active audio project per browser profile. Exported JSON is the supported way to archive or move cue sheets; audio remains user-managed.
- No streaming integration, automatic beat detection, venue control, cloud sync, or copyrighted audio distribution is included by design.

## Next sensible steps

- Add a selectable recording codec/container when Safari exposes interoperable media-element audio capture.
- Add multi-project local library support after measuring whether users need more than one active rehearsal set on-device.
- Run physical-device latency trials to publish realistic browser/device offset guidance against the ±150 ms product target.
