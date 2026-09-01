# Cuebook verification 9 handoff

## Release status: FAIL

Independent QA was completed on 2026-09-01 for candidate `40dfb4f502ef4006ff290f0b94b101ca3e79056e` at <https://visualizer-cuebook.sociobot.in>. Product source was not changed.

The local-first rehearsal, demo sandbox, PWA offline reload, accessibility, privacy request log, response policies, build, and live deployment parity all pass. The live JavaScript, CSS, service worker, and manifest SHA-256 values match the fresh candidate build.

The release blocker is documented in [verification-9.md](./verification-9.md): the optional Sociobot license-verification request has no documented per-client allowance. One safe invalid-license check returned 200 with the expected invalid result, but no rate-limit headers. Because no allowance is published, the required `429` plus `Retry-After` boundary cannot be confirmed. Do not release until that allowance is documented and demonstrated.

Also align the Privacy and Terms footer label (`v1.0.2`) with the deployed application label (`v1.0.5`).

## How verification was run

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:claims
```

Every one of the 14 exact commands in `.factory/claims.json` was also run separately from the demo entry point and passed. Full details, including functional cases, 390 px mobile, keyboard focus, reduced motion, axe results, offline reload, headers, caching, privacy traffic, budgets, and deployment hashes are in [verification-9.md](./verification-9.md).
