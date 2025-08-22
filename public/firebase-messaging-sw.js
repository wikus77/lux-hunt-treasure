// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJVONKmBJEzKnfwZOHAE3BmTy8Q9X3L5k",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.appspot.com",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('🔥 FCM Background Message received:', payload);

  const notificationTitle = payload.notification?.title || 'M1SSION™';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuova notifica da M1SSION™',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'm1ssion-notification',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Apri App'
      },
      {
        action: 'dismiss',
        title: 'Chiudi'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('🔥 FCM Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(function(clientList) {
        // Try to focus an existing M1SSION™ window
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('m1ssion') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window, open new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

console.log('🔥 M1SSION™ FCM Service Worker loaded successfully');