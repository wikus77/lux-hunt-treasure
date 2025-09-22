// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Silent Auto-Update - No banners, just ONE refresh per BUILD_ID

interface SilentUpdateOptions {
  debug?: boolean;
}

interface UpdateState {
  buildId: string;
  isIOSPWA: boolean;
  hasController: boolean;
  isUpdating: boolean;
}

class SilentAutoUpdate {
  private state: UpdateState;
  private options: SilentUpdateOptions;
  private registration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;

  constructor() {
    this.state = {
      buildId: this.getBuildId(),
      isIOSPWA: this.detectIOSPWA(),
      hasController: !!navigator.serviceWorker?.controller,
      isUpdating: false
    };
    this.options = { debug: false };
  }

  private getBuildId(): string {
    return import.meta.env.VITE_BUILD_ID || `${import.meta.env.MODE}-${Date.now().toString(36)}`;
  }

  private detectIOSPWA(): boolean {
    if (typeof window === 'undefined') return false;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    return isStandalone && isIOS;
  }

  private log(message: string, data?: any): void {
    if (this.options.debug) {
      console.info(`[SILENT-UPDATE] ${message}`, data || '');
    }
  }

  private getSessionKey(type: 'reloaded' | 'updateReady'): string {
    return `sw:${type}:${this.state.buildId}`;
  }

  private hasReloaded(): boolean {
    return sessionStorage.getItem(this.getSessionKey('reloaded')) === '1';
  }

  private setReloaded(): void {
    sessionStorage.setItem(this.getSessionKey('reloaded'), '1');
  }

  private hasUpdateReady(): boolean {
    return sessionStorage.getItem(this.getSessionKey('updateReady')) === '1';
  }

  private setUpdateReady(): void {
    sessionStorage.setItem(this.getSessionKey('updateReady'), '1');
  }

