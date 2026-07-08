/* Service worker: precache the app shell, then serve stale-while-revalidate
   so the app opens instantly (and offline) but still picks up deploys. */

const CACHE = 'bos-tracker-v5.2.0';
const SHELL = [
  './',
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/data.js',
  'js/utils.js',
  'js/store.js',
  'js/stats.js',
  'js/components/today.js',
  'js/components/schedule.js',
  'js/components/reports.js',
  'js/components/coach.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  /* Only same-origin GETs; API calls (Gemini/Claude) always hit the network. */
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(e.request);
      const refresh = fetch(e.request)
        .then((res) => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
