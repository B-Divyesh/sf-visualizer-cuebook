# Polish 4 — cumulative zero-finding acceptance map

Implementation commit `53021c8` was deployed as Azure Static Web Apps deployment `deb15ff0-58e5-426a-9956-c58226ef84a0` at <https://visualizer-cuebook.sociobot.in>.

Evidence keys:

- **Claims** — all 19 exact commands in `.factory/claims.json` passed independently from clean clone `/tmp/cuebook-polish4-53021c8`; recorded in `.factory/evidence/polish-4-local/claim-results.txt`.
- **Browser** — `npm run test:e2e`, 34/34 passed from the same clone.
- **Live** — `.factory/evidence/polish-4-live/live-checks.json`; cold mobile screenshots are `home-cold-mobile.png` and `demo-cold-mobile.png`.
- **Routes** — route verifier folders under `.factory/evidence/polish-4-live/`; each reports the title, `lang=en`, one h1, a main landmark, labelled controls, and zero console errors.
- **Lighthouse** — live home and demo reports under `.factory/evidence/polish-4-live/`; both scored 100 in Performance, Accessibility, Best Practices, and SEO.

## Review 4 repairs

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-20 | Replaced every named-format recommendation with “Choose an audio file your browser can play.” Added a regression that rejects a text file and scans out the stale phrases. | Browser `uses browser-playable audio guidance…`; Live `formatMessage` |
| F-3-9 | Replaced “track-audio capture” with two plain recovery choices: try another browser or export the cue file. | `@claim:rehearsal-recording`; Live `recordingMessage` |
| F-4-1 | Added a deletion claim that saves a track and cue, accepts **Start a new set**, proves the IndexedDB record and audio blob are absent, reloads, and confirms the empty screen. | `@claim:delete-local-set`; Live `localRecordAfterDelete: null` |
| F-4-2 | Added a no-account claim covering controls, routes, storage names, identity traffic, and cross-origin requests. | `@claim:no-accounts`; Live `noAccounts: true` |
| F-4-3 | Kept Demo, Privacy, and Terms visible in the 390 px app header. Each target is at least 44 px and keyboard navigation returns focus to the route h1. | Browser `keeps app navigation keyboard-operable…`; Live `mobileNavigation`; `home-cold-mobile.png` |
| F-4-4 | Added `engines.node >=20`, pinned Node 20.19.5 for verification, and ran TypeScript plus the production Vite build with that executable. | `@claim:node-20-build`; clean-clone claim run |
| F-4-5 | Added `.factory/legal-contract.json` and a claim that compares its ownership sentence with rendered Terms. | `@claim:content-ownership`; Live `ownership: true` |

## Review 1 findings rechecked

| Finding | Preserved change | Evidence |
| --- | --- | --- |
| F-1-1 | Demo state remains memory-only and never changes the real set. | `@claim:demo-sandbox` |
| F-1-2 | The 12-second sample retains audible deterministic PCM. | `@claim:demo-sandbox` |
| F-1-3 | The demo banner and both actions remain sticky without covering the last cue. | Browser `keeps demo controls visible…`; Live demo screenshot |
| F-1-4 | Only `/demo` and `/demo/` open the demo; invalid prefixes return 404. | `@claim:static-deployment`; Live `routes` |
| F-1-5 | Landing retains preview, three steps, privacy/limits, and footer. | Live home screenshots |
| F-1-6 | Every route retains canonical, social, icon, description, and title metadata. | Browser `uses complete route metadata…`; Routes |
| F-1-7 | Legal, offline, and 404 pages retain the shared header, footer, and skip link. | Routes; live screenshots |
| F-1-8 | Direct loads and app navigation focus and announce the h1. | Browser phone-navigation test; Live focus check |
| F-1-9 | Demo and all public routes have no Axe violations. | Browser route Axe checks; Live `axe` |
| F-1-10 | Visible links and controls remain at least 44×44 CSS px. | Browser route target checks; Live `mobileNavigation` |
| F-1-11 | **Record rehearsal** remains visibly labelled on phones. | Live `demo-cold-mobile.png` |
| F-1-12 | The headline states the job without an untested timing guarantee. | `.factory/copy-audit.md`; Live home screenshot |
| F-1-13 | Unlimited wording remains absent; more-than-five behavior is tested. | `@claim:cue-capacity` |
| F-1-14 | Price and subscription claims remain absent. | `@claim:free-access` |
| F-1-15 | Checkout, merchant, verification, and refund claims remain absent. | `@claim:free-access`; request log |
| F-1-16 | Public copy uses browser-storage language, not implementation jargon. | `.factory/copy-audit.md` |
| F-1-17 | BPM and offset behavior remains listed and observable. | `@claim:beat-grid` |
| F-1-18 | Contour, Orbit, and Shards remain the only public scene names. | `@claim:three-scenes` |
| F-1-19 | Real import/play/edit/export and demo/reset/exit/offline requests remain product-only. | `@claim:local-privacy`; `@claim:no-tracking-runtime`; Live `externalRequests: []` |
| F-1-20 | All product errors now use browser-playable guidance without naming untested formats. | Browser format-guidance test; Live `formatMessage` |
| F-1-21 | The product remains a static build with no backend or environment variable. | `@claim:static-deployment` |
| F-1-22 | Provider IDs and secret claims remain absent. | `@claim:no-tracking-runtime` |
| F-1-23 | README opens with the audience and job in plain words. | `.factory/copy-audit.md` |
| F-1-24 | README workflow remains split into short sentences. | `.factory/copy-audit.md` |
| F-1-25 | User copy describes installation and offline use without PWA jargon. | README; `@claim:pwa-install` |
| F-1-26 | Recording copy describes the user-visible capability, not browser APIs. | `@claim:rehearsal-recording`; `.factory/copy-audit.md` |
| F-1-27 | Browser-test documentation remains short and scannable. | README; `.factory/copy-audit.md` |
| F-1-28 | The artwork caption describes tested cue-trigger behavior. | `@claim:deterministic-scenes`; Live home screenshot |
| F-1-29 | The obsolete paid dialog remains removed. | `@claim:free-access` |
| F-1-30 | The obsolete Plus header action remains removed. | `@claim:free-access` |
| F-1-31 | The obsolete license action remains removed. | `@claim:free-access` |
| F-1-32 | The first action names the sample result and real-data effect beside it. | `@claim:demo-sandbox`; Live first screen |
| F-1-33 | The import action consistently says **Import a cue file**. | `@claim:cue-workflow` |
| F-1-34 | Cue-file terminology remains consistent across import and export. | `@claim:json-no-audio`; `.factory/copy-audit.md` |
| F-1-35 | “Set” remains the one track-and-cues workspace term. | `.factory/copy-audit.md` |
| F-1-36 | “Track” remains the imported-media term. | `.factory/copy-audit.md` |
| F-1-37 | The designed error page retains the literal h1 “Page not found.” | Live `/unknown/nested` 404; Routes |

