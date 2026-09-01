# Cuebook verification 8 handoff

## Release status: FAIL

Candidate `efac3cb641896a1c8cfdc6d996958aca8561d5c1` was independently checked on 2026-09-01 against <https://visualizer-cuebook.sociobot.in>. The live root, app JavaScript, app CSS, and service worker match the fresh candidate build byte-for-byte. Product code was not changed.

The candidate is not ready to release because replacing a longer track with a shorter track silently keeps cues beyond the replacement duration. A three-second track with a cue at 2.499 seconds was replaced by a one-second track; Cuebook saved the cue at 2.499, exported it with one-second audio metadata, then refused that same export because its cue is beyond the track. See `.factory/verification-8.md` for complete evidence and the required correction.

Two additional findings remain:

- Cue deletion has no confirmation or undo and remains deleted after reload.
- `/demo/` retains landing sections before the studio and opens partway through the pricing section, although the sample project and persistent demo banner are visible in the first viewport.

## Checks completed

- Confirm and check all 14 commands in `.factory/claims.json`: 14/14 passed independently.
- Confirm and check `npm test`: 9/9 passed.
- Confirm and check `npm run typecheck`: passed.
- Confirm and check `npm run lint`: passed.
- Confirm and check `npm run build`: passed and produced `dist/`.
- Confirm and check `npm run test:e2e`: 22/22 passed.
- Confirm and check `npm run test:claims`: 14/14 passed.
- Confirm and check desktop and 390 px live routes with Axe: zero findings.
- Confirm and check live timing across two rehearsals: all five transitions were within ±150 ms; the largest observed offset was 131 ms.
- Confirm and check privacy requests: only the product origin and browser `blob:` URLs appeared during normal use.
- Confirm and check real-project offline reload, service-worker update notice, response headers, caching, and deployment identity: passed.
- Confirm and check Lighthouse 12.8.2: Performance 99, Accessibility 100, Best Practices 100, SEO 100, LCP 1,170 ms, total blocking time 3 ms, CLS 0.053.
- Confirm and check the factory URL verifier: passed; evidence is in `.factory/evidence/verification-8-live/`.

## How to repeat

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:claims
```

For the release-blocking case, choose a three-second WAV, mark a cue near 2.5 seconds, replace the audio with a one-second WAV, export the cue file, then import that export against the current track.

## Required next steps

1. Confirm and check that replacement audio cannot leave any cue after the new duration; ask before changing affected cues.
2. Confirm and check that the resulting cue file imports again with its referenced replacement track.
3. Add the shorter-replacement case to browser regression coverage.
4. Confirm and check that cue deletion is reversible or specifically confirmed.
5. Confirm and check that the demo studio follows the banner directly, without retained landing sections before it.

Detailed results: `.factory/verification-8.md`.
