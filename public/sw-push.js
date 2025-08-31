// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push VAPID Handler for iOS PWA */

self.addEventListener('install', () => self.skipWaiting?.());
self.addEventListener('activate', e => e.waitUntil?.(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  const notificationId = Math.random().toString(36).substring(2, 8);
  
  try { 
    data = event.data?.json() || {}; 
  } catch (e) {
    console.warn(`[SW-PUSH:${notificationId}] Failed to parse push data:`, e);
  }
  
  const title = data.title || 'M1SSION™';
  const body = data.body || 'Push notification received';
  const url = (data.data && data.data.url) || '/';
  const icon = '/icons/icon-192x192.png';
  const badge = '/icons/icon-96x96.png';
  
  const options = {
    body,
    icon,
    badge,
    data: { url, notificationId },
    requireInteraction: false,
    vibrate: [200, 100, 200],
    tag: `m1ssion-${Date.now()}`
  };
  
  console.log(`[SW-PUSH:${notificationId}] Showing notification:`, title, options);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log(`[SW-PUSH:${notificationId}] Notification displayed successfully`);
      })
      .catch(error => {
        console.error(`[SW-PUSH:${notificationId}] Failed to show notification:`, error);
      })
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