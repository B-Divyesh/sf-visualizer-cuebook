# Cuebook independent verification 16 — FAIL

**Verified:** 2 September 2026

**Candidate:** `b6e898375adac63b6d45f75ed5e258a827ed6c68`

**Live URL:** <https://visualizer-cuebook.sociobot.in>

**Artifact class:** `pwa-offline`

## Verdict

**FAIL — do not release this candidate.** The live product matches the candidate and the real Cuebook workflow works, including the repair requested by verification 15. However, a required claim-tagged browser test is nondeterministic and makes the complete browser quality gate fail.

Defects by severity: **P0 0 · P1 1 · P2 0 · P3 0**.

## Release-blocking defect

### P1 — the deterministic-scenes claim test races past cue boundaries

The exact manifest command for `deterministic-scenes` passed once during the mandatory claim-by-claim gate. The same claim-tagged test then failed in the complete browser run:

- `npm run test:e2e` — **FAIL, 37/38 passed**.
- Failure at `tests/e2e/cuebook.spec.ts:694`: expected **Orbit**, received **Shards**.
- `npm run test:e2e -- --grep @claim:deterministic-scenes --repeat-each=5` — **FAIL, 1/5 passed**.
- Two repeats expected Orbit but received Shards; two expected Shards but received Orbit.

The test sets playback to 4×, waits only for `currentTime > 2.5` or `> 4.9`, then pauses in a separate browser operation. Under ordinary scheduling delay, playback crosses the next saved cue at 4.8 or 7.2 seconds before the assertion. The required test therefore does not reliably prove its claim. The work order says any failing claim test blocks release.

Independent live checks did not reproduce a product timing defect. Direct returns to the two tested times produced identical canvas hashes, and two complete rehearsals activated all four subsequent transitions within 2–42 ms of their saved times. The repair should make the claim check observe a bounded time or seek deterministically, then prove a clean 38/38 suite and repeated claim runs.

## Mandatory first checks

### Declared claims

`.factory/claims.json` exists with 22 entries. After `npm ci`, every exact `test` command was run separately from the clean candidate checkout and passed once:

`cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `cue-capacity`, `rehearsal-recording`, `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `free-access`, `beat-grid`, `accessibility-in-free`, `static-deployment`, `delete-local-set`, `clear-site-data`, `no-accounts`, `node-20-build`, `browser-suite-contract`, `deployment-config`, and `content-ownership`.

The later full-suite and repeated-run failures above make the overall claim gate **FAIL**. Live product copy and the README were cross-checked against the manifest; no material unlisted claim was found.

### Cold first-read test — PASS

The live first screen answers all three questions in plain words at both 1440 × 900 and 390 × 844:

- What: “Build repeatable visual cues for your track.”
- Who: “For DJs, VJs, and educators who need repeatable scene changes from their own track.”
- First action: **Try it with sample data**, followed by the result: a 12-second rehearsal with five editable cues.

The one-click action opens a populated five-cue demo. Privacy, offline, and free-access facts are visible in the first phone viewport. Cold load produced no console or page errors.

## Clean candidate gates

The checkout began clean at the requested commit. Product source was not modified.

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 142 packages, 0 vulnerabilities |
| Every command in `.factory/claims.json` | PASS once; 22/22 individually |
| `npm test` | PASS; 3 files, 10 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; `dist/` produced |
| `npm run test:e2e` | **FAIL; 37/38**, `@claim:deterministic-scenes` |
| Deterministic-scenes repeat ×5 | **FAIL; 1/5 passed** |
| `verify-url.sh` on home, demo, Privacy, and Terms | PASS; 200, title, `lang=en`, one H1, main, alt text, labelled buttons, no console errors |

## Independent live product evidence

