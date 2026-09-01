# Copy audit — polish 2

Reviewed 1 September 2026. Landing, demo, legal pages, and README use sentence case, literal headings, and no banned marketing words. No visitor-facing sentence exceeds 22 words.

| Surface | Longest sentence | Words | Result |
| --- | --- | ---: | --- |
| Landing | “Free includes five cues, every scene, cue-file export, keyboard controls, and screen-reader labels.” | 12 | Pass |
| Demo | “Beat numbers use the BPM and offset you enter.” | 10 | Pass |
| Privacy | “Cuebook includes no behavioral analytics, advertising, tracking pixels, cloud audio processing, third-party runtime scripts, or CDN font requests.” | 15 | Pass |
| Terms | “The free edition supports up to five saved cues, all three scenes, keyboard controls, screen-reader labels, and cue-file import and export.” | 19 | Pass |
| README | “Record rehearsals in browsers that support track-audio capture.” | 9 | Pass |
| Offline setup | “Open Cuebook while connected once.” | 5 | Pass |

## Terminology

| Concept | Required term |
| --- | --- |
| One track-and-cues workspace | set |
| Imported media | track; use “audio file” only for a file format or technical capture |
| Portable timing file | cue file; “Cuebook cue file (JSON)” only when format matters |
| Scenes | Contour, Orbit, Shards |
| Paid tier | Cuebook Plus, then Plus |
| Isolated sample | demo |

## Repaired labels

- `See Plus options` is the locked header action; `Manage Plus license` is the unlocked action.
- `Add the next cue` names the editor controls.
- `Start a new set` names the destructive set-reset action.
- `Reconnect once to finish offline setup` names the offline fallback recovery step.
