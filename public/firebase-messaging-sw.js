/* M1SSION™ AG-X0197 */
// Firebase Cloud Messaging Service Worker (Compat Mode)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
importScripts('/firebase-init.js');

try {
  // Initialize Firebase with global config
  if (self.__FIREBASE_CFG__) {
    firebase.initializeApp(self.__FIREBASE_CFG__);
    const messaging = firebase.messaging();
    
    // Handle background messages
    messaging.onBackgroundMessage((payload) => {
      console.log('[M1SSION FCM SW] Background message received:', payload);
      
      const notification = payload.notification || {};
      const data = payload.data || {};
      
      const notificationTitle = notification.title || data.title || 'M1SSION';
      const notificationOptions = {
        body: notification.body || data.body || 'Nuova notifica dall\'app',
        icon: notification.icon || data.icon || '/icons/icon-m1-192x192.png',
        badge: notification.badge || data.badge || '/icons/icon-m1-192x192.png',
        data: data,
        tag: 'm1ssion-notification',
        requireInteraction: true
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
    });
    
    console.log('[M1SSION FCM SW] Service Worker initialized successfully');
  } else {
    console.error('[M1SSION FCM SW] Firebase config not available');
  }
} catch (error) {
  console.error('[M1SSION FCM SW] Initialization error:', error);
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION FCM SW] Notification click received:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.click_action || 'https://m1ssion.eu';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new tab if none found
      return clients.openWindow(url);
    })
  );
});