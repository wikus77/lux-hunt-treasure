/*
 * M1SSION™ Service Worker for Push Notifications
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

console.log('[SW-PUSH] Service Worker loaded');

// Push event handler
self.addEventListener('push', function(event) {
  console.log('[SW-PUSH] Push event received');
  
  let data;
  
  if (event.data) {
    try {
      // Try to parse as JSON first
      data = event.data.json();
      console.log('[SW-PUSH] Push data (JSON):', data);
    } catch (error) {
      // Fallback to text
      try {
        const text = event.data.text();
        data = { title: 'M1SSION', body: text || 'Hai un nuovo aggiornamento', url: '/' };
        console.log('[SW-PUSH] Push data (text):', data);
      } catch (textError) {
        // Final fallback
        data = { title: 'M1SSION', body: 'Hai un nuovo aggiornamento', url: '/' };
        console.log('[SW-PUSH] Push data (fallback):', data);
      }
    }
  } else {
    // No data fallback
    data = { title: 'M1SSION', body: 'Hai un nuovo aggiornamento', url: '/' };
    console.log('[SW-PUSH] No push data, using fallback');
  }

  const notificationPromise = self.registration.showNotification(data.title || 'M1SSION', {
    body: data.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    data: { url: data.url || '/' },
    requireInteraction: false,
    silent: false
  });

  event.waitUntil(notificationPromise);
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('[SW-PUSH] Notification click received');
  
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Try to find existing window with same origin
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);
        const targetUrlObj = new URL(targetUrl, self.location.origin);
        
        if (clientUrl.origin === targetUrlObj.origin) {
          // Focus existing window and navigate
          return client.focus().then(() => {
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
          });
        }
      }
      
      // Open new window if no existing window found
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }).catch(function(error) {
      console.error('[SW-PUSH] Error handling notification click:', error);
    })
  );
});

console.log('[SW-PUSH] Event listeners registered');