## Review 2 findings rechecked

| Finding | Preserved change | Evidence |
| --- | --- | --- |
| F-2-1 | Offline setup retains external same-origin CSS/JS, complete metadata, recovery copy, and shared structure. | `@claim:offline-reload`; Live offline verifier |
| F-2-2 | Legal brand, contact, and navigation targets retain 44 px hit areas. | Browser route target checks |
| F-2-3 | Removed paid pricing remains absent. | `@claim:free-access` |
| F-2-4 | Removed refund and revocation surface remains absent. | `@claim:free-access` |
| F-2-5 | Beat-grid output remains listed and tested. | `@claim:beat-grid` |
| F-2-6 | Scene naming remains normalized. | `@claim:three-scenes` |
| F-2-7 | The noun-only Plus action remains absent. | `@claim:free-access` |
| F-2-8 | Workflow copy consistently uses “cue file.” | `@claim:cue-workflow`; `.factory/copy-audit.md` |
| F-2-9 | Imported media remains “track.” | `.factory/copy-audit.md` |
| F-2-10 | Unsupported gateway rate-limit claims remain absent. | `@claim:free-access`; source scan |
| F-2-11 | Keyboard controls and screen-reader labels remain concrete and free. | `@claim:accessibility-in-free` |
| F-2-12 | Recording promises only the tested browser capability. | `@claim:rehearsal-recording` |
| F-2-13 | Removed license-cache claims remain absent. | `@claim:free-access` |
| F-2-14 | Removed allowance claims remain absent. | `@claim:free-access` |
| F-2-15 | Demo social title and description identify the demo. | Browser metadata test; Live demo verifier |
| F-2-16 | Preview copy still describes the visible time, scene, and note rows. | Live home screenshot |
| F-2-17 | The editor heading remains “Add the next cue.” | Live demo screenshot |
| F-2-18 | The destructive action remains “Start a new set,” now with deletion proof. | `@claim:delete-local-set` |

## Review 3 findings rechecked

| Finding | Preserved change | Evidence |
| --- | --- | --- |
| F-3-1 | The 12-second duration remains declared and asserted. | `@claim:demo-sandbox`; Live `duration` |
| F-3-2 | Saved cues still activate repeatable scenes at their cue times. | `@claim:deterministic-scenes` |
| F-3-3 | Recording verification still inspects non-empty WebM video and audio tracks. | `@claim:rehearsal-recording` |
| F-3-4 | Demo save status consistently says changes reset on reload. | `@claim:demo-sandbox`; Live demo screenshot |
| F-3-5 | Real storage is seeded before demo edit, reset, reload, and exit. | `@claim:demo-sandbox` |
| F-3-6 | Home skip text names main content; demo skip text names the editor. | Browser metadata test |
| F-3-7 | The preview label remains “Sample cue sheet.” | Live home screenshot |
| F-3-8 | README and product consistently call the sample mode a demo. | README; `.factory/demo.md` |
| F-3-9 | Product recovery now avoids “track-audio capture” and gives two actions. | `@claim:rehearsal-recording`; Live `recordingMessage` |
| F-3-10 | Privacy wording remains free of runtime/CDN jargon. | `.factory/copy-audit.md`; `@claim:no-tracking-runtime` |
| F-3-11 | README continues to name phone and desktop layouts directly. | README |
| F-3-12 | README continues to say “security headers,” not CSP. | README |
| F-3-13 | README continues to explain how artwork was made without specialist wording. | README; `.factory/design.md` |

## Final verification

- `npm ci` reported zero vulnerabilities in clean clone `/tmp/cuebook-polish4-53021c8`.
- `npm test` 10/10, typecheck, lint, build, and `npm run test:e2e` 34/34 passed.
- Every one of the 19 exact claim commands passed independently.
- All 25 deployed public files match `dist/` by SHA-256: `.factory/evidence/polish-4-live/build-match.json`.
- Live route crawl found no broken link: `.factory/evidence/polish-4-live/link-crawl.json`.
- Live mobile Lighthouse: home 100/100/100/100 with LCP 1.10 s, CLS 0.053, TBT 15 ms; demo 100/100/100/100 with LCP 1.30 s, CLS 0, TBT 49 ms.
- Final live cold check: zero Axe violations, console errors, cross-origin requests, and unresolved findings.
