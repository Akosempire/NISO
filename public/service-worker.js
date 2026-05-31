// public/service-worker.js
// NISO Progressive Web App — Offline Support + Background Sync

const CACHE_NAME = 'niso-v1';
const API_CACHE = 'niso-api-v1';
const ASSET_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(ASSET_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API requests → Network-first, fallback to cache/IndexedDB
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(API_CACHE).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed → try cache
          return caches.match(event.request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Cache miss → return offline placeholder
            return new Response(
              JSON.stringify({
                offline: true,
                message: 'Data unavailable offline'
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Static assets → Cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'basic') {
          return response;
        }
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
        });
        return response;
      });
    })
  );
});

// Background sync — Retry failed readings when reconnected
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-readings') {
    event.waitUntil(
      (async () => {
        try {
          const db = await openDB('niso');
          const tx = db.transaction('pending_readings', 'readonly');
          const readings = await tx.store.getAll();

          for (const reading of readings) {
            const res = await fetch('/api/readings/bulk-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify([reading])
            });

            if (res.ok) {
              const tx2 = db.transaction('pending_readings', 'readwrite');
              await tx2.store.delete(reading.id);
            }
          }

          // Notify all clients of sync completion
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({ type: 'SYNC_COMPLETE', count: readings.length });
          });
        } catch (err) {
          console.error('[SW] Sync failed:', err);
        }
      })()
    );
  }
});

// Push notifications — For critical alerts
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.message || 'New alert from NISO',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'niso-alert',
    requireInteraction: data.severity === 'critical'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'NISO Alert', options)
  );
});

// Notification click — Open app or navigate to alert
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL('/', self.location).href;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('[SW] Service Worker loaded');
