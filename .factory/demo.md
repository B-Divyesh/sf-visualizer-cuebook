# Cuebook demo sandbox

- URL: `https://visualizer-cuebook.sociobot.in/demo/` (local: `http://127.0.0.1:4173/demo/`).
- Entry: select **Try it with sample data** on the first screen.
- Sample: a 12-second local WAV placeholder, a 100 BPM timing grid, and five scene cues for “Neon classroom rehearsal.”
- Isolation: demo state uses in-memory storage. It never reads from or writes to the real `cuebook-local` IndexedDB database.
- Reset: **Reset demo** rebuilds the original five cues. Reloading the page also starts with a clean sample.
- Exit: **Start for real** returns to `/`; any existing real set is unchanged.
- Offline: the service worker precaches `/demo/`, the shell, artwork, and icons. The sample WAV is generated locally after load.
