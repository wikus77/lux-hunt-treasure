// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// iOS PWA One-Shot Service Worker Updater - NO PUSH CHAIN MODIFICATIONS

const SW_SESSION_KEYS = {
  RELOAD_ONCE: 'sw_reload_once',
  PROMPT_SHOWN: 'sw_prompt_shown', 
  UPDATED_ONCE: 'sw_updated_once',
  VERSION_APPLIED: 'sw_version_applied'
} as const;

interface SWUpdateOptions {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  debug?: boolean;
}

interface SWDiagnostics {
  hasController: boolean;
  regState: string;
  lastPromptTime: number | null;
  reloadedOnce: boolean;
  isStandalone: boolean;
  timestamp: number;
}

let swRegistration: ServiceWorkerRegistration | null = null;
let updateListenersAdded = false;

/**
 * Detect iOS PWA standalone mode
 */
function isIOSPWAStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true ||
    /iPad|iPhone|iPod/.test(navigator.userAgent)
  );
}

/**
 * iOS-specific reload that reduces BFCache issues
 */
function iosPWAReload(): void {
  if (isIOSPWAStandalone()) {
    // Use replace instead of reload to avoid BFCache glitches in iOS PWA
    const url = `${location.pathname}${location.search}`;
    location.replace(url);
  } else {
    location.reload();
  }
}

/**
 * Get current diagnostics state (read-only)
 */
function getDiagnostics(): SWDiagnostics {
  return {
    hasController: !!navigator.serviceWorker?.controller,
    regState: swRegistration?.active?.state || 'unknown',
    lastPromptTime: parseInt(sessionStorage.getItem('sw_last_prompt_time') || '0'),
    reloadedOnce: sessionStorage.getItem(SW_SESSION_KEYS.RELOAD_ONCE) === '1',
    isStandalone: isIOSPWAStandalone(),
    timestamp: Date.now()
  };
}

/**
 * Show update prompt only once per session per version
 */
function showUpdatePromptOnce(): boolean {
  const promptKey = SW_SESSION_KEYS.PROMPT_SHOWN;
  const reloadKey = SW_SESSION_KEYS.RELOAD_ONCE;
  
  // Guard: already shown in this session
  if (sessionStorage.getItem(promptKey) === '1') {
    console.info('[SW-UPDATE] Prompt already shown this session');
    return false;
  }
  
  // Guard: already reloaded once
  if (sessionStorage.getItem(reloadKey) === '1') {
    console.info('[SW-UPDATE] Already reloaded once, skipping prompt');
    return false;
  }
  
  // Mark prompt as shown before showing it
  sessionStorage.setItem(promptKey, '1');
  sessionStorage.setItem('sw_last_prompt_time', Date.now().toString());
  
  const userWantsUpdate = confirm(
    '🔄 Una nuova versione di M1SSION™ è disponibile.\n\nAggiornare ora? (Solo una volta per sessione)'
  );
  
  return userWantsUpdate;
}

/**
 * Execute update with one-shot reload protection
 */
async function executeUpdateOnce(waitingWorker: ServiceWorker): Promise<void> {
  const reloadKey = SW_SESSION_KEYS.RELOAD_ONCE;
  
  // Guard: prevent multiple reloads
  if (sessionStorage.getItem(reloadKey) === '1') {
    console.warn('[SW-UPDATE] Reload already executed, ignoring');
    return;
  }
  
  console.info('[SW-UPDATE] Executing update...');
  
  // Set reload guard before triggering skipWaiting
  sessionStorage.setItem(reloadKey, '1');
  sessionStorage.setItem(SW_SESSION_KEYS.UPDATED_ONCE, '1');
  
  // Send skip waiting message
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  
  // Wait for controllerchange, then reload
  const handleControllerChange = () => {
    console.info('[SW-UPDATE] Controller changed, initiating reload...');
    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    
    // Small delay to ensure state is stable
    setTimeout(() => {
      iosPWAReload();
    }, 250);
  };
  
  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
}

/**
 * Handle update found with one-shot logic
 */
