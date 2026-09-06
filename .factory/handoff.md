# Cuebook repair 9 handoff — PASS

**Repair commit:** `35910c82d1880b87ff0bc6be97127c5d60dc8a56` (`test: stabilize deterministic scene claim`)
**Prior QA documentation commit:** `c597d1182f3ed330c8b60eddf060e682f258bbca`
**Prior runtime candidate:** `b6e898375adac63b6d45f75ed5e258a827ed6c68`
**Live URL:** <https://visualizer-cuebook.sociobot.in>

## Outcome

PASS. Cuebook remains a local-first rehearsal tool for DJs, VJs, and educators. A person can import their own track, add time/beat cues, rehearse Contour, Orbit, and Shards, export a cue file, record where supported, and reopen the set offline.

The only open finding from verification 16 was repaired at its cause: the `@claim:deterministic-scenes` test set 4× playback, waited only for a lower time bound, then paused in a later operation. Ordinary browser scheduling could cross the next cue before the scene assertion.

The claim now installs a page-side media-time observer before pressing **Play**. It pauses inside the intended interval, then asserts the observed stop time is after the target cue and before the next cue. The test still proves real playback crosses the Orbit and Shards cue boundaries, and it still compares canvas frames after returning to each saved time.

## Verification

From the documented clean setup (`npm ci`):

| Check | Result |
| --- | --- |
| Baseline `@claim:deterministic-scenes --repeat-each=5` | Reproduced failure: 3/5 failed by reaching Shards before the Orbit assertion |
| Repaired `@claim:deterministic-scenes --repeat-each=5` | PASS, 5/5 |
| `npm test` | PASS, 10 tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS; `dist/` produced |
| `npm run test:e2e` | PASS, 38/38 |
| Every exact command in `.factory/claims.json` | PASS, 22/22 run independently |
| `npm run test:claims` | PASS, 22/22 |

Fresh live checks used the product origin only:

- `/`, `/?demo=1`, `/privacy/`, and `/terms/` each passed `/opt/fleet/lib/verify-url.sh`: 200, route title, `lang=en`, one h1, main landmark, alt-complete images, labelled buttons, and no console/page errors.
- Fresh 1440 px and 390 px browser contexts showed the job, audience, and **Try it with sample data** before scroll. The one-click demo showed its visible route headline, a 12-second track, five cues, Orbit at the first pulse, and the persistent `Demo — sample data, nothing is saved` label with Reset demo and Start for real.
- A seeded real IndexedDB set with an audio blob and cue was byte-for-byte unchanged after a demo edit, reset, and exit.
- Live Axe integrations found zero serious or critical findings on desktop home and phone demo. The phone had no overflow at normal or 200% root text size; the demo banner remained above the fifth cue. Reduced motion had zero running document animations.
- The live real/demo flow made only same-origin and `blob:` requests, with no console errors.
- `/demo/`, `/offline.html`, `/404.html`, and legal routes return 200; an unknown route returns the designed HTTP 404. The live hashed app asset has one-year immutable caching and the expected self-only CSP, referrer policy, `nosniff`, frame protection, and Permissions Policy.

Evidence from this repair is in `.factory/qa-artifacts/repair-9/` and `/work/.evidence/cuebook-repair-9/`.

## Deployment identity

The repair changes browser-test code only; no application runtime source or static artifact changed. The current local app bundle `assets/app-CFB2VUvS.js` SHA-256 is `87241799e7af4ee962d5977ca6b03f8a27effb9cd924aa97470439b9ab7733eb`, which matches the live product. The pushed repair commit is `35910c8`; the live runtime remains the same tested application artifact as the prior candidate, so no new runtime image was needed to fix the verification race.

Previous mobile Lighthouse evidence remains applicable to that unchanged runtime: verification 16 recorded home 98 and demo median 90, with accessibility, best-practices, and SEO at 100. Initial JavaScript remains about 40.2 KB raw / 12.5 KB gzip and CSS 17.6 KB raw / 4.9 KB gzip.

## Earlier findings

The complete verification 1–16 and review 1–5 history was read before this repair. Their fixes remain present and are recorded in `.factory/polish-5.md`; verification 16 rechecked the resulting live workflow, privacy, accessibility, offline behavior, headers, routes, performance, and deployment parity. No earlier P0–P3 or minor finding was reopened. This repair closes the one remaining verification-16 P1 test-race finding.

## Product scope and known gaps

There is no backend, account, payment, license, billing, or external integration in the current product. Backend health, tenant isolation, request allowance, and 429 checks therefore do not apply. All current rehearsal tools are free. No known product gap remains within the researched brief.

The catalog description is the required verb-first line in `.factory/catalog-description.txt` and is copied to `/work/.evidence/catalog-description.txt`.

## Run locally

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:e2e -- --grep @claim:deterministic-scenes --repeat-each=5
npm run test:claims
```

## Independent verification 17

**Verdict: PASS — zero findings and zero untested claims.**

Verification 17 independently reviewed implementation `35910c82d1880b87ff0bc6be97127c5d60dc8a56`; the documentation baseline was `6695a7aa5120a1a645b002564e343ad464717087`. From a clean `npm ci` setup, unit tests (10), typecheck, lint, build, the full browser suite (38/38), all 22 declared claim commands, the combined 22-claim run, and deterministic-scenes five-repeat run passed.

Fresh live desktop and phone contexts confirmed the first-screen job, audience, and sample action; populated demo, reset, persistent demo label, real-data isolation, invalid-input recovery, keyboard/focus behavior, offline reload, service-worker update, routes, legal pages, designed 404, and same-origin-only requests. Axe, the URL verifier, console/page-error checks, reduced motion, no-overflow checks, and live/local asset parity passed. The implementation is test-only; `assets/app-CFB2VUvS.js` remains SHA-256 `87241799e7af4ee962d5977ca6b03f8a27effb9cd924aa97470439b9ab7733eb` locally and live.

The full evidence is [verification-17.md](./verification-17.md), with command outputs and screenshots in `qa-artifacts/verification-17/`. There are no known gaps within the researched brief. The static product has no backend, account, billing, license, or API; tenant, health, restart, allowance, and 429 checks do not apply.
