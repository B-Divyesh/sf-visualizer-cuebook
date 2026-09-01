# Cuebook independent verification 8 — FAIL

**Verdict: FAIL.** Candidate `efac3cb641896a1c8cfdc6d996958aca8561d5c1` matches the live deployment at <https://visualizer-cuebook.sociobot.in>, but a supported audio-replacement path can create an invalid cue sheet and an export that Cuebook then refuses to restore. Verification was completed on 2026-09-01 from the clean candidate checkout. Product code was not changed.

## Release-blocking finding

### P1 — replacing audio can leave cues beyond the new track and create a cue file that cannot be restored

**Confirm and check that:** replacing a track preserves only cue times that the replacement track can reach, or asks the user how to resolve later cues before saving the replacement.

Fresh live-browser reproduction:

1. Choose a generated three-second WAV.
2. Move the playhead to 2.499 seconds and mark one cue.
3. Replace the audio with a generated one-second WAV.
4. Observe the message `Audio replaced. Existing cues were kept.`
5. Observe that the cue remains at `2.499` while its input maximum and the track duration are `1.000` second.
6. Export the cue file. It names `short.wav` with duration `1`, but retains the cue at `2.498999`.
7. Import that same export against the current track. Cuebook responds `Cue at 0:02.498 is beyond this track's 0:01.000 duration. Choose matching audio or edit the cue JSON.`

The replacement is saved before any duration comparison. `src/main.ts:287-305` copies every existing cue into the replacement project. The normal cue editor does clamp a changed cue time to the track duration at `src/main.ts:484-487`, which makes the replacement behavior inconsistent with the rest of the product.

Impact: the saved cue cannot occur during playback, and the exported cue file is not accepted by the same product with the audio named in that export. This conflicts with the brief's dependable rehearsal job and the import/export workflow.

Required correction: before saving replacement audio, compare every cue with the new duration. Ask the user to cancel or explicitly shorten/remove affected cues, and add a browser regression covering a shorter replacement and re-import of the resulting export.

## Other findings

### P2 — cue deletion has no confirmation or undo

**Confirm and check that:** deleting a saved cue is reversible or confirmed with the specific cue before the change becomes durable.

Fresh live evidence: select `Delete cue 1` on a one-cue set. The row disappears, no dialog opens, no Undo control is offered, and the only message is `Cue removed.` After 400 ms and reload, the cue count remains zero. The behavior is implemented at `src/main.ts:465-475`.

### P2 — the demo opens partway through retained landing content

**Confirm and check that:** the demo route places the sample studio directly below the persistent demo banner, without unrelated landing sections before it.

On a fresh direct `/demo/` load, focus moves to the visually hidden H1 inside the studio while Preview, How it works, Privacy, and Pricing remain before the studio in document order. Chromium opened at `scrollY=1407` on 1440 × 900 and `scrollY=1753` on 390 × 844. The first viewport showed the end of the pricing section before `Neon classroom rehearsal`. The sample project is visible in the same viewport and the demo banner remains visible, so the mandatory one-click demo check passes, but the entry state is confusing.

Evidence: `.factory/evidence/verification-8-live/demo-initial-desktop.png` and `.factory/evidence/verification-8-live/demo-initial-mobile.png`.

## Required first-read check

**Confirm and check that:** a cold first screen says what Cuebook does, who it serves, and what to select first; confirm a one-click sample is present.

**PASS.** A fresh 1440 × 900 browser showed:

- `Build repeatable visual cues for your audio.`
- `For DJs, VJs, and educators who need repeatable scene changes from their own audio.`
- `Try it with sample data`, followed by the explanation that it opens a 12-second rehearsal with five editable cues.
- The three facts that audio stays in the browser, saved sets work offline, and five cues are free.

The action opened `/demo/` in one click with a persistent `Demo — sample data, nothing is saved` banner and five sample cues. The first-read requirement passes.

## Declared claim checks

**Confirm and check that:** `.factory/claims.json` exists, each listed command runs independently through the production-preview demo entry point, and every declared result is observable.

