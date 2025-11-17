// sw-bump-2025-10-15-02
// M1SSION™ PWA Service Worker - Unified Web Push + Caching + S-W-R
// © 2025 Joseph MULÉ – NIYVORA KFT™

const SW_VERSION = '2.1.0'; // Semantic versioning for update detection
const CACHE_NAME = 'm1ssion-v2.1';
const STATIC_CACHE = 'm1ssion-static-v2.1';
const ASSET_CACHE = 'm1ssion-assets-v2.1'; // S-W-R cache

// Precache critical resources
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html'
];

// Enable Navigation Preload if supported
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
});

// Install event - precache critical resources + immediate activation
self.addEventListener('install', (event) => {
  console.log('[M1SSION SW] Installing v2...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_RESOURCES))
      .then(() => self.skipWaiting()) // Take control immediately
  );
});

// Activate event - cleanup old caches, claim clients, notify update
self.addEventListener('activate', (event) => {
  console.log(`[M1SSION SW] Activating v${SW_VERSION}...`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all([
        // Delete old caches
        ...cacheNames.filter(name => 
          name !== CACHE_NAME && name !== STATIC_CACHE && name !== ASSET_CACHE
        ).map(name => {
          console.log('[M1SSION SW] Deleting old cache:', name);
          return caches.delete(name);
        }),
        // Claim all clients immediately
        self.clients.claim(),
        // Notify all clients about update available
        self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            console.log('[M1SSION SW] Notifying client about update');
            client.postMessage({ 
              type: 'M1_SW_UPDATE_AVAILABLE',
              version: SW_VERSION
            });
          });
        })
      ]);
    })
  );
});

// Fetch event - NetworkFirst with S-W-R for static assets + offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only GET requests
  const isGET = request.method === 'GET';
  const isHTML = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
  
  // Exclude critical endpoints (Supabase - NEVER cache these)
  const isSupabase = url.hostname.endsWith('.supabase.co');
  const isSupabaseRest = url.pathname.startsWith('/rest/v1');
  const isSupabaseAuth = url.pathname.startsWith('/auth/v1');
  const isSupabaseFunctions = url.pathname.startsWith('/functions/v1');
  const isEdgeFunctions = url.pathname.startsWith('/functions/v1');
  const isServiceWorker = url.pathname === '/sw.js';
  const isVapid = url.pathname === '/vapid-public.txt';
  
  // Identify static assets for S-W-R strategy
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/.test(url.pathname) ||
                        url.pathname.startsWith('/assets/');
  
  // Skip non-GET or non-http requests, and NEVER cache Supabase
  if (!isGET || !request.url.startsWith('http') || isSupabase || isSupabaseRest || isSupabaseAuth || isSupabaseFunctions) return;
  
  // S-W-R: Static assets - CacheFirst with background revalidate
  if (isStaticAsset && !isServiceWorker && !isVapid) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        
        // Fetch in background and update cache
        const fetchPromise = fetch(request).then(response => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(ASSET_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
            
            // Notify clients about asset update
            self.clients.matchAll({ type: 'window' }).then(clients => {
              clients.forEach(client => {
                client.postMessage({ 
                  type: 'M1_ASSET_UPDATED',
                  url: request.url
                });
              });
            });
          }
          return response;
        }).catch(() => null);
        
        // Return cached version immediately if available, otherwise wait for network
        return cached || fetchPromise || new Response('Asset not available', { status: 503 });
      })()
    );
    return;
  }

  // Handle HTML navigation with offline fallback
  if (isHTML && !isEdgeFunctions && !isServiceWorker && !isVapid) {
    event.respondWith(
      (async () => {
        try {
          // Try network first for fresh content
          return await fetch(request, { cache: 'no-store' });
        } catch {
          // If offline, return offline.html
          const cached = await caches.match('/offline.html');
          if (cached) return cached;
          // Ultimate fallback
          return new Response('<h1>Offline</h1>', { 
            headers: { 'Content-Type': 'text/html' }, 
            status: 503 
          });
        }
      })()
    );
    return;
  }

  // Default NetworkFirst strategy for other resources (non-asset, non-HTML)
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

// Message event - handle SKIP_WAITING from update prompt
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[M1SSION SW] ⏭️ SKIP_WAITING received, activating new SW...');
    self.skipWaiting();
  }
});

console.log(`[M1SSION SW] ✅ Service Worker v${SW_VERSION} loaded successfully`);

// sw-bump-1759826182
// bump 2025-11-16T06:05:07Z
// bump 2025-11-16T06:16:53Z
// bump 2025-11-16T06:23:34Z
