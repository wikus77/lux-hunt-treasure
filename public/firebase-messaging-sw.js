// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtqKHgzs4gJ4jdK7bvKXe8fM9g7LpV5Yw",
  authDomain: "m1ssion-treasure-hunt.firebaseapp.com",
  projectId: "m1ssion-treasure-hunt",
  storageBucket: "m1ssion-treasure-hunt.appspot.com",
  messagingSenderId: "307707487376",
  appId: "1:307707487376:web:8ef2f8f4a5b4e1c2d3e4f5"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('M1SSION™ Background Message:', payload);
  
  const notificationTitle = payload.notification?.title || 'M1SSION™';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuova attività disponibile!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'm1ssion-notification',
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.data?.url || '/',
      ...payload.data
    },
    actions: [
      {
        action: 'open',
        title: 'Apri M1SSION™',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Ignora'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('M1SSION™ Notification Click:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If M1SSION™ is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('m1ssion') && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      
      // Open new M1SSION™ window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Push event handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  console.log('M1SSION™ Push Event:', data);
  
  const options = {
    body: data.body || 'Nuova attività M1SSION™',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'm1ssion-push',
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'M1SSION™', options)
  );
});