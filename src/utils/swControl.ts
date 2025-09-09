// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Service Worker Control Helper - Prevents reload loops

/**
 * Robust helper to ensure SW control without infinite reload loops
 * Guards against multiple reloads using sessionStorage
 */
export async function ensureSWControlled(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW-CONTROL] Service workers not supported');
    return false;
  }

  try {
    // 1) Register /sw.js with scope '/' 
    console.log('[SW-CONTROL] Registering /sw.js...');
    const reg = await navigator.serviceWorker.register('/sw.js', { 
      scope: '/',
      updateViaCache: 'none'
    });
    
    // Try to update without throwing
    try { 
      await reg.update(); 
    } catch (updateError) {
      console.warn('[SW-CONTROL] Update failed (non-critical):', updateError);
    }

    // 2) If already controlled, we're good
    if (navigator.serviceWorker.controller) {
      console.log('[SW-CONTROL] ✅ Already controlled');
      return true;
    }

    // 3) Wait for ready state
    console.log('[SW-CONTROL] Waiting for SW ready...');
    await navigator.serviceWorker.ready;

    // Helper for single event listener
    const once = (el: EventTarget, ev: string): Promise<void> =>
      new Promise<void>(res => {
        const handler = () => { 
          el.removeEventListener(ev, handler); 
          res(); 
        };
        el.addEventListener(ev, handler);
      });

    // 4) Prevent infinite reload loops - only reload once per session
    const reloaded = sessionStorage.getItem('sw-reloaded') === '1';
    
    if (!reloaded && !navigator.serviceWorker.controller) {
      console.log('[SW-CONTROL] 🔄 Need to reload for SW control...');
      sessionStorage.setItem('sw-reloaded', '1');
      location.reload();
      return false; // Page will reload, function won't continue
    }

    // 5) After reload, wait for controllerchange if still not controlled
    if (!navigator.serviceWorker.controller) {
      console.log('[SW-CONTROL] Waiting for controllerchange...');
      
      // Race between controllerchange and timeout (max 4s)
      await Promise.race([
        once(navigator.serviceWorker, 'controllerchange'),
        new Promise(resolve => setTimeout(resolve, 4000))
      ]);
    }

    const controlled = !!navigator.serviceWorker.controller;
    console.log('[SW-CONTROL]', controlled ? '✅ Controlled' : '❌ Not controlled');
    
    return controlled;
    
  } catch (error) {
    console.error('[SW-CONTROL] ❌ Error:', error);
    return false;
  }
}

/**
 * Clear SW reload flag - call after successful operations
 */
export function clearSWReloadFlag(): void {
  sessionStorage.removeItem('sw-reloaded');
}

/**
 * Check if SW has recently reloaded
 */
export function hasSWRecentlyReloaded(): boolean {
  return sessionStorage.getItem('sw-reloaded') === '1';
}