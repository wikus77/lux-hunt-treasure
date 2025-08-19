// OneSignal Service Worker - Required for OneSignal Push Notifications
// © 2025 Joseph MULÉ – M1SSION™ – PWA Push Integration

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js');

// Enhanced logging for debugging
console.log('🔔 OneSignal Service Worker initialized for M1SSION™ PWA');

// Handle push notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 OneSignal notification clicked:', event);
  
  // Close the notification
  event.notification.close();
  
  // Focus or open app window
  event.waitUntil(
    self.clients.matchAll().then(function(clients) {
      // If app is already open, focus it
      for (let client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle background sync
self.addEventListener('sync', function(event) {
  console.log('🔄 OneSignal background sync:', event.tag);
});

// Enhanced error handling
self.addEventListener('error', function(event) {
  console.error('🚨 OneSignal Service Worker error:', event);
});
