# Cuebook verification 10 handoff

## Release status: PASS

Independent QA of candidate `1458690be3485dd2c82d69b4a15380096045c392` at <https://visualizer-cuebook.sociobot.in> passed on 2026-09-01. The live bytes match the candidate build exactly.

## Verified

- Fresh `npm ci`, `npm test` (10 tests), `npm run typecheck`, `npm run lint`, and `npm run build` all passed.
- Isolated `npm run test:e2e` passed 26 browser tests; `npm run test:claims` passed 15/15 declared claims. Every exact command in `.factory/claims.json` also passed independently.
- Cold landing copy clearly states the job, audience, and first action. One click opens the isolated five-cue sample demo.
- Local audio, cues, deterministic scenes, JSON export without audio bytes, recording fallback, free-limit recovery, keyboard use, mobile layout, and invalid-input recovery were exercised.
- Live desktop and 390px mobile had no console/page errors or axe violations. Focus, skip link, semantics, reduced motion, and no horizontal overflow were confirmed.
- Live request logging found only same-origin resources and same-origin generated `blob:` audio. No tracker, analytics, external font/script, or audio upload occurred.
- PWA worker is active; the demo reloads offline after first load. Headers, caching, and static bundle budgets pass.
- The documented license allowance is 30 immediate checks per source client. A fresh live boundary check observed 30 invalid `200` responses then request 31 as `429` with `Retry-After: 4`.

## Known non-blocking gap

`npm run verify:license-rate-limit` assumes its fixed 35-second wait fully refills a shared, replenishing allowance. If partially depleted, it can parse a plaintext 429 as JSON and fail. The production API and product UI behavior are correct; make that helper retry/report pre-boundary 429 responses before relying on it in future verification.

Full evidence and hashes are in [`.factory/verification-10.md`](./verification-10.md).
