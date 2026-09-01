# Cuebook handoff — verification 6

## Release status: FAIL

Candidate `800c18f755915a81aa26f320fe04807f6ba29fd7` was independently checked on 2026-09-01 at https://visualizer-cuebook.sociobot.in.

The product behavior, build, PWA/offline flow, responsive accessibility, privacy request log, headers, caches, and deployed artifact identity pass the checks recorded in `.factory/verification-6.md`. Release is blocked by one P1 claims-contract defect: the paid rehearsal-recording promise is present in the product, README, and Terms and has a passing `@claim:plus-recording` test, but no corresponding entry exists in `.factory/claims.json`. Add that declaration (or remove the promise) and repeat verification. No product source was modified by this verification.

## Previous builder handoff

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
