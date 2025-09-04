/*
 * M1SSION™ PWA Cleanup System - One-time Migration
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

/**
 * Run PWA cleanup once per version to prevent reload loops
 * Cleans up old service workers, caches, and storage entries
 */
export async function runPWACleanupOnce(): Promise<void> {
  const CLEANUP_KEY = 'm1_pwa_fix_v20250904';
  
  // Check if cleanup already ran for this version
  if (localStorage.getItem(CLEANUP_KEY)) {
    console.log('🧹 PWA cleanup already completed for this version');
    return;
  }

  console.log('🧹 Starting one-time PWA cleanup...');

  try {
    // 1. Clean up old service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        const swUrl = registration.scope || registration.installing?.scriptURL || registration.waiting?.scriptURL || registration.active?.scriptURL;
        
        // Keep only our official SW
        if (swUrl && !swUrl.includes('/sw.js')) {
          console.log('🗑️ Removing non-official service worker:', swUrl);
          await registration.unregister();
        }
      }
    }

    // 2. Clear old caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.includes('onesignal') || 
        name.includes('firebase') ||
        name.includes('workbox') ||
        name.startsWith('runtime-')
      );
      
      for (const cacheName of oldCaches) {
        console.log('🗑️ Clearing old cache:', cacheName);
        await caches.delete(cacheName);
      }
    }

    // 3. Remove OneSignal residuals from localStorage
    const keysToRemove = [
      'OneSignal-notificationClicked',
      'OneSignal-isOptedOut',
      'OneSignal-subscription',
      'OneSignal-sessionCount',
      'onesignal-pageview-count',
      'OneSignalSDKUpdaterWorker.js',
      'OneSignalSDKWorker.js'
    ];

    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log('🗑️ Removing OneSignal key:', key);
        localStorage.removeItem(key);
      }
    });

    // 4. Clear sessionStorage OneSignal entries
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('OneSignal') || key.includes('onesignal')) {
        console.log('🗑️ Removing OneSignal session key:', key);
        sessionStorage.removeItem(key);
      }
    });

    // 5. Mark cleanup as completed
    localStorage.setItem(CLEANUP_KEY, '1');
    console.log('✅ PWA cleanup completed successfully');

  } catch (error) {
    console.error('❌ PWA cleanup error:', error);
    // Still mark as completed to prevent infinite loops
    localStorage.setItem(CLEANUP_KEY, '1');
  }
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */
