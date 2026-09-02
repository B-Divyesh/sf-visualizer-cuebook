# Cuebook polish 3 handoff

## Result

**PASS.** Cuebook is a local-first visual cue rehearsal tool for DJs, VJs, and educators. This repair closes every finding in reviews 1–3; the complete finding-to-evidence map is [`.factory/polish-3.md`](./polish-3.md).

Repair commits are `6c06d9f`, `60eee7a`, and `7cfaf8a`. The deployed application assets are from `60eee7a`; `7cfaf8a` records evidence and the final mobile-visibility assertion. Static Web Apps deployment `1fbe86cc-d3b7-4207-89c2-55f059c918d0` is live.

- Live: <https://visualizer-cuebook.sociobot.in>
- One-click isolated demo: <https://visualizer-cuebook.sociobot.in/?demo=1>
- Demo route alias: <https://visualizer-cuebook.sociobot.in/demo/>

## What changed

- Made `?demo=1` the primary one-click entry, with a five-cue, audible 12-second sample, persistent reset/exit controls, memory-only storage, and a consistent demo-only save message.
- Strengthened claim coverage for the complete local privacy workflow, deterministic cue-triggered scene changes, demo isolation over a real saved project, and non-empty audio/video rehearsal recordings.
- Removed unprovable billing and license surfaces. The free product retains core rehearsal, export, recording, keyboard, and accessibility behavior.
- Corrected copy, skip-link labels, route metadata, legal/offline navigation, 404 behavior, cue-file/track terms, and the 390 px editor layout.
- Updated the catalog description to: “Build repeatable visual cues for your track before rehearsal.”

## Verification

All commands were run from the final working tree:

```bash
npm test                 # 10 passed
npm run typecheck        # passed
npm run lint             # passed
npm run build            # passed; dist/ created
npm run test:e2e         # 28 passed
```

The independent focused phone regression also passed after the final assertion:

```bash
npm run test:e2e -- --grep "keeps demo controls visible"  # 1 passed
```

A clean clone of pushed repair revision `7cfaf8a` at `/tmp/cuebook-polish3-final-5VYBKx/repo` ran `npm ci` with zero vulnerabilities, then every command in `.factory/claims.json` separately. All 15 claims passed: `cue-workflow`, `offline-reload`, `local-privacy`, `json-no-audio`, `cue-capacity`, `rehearsal-recording`, `three-scenes`, `deterministic-scenes`, `pwa-install`, `demo-sandbox`, `no-tracking-runtime`, `free-access`, `beat-grid`, `accessibility-in-free`, and `static-deployment`.

Browser/Axe coverage is part of the Playwright suite and passed across home, demo, legal, offline, 404, dialogs, and phone/desktop layouts. Cold live `verify-url.sh` checks passed with zero console errors on home, demo query route, `/demo/`, Privacy, Terms, offline, and 404. Invalid `/demo/nope`, `/demo-extra`, `/demonstration`, and `/unknown/nested` URLs returned HTTP 404.

Live mobile Lighthouse (2026-09-02): **Performance 100**, **Accessibility 100**, FCP 1.1 s, LCP 1.1 s, TBT 10 ms, CLS 0.052. The report is `.factory/evidence/polish-3-live/lighthouse.json`. The final cold mobile checks and screenshots are in `.factory/evidence/polish-3-live/`; matching local verifier evidence is in `.factory/evidence/polish-3-local/`.

The production bundle is 39.37 kB JavaScript (12.30 kB gzip) and 17.01 kB CSS (4.74 kB gzip), within the static-product budget.

## Run and deploy

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Deploy the generated `dist/` as the static product through the factory static deployment configuration.

## Known gaps

None.
