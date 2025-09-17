// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Versioned App Service Worker Template
// This gets copied to sw-app-<buildId>.js during build

const CACHE_NAME = 'm1ssion-app-v__BUILD_ID__';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW-APP] Installing app SW:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW-APP] Activating app SW:', CACHE_NAME);
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('m1ssion-app-') && cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW-APP] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Message handler for skip waiting
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip API calls and dynamic content
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/functions/') ||
      url.hostname.includes('supabase.co') ||
      url.hostname.includes('stripe.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Cache successful responses for static assets
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html') || 
                     new Response('Offline', { status: 503 });
            }
            throw new Error('Network request failed');
          });
      })
  );
});
