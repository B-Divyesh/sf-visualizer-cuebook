# Polish 5 — cumulative zero-finding acceptance map

Implementation commits `bdf013d`, `2f76d96`, and `97853eb` were deployed as Azure Static Web Apps deployment `94561305-c096-401a-9e0f-4122ae825d81` at <https://visualizer-cuebook.sociobot.in>.

Evidence keys:

- **Claims** — all 22 exact commands in `.factory/claims.json` passed independently from clean clone `/tmp/cuebook-polish5-final-n0uRU3/repo`.
- **Browser** — `npm run test:e2e`: 37/37 passed in that clean clone.
- **Live** — `.factory/evidence/polish-5-live/live-checks.json` and route verifier folders; cold pages had zero console errors and zero Axe violations.
- **Screens** — `.factory/evidence/polish-5-live/demo-query/screenshot-mobile.png` and `screenshot-desktop.png` show the visible demo h1 and working seeded editor.
- **Lighthouse** — `.factory/evidence/polish-5-live/lighthouse-home.json` and `lighthouse-demo.json`.

## Review 5 repairs

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-5-1 | Kept the site-data instruction and added a browser-origin purge test covering the saved project, audio blob, Cache Storage, service worker, and Cuebook localStorage keys. | `@claim:clear-site-data`; Live `browserSiteDataClear` |
| F-5-2 | Added one claim-owned composite browser check for the exact Playwright pin and every README coverage item. | `@claim:browser-suite-contract`; Claims |
| F-5-3 | Reworded the README to describe the configuration itself and added exact checks for demo routing, response headers, immutable asset caching, and the 404 rewrite/artifact. | `@claim:deployment-config`; live route/header checks |
| F-5-4 | Added the visible h1 “Rehearse five sample visual cues.” and the plain demo description on both demo entry paths. Focus and announcements now use that h1. | Browser `uses complete route metadata…`; Live demo entries; Screens |

## Review 1 findings rechecked

