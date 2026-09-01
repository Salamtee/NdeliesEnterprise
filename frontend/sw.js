const CACHE_NAME = 'ndelies-enterprise-v4';
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

// Install: pre-cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: immediately evict ALL old caches so stale CSS/JS is never served
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//   API calls  -> always network (never cached)
//   Images     -> cache-first  (they rarely change)
//   HTML/CSS/JS -> network-first so every deployment reaches users immediately
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for API / backend calls
  if (url.pathname.startsWith('/api') || url.hostname.includes('onrender.com')) {
    return;
  }

  const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(url.pathname);

  if (isImage) {
    // Cache-first for images
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      }).catch(() => caches.match('/assets/logo.jpg'))
    );
  } else {
    // Network-first for HTML / CSS / JS
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request).then(c => c || caches.match('/index.html')))
    );
  }
});
