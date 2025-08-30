// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push VAPID Handler for iOS PWA */

self.addEventListener('install', () => self.skipWaiting?.());
self.addEventListener('activate', e => e.waitUntil?.(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { 
    data = event.data?.json() || {}; 
  } catch (e) {
    console.warn('[SW-PUSH] Failed to parse push data:', e);
  }
  
  const title = data.title || 'M1SSION';
  const body = data.body || 'Push di test';
  const url = (data.data && data.data.url) || '/';
  const icon = '/icons/icon-192.png';
  const badge = '/icons/badge-72.png';
  
  const options = {
    body,
    icon,
    badge,
    data: { url },
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };
  
  console.log('[SW-PUSH] Showing notification:', title, options);
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW-PUSH] Notification clicked:', event.notification);
  event.notification.close();
  
  const url = (event.notification.data && event.notification.data.url) || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Try to focus existing window
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) {
          console.log('[SW-PUSH] Focusing existing client');
          return client.focus();
        }
      }
      // Open new window
      console.log('[SW-PUSH] Opening new window for URL:', url);
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('[SW-PUSH] Web Push VAPID handler loaded');