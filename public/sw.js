// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// M1SSION™ Unified Service Worker with Push Support
// SW VERSION: push-2025-01-02T06:40:00.000Z

self.__SW_VERSION = 'push-2025-01-02T06:40:00.000Z';
console.log('[M1SSION SW] Unified SW starting, version:', self.__SW_VERSION);

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

// Note: Install/activate events are defined below with push handlers

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

// =============================================================================
// PUSH NOTIFICATION HANDLERS (UNIFIED - NO IMPORTSCRIPTS)
// =============================================================================

// Push event handler - receives notifications
self.addEventListener('push', (event) => {
  console.log('[M1SSION SW] Push received:', event);
  
  event.waitUntil(
    (async () => {
      try {
        let notificationData;
        
        // Parse notification data
        if (event.data) {
          try {
            notificationData = event.data.json();
          } catch (e) {
            notificationData = { title: 'M1SSION™', body: event.data.text() };
          }
        } else {
          notificationData = { title: 'M1SSION™', body: 'New notification' };
        }
        
        // Set defaults
        const title = notificationData.title || 'M1SSION™';
        const options = {
          body: notificationData.body || 'New notification available',
          icon: notificationData.icon || '/icons/icon-192x192.png',
          badge: notificationData.badge || '/icons/icon-96x96.png',
          data: notificationData.data || { url: '/' },
          vibrate: notificationData.vibrate || [200, 100, 200],
          requireInteraction: true,
          actions: notificationData.actions || []
        };
        
        console.log('[M1SSION SW] Showing notification:', title, options);
        
        // Show notification
        await self.registration.showNotification(title, options);
        
      } catch (error) {
        console.error('[M1SSION SW] Push notification error:', error);
        // Fallback notification
        await self.registration.showNotification('M1SSION™', {
          body: 'New notification received',
          icon: '/icons/icon-192x192.png'
        });
      }
    })()
  );
});

// Notification click handler - handles user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION SW] Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    (async () => {
      try {
        const data = event.notification.data || {};
        const url = data.url || '/';
        
        console.log('[M1SSION SW] Opening URL:', url);
        
        // Get all windows
        const windowClients = await clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });
        
        // Check if there's already a window/tab open with the target URL
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            console.log('[M1SSION SW] Focusing existing window');
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          console.log('[M1SSION SW] Opening new window');
          return clients.openWindow(url);
        }
        
      } catch (error) {
        console.error('[M1SSION SW] Notification click error:', error);
        // Fallback: try to open main page
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      }
    })()
  );
});

// Enhanced install event with proper versioning
self.addEventListener('install', (event) => {
  console.log('[M1SSION SW] Installing version:', self.__SW_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[M1SSION SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[M1SSION SW] Cache complete, force activating...');
        return self.skipWaiting(); // Force activation
      })
      .catch(error => {
        console.warn('[M1SSION SW] Cache install failed (non-critical):', error);
        return self.skipWaiting(); // Still proceed
      })
  );
});

// Enhanced activate event with proper client claiming
self.addEventListener('activate', (event) => {
  console.log('[M1SSION SW] Activating version:', self.__SW_VERSION);
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[M1SSION SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[M1SSION SW] Activation complete, controlling all clients');
    }).catch(error => {
      console.warn('[M1SSION SW] Activation issues (non-critical):', error);
      return self.clients.claim(); // Still claim clients
    })
  );
});

console.log('[M1SSION SW] Unified Service Worker setup complete with integrated push support');