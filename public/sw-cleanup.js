// © 2025 M1SSION™ - Service Worker Cleanup Script
// This script cleans up any old OneSignal service workers

console.log('🧹 M1SSION™ SW Cleanup starting...');

// Unregister any existing service workers (especially OneSignal)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('🧹 Found', registrations.length, 'service worker registrations');
    
    for(let registration of registrations) {
      console.log('🧹 Unregistering SW:', registration.scope);
      registration.unregister().then(function(success) {
        if (success) {
          console.log('✅ SW unregistered:', registration.scope);
        } else {
          console.log('❌ SW unregister failed:', registration.scope);
        }
      });
    }
    
    console.log('🧹 SW Cleanup completed');
    
    // Now register the new FCM service worker
    navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    }).then(function(registration) {
      console.log('✅ New FCM SW registered:', registration.scope);
    }).catch(function(error) {
      console.error('❌ FCM SW registration failed:', error);
    });
  });
}