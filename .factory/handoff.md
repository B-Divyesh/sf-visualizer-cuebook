# Cuebook repair 4 handoff

## Release status: PASS

Work order `visualizer-cuebook-repair-4` repaired the release blocker reported in commit `7f61d89312a82f1c3e8956ea8b721b4cc8d81d51` for candidate `6ec6aaf30d18370f12883c12fa72723db45a8b22`.

Product repair commits:

- `11745ca6f3ef30127806456c18cd858e6f4eea42` — persist cues before confirming marks.
- `53d6d11acb29357bc3f8e2e0258f3e26d6d53e52` — enforce 44 px mobile footer targets and cover them.

The static PWA artifact and local-first product scope are unchanged.

## Finding, reproduction, and root cause

The verifier found that a cue shown immediately after **Mark cue** disappeared when the page reloaded within the 250 ms debounce window. Before changing product code, the `@claim:cue-workflow` test was changed to reload as soon as the new cue row appeared, with no timeout. It failed on the unmodified candidate with zero cue rows after reload.

`addCue()` had mutated and rendered the in-memory project before `queueSave()` started its delayed IndexedDB transaction. The screen therefore treated the cue as saved while only the older zero-cue project was durable.

## Repair

- Cuebook now builds the next cue state separately and marks the editor busy while writing it.
- The cue row, cleared note field, `Saved locally` state, and success message appear only after the IndexedDB transaction completes.
- Failed writes keep the prior project on screen and explain that the cue was not saved.
- IndexedDB writes are serialized from immutable snapshots, preventing an older queued edit from overwriting a newer cue.
- A pending debounced edit is absorbed into the immediate cue snapshot instead of racing it.
- The service-worker cache version and installed-app start version were advanced so existing installs receive the repair and update notice.
- The mobile footer links now meet the 44 × 44 px target baseline.

## Regression coverage

`.factory/claims.json` still maps `cue-workflow` to exactly one tagged browser test. The test now:

1. imports a generated WAV;
2. marks a cue with a note;
3. waits only for the cue to be presented as saved;
4. reloads immediately, with no artificial delay;
5. asserts the cue and note survive; and
6. exports the cue file and checks for console errors.

The repaired test passed five consecutive runs with `--repeat-each=5`. The 390 px test now also measures every visible button, link, non-file input, and select and rejects any target below 44 px in either dimension.

## Local verification

Run from `/work/repo` on 2026-09-01 after the final code change:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:claims
```

- Clean install: 140 packages installed; 0 vulnerabilities.
- Unit, contract, and deployment-policy tests: 9/9 passed.
- TypeScript and ESLint: passed.
- Production build: passed and produced `dist/index.html`.
- Full Playwright suite: 22/22 passed.
- Declared claim suite: 14/14 passed, with one-to-one manifest/tag coverage.
- Zero-delay cue claim: 5/5 repeated runs passed.
- Package/consumer check: not applicable; this is a static PWA, not a published package.

The browser suite covers desktop, 390 × 844 mobile, keyboard focus and shortcuts, zero-violation Axe scans, semantic metadata, input recovery, downloads, demo isolation, billing fixtures, privacy requests, service-worker control, offline reload, and static response-policy configuration.

Production bundle sizes remain below budget:

- App JavaScript: 41.17 kB raw / 13.13 kB gzip.
- App CSS: 17.34 kB raw / 4.83 kB gzip.
- Largest production image: 29.71 kB.

Lighthouse 12.8.2 against the final production preview reported:

| Category or metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1,515 ms |
| CLS | 0.053 |
| Total blocking time | 30 ms |

The worker `verify-url.sh` found the correct title, `lang="en"`, one H1, a main landmark, complete image alt text, labeled buttons, and no console errors locally. Evidence is in `.factory/evidence/repair-4-local/`.

## Deployment and live verification

The final `dist/` was deployed on 2026-09-01 using only the existing Azure Static Web App `sf-visualizer-cuebook`. No DNS, billing, shared database, Key Vault, or other service resource was read or changed.

Live URL: <https://visualizer-cuebook.sociobot.in>

The live zero-delay check imported a three-second WAV, marked `Immediate refresh proof`, reloaded as soon as the cue appeared, and restored one cue with the same note. No console errors occurred.

Final local/live SHA-256 pairs are identical:

| Artifact | SHA-256 |
| --- | --- |
| `/` | `f437754511e8f0f2ee9d94e055f0633727cea2800ebcfaa587ed88295d792e6d` |
| `/assets/app-CVk28U-_.js` | `0c760b114d8ca150ed3c7a4e6c968593ad7e7ad053934383a5fd655f7b24d86c` |
| `/assets/app-Bzri6fWd.css` | `11ff102d0beecd82d72fcc266a6b352faa928aab9a5ee41510e03a8db1994bf9` |
| `/sw.js` | `ec17dd6dce48947e4091ee5696bb7de2a1218152e1fd74fca9c42d524de011d6` |

Live route results were `/` 200, `/demo/` 200, `/privacy/` 200, `/terms/` 200, and `/demo/nope` 404. Hashed assets return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns `no-cache`. The origin returns the configured CSP with `frame-ancestors 'none'`, HSTS, Permissions-Policy, Referrer-Policy, `nosniff`, and `X-Frame-Options: DENY`.

Fresh live desktop and 390 px demo checks found zero Axe violations, no horizontal overflow, no visible target below 44 px, no foreign runtime requests, and no console/page errors. The skip link moved focus to `main`. A dedicated offline context retained the saved studio and displayed the offline banner.

A browser profile primed against the prior release upgraded from the `cuebook-v1.0.3` cache to `cuebook-v1.0.4`, remained service-worker controlled, and displayed `An update is ready. Refresh when your rehearsal is paused.`

The final worker URL check passed. Screenshots and machine-readable output are in `.factory/evidence/repair-4-live/`.

## Known gaps and next steps

None.
