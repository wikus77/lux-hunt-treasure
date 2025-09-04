/*
 * M1SSION™ PWA Registration - Single-Shot Updates
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

// Use fallback registration since VitePWA is configured with generateSW
// virtual:pwa-register is only available in specific VitePWA modes

const SW_VERSION_KEY = 'sw_version_applied';
const SW_RELOADED_KEY = 'sw_reloaded_flag';

/**
 * Register service worker with controlled update prompts
 * Prevents reload loops and shows prompt only once per version
 */
export async function initializePWARegistration(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('🔧 Service Worker not supported');
    return;
  }

  console.log('🚀 M1SSION™ PWA: Initializing registration...');

  // Clear reload flag after successful page load
  setTimeout(() => {
    sessionStorage.removeItem(SW_RELOADED_KEY);
  }, 1000);

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });

    console.log('✅ PWA: Service worker registered');

    // Handle updates with version control
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      console.log('🔄 PWA: Update found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('💫 PWA: New version available');
          
          const currentVersion = (typeof __PWA_VERSION__ !== 'undefined' ? __PWA_VERSION__ : String(Date.now()));
          const appliedVersion = localStorage.getItem(SW_VERSION_KEY);
          
          // Only show prompt once per version
          if (appliedVersion === currentVersion) {
            console.log('✓ PWA: Update already applied for this version');
            return;
          }

          // Prevent multiple reload prompts
          if (sessionStorage.getItem(SW_RELOADED_KEY)) {
            console.log('✓ PWA: Update already in progress');
            return;
          }

          // Show single-shot update prompt
          const shouldUpdate = window.confirm(
            'Una nuova versione di M1SSION™ è disponibile. Aggiornare ora?'
          );

          if (shouldUpdate) {
            console.log('🔄 PWA: User confirmed update');
            
            // Mark as applied and set reload flag
            localStorage.setItem(SW_VERSION_KEY, currentVersion);
            sessionStorage.setItem(SW_RELOADED_KEY, '1');
            
            // Skip waiting and reload
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      });
    });

    // Handle controller changes with debounce
    let reloadTimeout: number;
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 PWA: Controller changed');
      
      // Only reload if we have the reload flag
      if (sessionStorage.getItem(SW_RELOADED_KEY) && !reloadTimeout) {
        clearTimeout(reloadTimeout);
        
        reloadTimeout = window.setTimeout(() => {
          console.log('🔄 PWA: Reloading for update...');
          window.location.reload();
        }, 500);
      }
    }, { once: true });

  } catch (error) {
    console.error('❌ PWA: Registration failed', error);
  }
}

/**
 * Check if PWA update was recently applied
 */
export function wasRecentlyUpdated(): boolean {
  return !!sessionStorage.getItem(SW_RELOADED_KEY);
}

/**
 * Get current PWA version
 */
export function getCurrentPWAVersion(): string {
  return (typeof __PWA_VERSION__ !== 'undefined' ? __PWA_VERSION__ : String(Date.now()));
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */