/**
 * M1SSION™ Push Handler - Robust push event handling for Safari + Chrome
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

console.log('🔔 SW-Push module loaded');

// Robust push event handler
self.addEventListener('push', (event) => {
  console.log('📢 Push event received:', event);
  
  event.waitUntil((async () => {
    let data = {};
    
    try {
      // Try to parse as JSON first
      if (event.data) {
        const text = event.data.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            // Fallback: treat as text notification
            data = { 
              title: 'M1SSION™', 
              body: text, 
              targetUrl: '/' 
            };
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not parse push data:', error);
      data = {
        title: 'M1SSION™',
        body: 'Hai un nuovo aggiornamento',
        targetUrl: '/'
      };
    }
    
    // Extract notification data with fallbacks
    const title = data.title || 'M1SSION™';
    const body = data.body || 'Hai un nuovo aggiornamento';
    const targetUrl = data.targetUrl || data.url || data.data?.url || '/';
    
    console.log('📢 Showing notification:', { title, body, targetUrl });
    
    // Show notification
    await self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      data: { targetUrl },
      tag: 'm1ssion-push',
      requireInteraction: false
    });
  })());
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();
  
  const targetUrl = event.notification.data?.targetUrl || '/';
  
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