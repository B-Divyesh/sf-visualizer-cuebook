// Static legal/error documents still receive the same route-change focus cue
// as the app shell after a direct load or history navigation.
window.setTimeout(() => document.querySelector<HTMLElement>('h1')?.focus(), 0);
