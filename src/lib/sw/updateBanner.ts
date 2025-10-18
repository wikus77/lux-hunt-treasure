// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Service Worker Update Banner Logic

export interface UpdateBannerOptions {
  onUpdateAvailable?: () => void;
  autoReload?: boolean;
}

/**
 * Listen for Service Worker updates and trigger callback
 * Does NOT modify push notification logic
 */
export function listenSWUpdates(options: UpdateBannerOptions = {}) {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW Update] Service Worker not supported');
    return;
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[SW Update] Message received:', event.data);

    if (event.data?.type === 'SW_UPDATE_READY') {
      console.log('[SW Update] 🔄 Update available!');
      
      if (options.onUpdateAvailable) {
        options.onUpdateAvailable();
      }

      // Auto-reload if configured
      if (options.autoReload) {
        applyUpdate();
      }
    }
  });

  console.log('[SW Update] ✅ Listening for updates');
}

/**
 * Apply pending Service Worker update
 */
export async function applyUpdate(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.waiting) {
      console.log('[SW Update] No pending update');
      return;
    }

    console.log('[SW Update] 🔄 Applying update...');

    // Tell waiting SW to skip waiting and activate
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Wait for controller change, then reload
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Update] ✅ Controller changed, reloading...');
      window.location.reload();
    }, { once: true });
  } catch (error) {
    console.error('[SW Update] ❌ Error applying update:', error);
  }
}

/**
 * Check if Service Worker update is available
 */
export async function checkForUpdate(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    await registration.update();
    return !!registration.waiting;
  } catch (error) {
    console.error('[SW Update] ❌ Error checking update:', error);
    return false;
  }
}
