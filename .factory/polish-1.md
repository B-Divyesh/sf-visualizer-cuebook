# Polish 1 — review-1 acceptance map

Revision repaired: `272f11d168678818138cee20427fd8a673157212`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Demo-aware license module never accesses real license keys; demo hides purchase/restore. | `@claim:demo-sandbox` sentinel test |
| F-1-2 | Replaced zero PCM with original audible 12-second click-and-tone rhythm. | `@claim:demo-sandbox` PCM-energy assertion |
| F-1-3 | Made labelled demo controls sticky below sticky header. | `demo-mobile.png`, mobile Axe test |
| F-1-4 | Replaced `/demo*` with exact `/demo` and `/demo/` deployment routes. | deployment unit + route test |
| F-1-5 | Added preview, three steps, limits/privacy, and pricing sections. | browser route test, `demo-desktop.png` |
| F-1-6 | Added canonical/social/apple/SVG icon metadata on every HTML route. | route metadata browser test |
| F-1-7 | Added shared skip/header/nav/footer to privacy, terms, and 404. | route metadata browser test |
| F-1-8 | Focuses each route h1 and announces app route on load. | route metadata browser test |
| F-1-9 | Converted timing aside to section and labelled demo banner region. | zero-violation Axe test |
| F-1-10 | Gave links, title field, and ranges 44 px targets. | mobile browser/Axe suite |
| F-1-11 | Preserved visible Record label on mobile. | mobile screenshot |
| F-1-12 | Rewrote headline as “Build repeatable visual cues for your audio.” | landing copy audit |
| F-1-13 | Changed unlimited wording to “more than five cues.” | `free-five` and billing contract tests |
| F-1-14 | Added recorded billing-contract claim for US$12, one-time, no subscription. | `@claim:billing-contract` |
| F-1-15 | Added billing-contract fixture test for checkout host and merchant wording. | `@claim:billing-contract` |
| F-1-16 | Replaced IndexedDB jargon with browser storage wording. | README/copy audit |
| F-1-17 | Split playback-time and beat-guide statements. | cue workflow and utility tests |
| F-1-18 | Normalized scene names to Contour, Orbit, Shards. | `@claim:three-scenes`, deterministic test |
| F-1-19 | Added no-tracking-runtime claim and whole-flow request assertion. | `@claim:no-tracking-runtime` |
| F-1-20 | Uses browser-playable format wording. | README/copy audit |
| F-1-21 | Added static-deployment claim and clean dist demo check. | `@claim:static-deployment` |
| F-1-22 | Removed provider-ID implementation claim. | README/copy audit |
| F-1-23 | Rewrote README opener in plain words. | copy audit |
| F-1-24 | Split README workflow into short sentences. | copy audit |
| F-1-25 | Replaced PWA acronym with install/offline benefit. | README/copy audit |
| F-1-26 | Rewrote recording limitation in user terms. | README/copy audit |
| F-1-27 | Split browser-test sentence. | copy audit |
| F-1-28 | Replaced hero slogan with cue behavior caption. | landing copy audit |
| F-1-29 | Renamed dialog heading to Cuebook Plus features. | billing contract browser test |
| F-1-30 | Renamed Plus buttons to See Plus options. | browser route test |
| F-1-31 | Renamed verification action to Verify license. | plus-license test |
| F-1-32 | Added immediate sample-result sentence beside first action. | landing copy audit |
| F-1-33 | Renamed import action to Import a cue file. | browser workflow test |
| F-1-34 | Normalized user-facing cue-file terminology. | README/copy audit |
| F-1-35 | Normalized workspace wording to set. | README/copy audit |
| F-1-36 | Normalized user-facing media wording to track. | README/copy audit |
| F-1-37 | Replaced 404 metaphor with Page not found. | route metadata browser test |

All claim commands passed from clean clone `/tmp/cuebook-clean-hbVXx5/repo`; screenshots are `.factory/evidence/demo-desktop.png` and `.factory/evidence/demo-mobile.png`.
