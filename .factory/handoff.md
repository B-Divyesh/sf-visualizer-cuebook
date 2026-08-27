# Cuebook v1 handoff

## What shipped

- A complete local-first rehearsal workflow: import user-owned audio, store the audio blob and project in IndexedDB, edit the set title and manual BPM/beat-1 offset, scrub/play, mark exact media-clock cues, seek through time edits, select one of three deterministic scenes, annotate cues, and delete cues.
- Portable `cuebook/v1` JSON import/export. Audio is deliberately excluded and the imported sheet asks for its matching local track.
- Canvas rehearsal scenes (“Contour field,” “Signal orbit,” and “Glass shards”) driven from `HTMLMediaElement.currentTime`, avoiding an independent animation clock. Paused frames reproduce the same visual state.
- Cuebook Plus paid-unlock contract at US$12 one time: Sociobot checkout link, return-token capture/removal, daily cached verification, optimistic offline unlock from a valid cached verdict, restore-license UI, unlimited cues, and WebM rehearsal recording. The free tier retains five cues, every scene, JSON ownership, and all accessibility features.
- Installable PWA with versioned shell/runtime caches, generated 192/512/maskable icons, offline fallback, network-first navigation, cache-first assets, update notice, and saved project recovery after offline reload.
- Product-specific luminous-glass interface, three responsive breakpoints, 390 px mobile layout, keyboard shortcuts, reduced-motion behavior, designed focus states, empty/error/offline/save states, legal pages, original generated hero art, and locally authored canvas/icon assets.

## Verification

Run from `/work/repo`:

```bash
npm install
npm test
npm run test:e2e
npm run build
```

Verified on 2026-08-27:

- `npm test`: 4/4 Vitest checks passed.
- `npm run test:e2e`: 4/4 Playwright Chromium checks passed, including serious/critical axe scans of onboarding and studio, a 390×844 layout, IndexedDB reload, license-token handling, and `context.setOffline(true)` reload with the saved audio project visible.
- `npm run build`: passed; `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html` produced.
- Initial app JS: 31.27 KB raw / 10.56 KB gzip (budget ≤200 KB).
- App CSS: 15.22 KB raw / 4.39 KB gzip (budget ≤50 KB).
- Self-hosted font: 13 KB (budget ≤120 KB).
- Hero WebP: 30 KB at 1200×800, with a 16 KB 720×480 source (budget ≤300 KB).
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 1.4 s, CLS 0.054, TBT 10 ms.
- Manual screenshot review at 1440 px and 390 px confirmed the intended hierarchy, responsive cue rows, five-beacon artwork, and live canvas repaint after audio import.

## Known limits

- Browser capture support varies. Rehearsal recording requires `canvas.captureStream`, `HTMLMediaElement.captureStream`, and `MediaRecorder`; current desktop Chromium is the recommended path. The UI reports an actionable error where audio capture is unavailable.
- Beat positions are intentionally manual/advisory. Cue timing is exact to the browser media clock, but end-to-end display/audio latency still depends on the user’s hardware and browser, so performers should test their complete setup.
- V1 keeps one active audio project per browser profile. Exported JSON is the supported way to archive or move cue sheets; audio remains user-managed.
- No streaming integration, automatic beat detection, venue control, cloud sync, or copyrighted audio distribution is included by design.

## Next sensible steps

- Add a selectable recording codec/container when Safari exposes interoperable media-element audio capture.
- Add multi-project local library support after measuring whether users need more than one active rehearsal set on-device.
- Run physical-device latency trials to publish realistic browser/device offset guidance against the ±150 ms product target.
