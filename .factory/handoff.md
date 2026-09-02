# Cuebook adversarial review 3 handoff

## Result

**FAIL.** Review 3 found one blocking issue, five major issues, and eight minor issues. The full report is [`.factory/review-3.md`](./review-3.md).

No product code was changed. Only the review and this handoff were written.

## What was checked

- Cold live first reads at 390×844 and 1440×900.
- One-click demo, realistic sample state, playback across five cues, reset, sticky banner, and real-data isolation.
- Live request log, service-worker offline reload, routing, Back/focus behavior, metadata, dead-link crawl, 404 behavior, security headers, reduced motion, touch targets, and visual identity.
- Axe on home, demo, Privacy, Terms, offline setup, and 404 at mobile and desktop widths: zero violations.
- Every earlier review and polish finding against current live behavior and source.
- Every exact `.factory/claims.json` command from clean clone `/tmp/cuebook-review3-3eKygh/repo`: 15/15 passed.
- `npm test` (10/10), typecheck, lint, build, and `npm run test:e2e` (27/27): passed.
- All 25 public live build files match local `dist/` byte-for-byte.

## Blocking issue

F-1-19 is reopened. The privacy/no-tracking claim tests do not execute the full import, playback, edit, export, reset, exit, and offline sequence promised by the claim sandbox and earlier repair requirement.

## Other work left

Add complete claim coverage for the 12-second demo value, cue-triggered scene changes, WebM audio/video content, and demo isolation over an existing real project. Remove the contradictory “Saved locally” demo status, correct the landing skip-link label, and apply the exact copy rewrites in review 3.

## Reproduce

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Run each command in `.factory/claims.json` separately from a clean clone. Use `/opt/fleet/lib/verify-url.sh <url> <evidence-dir>` and Playwright Axe against the live home, demo, Privacy, Terms, offline, and 404 routes.
