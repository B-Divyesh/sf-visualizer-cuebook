import { expect, test, type Browser, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function silentWav(seconds = 2): Buffer {
  const sampleRate = 8000;
  const samples = sampleRate * seconds;
  const buffer = Buffer.alloc(44 + samples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples * 2, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples * 2, 40);
  return buffer;
}

function cueFile(cues: unknown[], timing: unknown = { bpm: 120, beatOffset: 0, clock: 'media-currentTime' }): Buffer {
  return Buffer.from(JSON.stringify({
    format: 'cuebook/v1', title: 'Imported set', audio: { name: 'practice.wav', duration: 3 }, timing, cues, exportedAt: ''
  }));
}

function cue(time: number, id = `cue-${time}`): object {
  return { id, time, beat: 1, scene: 'contour', intensity: 72, hue: 0, note: 'transition' };
}

type ProjectSnapshot = {
  title: string;
  audioName: string;
  audioType: string;
  duration: number;
  audioBytes: number;
  cues: Array<{ time: number; scene: string; note: string; intensity: number; hue: number; beat: number }>;
};

async function savedProjectSnapshot(page: Page): Promise<ProjectSnapshot | undefined> {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('cuebook-local', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const database = request.result;
      const read = database.transaction('projects', 'readonly').objectStore('projects').get('current');
      read.onerror = () => { database.close(); reject(read.error); };
      read.onsuccess = () => {
        const project = read.result as { title: string; audioName: string; audioType: string; duration: number; audioBlob: Blob; cues: ProjectSnapshot['cues'] } | undefined;
        database.close();
        resolve(project && {
          title: project.title,
          audioName: project.audioName,
          audioType: project.audioType,
          duration: project.duration,
          audioBytes: project.audioBlob.size,
          cues: project.cues.map(({ time, scene, note, intensity, hue, beat }) => ({ time, scene, note, intensity, hue, beat }))
        });
      };
    };
  }));
}

async function exportCueFile(page: Page): Promise<void> {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export cue file' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.cuebook\.json$/);
}

function assertProductOnlyRequests(requests: string[]): void {
  expect(requests.filter((url) => !url.startsWith('http://127.0.0.1:4173') && !url.startsWith('blob:'))).toEqual([]);
}

async function runCompletePrivacyWorkflow(browser: Browser): Promise<string[]> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  try {
    await page.goto('/');
    await page.locator('#audio-input').setInputFiles({ name: 'private-real-track.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
    await expect(page.locator('#studio')).toBeVisible();
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.waitForTimeout(180);
    await page.getByRole('button', { name: 'Pause' }).click();
    await page.locator('#audio').evaluate((audio) => {
      (audio as HTMLAudioElement).currentTime = 0.5;
      audio.dispatchEvent(new Event('timeupdate'));
    });
    await page.getByRole('button', { name: /Mark cue/ }).click();
    await page.getByLabel('Cue 1 note').fill('Edited real transition');
    await page.getByLabel('Cue 1 note').press('Tab');
    await page.waitForTimeout(350);
    await exportCueFile(page);

    await page.getByRole('link', { name: 'Demo' }).click();
    await expect(page).toHaveURL(/\?demo=1$/);
    await expect(page.locator('#demo-banner')).toBeVisible();
    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.waitForTimeout(180);
    await page.getByRole('button', { name: 'Pause' }).click();
    await page.getByLabel('Cue 1 note').fill('Edited demo transition');
    await page.getByLabel('Cue 1 note').press('Tab');
    await page.waitForTimeout(350);
    await exportCueFile(page);
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await expect(page.locator('.cue-row')).toHaveCount(5);
    await page.getByRole('link', { name: 'Start for real' }).click();
    await expect(page.locator('#track-name')).toHaveText('private-real-track.wav');

    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#studio')).toBeVisible();
    await expect(page.locator('#offline-banner')).toBeVisible();
    return requests;
  } finally {
    await context.close();
  }
}

async function readRuntimeFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return readRuntimeFiles(path);
    return /\.(?:css|html|js)$/.test(entry.name) ? [await readFile(path, 'utf8')] : [];
  }));
  return contents.flat();
}

function ebmlSize(bytes: Buffer, offset: number): { length: number; value: number } | undefined {
  const first = bytes[offset];
  if (first === undefined) return undefined;
  let marker = 0x80;
  let length = 1;
  while (length <= 8 && (first & marker) === 0) { marker >>= 1; length += 1; }
  if (length > 8 || offset + length > bytes.length) return undefined;
  let value = first & (marker - 1);
  for (let index = 1; index < length; index += 1) value = value * 256 + bytes[offset + index];
  return { length, value };
}

function webmTrackTypes(bytes: Buffer): number[] {
  const types = new Set<number>();
  for (let index = 0; index < bytes.length - 2; index += 1) {
    if (bytes[index] !== 0x83) continue;
    const size = ebmlSize(bytes, index + 1);
    if (!size || size.value < 1 || size.value > 4 || index + 1 + size.length + size.value > bytes.length) continue;
    let value = 0;
    for (let valueIndex = 0; valueIndex < size.value; valueIndex += 1) {
      value = value * 256 + bytes[index + 1 + size.length + valueIndex];
    }
    if (value === 1 || value === 2) types.add(value);
  }
  return [...types].sort((left, right) => left - right);
}