  private performSilentRefresh(): void {
    if (this.hasReloaded()) {
      this.log('Already reloaded for this BUILD_ID, skipping');
      return;
    }

    if (this.state.isUpdating) {
      this.log('Update already in progress, skipping');
      return;
    }

    this.state.isUpdating = true;
    this.setReloaded(); // Set flag BEFORE reload to prevent loops
    
    this.log(`Performing silent refresh (iOS PWA: ${this.state.isIOSPWA})`);

    const executeRefresh = () => {
      if (this.state.isIOSPWA) {
        // iOS PWA: use location.replace to avoid BFCache issues
        const currentUrl = `${location.pathname}${location.search}${location.hash}`;
        location.replace(currentUrl);
      } else {
        // Desktop/mobile browser: standard reload
        location.reload();
      }
    };

    if (this.state.isIOSPWA && document.visibilityState === 'hidden') {
      // If app is hidden, wait for next visibility change
      this.log('App hidden, waiting for visibility change');
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          setTimeout(executeRefresh, 200);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Safety timeout in case visibility never changes
      setTimeout(() => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        executeRefresh();
      }, 30000);
      
    } else {
      // App is visible or not iOS PWA, refresh with optimal timing
      if ('requestIdleCallback' in window) {
        requestIdleCallback(executeRefresh, { timeout: 1000 });
      } else {
        setTimeout(executeRefresh, 300);
      }
    }
  }

  private handleUpdateFound(registration: ServiceWorkerRegistration): void {
    const newWorker = registration.installing;
    if (!newWorker) return;

    this.log('New worker installing, setting update ready flag');
    this.setUpdateReady();

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.log('New worker installed and waiting, sending skip waiting message');
        
        // Automatically send skip waiting message - no user prompt
        newWorker.postMessage({ type: 'SW_SKIP_WAITING' });
      }
    });
  }

  private handleControllerChange(): void {
    this.log('Controller change detected');
    
    // Only refresh if we haven't already done so for this BUILD_ID
    if (!this.hasReloaded() && this.hasUpdateReady()) {
      this.log('Update ready and not yet reloaded, performing silent refresh');
      this.performSilentRefresh();
    } else {
      this.log('Skipping refresh', { 
        hasReloaded: this.hasReloaded(), 
        hasUpdateReady: this.hasUpdateReady() 
      });
    }
  }

  private addUpdateListeners(): void {
    if (!this.registration) return;

    // Listen for new workers
    this.registration.addEventListener('updatefound', () => {
      this.handleUpdateFound(this.registration!);
    });

    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.handleControllerChange();
    });

    this.log('Silent update listeners added');
  }

  private cleanupOldFlags(): void {
    try {
      const currentBuildId = this.state.buildId;
      const keys = Object.keys(sessionStorage);
      
      keys.forEach(key => {
        if ((key.startsWith('sw:reloaded:') || key.startsWith('sw:updateReady:')) 
            && !key.includes(currentBuildId)) {
          sessionStorage.removeItem(key);
        }
      });
      
      this.log('Cleaned up old session flags');
    } catch (error) {
      console.warn('[SILENT-UPDATE] Failed to cleanup old flags:', error);
    }
  }

  async init(options: SilentUpdateOptions = {}): Promise<ServiceWorkerRegistration | null> {
    if (this.isInitialized) {
      this.log('Already initialized');
      return this.registration;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('[SILENT-UPDATE] Service Worker not supported');
      return null;
    }

    this.options = options;
    this.log('Initializing Silent Auto-Update', {
      buildId: this.state.buildId,
      isIOSPWA: this.state.isIOSPWA,
      hasController: this.state.hasController,
      hasReloaded: this.hasReloaded(),
      hasUpdateReady: this.hasUpdateReady()
    });

    try {
      // Clean up old session data
      this.cleanupOldFlags();

      // Get or register service worker
      let registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        this.log('Registering new SW');
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });
      }

      this.registration = registration;

      // Wait for ready state
      await navigator.serviceWorker.ready;

      // Add update listeners
      this.addUpdateListeners();

      // Check for existing waiting worker
      if (registration.waiting && navigator.serviceWorker.controller && !this.hasReloaded()) {
        this.log('Found waiting worker on init, sending skip waiting');
        this.setUpdateReady();
        registration.waiting.postMessage({ type: 'SW_SKIP_WAITING' });
      }

      this.isInitialized = true;
      this.log('Silent Auto-Update initialized successfully');
      
      return registration;

    } catch (error) {
      console.error('[SILENT-UPDATE] Initialization failed:', error);
      return null;
    }
  }

  getDiagnostics() {
    return {
      ...this.state,
      hasReloaded: this.hasReloaded(),
      hasUpdateReady: this.hasUpdateReady(),
      isInitialized: this.isInitialized,
      sessionKeys: {
        reloaded: this.getSessionKey('reloaded'),
        updateReady: this.getSessionKey('updateReady')
      },
      timestamp: Date.now()
    };
  }

  // Manual trigger for testing
  triggerUpdate(): void {
    if (this.registration) {
      this.registration.update();
    }
  }

  // Reset flags for testing
  resetFlags(): void {
    sessionStorage.removeItem(this.getSessionKey('reloaded'));
    sessionStorage.removeItem(this.getSessionKey('updateReady'));
    this.log('Session flags reset');
  }
}

// Singleton instance
const silentAutoUpdate = new SilentAutoUpdate();

// Public API
export const initSilentAutoUpdate = (options?: SilentUpdateOptions) => silentAutoUpdate.init(options);
export const getSilentUpdateDiagnostics = () => silentAutoUpdate.getDiagnostics();
export const triggerSilentUpdate = () => silentAutoUpdate.triggerUpdate();
export const resetSilentUpdateFlags = () => silentAutoUpdate.resetFlags();

// Global diagnostics for debugging
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).__M1_SILENT_UPDATE__ = {
    get: getSilentUpdateDiagnostics,
    trigger: triggerSilentUpdate,
    reset: resetSilentUpdateFlags,
    instance: silentAutoUpdate
  };
  console.info('🔧 Silent Update diagnostics: window.__M1_SILENT_UPDATE__');
}