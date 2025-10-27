/*
 * M1SSION™ Service Worker Registration - Any Host
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

/**
 * Register /sw.js on ANY host (not just *.pages.dev)
 * Ensures navigator.serviceWorker.ready resolves before push subscribe
 */
export async function ensureSWAnyHost(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW-ANYHOST] Service Worker not supported');
    return null;
  }

  try {
    // Check if already registered
    const existing = await navigator.serviceWorker.getRegistration('/');
    if (existing?.active?.scriptURL.includes('/sw.js')) {
      console.log('[SW-ANYHOST] ✅ /sw.js already active');
      return existing;
    }

    console.log('[SW-ANYHOST] Registering /sw.js for all hosts...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', { 
      scope: '/',
      updateViaCache: 'none'
    });

    // Wait for activation (non-blocking, no forced SKIP_WAITING)
    await navigator.serviceWorker.ready;
    
    console.log('[SW-ANYHOST] ✅ /sw.js registered and ready');
    return registration;

  } catch (error) {
    console.warn('[SW-ANYHOST] Registration failed (non-critical):', error);
    return null;
  }
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */
