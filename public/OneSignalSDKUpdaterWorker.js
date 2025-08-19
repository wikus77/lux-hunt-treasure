// OneSignal SDK Updater Worker - Required for OneSignal Updates
// © 2025 Joseph MULÉ – M1SSION™ – PWA Push Integration

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js');

// Enhanced logging for debugging
console.log('🔄 OneSignal SDK Updater Worker initialized for M1SSION™ PWA');

// Handle service worker updates
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 OneSignal: Skipping waiting and activating new service worker');
    self.skipWaiting();
  }
});

// Handle activation
self.addEventListener('activate', function(event) {
  console.log('✅ OneSignal SDK Updater Worker activated');
  event.waitUntil(self.clients.claim());
});

// Enhanced error handling
self.addEventListener('error', function(event) {
  console.error('🚨 OneSignal SDK Updater Worker error:', event);
});