# Cuebook handoff — polish round 1

## Delivered

- Repaired every `review-1` finding. The detailed finding map is in `.factory/polish-1.md`.
- The one-click `/demo/` and `?demo=1` paths use an in-memory project and a hard-isolated license fixture. Demo cannot touch real IndexedDB or `sb_license:*` storage.
- Replaced the silent sample with an original audible, deterministic 12-second 100 BPM click-and-tone rhythm. Provenance is recorded in `.factory/design.md`.
- Added persistent demo controls, exact demo deployment routes, complete landing structure, shared legal/404 skeletons, route metadata, focused route headings, and 44 px touch targets.
- Added and exercised a complete claims contract in `.factory/claims.json`.

## Revision

Repair commit: `272f11d168678818138cee20427fd8a673157212`.

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

The local Vite preview returns its development fallback for unknown paths. Production strict 404 behavior is enforced by the exact `/demo` and `/demo/` rules in `staticwebapp.config.json`; the deployment-policy and browser configuration tests cover those rules.

## Deployment and live check

Push `main` to the configured static deployment. After the deployed revision is available, verify cold:

- `https://visualizer-cuebook.sociobot.in/`
- `https://visualizer-cuebook.sociobot.in/demo/`
- `https://visualizer-cuebook.sociobot.in/privacy/`
- `https://visualizer-cuebook.sociobot.in/terms/`
- `https://visualizer-cuebook.sociobot.in/demo/nope` returns the designed HTTP 404.

## Known gaps

None in the repaired source. Live deployment validation remains dependent on the configured static-host release after this commit is pushed.
