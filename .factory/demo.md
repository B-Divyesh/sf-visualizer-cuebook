# Cuebook demo sandbox

- URL: `https://visualizer-cuebook.sociobot.in/demo/` (local: `http://127.0.0.1:4173/demo/`).
- Entry: select **Try it with sample data** on the first screen.
- Sample: an original, locally generated 12-second 100 BPM click-and-tone rhythm and five editable scene cues for “Neon classroom rehearsal.”
- Audio: the PCM loop has kick pulses on each beat and bright cue-boundary tones. It is generated in `makeSampleWav` and has no external source or license.
- Isolation: project state is held only in memory. Demo code never opens the real `cuebook-local` IndexedDB database.
- License isolation: demo license functions return an in-memory locked fixture. They never read, write, delete, or verify `sb_license:*` keys.
- Reset: **Reset demo** rebuilds the original five cues. Reloading starts with a clean sample.
- Exit: **Start for real** returns to `/`; any real set and license are unchanged.
- Offline: the service worker precaches `/demo/`, the shell, artwork, and icons. The sample loop is generated after load without a request.
