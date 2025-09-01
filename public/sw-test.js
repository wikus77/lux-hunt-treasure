// M1SSION™ Service Worker Test - iOS Push Support
// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ

console.log('[SW-TEST] 🚀 M1SSION™ Test Service Worker loaded');

// Force immediate activation
self.addEventListener('install', event => {
  console.log('[SW-TEST] ⚙️ Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW-TEST] ✅ Activated and claiming clients');
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', event => {
  console.log('[SW-TEST] 📨 Push received:', event);
  
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.warn('[SW-TEST] ⚠️ Push data not JSON:', error);
    data = {
      title: 'M1SSION™ Test',
      body: event.data ? event.data.text() : 'Test notification'
    };
  }
  
  const notificationOptions = {
    body: data.body || 'iOS Safari push test successful!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: data.data || { url: '/ios-check.html' },
    tag: 'm1ssion-test',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Open M1SSION™' }
    ]
  };
  
  console.log('[SW-TEST] 🔔 Showing notification:', data.title || 'M1SSION™ Test');
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'M1SSION™ Test',
      notificationOptions
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW-TEST] 👆 Notification clicked:', event.action);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/ios-check.html';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Try to focus existing window
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

console.log('[SW-TEST] ✅ All event listeners registered');