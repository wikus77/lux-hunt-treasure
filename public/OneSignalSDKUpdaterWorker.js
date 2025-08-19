// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// OneSignal SDK Updater Worker - CRITICAL iOS PWA Push Notifications
// Optimized for Cloudflare Pages deployment

importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js');

// CRITICAL iOS PWA: Enhanced updater logging
console.log('🔄 CRITICAL iOS PWA: OneSignal SDK Updater Worker initialized for M1SSION™', {
  timestamp: new Date().toISOString(),
  scope: self.location.href,
  origin: self.location.origin,
  userAgent: navigator.userAgent || 'unknown'
});

// Handle service worker updates with iOS PWA optimization
self.addEventListener('message', function(event) {
  console.log('🔄 CRITICAL iOS PWA: Updater received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 CRITICAL iOS PWA: Skipping waiting and activating new service worker');
    self.skipWaiting();
  }
});

// Handle activation with enhanced iOS PWA support
self.addEventListener('activate', function(event) {
  console.log('✅ CRITICAL iOS PWA: OneSignal SDK Updater Worker activated');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('✅ CRITICAL iOS PWA: OneSignal SDK Updater claimed all clients');
    })
  );
});

// iOS PWA specific install handling
self.addEventListener('install', function(event) {
  console.log('🔄 CRITICAL iOS PWA: OneSignal SDK Updater installing...');
  self.skipWaiting();
});

// Enhanced error handling for iOS PWA
self.addEventListener('error', function(event) {
  console.error('🚨 CRITICAL iOS PWA: OneSignal SDK Updater Worker error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString()
  });
});

// CRITICAL iOS PWA: Handle fetch events for notification resources
self.addEventListener('fetch', function(event) {
  // Only handle OneSignal related requests
  if (event.request.url.includes('onesignal') || event.request.url.includes('push')) {
    console.log('🔄 CRITICAL iOS PWA: OneSignal fetch intercepted:', event.request.url);
  }
});