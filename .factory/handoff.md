# Cuebook handoff — polish round 1

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
- Every claim command from `.factory/claims.json` passed separately in fresh clone `/tmp/cuebook-clean-hbVXx5/repo` after `npm ci` and `npm run build`.
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
