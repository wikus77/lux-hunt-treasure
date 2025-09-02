// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// M1SSION™ Service Worker - Web Push W3C Compliant
// sw-push-ver: 2025-09-02T07:30Z

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
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch (error) {
    console.warn('[M1SSION SW] Failed to parse push data:', error);
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'M1SSION™', {
      body: data.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data.data || {}
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

// Fetch event handler - simplified to avoid respondWith(null) errors
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests except Supabase
  if (url.origin !== location.origin && !url.hostname.includes('supabase.co')) {
    return;
  }

  // Only handle specific static assets and Supabase requests
  if (STATIC_ASSETS.includes(url.pathname)) {
    // Cache First for static assets
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
          // Return a basic response if all else fails
          return new Response('Offline', { status: 503 });
        })
    );
  } else if (url.hostname.includes('supabase.co')) {
    // Network First for Supabase API
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request) || new Response('Offline', { status: 503 });
        })
    );
  }
});

console.log('[M1SSION SW] ✅ Service Worker v2.1.0 loaded with Web Push support - sw-push-ver: 2025-09-02T07:30Z');