test('@claim:cue-workflow creates, exports, and persists a timed cue without accessibility violations', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: /Build repeatable visual cues/ })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);

  await page.locator('#audio-input').setInputFiles({ name: 'practice.wav', mimeType: 'audio/wav', buffer: silentWav() });
  await expect(page.locator('#studio')).toBeVisible();
  const studioAccessibility = await new AxeBuilder({ page }).analyze();
  expect(studioAccessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.getByLabel('Cue note').fill('Opening pulse');
  await page.getByRole('button', { name: /Mark cue/ }).click();
  await expect(page.locator('.cue-row')).toHaveCount(1);
  await expect(page.locator('.cue-note input')).toHaveValue('Opening pulse');
  await page.reload();
  await expect(page.locator('#studio')).toBeVisible();
  await expect(page.locator('.cue-row')).toHaveCount(1);
  await expect(page.locator('.cue-note input')).toHaveValue('Opening pulse');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export cue file' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.cuebook\.json$/);
  expect(consoleErrors).toEqual([]);
});

test('keeps the cue workflow within a 390px phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  const onboardingAccessibility = await new AxeBuilder({ page }).analyze();
  expect(onboardingAccessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  await page.locator('#audio-input').setInputFiles({ name: 'mobile.wav', mimeType: 'audio/wav', buffer: silentWav() });
  await page.getByRole('button', { name: /Mark cue/ }).click();
  await expect(page.locator('.cue-row')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const transportOverlap = await page.evaluate(() => {
    const time = document.querySelector('.time-readout')!.getBoundingClientRect();
    const record = document.querySelector('#record')!.getBoundingClientRect();
    return time.left < record.right && time.right > record.left && time.top < record.bottom && time.bottom > record.top;
  });
  expect(transportOverlap).toBe(false);
  const undersizedTargets = await page.locator('button, a, input:not([type="file"]), select').evaluateAll((elements) => elements.flatMap((element) => {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0
      && (bounds.width < 44 || bounds.height < 44)
      ? [`${element.tagName.toLowerCase()}#${element.id || '(no-id)'} ${bounds.width.toFixed(1)}×${bounds.height.toFixed(1)}`]
      : [];
  }));
  expect(undersizedTargets).toEqual([]);
  const studioAccessibility = await new AxeBuilder({ page }).analyze();
  expect(studioAccessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('@claim:accessibility-in-free supports keyboard controls and labelled controls without trapping focus', async ({ page }) => {
  await page.goto('/');
  await page.locator('.skip-link').focus();
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.locator('#audio-input').setInputFiles({ name: 'keys.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await page.locator('main').focus();
  await page.keyboard.press('m');
  await expect(page.locator('.cue-row')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Record rehearsal' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Track position' })).toBeVisible();
  await page.locator('#cue-note').focus();
  await page.keyboard.press('m');
  await expect(page.locator('.cue-row')).toHaveCount(1);
});

test('@claim:offline-reload reopens the saved studio while offline', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'offline.wav', mimeType: 'audio/wav', buffer: silentWav() });
  await expect(page.locator('#studio')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#studio')).toBeVisible();
  await expect(page.locator('#offline-banner')).toBeVisible();
  await context.close();

  const demoContext = await browser.newContext();
  const demoPage = await demoContext.newPage();
  await demoPage.goto('/demo/');
  await demoPage.evaluate(() => navigator.serviceWorker.ready);
  await demoPage.reload();
  await expect(demoPage.locator('.cue-row')).toHaveCount(5);
  await demoContext.setOffline(true);
  await demoPage.reload();
  await expect(demoPage.locator('#demo-banner')).toBeVisible();
  await expect(demoPage.locator('.cue-row')).toHaveCount(5);
  await expect(demoPage.locator('#offline-banner')).toBeVisible();
  await demoContext.close();
});

test('rejects semantic-invalid cue JSON without changing the active rehearsal', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'three-seconds.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await expect(page.locator('#studio')).toBeVisible();
  await page.locator('#cue-file-input').setInputFiles({
    name: 'broken.cuebook.json', mimeType: 'application/json',
    buffer: cueFile([cue(99, 'bad')], { bpm: 'not-a-number', beatOffset: -5, clock: 'media-currentTime' })
  });
  await expect(page.locator('#toast')).toContainText('Cue timing BPM must be a number from 20 to 300.');
  await expect(page.locator('.cue-row')).toHaveCount(0);
  await expect(page.locator('#bpm')).toHaveValue('120');
  await expect(page.locator('#beat-offset')).toHaveValue('0');
});

test('rejects imported cues beyond the loaded track duration', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'three-seconds.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await page.locator('#cue-file-input').setInputFiles({ name: 'too-long.cuebook.json', mimeType: 'application/json', buffer: cueFile([cue(99)]) });
  await expect(page.locator('#toast')).toContainText('beyond this track');
  await expect(page.locator('.cue-row')).toHaveCount(0);
});

