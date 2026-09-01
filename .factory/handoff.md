# Cuebook handoff — repair 3

## Release status: PASS

Repair source commit: `310eb36e1595d03f8fde30502b67207834443cb7`.

This repair addresses the sole P1 finding in independent verification 6 for candidate `800c18f755915a81aa26f320fe04807f6ba29fd7` (report commit `1e4912728522cdb08f88ce61680623783a1f1bcb`). The paid rehearsal-recording promise remains available. It is now declared in the required claims manifest and protected by a bidirectional contract regression.

## What changed

- Added the `plus-recording` claim to `.factory/claims.json` with its exact existing command: `npm run test:e2e -- --grep @claim:plus-recording`.
- Defined the supported-capture behavior and recovery path in the claim sandbox: a valid cached Plus license saves a WebM; missing canvas capture tells the user to use a current Chromium or Firefox browser.
- Extended the existing tagged recording regression to assert both the downloadable `-rehearsal.webm` result and that recovery guidance.
- Strengthened `tests/claims.test.ts` so declared claim IDs and every `@claim:*` browser-test ID must be a one-to-one match. An orphaned tagged test such as the original `plus-recording` failure now fails `npm test`.

## Reproduction and verification

Before the repair, a clean install reproduced the verifier's exact contract discrepancy: 13 declarations, 14 tagged tests, and one orphan tag: `plus-recording`. After the repair the same inventory is 14 declarations, 14 tags, zero orphan tags, and zero undeclared claim IDs.

Executed from `/work/repo` on 2026-09-01:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:claims
```

- Clean install: passed (`npm ci`; audit reported 0 vulnerabilities).
- Unit/integration contract suite: 9/9 passed.
- Typecheck and ESLint: passed.
- Production build: passed and wrote `dist/`. App JavaScript is 40.10 kB raw / 12.84 kB gzip; app CSS is 17.30 kB raw / 4.82 kB gzip.
- Full Playwright suite: 22/22 passed. It covers desktop and 390 px mobile, keyboard use, Axe checks, demo isolation, privacy requests, update/offline behavior, and response-policy configuration.
- Consolidated claim runner: 14/14 tagged browser claims passed.
- Every one of the 14 individual `test` commands in `.factory/claims.json` was run separately against the production preview and passed, including `@claim:plus-recording`.
- Consumer/package test: not applicable; Cuebook is a static PWA, not a published package.

## Deployment and live identity

Deployed `dist/` to the configured production Static Web App `sf-visualizer-cuebook` on 2026-09-01 using the static deployment configuration. The deploy CLI's temporary ignored `.env` credentials file was removed after completion. Product assets are intentionally content-identical to the verified candidate because this repair changes the claims manifest and regression coverage only.

| Live artifact | SHA-256 | Match |
| --- | --- | --- |
| `/` | `0bd395416d90af8d2f75e797c76f5a50c819890f36a3d5d851fbbf04bef7e2de` | local `dist/index.html` |
| `/assets/app-C3iipUuf.js` | `da46ffd05422ced58802b110984e27bec0a9937def147e0baf27f99a1229d980` | local build |
| `/assets/app-BGpF-uV8.css` | `8e661b8038b4d668533806f50d83f52fcbf21e24d51b3d7409a2e0540a251a9b` | local build |
| `/sw.js` | `1ae8a594e5190a06598a7bd3e8987a5b48526ccee51ba9d9d96ce425490744b2` | local build |

Live route checks passed: `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200; `/demo/nope` returned the designed 404. Browser checks on the live demo found title `Demo — Cuebook`, `lang="en"`, one H1, one main landmark, no image missing alt text, no console/page errors, and zero Axe violations at desktop and 390 × 844 with reduced motion. The skip link moved focus to main. Request capture observed only the product origin and `blob:` URLs. An activated service worker controlled the page; `registration.update()` completed, and a dedicated offline context reloaded the demo studio with its offline banner.

Live `/assets/*` responses send `Cache-Control: public, max-age=31536000, immutable`. The live origin also sends the configured CSP (including `frame-ancestors 'none'`), HSTS, Referrer-Policy, Permissions-Policy, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.

## Known gaps and next steps

None. The required claims declaration, regression coverage, local quality gates, deployment, and live identity checks are complete.

## Historical builder handoff

## Delivered

- Repaired every `review-1` finding. The detailed finding map is in `.factory/polish-1.md`.
- The one-click `/demo/` and `?demo=1` paths use an in-memory project and a hard-isolated license fixture. Demo cannot touch real IndexedDB or `sb_license:*` storage.
- Replaced the silent sample with an original audible, deterministic 12-second 100 BPM click-and-tone rhythm. Provenance is recorded in `.factory/design.md`.
- Added persistent demo controls, exact demo deployment routes, complete landing structure, shared legal/404 skeletons, route metadata, focused route headings, and 44 px touch targets.
- Added and exercised a complete claims contract in `.factory/claims.json`.

## Revision

Repair commit: `759f62e6da8169d11625bc6dc12f6924c4c38c3e` (includes the Azure-valid normalized demo route).

## Verification

Run from the repository root:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:claims
```

Executed locally on 2026-08-30:

- `npm test`: 9 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; `dist/` created. Main JS: 40.10 KB raw / 12.84 KB gzip. Main CSS: 17.30 KB raw / 4.82 KB gzip.
- `npm run test:e2e`: 22 passed, including desktop and 390 px zero-violation Axe checks for seeded demo.
- Every claim command from `.factory/claims.json` passed separately in final fresh clone `/tmp/cuebook-final-bPPOSk/repo` after `npm ci` and `npm run build`.
- Cold local screenshots: `.factory/evidence/demo-desktop.png` and `.factory/evidence/demo-mobile.png`.

The local Vite preview returns its development fallback for unknown paths. Production strict 404 behavior is enforced by the exact normalized `/demo` rule in `staticwebapp.config.json`; the deployment-policy and browser configuration tests cover that rule.

## Deployment and live check

Deployed production with the configured `sf-visualizer-cuebook` Azure Static Web App on 2026-08-30.

- Cold checks returned: `/` 200, `/demo/` 200, `/privacy/` 200, `/terms/` 200, and `/demo/nope` designed 404.
- Live titles: Cuebook home, Demo — Cuebook, Privacy — Cuebook, Terms — Cuebook, and Page not found — Cuebook.
- Live 390 px Axe checks found zero violations on home, demo, privacy, terms, and 404. Normal browser console checks were clean; Chrome reports the expected failed navigation resource for the 404 response itself.
- Live screenshots: `.factory/evidence/live-demo-mobile.png` and `.factory/evidence/live-home-desktop.png`.

## Known gaps

None.