| Finding | Preserved change | Evidence |
| --- | --- | --- |
| F-1-1 | Demo project data remains memory-only and cannot change the real set. | `@claim:demo-sandbox` |
| F-1-2 | The 12-second sample retains audible deterministic PCM. | `@claim:demo-sandbox` |
| F-1-3 | The demo banner, reset, and exit actions remain sticky without covering the last cue. | Browser `keeps demo controls visible…`; Screens |
| F-1-4 | Only `/demo` and `/demo/` route to the app; demo-like typos return 404. | `@claim:deployment-config`; Live `otherRoutes` |
| F-1-5 | Landing retains the product preview, three steps, privacy/limits, and footer. | Live home verifier and screenshots |
| F-1-6 | Every route retains its title, description, canonical/social metadata, and icons. | Browser `uses complete route metadata…`; Live route verifiers |
| F-1-7 | Legal, offline, and 404 pages retain the shared header, footer, and skip link. | Browser route test; Live route verifiers |
| F-1-8 | Forward, Back, and direct demo loads focus and announce the route h1. | Browser phone-navigation test; Live `navigation` |
| F-1-9 | Demo landmarks remain valid. | Browser and Live Axe: zero violations |
| F-1-10 | Visible mobile links and controls remain at least 44×44 CSS px. | Browser route and 390 px target tests |
| F-1-11 | **Record rehearsal** remains visibly labelled on phones. | Screens; `@claim:rehearsal-recording` |
| F-1-12 | The headline describes repeatable cues without an unmeasured timing guarantee. | `.factory/copy-audit.md`; Live home |
| F-1-13 | Unlimited wording remains absent; more-than-five behavior is tested. | `@claim:cue-capacity` |
| F-1-14 | Unsupported price and subscription claims remain absent. | `@claim:free-access` |
| F-1-15 | Unsupported checkout, merchant, verification, and refund claims remain absent. | `@claim:free-access`; `@claim:no-tracking-runtime` |
| F-1-16 | Public copy uses browser/device language rather than IndexedDB jargon. | `.factory/copy-audit.md` |
| F-1-17 | BPM and offset output remains plain and observable. | `@claim:beat-grid` |
| F-1-18 | Contour, Orbit, and Shards remain the only public scene names. | `@claim:three-scenes` |
| F-1-19 | Complete real, demo, export, reset, exit, and offline request flows remain same-origin. | `@claim:local-privacy`; `@claim:no-tracking-runtime`; Live `offlineDemo` |
| F-1-20 | Errors recommend only an audio file the browser can play. | Browser `uses browser-playable audio guidance…` |
| F-1-21 | The app remains a static build without a backend or required environment value. | `@claim:static-deployment` |
| F-1-22 | Provider IDs and secret claims remain absent. | `@claim:no-tracking-runtime` |
| F-1-23 | README opens with the audience and job in plain words. | `.factory/copy-audit.md` |
| F-1-24 | README sentences remain within the 22-word limit. | `.factory/copy-audit.md` |
| F-1-25 | User copy describes install/offline behavior without PWA jargon. | README; `@claim:pwa-install` |
| F-1-26 | Recording help describes the user-visible limitation and recovery. | `@claim:rehearsal-recording` |
| F-1-27 | Browser-suite prose is short and now has direct claim ownership. | `@claim:browser-suite-contract` |
| F-1-28 | The artwork caption states tested cue behavior. | `@claim:deterministic-scenes`; Live home screenshot |
| F-1-29 | The obsolete paid-dialog slogan remains absent. | `@claim:free-access` |
| F-1-30 | The obsolete Plus action remains absent. | `@claim:free-access` |
| F-1-31 | The obsolete license action remains absent. | `@claim:free-access` |
| F-1-32 | The first action states the demo result and real-data effect beside it. | `@claim:demo-sandbox`; Live home screenshot |
| F-1-33 | The import action remains **Import a cue file**. | `@claim:cue-workflow` |
| F-1-34 | Cue-file terminology remains consistent across import and export. | `@claim:json-no-audio`; `.factory/copy-audit.md` |
| F-1-35 | “Set” remains the single workspace term. | `.factory/copy-audit.md` |
| F-1-36 | “Track” remains the imported-media term. | `.factory/copy-audit.md` |
| F-1-37 | The designed error page retains the literal h1 “Page not found.” | `@claim:deployment-config`; Live 404 routes |

## Review 2 findings rechecked

| Finding | Preserved change | Evidence |
| --- | --- | --- |
| F-2-1 | Offline setup retains external same-origin assets, metadata, recovery copy, and shared structure. | `@claim:offline-reload`; Live offline verifier |
| F-2-2 | Legal brand, contact, and navigation targets retain 44 px hit areas. | Browser route target checks |
| F-2-3 | Paid pricing remains absent. | `@claim:free-access` |
| F-2-4 | Refund and revocation sales copy remains absent. | `@claim:free-access` |
| F-2-5 | Beat-grid output remains listed and tested. | `@claim:beat-grid` |
| F-2-6 | Scene names remain normalized. | `@claim:three-scenes` |
| F-2-7 | The noun-only Plus action remains absent. | `@claim:free-access` |
| F-2-8 | Workflow copy consistently uses “cue file.” | `@claim:cue-workflow`; `.factory/copy-audit.md` |
| F-2-9 | Imported media remains “track.” | `.factory/copy-audit.md` |
| F-2-10 | Unsupported gateway rate-limit claims remain absent. | `@claim:free-access`; runtime request checks |
| F-2-11 | Keyboard controls and screen-reader labels remain concrete and free. | `@claim:accessibility-in-free` |
| F-2-12 | Recording promises only the tested browser capability. | `@claim:rehearsal-recording` |
| F-2-13 | License-cache claims remain absent. | `@claim:free-access` |
| F-2-14 | Allowance-replenishment claims remain absent. | `@claim:free-access` |
| F-2-15 | Demo title and social metadata identify the demo. | Browser metadata test; Live demo entries |
| F-2-16 | Preview copy matches the visible time, scene, and note rows. | Live home screenshot |
| F-2-17 | The editor heading remains “Add the next cue.” | Screens |
| F-2-18 | The destructive action remains “Start a new set,” with deletion proof. | `@claim:delete-local-set` |

