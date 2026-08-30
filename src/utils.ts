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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Checks the portable portion of a cue sheet before it is allowed to touch
 * the active rehearsal. Duration is checked separately because a sheet may
 * be selected before its matching local audio file.
 */
export function parseCueFile(value: unknown): CueFile {
  if (!isRecord(value)) throw new Error('This file does not contain a Cuebook project.');
  const file = value as Partial<CueFile>;
  if (file.format !== 'cuebook/v1' || !Array.isArray(file.cues) || !isRecord(file.timing)) {
    throw new Error('This cue file uses an unsupported format. Export it as cuebook/v1.');
  }
  if (!isFiniteNumber(file.timing.bpm) || file.timing.bpm < 20 || file.timing.bpm > 300) {
    throw new Error('Cue timing BPM must be a number from 20 to 300.');
  }
  if (!isFiniteNumber(file.timing.beatOffset) || file.timing.beatOffset < 0) {
    throw new Error('Cue timing Beat 1 offset must be a non-negative number.');
  }
  if (file.timing.clock !== undefined && file.timing.clock !== 'media-currentTime') {
    throw new Error('Cue timing must use the media-currentTime clock.');
  }
  const scenes: SceneId[] = ['contour', 'orbital', 'shards'];
  const cues = file.cues.map((cue, index) => {
    if (!isRecord(cue) || !isFiniteNumber(cue.time) || cue.time < 0 || !scenes.includes(cue.scene as SceneId)) {
      throw new Error(`Cue ${index + 1} is missing a valid time or scene.`);
    }
    return {
      id: `import-${index}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      time: cue.time,
      beat: isFiniteNumber(cue.beat) ? cue.beat : 0,
      scene: cue.scene as SceneId,
      intensity: Math.min(100, Math.max(0, Number(cue.intensity) || 0)),
      hue: Math.min(180, Math.max(-180, Number(cue.hue) || 0)),
      note: typeof cue.note === 'string' ? cue.note.slice(0, 120) : ''
    };
  });
  return {
    format: 'cuebook/v1',
    title: typeof file.title === 'string' ? file.title.slice(0, 60) : 'Imported set',
    audio: isRecord(file.audio) && typeof file.audio.name === 'string' && isFiniteNumber(file.audio.duration) && file.audio.duration >= 0
      ? { name: file.audio.name, duration: file.audio.duration }
      : { name: '', duration: 0 },
    timing: { bpm: file.timing.bpm, beatOffset: file.timing.beatOffset, clock: 'media-currentTime' },
    cues,
    exportedAt: typeof file.exportedAt === 'string' ? file.exportedAt : ''
  };
}

/** Rejects a sheet that cannot be rehearsed against the currently loaded track. */
export function validateCueFileDuration(file: CueFile, duration: number): void {
  if (!Number.isFinite(duration) || duration < 0) throw new Error('Cuebook could not read the loaded track duration.');
  const invalid = file.cues.find((cue) => cue.time > duration);
  if (invalid) {
    throw new Error(`Cue at ${formatTime(invalid.time)} is beyond this track's ${formatTime(duration)} duration. Choose matching audio or edit the cue JSON.`);
  }
}
