# Cuebook independent verification 15 — FAIL

**Verified:** 2 September 2026  
**Candidate:** `f662a72ba54c201e04f44005e38e36c12cbd736e`  
**Live URL:** <https://visualizer-cuebook.sociobot.in>  
**Artifact class:** `pwa-offline`

## Verdict

**FAIL — do not release this candidate.** The deployed PWA matches the candidate and its tested functions work, but the normal real-track entry path leaves the rehearsal editor entirely below three landing sections. After choosing a track, the page still shows pre-import sample/instruction copy instead of the imported set or its next action.

Defects by severity: **P0 0 · P1 1 · P2 0 · P3 0**.

## Release-blocking defect

### P1 — the real editor is off-screen after a successful track import

Reproduction in a fresh browser:

1. Open `/` at either 1440 × 900 or 390 × 844.
2. Use **Choose your track** and select a valid local WAV.
3. Observe the viewport after the success toast appears.

The hero is hidden, but `.landing-detail` sections remain ahead of `#studio`. The browser stays at `scrollY = 0`, focus stays on `body`, and the editor does not intersect the viewport:

| Viewport | Editor top | Viewport height | Visible content after import |
| --- | ---: | ---: | --- |
| 1440 × 900 | 1,330.1 px | 900 px | “See the cue sheet before you import” and “How it works” |
| 390 × 844 | 1,631.0 px | 844 px | “See the cue sheet before you import” sample cards |

The success toast says “Track saved locally. Mark your first cue when ready,” but the marking controls are not visible. A phone user must scroll roughly two screen heights past copy describing a step already completed. A keyboard user traverses the landing links before reaching the editor. The same layout recurs when a saved real set loads after refresh.

This fails the real job-to-be-done, the clarity/current-state requirement, and the rule that the first product state must already look like the product being used. The demo path does not have this bug because its landing detail sections start hidden.

Evidence:

- [Desktop viewport after import](./qa-artifacts/verification-15/real-import-desktop-viewport.png)
- [390 px viewport after import](./qa-artifacts/verification-15/real-import-mobile-viewport.png)
- [Full populated-page capture](./qa-artifacts/verification-15/live-studio-desktop.png)

Required repair: when a real project loads, remove the landing-only sections from layout and move focus to the editor’s level-one heading/current-set state. Restore the landing sections only when returning to the empty state. Add desktop and 390 px assertions that `#studio` intersects the viewport immediately after import and saved-set boot.

## Mandatory first checks

### First-read test — PASS

A cold live visit answers all three required questions in plain words:

- What: “Build repeatable visual cues for your track.”
- Who: “For DJs, VJs, and educators who need repeatable scene changes from their own track.”
- First action: **Try it with sample data**, followed by “Opens a 12-second rehearsal with five editable cues.”

The one-click action opens a populated five-cue demo. The first screen also gives local-storage, offline, and free-access facts. No console or page error occurred on cold load.

### Declared claims — 22/22 PASS after clean installation

`.factory/claims.json` exists and contains 22 entries. A literal pre-install invocation was made first; because this disposable clean checkout had no `node_modules`, Playwright could not start and no claim body executed. After the documented `npm ci`, every exact `test` command from the file was run separately. Each selected one tagged test and exited 0:

`cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `cue-capacity`, `rehearsal-recording`, `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `free-access`, `beat-grid`, `accessibility-in-free`, `static-deployment`, `delete-local-set`, `clear-site-data`, `no-accounts`, `node-20-build`, `browser-suite-contract`, `deployment-config`, and `content-ownership`.

The live landing, product, legal pages, and README were cross-checked against the claim map. No additional material product claim was found outside `.factory/claims.json`.

## Clean candidate gates

The checkout started at the requested candidate commit. Only verifier evidence and handoff files were added.

