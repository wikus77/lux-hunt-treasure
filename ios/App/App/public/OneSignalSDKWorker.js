// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// OneSignal Service Worker - CRITICAL iOS PWA Push Notifications
// Optimized for Cloudflare Pages deployment

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js');

// CRITICAL iOS PWA: Enhanced initialization logging
console.log('🔔 CRITICAL iOS PWA: OneSignal Service Worker initialized for M1SSION™', {
  timestamp: new Date().toISOString(),
  scope: self.location.href,
  origin: self.location.origin,
  userAgent: navigator.userAgent || 'unknown'
});

// iOS PWA specific configuration
self.addEventListener('install', function(event) {
  console.log('🔔 CRITICAL iOS PWA: OneSignal SW installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('🔔 CRITICAL iOS PWA: OneSignal SW activated');
  event.waitUntil(self.clients.claim());
});

// CRITICAL iOS PWA: Enhanced notification click handling
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 CRITICAL iOS PWA: Notification clicked:', {
    title: event.notification.title,
    body: event.notification.body,
    data: event.notification.data,
    tag: event.notification.tag,
    timestamp: new Date().toISOString()
  });
  
  // Close the notification
  event.notification.close();
  
  // Enhanced window focus/open logic for iOS PWA
  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then(function(clients) {
      console.log('🔔 CRITICAL iOS PWA: Found clients:', clients.length);
      
      // Try to focus existing client first
      for (let client of clients) {
        if (client.url.includes(self.location.origin)) {
          console.log('🔔 CRITICAL iOS PWA: Focusing existing client:', client.url);
          if ('focus' in client) {
            return client.focus();
          }
          return client.navigate(event.notification.data?.url || '/');
        }
      }
      
      // Open new window if no existing client
      console.log('🔔 CRITICAL iOS PWA: Opening new window');
      if (self.clients.openWindow) {
        const targetUrl = event.notification.data?.url || '/?source=push_notification';
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// CRITICAL iOS PWA: Handle notification received in background
self.addEventListener('push', function(event) {
  console.log('🔔 CRITICAL iOS PWA: Push event received:', {
    data: event.data ? event.data.text() : 'No data',
    timestamp: new Date().toISOString()
  });
});

// Handle background sync
self.addEventListener('sync', function(event) {
  console.log('🔄 CRITICAL iOS PWA: OneSignal background sync:', event.tag);
});

// Enhanced error handling with iOS PWA specific logging
self.addEventListener('error', function(event) {
  console.error('🚨 CRITICAL iOS PWA: OneSignal Service Worker error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString()
  });
});

// CRITICAL iOS PWA: Handle message events from main thread
self.addEventListener('message', function(event) {
  console.log('🔔 CRITICAL iOS PWA: Service Worker message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 CRITICAL iOS PWA: Skipping waiting and activating new service worker');
    self.skipWaiting();
  }
});