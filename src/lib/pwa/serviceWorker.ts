/*
 * M1SSION™ Service Worker Registration - Clean & Stable
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

/**
 * Register service worker with proper lifecycle handling
 * Prevents reload loops and ensures clean updates
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('🔧 Service Worker not supported');
    return null;
  }

  try {
    console.log('🔧 Registering service worker...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', { 
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('✅ Service Worker registered successfully');

    // Handle updates properly without forcing reload
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      console.log('🔄 Service Worker update found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('💫 New service worker installed and waiting');
          
          // Notify user about update but don't force reload
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('sw-update-available', {
              detail: { registration }
            }));
          }
        }
      });
    });

    // Handle controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed');
      
      // Only reload if we're not in the middle of a page load
      if (!performance.navigation || performance.navigation.type !== 1) {
        window.location.reload();
      }
    });

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Check if service worker update is available
 */
export async function checkForSWUpdate(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    await registration.update();
    return !!registration.waiting;
  } catch (error) {
    console.error('❌ SW update check failed:', error);
    return false;
  }
}

/**
 * Activate waiting service worker
 */
export async function activateWaitingSW(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.waiting) return;

    // Send skip waiting message
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } catch (error) {
    console.error('❌ SW activation failed:', error);
  }
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */