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
