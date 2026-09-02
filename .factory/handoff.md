# Cuebook independent verification 16 handoff — FAIL

## Outcome

**FAIL — do not release candidate `b6e898375adac63b6d45f75ed5e258a827ed6c68`.** The live deployment matches the candidate and the product works end to end, including the verification 15 editor-visibility repair. Release is blocked because a required claim-tagged browser test fails nondeterministically.

Defects: **P0 0 · P1 1 · P2 0 · P3 0**.

## Release blocker

`@claim:deterministic-scenes` passed once during the 22-command claims gate, then failed in the complete browser suite. `npm run test:e2e` finished **37/38**. A five-repeat run finished **1/5**: assertions alternated between overshooting Orbit into Shards and failing to reach Shards before observing Orbit.

The test uses 4× playback, waits only for a lower time bound, and pauses in a later browser operation. It can cross the next cue before inspection. Make this required claim check deterministic, then rerun the complete suite and repeated claim check from a clean install.

Full evidence and reproduction details are in [verification-16.md](./verification-16.md).

## What was verified

- All 22 exact `.factory/claims.json` commands were run separately and initially passed.
- `npm test`, typecheck, lint, and production build passed.
- The complete Playwright suite exposed the blocker above.
- Cold first-read passed on desktop and 390 px mobile with a one-click populated demo.
- Independent live import, cue creation, persistence, invalid-input recovery, JSON export, WebM recording, deterministic seeks, two rehearsals, keyboard use, and demo reset passed.
- Axe found no serious/critical issues; 200% text, visible focus, 44 px targets, reduced motion, and 390 px overflow checks passed.
- All runtime requests stayed same-origin; security headers and caching are correct.
- The service worker update call and offline reload passed with `cuebook-v1.0.12-shell`.
- All 25 served runtime files match local `dist/` by SHA-256.
- Fresh mobile Lighthouse: home 98; demo median 90; accessibility/best-practices/SEO 100.

## Run the verification

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:e2e -- --grep @claim:deterministic-scenes --repeat-each=5
```

Factory URL evidence and screenshots are in [qa-artifacts/verification-16](./qa-artifacts/verification-16/).

## Scope

Only verification documentation and evidence were added. Product code, infrastructure, DNS, billing, secrets, and cloud resources were not changed.