test('asks before a shorter replacement, removes unreachable cues, and exports a file that re-imports', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'long.wav', mimeType: 'audio/wav', buffer: silentWav(3) });

  for (const [index, time] of [0.5, 2.499].entries()) {
    await page.locator('#audio').evaluate((audio, cueTime) => {
      (audio as HTMLAudioElement).currentTime = cueTime;
      audio.dispatchEvent(new Event('timeupdate'));
    }, time);
    await page.getByRole('button', { name: /Mark cue/ }).click();
    await expect(page.locator('.cue-row')).toHaveCount(index + 1);
  }

  await page.locator('#replace-audio-input').setInputFiles({ name: 'short.wav', mimeType: 'audio/wav', buffer: silentWav(1) });
  await expect(page.locator('#replace-audio-dialog')).toBeVisible();
  await expect(page.locator('#replace-audio-dialog')).toContainText('1 cue falls after short.wav ends at 0:01.000');
  await expect(page.getByRole('button', { name: 'Keep current track' })).toBeFocused();
  const replacementAccessibility = await new AxeBuilder({ page }).include('#replace-audio-dialog').analyze();
  expect(replacementAccessibility.violations).toEqual([]);
  await page.getByRole('button', { name: 'Keep current track' }).click();
  await expect(page.locator('#track-name')).toHaveText('long.wav');
  await expect(page.locator('.cue-row')).toHaveCount(2);
  await page.reload();
  await expect(page.locator('#track-name')).toHaveText('long.wav');
  await expect(page.locator('.cue-row')).toHaveCount(2);

  await page.locator('#replace-audio-input').setInputFiles({ name: 'short.wav', mimeType: 'audio/wav', buffer: silentWav(1) });
  await page.getByRole('button', { name: 'Remove later cue and replace track' }).click();
  await expect(page.locator('#track-name')).toHaveText('short.wav');
  await expect(page.locator('#track-duration')).toHaveText('0:01.000');
  await expect(page.locator('.cue-row')).toHaveCount(1);
  await expect(page.locator('.cue-time input')).toHaveValue('0.500');
  await expect(page.locator('#toast')).toContainText('Removed 1 cue after 0:01.000');
  await page.reload();
  await expect(page.locator('#track-name')).toHaveText('short.wav');
  await expect(page.locator('.cue-row')).toHaveCount(1);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export cue file' }).click();
  const exported = await downloadPromise;
  const exportedPath = await exported.path();
  expect(exportedPath).not.toBeNull();
  const exportedBuffer = await readFile(exportedPath!);
  const exportedData = JSON.parse(exportedBuffer.toString()) as { audio: { name: string; duration: number }; cues: Array<{ time: number }> };
  expect(exportedData.audio).toEqual({ name: 'short.wav', duration: 1 });
  expect(exportedData.cues.map((item) => item.time)).toEqual([0.5]);

  await page.locator('#cue-file-input').setInputFiles({ name: 'short.cuebook.json', mimeType: 'application/json', buffer: exportedBuffer });
  await expect(page.locator('#toast')).toContainText('Cue sheet imported');
  await expect(page.locator('.cue-row')).toHaveCount(1);
});

test('asks for specific confirmation before deleting a cue', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'delete.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await page.locator('#audio').evaluate((audio) => {
    (audio as HTMLAudioElement).currentTime = 0.5;
    audio.dispatchEvent(new Event('timeupdate'));
  });
  await page.getByLabel('Cue note').fill('Opening pulse');
  await page.getByRole('button', { name: /Mark cue/ }).click();

  await page.getByRole('button', { name: 'Delete cue 1' }).click();
  await expect(page.locator('#delete-cue-dialog')).toBeVisible();
  await expect(page.locator('#delete-cue-dialog')).toContainText('cue 1 at 0:00.500');
  await expect(page.locator('#delete-cue-dialog')).toContainText('Opening pulse');
  await expect(page.getByRole('button', { name: 'Keep cue' })).toBeFocused();
  const deletionAccessibility = await new AxeBuilder({ page }).include('#delete-cue-dialog').analyze();
  expect(deletionAccessibility.violations).toEqual([]);
  await page.getByRole('button', { name: 'Keep cue' }).click();
  await expect(page.locator('.cue-row')).toHaveCount(1);

  await page.getByRole('button', { name: 'Delete cue 1' }).click();
  await page.getByRole('button', { name: 'Delete this cue' }).click();
  await expect(page.locator('.cue-row')).toHaveCount(0);
  await expect(page.locator('#save-state')).toHaveText('Saved locally');
  await page.reload();
  await expect(page.locator('.cue-row')).toHaveCount(0);
});

test('@claim:delete-local-set removes the complete local set and returns to the empty screen', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'remove-me.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await page.locator('#audio').evaluate((audio) => {
    (audio as HTMLAudioElement).currentTime = 0.5;
    audio.dispatchEvent(new Event('timeupdate'));
  });
  await page.getByLabel('Cue note').fill('Remove this cue and track');
  await page.getByRole('button', { name: /Mark cue/ }).click();
  const saved = await savedProjectSnapshot(page);
  expect(saved?.audioBytes).toBe(silentWav(3).byteLength);
  expect(saved?.cues).toHaveLength(1);

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('will be removed from this device');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Start a new set' }).click();
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('#studio')).toBeHidden();
  await expect(page.locator('#toast')).toHaveText('Local set removed.');
  expect(await savedProjectSnapshot(page)).toBeUndefined();

  await page.reload();
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('#studio')).toBeHidden();
  expect(await savedProjectSnapshot(page)).toBeUndefined();
});

