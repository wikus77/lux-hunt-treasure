// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// M1SSION™ Firebase Cloud Messaging Service Worker - Enhanced

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

console.log('🔥 M1SSION™ FCM Service Worker loading...');

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
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully in Service Worker');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

// Retrieve firebase messaging
const messaging = firebase.messaging();
console.log('🔥 Firebase Messaging initialized in Service Worker');

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('🔥 FCM Background Message received:', payload);
  console.log('🔥 FCM SW-TRACE: Processing background notification', {
    title: payload.notification?.title,
    body: payload.notification?.body,
    data: payload.data,
    timestamp: new Date().toISOString()
  });

  const notificationTitle = payload.notification?.title || '🔥 M1SSION™';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuova notifica da M1SSION™',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'm1ssion-notification',
    data: payload.data || {},
    requireInteraction: true, // Force user interaction
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Apri App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Chiudi'
      }
    ]
  };

  console.log('🔥 FCM SW-TRACE: Showing notification with options:', notificationOptions);

  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log('✅ FCM SW-TRACE: Notification displayed successfully');
    })
    .catch((error) => {
      console.error('❌ FCM SW-TRACE: Failed to show notification:', error);
    });
});

// Handle notification click events
self.addEventListener('notificationclick', function(event) {
  console.log('🔥 FCM Notification clicked:', event);
  console.log('🔥 FCM SW-TRACE: Notification click data:', {
    action: event.action,
    data: event.notification.data,
    tag: event.notification.tag
  });
  
  event.notification.close();

  if (event.action === 'dismiss') {
    console.log('🔥 FCM SW-TRACE: Notification dismissed by user');
    return;
  }

  if (event.action === 'open' || !event.action) {
    console.log('🔥 FCM SW-TRACE: Opening app...');
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        console.log('🔥 FCM SW-TRACE: Found clients:', clientList.length);
        
        // Try to focus an existing M1SSION™ window
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          console.log('🔥 FCM SW-TRACE: Checking client:', client.url);
          
          if ((client.url.includes('m1ssion') || client.url.includes('lovable')) && 'focus' in client) {
            console.log('✅ FCM SW-TRACE: Focusing existing window');
            return client.focus();
          }
        }
        
        // If no existing window, open new one
        if (clients.openWindow) {
          console.log('🔥 FCM SW-TRACE: Opening new window');
          return clients.openWindow('/');
        }
      }).catch(error => {
        console.error('❌ FCM SW-TRACE: Error handling click:', error);
      })
    );
  }
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('🔥 M1SSION™ FCM Service Worker installing...');
  self.skipWaiting(); // Force immediate activation
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('🔥 M1SSION™ FCM Service Worker activated');
  event.waitUntil(self.clients.claim()); // Take control of all pages immediately
});

// Test notification handler for debugging
self.addEventListener('message', function(event) {
  console.log('🔥 FCM SW-TRACE: Message received from main thread:', event.data);
  
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    console.log('🔥 FCM SW-TRACE: Creating test notification...');
    
    self.registration.showNotification('🔥 M1SSION™ Test SW', {
      body: 'Service Worker funzionante! ' + new Date().toLocaleTimeString(),
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'test-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200]
    }).then(() => {
      console.log('✅ FCM SW-TRACE: Test notification shown successfully');
    }).catch(error => {
      console.error('❌ FCM SW-TRACE: Test notification failed:', error);
    });
  }
});

console.log('✅ M1SSION™ FCM Service Worker loaded successfully with enhanced debugging');

// Additional debugging: Check if service worker is controlling pages
self.addEventListener('fetch', function(event) {
  // Just log that SW is active - don't intercept requests
  if (event.request.url.includes('/firebase-notification-debug')) {
    console.log('🔥 FCM SW-TRACE: Service Worker is controlling debug page');
  }
});