## Review 3 findings rechecked

| Finding | Preserved change | Evidence |
| --- | --- | --- |
| F-1-19 | Full privacy request coverage remains in both tagged tests. | `@claim:local-privacy`; `@claim:no-tracking-runtime` |
| F-3-1 | The 12-second duration remains declared and asserted. | `@claim:demo-sandbox`; Live demo description/duration |
| F-3-2 | Saved cues activate repeatable scenes at their cue times. | `@claim:deterministic-scenes` |
| F-3-3 | Recording verification inspects non-empty WebM video and audio tracks. | `@claim:rehearsal-recording` |
| F-3-4 | Demo save status consistently says changes reset on reload. | `@claim:demo-sandbox`; Screens |
| F-3-5 | Real storage is seeded before demo edit, reset, reload, and exit. | `@claim:demo-sandbox` |
| F-3-6 | Home skip text names main content; demo skip text names the editor. | Browser metadata test |
| F-3-7 | The preview label remains “Sample cue sheet.” | Live home screenshot |
| F-3-8 | README and product consistently call sample mode a demo. | README; `.factory/demo.md` |
| F-3-9 | Recording recovery avoids browser jargon and gives two actions. | `@claim:rehearsal-recording` |
| F-3-10 | Privacy copy remains free of runtime/CDN jargon. | `.factory/copy-audit.md`; `@claim:no-tracking-runtime` |
| F-3-11 | README names phone and desktop layouts directly. | `@claim:browser-suite-contract` |
| F-3-12 | README says “security headers,” not CSP. | `@claim:deployment-config` |
| F-3-13 | README explains how artwork was made without specialist wording. | README; `.factory/design.md` |

## Review 4 findings rechecked

| Finding | Preserved change | Evidence |
| --- | --- | --- |
| F-1-20 | Product errors retain browser-playable guidance without named untested formats. | Browser format-guidance test |
| F-3-9 | Recording recovery retains plain wording and two recovery choices. | `@claim:rehearsal-recording` |
| F-4-1 | **Start a new set** removes the complete project and audio blob. | `@claim:delete-local-set` |
| F-4-2 | Cuebook still exposes no account, sign-in, identity traffic, or credential storage. | `@claim:no-accounts` |
| F-4-3 | Demo, Privacy, and Terms remain visible and keyboard-operable in the phone header. | Browser phone-navigation and target tests; Screens |
| F-4-4 | Node `>=20` is declared and Node 20.19.5 builds the app. | `@claim:node-20-build` |
| F-4-5 | Rendered ownership terms remain aligned with the checked-in legal contract. | `@claim:content-ownership` |

## Final verification

- Clean clone: `npm ci` found zero vulnerabilities; unit 10/10, typecheck, lint, build, and browser 37/37 passed.
- Claims: all 22 exact claim commands passed independently.
- Build budget: app JavaScript 39.66 kB raw / 12.32 kB gzip; app CSS 17.56 kB raw / 4.84 kB gzip.
- Live build: all 25 public runtime files match local `dist/` by SHA-256.
- Live routes: home, both demo entries, Privacy, Terms, and offline setup return 200; four invalid paths return the designed HTTP 404.
- Live accessibility: zero Axe violations, one visible h1, no overflow, and no console errors across checked routes.
- Live Lighthouse mobile: home 100/100/100/100 with LCP 1.2 s, CLS 0.053, TBT 40 ms; demo 99/100/100/100 with LCP 1.2 s, CLS 0.03, TBT 100 ms.

No finding of any severity remains open.