- Rejected a non-audio file with a direct recovery message.
- Imported an independently generated three-second WAV and moved directly to the editor.
- At 1440 × 900 the studio began at 72 px; at 390 × 844 it began at 64 px. It intersected the viewport, all landing-only sections were hidden, and focus was on `h1#page-title` in both cases.
- Selected Orbit, marked a cue at 0.500 seconds with the `M` key, and preserved its scene and note after reload.
- Normalized invalid 19 BPM and −1 second offset to 20 BPM and 0 seconds, with a “Timing adjusted” recovery message.
- Rejected a semantically invalid cue file without changing the valid cue.
- Exported a 491-byte `cuebook/v1` file with one cue and audio metadata but no audio bytes.
- Recorded a 124,782-byte WebM with EBML signature, a video codec, an audio codec, and track types 1 and 2.
- Opened the delete confirmation by keyboard; focus moved to **Keep cue**.
- Demo edits reset on reload and did not enter the real IndexedDB project.
- Returning to sample positions 2.52 and 4.92 seconds reproduced the same Orbit and Shards frame hashes.
- Across two full rehearsals, the four transitions after the opening cue activated 2–42 ms from their saved times, within the brief's ±150 ms target.

## Accessibility, keyboard, and phone behavior

- Playwright Axe found zero serious/critical findings on home, populated desktop editor, populated 390 px editor, demo, Privacy, Terms, offline setup, and designed 404 states.
- The skip link has a visible `rgb(88, 230, 210) solid 3px` focus outline and Enter moves focus to `main`.
- Keyboard cue creation and dialog focus management passed without a trap.
- At 390 px, document and viewport widths both measured 390 px; all visible controls measured at least 44 × 44 CSS px.
- With reduced motion requested, the paused editor had zero running document animations.
- At 200% root text size, the first action remained visible and the page still had no horizontal overflow.
- Every rendered HTTP link returned 2xx; same-page skip links and the two documented `mailto:` links were valid.

## Privacy, headers, and deployment identity

- The independent real workflow made 21 requests; all were to the Cuebook origin or a local `blob:` URL.
- The complete demo, rehearsal, update, and offline flow made no cross-origin request.
- There were no analytics, uploads, identity, billing, CDN, font, or external script requests.
- Browser-observed document headers include a restrictive self-only CSP, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, and Permissions-Policy.
- Hashed assets use one-year immutable caching, `sw.js` uses `no-cache`, the manifest uses one-day caching, and HTML revalidates after 30 seconds.
- All 25 served runtime files match local `dist/` bytes by SHA-256. The live deployment is exactly candidate `b6e898375adac63b6d45f75ed5e258a827ed6c68`.
- This is a static PWA with no backend, server-side endpoints, product-unlock calls, accounts, or sign-in. API concurrency, persistence service boundaries, health/build endpoints, 429/`Retry-After`, and Entra authority checks are not applicable.

## PWA and offline behavior

- The service worker activated, controlled the page, and completed `registration.update()`.
- Active caches were `cuebook-v1.0.12-shell` and `cuebook-v1.0.12-runtime`.
- The five-cue demo reloaded offline with the visible offline banner and no console errors.
- The manifest declares a standalone app with 192 px, 512 px, and maskable icons.
- The update-found path contains the in-app “An update is ready” notice, and the worker uses `skipWaiting()` plus `clients.claim()`.

## Performance and budgets

Fresh Lighthouse 13.0.1 mobile audits without runtime warnings:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 98 | 100 | 100 | 100 | 1.16 s | 0.053 | 132 ms | 57,699 B |
| Demo, median of 3 | 90 | 100 | 100 | 100 | 1.35 s | 0.030 | 415 ms | 51,509 B |

The three demo performance scores were 88, 90, and 90; the median meets the ≥90 threshold. The build remains below all static budgets: app JavaScript is 40,199 bytes raw / 12.50 KB gzip, the module-preload helper is 711 bytes raw / 0.40 KB gzip, app CSS is 17,638 bytes raw / 4.85 KB gzip, the font is 13,292 bytes, and the mobile hero is 16,254 bytes.

## Evidence

Screenshots, clean Lighthouse JSON, and factory URL reports are under [qa-artifacts/verification-16](./qa-artifacts/verification-16/). Playwright retained the failing test trace under the ignored local `test-results/` directory during verification.

No product code, infrastructure, DNS, billing, secrets, or cloud resources were modified.
