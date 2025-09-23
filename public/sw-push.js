/**
 * M1SSION™ Push Handler - Robust push event handling for Safari + Chrome
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

console.log('🔔 SW-Push module loaded');

// Robust push event handler
self.addEventListener('push', (event) => {
  console.log('📢 Push event received:', event);
  
  event.waitUntil((async () => {
    let notificationData = {
      title: 'M1SSION™',
      body: 'Hai un nuovo aggiornamento',
      url: '/'
    };
    
    try {
      if (event.data) {
        const text = event.data.text();
        if (text) {
          try {
            // Try to parse as JSON first
            const data = JSON.parse(text);
            notificationData = {
              title: data.title || notificationData.title,
              body: data.body || notificationData.body,
              url: data.url || data.targetUrl || data.data?.url || notificationData.url
            };
          } catch {
            // Fallback: treat as text notification
            notificationData.body = text;
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not parse push data:', error);
    }
    
    console.log('📢 Showing notification:', notificationData);
    
    // Show notification
    await self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      data: { url: notificationData.url },
      tag: 'm1ssion-push',
      requireInteraction: false
    });
  })());
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(clientList => {
      // Try to focus existing window and navigate
      const existingClient = clientList.find(client => 
        client.url.includes(self.location.origin)
      );
      
      if (existingClient && 'focus' in existingClient) {
        if ('navigate' in existingClient) {
          existingClient.navigate(targetUrl);
        }
        return existingClient.focus();
      }
      
      // Open new window if no existing client
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      
      return Promise.resolve();
    }).catch(error => {
      console.error('❌ Error handling notification click:', error);
    })
  );
});

console.log('✅ SW-Push handlers registered');