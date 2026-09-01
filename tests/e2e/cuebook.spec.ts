import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

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

test('supports the documented keyboard path without trapping focus in controls', async ({ page }) => {
  await page.goto('/');
  await page.locator('.skip-link').focus();
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
});

test('@claim:plus-license captures and verifies a returned Plus license without exposing it in the URL', async ({ page }) => {
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

test('@claim:free-five asks before truncating a free cue import and preserves the warning after confirmation', async ({ page }) => {
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'limited.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  const sixCues = [0, 0.2, 0.4, 0.6, 0.8, 1].map((time) => cue(time));
  await page.locator('#cue-file-input').setInputFiles({ name: 'six.cuebook.json', mimeType: 'application/json', buffer: cueFile(sixCues) });
  await expect(page.locator('#import-limit-dialog')).toBeVisible();
  await expect(page.locator('.cue-row')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cancel import' }).click();
  await expect(page.locator('#toast')).toContainText('current cue sheet was unchanged');
  await expect(page.locator('.cue-row')).toHaveCount(0);
  await page.locator('#cue-file-input').setInputFiles({ name: 'six-again.cuebook.json', mimeType: 'application/json', buffer: cueFile(sixCues) });
  await page.getByRole('button', { name: 'Import first five cues' }).click();
  await expect(page.locator('.cue-row')).toHaveCount(5);
  await expect(page.locator('#toast')).toContainText('Imported the first 5 of 6 cues');
});

test('@claim:demo-sandbox opens audible sample data in one click without changing real project or license data', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:visualizer-cuebook', 'real-license-sentinel');
    localStorage.setItem('sb_license_cache:visualizer-cuebook', JSON.stringify({ valid: true, checkedAt: 1 }));
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveTitle('Demo — Cuebook');
  await expect(page.locator('#demo-banner')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.locator('#project-title')).toHaveValue('Neon classroom rehearsal');
  await expect(page.locator('.cue-row')).toHaveCount(5);
  const energy = await page.locator('#audio').evaluate(async (audio) => {
    const blob = await fetch((audio as HTMLAudioElement).src).then((response) => response.blob());
    const bytes = new Int16Array(await blob.arrayBuffer(), 44);
    return bytes.reduce((total, value) => total + Math.abs(value), 0);
  });
  expect(energy).toBeGreaterThan(1000);
  await expect(page.locator('#restore-license')).toHaveCount(0);
  await page.getByRole('button', { name: 'Delete cue 1' }).click();
  await expect(page.locator('.cue-row')).toHaveCount(4);
  await page.reload();
  await expect(page.locator('.cue-row')).toHaveCount(5);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.locator('#support-button')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:visualizer-cuebook'))).toBe('real-license-sentinel');
  await page.locator('#audio-input').setInputFiles({ name: 'my-real-set.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.locator('#project-title')).toHaveValue('Neon classroom rehearsal');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.locator('#track-name')).toHaveText('my-real-set.wav');
});

test('@claim:local-privacy keeps a complete demo rehearsal on the product origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/');
  await expect(page.locator('.cue-row')).toHaveCount(5);
  await page.getByRole('button', { name: 'Orbit' }).click();
  expect(requests.filter((url) => !url.startsWith('http://127.0.0.1:4173') && !url.startsWith('blob:'))).toEqual([]);
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

test('@claim:deterministic-scenes renders the same scene frame at the same media time', async ({ page }) => {
  await page.goto('/demo/');
  await page.waitForTimeout(200);
  const frameHash = async (): Promise<string> => page.locator('#visual-canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (const value of pixels) {
      hash ^= value;
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  });
  await page.locator('#timeline').fill('400');
  await page.waitForTimeout(100);
  const first = await frameHash();
  await page.locator('#timeline').fill('700');
  await page.locator('#timeline').fill('400');
  await page.waitForTimeout(100);
  const second = await frameHash();
  expect(second).toBe(first);
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

test('@claim:plus-recording saves a WebM rehearsal with a cached valid license', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:visualizer-cuebook', 'recording-fixture');
    localStorage.setItem('sb_license_cache:visualizer-cuebook', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto('/');
  await page.locator('#audio-input').setInputFiles({ name: 'recording.wav', mimeType: 'audio/wav', buffer: silentWav(3) });
  const sixCues = [0, 0.2, 0.4, 0.6, 0.8, 1].map((time) => cue(time));
  await page.locator('#cue-file-input').setInputFiles({ name: 'plus-six.cuebook.json', mimeType: 'application/json', buffer: cueFile(sixCues) });
  await expect(page.locator('.cue-row')).toHaveCount(6);
  await page.getByRole('button', { name: 'Record rehearsal' }).click();
  await expect(page.locator('#record-badge')).toBeVisible();
  await page.waitForTimeout(1_100);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Stop & save' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/-rehearsal\.webm$/);

  await page.evaluate(() => { (HTMLCanvasElement.prototype as { captureStream?: unknown }).captureStream = undefined; });
  await page.getByRole('button', { name: 'Record rehearsal' }).click();
  await expect(page.locator('#toast')).toContainText('Use a current Chromium or Firefox browser.');
});

test('@claim:no-tracking-runtime keeps app requests and runtime assets on the product origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.getByRole('button', { name: 'Export cue file' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(requests.filter((url) => !url.startsWith('http://127.0.0.1:4173') && !url.startsWith('blob:'))).toEqual([]);
  const runtime = await page.evaluate(async () => (await fetch('/')).text());
  expect(runtime).not.toMatch(/https?:\/\/(?!visualizer-cuebook\.sociobot\.in)/);
});

test('@claim:billing-contract displays the recorded Plus contract without requesting checkout', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.getByRole('button', { name: 'See Plus options' }).click();
  await expect(page.locator('#plus-dialog')).toContainText('US$12');
  await expect(page.locator('#plus-dialog')).toContainText('No subscription');
  await expect(page.locator('#plus-dialog')).toContainText('Dodo is the merchant of record');
  await expect(page.locator('#plus-dialog').getByRole('link', { name: 'Buy Cuebook Plus' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/visualizer-cuebook/checkout');
  expect(requests.some((url) => url.startsWith('https://api.sociobot.in/'))).toBe(false);
});

test('@claim:static-deployment serves a complete static demo without runtime environment configuration', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.locator('#studio')).toBeVisible();
  await expect(page.locator('.cue-row')).toHaveCount(5);
  const html = await page.evaluate(async () => (await fetch('/')).text());
  expect(html).not.toContain('VITE_');
  expect(html).not.toContain('process.env');
});

test('uses complete route metadata, shared navigation, focus, and a strict demo route', async ({ page }) => {
  for (const [path, title] of [['/', 'Cuebook — visual cues for your audio'], ['/demo/', 'Demo — Cuebook'], ['/privacy/', 'Privacy — Cuebook'], ['/terms/', 'Terms — Cuebook'], ['/404.html', 'Page not found — Cuebook']] as const) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"][sizes="180x180"]')).toHaveCount(1);
    await expect(page.locator('header nav')).toBeVisible();
    await expect(page.locator('footer')).toContainText('Built by Param Factory');
    await expect(page.locator('h1')).toBeFocused();
  }
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Cuebook');
  await expect(page.locator('#demo-banner')).toBeVisible();
  const config = await page.evaluate(async () => (await fetch('/staticwebapp.config.json')).json());
  expect(config.routes.map((route: { route: string }) => route.route)).toContain('/demo');
  expect(config.routes.map((route: { route: string }) => route.route)).not.toContain('/demo*');
});

test('has zero Axe violations on seeded demo at phone and desktop widths', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/demo/');
    const report = await new AxeBuilder({ page }).analyze();
    expect(report.violations).toEqual([]);
  }
});