test('@claim:clear-site-data browser controls remove the saved set, audio, caches, and storage keys', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('/privacy/');
    await expect(page.locator('main')).toContainText('Use browser site-data controls to remove the saved set, audio, and cached app files.');
    await page.goto('/');
    await page.locator('#audio-input').setInputFiles({ name: 'clear-everything.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
    await page.getByLabel('Cue note').fill('Remove with site data');
    await page.getByRole('button', { name: /Mark cue/ }).click();
    await page.evaluate(async () => {
      localStorage.setItem('cuebook:test-local', 'sentinel');
      const cache = await caches.open('cuebook-test-sentinel');
      await cache.put('/site-data-sentinel', new Response('sentinel'));
      await navigator.serviceWorker.ready;
    });
    expect(await savedProjectSnapshot(page)).toMatchObject({ audioName: 'clear-everything.wav', cues: [{ note: 'Remove with site data' }] });
    const populatedStorage = await page.evaluate(async () => ({
      caches: await caches.keys(),
      registrations: (await navigator.serviceWorker.getRegistrations()).length
    }));
    expect(populatedStorage.registrations).toBe(1);
    expect(populatedStorage.caches).toContain('cuebook-test-sentinel');

    const session = await context.newCDPSession(page);
    await session.send('Storage.clearDataForOrigin', {
      origin: 'http://127.0.0.1:4173',
      storageTypes: 'all'
    });

    const cleared = await page.evaluate(async () => ({
      caches: await caches.keys(),
      databases: (await indexedDB.databases()).map((database) => database.name ?? ''),
      localKeys: Object.keys(localStorage),
      registrations: (await navigator.serviceWorker.getRegistrations()).length
    }));
    expect(cleared).toEqual({ caches: [], databases: [], localKeys: [], registrations: 0 });

    await page.reload();
    await expect(page.locator('#empty-state')).toBeVisible();
    await expect(page.locator('#studio')).toBeHidden();
    expect(await savedProjectSnapshot(page)).toBeUndefined();
  } finally {
    await context.close();
  }
});

test('keeps the duration error visible when cue JSON is chosen before audio', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cue-file-input').setInputFiles({ name: 'too-long-first.cuebook.json', mimeType: 'application/json', buffer: cueFile([cue(99)]) });
  await page.locator('#audio-input').setInputFiles({ name: 'three-seconds.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await expect(page.locator('#toast')).toContainText('beyond this track');
  await expect(page.locator('.cue-row')).toHaveCount(0);
});

test('normalizes invalid timing controls to the saved values', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'timing.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await page.locator('#bpm').fill('19');
  await page.locator('#bpm').press('Tab');
  await expect(page.locator('#bpm')).toHaveValue('20');
  await page.locator('#beat-offset').fill('-1');
  await page.locator('#beat-offset').press('Tab');
  await expect(page.locator('#beat-offset')).toHaveValue('0');
  await expect(page.locator('#toast')).toContainText('Timing adjusted');
  await page.waitForTimeout(350);
  await page.reload();
  await expect(page.locator('#bpm')).toHaveValue('20');
  await expect(page.locator('#beat-offset')).toHaveValue('0');
});

test('@claim:cue-capacity imports and keeps a cue sheet with more than five cues', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'full-sheet.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  const sixCues = [0, 0.2, 0.4, 0.6, 0.8, 1].map((time) => cue(time));
  await page.locator('#cue-file-input').setInputFiles({ name: 'six.cuebook.json', mimeType: 'application/json', buffer: cueFile(sixCues) });
  await expect(page.locator('.cue-row')).toHaveCount(6);
  await expect(page.locator('#toast')).toContainText('Cue sheet imported');
  await expect(page.locator('#save-state')).toHaveText('Saved locally');
  await page.reload();
  await expect(page.locator('.cue-row')).toHaveCount(6);
});

