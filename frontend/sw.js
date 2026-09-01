const CACHE_NAME = 'ndelies-enterprise-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/config.js',
  '/js/api.js',
  '/js/state.js',
  '/js/auth.js',
  '/js/ui.js',
  '/js/theme.js',
  '/js/dashboard.js',
  '/js/inventory.js',
  '/js/sales.js',
  '/js/staff.js',
  '/js/notifications.js',
  '/js/reports.js',
  '/js/settings.js',
  '/assets/logo.jpg',
  '/assets/watermark.jpg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/manifest.json'
];

// Install: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network (cache-first for static, network-first for API)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for API calls
  if (url.pathname.startsWith('/api') || url.hostname.includes('onrender.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache successful GET responses for static assets
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
