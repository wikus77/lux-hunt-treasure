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
messaging.setBackgroundMessageHandler(async (payload) => {
  console.log('[M1SSION SW] Background message received:', payload);
  
  const notificationTitle = (payload.notification && payload.notification.title) || 
                           payload.data?.title || 
                           'M1SSION™';
                           
  const notificationBody = (payload.notification && payload.notification.body) || 
                          payload.data?.body || 
                          'Nuova notifica disponibile';

  const notificationOptions = {
    body: notificationBody,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: payload.data || {},
    requireInteraction: true,
    tag: 'm1ssion-notification'
  };

  console.log('[M1SSION SW] Showing notification:', notificationTitle, notificationOptions);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION SW] Notification clicked:', event.notification);
  
  event.notification.close();
  
  const targetUrl = (event.notification.data && event.notification.data.link) || 
                   'https://m1ssion.eu/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        console.log('[M1SSION SW] Looking for existing client for URL:', targetUrl);
        
        // Look for existing window with the target URL
        for (const client of clientList) {
          if (client.url.startsWith(targetUrl) && 'focus' in client) {
            console.log('[M1SSION SW] Focusing existing client:', client.url);
            return client.focus();
          }
        }
        
        // No existing window found, open new one
        console.log('[M1SSION SW] Opening new window for URL:', targetUrl);
        return clients.openWindow(targetUrl);
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