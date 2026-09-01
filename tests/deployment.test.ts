import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('static deployment policy', () => {
  it('ships immutable hashed-asset caching and hardened response headers', () => {
    const config = JSON.parse(readFileSync(resolve('public/staticwebapp.config.json'), 'utf8')) as {
      globalHeaders: Record<string, string>;
      routes: Array<{ route: string; headers?: Record<string, string>; rewrite?: string }>;
    };
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.globalHeaders['Strict-Transport-Security']).toContain('max-age=31536000');
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(config.routes.find((route) => route.route === '/manifest.webmanifest')?.headers?.['Content-Type']).toContain('application/manifest+json');
    expect(config.routes.find((route) => route.route === '/demo')?.rewrite).toBe('/index.html');
    expect(config.routes.some((route) => route.route === '/demo*')).toBe(false);
    expect((config as typeof config & { navigationFallback?: unknown }).navigationFallback).toBeUndefined();
    expect((config as typeof config & { mimeTypes: Record<string, string> }).mimeTypes['.webmanifest']).toBe('application/manifest+json');
  });

  it('keeps the PWA cache and every built footer on the package version', () => {
    const packageData = JSON.parse(readFileSync(resolve('package.json'), 'utf8')) as { version: string };
    const serviceWorker = readFileSync(resolve('public/sw.js'), 'utf8');
    const manifest = JSON.parse(readFileSync(resolve('public/manifest.webmanifest'), 'utf8')) as { start_url: string };
    const patchVersion = packageData.version.split('.').at(-1);

    expect(serviceWorker).toContain(`const VERSION = 'cuebook-v${packageData.version}'`);
    expect(manifest.start_url).toBe(`/?v=${patchVersion}`);
    for (const path of ['404.html', 'privacy/index.html', 'terms/index.html']) {
      const html = readFileSync(resolve(path), 'utf8');
      expect(html).toContain('Built by Param Factory · v__APP_VERSION__');
      expect(html).not.toMatch(/Built by Param Factory · v\d/);
    }
    expect(readFileSync(resolve('src/main.ts'), 'utf8')).toContain('Built by Param Factory · v${__APP_VERSION__}');
  });
});
