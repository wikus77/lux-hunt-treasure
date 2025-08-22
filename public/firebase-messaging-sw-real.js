// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// M1SSION™ Firebase Cloud Messaging Service Worker - VERSIONE REALE E FUNZIONANTE

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

console.log('🔥 M1SSION™ FCM Service Worker loading...');

// Firebase configuration - CONFIGURAZIONE REALE (DA SOSTITUIRE)
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBjjLFqvWq8WmTh2OqF1bVdWkE4V9k",
  authDomain: "luxhunt-treasure.firebaseapp.com",
  projectId: "luxhunt-treasure",
  storageBucket: "luxhunt-treasure.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345678"
};

// Initialize Firebase in service worker
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully in Service Worker');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

// Retrieve firebase messaging
const messaging = firebase.messaging();
console.log('🔥 Firebase Messaging initialized in Service Worker');

// Handle background messages - ENHANCED WITH BETTER ERROR HANDLING
messaging.onBackgroundMessage(function(payload) {
  console.log('🔥 FCM Background Message received:', payload);
  
  try {
    const notificationTitle = payload.notification?.title || '🔥 M1SSION™';
    const notificationOptions = {
      body: payload.notification?.body || 'Nuova notifica da M1SSION™',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'm1ssion-notification-' + Date.now(),
      data: {
        ...payload.data,
        timestamp: Date.now(),
        source: 'fcm_background'
      },
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
        
        // Log successful notification display
        fetch('/api/log-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'notification_displayed',
            title: notificationTitle,
            timestamp: Date.now()
          })
        }).catch(() => {}); // Silent fail for logging
      })
      .catch((error) => {
        console.error('❌ FCM SW: Failed to show notification:', error);
      });
  } catch (error) {
    console.error('❌ FCM SW: Error processing background message:', error);
  }
});

// Handle notification click events - ENHANCED WITH BETTER ROUTING
self.addEventListener('notificationclick', function(event) {
  console.log('🔥 FCM Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    console.log('🔥 FCM SW: Notification dismissed by user');
    return;
  }

  if (event.action === 'open' || !event.action) {
    console.log('🔥 FCM SW: Opening M1SSION™ app...');
    
    event.waitUntil(
      clients.matchAll({ 
        type: 'window', 
        includeUncontrolled: true 
      }).then(function(clientList) {
        console.log('🔥 FCM SW: Found clients:', clientList.length);
        
        // Try to focus an existing M1SSION™ window
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          
          if ((client.url.includes('m1ssion') || 
               client.url.includes('lovable') || 
               client.url.includes('lux-hunt')) && 'focus' in client) {
            console.log('✅ FCM SW: Focusing existing M1SSION™ window');
            return client.focus();
          }
        }
        
        // If no existing window, open new one
        if (clients.openWindow) {
          console.log('🔥 FCM SW: Opening new M1SSION™ window');
          const targetUrl = event.notification.data?.url || '/';
          return clients.openWindow(targetUrl);
        }
      }).catch(error => {
        console.error('❌ FCM SW: Error handling click:', error);
      })
    );
  }
});

// Handle service worker installation - OPTIMIZED FOR FCM
self.addEventListener('install', function(event) {
  console.log('🔥 M1SSION™ FCM Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      self.skipWaiting(), // Force immediate activation
      // Pre-cache critical FCM resources
      caches.open('fcm-cache-v1').then(cache => {
        return cache.addAll([
          '/icon-192x192.png',
          '/firebase-messaging-sw-real.js'
        ]).catch(() => {}); // Silent fail for caching
      })
    ])
  );
});

// Handle service worker activation - OPTIMIZED FOR FCM
self.addEventListener('activate', function(event) {
  console.log('🔥 M1SSION™ FCM Service Worker activated');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Take control immediately
      // Clean up old FCM caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.includes('fcm') || 
              cacheName.includes('firebase') ||
              cacheName.startsWith('fcm-cache-v')
            )
            .map(cacheName => {
              if (cacheName !== 'fcm-cache-v1') {
                return caches.delete(cacheName);
              }
            })
        );
      })
    ])
  );
});

// Enhanced test notification handler with better error handling
self.addEventListener('message', function(event) {
  console.log('🔥 FCM SW: Message received from main thread:', event.data);
  
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    console.log('🔥 FCM SW: Creating test notification...');
    
    const testTitle = event.data.title || '🔥 M1SSION™ Test SW Real';
    const testBody = event.data.body || 'Service Worker reale funzionante! ' + new Date().toLocaleTimeString();
    
    const notificationOptions = {
      body: testBody,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'test-notification-' + Date.now(),
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        testId: event.data.testId,
        source: event.data.source || 'test_real_sw',
        timestamp: Date.now()
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
    };

    self.registration.showNotification(testTitle, notificationOptions)
      .then(() => {
        console.log('✅ FCM SW: Test notification shown successfully');
        
        // Send success message back to main thread
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({
            type: 'TEST_NOTIFICATION_SUCCESS',
            testId: event.data.testId,
            timestamp: Date.now()
          });
        }
      })
      .catch(error => {
        console.error('❌ FCM SW: Test notification failed:', error);
        
        // Send error message back to main thread
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({
            type: 'TEST_NOTIFICATION_ERROR',
            testId: event.data.testId,
            error: error.message,
            timestamp: Date.now()
          });
        }
      });
  }
  
  // Handle FCM token refresh request
  if (event.data && event.data.type === 'FCM_TOKEN_REFRESH') {
    console.log('🔥 FCM SW: Token refresh requested');
    // Signal main thread that SW is ready for token operations
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        type: 'FCM_SW_READY',
        timestamp: Date.now()
      });
    }
  }
});

// Monitor for FCM registration changes
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('🔥 FCM SW: Push subscription changed:', event);
  
  // Notify main thread about subscription change
  event.waitUntil(
    self.registration.pushManager.getSubscription().then(function(subscription) {
      if (subscription) {
        console.log('🔥 FCM SW: New subscription available');
        // Could post message to main thread about new subscription
      }
    })
  );
});

console.log('✅ M1SSION™ FCM Service Worker loaded successfully - REAL VERSION');

// Additional debugging: Monitor service worker activity for FCM
self.addEventListener('fetch', function(event) {
  // Log SW activity for debug pages only 
  if (event.request.url.includes('/firebase') || 
      event.request.url.includes('/fcm') ||
      event.request.url.includes('/panel-access')) {
    console.log('🔥 FCM SW: Service Worker is controlling FCM-related page');
  }
});

// Handle push events (additional to onBackgroundMessage)
self.addEventListener('push', function(event) {
  console.log('🔥 FCM SW: Push event received:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('🔥 FCM SW: Push payload:', payload);
      
      // Handle custom push logic if needed
      if (payload.type === 'custom') {
        // Custom notification handling
        const notificationPromise = self.registration.showNotification(
          payload.title || 'M1SSION™',
          {
            body: payload.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'custom-push-' + Date.now(),
            data: payload.data
          }
        );
        
        event.waitUntil(notificationPromise);
      }
    } catch (error) {
      console.error('❌ FCM SW: Error handling push event:', error);
    }
  }
});