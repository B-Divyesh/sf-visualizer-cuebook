# Cuebook

Cuebook helps DJs, VJs, and educators rehearse visual changes against their own audio.

Try the isolated sample: <https://visualizer-cuebook.sociobot.in/demo/>.

It opens a 12-second rhythm with five editable cues. Your saved set and license stay unchanged.

## What it does

- Keeps one track and its set in this browser.
- Marks each cue at the current playback time.
- Shows beat numbers from the BPM and offset you enter.
- Replays Contour, Orbit, and Shards at the same track time.
- Imports and exports a Cuebook cue file. Audio is not included.
- Installs on your device and reopens a saved set offline.
- Free includes five cues. Plus adds more than five cues and rehearsal recording.

Tracks are not uploaded. Cuebook has no analytics, trackers, third-party runtime scripts, or CDN font requests.

Choose an audio file your browser can play. Record rehearsals in desktop Chrome or Firefox.

See [privacy](./privacy/index.html) and [terms](./terms/index.html).

## Run locally

Node.js 20 or newer is required.

```bash
npm ci
npm run dev
```

Open the local URL Vite prints.

Keyboard controls outside form fields:

- `Space`: play or pause
- `M`: mark a cue at the current playback time
- `←` / `→`: nudge the playhead by one second

## Test and build

```bash
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run test:claims
npm run build
```

Browser tests use Playwright 1.58.2. They cover demo isolation, cues, downloads, mobile layout, accessibility, licenses, and offline reload.

Claim checks are mapped in [`.factory/claims.json`](./.factory/claims.json).

`npm run build` writes static files to `dist/`, with `dist/index.html` at its root.

```bash
npm run preview
```

No backend or environment variable is required.

## Project notes

The researched scope is in [`.factory/brief.json`](./.factory/brief.json).

The visual system and generated-art provenance are in [`.factory/design.md`](./.factory/design.md).

Verification details are in [`.factory/handoff.md`](./.factory/handoff.md).

Licensed under the [MIT License](./LICENSE).
