import type { Cue, CueFile, CueProject, SceneId } from './types';

export const SCENE_NAMES: Record<SceneId, string> = {
  contour: 'Contour field',
  orbital: 'Signal orbit',
  shards: 'Glass shards'
};

export function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60).toString().padStart(2, '0');
  const millis = Math.floor((safe % 1) * 1000).toString().padStart(3, '0');
  return `${mins}:${secs}.${millis}`;
}

export function timeToBeat(time: number, bpm: number, offset: number): number {
  if (!Number.isFinite(bpm) || bpm <= 0) return 0;
  return Math.max(0, (time - offset) * bpm / 60 + 1);
}

export function beatToTime(beat: number, bpm: number, offset: number): number {
  if (!Number.isFinite(bpm) || bpm <= 0) return 0;
  return Math.max(0, (beat - 1) * 60 / bpm + offset);
}

export function cueAt(cues: Cue[], time: number): Cue | undefined {
  return [...cues].sort((a, b) => a.time - b.time).filter((cue) => cue.time <= time + 0.015).at(-1);
}

export function makeCue(time: number, project: CueProject, scene: SceneId = 'contour'): Cue {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `cue-${Date.now()}`,
    time,
    beat: timeToBeat(time, project.bpm, project.beatOffset),
    scene,
    intensity: 72,
    hue: 0,
    note: ''
  };
}

export function parseCueFile(value: unknown): CueFile {
  if (!value || typeof value !== 'object') throw new Error('This file does not contain a Cuebook project.');
  const file = value as Partial<CueFile>;
  if (file.format !== 'cuebook/v1' || !Array.isArray(file.cues) || !file.timing) {
    throw new Error('This cue file uses an unsupported format. Export it as cuebook/v1.');
  }
  const scenes: SceneId[] = ['contour', 'orbital', 'shards'];
  const cues = file.cues.map((cue, index) => {
    if (!cue || typeof cue.time !== 'number' || !scenes.includes(cue.scene)) {
      throw new Error(`Cue ${index + 1} is missing a valid time or scene.`);
    }
    return {
      id: typeof cue.id === 'string' ? cue.id : `import-${index}`,
      time: Math.max(0, cue.time),
      beat: Number.isFinite(cue.beat) ? cue.beat : 0,
      scene: cue.scene,
      intensity: Math.min(100, Math.max(0, Number(cue.intensity) || 0)),
      hue: Math.min(180, Math.max(-180, Number(cue.hue) || 0)),
      note: typeof cue.note === 'string' ? cue.note.slice(0, 120) : ''
    };
  });
  return { ...file, cues } as CueFile;
}
