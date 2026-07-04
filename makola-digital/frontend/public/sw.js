const CACHE_NAME = 'makola-digital-v3';
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('railway.app')) return;
  if (event.request.url.includes('cloudinary.com')) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Makola Digital';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
