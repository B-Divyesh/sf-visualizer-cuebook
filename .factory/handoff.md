# Cuebook repair 5 handoff

## Release status: PASS

Work order `visualizer-cuebook-repair-5` repaired every finding in verifier commit `de7d99804b97f0a81b5042004210d4811e7b1c98` for candidate `efac3cb641896a1c8cfdc6d996958aca8561d5c1`.

Product repair commit:

- `c8bd6a02cb8eecc0c8fb6457e2d4e7551dec3108` — confirm destructive cue changes and correct demo/mobile layout.

The static, local-first PWA scope and researched brief are unchanged.

## Reproduction and fixes

Three browser regressions were added before product code changed. Against the reported candidate, all three failed:

1. The shorter-track test could not find `#replace-audio-dialog`; the one-second replacement had already replaced the three-second track and retained its 2.499-second cue.
2. The deletion test could not find `#delete-cue-dialog`; selecting `Delete cue 1` removed the cue immediately.
3. The direct-demo test found Preview, How it works, Privacy, and Pricing before the studio instead of finding the studio as the only visible child of `main`.

The repaired behavior is:

- A replacement track is decoded before state changes. When cues exceed its duration, a named modal reports the affected cue count, file name, and new duration. **Keep current audio** leaves both audio and cues unchanged across reload. **Remove later cue(s) and replace audio** removes only unreachable cues, then atomically saves the replacement.
- The exact three-second to one-second regression keeps the 0.500-second cue, removes the 2.499-second cue, exports `{ name: "short.wav", duration: 1 }`, and imports that export again without a duration error.
- Cue deletion opens a named modal containing the cue number, exact time, and note. **Keep cue** cancels. **Delete this cue** saves before the row is removed; the deletion survives reload.
- `/demo/` and `/?demo=1` hide all landing sections from first paint. The seeded studio is the only visible `main` child and begins directly after the persistent demo banner at 1440 × 900 and 390 × 844, with `scrollY === 0`.
- The 390 px transport now gives recording its own row. A geometry regression confirms the time readout and recording control do not overlap.

Both new dialogs use native modal focus containment, receive focus on their safe action, close with Escape, expose a heading and description, and have zero Axe violations.

## Clean local verification

Run from `/work/repo` on 2026-09-01:

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
- Unit, claim-mapping, and deployment-policy tests: 9/9 passed.
- TypeScript and ESLint: passed.
- Production build: passed and produced `dist/index.html`.
- Full Playwright suite: 25/25 passed.
- Declared claim suite: 14/14 passed, with one tagged browser test per claim.
- Package/consumer test: not applicable; this is a static PWA, not a package.

The browser suite covers desktop, 390 × 844 mobile, keyboard shortcuts and focus, native dialog focus, zero-violation Axe scans, semantic metadata, input recovery, downloads, demo isolation, privacy requests, service-worker control, offline reload, licenses, and response-policy configuration.

Production budgets:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| App JavaScript | 45.45 kB | 13.96 kB |
| App CSS | 17.53 kB | 4.87 kB |
| Largest production image | 29.71 kB | — |

Lighthouse 12.8.2 against the final local production preview:

| Category or metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 1,506 ms |
| CLS | 0.053 |
| Total blocking time | 25 ms |

The factory URL verifier found the correct title, `lang="en"`, one H1, a main landmark, complete image alt text, labeled buttons, and no console errors. Local evidence is in `.factory/evidence/repair-5-local/`.

## Deployment and live verification

The final `dist/` was deployed through the work order configuration to the existing Azure Static Web App `sf-visualizer-cuebook` in `sociobot`. Deployment ID: `128570fc-fb51-4c06-97c2-8d94c582497a`. No backend, staging slot, database, Key Vault, billing resource, or other product resource was read or changed.

Live URL: <https://visualizer-cuebook.sociobot.in>

The full live repair flow passed in a fresh browser:

- cancelling the shorter replacement retained both cues and `long.wav` across reload;
- confirming it retained 0.500 seconds, removed 2.499 seconds, saved `short.wav`, and exported a cue file that imported again;
- cancelling and confirming the cue-specific deletion both behaved correctly, and confirmed deletion survived reload;
- the demo studio was the only visible `main` child at desktop and 390 px, with no initial scroll or horizontal overflow;
- the replacement dialog and both demo viewports had zero Axe violations;
- the saved real studio reloaded offline and displayed the offline banner;
- no console/page errors and no request outside the product origin or browser `blob:` URLs occurred.

A browser profile primed against live `cuebook-v1.0.4` observed `An update is ready. Refresh when your rehearsal is paused.` after deployment. Reload activated `cuebook-v1.0.5`; only its shell and runtime caches remained.

Live Lighthouse 12.8.2 reported Performance 100, Accessibility 100, Best Practices 100, SEO 100, LCP 1,093 ms, total blocking time 30 ms, and CLS 0.053.

Live routes returned `/` 200, `/demo/` 200, `/privacy/` 200, `/terms/` 200, and `/demo/nope` 404. Responses include the configured CSP with `frame-ancestors 'none'`, HSTS, Permissions-Policy, Referrer-Policy, `nosniff`, and `X-Frame-Options: DENY`. Hashed assets are immutable for one year; `sw.js` is `no-cache`.

Final local/live SHA-256 pairs are identical:

| Artifact | SHA-256 |
| --- | --- |
| `/` | `c06c80dd8d8e0e568b473367b49b3e611fd5968c49111fd71f4a0f2b5d344843` |
| `/assets/app-FyO1m7LM.js` | `fcbb543738d1fd865fd9e77f99773039ec0ba8336135531b37eed70b40bdbb97` |
| `/assets/app-LosMPPYx.css` | `656f6bb19558258f56349f811b9f67246a5c3e56029c0a20a07a76ef2efdd203` |
| `/sw.js` | `d8f3bf11546ccf198493a991ba8f7f4a43f178a4688e0d00f292471cb9843dd8` |

Live screenshots, the replacement confirmation, Lighthouse output, and URL-verifier output are in `.factory/evidence/repair-5-live/`.

## Known gaps and next steps

None.
