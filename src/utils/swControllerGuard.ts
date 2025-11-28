// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Service Worker Controller Guard - Ensures app SW always controls main app

/**
 * Ensures our app Service Worker is the controller without touching push SWs
 * Guards against FCM SW taking over the main app controller
 * (OneSignal RIMOSSO - Solo FCM e VAPID Web Push)
 */
export async function ensureAppSWController(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW-GUARD] Service workers not supported');
    return false;
  }

  try {
    // Generate versioned SW path based on build timestamp
    const buildId = import.meta.env.VITE_BUILD_ID || Date.now().toString();
    const appSWPath = `/sw-app-${buildId}.js`;
    
    // Check current controller
    const currentController = navigator.serviceWorker.controller;
    const currentURL = currentController?.scriptURL;
    
    // If no controller or controller is not our app SW, take control
    if (!currentController || !currentURL?.includes('/sw-app-')) {
      console.log('[SW-GUARD] 🔄 Taking app controller with:', appSWPath);
      
      // Register our app SW with explicit scope
      const registration = await navigator.serviceWorker.register(appSWPath, {
        scope: '/',
        updateViaCache: 'none'
      });
      
      // Wait for activation if needed
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Wait for controller change with timeout
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Controller timeout')), 3000);
          
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
        });
      }
      
      console.log('[SW-GUARD] ✅ App controller established');
      return true;
    }
    
    console.log('[SW-GUARD] ✅ App SW already in control:', currentURL);
    return true;
    
  } catch (error) {
    console.warn('[SW-GUARD] ⚠️ Guard failed (non-critical):', error);
    return false;
  }
}

/**
 * Log active Service Workers for debugging (does not modify anything)
 */
export async function logActiveSWs(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const controller = navigator.serviceWorker.controller;
    
    console.log('[SW-GUARD] 📊 Active SWs:', {
      controller: controller?.scriptURL || 'none',
      registrations: registrations.map(reg => ({
        scope: reg.scope,
        scriptURL: reg.active?.scriptURL || 'pending',
        state: reg.active?.state || 'unknown'
      }))
    });
  } catch (error) {
    console.warn('[SW-GUARD] Could not log SWs:', error);
  }
}