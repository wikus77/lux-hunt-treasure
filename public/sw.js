// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// M1SSION™ Service Worker - Web Push W3C Compliant
// sw-push-ver: 2025-09-02T080000Z

const CACHE_NAME = 'mission-v2.1.0';
const STATIC_CACHE = 'mission-static-v2.1.0';
const DYNAMIC_CACHE = 'mission-dynamic-v2.1.0';

const STATIC_ASSETS = [
  '/',
  '/home',
  '/map',
  '/profile',
  '/subscriptions',
  '/manifest.json',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[M1SSION SW] Installing v2.1.0 with Web Push support...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[M1SSION SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[M1SSION SW] Installation complete, skipping waiting...');
        return self.skipWaiting();
      })
      .catch(error => {
        console.warn('[M1SSION SW] Cache install failed (non-critical):', error);
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[M1SSION SW] Activating v2.1.0...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[M1SSION SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[M1SSION SW] Activation complete, claiming clients...');
      return self.clients.claim();
    }).catch(error => {
      console.warn('[M1SSION SW] Cache cleanup failed (non-critical):', error);
      return self.clients.claim();
    })
  );
});

// Push event handler - W3C Web Push  
self.addEventListener('push', (event) => {
  const data = (() => { 
    try { 
      return event.data?.json() ?? {}; 
    } catch { 
      return {}; 
    }
  })();
  
  const title = data.title || 'M1SSION';
  const body = data.body || '';
  const options = { 
    body, 
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data || {} 
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = '/';
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(list => {
      const c = list.find(w => w.url.includes(url));
      return c ? c.focus() : clients.openWindow(url);
    })
  );
});

// Fetch event handler - only handle specific requests, always return Response
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests except Supabase - NEVER respondWith null
  if (url.origin !== location.origin && !url.hostname.includes('supabase.co')) {
    return; // Let browser handle normally
  }

  // Only handle specific static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse && fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            });
        })
        .catch(() => {
          return new Response('Offline', { status: 503 });
        })
    );
  }
});

console.log('[M1SSION SW] ✅ Service Worker v2.1.0 loaded with Web Push support - sw-push-ver: 2025-09-02T080000Z');