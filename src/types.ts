export type SceneId = 'contour' | 'orbital' | 'shards';

export interface Cue {
  id: string;
  time: number;
  beat: number;
  scene: SceneId;
  intensity: number;
  hue: number;
  note: string;
}

export interface CueProject {
  id: 'current';
  title: string;
  audioName: string;
  audioType: string;
  duration: number;
  bpm: number;
  beatOffset: number;
  cues: Cue[];
  updatedAt: string;
  audioBlob?: Blob;
}

export interface CueFile {
  format: 'cuebook/v1';
  title: string;
  audio: { name: string; duration: number };
  timing: { bpm: number; beatOffset: number; clock: 'media-currentTime' };
  cues: Cue[];
  exportedAt: string;
}