**PASS: 14/14.** Each exact `test` command was run separately after `npm ci`; the consolidated `npm run test:claims` check also passed 14 tests in 43.4 seconds.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `cue-workflow` | PASS | Generated WAV imported; a cue and note survived immediate reload; cue file downloaded. |
| `offline-reload` | PASS | A dedicated offline context restored the saved studio. |
| `local-privacy` | PASS | Demo editing and playback produced only product-origin and `blob:` requests. |
| `json-no-audio` | PASS | Export parsed as `cuebook/v1` and contained metadata, not `audioBlob`. |
| `free-five` | PASS | Six-cue import asked before shortening; cancel and five-cue confirmation behaved as stated. |
| `plus-license` | PASS | Recorded valid response stored the token, cleared it from the URL, and enabled Plus controls. |
| `plus-recording` | PASS | Recorded license state produced WebM; unsupported capture showed current-browser guidance. |
| `three-scenes` | PASS | Contour, Orbit, and Shards each reached `aria-pressed=true`. |
| `deterministic-scenes` | PASS | Returning to the same media time produced the same canvas-pixel hash. |
| `pwa-install` | PASS | Manifest, three icons, standalone display, and active controlling worker were present. |
| `demo-sandbox` | PASS | Five-cue audible sample reset cleanly and did not change seeded real project/license data. |
| `no-tracking-runtime` | PASS | Home and demo flow had no foreign runtime request; built assets had no foreign runtime source. |
| `billing-contract` | PASS | US$12 one-time terms, no subscription, checkout host, and merchant wording matched the recorded contract. |
| `static-deployment` | PASS | Fresh `dist/` ran the core demo with no required runtime environment placeholder. |

The claim mapping unit check found one browser test for every declared ID. The landing page, legal pages, and README were cross-checked against these mappings; no separate unlisted promise was identified.

## Clean-checkout checks

| Check | Result | Evidence |
| --- | --- | --- |
| Confirm and check dependency installation | PASS | `npm ci` installed 140 packages; audit reported 0 vulnerabilities. |
| Confirm and check unit/contract tests | PASS | `npm test`: 3 files, 9 tests passed. |
| Confirm and check TypeScript | PASS | `npm run typecheck` completed with no errors. |
| Confirm and check lint | PASS | `npm run lint` completed with no findings. |
| Confirm and check exact production build | PASS | `npm run build` produced `dist/` with Vite 6.4.3. |
| Confirm and check full browser suite | PASS | `npm run test:e2e`: 22 tests passed in 59.1 seconds. |
| Confirm and check consolidated claims | PASS | `npm run test:claims`: 14 tests passed in 43.4 seconds. |

This product is a static PWA, not a library or CLI, so consumer-package installation does not apply.

## Independent live workflow and boundary checks

**Confirm and check that:** the smallest useful rehearsal works with representative data, timing boundaries, invalid input, recovery, and repeated runs.

- **Representative demo:** PASS. The original generated sample reported 12 seconds, five cues, non-zero audio-stream energy, selectable Orbit state, and a valid five-cue JSON export with audio metadata only.
- **Timing target:** PASS. Across two runs, the five saved transitions appeared at observed offsets of `[0, 27, 24, 31, 131]` ms and `[0, 31, 23, 54, 20]` ms. All were within the brief's ±150 ms target.
- **Immediate persistence:** PASS. `Immediate save check` remained after reload as soon as the saved cue row appeared.
- **Timing boundaries:** PASS. BPM 19 became 20; BPM 301 became 300; offset -1 became 0; cue time 99 became 3.000; cue time -2 became 0.000. The timing recovery message explained the allowed range.
- **Invalid audio:** PASS. A text file was declined with `Choose an audio file such as MP3, WAV, M4A, or OGG.`
- **Invalid JSON:** PASS. Malformed JSON produced a readable parse message and left the active set available.
- **New set recovery:** PASS. Cancel kept the project; confirmation removed it.
- **Shorter replacement:** FAIL as described in P1.
- **Cue deletion recovery:** FAIL as described in P2.

## Accessibility, responsive layout, and browser quality