test('@claim:demo-sandbox opens a 12-second audible sample without changing complete real project storage', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'review-real-sentinel.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await page.locator('#project-title').fill('Review 3 real sentinel');
  await page.locator('#project-title').press('Tab');
  await page.locator('#audio').evaluate((audio) => {
    (audio as HTMLAudioElement).currentTime = 0.5;
    audio.dispatchEvent(new Event('timeupdate'));
  });
  await page.getByLabel('Cue note').fill('Real storage sentinel');
  await page.getByRole('button', { name: /Mark cue/ }).click();
  await expect(page.locator('#save-state')).toHaveText('Saved locally');
  const beforeDemo = await savedProjectSnapshot(page);
  expect(beforeDemo).toMatchObject({
    title: 'Review 3 real sentinel', audioName: 'review-real-sentinel.wav', audioType: 'audio/wav', duration: 3,
    cues: [{ time: 0.5, note: 'Real storage sentinel' }]
  });
  expect(beforeDemo?.audioBytes).toBe(silentWav(3).byteLength);

  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page).toHaveTitle('Demo — Cuebook');
  await expect(page.locator('#demo-banner')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.locator('#save-state')).toHaveText('Demo changes reset on reload');
  await expect(page.locator('#project-title')).toHaveValue('Neon classroom rehearsal');
  await expect(page.locator('#track-duration')).toHaveText('0:12.000');
  await expect(page.locator('.cue-row')).toHaveCount(5);
  const energy = await page.locator('#audio').evaluate(async (audio) => {
    const blob = await fetch((audio as HTMLAudioElement).src).then((response) => response.blob());
    const bytes = new Int16Array(await blob.arrayBuffer(), 44);
    return bytes.reduce((total, value) => total + Math.abs(value), 0);
  });
  expect(energy).toBeGreaterThan(1000);
  await page.locator('#project-title').fill('Changed demo title');
  await page.locator('#project-title').press('Tab');
  await page.getByLabel('Cue 1 note').fill('Changed demo cue');
  await page.getByLabel('Cue 1 note').press('Tab');
  await page.waitForTimeout(350);
  await expect(page.locator('#project-title')).toHaveValue('Changed demo title');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#project-title')).toHaveValue('Neon classroom rehearsal');
  await expect(page.locator('.cue-row')).toHaveCount(5);
  await page.getByLabel('Cue 1 note').fill('Second demo edit');
  await page.getByLabel('Cue 1 note').press('Tab');
  await page.waitForTimeout(350);
  await page.reload();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.locator('.cue-row')).toHaveCount(5);
  await expect(page.getByLabel('Cue 1 note')).toHaveValue('Opening contour');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.locator('#track-name')).toHaveText('review-real-sentinel.wav');
  expect(await savedProjectSnapshot(page)).toEqual(beforeDemo);
});

test('places the demo studio directly after its banner without retained landing sections', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/demo/');
    await expect(page.locator('#studio')).toBeVisible();
    const layout = await page.evaluate(() => ({
      visibleMainChildren: [...document.querySelector('main')!.children]
        .filter((element) => getComputedStyle(element).display !== 'none')
        .map((element) => element.id || element.className),
      scrollY: window.scrollY,
      bannerBottom: document.querySelector('#demo-banner')!.getBoundingClientRect().bottom,
      studioTop: document.querySelector('#studio')!.getBoundingClientRect().top
    }));
    expect(layout.visibleMainChildren).toEqual(['studio']);
    expect(layout.scrollY).toBe(0);
    expect(layout.studioTop - layout.bannerBottom).toBeLessThanOrEqual(1);
  }
});

test('keeps demo controls visible while editing the last cue on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  const lastNote = page.getByLabel('Cue 5 note');
  await lastNote.scrollIntoViewIfNeeded();
  await lastNote.focus();
  const layout = await page.evaluate(() => {
    const banner = document.querySelector('#demo-banner')!.getBoundingClientRect();
    const note = document.querySelectorAll<HTMLInputElement>('.cue-note input')[4]!.getBoundingClientRect();
    return {
      bannerTop: banner.top,
      bannerBottom: banner.bottom,
      noteTop: note.top,
      noteBottom: note.bottom,
      viewportHeight: window.innerHeight
    };
  });
  expect(layout.bannerTop).toBeGreaterThanOrEqual(64);
  expect(layout.bannerBottom).toBeLessThanOrEqual(layout.viewportHeight);
  expect(layout.noteTop).toBeGreaterThanOrEqual(layout.bannerBottom);
  expect(layout.noteBottom).toBeLessThanOrEqual(layout.viewportHeight);
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible();
});

test('@claim:local-privacy keeps real and demo rehearsal flows on the product origin', async ({ browser }) => {
  assertProductOnlyRequests(await runCompletePrivacyWorkflow(browser));
});

