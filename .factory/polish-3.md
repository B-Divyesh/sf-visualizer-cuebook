# Polish 3 — cumulative acceptance map

Repair commits: `6c06d9f` and `60eee7a` (followed by the focused mobile-visibility assertion in the documentation commit). Deployment `1fbe86cc-d3b7-4207-89c2-55f059c918d0` is live at <https://visualizer-cuebook.sociobot.in>.

Evidence keys used below:

- **E2E** — `npm run test:e2e`; all 28 browser tests pass. A `@claim:` name is the exact independently runnable claim test.
- **Live** — cold `verify-url.sh` reports and screenshots in `.factory/evidence/polish-3-live/`; it found one `h1`, `main`, `lang=en`, valid titles, alt text, labelled controls, and zero console errors.
- **Mobile** — `.factory/evidence/polish-3-live/demo/screenshot-mobile.png`; the final phone focus check recorded the Cue 5 note at 513–557 px, below the 64–149 px sticky demo banner in an 844 px viewport.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo data remains in memory and does not read or write the real project namespace. | `@claim:demo-sandbox`; Live `/?demo=1` |
| F-1-2 | The shipped 12-second sample has non-zero PCM energy and five audible cue tones. | `@claim:demo-sandbox`; Live demo |
| F-1-3 | Kept the reset and exit banner sticky through the phone editor; focused Cue 5 remains visible below it. | E2E mobile visibility test; Mobile |
| F-1-4 | Restricted the `/demo/` rewrite and preserved designed HTTP 404s for invalid demo-like paths. | `@claim:static-deployment`; Live `/demo/nope`, `/demo-extra`, `/demonstration`, and `/unknown/nested` return 404 |
| F-1-5 | Restored the complete landing order: product preview, three steps, limits/privacy, and footer. | E2E metadata/route checks; Live home screenshots |
| F-1-6 | Added route-specific titles, descriptions, canonical/social metadata, icons, and theme metadata. | E2E route metadata test; Live home/privacy/terms/404 verifier reports |
| F-1-7 | Gave legal, offline, and 404 pages the shared header, footer, and skip link. | E2E route checks; Live privacy, terms, offline, and 404 screenshots |
| F-1-8 | Route transitions update the title, announce the destination, and focus its h1. | E2E navigation/focus test; Live `/?demo=1` |
| F-1-9 | Removed duplicate landmark structure in the demo and retained Axe-clean semantics. | E2E Axe coverage; Live demo verifier report |
| F-1-10 | Enforced 44 px controls, including legal-page and mobile editor links. | E2E target-size coverage; Mobile |
| F-1-11 | Made the recording control a labelled, visible action at phone width. | `@claim:rehearsal-recording`; Mobile |
| F-1-12 | Rewrote the headline without an untestable timing guarantee. | copy audit; Live home screenshot |
| F-1-13 | Removed the unlimited paid-cue assertion; the free, tested cue limit is stated plainly. | `@claim:cue-capacity`; Live demo |
| F-1-14 | Removed price and subscription marketing because this release has no paid tier. | `@claim:free-access`; Live home |
| F-1-15 | Removed checkout, merchant, verification, and refund claims with the paid tier. | `@claim:free-access`; source/privacy scan |
| F-1-16 | Replaced storage implementation jargon with plain local-saving language. | copy audit; Live home |
| F-1-17 | Listed and tested BPM/offset beat positions as the `beat-grid` claim. | `@claim:beat-grid`; Live demo |
| F-1-18 | Normalized the three scene names to Contour, Orbit, and Shards. | `@claim:three-scenes`; Live demo |
| F-1-19 | Expanded privacy/no-tracking coverage to the full real import/play/edit/export and demo play/edit/export/reset/exit/offline workflow. | `@claim:local-privacy`, `@claim:no-tracking-runtime`; Live cold request check |
| F-1-20 | Described only browser-playable audio support. | README copy audit |
| F-1-21 | Listed and tested the static deployment behavior. | `@claim:static-deployment`; Live headers/routes |
| F-1-22 | Removed provider-ID and secret statements. | source/privacy scan; `@claim:no-tracking-runtime` |
| F-1-23 | Rewrote the README opening in direct user language. | `.factory/copy-audit.md`; README |
| F-1-24 | Split long README workflow copy into short sentences. | `.factory/copy-audit.md`; README |
| F-1-25 | Replaced unexplained PWA language with install/offline wording. | README; `@claim:pwa-install` |
| F-1-26 | Replaced browser-API wording with useful recording support wording. | README; `@claim:rehearsal-recording` |
| F-1-27 | Shortened the browser-suite README sentence. | `.factory/copy-audit.md`; README |
| F-1-28 | Replaced the artwork slogan with a useful cue-preview description. | Live home screenshot |
| F-1-29 | Removed the paid dialog and its mood-copy heading. | `@claim:free-access`; source scan |
| F-1-30 | Removed the ambiguous Plus header action with the paid tier. | `@claim:free-access`; Live home |
| F-1-31 | Removed the obsolete license-verification action. | `@claim:free-access`; source scan |
| F-1-32 | The primary demo action says what opens next and links directly to `/?demo=1`. | `@claim:demo-sandbox`; Live home |
| F-1-33 | Used the consistent term “cue file” in product copy. | `@claim:json-no-audio`; Live demo |
| F-1-34 | Normalized cue-file terminology across import, export, and README. | `@claim:json-no-audio`; copy audit |
| F-1-35 | Bound workspace wording to the one local cue set. | copy audit; Live demo |
| F-1-36 | Normalized the imported item to “track”. | copy audit; Live home/demo |
| F-1-37 | Rewrote the 404 h1 as a plain missing-page message. | Live `/unknown/nested`; `not-found/screenshot-mobile.png` |
| F-2-1 | Rebuilt the offline fallback with same-origin assets, real metadata, a skeleton, and recovery copy. | `@claim:offline-reload`; Live `/offline.html` verifier report |
| F-2-2 | Retained 44 px legal links and brand target sizing. | E2E target-size coverage; Live privacy/terms mobile screenshots |
| F-2-3 | Removed the paid-price surface and its self-referential billing test. | `@claim:free-access`; Live home |
| F-2-4 | Removed the paid refund/merchant claim surface. | `@claim:free-access`; source scan |
| F-2-5 | Added the observable `beat-grid` claim and behavior test. | `@claim:beat-grid`; Live demo |
| F-2-6 | Kept one public name per scene: Contour, Orbit, and Shards. | `@claim:three-scenes`; Live demo |
| F-2-7 | Removed the noun-only Plus header button. | `@claim:free-access`; Live home |
| F-2-8 | Removed “Cue JSON” workflow wording in favor of “cue file”. | `@claim:json-no-audio`; Live demo |
| F-2-9 | Kept “track” as the name for the imported audio throughout the product. | copy audit; Live home |
| F-2-10 | Removed unprovable billing-rate-limit claims and fixtures with billing. | `@claim:free-access`; source scan |
| F-2-11 | Replaced vague accessibility marketing with tested keyboard and labelled controls. | `@claim:accessibility-in-free`; E2E Axe coverage |
| F-2-12 | Limited recording promise to the tested browser path and asserted both media tracks in the WebM. | `@claim:rehearsal-recording`; Live demo |
| F-2-13 | Removed the one-day license-cache statement. | `@claim:free-access`; source scan |
| F-2-14 | Removed the allowance-replenishment statement. | `@claim:free-access`; source scan |
| F-2-15 | Demo navigation supplies Demo-specific title and social metadata. | E2E metadata test; Live `/?demo=1` verifier report |
| F-2-16 | Rewrote preview text to describe the visible cue sheet. | Live home screenshot |
| F-2-17 | Renamed the editor section to “Add the next cue”. | Live demo screenshot |
| F-2-18 | Renamed the destructive action to “Start a new set”. | Live demo screenshot |
| F-3-1 | Added the exact 12-second duration to `demo-sandbox` and assert `0:12.000`. | `@claim:demo-sandbox`; Live demo |
| F-3-2 | Added the cue-triggered Contour/Orbit/Shards behavior to `deterministic-scenes` and play it across boundaries. | `@claim:deterministic-scenes`; Live demo |
| F-3-3 | The recording test now parses the WebM EBML and proves non-empty video and audio tracks, not just a filename. | `@claim:rehearsal-recording` |
| F-3-4 | Demo save status consistently says “Demo changes reset on reload.” | `@claim:demo-sandbox`; Live demo screenshot |
| F-3-5 | The isolation test seeds an actual real project, snapshots track/cues/blob bytes, then verifies it after demo edit/reset/reload/exit. | `@claim:demo-sandbox` |
| F-3-6 | Corrected home skip text to “Skip to main content”; demo uses “Skip to cue editor”. | E2E metadata test; Live home/demo verifier reports |
| F-3-7 | Renamed the context-free “Preview” label to “Sample cue sheet”. | Live home screenshot |
| F-3-8 | Restored “demo” consistently in the README and demo documentation. | README; `.factory/demo.md` |
| F-3-9 | Replaced “track-audio capture” with plain recording support wording. | README; `@claim:rehearsal-recording` |
| F-3-10 | Rewrote the README privacy sentence without runtime/CDN jargon. | README; `@claim:local-privacy` |
| F-3-11 | Replaced “responsive layout” with plain phone/desktop wording. | README; Mobile |
| F-3-12 | Replaced the unexplained CSP acronym with “security headers”. | README; Live headers |
| F-3-13 | Replaced “generated-art provenance” with plain artwork-source wording. | README; `.factory/design.md` |

## Final live recheck

Cold checks passed on <https://visualizer-cuebook.sociobot.in/>, <https://visualizer-cuebook.sociobot.in/?demo=1>, <https://visualizer-cuebook.sociobot.in/demo/>, <https://visualizer-cuebook.sociobot.in/privacy/>, <https://visualizer-cuebook.sociobot.in/terms/>, <https://visualizer-cuebook.sociobot.in/offline.html>, and the designed 404. The live mobile home and demo screenshots, verifier JSON, Lighthouse report, and exact final mobile-focus measurements are retained in `.factory/evidence/polish-3-live/`.
