// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* M1SSION™ Universal Push Service Worker (iOS PWA + Desktop Compatible) */

console.log('[M1SSION SW] Starting universal push service worker...');

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[M1SSION SW] Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('install', (event) => {
  console.log('[M1SSION SW] Service Worker installed');
  self.skipWaiting();
});

// Universal push message handler (works for both VAPID and FCM)
self.addEventListener('push', (event) => {
  console.log('[M1SSION SW] Push message received:', event);
  
  let title = 'M1SSION™';
  let body = '';
  let link = 'https://m1ssion.eu/';
  let icon = '/icons/icon-192.png';
  let badge = '/icons/badge-72.png';
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[M1SSION SW] Push data:', data);
      
      // Handle FCM format
      if (data.notification) {
        title = data.notification.title || title;
        body = data.notification.body || body;
        link = data.fcmOptions?.link || data.data?.link || link;
      }
      // Handle direct VAPID format
      else if (data.title) {
        title = data.title;
        body = data.body || body;
        link = data.link || link;
      }
      // Handle nested data format
      else if (data.data) {
        title = data.data.title || title;
        body = data.data.body || body;
        link = data.data.link || link;
      }
    } catch (error) {
      console.warn('[M1SSION SW] Error parsing push data:', error);
      body = event.data.text() || 'Nuova notifica';
    }
  }
  
  const options = {
    body,
    icon,
    badge,
    data: { link },
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };
  
  console.log('[M1SSION SW] Showing notification:', title, options);
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION SW] Notification clicked:', event.notification);
  
  const url = (event.notification?.data?.link) || 'https://m1ssion.eu/';
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      console.log('[M1SSION SW] Looking for existing client for URL:', url);
      
      // Try to focus existing window
      for (const client of list) { 
        if (client.url === url && 'focus' in client) {
          console.log('[M1SSION SW] Focusing existing client:', client.url);
          return client.focus(); 
        }
      }
      
      // Open new window
      console.log('[M1SSION SW] Opening new window for URL:', url);
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('[M1SSION SW] Universal push service worker setup complete');