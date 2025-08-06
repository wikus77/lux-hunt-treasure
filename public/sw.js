// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Service Worker for M1SSION™ PWA

const CACHE_NAME = 'mission-v2.0.0';
const STATIC_CACHE = 'mission-static-v2.0.0';
const DYNAMIC_CACHE = 'mission-dynamic-v2.0.0';

const STATIC_ASSETS = [
  '/',
  '/home',
  '/map',
  '/profile',
  '/subscriptions',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const DYNAMIC_ASSETS = [
  'https://js.stripe.com/v3/',
  'https://vkjrqirvdvjbemsfzxof.supabase.co'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin && !DYNAMIC_ASSETS.some(asset => url.href.includes(asset))) {
    return;
  }

  // Cache strategy: Cache First for static assets, Network First for API calls
  if (STATIC_ASSETS.includes(url.pathname)) {
    // Cache First strategy for static assets
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
            .then((fetchResponse) => {
              return caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
    );
  } else if (url.hostname.includes('supabase.co') || url.pathname.includes('/api/')) {
    // Network First strategy for API calls
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
  } else {
    // Stale While Revalidate for other resources
    event.respondWith(
      caches.match(request)
        .then((response) => {
          const fetchPromise = fetch(request)
            .then((fetchResponse) => {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone());
                });
              return fetchResponse;
            });
          
          return response || fetchPromise;
        })
    );
  }
});

// Background sync for failed payments
self.addEventListener('sync', (event) => {
  if (event.tag === 'payment-retry') {
    event.waitUntil(
      // Retry failed payment requests
      self.registration.showNotification('M1SSION™', {
        body: 'Retrying failed payment...',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      })
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nuova notifica da M1SSION™',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Apri App'
        },
        {
          action: 'close',
          title: 'Chiudi'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'M1SSION™', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});