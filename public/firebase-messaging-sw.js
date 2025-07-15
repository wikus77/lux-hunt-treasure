
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// Firebase Cloud Messaging Service Worker

// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyC71GUysMmPq8m3ZkUHvBYTDCRUaAo3mio",
  authDomain: "project-x-mission.firebaseapp.com",
  projectId: "project-x-mission",
  storageBucket: "project-x-mission.appspot.com",
  messagingSenderId: "307707487376",
  appId: "1:307707487376:web:29a6c9f3a5ff3caf82cabc"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'Nuova notifica';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/assets/m1ssion/icon-192.png', // Your app icon
    badge: '/assets/m1ssion/icon-192.png', // Optional badge
    data: payload.data,
    actions: payload.notification.actions || []
  };
  
  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// When notification is clicked, handle the action
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click', event);
  
  event.notification.close();
  
  // This looks to see if the current window is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
