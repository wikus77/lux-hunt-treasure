// M1SSION™ Service Worker - Unified & Minimal
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// ATTENZIONE: file unico. Niente importScripts, niente Workbox.

console.log('🔧 M1SSION™ Service Worker loading...');

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  // Attiva immediatamente senza aspettare
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker activating...');
  // Prendi controllo senza distruggere storage
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('✅ Service Worker activated and controlling all pages');
    })
  );
});

// Update controllato dal main thread
self.addEventListener('message', (event) => {
  console.log('📨 SW Message received:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING' && self.skipWaiting) {
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

console.log('✅ M1SSION™ Service Worker loaded successfully');