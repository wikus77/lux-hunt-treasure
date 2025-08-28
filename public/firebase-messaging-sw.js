/* M1SSION™ FCM Service Worker (Firebase v8 Compat) */
console.log('[M1SSION SW] Loading Firebase v8 compat scripts...');

importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

console.log('[M1SSION SW] Firebase scripts loaded, initializing app...');

// Firebase configuration - matches /firebase-init.js
const firebaseConfig = {
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('[M1SSION SW] Firebase app initialized, setting up message handlers...');

// Background message handler
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[M1SSION SW] Background message received:', payload);
  
  const title = (payload.notification && payload.notification.title) ||
                (payload.data && payload.data.title) || 'M1SSION';
  const body  = (payload.notification && payload.notification.body) ||
                (payload.data && payload.data.body) || '';
  const link  = (payload.fcmOptions && payload.fcmOptions.link) ||
                (payload.data && payload.data.link) || 'https://m1ssion.eu/';
  
  const options = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { link }
  };
  
  console.log('[M1SSION SW] Showing notification:', title, options);
  return self.registration.showNotification(title, options);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION SW] Notification clicked:', event.notification);
  
  const url = (event.notification && event.notification.data && event.notification.data.link) || 'https://m1ssion.eu/';
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      console.log('[M1SSION SW] Looking for existing client for URL:', url);
      
      for (const c of list) { 
        if (c.url === url && 'focus' in c) {
          console.log('[M1SSION SW] Focusing existing client:', c.url);
          return c.focus(); 
        }
      }
      
      console.log('[M1SSION SW] Opening new window for URL:', url);
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('[M1SSION SW] Service Worker activated');
});

self.addEventListener('install', (event) => {
  console.log('[M1SSION SW] Service Worker installed');
  self.skipWaiting();
});

console.log('[M1SSION SW] Service Worker setup complete');