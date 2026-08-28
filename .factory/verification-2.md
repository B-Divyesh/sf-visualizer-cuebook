# Cuebook independent verification 2 — FAIL

**Date:** 2026-08-28  
**Candidate:** `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7`  
**Live URL:** <https://visualizer-cuebook.sociobot.in>  
**Method:** clean detached worktree at the exact SHA; no product code changed.

## Verdict

**FAIL — do not release this candidate as the acceptance contract requires safe invalid-input recovery and dependable portable cue sheets.** The prior deployment-only P0 is resolved: the live site now has valid TLS and serves byte-identical candidate artifacts. Local install, tests, build, normal workflow, PWA offline/update behavior, accessibility smoke checks, and basic privacy checks pass. However, invalid/incorrect cue JSON is silently accepted into an unrehearsable state, timing controls visibly disagree with their accepted values, and a paid-limit import loss is not disclosed.

## Release-blocking defects

### P1 — Cue JSON import accepts invalid timing and cues outside the loaded audio

With a 3-second local WAV loaded, import a syntactically valid `cuebook/v1` JSON file containing a cue at `99` seconds and timing `{ "bpm": "not-a-number", "beatOffset": -5 }`.

- The import reports success instead of rejecting or normalizing the data.
- The cue row visibly shows `99.000`, beyond the loaded track's 3-second duration, so it cannot be reached during rehearsal.
- The BPM `<input type=number>` becomes blank for the string value and Beat 1 offset visibly shows `-5`.

`parseCueFile` validates only that `timing` is present; it neither validates finite/ranged BPM/offset values nor bounds each imported cue to the actual loaded audio duration. This violates the required invalid-input recovery and makes the advertised portable cue-sheet workflow unreliable. Reject malformed values with a useful error, or clamp them visibly and require/confirm a matching-duration track before importing.

### P2 — Manual BPM/offset values are silently clamped in state but not corrected in the controls

After loading audio, enter `999` for BPM and `-1` for Beat 1 offset and blur each field. The UI continues to display `999` and `-1`. The implementation clamps the project model to BPM 300 and offset 0, so displayed settings can disagree with the beat calculation/cue metadata until a reload. Normalize the inputs to the accepted values or show an explicit range error.

### P2 — Free-tier import truncates a cue without retaining its warning

Import a valid six-cue file while locked. Exactly five cues are retained, but the initial limit warning is immediately overwritten by “Cue sheet imported. Check that the audio matches.” The user is not told that their sixth cue was discarded. Preserve/combine the warning and offer a safe next action before replacing data.

### P2 — Deployed hashed assets are not cacheable as immutable assets

The live candidate does match the SHA, but `/assets/app-6q2OwFvn.js` and `/assets/app-CI8R8FTv.css` are served with `Cache-Control: public, must-revalidate, max-age=30`. Hashed static assets need long-lived immutable caching under the PWA performance contract; a 30-second revalidation policy does not meet it.

### P3 — Browser response-policy hardening is incomplete

The live response has HSTS, referrer policy, and `nosniff`, but no `Content-Security-Policy`, `Permissions-Policy`, or framing policy. `manifest.webmanifest` is served as `application/octet-stream`, not a manifest JSON MIME type. Configure the standard policies and `application/manifest+json` (or compatible JSON manifest MIME type).

## Checks that passed

| Area | Result | Fresh evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci`: 60 packages, audit 0 vulnerabilities. |
| Unit tests | PASS | `npm test`: 1 file, 4/4 Vitest tests. |
| Type check / production build | PASS | `npm run build` executed `tsc --noEmit && vite build`; `dist/` emitted. |
| Browser integration | PASS | `npm run test:e2e`: 4/4 Playwright Chromium tests, including onboarding/studio axe serious/critical scans, 390px flow, persistence, offline reload, and license token handling. |
| Bundle budgets | PASS | Main JS 31,267 B raw / 10.56 kB gzip; app CSS 15,224 B raw / 4.39 kB gzip; self-hosted font 13,292 B; hero WebP 29,712 B. |
| Core rehearsal flow | PASS | Imported representative WAV, scrubbed to 1.500 s, selected Orbit, exercised intensity 0 and hue -180, created/edited/seeked five cues, enforced sixth-cue Plus dialog, deleted/re-added via keyboard `M`, exported `cuebook/v1` JSON without audio bytes, and persisted five cues over reload. No console or page errors. |
| Invalid basic input | PASS | Non-audio selection produced an actionable error; malformed JSON produced its parse error and left the editor usable. The semantic-invalid JSON case above fails. |
| Desktop / 390px / keyboard | PASS | At the live URL, one `h1`, `main`, `lang=en`, and title are present. First Tab reaches the visible 44px skip link (at x=12/y=12 after its 180ms transition); 390px `scrollWidth - clientWidth = 0`. |
| Accessibility / motion | PASS | Repository axe tests found zero serious/critical issues on onboarding and studio. Focus is a 3px cyan outline. `prefers-reduced-motion` CSS disables transitions/animations; no console/page errors in live Chromium smoke. |
| PWA offline / update | PASS | Locally, a controlled page used `cuebook-v1.0.0-shell` and `runtime` caches. Offline reload retained the app shell and showed the offline banner. Serving a version-bumped worker to the same profile produced “An update is ready. Refresh when your rehearsal is paused.” |
| Privacy / requests | PASS | Normal rehearsal capture contained only same-origin and `blob:` URLs. No analytics, CDN font/script, or audio upload was found; only the documented Sociobot license endpoint exists in source and is not contacted in the normal flow. Audio is IndexedDB-local and JSON export excludes it. |
| Live deployment identity | PASS | TLS navigation succeeded. SHA-256 matches local candidate `dist/` for `index.html` (`8027…36ec`), JS (`2769…5120`), CSS (`b38e…50d4`), manifest (`840c…5c93`), and `sw.js` (`418d…c148`). |

## Live response-policy observations

- HTTPS root, service worker, manifest, privacy, and terms all returned 200. HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff` are present.
- No `Content-Security-Policy`, `Permissions-Policy`, or framing policy is returned. The manifest is sent as `application/octet-stream` rather than a manifest JSON MIME type (P3 above).
- A fresh Lighthouse score could not be produced in this container: Lighthouse 13.4.1 repeatedly lost its CDP connection to the supplied Chromium (both self-launched and remote-debugging modes). This is an environment/tool limitation, not a passing score; bundle evidence and axe/browser checks above were completed.

## Required remediation

1. Validate and visibly normalize/reject all imported cue timings and timing settings before mutating the active project; reject cues beyond the loaded track or require explicit duration reconciliation.
2. Correct manual BPM/offset feedback and retain the free-tier truncation warning.
3. Configure immutable long-lived caching for content-hashed assets and add standard browser policy headers/manifest MIME type.
4. Re-run independent verification against the remediated SHA and live deployment.
