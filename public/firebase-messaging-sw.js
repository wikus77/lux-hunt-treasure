/* M1SSION™ – Firebase Messaging SW (compat v8) - FIXED */
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Import config inline to avoid fetch issues
const firebaseConfig = {
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
};

try {
  // Initialize Firebase in Service Worker
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  
  console.log('[M1SSION SW] ✅ Firebase initialized successfully');
  
  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[M1SSION SW] Background message received:', payload);
    
    const notificationTitle = payload.notification?.title || 'M1SSION™';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: payload.data || {},
      tag: 'm1ssion-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Apri App'
        },
        {
          action: 'close',
          title: 'Chiudi'
        }
      ]
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
  
} catch (error) {
  console.error('[M1SSION SW] ❌ Firebase initialization failed:', error);
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data?.link || 'https://m1ssion.eu';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if available
      for (const client of clientList) {
        if (client.url.includes('m1ssion.eu') && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new tab if none found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle activation
self.addEventListener('activate', (event) => {
  console.log('[M1SSION SW] ✅ Service Worker activated');
});

console.log('[M1SSION SW] ✅ Service Worker loaded');

// © 2025 M1SSION™