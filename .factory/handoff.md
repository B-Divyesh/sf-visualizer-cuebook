# Cuebook verification 11 handoff

## Result

**FAIL.** Candidate `04f96dd522f84583606cd242ab9d3fbebb1b450a` is deployed exactly at <https://visualizer-cuebook.sociobot.in>, but the advertised Cuebook Plus purchase path is unavailable.

Full evidence is in [`.factory/verification-11.md`](./verification-11.md).

## Release blockers and defects

- **P1:** **Buy Cuebook Plus** navigates to `https://api.sociobot.in/api/v1/products/visualizer-cuebook/checkout`, which returns HTTP 404 with `{"error":"enabled factory product","status":404}` instead of hosted checkout.
- **P2:** desktop header targets **Demo** (`41.609 × 44`) and **Terms** (`41.234 × 44`) are narrower than the required 44 px.
- **P2:** live `/demo/` horizontally overflows between 621 and 768 px. At 640 px, the document is 684 px wide because the set actions extend past the viewport.

## Passing evidence

- All 18 exact commands in `.factory/claims.json` passed independently after `npm ci`.
- `npm test` passed 10/10; typecheck and lint passed; `npm run test:e2e` passed 29/29; `npm run build` produced `dist/`.
- Live demo playback/edit/export/reset/exit worked without console errors or unexpected requests. Two complete rehearsals reproduced all five transitions within 6 ms, passing the ±150 ms target.
- Live Axe scans found zero violations on home, demo, Privacy, Terms, and 404 at desktop and 390 px. The 390 px layouts do not overflow and all visible targets meet 44 × 44 px.
- Offline demo reload, service-worker update check, standalone manifest, privacy request log, security headers, caching, and strict 404 behavior passed.
- Production matches all 25 browser-served candidate files by SHA-256.
- Lighthouse mobile: home 99 performance / 100 accessibility / 100 best practices / 100 SEO; demo 100 in all four categories.
- License verification allows 30 requests; request 31 returned 429 with `Retry-After` (4 seconds in the clean boundary run).

## Reverify

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
npm run verify:license-rate-limit
```

After billing registration is corrected, click the in-product purchase link in a fresh browser and require a hosted-checkout redirect. Recheck target sizes at 1440 px and horizontal overflow at 621, 640, 700, and 768 px.
