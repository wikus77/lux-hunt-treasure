// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ PWA Service Worker - Unified Web Push + Caching
// sw-bump-20251007-vapid-unified

const CACHE_NAME = 'm1ssion-v1';
const STATIC_CACHE = 'm1ssion-static-v1';

// Precache critical resources
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - precache critical resources
self.addEventListener('install', (event) => {
  console.log('[M1SSION SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[M1SSION SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('[M1SSION SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[M1SSION SW] Claiming clients...');
      return self.clients.claim();
    })
  );
});

// Fetch event - NetworkFirst strategy for dynamic content
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip non-http requests (chrome-extension, etc.)
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // If network succeeds, update cache and return response
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then(response => {
          if (response) {
            return response;
          }
          // Return offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Push event - handle Web Push notifications
self.addEventListener('push', (event) => {
  console.log('[M1SSION SW] 📬 Push received:', event);
  
  const options = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'm1ssion-notification',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200], // Haptic pattern
    data: {}
  };

  let title = 'M1SSION™';
  let body = 'Hai un nuovo aggiornamento';
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[M1SSION SW] 📦 Parsed payload:', payload);
      
      title = payload.title || title;
      body = payload.body || payload.message || body;
      options.data = payload.data || {};
      
      if (payload.icon) options.icon = payload.icon;
      if (payload.image) options.image = payload.image;
      if (payload.tag) options.tag = payload.tag;
      if (payload.url) options.data.url = payload.url;
      
    } catch (e) {
      console.warn('[M1SSION SW] Failed to parse push data, using text fallback:', e);
      body = event.data.text() || body;
    }
  }

  options.body = body;

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('[M1SSION SW] ✅ Notification shown:', title);
      })
      .catch(err => {
        console.error('[M1SSION SW] ❌ Failed to show notification:', err);
      })
  );
});

// Notification click event - handle deep linking
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION SW] 🖱️ Notification clicked:', event.notification);
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';
  const fullUrl = new URL(targetUrl, self.location.origin).href;
  
  console.log('[M1SSION SW] 🔗 Opening URL:', fullUrl);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then(clientList => {
      // Check if app is already open and focus it
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin)) {
          console.log('[M1SSION SW] ↗️ Focusing existing window');
          return client.focus().then(() => {
            // Navigate to target URL if supported
            if ('navigate' in client) {
              return client.navigate(fullUrl);
            }
          });
        }
      }
      // Otherwise open new window
      console.log('[M1SSION SW] 🆕 Opening new window');
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
    .catch(err => {
      console.error('[M1SSION SW] ❌ Error handling notification click:', err);
    })
  );
});

console.log('[M1SSION SW] ✅ Service Worker loaded successfully');