test('@claim:json-no-audio exports cue JSON without audio bytes', async ({ page }) => {
  await page.goto('/demo/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export cue file' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const data = JSON.parse(await readFile(path!, 'utf8')) as Record<string, unknown>;
  expect(data).not.toHaveProperty('audioBlob');
  expect(data.audio).toEqual({ name: 'sample-beacon-rhythm.wav', duration: 12 });
});

test('@claim:three-scenes exposes all three deterministic scene choices', async ({ page }) => {
  await page.goto('/demo/');
  const sceneNames = ['Contour', 'Orbit', 'Shards'];
  for (const name of sceneNames) {
    const button = page.getByRole('button', { name });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }
});

test('@claim:deterministic-scenes activates saved scenes on cue and renders the same frames on return', async ({ page }) => {
  await page.goto('/demo/');
  const frameHash = async (): Promise<string> => page.locator('#visual-canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (const value of pixels) {
      hash ^= value;
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  });
  await page.locator('#audio').evaluate((audio) => { (audio as HTMLAudioElement).playbackRate = 4; });
  await page.getByRole('button', { name: 'Play' }).click();
  await expect.poll(() => page.locator('#audio').evaluate((audio) => (audio as HTMLAudioElement).currentTime)).toBeGreaterThan(2.5);
  await page.locator('#audio').evaluate((audio) => (audio as HTMLAudioElement).pause());
  await expect(page.locator('#canvas-scene')).toHaveText('Orbit');
  await expect(page.locator('#canvas-cue')).toContainText('First pulse');
  await page.locator('#audio').evaluate((audio) => {
    (audio as HTMLAudioElement).currentTime = 4.7;
    audio.dispatchEvent(new Event('timeupdate'));
  });
  await page.getByRole('button', { name: 'Play' }).click();
  await expect.poll(() => page.locator('#audio').evaluate((audio) => (audio as HTMLAudioElement).currentTime)).toBeGreaterThan(4.9);
  await page.locator('#audio').evaluate((audio) => (audio as HTMLAudioElement).pause());
  await expect(page.locator('#canvas-scene')).toHaveText('Shards');
  await expect(page.locator('#canvas-cue')).toContainText('Break into shards');
  const frames = new Map<string, string>();
  for (const [sliderValue, scene, cueNote] of [['210', 'Orbit', 'First pulse'], ['410', 'Shards', 'Break into shards']] as const) {
    await page.locator('#timeline').fill(sliderValue);
    await expect(page.locator('#canvas-scene')).toHaveText(scene);
    await expect(page.locator('#canvas-cue')).toContainText(cueNote);
    frames.set(sliderValue, await frameHash());
  }
  for (const [sliderValue, scene, cueNote] of [['210', 'Orbit', 'First pulse'], ['410', 'Shards', 'Break into shards']] as const) {
    await page.locator('#timeline').fill(sliderValue);
    await expect(page.locator('#canvas-scene')).toHaveText(scene);
    await expect(page.locator('#canvas-cue')).toContainText(cueNote);
    expect(await frameHash()).toBe(frames.get(sliderValue));
  }
});

test('@claim:pwa-install serves an install manifest and controls the page with a service worker', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const response = await fetch('/manifest.webmanifest');
    const manifest = await response.json() as { display: string; icons: unknown[] };
    return { active: registration.active?.state, controlled: Boolean(navigator.serviceWorker.controller), display: manifest.display, icons: manifest.icons.length };
  });
  expect(['activating', 'activated']).toContain(result.active);
  expect(result).toMatchObject({ controlled: true, display: 'standalone', icons: 3 });
});

test('@claim:rehearsal-recording saves a WebM rehearsal with video and track audio without a purchase', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'recording.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  const sixCues = [0, 0.2, 0.4, 0.6, 0.8, 1].map((time) => cue(time));
  await page.locator('#cue-file-input').setInputFiles({ name: 'six-cues.cuebook.json', mimeType: 'application/json', buffer: cueFile(sixCues) });
  await expect(page.locator('.cue-row')).toHaveCount(6);
  await page.getByRole('button', { name: 'Record rehearsal' }).click();
  await expect(page.locator('#record-badge')).toBeVisible();
  await page.waitForTimeout(1_100);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Stop & save' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/-rehearsal\.webm$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  const recording = await readFile(path!);
  expect(recording.byteLength).toBeGreaterThan(4096);
  expect(recording.subarray(0, 4).toString('hex')).toBe('1a45dfa3');
  expect(recording.toString('latin1')).toMatch(/V_[A-Z0-9]+/);
  expect(recording.toString('latin1')).toMatch(/A_[A-Z0-9]+/);
  expect(webmTrackTypes(recording)).toEqual(expect.arrayContaining([1, 2]));

  await page.evaluate(() => { (HTMLCanvasElement.prototype as { captureStream?: unknown }).captureStream = undefined; });
  await page.getByRole('button', { name: 'Record rehearsal' }).click();
  await expect(page.locator('#toast')).toContainText('This browser cannot include the track in a recording.');
  await expect(page.locator('#toast')).toContainText('Try another browser, or export the cue file instead.');
});

test('uses browser-playable audio guidance without recommending untested formats', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not audio') });
  await expect(page.locator('#toast')).toHaveText('Choose an audio file your browser can play.');
  const productSource = await readFile('src/main.ts', 'utf8');
  expect(productSource).not.toMatch(/Try MP3|such as MP3/);
  expect(productSource).not.toContain('track-audio capture');
});

