const VERSION = 'cuebook-v1.0.6';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const CORE = ['/', '/demo/', '/offline.html', '/manifest.webmanifest', '/assets/cue-landscape.webp', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(CORE);
    try {
      const response = await fetch('/');
      const html = await response.clone().text();
      const paths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
      await cache.addAll([...new Set(paths)]);
    } catch { /* Core fallback is still cached. */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => !name.startsWith(VERSION)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        const cache = await caches.open(RUNTIME);
        cache.put(event.request, response.clone());
        return response;
      } catch {
        return (await caches.match(event.request)) || (await caches.match('/')) || caches.match('/offline.html');
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) (await caches.open(RUNTIME)).put(event.request, response.clone());
      return response;
    } catch {
      return new Response('', { status: 503, statusText: 'Offline' });
    }
  })());
});
