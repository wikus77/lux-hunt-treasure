// © 2025 M1SSION™ - Service Worker for Push Notifications
// Version 2.1 - W3C Standard Implementation

console.log('🚀 M1SSION™ Service Worker v2.1 loading...');

// Force update on new version
self.addEventListener('install', (event) => {
  console.log('✅ SW Install: M1SSION™ Service Worker v2.1 installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ SW Activate: M1SSION™ Service Worker v2.1 activated');
  event.waitUntil(clients.claim());
});

// Minimal push event handler (testable and reliable)
self.addEventListener('push', (event) => {
  console.log('📨 SW Push event received:', event);
  
  let data = {};
  try { 
    data = event.data?.json() ?? {}; 
  } catch (error) { 
    console.warn('⚠️ SW Push data parse failed, using defaults:', error);
    data = {}; 
  }
  
  const title = data.title || 'M1SSION™';
  const options = { 
    body: data.body || 'Nuova notifica M1SSION™', 
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data || { url: '/' }
  };
  
  console.log('🔔 SW Showing notification:', { title, options });
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('👆 SW Notification clicked:', event.notification);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message handler (for skipWaiting triggers)
self.addEventListener('message', (event) => {
  console.log('💬 SW Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ M1SSION™ Service Worker v2.1 ready!');