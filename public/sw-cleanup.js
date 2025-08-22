// © 2025 M1SSION™ - Complete Service Worker & OneSignal Cleanup
// This script completely removes OneSignal and prepares for FCM

console.log('🧹 M1SSION™ Complete Cleanup starting...');

// List of OneSignal artifacts to remove
const oneSignalArtifacts = [
  'OneSignalSDKWorker.js',
  'OneSignalSDKUpdaterWorker.js', 
  'onesignal',
  'OneSignal'
];

// Clear OneSignal data from storage
try {
  console.log('🗑️ Clearing OneSignal storage data...');
  
  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (oneSignalArtifacts.some(artifact => key.toLowerCase().includes(artifact.toLowerCase()))) {
      console.log('🗑️ Removing localStorage:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (oneSignalArtifacts.some(artifact => key.toLowerCase().includes(artifact.toLowerCase()))) {
      console.log('🗑️ Removing sessionStorage:', key);
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear OneSignal globals
  if (window.OneSignal) {
    console.log('🗑️ Clearing OneSignal global');
    delete window.OneSignal;
  }
  
  if (window.OneSignalInitialized) {
    console.log('🗑️ Clearing OneSignal initialization flag');
    delete window.OneSignalInitialized;
  }
  
  console.log('✅ OneSignal data cleared');
} catch (error) {
  console.error('❌ Error clearing OneSignal data:', error);
}

// Unregister all service workers and register FCM
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('🧹 Found', registrations.length, 'service worker registrations');
    
    const unregisterPromises = registrations.map(registration => {
      const scriptURL = registration.active?.scriptURL || '';
      console.log('🧹 Unregistering SW:', registration.scope, scriptURL);
      
      return registration.unregister().then(function(success) {
        if (success) {
          console.log('✅ SW unregistered:', registration.scope);
        } else {
          console.log('❌ SW unregister failed:', registration.scope);
        }
        return success;
      });
    });
    
    // Wait for all unregistrations to complete, then register FCM
    Promise.all(unregisterPromises).then(() => {
      console.log('🧹 All SW cleanup completed');
      
      // Wait a moment for cleanup to complete
      setTimeout(() => {
        // Register FCM service worker
        navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        }).then(function(registration) {
          console.log('✅ FCM SW registered successfully:', registration.scope);
        }).catch(function(error) {
          console.error('❌ FCM SW registration failed:', error);
        });
      }, 1000);
    });
  }).catch(function(error) {
    console.error('❌ Error during SW cleanup:', error);
  });
}