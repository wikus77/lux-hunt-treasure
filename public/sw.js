// M1SSION™ Service Worker - Enhanced with Caching
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// MANTIENE importScripts per push chain blindata

// VINCOLO: importScripts per catena push (NON RIMUOVERE)
importScripts('sw-push.js');

const CACHE_NAME = 'm1ssion-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately (EXCLUDE index.html to prevent white-screen)
const STATIC_ASSETS = [
  '/offline.html',
  '/favicon.ico',
  '/manifest.json'
];

const DEBUG_SW = typeof self !== 'undefined' && 
  (self.location?.search?.includes('qa=1') || false);

const log = (message, data) => {
  if (DEBUG_SW || !self.registration?.scope?.includes('https://')) {
    console.log(`🔧 SW: ${message}`, data || '');
  }
};

log('M1SSION™ Service Worker loading...');

self.addEventListener('install', (event) => {
  log('Service Worker installing...');
  
  // Pre-cache critical assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        log('Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        log('Pre-cache failed', error);
      })
      .finally(() => {
        // Attiva immediatamente senza aspettare
        self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  log('Service Worker activating...');
  
  event.waitUntil(
    // Clean up old caches
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              log('Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Prendi controllo senza distruggere storage
        return self.clients.claim();
      })
      .then(() => {
        log('Service Worker activated and controlling all pages');
      })
  );
});

// Update controllato dal main thread
self.addEventListener('message', (event) => {
  console.log('📨 SW Message received:', event.data);
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.type === 'SW_SKIP_WAITING') && self.skipWaiting) {
    console.log('🔄 SW: Skipping waiting and activating');
    self.skipWaiting();
  }
});

// Push "tick" (no payload) compatibile con Safari/APNs
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received:', event);
  
  let data = {};
  try { 
    data = event.data ? event.data.json() : {}; 
  } catch (error) {
    console.warn('⚠️ Could not parse push data as JSON:', error);
  }
  
  const title = data.title || 'M1SSION™';
  const body = data.body || 'Hai un nuovo aggiornamento';
  const screen = (data.data && data.data.screen) || '/';
  
  console.log('📢 Showing notification:', { title, body, screen });
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { screen },
      badge: '/favicon.ico',
      icon: '/favicon.ico',
      tag: 'm1ssion-notification'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  const url = (event.notification.data && event.notification.data.screen) || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // Try to focus existing window
        for (const client of clients) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window if none found
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
        return Promise.resolve();
      })
  );
});

// CRITICAL FIX: Enable navigation preload for faster first paint
if ('navigationPreload' in self.registration) {
  self.registration.navigationPreload.enable();
}

// NetworkFirst strategy for ALL navigation requests - ELIMINATES WHITE SCREEN
const navHandler = async (event) => {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Network-first with 10s timeout for navigation requests
    const networkResponse = await Promise.race([
      fetch(event.request, { cache: 'no-cache' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 10000))
    ]);
    
    if (networkResponse.ok) {
      // Cache the fresh index.html for offline fallback
      cache.put(event.request, networkResponse.clone());
      log('Fresh index.html served from network and cached');
    }
    return networkResponse;
  } catch (error) {
    log('Network failed, trying cache fallback:', error.message);
    // Fallback to cached version, then offline page
    const cachedResponse = await cache.match(event.request) || 
                          await cache.match(OFFLINE_URL) || 
                          await cache.match('/');
    
    return cachedResponse || new Response('Offline - Please check connection', { status: 503 });
  }
};

// Fetch handler with enhanced caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') return;
  
  // Skip cache for API calls and dynamic content
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/functions/') ||
      url.hostname.includes('supabase.co') ||
      url.hostname.includes('stripe.com')) {
    return;
  }
  
  // NetworkFirst for ALL navigation requests (index.html) - ANTI WHITE-SCREEN
  if (request.mode === 'navigate') {
    event.respondWith(navHandler(event));
    return;
  }
  
  // Stale-while-revalidate for static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          const fetchPromise = fetch(request).then(networkResponse => {
            // Update cache with fresh content
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
          
          // Return cached version immediately, update in background
          return response || fetchPromise;
        });
      })
    );
  }
});

log('M1SSION™ Service Worker loaded successfully');