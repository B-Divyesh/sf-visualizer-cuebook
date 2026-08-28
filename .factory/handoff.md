# Cuebook v1 handoff

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