**Confirm and check that:** desktop and 390 px mobile routes are semantic, keyboard-operable, readable, motion-aware, and free of serious browser errors.

- Axe returned zero findings, including zero serious/critical findings, on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at 1440 × 900 and 390 × 844.
- Live pages had one H1, one main landmark, `lang="en"`, route-specific titles, and no missing image alt text or unlabeled buttons.
- The skip link had a 3 px cyan focus outline and moved focus to `main`. The repository keyboard check confirmed `M` marks a cue outside form controls and does not fire inside an input.
- At 390 px, `clientWidth` and `scrollWidth` were both 390. No visible button, link, non-file input, or select measured below 44 px in either dimension.
- Reduced-motion media matched and control transition duration became `0.00001s`; scene time is stepped to half-second intervals in reduced-motion mode.
- No console error or page error occurred during the independent normal, validation, mobile, offline, and route checks.
- The factory `verify-url.sh` check passed. Its HTML, JSON, and screenshots are in `.factory/evidence/verification-8-live/`.

## Privacy, PWA, performance, and deployment

**Confirm and check that:** normal use remains local, the installed experience updates and reloads offline, response policy is appropriate, bundle limits hold, and live bytes match the candidate.

- The complete independent home/demo flow, including playback, scene selection, export, delete, reset, and exit, made no request outside `https://visualizer-cuebook.sociobot.in` and browser `blob:` URLs. No analytics, tracking, CDN script/font, or audio-transfer request was observed.
- A real generated WAV, saved cue, and note restored offline with the correct track name and visible offline banner.
- The live worker was activated and controlled the page with `cuebook-v1.0.4-shell`. `registration.update()` completed. A local exact-build update simulation installed `cuebook-v1.0.5-verification-shell` and displayed `An update is ready. Refresh when your rehearsal is paused.`
- Hashed JS, CSS, and image responses use `public, max-age=31536000, immutable`; `sw.js` uses `no-cache`; the manifest uses `max-age=86400`.
- Live responses include CSP with `frame-ancestors 'none'`, HSTS, Permissions-Policy, Referrer-Policy, `nosniff`, and `X-Frame-Options: DENY`.
- Initial app JavaScript is 41.88 kB raw in two files and 13.53 kB gzip. App CSS is 17.34 kB raw and 4.83 kB gzip. The largest production image is 29.71 kB; the self-hosted font is 13.29 kB.
- Fresh Lighthouse 12.8.2 results: Performance 99, Accessibility 100, Best Practices 100, SEO 100, LCP 1,170 ms, total blocking time 3 ms, and CLS 0.053.
- `/`, `/demo/`, `/privacy/`, `/terms/`, manifest, robots, and sitemap returned 200. `/demo/nope` returned the styled 404 with HTTP 404.

Candidate/live SHA-256 identity:

| Artifact | SHA-256 | Match |
| --- | --- | --- |
| `/` | `f437754511e8f0f2ee9d94e055f0633727cea2800ebcfaa587ed88295d792e6d` | yes |
| `/assets/app-CVk28U-_.js` | `0c760b114d8ca150ed3c7a4e6c968593ad7e7ad053934383a5fd655f7b24d86c` | yes |
| `/assets/app-Bzri6fWd.css` | `11ff102d0beecd82d72fcc266a6b352faa928aab9a5ee41510e03a8db1994bf9` | yes |
| `/sw.js` | `ec17dd6dce48947e4091ee5696bb7de2a1218152e1fd74fca9c42d524de011d6` | yes |

Cuebook has no product-origin server endpoint, account, or sign-in flow, so concurrency, server persistence, health/build identity, sign-in authority, and a product-origin request allowance do not apply. The optional license endpoint belongs to the external Sociobot billing service. It was checked with the repository's recorded fixture and was not contacted because this work order permits connections only to `sf-visualizer-cuebook` resources. No request-allowance conclusion is made for that external service.

## Release decision

**FAIL.** Confirm and check that the shorter-track replacement is resolved and covered by a browser regression before release. Confirm and check that cue deletion gains confirmation or undo. Confirm and check that `/demo/` removes or hides landing sections before the sample studio.
