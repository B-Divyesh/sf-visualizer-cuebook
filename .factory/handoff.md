# Cuebook repair 6 handoff

## Release status: PASS

Work order `visualizer-cuebook-repair-6` repaired every finding in verifier commit `01810ba1aa644ac15e26eb8bab146a03263cefbd` for candidate `40dfb4f502ef4006ff290f0b94b101ca3e79056e`.

Repair commit `1417ebea07487bcd7c52d1608b111c231fb22e05` keeps Cuebook a static, local-first PWA. The researched brief and all previously passing behavior are unchanged.

## Reproduction and fixes

The production Sociobot verification endpoint was exercised first with a generated invalid token. Requests 1–30 returned the expected invalid-license `200` response. The immediate 31st request returned `429`, `Retry-After: 3`, and `X-RateLimit-After: 3`.

The actual policy is now documented as a 30-request burst per source client. It is a replenishing allowance, not a fixed wall-clock window. A fresh controlled check after the repair again produced 30 invalid `200` responses followed by `429`; this time `Retry-After` was 4 seconds.

The repair adds:

- `npm run verify:license-rate-limit`, which waits for replenishment and proves the live 30/31 boundary with safe invalid tokens;
- a browser claim regression that records 30 accepted checks and a 31st `429` with `Retry-After`;
- a structured license result so rate limiting never looks like an invalid or revoked license;
- visible retry guidance while retaining the pasted token;
- a safe fallback when cross-origin browser code cannot read the gateway header;
- build-time route footer versions sourced from `package.json`;
- exact tests that compare every built route, the service-worker cache version, and the manifest version to `1.0.6`.

Privacy, Terms, home, demo, and 404 footers now all report `v1.0.6`.

## Clean local verification

Run from `/work/repo` on 1 September 2026:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:claims
npm run verify:license-rate-limit
```

- Clean install: 140 packages installed; 0 vulnerabilities.
- Unit, claim-mapping, version, and deployment-policy tests: 10/10 passed.
- TypeScript and ESLint: passed.
- Production build: passed and produced `dist/index.html`.
- Full Playwright suite: 26/26 passed.
- Consolidated declared claims: 15/15 passed.
- Every exact command in `.factory/claims.json` also passed independently.
- Package/consumer testing: not applicable to this static PWA.
- Desktop and 390 × 844 flows: no overflow; all checked controls are at least 44 px.
- Keyboard, focus, native dialogs, and reduced motion: passed.
- Axe: zero violations in the seeded demo at desktop and mobile widths.
- Privacy request logs: no request outside the product origin or browser `blob:` URLs.
- Offline: a saved real set and the seeded demo both reload under an offline browser context.
- URL verifier: correct title, `lang`, one H1, main landmark, alt text, labels, and no console errors.

Production budgets:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| App JavaScript | 46.16 kB | 14.09 kB |
| App CSS | 17.53 kB | 4.88 kB |
| Largest production image | 29.71 kB | — |
| Self-hosted font | 13.29 kB | — |

Local Lighthouse reported Performance 100, Accessibility 100, Best Practices 100, and SEO 100. LCP was 1,429 ms, CLS 0.0005, and total blocking time 69 ms.

Local evidence is in `.factory/evidence/repair-6-local/`.

## Deployment and live verification

The exact `dist/` build was deployed through the work-order script to the existing Azure Static Web App `sf-visualizer-cuebook` in resource group `sociobot`.

- Deployment ID: `516ec66b-2665-4470-9e60-df34bc693e59`
- Live URL: <https://visualizer-cuebook.sociobot.in>
- App version: `1.0.6`

No backend, staging slot, database, Key Vault, billing configuration, other product resource, or out-of-scope storage was read or changed.

Live checks passed:

- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; `/demo/nope` returns the styled 404.
- Home, demo, Privacy, Terms, and 404 identify version `1.0.6`.
- Desktop and 390 px demo views have zero serious or critical Axe findings.
- The 390 px demo has five cues, no horizontal overflow, and reloads offline.
- Valid routes produce no console or page errors and no third-party requests.
- A browser controlled by `cuebook-v1.0.5` saw the update-ready notice after deployment. Reload activated `cuebook-v1.0.6`; only the v1.0.6 shell and runtime caches remained.
- CSP, HSTS, Permissions Policy, Referrer Policy, `nosniff`, and `X-Frame-Options: DENY` are present.
- Hashed assets use one-year immutable caching; `sw.js` uses `no-cache`; the manifest has the correct MIME type.

Live Lighthouse reported Performance 100, Accessibility 100, Best Practices 100, and SEO 100. LCP was 1,098 ms, CLS 0.053, and total blocking time 14 ms.

Local and live SHA-256 values match:

| Artifact | SHA-256 |
| --- | --- |
| `/` | `ed264bb3a4adc84f01a524fd3b8d26d689750b7a30e34d969757a10f238499cc` |
| `/assets/app-J0c8pzUA.js` | `d5d9c3adda628e7c94f50a064a6463c0d76ce0013031197c587eb90183d10861` |
| `/assets/app-LosMPPYx.css` | `656f6bb19558258f56349f811b9f67246a5c3e56029c0a20a07a76ef2efdd203` |
| `/sw.js` | `6a73cbac1607651831606b5018ed4699fe8d39852d318295893564f741c19e32` |
| `/manifest.webmanifest` | `2ebd93763bf65d781d1c96d6a507857b0ad1ede395b7bb7457fffd33370ae72c` |
| `/privacy/` | `a722a1c2773c2b7b8cb508716a63eb5d3384caa92e22717de51460783d1ca826` |
| `/terms/` | `0839ad9a59ca91387e2663c64e2e4bd38cf211d6ffbce5323a6b503abeb49415` |

Live screenshots, URL-verifier output, Lighthouse output, and the live-check summary are in `.factory/evidence/repair-6-live/`.

## Known gaps and next steps

No product release blocker remains. The billing gateway sends `Retry-After` on the raw 429 response but does not currently CORS-expose that header. Cuebook therefore shows a timed retry when readable and safe wait guidance otherwise.
