/* M1SSION™ Firebase Cloud Messaging Service Worker */

// Import Firebase scripts (compat version for Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// M1SSION Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95"
};

// Initialize Firebase in Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log('[M1SSION SW] Service Worker initialized with config:', firebaseConfig.projectId);

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('[M1SSION SW] Background message received:', payload);

  // Extract notification data
  const title = payload.notification?.title || payload.data?.title || 'M1SSION™';
  const body = payload.notification?.body || payload.data?.body || 'New notification';
  
  const notificationOptions = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'mission-notification',
    data: payload.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ],
    requireInteraction: true
  };

  console.log('[M1SSION SW] Showing notification:', { title, ...notificationOptions });
  
  // Show notification
  return self.registration.showNotification(title, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[M1SSION SW] Notification clicked:', event.notification.data);
  
  // Close the notification
  event.notification.close();
  
  // Determine target URL
  const targetUrl = event.notification.data?.screen || '/';
  const fullUrl = new URL(targetUrl, self.location.origin).href;
  
  console.log('[M1SSION SW] Opening URL:', fullUrl);
  
  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          console.log('[M1SSION SW] Focusing existing window and navigating');
          client.focus();
          return client.navigate(fullUrl);
        }
      }
      
      // No existing window, open a new one
      console.log('[M1SSION SW] Opening new window');
      return clients.openWindow(fullUrl);
    })
  );
});

// Service Worker lifecycle events
self.addEventListener('install', (event) => {
  console.log('[M1SSION SW] Installing...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[M1SSION SW] Activating...');
  // Claim all clients immediately
  event.waitUntil(clients.claim());
});

// Handle push events (fallback)
self.addEventListener('push', (event) => {
  console.log('[M1SSION SW] Push event received:', event.data?.text());
  
  if (event.data) {
    try {
      const payload = event.data.json();
      const title = payload.title || 'M1SSION™';
      const options = {
        body: payload.body || 'New notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data || {}
      };
      
      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (error) {
      console.error('[M1SSION SW] Error parsing push data:', error);
    }
  }
});

console.log('[M1SSION SW] Service Worker script loaded successfully');