test('@claim:no-tracking-runtime keeps full workflow requests and runtime assets on the product origin', async ({ browser }) => {
  assertProductOnlyRequests(await runCompletePrivacyWorkflow(browser));
  const runtime = (await readRuntimeFiles('dist')).join('\n');
  const origins = [...runtime.matchAll(/https?:\/\/([^/'"\s)]+)/g)].map((match) => match[1]);
  expect([...new Set(origins)]).toEqual(['visualizer-cuebook.sociobot.in']);
});

test('@claim:free-access removes the unavailable purchase path and keeps every current tool free', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('body')).toContainText('All rehearsal tools are free.');
  await expect(page.locator('a[href*="checkout"], a[href*="api.sociobot.in"], #plus-dialog, #support-button')).toHaveCount(0);
  await expect(page.getByText(/Cuebook Plus|US\$12|one-time license/i)).toHaveCount(0);
  await page.goto('/terms/');
  await expect(page.locator('main')).toContainText('All current Cuebook tools are available without charge.');
  await expect(page.locator('a[href*="checkout"], a[href*="api.sociobot.in"]')).toHaveCount(0);
  expect(requests.some((url) => url.startsWith('https://api.sociobot.in/'))).toBe(false);
});

test('@claim:no-accounts exposes no sign-in path, identity traffic, or credential storage', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  for (const path of ['/', '/?demo=1', '/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('input[type="password"], input[autocomplete="username"], input[autocomplete="current-password"]')).toHaveCount(0);
    await expect(page.locator('a[href*="login"], a[href*="signin"], a[href*="signup"], a[href*="auth"]')).toHaveCount(0);
  }
  await expect(page.locator('main')).not.toContainText(/sign in|sign up|create an account/i);
  await page.goto('/privacy/');
  await expect(page.locator('main')).toContainText('Cuebook has no accounts');
  const browserStorage = await page.evaluate(async () => ({
    localKeys: Object.keys(localStorage),
    sessionKeys: Object.keys(sessionStorage),
    databases: (await indexedDB.databases()).map((database) => database.name ?? '')
  }));
  expect(browserStorage.localKeys).toEqual([]);
  expect(browserStorage.sessionKeys).toEqual([]);
  expect(browserStorage.databases.filter((name) => /account|auth|credential|identity|session|token/i.test(name))).toEqual([]);
  expect(requests.filter((url) => /\/(?:auth|login|identity|session)(?:\/|\?|$)/i.test(new URL(url).pathname))).toEqual([]);
  assertProductOnlyRequests(requests);
});

test('@claim:content-ownership keeps the rendered Terms ownership promise aligned with its contract fixture', async ({ page }) => {
  const contract = JSON.parse(await readFile('.factory/legal-contract.json', 'utf8')) as { userContentOwnership: string };
  expect(contract.userContentOwnership).toBeTruthy();
  await page.goto('/terms/');
  await expect(page.locator('main')).toContainText(contract.userContentOwnership);
});

test('@claim:beat-grid updates beat numbers without moving the selected cue time', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('#timeline').fill('200');
  await page.locator('#bpm').fill('120');
  await page.locator('#bpm').press('Tab');
  await page.locator('#beat-offset').fill('1');
  await page.locator('#beat-offset').press('Tab');
  await expect(page.locator('#current-beat')).toHaveText('3.80');
  const selectedCue = page.locator('.cue-row').nth(1);
  await expect(selectedCue.locator('.cue-time input')).toHaveValue('2.400');
  await expect(selectedCue.locator('.cue-beat strong')).toHaveText('3.80');
  await page.locator('#beat-offset').fill('0');
  await page.locator('#beat-offset').press('Tab');
  await expect(page.locator('#current-beat')).toHaveText('5.80');
  await expect(selectedCue.locator('.cue-time input')).toHaveValue('2.400');
  await expect(selectedCue.locator('.cue-beat strong')).toHaveText('5.80');
});

test('@claim:static-deployment serves a complete static demo without runtime environment configuration', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.locator('#studio')).toBeVisible();
  await expect(page.locator('.cue-row')).toHaveCount(5);
  const html = await page.evaluate(async () => (await fetch('/')).text());
  expect(html).not.toContain('VITE_');
  expect(html).not.toContain('process.env');
});

