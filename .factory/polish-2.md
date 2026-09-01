# Polish 2 — review-2 acceptance map

Repair revision: `04f96dd522f84583606cd242ab9d3fbebb1b450a`.

Live evidence was rechecked after deployment `8ee15d81-8774-4f03-9569-e72b2c782409` at <https://visualizer-cuebook.sociobot.in>. Screenshots and verifier reports are in `.factory/evidence/polish-2-live/`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Rebuilt `/offline.html` with external same-origin CSS/JS, full metadata, shared header/footer, skip link, and literal recovery copy. | CSP browser test; live `/offline.html`; `offline/screenshot-mobile.png` |
| F-2-2 | Applied 44 px hit areas to legal brand and all main links; checked every visible control on every route at 390 px. | route/mobile target test; live mobile sweep |
| F-2-3 | Added `.factory/billing-contract.json`; the claim test compares shown price, cadence, subscription, checkout URL, and merchant to it. | `@claim:billing-contract` |
| F-2-4 | Added Dodo refund ownership and license-revocation facts to the billing fixture, claim, dialog, Terms, and test. | `@claim:billing-contract`; live `/terms/` |
| F-2-5 | Added the `beat-grid` claim and demo test; the UI now explains BPM/offset input and retained selected cue time. | `@claim:beat-grid` |
| F-2-6 | Normalized canvas overlays, cue rows, controls, README, and scene map to Contour, Orbit, and Shards. | `@claim:three-scenes`; live `/demo/` |
| F-2-7 | Locked header action remains `See Plus options`; unlocked action is `Manage Plus license`. | `@claim:plus-license`; live `/` |
| F-2-8 | Replaced `Cue JSON` and `source JSON` workflow text with `cue file`. | cue import tests; live `/demo/` |
| F-2-9 | Normalized imported-media language to `track`; reserve `audio file` for format/capture wording. | copy audit; live home screenshot |
| F-2-10 | Narrowed the rate-limit claim and README to Cuebook’s observable 429 recovery; test reads a recorded 429 fixture. | `@claim:license-rate-limit` |
| F-2-11 | Replaced vague accessibility wording with keyboard controls and screen-reader labels; added the Free-tier behavior claim. | `@claim:accessibility-in-free`; live pricing |
| F-2-12 | Removed the untested Firefox promise; recording now names browser support for track-audio capture. | `@claim:plus-recording` |
| F-2-13 | Added the one-day cache claim with a fake-clock test at 86,400,000 ms. | `@claim:license-cache-day` |
| F-2-14 | Removed the unsupported replenishment statement and live allowance helper documentation. | README/copy audit |
| F-2-15 | Demo navigation updates Open Graph and Twitter title/description at boot. | route metadata test; live `/demo/` |
| F-2-16 | Rewrote preview copy to describe its actual time, scene, and note rows. | live `/`; `home/screenshot-desktop.png` |
| F-2-17 | Renamed the editor heading to `Add the next cue`. | live `/demo/`; `demo/screenshot-mobile.png` |
| F-2-18 | Renamed `New set` to `Start a new set`. | live `/demo/`; `demo/screenshot-mobile.png` |

## Recheck summary

- Fresh-clone claim run: `/tmp/cuebook-polish2-OJwQa1/repo`, `npm ci`, then every command in `.factory/claims.json` individually: 18/18 passed.
- Source suite: `npm test` (10/10), `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:e2e` (29/29) passed.
- Live cold checks: home, demo, Privacy, Terms, designed 404, and offline setup had zero console errors, zero Axe violations, and no mobile target below 44 px. `/demo/nope`, `/demo-extra`, `/demonstration`, and `/unknown/nested` each returned HTTP 404 with the designed page.
- Live mobile Lighthouse: Performance 100 and Accessibility 100; report at `.factory/evidence/polish-2-live/lighthouse.json`.
