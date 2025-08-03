// © 2025 Joseph MULÉ – M1SSION™ – Firebase Messaging Service Worker
// iOS PWA Compatible Push Notifications

importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC71GUysMmPq8m3ZkUHvBYTDCRUaAo3mio",
  authDomain: "project-x-mission.firebaseapp.com",
  projectId: "project-x-mission",
  storageBucket: "project-x-mission.appspot.com",
  messagingSenderId: "307707487376",
  appId: "1:307707487376:web:29a6c9f3a5ff3caf82cabc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages - iOS compatible
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 M1SSION™ - Background message received:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'M1SSION™';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nuova notifica disponibile',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: {
      url: payload.data?.url || '/notifications',
      ...payload.data
    },
    tag: 'mission-notification',
    requireInteraction: true, // iOS compatibility
    silent: false,
    dir: 'ltr',
    lang: 'it',
    vibrate: [200, 100, 200], // iOS doesn't support vibrate, but won't error
    actions: [
      {
        action: 'open',
        title: 'Apri M1SSION™',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  console.log('🔔 Showing notification:', notificationTitle, notificationOptions);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click - iOS compatible
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 M1SSION™ - Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/notifications';
  console.log('🔔 Opening URL:', urlToOpen);
  
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      console.log('🔔 Found clients:', clientList.length);
      
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('🔔 Focusing existing client and navigating to:', urlToOpen);
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      
      // Open new window if app not open
      if (self.clients.openWindow) {
        console.log('🔔 Opening new window:', urlToOpen);
        return self.clients.openWindow(urlToOpen);
      }
    }).catch((error) => {
      console.error('🔔 Error handling notification click:', error);
    })
  );
});

console.log('🔥 M1SSION™ Firebase Messaging Service Worker loaded');