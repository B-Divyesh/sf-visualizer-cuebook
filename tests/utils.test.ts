import { describe, expect, it } from 'vitest';
import type { Cue } from '../src/types';
import { beatToTime, cueAt, formatTime, parseCueFile, timeToBeat, validateCueFileDuration } from '../src/utils';

describe('timing utilities', () => {
  it('formats cue timestamps at millisecond precision', () => {
    expect(formatTime(65.4329)).toBe('1:05.432');
    expect(formatTime(Number.NaN)).toBe('0:00.000');
  });

  it('converts manual beat guides without changing the source time', () => {
    expect(timeToBeat(30, 120, 0)).toBe(61);
    expect(beatToTime(61, 120, 0)).toBe(30);
    expect(timeToBeat(1.5, 120, 0.5)).toBe(3);
  });

  it('selects the latest cue using a small render tolerance', () => {
    const cues = [
      { id: 'a', time: 1, scene: 'contour' },
      { id: 'b', time: 3, scene: 'orbital' }
    ] as Cue[];
    expect(cueAt(cues, 2)?.id).toBe('a');
    expect(cueAt(cues, 2.99)?.id).toBe('b');
  });
});

describe('cue import validation', () => {
  it('normalizes editable values and rejects unknown formats', () => {
    const file = parseCueFile({
      format: 'cuebook/v1', title: 'Set', audio: { name: 'x.wav', duration: 5 },
      timing: { bpm: 120, beatOffset: 0, clock: 'media-currentTime' }, exportedAt: '',
      cues: [{ id: 'one', time: 2, beat: 5, scene: 'shards', intensity: 130, hue: -300, note: 'hit' }]
    });
    expect(file.cues[0].intensity).toBe(100);
    expect(file.cues[0].hue).toBe(-180);
    expect(() => parseCueFile({ format: 'other', cues: [] })).toThrow(/unsupported format/i);
  });

  it('rejects semantic-invalid timing before a cue sheet can replace a rehearsal', () => {
    const broken = {
      format: 'cuebook/v1', title: 'Broken', audio: { name: 'x.wav', duration: 3 }, exportedAt: '',
      timing: { bpm: 'not-a-number', beatOffset: -5, clock: 'media-currentTime' },
      cues: [{ id: 'bad', time: 99, beat: 1, scene: 'contour', intensity: 72, hue: 0, note: 'unreachable' }]
    };
    expect(() => parseCueFile(broken)).toThrow(/BPM must be a number from 20 to 300/i);
  });

  it('rejects cue times beyond the loaded track instead of creating unreachable cues', () => {
    const file = parseCueFile({
      format: 'cuebook/v1', title: 'Too long', audio: { name: 'x.wav', duration: 99 }, exportedAt: '',
      timing: { bpm: 120, beatOffset: 0, clock: 'media-currentTime' },
      cues: [{ id: 'bad', time: 99, beat: 1, scene: 'contour', intensity: 72, hue: 0, note: '' }]
    });
    expect(() => validateCueFileDuration(file, 3)).toThrow(/beyond this track/i);
  });
});
