# Cuebook independent verification 14 — PASS

**Verified:** 2 September 2026  
**Candidate:** `1648db7978b3a9f230dbf7e56f0ca9a6bd35a295`  
**Live URL:** <https://visualizer-cuebook.sociobot.in>

## Verdict

**PASS — release candidate accepted.** The deployed static PWA matches the candidate and completes the researched job end to end. A creator can import a local track, mark and edit cues, replay deterministic scenes, export cue JSON, save a WebM rehearsal, and reopen the work offline.

Defects by severity: **P0 0 · P1 0 · P2 0 · P3 0**.

## Mandatory first checks

### First-read test — PASS

A cold live visit at 1440 × 900 answers all three required questions in its first screen:

- What: “Build repeatable visual cues for your track.”
- Who: “For DJs, VJs, and educators who need repeatable scene changes from their own track.”
- First action: **Try it with sample data**, followed by text explaining that it opens a 12-second rehearsal with five editable cues.

The first screen also states the local-storage, offline, and free-access facts. The primary action opens the populated demo in one click. The 390 × 844 cold screenshot presents the same content and action without horizontal overflow.

### Declared claims — 19/19 PASS

From the clean candidate checkout, every exact `test` command in `.factory/claims.json` was run separately before the broader suite. Each selected one tagged test and exited 0.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `cue-workflow` | PASS | Imported WAV, created cue, reloaded it, exported cue file |
| `offline-reload` | PASS | Saved project and demo both reloaded offline |
| `local-privacy` | PASS | Complete real/demo flow remained on product origin |
| `json-no-audio` | PASS | Export parsed without audio bytes |
| `cue-capacity` | PASS | Six cues imported and remained after reload |
| `rehearsal-recording` | PASS | WebM contained video and audio; fallback actions appeared |
| `three-scenes` | PASS | Contour, Orbit, and Shards selected |
| `deterministic-scenes` | PASS | Cue scenes and rendered frames repeated at saved times |
| `pwa-install` | PASS | Manifest, icons, active worker, and page control verified |
| `demo-sandbox` | PASS | 12-second, five-cue sample reset without changing real data |
| `no-tracking-runtime` | PASS | Workflow requests and runtime assets stayed first-party |
| `free-access` | PASS | All tools available; no billing UI or request |
| `beat-grid` | PASS | BPM/offset changed beat labels without moving cue time |
| `accessibility-in-free` | PASS | Keyboard cue marking and accessible control names verified |
| `static-deployment` | PASS | Fresh `dist/` ran without backend or runtime environment values |
| `delete-local-set` | PASS | Project record and audio blob were deleted from IndexedDB |
| `no-accounts` | PASS | No sign-in UI, identity traffic, or credential storage |
| `node-20-build` | PASS | TypeScript and Vite build succeeded under Node 20.19.5 |
| `content-ownership` | PASS | Rendered Terms wording matched the checked-in contract |

The landing page, legal pages, README, and product UI were cross-checked against the claim map. No unlisted material product claim was found.

## Clean candidate gates

The checkout began clean at the requested commit.

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 142 packages, 0 vulnerabilities |
| `npm test` | PASS; 3 files, 10 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; `dist/` produced |
| `npm run test:e2e` | PASS; 34 tests in 1.7 minutes |

The production build contains 39,377 bytes of app JavaScript (12,266 gzip), 711 bytes of preload JavaScript (399 gzip), 17,319 bytes of app CSS (4,780 gzip), a 13,292-byte self-hosted font, a 16,254-byte mobile hero, and a 29,712-byte desktop hero. All are below the contract budgets.

## Independent end-to-end evidence

The live site was exercised in fresh browser contexts, separately from the repository suite:

- Imported a generated three-second WAV, marked a cue at 0.500 seconds, saved its note, reloaded, and recovered the same track and cue.
- Rejected nonnumeric BPM and a cue at 99 seconds without changing the valid rehearsal. Inputs below the supported BPM/offset bounds recovered to 20 BPM and 0 seconds.
- Exported `independent-qa.cuebook.json`; it contained one cue and audio metadata but no audio blob.
- Recorded and downloaded `independent-qa-rehearsal.webm` at 104,611 bytes.
- Deleted the current set and confirmed the IndexedDB project record was absent.
- Opened the demo in one click, played its audio, found five cues and a 12-second duration, edited and reset it, selected all three scenes, and observed Orbit at 2.1 seconds and Shards at 4.1 seconds.
- Replayed all five saved sample transitions twice at normal speed. The largest observed cue-time error was **53 ms**, within the brief’s **±150 ms** success measure.
- Verified Space play/pause, one-second Left/Right Arrow nudges, and `M` cue creation.

Detailed results are in [independent-live-qa.json](./evidence/verification-14-live/independent-live-qa.json).

## Accessibility, privacy, and resilience

- Axe reported zero serious/critical findings on home, populated studio, demo, Privacy, Terms, offline setup, 404, and the 390 px demo. The full local suite reported zero Axe violations on its covered states.
- The skip link becomes visible at `(12, 12)`, measures 198.6 × 44 px, has a 3 px cyan outline, and moves focus to `main`. All visible mobile controls measured at least 44 × 44 px.
- At 390 px, document and viewport widths were both 390 px. With reduced motion requested, no document animation was running.
- The successful live real-track/demo/offline flow made 44 requests, all to `https://visualizer-cuebook.sociobot.in`; there were no console or page errors. No CDN font/script, analytics, upload, billing, or identity request occurred.
- Main responses include CSP, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, and Permissions-Policy. The CSP limits connections and scripts to self and permits local media blobs.
- All 12 rendered links returned successfully or were explicit `mailto:` links. An unknown URL returned the designed HTTP 404 page. Its browser resource log contains only the expected 404 document entry, not a script error.

## PWA, deployment, and performance

- The worker was activated and controlled the root scope. `registration.update()` completed; the worker has versioned caches, `skipWaiting()`, and `clients.claim()`, while the app includes an update-ready notice.
- Both the five-cue demo and a saved real WAV project reloaded offline after priming.
- The manifest is standalone, starts at `/?v=10`, and supplies 192 px, 512 px, and maskable icons.
- Cache policy is correct: hashed app assets use one-year immutable caching, `sw.js` uses `no-cache`, the manifest uses one day, and HTML revalidates after 30 seconds.
- All **25 public runtime files** in local `dist/` match live bytes by SHA-256. `staticwebapp.config.json` is correctly consumed by Azure Static Web Apps rather than served; its configured headers are present live.
- Fresh mobile Lighthouse results:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 95 | 100 | 100 | 100 | 1.11 s | 0.053 | 239 ms | 57,287 B |
| Demo | 95 | 100 | 100 | 100 | 1.27 s | 0 | 261 ms | 51,145 B |

A separate interaction run with 4× CPU throttling observed a maximum event duration of 72 ms, below the 200 ms interaction budget.

Evidence is under [verification-14-live](./evidence/verification-14-live/), including route captures, screenshots, Lighthouse JSON, the link crawl, runtime hashes, and independent QA results.

## Applicability and known gaps

Cuebook has no backend, product API, sign-in, payment flow, or server-side product-unlock request. Concurrency, persistence-boundary, health/build-identity endpoint, Entra authority, and 429/`Retry-After` checks therefore do not apply. No known gap remains within the researched brief.