test('@claim:node-20-build compiles and builds the production site with the pinned Node 20 runtime', async () => {
  const packageData = JSON.parse(await readFile('package.json', 'utf8')) as { engines?: { node?: string }; devDependencies?: { node?: string } };
  expect(packageData.engines?.node).toBe('>=20');
  expect(packageData.devDependencies?.node).toBe('20.19.5');
  const node20 = join(process.cwd(), 'node_modules', 'node', 'bin', 'node');
  const version = await execFileAsync(node20, ['--version']);
  expect(version.stdout.trim()).toBe('v20.19.5');
  await execFileAsync(node20, [join(process.cwd(), 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit']);
  const outputDirectory = await mkdtemp(join(tmpdir(), 'cuebook-node20-'));
  try {
    await execFileAsync(node20, [join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--outDir', outputDirectory, '--emptyOutDir']);
    expect(await readFile(join(outputDirectory, 'index.html'), 'utf8')).toContain('<title>Cuebook — visual cues for your track</title>');
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});

test('@claim:browser-suite-contract pins Playwright and exercises the documented browser checks', async ({ browser }) => {
  const packageData = JSON.parse(await readFile('package.json', 'utf8')) as { devDependencies?: Record<string, string> };
  expect(packageData.devDependencies?.['@playwright/test']).toBe('1.58.2');
  expect(packageData.devDependencies?.['playwright-core']).toBe('1.58.2');

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await page.locator('#audio-input').setInputFiles({ name: 'suite-contract.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
    await page.getByRole('button', { name: /Mark cue/ }).click();
    const realProject = await savedProjectSnapshot(page);

    await page.goto('/?demo=1');
    await expect(page.getByRole('heading', { level: 1, name: 'Rehearse five sample visual cues.' })).toBeVisible();
    await page.getByLabel('Cue 1 note').fill('Browser contract demo edit');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export cue file' }).click();
    expect((await downloadPromise).suggestedFilename()).toMatch(/\.cuebook\.json$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('#visual-canvas')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

    await page.getByRole('link', { name: 'Start for real' }).click();
    expect(await savedProjectSnapshot(page)).toEqual(realProject);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#studio')).toBeVisible();
    await expect(page.locator('#offline-banner')).toBeVisible();
  } finally {
    await context.close();
  }
});

test('@claim:deployment-config defines exact demo routing, security headers, asset caching, and the designed 404', async () => {
  const source = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8')) as {
    globalHeaders: Record<string, string>;
    responseOverrides: Record<string, { rewrite?: string }>;
    routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
  };
  const built = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as typeof source;
  expect(built).toEqual(source);
  expect(source.routes.filter((route) => route.rewrite)).toEqual([{ route: '/demo', rewrite: '/index.html' }]);
  expect(source.routes.some((route) => route.route === '/demo*')).toBe(false);
  expect(source.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(source.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  expect(source.globalHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  expect(source.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(source.responseOverrides['404']?.rewrite).toBe('/404.html');
  expect(await readFile('dist/404.html', 'utf8')).toContain('<h1 tabindex="-1">Page not found</h1>');
});

test('uses complete route metadata, shared navigation, focus, 44px targets, and a strict demo route', async ({ page }) => {
  const packageData = JSON.parse(await readFile('package.json', 'utf8')) as { version: string };
  for (const [path, title] of [['/', 'Cuebook — visual cues for your track'], ['/demo/', 'Demo — Cuebook'], ['/privacy/', 'Privacy — Cuebook'], ['/terms/', 'Terms — Cuebook'], ['/404.html', 'Page not found — Cuebook'], ['/offline.html', 'Offline setup — Cuebook']] as const) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"][sizes="180x180"]')).toHaveCount(1);
    await expect(page.locator('footer')).toContainText('Built by Param Factory');
    await expect(page.locator('footer')).toContainText(`v${packageData.version}`);
    await expect(page.locator('h1')).toBeFocused();
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations, `${path} accessibility`).toEqual([]);
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      await expect(page.locator('header nav')).toBeVisible();
      await expect(page.locator('header nav').getByRole('link', { name: 'Demo' })).toBeVisible();
      await expect(page.locator('header nav').getByRole('link', { name: 'Privacy' })).toBeVisible();
      await expect(page.locator('header nav').getByRole('link', { name: 'Terms' })).toBeVisible();
      const undersizedTargets = await page.locator('button, a, input:not([type="file"]), select').evaluateAll((elements) => elements.flatMap((element) => {
        const bounds = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0 && (bounds.width < 44 || bounds.height < 44)
          ? [`${element.tagName} ${element.textContent} ${bounds.width}×${bounds.height}`] : [];
      }));
      expect(undersizedTargets, `${path} at ${viewport.width}px`).toEqual([]);
    }
  }
  for (const demoPath of ['/?demo=1', '/demo/']) {
    await page.goto(demoPath);
    await expect(page).toHaveTitle('Demo — Cuebook');
    await expect(page.getByRole('heading', { level: 1, name: 'Rehearse five sample visual cues.' })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeFocused();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Try a 12-second Cuebook rehearsal with five editable sample cues.');
    await expect(page.locator('#demo-banner')).toBeVisible();
    await expect(page.locator('.skip-link')).toHaveText('Skip to cue editor');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Demo — Cuebook');
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', 'Demo — Cuebook');
  }
  await page.goto('/');
  await expect(page.locator('.skip-link')).toHaveText('Skip to main content');
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toHaveAttribute('href', '/?demo=1');
  const config = await page.evaluate(async () => (await fetch('/staticwebapp.config.json')).json());
  expect(config.routes.map((route: { route: string }) => route.route)).toContain('/demo');
  expect(config.routes.map((route: { route: string }) => route.route)).not.toContain('/demo*');
});

test('keeps app navigation keyboard-operable and restores heading focus on a 390px phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const demoLink = page.locator('header nav').getByRole('link', { name: 'Demo' });
  await expect(demoLink).toBeVisible();
  await demoLink.focus();
  await expect(demoLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('header nav')).toBeVisible();
});

test('keeps the demo within the viewport from 621px through 768px', async ({ page }) => {
  for (const width of [621, 640, 700, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/demo/');
    await expect(page.locator('#studio')).toBeVisible();
    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      actionsRight: document.querySelector('.studio-actions')!.getBoundingClientRect().right
    }));
    expect(layout.scrollWidth, `${width}px document width`).toBe(layout.clientWidth);
    expect(layout.actionsRight, `${width}px set actions`).toBeLessThanOrEqual(layout.clientWidth);
  }
});

test('renders the offline setup under the production CSP without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/offline.html', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': "default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob:; font-src 'self'; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; form-action 'self'" } });
  });
  await page.goto('/offline.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Reconnect once to finish offline setup' })).toBeVisible();
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('has zero Axe violations on seeded demo at phone and desktop widths', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/demo/');
    const report = await new AxeBuilder({ page }).analyze();
    expect(report.violations).toEqual([]);
  }
});
