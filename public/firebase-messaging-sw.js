/* M1SSION™ – Firebase Messaging SW (compat) */
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
importScripts('/firebase-init.js');

if (self.__FIREBASE_CFG__) {
  firebase.initializeApp(self.__FIREBASE_CFG__);
  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    console.log('[M1SSION SW] Background message received:', payload);
    
    const title = payload.notification?.title || 'M1SSION';
    const options = {
      body: payload.notification?.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: payload.data || {},
      tag: 'm1ssion-notification',
      requireInteraction: true
    };
    
    self.registration.showNotification(title, options);
  });
  
  console.log('[M1SSION SW] Firebase Messaging initialized');
} else {
  console.error('[M1SSION SW] Firebase config not available');
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION SW] Notification clicked:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.link || 'https://m1ssion.eu';
  
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

// © 2025 M1SSION™