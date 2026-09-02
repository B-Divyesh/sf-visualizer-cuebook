# Cuebook independent verification 12 — PASS

**Verdict: PASS.** Candidate `b88054aad813acf5374c20dfa74ca53bb66db83e` is deployed at <https://visualizer-cuebook.sociobot.in> and meets the local-first rehearsal job in the researched brief. No release-blocking defect was found. Verification was performed on 2026-09-02 from a clean dependency install. Product source was not changed.

## Required cold first-read

**PASS.** A cold live visit at both 1440 × 900 and 390 × 844 plainly said:

- It does: “Build repeatable visual cues for your track.”
- It is for: “DJs, VJs, and educators who need repeatable scene changes from their own track.”
- Click first: the visible one-click **Try it with sample data** action, with adjacent text saying it opens a 12-second rehearsal with five editable cues without changing the saved set.

The action opened `/demo/` with the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, **Start for real**, an audible generated 12-second sample, and five scene cues. This satisfies the plain-words and demo-sandbox gate.

## Claims contract

**PASS: 15/15.** `.factory/claims.json` exists. After `npm ci`, every listed command was run separately through the product demo entry point and passed:

`cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `cue-capacity`, `rehearsal-recording`, `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `free-access`, `beat-grid`, `accessibility-in-free`, and `static-deployment`.

The checks prove local WAV import/mark/reload/export; offline reload; same-origin demo activity; JSON with audio metadata but no audio bytes; six-cue import/persistence; supported WebM recording and recovery guidance; all three scenes; deterministic canvas output; standalone PWA assets; isolated demo reset/exit; no tracker/CDN runtime traffic; no checkout or purchase gate; beat-grid behavior; free keyboard/screen-reader controls; and a static, environment-free demo build.

## Clean-checkout gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 140 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | PASS | 3 files, 10 tests. |
| `npm run typecheck` | PASS | No TypeScript errors. |
| `npm run lint` | PASS | No ESLint findings. |
| `npm run test:e2e` | PASS | 27 Playwright tests; final run status `passed`. Coverage includes invalid JSON, invalid BPM/offset recovery, out-of-range cues, shorter-track confirmation, delete confirmation, demo isolation, recording fallback, and responsive regressions. |
| `npm run build` | PASS | Production `dist/` emitted. |

This is a static local-first PWA: package-consumer, CLI, backend health/concurrency, API allowance, persistence-boundary server, and sign-in-provider checks do not apply. The current product makes no product-unlock or other server-side request.

## Live functional, privacy, and accessibility verification

**PASS.** A live demo rehearsal played (`currentTime` advanced to 0.398 s), selected Orbit, exported `cuebook/v1` JSON with five cues and only `{name: "sample-beacon-rhythm.wav", duration: 12}` audio metadata, reset to five cues, and exited to an empty real workspace. Its complete request log contained only `visualizer-cuebook.sociobot.in`; no tracker, analytics, CDN font/script, audio upload, or billing request occurred. There were no console or page errors.

Two full live sample plays observed the nonzero cue changes at 2.400, 4.801, 7.200, and 9.600 seconds in run one, and 2.389, 4.791, 7.191, and 9.591 seconds in run two. Every observed change was within 12 ms of its cue anchor and well within the brief's ±150 ms repeatability measure.

`verify-url.sh` passed live home, demo, Privacy, and Terms: each returned 200 with a title, `lang="en"`, one H1, main landmark, alt-complete images, labelled buttons, and no console errors. Independent Playwright Axe scans found **zero violations** on all four routes at both 1440 × 900 and 390 × 844 (therefore zero serious/critical findings). All visible button/link/input/select targets were at least 44 × 44 CSS px; no horizontal overflow appeared. Keyboard verification confirmed a designed `rgb(88, 230, 210) solid 3px` skip-link focus ring, Enter moving focus to main, `M` adding a cue, and reduced-motion rendering with no hero transform.

## PWA, deployment, headers, and performance

**PASS.** The live service worker was `activated`, controlled the page, had no waiting update after `registration.update()`, and its dedicated offline demo context reloaded with the demo banner, five cues, and “Offline and ready.” No PWA console/page errors occurred. The manifest declares standalone display and three icons.

All 25 publicly served files from the candidate `dist/` matched production byte-for-byte by SHA-256. `/`, `/demo/`, `/privacy/`, `/terms/`, manifest, and worker return 200; an unknown route returns the designed HTTP 404. `staticwebapp.config.json` is correctly not public (404). Links crawled from the six shipped routes all returned 200 or were explicit `mailto:` links.

Responses have CSP including `frame-ancestors 'none'`, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and the expected cache policy: HTML 30-second revalidation, hashed assets one-year immutable, manifest one day, and worker `no-cache`.

The initial app JavaScript is 39,211 bytes raw / 12,170 gzip; app CSS is 17,013 bytes raw / 4,752 gzip; largest image is 29,712 bytes and the self-hosted font is 13,292 bytes. Fresh mobile Lighthouse results were home 98/100/100/100 and demo 94/100/100/100 (performance/accessibility/best-practices/SEO); home LCP 1.137 s / CLS 0.052 / TBT 144 ms, demo LCP 1.277 s / CLS 0 / TBT 279 ms.

## Defects by severity

None found: P0 none, P1 none, P2 none, P3 none.

## Release decision

**PASS.** Release candidate `b88054a` has live deployment parity and passes the claims, offline-PWA, core rehearsal, privacy, accessibility, responsiveness, security-header, caching, and budget checks. The previously reported unavailable paid checkout is no longer advertised or requested; all current rehearsal tools are honestly available without charge.
