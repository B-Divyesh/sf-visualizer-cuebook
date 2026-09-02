# Cuebook independent verification 13 — PASS

**Verified 2026-09-02**  
**Candidate:** `260c7140337d3f9f8e6b4f00baaeb5fc17513c6b`  
**Live URL:** <https://visualizer-cuebook.sociobot.in>

## Verdict

**PASS — release candidate accepted.** The live static PWA is byte-for-byte the tested candidate and meets the researched job: DJs, VJs, and educators can import their own audio, mark and replay deterministic visual cue changes, keep the set locally, export cue JSON, record where browser capture supports it, and rehearse offline.

No release-blocking defects were found. Defects by severity: **P0 0, P1 0, P2 0, P3 0.**

## First-read test

**PASS.** A cold 1280 × 800 visit plainly said:

- What it does: “Build repeatable visual cues for your track.”
- Who it is for: “For DJs, VJs, and educators who need repeatable scene changes from their own track.”
- What to click first: visible **Try it with sample data**; adjacent copy says it opens a 12-second rehearsal with five editable cues and leaves a saved set unchanged.

The same first screen gives the three material facts: the track stays in the browser, saved sets work offline, and all rehearsal tools are free. One click opens the isolated demo.

## Clean candidate checks

`npm ci` completed with 0 vulnerabilities. All quality gates passed:

| Command | Result |
| --- | --- |
| Each of the 15 exact commands in `.factory/claims.json` | PASS; then `npm run test:claims`: 15 passed in 53.2 s |
| `npm test` | PASS; 3 files, 10 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:e2e` | PASS; 28 tests in 1.5 min |
| `npm run build` | PASS; `dist/` produced |

The declared claims all passed: `cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `cue-capacity`, `rehearsal-recording`, `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `free-access`, `beat-grid`, `accessibility-in-free`, and `static-deployment`.

The browser suite covers normal WAV import, cue creation/editing/export/reload, six-cue import, deterministic scene replay, WebM capture plus unsupported-browser recovery, malformed/beyond-duration cue JSON, BPM/offset bounds, shorter-track confirmation, deletion confirmation, demo reset/exit, keyboard operation, and desktop/390 px layouts.

## Independent live QA

- Demo at `/?demo=1`: five editable cues, `0:12.000` duration; Play changed to Pause; BPM changed to 120 while the cue grid remained usable.
- Privacy: whole live demo request log had **no non-origin request** (apart from permitted `blob:` audio); no console or page errors occurred. This confirms no tracker, CDN font/script, or audio upload in the exercised flow.
- Accessibility: Axe returned `[]` for serious/critical issues on live demo desktop and 390 × 844 mobile. The first keyboard focus was the skip link with a visible `solid 3px rgb(88, 230, 210)` outline; Enter moved focus to `main`.
- Mobile/reduced motion: at 390 px, viewport and document widths were both 390, with no running animations under reduced-motion preference and no browser errors.
- Offline/PWA: after first visit, an offline demo reload retained five cues and displayed the offline banner. The live worker was `activated`, controlled the page, scoped to the site root, and `registration.update()` completed. The worker implements versioned caches, `skipWaiting`, `clients.claim`, and the app announces an installed update.
- Routes: `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, and `/offline.html` returned their expected title, one H1, and one main landmark with no product console errors. `robots.txt` and `sitemap.xml` returned 200. The designed unknown-route 404 returned HTTP 404 as expected.

## Deployment, headers, and performance

Live bytes match the candidate exactly:

| Artifact | SHA-256 |
| --- | --- |
| `/` | `7ad5908126ee916bf6f7f0182f6c95b2ea7d7c40a0dd4106edce83ad20da4e38` |
| `/assets/app-CdYkaXhR.js` | `182e3f85a336c1741ad94da2d6e867707c7388f289dc09b26d520cd991873386` |
| `/assets/app-C-R8dMgH.css` | `382d49a901d57582bbd841c5be42b6216dc6d3e7f29da30e1d551019c16c9929` |
| `/sw.js` | `5ffc47b815a0153c7b821ac88e78daf36be5b6aae763fddc89f7cccf3a563e92` |
| `/manifest.webmanifest` | `b7afaf538a50a7ab658cb9eeafb334721a05fcd26b4fe0bc869b0075847e31d0` |

Responses include CSP with `frame-ancestors 'none'`, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and the configured Permissions-Policy. Hashed assets are `max-age=31536000, immutable`; `sw.js` is `no-cache`; the manifest is cached for one day.

Build output: app JS 39.37 kB raw / 12.30 kB gzip; app CSS 17.01 kB raw / 4.74 kB gzip; largest image 29.71 kB; self-hosted font 13.29 kB. These are within the static-PWA limits. Fresh Lighthouse on the live demo: **Performance 91, Accessibility 100, LCP 1.3 s, CLS 0, transfer 50 KiB**.

Cuebook has no product-owned server endpoint, sign-in, payment/unlock flow, or backend state. Therefore server concurrency, health identity, Entra authority, and request-allowance/429 checks do not apply.

## Known gaps / next steps

None for this candidate.
