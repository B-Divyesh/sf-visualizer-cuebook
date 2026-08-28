# Cuebook independent verification 4 — FAIL

**Date:** 2026-08-28  
**Candidate:** `c19d25e8c1e32a88e4f526a7213a9caef1cc6aa7`  
**Live URL:** <https://visualizer-cuebook.sociobot.in>  
**Method:** fresh detached checkout at the candidate; no product source was changed.

## Verdict

**FAIL — do not release.** The deployment is now healthy and matches the rebuilt candidate exactly, and the normal cue-making, offline/PWA, recording, accessibility, mobile, privacy, and bundle checks pass. However, the imported-cue recovery path still accepts semantically invalid timing into the active rehearsal project. It can leave an unreachable cue and visibly invalid timing settings while reporting success. The free-tier importer also removes a cue without retaining its warning. These defects undermine the product's core promise of a reliable, repeatable cue sheet.

## Blocking defects

### P1 — semantically invalid cue JSON is accepted as a successful import

With a loaded 3.000-second WAV, import this syntactically valid `cuebook/v1` JSON:

```json
{
  "format": "cuebook/v1",
  "title": "Broken",
  "timing": { "bpm": "not-a-number", "beatOffset": -5, "clock": "media-currentTime" },
  "cues": [{ "id": "bad", "time": 99, "beat": 1, "scene": "contour", "intensity": 72, "hue": 0, "note": "unreachable" }]
}
```

Fresh Chromium evidence:

- The app reports **“Cue sheet imported. Check that the audio matches.”**
- The cue editor contains `99.000` although its maximum is `3`; transport can never reach that cue on this track.
- BPM is blank (the number control rejects the stored string) and Beat 1 offset visibly remains `-5`, below its minimum.
- No console/page error is raised, so the user receives no recovery path.

Reject invalid/non-finite/range-invalid timing before replacing the active project, or visibly normalize it and require an explicit duration-mismatch decision. This is a direct failure of the brief's dependable, exact rehearsal cue sheet.

### P2 — free-tier cue import silently truncates user work

With a loaded track and no Plus entitlement, import a valid six-cue `cuebook/v1` file. The sheet contains five rows afterward, but the only visible notice is **“Cue sheet imported. Check that the audio matches.”** The intended **“Imported the first 5 cues…”** limit notice is immediately overwritten. Retain/combine the warning and give the user a non-destructive recovery choice before discarding a cue.

### P2 — BPM/offset range feedback disagrees with the saved model

After importing audio, enter `19` BPM and `-1` Beat 1 offset, then blur. The controls still display `19` and `-1`, while code clamps the project to `20` and `0`. The visible values and beat grid can therefore disagree with the saved/exported timing until reload. Normalize the fields to accepted values or show a range error.

### P2 — live hashed assets do not have immutable caching

The deployed content-hashed JS and CSS both return `Cache-Control: public, must-revalidate, max-age=30`. This does not meet the PWA performance/caching requirement for long-lived immutable hashed assets. Configure the static host to send an immutable long-lived policy for `/assets/*` hashes.

### P3 — deployment response-policy hardening is incomplete

The live origin has HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`, but lacks CSP, Permissions Policy, and frame protection (`frame-ancestors` or `X-Frame-Options`). The manifest is served as `application/octet-stream`; Chromium still accepts it, but a manifest JSON MIME type is the correct deployment policy.

## Passed checks

| Area | Result | Fresh evidence |
| --- | --- | --- |
| Clean install | PASS | Detached candidate: `npm ci`; 60 packages installed, 0 vulnerabilities reported. |
| Unit tests | PASS | `npm test`: 4/4 Vitest tests. |
| Type check / production build | PASS | `npm run build` (`tsc --noEmit && vite build`) completed and produced `dist/`; no lint script exists. |
| Repository browser tests | PASS | `npm run test:e2e`: 4/4 Playwright Chromium tests. |
| Normal job flow | PASS | Imported a user-owned WAV, chose all three scenes, placed cues at 0, 0.150 and 1.500 seconds, persisted/reloaded, exported `cuebook/v1` JSON without audio, deleted a cue, and recovered from malformed JSON/non-audio input. Cue note markup stayed escaped as text. |
| Recording | PASS | With a cached valid test license in Chromium, recording started/stopped and downloaded `record-rehearsal.webm` (220,139 B) with “Rehearsal video saved.” |
| Desktop / 390 px mobile | PASS | Visual review at 1440 px and 390×844; mobile `scrollWidth === clientWidth` (390). |
| Keyboard / motion | PASS | First Tab exposes the 3 px cyan focus-ring skip link and Enter focuses `main`; Arrow and `M` work outside fields and do not fire inside a form field. Reduced-motion has `hero-art` transform `none` and immediate transitions. |
| Accessibility | PASS | Independent axe scans of desktop onboarding and 390 px reduced-motion onboarding: zero serious/critical findings. Title, `lang=en`, one `h1`, `main`, landmarking, alt text, focus and contrast checks passed. |
| PWA | PASS | Live Chromium has no installability errors, a valid parsed manifest, active controller, and versioned shell cache. A saved audio project reloaded while offline with the offline banner. A local exact-build worker-version simulation showed the update toast: “An update is ready. Refresh when your rehearsal is paused.” |
| Privacy / outbound traffic | PASS | Normal live rehearsal requested only same-origin resources and blobs; no analytics, CDN runtime/font, tracking, or audio upload was observed. Source inspection confirms IndexedDB project/audio storage and JSON export excludes audio. The sole external endpoint is the documented Sociobot checkout/license verification API when a license is used. |
| Bundle / quality | PASS | JS 31,267 B raw / 10.56 kB gzip (≤200 kB); CSS 15,224 B raw / 4.39 kB gzip (≤50 kB); font 13,292 B; hero 29,712 B. Fresh Lighthouse 12.8.2 on local production output: Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 1.2 s, LCP 1.5 s, CLS 0.054, TBT 180 ms. |
| Live candidate identity | PASS | SHA-256 matches local production output: root `8027d16f…314636ec`, JS `27694cc9…b15120`, CSS `b38e9368…e450d4`, and service worker `418d4e4e…97cc148`. HTTPS loaded without console/page errors. |

## Required remediation

1. Validate every imported timing value and reconcile/reject out-of-duration cue times before changing the active project.
2. Keep displayed BPM/offset consistent with accepted state and preserve the free-tier truncation warning/recovery path.
3. Set immutable hashed-asset caching and complete the deployment response policies.
4. Re-run independent verification against a new candidate and deployed artifact.