| Command | Result |
| --- | --- |
| `npm ci` | PASS; 142 packages, 0 vulnerabilities |
| `npm test` | PASS; 3 files, 10 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; `dist/` produced |
| `npm run test:e2e` | PASS; 37/37 in 2.6 minutes |
| Each command in `.factory/claims.json` | PASS; 22/22 individually |
| `/opt/fleet/lib/verify-url.sh` on `/` and `/?demo=1` | PASS; 200, title, `lang=en`, one h1, main, alt text, no console errors |

## Independent functional evidence

Separate from the repository suite, fresh live browser contexts proved:

- Imported an independently generated three-second WAV, selected Orbit, and marked a cue at exactly 0.500 seconds.
- Preserved the track, cue, scene, and note after reload.
- Clamped invalid `-10` BPM and `-5` offset to 20 BPM and 0 seconds with a clear recovery message.
- Rejected a semantic-invalid cue file without changing the valid cue.
- Exported a 481-byte `cuebook/v1` JSON with one cue and audio name/duration but no audio bytes.
- Saved a 119,808-byte WebM rehearsal.
- Used Space to play/pause, Right/Left Arrow to move by one second, and `M` to add a cue.
- Opened the delete dialog from the keyboard; focus moved to **Keep cue**.
- Replayed the five demo transitions twice in real time. The worst cue activation error was **20.8 ms**, inside the brief’s **±150 ms** target.

## Accessibility and responsive behavior

- Axe found zero serious/critical issues on the cold home, populated studio, 390 px demo, Privacy, Terms, and designed 404 states.
- The skip link receives a 3 px cyan focus outline and moves focus to `main`.
- Keyboard transport, cue creation, dialog entry, and tab traversal work without a trap.
- At 390 px, document and viewport widths are both 390 px; all visible interactive targets measured at least 44 × 44 px.
- With `prefers-reduced-motion: reduce`, no document animation remained running while paused.
- Legal and 404 routes each have `lang=en`, a title, one h1, a main landmark, and zero serious/critical Axe findings.

The P1 state-transition defect above remains an accessibility and mobile usability blocker even though automated Axe rules pass.

## Privacy, headers, and deployment identity

- The complete independent real-track flow made 22 requests, all to `https://visualizer-cuebook.sociobot.in`; there were no analytics, uploads, identity, billing, CDN, or other cross-origin requests.
- Browser-observed document responses include a restrictive self-only CSP, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, and Permissions-Policy.
- Hashed JS/CSS use `public, max-age=31536000, immutable`; `sw.js` uses `no-cache`; the manifest uses one-day caching; HTML revalidates after 30 seconds.
- Every rendered link returned 2xx or was an explicit `mailto:` link.
- All **25 served runtime files** in local `dist/` match live response bytes by SHA-256. This proves the deployment corresponds to candidate `f662a72ba54c201e04f44005e38e36c12cbd736e`.
- No backend, API, product-unlock request, sign-in, or payment flow exists. Concurrency, health/build endpoint, Entra authority, and 429/`Retry-After` checks are therefore not applicable.

## PWA and offline behavior

- The service worker activated, controlled the root scope, and completed `registration.update()`.
- Its versioned cache is `cuebook-v1.0.11-shell`.
- After priming, the five-cue demo reloaded offline with the offline status visible.
- The manifest, standalone shell, icons, cache versioning, update path, and offline fallback are present.

## Performance and budgets

Fresh mobile Lighthouse 12.8.2 results:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 96 | 100 | 100 | 100 | 2.23 s | 0.053 | 21 ms | 51,325 B |
| Demo | 96 | 100 | 100 | 100 | 2.24 s | 0.030 | 0 ms | 50,969 B |

The production build stays below every static budget: initial JS is 40,375 bytes raw / 12,682 bytes gzip, initial CSS is 17,558 bytes raw / 4,850 bytes gzip, the self-hosted font is 13,292 bytes, and the mobile hero is 16,254 bytes.

## Evidence location

Verifier captures, Lighthouse JSON, and `verify-url.sh` outputs are under [qa-artifacts/verification-15](./qa-artifacts/verification-15/).

No product code, infrastructure, DNS, billing, secrets, or resources were modified.
