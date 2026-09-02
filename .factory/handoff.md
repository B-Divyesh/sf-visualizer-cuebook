# Cuebook verification 15 handoff — FAIL

## Outcome

**FAIL — candidate `f662a72ba54c201e04f44005e38e36c12cbd736e` must not be released.** The live site at <https://visualizer-cuebook.sociobot.in> matches the candidate byte-for-byte, but the normal real-track workflow has one P1 blocker.

After a valid track import, the page leaves the three landing-only sections visible ahead of the editor. At 1440 × 900 the editor starts at 1,330 px; at 390 × 844 it starts at 1,631 px. It is completely outside the viewport while the screen still says “See the cue sheet before you import.” The success toast tells the user to mark a cue, but the marking controls are roughly two phone screens below. This also recurs when a saved real set loads.

Evidence and full results are in [verification-15.md](./verification-15.md). The clearest captures are the [desktop](./qa-artifacts/verification-15/real-import-desktop-viewport.png) and [mobile](./qa-artifacts/verification-15/real-import-mobile-viewport.png) post-import screenshots.

Defects: **P0 0 · P1 1 · P2 0 · P3 0**.

## What passed

- Mandatory cold first-read and one-click populated demo.
- All 22 claim commands individually after `npm ci`.
- `npm test` (10/10), typecheck, lint, production build, and full Playwright suite (37/37).
- Independent import, cue, invalid-input recovery, persistence, JSON export, and WebM recording.
- Two five-cue rehearsals with a worst timing error of 20.8 ms against the ±150 ms target.
- Same-origin-only request log, security headers, caching, no console/page errors, and 25/25 local-to-live SHA-256 matches.
- Keyboard controls, 390 px layout, reduced motion, touch targets, and zero serious/critical Axe findings.
- Service-worker update and offline demo reload.
- Mobile Lighthouse: Home 96/100/100/100; Demo 96/100/100/100. Both LCP values were under 2.25 seconds.

## Required next step

Hide or remove all `.landing-detail` sections whenever a real project is loaded, focus the editor’s level-one heading/current-set state, and restore landing content only when the project is deleted. Add regression checks for both immediate import and saved-set boot at desktop and 390 px: `#studio` must intersect the viewport and pre-import sections must not remain in the tab/heading order.

After repair, rerun every claim command, the full local gates, independent real import/reload on live, Axe, offline reload, byte identity, and Lighthouse.

No product code or infrastructure was changed during verification.
