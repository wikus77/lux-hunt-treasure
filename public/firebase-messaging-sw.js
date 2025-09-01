// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* FIREBASE CLOUD MESSAGING SERVICE WORKER */

console.log('🔥 M1SSION Firebase SW loaded');

// Import Firebase scripts using the correct M1SSION™ config
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');
importScripts('/firebase-init.js');

// Use M1SSION™ configuration from firebase-init.js
const firebaseConfig = self.__FIREBASE_CFG__ || {
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);

// Ottieni l'istanza messaging
const messaging = firebase.messaging();

// Gestisci messaggi in background (Firebase v10 compat)
messaging.onBackgroundMessage(function(payload) {
  console.log('🔥 FCM Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'M1SSION™';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nuova notifica',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'mission-notification',
    data: {
      url: payload.data?.url || payload.notification?.click_action || '/',
      ...payload.data
    },
    actions: [
      {
        action: 'open',
        title: 'Apri M1SSION'
      }
    ]
  };

  console.log('🔥 FCM Showing notification:', notificationTitle, notificationOptions);
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestisci click sulla notifica
self.addEventListener('notificationclick', function(event) {
  console.log('🔥 FCM Notification clicked:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Se c'è già una finestra aperta, focusala
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url.includes(new URL(url).pathname) && 'focus' in client) {
              return client.focus();
            }
          }
          // Altrimenti apri una nuova finestra
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Gestisci installazione SW
self.addEventListener('install', function(event) {
  console.log('🔥 FCM SW installed');
  self.skipWaiting();
});

// Gestisci attivazione SW
self.addEventListener('activate', function(event) {
  console.log('🔥 FCM SW activated');
  event.waitUntil(self.clients.claim());
});

console.log('🔥 M1SSION Firebase SW setup complete');