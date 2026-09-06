import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const origin = 'https://visualizer-cuebook.sociobot.in';
const out = '.factory/qa-artifacts/review-6';
const evidence = { origin, checkedAt: new Date().toISOString(), desktop: {}, phone: {}, routes: [], requests: [], errors: [] };

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function wav(seconds = 3) {
  const sampleRate = 8000;
  const samples = sampleRate * seconds;
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write('RIFF', 0);
  bytes.writeUInt32LE(36 + samples * 2, 4);
  bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24);
  bytes.writeUInt32LE(sampleRate * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36);
  bytes.writeUInt32LE(samples * 2, 40);
  return bytes;
}

async function snapshot(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const open = indexedDB.open('cuebook-local', 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const get = db.transaction('projects', 'readonly').objectStore('projects').get('current');
      get.onerror = () => reject(get.error);
      get.onsuccess = async () => {
        const row = get.result;
        db.close();
        resolve(row && {
          title: row.title,
          audioName: row.audioName,
          audioType: row.audioType,
          duration: row.duration,
          audioBytes: row.audioBlob.size,
          cues: row.cues.map(({ time, beat, scene, intensity, hue, note }) => ({ time, beat, scene, intensity, hue, note }))
        });
      };
    };
  }));
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.on('request', request => evidence.requests.push(request.url()));
  page.on('console', message => { if (message.type() === 'error') evidence.errors.push(`console: ${message.text()}`); });
  page.on('pageerror', error => evidence.errors.push(`page: ${error.message}`));

  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  const first = await page.evaluate(() => {
    const visible = element => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.top >= 0 && box.bottom <= innerHeight;
    };
    const h1 = document.querySelector('h1');
    const action = [...document.querySelectorAll('a')].find(a => a.textContent?.trim() === 'Try it with sample data');
    return {
      scrollY,
      title: document.title,
      h1: h1?.textContent?.trim(),
      audience: document.querySelector('.hero-copy')?.textContent?.trim(),
      action: action?.textContent?.trim(),
      h1Visible: visible(h1),
      actionVisible: visible(action),
      facts: [...document.querySelectorAll('.plain-facts li')].map(node => node.textContent?.trim())
    };
  });
  check(first.scrollY === 0, 'desktop did not open at scroll zero');
  check(first.h1 === 'Build repeatable visual cues for your track.', 'desktop job heading changed');
  check(first.audience.includes('DJs, VJs, and educators'), 'desktop audience is not stated');
  check(first.actionVisible, 'desktop first action is not visible before scroll');
  check(first.facts.length === 3, 'desktop first screen does not state three facts');
  evidence.desktop.firstScreen = first;
  await page.screenshot({ path: `${out}/live-home-desktop.png`, fullPage: false });
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  evidence.desktop.focusStyle = await page.getByRole('link', { name: 'Try it with sample data' }).evaluate(element => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor, outlineOffset: style.outlineOffset };
  });
  check(evidence.desktop.focusStyle.outlineStyle !== 'none' && evidence.desktop.focusStyle.outlineWidth !== '0px', 'primary action lacks a visible focus ring');
  const homeAxe = await new AxeBuilder({ page }).analyze();
  check(homeAxe.violations.length === 0, `desktop home axe: ${homeAxe.violations.map(v => v.id).join(', ')}`);

  await page.locator('#audio-input').setInputFiles({ name: 'review-real-track.wav', mimeType: 'audio/wav', buffer: wav(3) });
  await page.getByLabel('Cue note').fill('Saved real transition');
  await page.getByRole('button', { name: /Mark cue/ }).click();
  await page.getByLabel('Cue 1 note').press('Tab');
  await page.waitForTimeout(500);
  const beforeDemo = await snapshot(page);
  check(beforeDemo?.audioBytes > 44 && beforeDemo?.cues.length === 1, 'real set did not persist before demo');

  await page.getByRole('link', { name: 'Demo' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Play' }).click();
  await page.waitForTimeout(500);
  const playbackTime = await page.locator('#audio').evaluate(audio => audio.currentTime);
  await page.getByRole('button', { name: 'Pause' }).click();
  const sample = await page.evaluate(async () => {
    const audio = document.querySelector('#audio');
    return {
      title: document.querySelector('#project-title')?.value,
      track: document.querySelector('#track-name')?.textContent,
      duration: document.querySelector('#track-duration')?.textContent,
      cueCount: document.querySelectorAll('.cue-row').length,
      h1: document.querySelector('h1')?.textContent?.trim(),
      banner: document.querySelector('#demo-banner')?.textContent?.replace(/\s+/g, ' ').trim(),
      scene: document.querySelector('#canvas-scene')?.textContent,
      cue: document.querySelector('#canvas-cue')?.textContent,
      audioDuration: audio.duration,
      audioReadyState: audio.readyState
    };
  });
  sample.playbackTime = playbackTime;
  check(sample.title === 'Neon classroom rehearsal', 'sample title is not populated');
  check(sample.duration === '0:12.000' && sample.cueCount === 5, 'sample duration or cue count is wrong');
  check(sample.banner.includes('Demo — sample data, nothing is saved') && sample.banner.includes('Reset demo') && sample.banner.includes('Start for real'), 'demo label/actions are incomplete');
  check(sample.audioDuration === 12 && sample.audioReadyState >= 2 && sample.playbackTime > 0, 'sample audio did not play');
  evidence.desktop.sample = sample;
  await page.screenshot({ path: `${out}/live-demo-desktop.png`, fullPage: false });

  const transitionTargets = new Map([
    ['Opening contour', 0],
    ['First pulse', 2.4],
    ['Break into shards', 4.8],
    ['Return to orbit', 7.2],
    ['Closing horizon', 9.6]
  ]);
  const transitionRuns = [];
  for (let run = 0; run < 2; run += 1) {
    const observed = await page.evaluate(async () => {
      const audio = document.querySelector('#audio');
      const cue = document.querySelector('#canvas-cue');
      audio.pause();
      audio.currentTime = 0;
      audio.playbackRate = 4;
      audio.dispatchEvent(new Event('timeupdate'));
      const seen = {};
      const capture = () => {
        const note = cue.textContent?.split('·').at(-1)?.trim();
        if (note && !(note in seen)) seen[note] = audio.currentTime;
      };
      capture();
      await audio.play();
      await new Promise((resolve, reject) => {
        const started = performance.now();
        const frame = () => {
          capture();
          if (audio.currentTime >= 9.8) { audio.pause(); resolve(); return; }
          if (performance.now() - started > 8_000) { reject(new Error('timing rehearsal timed out')); return; }
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      return seen;
    });
    const measured = [...transitionTargets].map(([note, target]) => ({ note, target, observed: observed[note], errorMs: Math.round((observed[note] - target) * 1000) }));
    check(measured.every(item => Number.isFinite(item.observed) && Math.abs(item.errorMs) <= 150), `rehearsal ${run + 1} missed ±150 ms: ${JSON.stringify(measured)}`);
    transitionRuns.push(measured);
  }
  evidence.desktop.transitionTiming = transitionRuns;

  await page.getByLabel('Cue 1 note').fill('Changed only in demo');
  await page.getByLabel('Cue 1 note').press('Tab');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  check(await page.getByLabel('Cue 1 note').inputValue() === 'Opening contour', 'Reset demo did not restore cue 1');
  check(await page.locator('.cue-row').count() === 5, 'Reset demo did not restore five cues');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.waitForLoadState('networkidle');
  const afterDemo = await snapshot(page);
  check(JSON.stringify(afterDemo) === JSON.stringify(beforeDemo), 'demo changed the real saved set');

  await page.locator('#bpm').fill('19');
  await page.locator('#bpm').press('Tab');
  check(await page.locator('#bpm').inputValue() === '20', 'BPM boundary was not normalized');
  check((await page.locator('#toast').textContent()).includes('Timing adjusted: BPM is 20–300'), 'BPM recovery message missing');
  await page.locator('#beat-offset').fill('-1');
  await page.locator('#beat-offset').press('Tab');
  check(await page.locator('#beat-offset').inputValue() === '0', 'offset boundary was not normalized');

  await page.locator('#cue-file-input').setInputFiles({ name: 'broken.cuebook.json', mimeType: 'application/json', buffer: Buffer.from('{not json') });
  check(await page.locator('#toast').isVisible() && (await page.locator('#toast').textContent()).trim().length > 0, 'malformed cue file recovery missing');
  await page.locator('#audio-input').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not audio') });
  check((await page.locator('#toast').textContent()) === 'Choose an audio file your browser can play.', 'invalid audio recovery changed');

  await page.getByRole('button', { name: 'Delete cue 1' }).click();
  check(await page.getByRole('button', { name: 'Keep cue' }).evaluate(element => element === document.activeElement), 'delete dialog did not focus the safe action');
  await page.getByRole('button', { name: 'Keep cue' }).click();
  check(await page.locator('.cue-row').count() === 1, 'keeping cue removed it');
  await page.getByRole('button', { name: 'Delete cue 1' }).click();
  await page.getByRole('button', { name: 'Delete this cue' }).click();
  await page.waitForFunction(() => document.querySelectorAll('.cue-row').length === 0);
  check(await page.locator('.cue-row').count() === 0, 'confirmed cue deletion failed');

  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  check(await page.locator('main').evaluate(element => element === document.activeElement), 'skip link did not focus main');
  await page.locator('main').focus();
  await page.keyboard.press('m');
  await page.waitForFunction(() => document.querySelectorAll('.cue-row').length === 1);
  check(await page.locator('.cue-row').count() === 1, 'M keyboard shortcut did not mark a cue');
  await page.locator('main').focus();
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.querySelector('#play')?.getAttribute('aria-label') === 'Pause');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  const pausedTime = await page.locator('#audio').evaluate(audio => audio.currentTime);
  await page.keyboard.press('ArrowRight');
  const nudgedTime = await page.locator('#audio').evaluate(audio => audio.currentTime);
  check(nudgedTime >= pausedTime + 0.9, 'Space/Arrow keyboard transport failed');

  const registration = await page.evaluate(async () => {
    const sw = await navigator.serviceWorker.ready;
    await sw.update();
    return { active: sw.active?.state, controlled: Boolean(navigator.serviceWorker.controller), caches: await caches.keys() };
  });
  check(registration.controlled && registration.caches.length > 0, 'service worker/update/cache check failed');
  await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  check(await page.locator('#studio').isVisible(), 'real set did not reopen offline');
  check(await page.locator('#offline-banner').isVisible(), 'offline ready state is missing');
  evidence.desktop.realDataUnchanged = true;
  evidence.desktop.recovery = { bpm: 20, offset: 0, malformedCue: true, invalidAudio: true, deleteRecovery: true, keyboard: true, spaceAndArrow: true };
  evidence.desktop.serviceWorker = registration;
  await context.close();

  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const phone = await phoneContext.newPage();
  phone.on('console', message => { if (message.type() === 'error') evidence.errors.push(`phone console: ${message.text()}`); });
  phone.on('pageerror', error => evidence.errors.push(`phone page: ${error.message}`));
  await phone.goto(`${origin}/`, { waitUntil: 'networkidle' });
  const phoneFirst = await phone.evaluate(() => {
    const action = [...document.querySelectorAll('a')].find(a => a.textContent?.trim() === 'Try it with sample data');
    const box = action.getBoundingClientRect();
    return {
      scrollY,
      h1: document.querySelector('h1')?.textContent?.trim(),
      audience: document.querySelector('.lede')?.textContent?.trim(),
      action: action?.textContent?.trim(),
      actionVisible: box.top >= 0 && box.bottom <= innerHeight,
      facts: [...document.querySelectorAll('.plain-facts li')].map(node => node.textContent?.trim()),
      width: document.documentElement.scrollWidth
    };
  });
  check(phoneFirst.scrollY === 0 && phoneFirst.actionVisible, 'phone first action is not visible before scroll');
  check(phoneFirst.audience.includes('DJs, VJs, and educators') && phoneFirst.facts.length === 3, 'phone first screen does not state audience and three facts');
  check(phoneFirst.width <= 390, 'phone home overflows horizontally');
  await phone.screenshot({ path: `${out}/live-home-phone.png`, fullPage: false });
  await phone.getByRole('link', { name: 'Try it with sample data' }).click();
  await phone.waitForLoadState('networkidle');
  await phone.locator('.cue-row').last().scrollIntoViewIfNeeded();
  await phone.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await phone.waitForTimeout(250);
  const phoneDemo = await phone.evaluate(() => {
    const banner = document.querySelector('#demo-banner').getBoundingClientRect();
    return {
      scrollY,
      cueCount: document.querySelectorAll('.cue-row').length,
      bannerVisible: banner.top >= 0 && banner.bottom <= innerHeight,
      width: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      animations: document.getAnimations().filter(animation => animation.playState === 'running').length,
      navLinks: [...document.querySelectorAll('header nav a')].map(a => a.textContent?.trim())
    };
  });
  check(phoneDemo.cueCount === 5 && phoneDemo.bannerVisible, 'phone sample/banner persistence failed');
  check(phoneDemo.width <= phoneDemo.clientWidth, 'phone demo overflows at 200% text');
  check(phoneDemo.animations === 0, 'reduced-motion phone has a running document animation');
  const phoneAxe = await new AxeBuilder({ page: phone }).analyze();
  check(phoneAxe.violations.length === 0, `phone demo axe: ${phoneAxe.violations.map(v => v.id).join(', ')}`);
  await phone.screenshot({ path: `${out}/live-demo-phone.png`, fullPage: false });
  evidence.phone = { firstScreen: phoneFirst, demo: phoneDemo, axeViolations: [] };
  await phoneContext.close();

  const routeContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const routePage = await routeContext.newPage();
  const renderedLinks = [];
  const expectedRoutes = [
    ['/', 200, 'Cuebook — visual cues for your track', 'Build repeatable visual cues for your track.'],
    ['/demo/', 200, 'Demo — Cuebook', 'Rehearse five sample visual cues.'],
    ['/privacy/', 200, 'Privacy — Cuebook', 'Privacy'],
    ['/terms/', 200, 'Terms — Cuebook', 'Terms of use'],
    ['/offline.html', 200, 'Offline setup — Cuebook', 'Reconnect once to finish offline setup'],
    ['/404.html', 200, 'Page not found — Cuebook', 'Page not found'],
    ['/definitely-not-a-cuebook-route', 404, 'Page not found — Cuebook', 'Page not found'],
    ['/demo/nope', 404, 'Page not found — Cuebook', 'Page not found'],
    ['/demo-extra', 404, 'Page not found — Cuebook', 'Page not found']
  ];
  for (const [path, status, title, h1] of expectedRoutes) {
    const response = await routePage.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    const actual = {
      path,
      status: response.status(),
      title: await routePage.title(),
      h1: (await routePage.locator('h1').textContent())?.trim(),
      h1Count: await routePage.locator('h1').count(),
      main: await routePage.locator('main').count(),
      lang: await routePage.locator('html').getAttribute('lang'),
      footer: await routePage.locator('footer').count()
    };
    check(actual.status === status && actual.title === title && actual.h1 === h1, `route contract failed for ${path}: ${JSON.stringify(actual)}`);
    check(actual.h1Count === 1 && actual.main === 1 && actual.lang === 'en' && actual.footer === 1, `route structure failed for ${path}`);
    if (status === 200) renderedLinks.push(...await routePage.locator('a').evaluateAll(links => links.map(link => link.href)));
    evidence.routes.push(actual);
  }
  const linkResults = [];
  for (const href of [...new Set(renderedLinks)].filter(href => href.startsWith(origin))) {
    const response = await routeContext.request.get(href);
    linkResults.push({ href, status: response.status() });
    check(response.status() === 200, `rendered link failed: ${href} -> ${response.status()}`);
  }
  await routePage.goto(`${origin}/`);
  await routePage.locator('header nav').getByRole('link', { name: 'Demo' }).focus();
  await routePage.keyboard.press('Enter');
  await routePage.waitForURL(/\?demo=1$/);
  check(await routePage.locator('h1').evaluate(element => element === document.activeElement), 'forward navigation did not focus the demo h1');
  await routePage.goBack();
  check(await routePage.locator('h1').evaluate(element => element === document.activeElement), 'back navigation did not restore h1 focus');
  evidence.linkResults = linkResults;
  evidence.navigationFocus = true;
  await routeContext.close();

  const external = [...new Set(evidence.requests.filter(url => !url.startsWith(origin) && !url.startsWith('blob:')))];
  check(external.length === 0, `cross-origin requests: ${external.join(', ')}`);
  check(evidence.errors.length === 0, `browser errors: ${evidence.errors.join(' | ')}`);
  evidence.requestSummary = { count: evidence.requests.length, external };
  await writeFile(`${out}/live-review.json`, JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({ desktop: evidence.desktop, phone: evidence.phone, routes: evidence.routes, requestSummary: evidence.requestSummary, errors: evidence.errors }, null, 2));
} catch (error) {
  evidence.failure = String(error?.stack || error);
  await writeFile(`${out}/live-review.json`, JSON.stringify(evidence, null, 2));
  throw error;
} finally {
  await browser.close();
}
