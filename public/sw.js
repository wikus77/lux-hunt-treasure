// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// M1SSION™ Enhanced Service Worker with Push Support

// Import push notifications handler first
try {
  importScripts("/sw-push.js");
  console.log('[M1SSION SW] Push handler imported successfully');
} catch (error) {
  console.warn('[M1SSION SW] Push handler import failed (non-critical):', error);
}

// Cache configuration
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

// Override install/activate events with caching
self.addEventListener('install', (event) => {
  console.log('[M1SSION SW] Installing with cache...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[M1SSION SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[M1SSION SW] Cache complete, skipping waiting...');
        return self.skipWaiting();
      })
      .catch(error => {
        console.warn('[M1SSION SW] Cache install failed (non-critical):', error);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[M1SSION SW] Activating with cleanup...');
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
      console.log('[M1SSION SW] Cache cleanup complete, claiming clients...');
      return self.clients.claim();
    }).catch(error => {
      console.warn('[M1SSION SW] Cache cleanup failed (non-critical):', error);
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

// Push handlers are imported from sw-push.js
console.log('[M1SSION SW] Service Worker setup complete with push support');