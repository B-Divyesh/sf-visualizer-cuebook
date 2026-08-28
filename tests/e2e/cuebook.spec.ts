import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

test('creates and persists a timed cue without accessibility violations', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cuebook');
  await expect(page.getByRole('heading', { level: 2, name: /Make every visual cue/ })).toBeVisible();

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
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.cuebook\.json$/);
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.locator('#studio')).toBeVisible();
  await expect(page.locator('.cue-row')).toHaveCount(1);
  expect(consoleErrors).toEqual([]);
});

test('keeps the cue workflow within a 390px phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.locator('#audio-input').setInputFiles({ name: 'mobile.wav', mimeType: 'audio/wav', buffer: silentWav() });
  await page.getByRole('button', { name: /Mark cue/ }).click();
  await expect(page.locator('.cue-row')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('supports the documented keyboard path without trapping focus in controls', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.locator('#audio-input').setInputFiles({ name: 'keys.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await page.locator('main').focus();
  await page.keyboard.press('m');
  await expect(page.locator('.cue-row')).toHaveCount(1);
  await page.locator('#cue-note').focus();
  await page.keyboard.press('m');
  await expect(page.locator('.cue-row')).toHaveCount(1);
});

test('reopens the saved studio while offline', async ({ page, context }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'offline.wav', mimeType: 'audio/wav', buffer: silentWav() });
  await expect(page.locator('#studio')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#studio')).toBeVisible();
  await expect(page.locator('#offline-banner')).toBeVisible();
});

test('captures and verifies a returned Plus license without exposing it in the URL', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/visualizer-cuebook/verify?*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/?license=test-license-token');
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.getByRole('button', { name: 'Plus unlocked' })).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem('sb_license:visualizer-cuebook'));
  expect(stored).toBe('test-license-token');
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
});

test('asks before truncating a free cue import and preserves the warning after confirmation', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'limited.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  const sixCues = [0, 0.2, 0.4, 0.6, 0.8, 1].map((time) => cue(time));
  await page.locator('#cue-file-input').setInputFiles({ name: 'six.cuebook.json', mimeType: 'application/json', buffer: cueFile(sixCues) });
  await expect(page.locator('#import-limit-dialog')).toBeVisible();
  await expect(page.locator('.cue-row')).toHaveCount(0);
  await page.getByRole('button', { name: 'Import first five cues' }).click();
  await expect(page.locator('.cue-row')).toHaveCount(5);
  await expect(page.locator('#toast')).toContainText('Imported the first 5 of 6 cues');
});
