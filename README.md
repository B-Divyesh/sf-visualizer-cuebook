# Cuebook

Cuebook is a private, offline-first visual rehearsal desk for bedroom DJs, VJs, and educators. Import a track you own, place exact time/beat cues, attach deterministic visual scenes, and replay the same transitions from the browser’s audio clock.

Live product: <https://visualizer-cuebook.sociobot.in>

## What it does

- Keeps one active audio track and cue sheet locally in IndexedDB.
- Marks millisecond timestamps from the media clock and shows advisory beat positions from a manual BPM/offset.
- Replays three original Canvas scenes—Contour field, Signal orbit, and Glass shards—deterministically from saved cue parameters.
- Imports and exports portable `cuebook/v1` JSON without including audio.
- Installs as a PWA and reopens the complete saved set offline.
- Provides five free cues. The US$12 one-time Plus license adds unlimited cues and WebM rehearsal recording; checkout and verification use only the Sociobot billing API.

Audio is never uploaded. There are no analytics, trackers, third-party runtime scripts, or CDN font requests. See [privacy](./privacy/index.html) and [terms](./terms/index.html).

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL Vite prints. MP3, WAV, M4A, OGG, and other formats supported by your browser can be used. Rehearsal recording works best in desktop Chromium because it requires `HTMLMediaElement.captureStream` and `MediaRecorder`.

Keyboard controls outside form fields:

- `Space`: play or pause
- `M`: mark a cue at the current audio time
- `←` / `→`: nudge the playhead by one second

## Test and build

```bash
npm test
npm run test:e2e
npm run build
```

The Playwright suite pins Chromium-compatible Playwright 1.58.2 and checks the empty state, cue creation/persistence, JSON download, 390 px layout, axe accessibility, license return handling, and an explicit offline reload. The production command is exactly `npm run build`; static output is written to `dist/`, with `dist/index.html` at its root.

Preview that output with:

```bash
npm run preview
```

Deploy the contents of `dist/` to any static host that serves directory indexes. No backend or environment variable is required. The factory registers the billing product separately; the app intentionally contains no provider product ID or secret.

## Project notes

The researched scope is in [`.factory/brief.json`](./.factory/brief.json), the original visual system and generated-asset provenance are in [`.factory/design.md`](./.factory/design.md), and verification details are in [`.factory/handoff.md`](./.factory/handoff.md).

Licensed under the [MIT License](./LICENSE).
