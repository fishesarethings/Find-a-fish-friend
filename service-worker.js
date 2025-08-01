const CACHE_NAME = 'fishfriend-cache-v1';
const ASSETS = [
  '/', '/index.html',
  '/assets/styles.css', '/assets/app.js', '/assets/idb.js',
  // list your icons & fish assets or use a dynamic fetch handler
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(r => r || fetch(evt.request))
  );
});

// Receive message to cache-all (you can expand to scan all links)
self.addEventListener('message', evt => {
  if(evt.data.action === 'cache-all'){
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS));
  }
});
