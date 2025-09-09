// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// iOS PWA Safe Boot - Prevents black screen and stabilizes startup

interface SafeBootOptions {
  debug?: boolean;
  maxWaitTime?: number;
  fallbackTimeout?: number;
}

interface SafeBootState {
  isIOSPWA: boolean;
  hasController: boolean;
  startTime: number;
  isReady: boolean;
}

class IOSPWASafeBoot {
  private state: SafeBootState;
  private options: SafeBootOptions;
  private readyPromise: Promise<boolean>;
  private readyResolve: ((value: boolean) => void) | null = null;
  private safetyTimeout: number | null = null;

  constructor(options: SafeBootOptions = {}) {
    this.options = {
      debug: options.debug ?? false,
      maxWaitTime: options.maxWaitTime ?? 1500,
      fallbackTimeout: options.fallbackTimeout ?? 3000
    };

    this.state = {
      isIOSPWA: this.detectIOSPWA(),
      hasController: !!navigator.serviceWorker?.controller,
      startTime: Date.now(),
      isReady: false
    };

    this.readyPromise = new Promise<boolean>((resolve) => {
      this.readyResolve = resolve;
    });

    this.init();
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
      console.info(`[iOS-PWA-BOOT] ${message}`, data || '');
    }
  }

  private setReady(reason: string): void {
    if (this.state.isReady) return;
    
    this.state.isReady = true;
    const bootTime = Date.now() - this.state.startTime;
    
    this.log(`Ready after ${bootTime}ms - ${reason}`, {
      bootTime,
      hasController: this.state.hasController,
      isIOSPWA: this.state.isIOSPWA
    });

    if (this.safetyTimeout) {
      clearTimeout(this.safetyTimeout);
      this.safetyTimeout = null;
    }

    this.readyResolve?.(true);
  }

  private async init(): Promise<void> {
    this.log('Initializing iOS PWA Safe Boot', this.state);

    // Safety timeout - always resolve within fallback time
    this.safetyTimeout = window.setTimeout(() => {
      this.setReady('safety timeout');
    }, this.options.fallbackTimeout);

    // If we already have a controller, we're good
    if (this.state.hasController) {
      this.setReady('controller already present');
      return;
    }

    // If no SW support, just proceed
    if (!('serviceWorker' in navigator)) {
      this.setReady('no service worker support');
      return;
    }

    // If not iOS PWA, use shorter wait time
    if (!this.state.isIOSPWA) {
      setTimeout(() => {
        this.setReady('not iOS PWA - proceeding');
      }, 500);
      return;
    }

    // For iOS PWA without controller, wait for controllerchange
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        this.setReady('no registration found');
        return;
      }

      // Listen for controller change
      const handleControllerChange = () => {
        this.state.hasController = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        this.setReady('controller change detected');
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Wait for SW ready with timeout
      const swReadyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<ServiceWorkerRegistration>((resolve, reject) => {
        setTimeout(() => reject(new Error('SW ready timeout')), this.options.maxWaitTime);
      });

      try {
        await Promise.race([swReadyPromise, timeoutPromise]);
        
        // Check again after ready
        if (navigator.serviceWorker.controller) {
          this.state.hasController = true;
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          this.setReady('controller found after ready');
        } else {
          // Wait a bit more for controllerchange
          setTimeout(() => {
            if (!this.state.isReady) {
              navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
              this.setReady('max wait time reached');
            }
          }, this.options.maxWaitTime);
        }
      } catch (error) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        this.setReady('SW ready failed, proceeding anyway');
      }

    } catch (error) {
      this.log('Init error, proceeding anyway', error);
      this.setReady('init error fallback');
    }
  }

  async waitForReady(): Promise<boolean> {
    return this.readyPromise;
  }

  getDiagnostics() {
    return {
      ...this.state,
      bootTime: Date.now() - this.state.startTime,
      options: this.options,
      timestamp: Date.now()
    };
  }

  shouldShowUI(): boolean {
    // For iOS PWA, always show UI to prevent black screen
    if (this.state.isIOSPWA) {
      return true;
    }

    // For others, show UI if ready or after minimal delay
    return this.state.isReady || (Date.now() - this.state.startTime) > 800;
  }
}

// Create singleton instance
let safeBootInstance: IOSPWASafeBoot | null = null;

export const initIOSPWASafeBoot = (options?: SafeBootOptions): IOSPWASafeBoot => {
  if (!safeBootInstance) {
    safeBootInstance = new IOSPWASafeBoot(options);
  }
  return safeBootInstance;
};

export const waitForIOSPWAReady = async (): Promise<boolean> => {
  if (!safeBootInstance) {
    safeBootInstance = new IOSPWASafeBoot();
  }
  return safeBootInstance.waitForReady();
};

export const getIOSPWADiagnostics = () => {
  return safeBootInstance?.getDiagnostics() || null;
};

export const shouldShowUIImmediate = (): boolean => {
  return safeBootInstance?.shouldShowUI() ?? true;
};

// Global diagnostics for debugging
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).__M1_IOS_PWA_BOOT__ = {
    get: getIOSPWADiagnostics,
    shouldShow: shouldShowUIImmediate,
    instance: () => safeBootInstance
  };
  console.info('🔧 iOS PWA Boot diagnostics: window.__M1_IOS_PWA_BOOT__');
}