function handleUpdateFound(registration: ServiceWorkerRegistration, options: SWUpdateOptions): void {
  const newWorker = registration.installing;
  if (!newWorker) return;
  
  console.info('[SW-UPDATE] New worker installing...');
  
  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      console.info('[SW-UPDATE] New worker installed, waiting');
      
      // Check if we should prompt
      if (showUpdatePromptOnce()) {
        executeUpdateOnce(newWorker);
      }
      
      // Call user callback if provided
      options.onUpdate?.(registration);
    }
  });
}

/**
 * Add update listeners only once
 */
function addUpdateListeners(registration: ServiceWorkerRegistration, options: SWUpdateOptions): void {
  if (updateListenersAdded) {
    console.info('[SW-UPDATE] Listeners already added');
    return;
  }
  
  updateListenersAdded = true;
  
  // Listen for updates
  registration.addEventListener('updatefound', () => {
    handleUpdateFound(registration, options);
  });
  
  console.info('[SW-UPDATE] Update listeners added');
}

/**
 * Initialize one-shot SW updater
 */
export async function initSWUpdater(options: SWUpdateOptions = {}): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW-UPDATE] Service Worker not supported');
    return null;
  }
  
  const isStandalone = isIOSPWAStandalone();
  const debug = options.debug || import.meta.env.DEV;
  
  if (debug) {
    console.info('[SW-UPDATE] Initializing', { isStandalone, keys: SW_SESSION_KEYS });
  }
  
  try {
    // Clear reload flag after successful page load (cleanup)
    setTimeout(() => {
      if (sessionStorage.getItem(SW_SESSION_KEYS.RELOAD_ONCE) === '1') {
        sessionStorage.removeItem(SW_SESSION_KEYS.RELOAD_ONCE);
        sessionStorage.removeItem(SW_SESSION_KEYS.PROMPT_SHOWN);
        console.info('[SW-UPDATE] Cleanup: Reset session flags');
      }
    }, 2000);
    
    // Register SW if not already registered
    let registration = await navigator.serviceWorker.getRegistration('/');
    
    if (!registration) {
      console.info('[SW-UPDATE] Registering /sw.js...');
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
    }
    
    swRegistration = registration;
    
    // Wait for ready state
    await navigator.serviceWorker.ready;
    
    // Add update listeners
    addUpdateListeners(registration, options);
    
    // Check if there's already a waiting worker
    if (registration.waiting && navigator.serviceWorker.controller) {
      console.info('[SW-UPDATE] Found waiting worker on init');
      if (showUpdatePromptOnce()) {
        executeUpdateOnce(registration.waiting);
      }
    }
    
    if (debug) {
      console.info('[SW-UPDATE] Initialized successfully', getDiagnostics());
    }
    
    return registration;
    
  } catch (error) {
    console.error('[SW-UPDATE] Initialization failed:', error);
    return null;
  }
}

/**
 * Request update check manually (for settings or admin)
 */
export async function requestUpdateOnce(): Promise<boolean> {
  if (!swRegistration) {
    console.warn('[SW-UPDATE] No registration available for manual update');
    return false;
  }
  
  try {
    await swRegistration.update();
    
    if (swRegistration.waiting) {
      console.info('[SW-UPDATE] Manual update: found waiting worker');
      if (showUpdatePromptOnce()) {
        executeUpdateOnce(swRegistration.waiting);
        return true;
      }
    } else {
      console.info('[SW-UPDATE] Manual update: no new version available');
    }
    
    return false;
  } catch (error) {
    console.error('[SW-UPDATE] Manual update failed:', error);
    return false;
  }
}

/**
 * Global diagnostics for debugging (read-only)
 */
if (typeof window !== 'undefined') {
  (window as any).__M1_SW_DIAG__ = {
    get: getDiagnostics,
    requestUpdate: requestUpdateOnce,
    isStandalone: isIOSPWAStandalone,
    clearFlags: () => {
      Object.values(SW_SESSION_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
      console.info('[SW-UPDATE] All session flags cleared');
    }
  };
  
  if (!import.meta.env.PROD) {
    console.info('🔧 SW Diagnostics available: window.__M1_SW_DIAG__');
  }
}