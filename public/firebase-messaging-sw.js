// property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.
/* FIREBASE CLOUD MESSAGING SERVICE WORKER - PWA CROSS-BROWSER */

console.log('🔥 M1SSION Firebase SW loaded');

// Import Firebase scripts using the correct M1SSION™ config
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// M1SSION™ Firebase Configuration - UNIFIED
const firebaseConfig = {
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

// Gestisci messaggi in background (Firebase compat + cross-browser)
messaging.onBackgroundMessage(function(payload) {
  console.log('🔥 FCM Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'M1SSION™';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nuova notifica',
    icon: payload.notification?.icon || '/icons/192.png',
    badge: '/icons/192.png',
    tag: 'mission-notification',
    silent: false,
    requireInteraction: false,
    data: {
      screen: payload.data?.screen || payload.data?.url || payload.notification?.click_action || '/',
      action: payload.data?.action || 'open',
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

// Gestisci click sulla notifica (cross-browser compatible)
self.addEventListener('notificationclick', function(event) {
  console.log('🔥 FCM Notification clicked:', event);
  
  event.notification.close();
  
  const targetUrl = event.notification.data?.screen || 
                   event.notification.data?.url || 
                   '/';
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Cerca una finestra M1SSION già aperta
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            const clientUrl = new URL(client.url);
            
            // Se trova M1SSION già aperto, naviga e focalizza
            if (clientUrl.hostname === self.location.hostname && 'focus' in client) {
              if ('navigate' in client && targetUrl !== '/') {
                client.navigate(targetUrl);
              }
              return client.focus();
            }
          }
          
          // Altrimenti apri una nuova finestra
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
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