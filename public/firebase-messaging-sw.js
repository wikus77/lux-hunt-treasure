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
    image: '/icons/icon-192x192.png', // iOS PWA large image
    data: {
      url: payload.data?.url || '/notifications',
      click_action: payload.data?.url || '/notifications',
      ...payload.data
    },
    tag: 'mission-notification',
    requireInteraction: true, // iOS lock screen compatibility
    silent: false,
    renotify: true, // iOS notification update
    timestamp: Date.now(),
    dir: 'ltr',
    lang: 'it',
    actions: [
      {
        action: 'open',
        title: 'Apri M1SSION™',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Chiudi',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  console.log('🔔 Showing notification:', notificationTitle, notificationOptions);
  
  // Force notification to appear even on iOS lock screen
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle push events directly (fallback for iOS)
self.addEventListener('push', (event) => {
  console.log('🔔 Direct push event received:', event);
  
  if (!event.data) {
    console.log('🔔 No data in push event');
    return;
  }
  
  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    console.log('🔔 Push event data is not JSON, treating as text');
    payload = { notification: { title: 'M1SSION™', body: event.data.text() || 'Nuova notifica' } };
  }
  
  console.log('🔔 Push payload:', payload);
  
  const notificationTitle = payload.notification?.title || payload.title || 'M1SSION™';
  const notificationOptions = {
    body: payload.notification?.body || payload.body || 'Nuova notifica disponibile',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    image: '/icons/icon-192x192.png',
    data: {
      url: payload.data?.url || payload.url || '/notifications',
      click_action: payload.data?.url || payload.url || '/notifications',
      ...payload.data
    },
    tag: 'mission-notification',
    requireInteraction: true,
    silent: false,
    renotify: true,
    timestamp: Date.now(),
    dir: 'ltr',
    lang: 'it',
    actions: [
      {
        action: 'open',
        title: 'Apri M1SSION™',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
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