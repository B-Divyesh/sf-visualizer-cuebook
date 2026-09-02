# Cuebook repair 8 handoff — PASS

## Outcome

The P1 release blocker from [verification 15](./verification-15.md) is repaired. A real project now replaces every landing-only section with the Cuebook editor as soon as a track is imported or a saved set boots. The editor begins in the viewport, and focus moves to its visible **Current set** level-one heading. Deleting the project restores the landing content and its heading.

The shipped PWA version is **1.0.12**. Its shell cache is `cuebook-v1.0.12-shell`, so installed clients receive the repaired release through the existing service-worker update path.

## What changed

- `loadProjectIntoUi` hides all three `.landing-detail` sections for real projects, including IndexedDB-backed startup.
- The moved page heading is now the visible editor H1, “Current set,” and receives focus after import and saved-set boot. The live region announces the state change.
- `Start a new set` is the only return to the empty state: it restores landing sections, scrolls to the first screen, and moves focus to its H1.
- Added a Playwright regression across 1440 × 900 and 390 × 844. It covers import and saved-set boot, viewport intersection, exact hidden landing sections, heading order, first Tab target, and restoration after deletion.
- Made the existing installability claim wait for the observable service-worker controller after activation, removing the `ready`/`clients.claim()` timing race found during the final clean run.
- Bumped the manifest start version, static offline footer, package version, and service-worker cache to 1.0.12.

## Reproduction and repair evidence

Before repair, fresh real-track import reproduced the verifier finding exactly:

| Viewport | Studio top | Landing sections | Focus | Studio intersects |
| --- | ---: | ---: | --- | --- |
| 1440 × 900 | 1330.1 px | 3 | `body` | No |
| 390 × 844 | 1631.0 px | 3 | `body` | No |

After repair, the same fresh import reports:

| Viewport | Studio top | Landing sections | Focus | Studio intersects |
| --- | ---: | ---: | --- | --- |
| 1440 × 900 | 72 px | 0 | `h1#page-title` | Yes |
| 390 × 844 | 64 px | 0 | `h1#page-title` | Yes |

Visual captures: [local desktop](./evidence/repair-8-local/real-import-desktop.png), [local 390 px mobile](./evidence/repair-8-local/real-import-mobile.png), [live desktop](./evidence/repair-8-live/real-import-desktop.png), and [live 390 px mobile](./evidence/repair-8-live/real-import-mobile.png). The full local URL checks and Lighthouse reports are in [repair-8-local](./evidence/repair-8-local/).

## Verification

All commands ran locally against a fresh `npm ci` installation:

- `npm test` — PASS, 3 files / 10 tests.
- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS; `dist/` generated. App JavaScript: 40.20 KB raw / 12.50 KB gzip. App CSS: 17.64 KB raw / 4.85 KB gzip.
- `npm run test:e2e` — PASS, 38/38 Playwright tests.
- Each of the 22 exact commands listed in `.factory/claims.json` — PASS independently.
- `/opt/fleet/lib/verify-url.sh` on local `/` and `/?demo=1` — PASS: title, `lang=en`, one H1, main landmark, alt text, and no console errors.
- Playwright Axe checks in the browser suite — zero serious or critical violations on the cold home, populated editor, 390 px editor, demo, Privacy, Terms, and 404 states.
- Offline/update probe — PASS: active, controlling `cuebook-v1.0.12-shell`; after `registration.update()` the five-cue demo reloaded offline with the offline banner and no console errors.

Mobile Lighthouse 13.4.1, local production preview (provided throttling):

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 100 | 100 | 100 | 100 | 142 ms | 0.053 | 0 ms | 58,239 B |
| Demo | 100 | 100 | 100 | 100 | 187 ms | 0.030 | 0 ms | 51,942 B |

## Deploy and live verification

Deployed to <https://visualizer-cuebook.sociobot.in> with `/opt/fleet/lib/deploy-static.sh` (Azure Static Web Apps deployment `339086fe-e478-4492-8076-5531e637189c`) from repair commit `2a64faea4b483f17620b79f31659cec1c327951a`.

- Live `/` and `/?demo=1` passed `verify-url.sh`: 200, correct title, `lang=en`, one H1, main landmark, alt text, and zero console errors. Evidence is in [repair-8-live](./evidence/repair-8-live/).
- Live independent real-track import and saved-set boot passed at 1440 × 900 and 390 × 844. On import the studio starts at 72 px / 64 px; on boot it still intersects the viewport. All landing sections are hidden, focus is `h1#page-title`, and the first Tab target is `#project-title`.
- Live request capture found no foreign requests; console and page errors were empty.
- Live response policy includes the self-only CSP, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, Permissions-Policy, immutable hashed assets, and no-cache `sw.js`.
- All 25 served runtime files match the local `dist/` bytes by SHA-256.
- The live PWA update/offline probe activated and controlled `cuebook-v1.0.12-shell`; the five-cue demo then reloaded offline with its offline banner and no console errors.

## Known gaps / next steps

No known product gaps. Cuebook remains local-first, uses no accounts, analytics, billing, or external runtime assets, and preserves the researched product scope.
