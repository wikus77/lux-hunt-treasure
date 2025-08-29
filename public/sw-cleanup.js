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

// Selective SW cleanup - preserve our official SWs
async function selectiveSWCleanup() {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    console.log('🧹 Found', regs.length, 'service worker registrations');
    
    for (const r of regs) {
      const url = (r.scriptURL || '').toString();
      // Don't touch our official SWs
      const keep = /\/(firebase-messaging-sw\.js|sw-m1ssion\.js)(\?|$)/.test(url);
      
      if (!keep) {
        console.log('🧹 Unregistering non-official SW:', r.scope, url);
        try { 
          await r.unregister(); 
          console.log('✅ SW unregistered:', r.scope);
        } catch (error) {
          console.log('❌ SW unregister failed:', r.scope, error);
        }
      } else {
        console.log('✅ Keeping official SW:', r.scope, url);
      }
    }
  } catch (error) {
    console.error('❌ Error during selective SW cleanup:', error);
  }
}

// Ensure our official SWs are registered
async function ensureServiceWorkerRegistered() {
  if (!('serviceWorker' in navigator)) return;

  // Detect iOS Safari PWA
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  const WANT = [];
  
  // iOS PWA: only use sw-m1ssion.js (no Firebase)
  if (isIOS && isPWA) {
    WANT.push({ url: '/sw-m1ssion.js', scope: '/' });
    console.log('🍎 iOS PWA detected - using VAPID SW only');
  } else {
    // Desktop: prefer Firebase, fallback to M1SSION
    WANT.push({ url: '/firebase-messaging-sw.js', scope: '/' });
    WANT.push({ url: '/sw-m1ssion.js', scope: '/' });
    console.log('🖥️ Desktop detected - using Firebase + M1SSION SW');
  }

  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    const byURL = new Map(regs.map(r => [r.scriptURL, r]));

    // Register missing ones
    for (const { url, scope } of WANT) {
      const absolute = new URL(url, location.origin).toString();
      if (!byURL.has(absolute)) {
        try {
          console.log('📝 Registering missing SW:', url);
          await navigator.serviceWorker.register(url, { scope });
          console.log('✅ SW registered successfully:', url);
        } catch (e) {
          console.warn('❌ SW register failed for', url, e);
        }
      }
    }

    // Wait for controller if needed
    if (!navigator.serviceWorker.controller) {
      console.log('⏳ Waiting for SW controller...');
      await new Promise(res => {
        const onCtrl = () => { 
          navigator.serviceWorker.removeEventListener('controllerchange', onCtrl); 
          console.log('✅ SW controller ready');
          res(); 
        };
        navigator.serviceWorker.addEventListener('controllerchange', onCtrl, { once: true });
        // Fallback timer
        setTimeout(() => {
          console.log('⏰ SW controller timeout, continuing...');
          res();
        }, 3000);
      });
    }

    // Ensure ready
    try { 
      await navigator.serviceWorker.ready; 
      console.log('✅ SW ready state confirmed');
    } catch (error) {
      console.warn('⚠️ SW ready failed:', error);
    }
  } catch (error) {
    console.error('❌ Error ensuring SW registration:', error);
  }
}

// Execute cleanup and registration
if ('serviceWorker' in navigator) {
  (async () => {
    console.log('🚀 Starting M1SSION™ SW management...');
    
    // 1. Selective cleanup (preserve our official SWs)
    await selectiveSWCleanup();
    
    // 2. Ensure our SWs are active
    await ensureServiceWorkerRegistered();
    
    console.log('🎯 M1SSION™ SW management completed');
  })().catch(error => {
    console.error('❌ Error in SW management:', error);
  });
}