// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
// Firebase Cloud Messaging Service Worker

// Import Firebase scripts for compat mode
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

console.log('🔥 M1SSION™ FCM Service Worker loading...');

// Firebase configuration - CONFIGURAZIONE REALE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDt7BJ9kV8Jm9aH3GbS6kL4fP2eR9xW7qZ",
  authDomain: "lux-hunt-treasure.firebaseapp.com", 
  projectId: "lux-hunt-treasure",
  storageBucket: "lux-hunt-treasure.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:1a2b3c4d5e6f7g8h9i0j1k2l"
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

// Handle background messages - ENHANCED
messaging.onBackgroundMessage(function(payload) {
  console.log('🔥 FCM Background Message received:', payload);
  
  const notificationTitle = payload.notification?.title || '🔥 M1SSION™';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuova notifica da M1SSION™',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'm1ssion-notification',
    data: payload.data || {},
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Apri M1SSION™',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Chiudi'
      }
    ]
  };

  console.log('🔥 FCM SW: Showing notification with options:', notificationOptions);

  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log('✅ FCM SW: Notification displayed successfully');
    })
    .catch((error) => {
      console.error('❌ FCM SW: Failed to show notification:', error);
    });
});

// Handle notification click events with click_action support
self.addEventListener('notificationclick', function(event) {
  console.log('🔥 FCM Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    console.log('🔥 FCM SW: Notification dismissed by user');
    return;
  }

  if (event.action === 'open' || !event.action) {
    // Get click_action from notification data
    const clickAction = event.notification.data?.click_action || '/';
    console.log('🔥 FCM SW: Opening URL:', clickAction);
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        console.log('🔥 FCM SW: Found clients:', clientList.length);
        
        // Try to focus an existing window with same origin
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          
          if ('focus' in client) {
            console.log('✅ FCM SW: Focusing existing window and navigating to:', clickAction);
            return client.focus().then(() => {
              if ('navigate' in client) {
                return client.navigate(clickAction);
              }
              return client;
            });
          }
        }
        
        // If no existing window, open new one with click_action URL
        if (clients.openWindow) {
          console.log('🔥 FCM SW: Opening new window with URL:', clickAction);
          return clients.openWindow(clickAction);
        }
      }).catch(error => {
        console.error('❌ FCM SW: Error handling click:', error);
      })
    );
  }
});

// Handle service worker installation - OPTIMIZED
self.addEventListener('install', function(event) {
  console.log('🔥 M1SSION™ FCM Service Worker installing...');
  self.skipWaiting(); // Force immediate activation
});

// Handle service worker activation - OPTIMIZED  
self.addEventListener('activate', function(event) {
  console.log('🔥 M1SSION™ FCM Service Worker activated');
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control immediately
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.includes('fcm') || cacheName.includes('firebase'))
            .map(cacheName => caches.delete(cacheName))
        );
      })
    ])
  );
});

// Enhanced test notification handler for debugging
self.addEventListener('message', function(event) {
  console.log('🔥 FCM SW: Message received from main thread:', event.data);
  
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    console.log('🔥 FCM SW: Creating test notification...');
    
    const testTitle = event.data.title || '🔥 M1SSION™ Test SW';
    const testBody = event.data.body || 'Service Worker funzionante! ' + new Date().toLocaleTimeString();
    
    self.registration.showNotification(testTitle, {
      body: testBody,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'test-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        testId: event.data.testId,
        source: event.data.source || 'debug_panel'
      },
      actions: [
        {
          action: 'open',
          title: 'Apri M1SSION™'
        },
        {
          action: 'dismiss', 
          title: 'Chiudi'
        }
      ]
    }).then(() => {
      console.log('✅ FCM SW: Test notification shown successfully');
      
      // Send success message back to main thread
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'TEST_NOTIFICATION_SUCCESS',
          testId: event.data.testId
        });
      }
    }).catch(error => {
      console.error('❌ FCM SW: Test notification failed:', error);
      
      // Send error message back to main thread
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'TEST_NOTIFICATION_ERROR',
          testId: event.data.testId,
          error: error.message
        });
      }
    });
  }
});

console.log('✅ M1SSION™ FCM Service Worker loaded successfully with enhanced debugging');

// Additional debugging: Monitor service worker activity
self.addEventListener('fetch', function(event) {
  // Log SW activity for debug page only 
  if (event.request.url.includes('/firebase-notification-debug')) {
    console.log('🔥 FCM SW: Service Worker is controlling debug page');
  }
});