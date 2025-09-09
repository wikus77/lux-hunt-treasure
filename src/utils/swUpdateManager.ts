// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Robust SW Update Manager - State Machine for iOS PWA (NO PUSH MODIFICATIONS)

interface SWUpdateState {
  buildId: string | null;
  isUpdating: boolean;
  lastPromptTime: number;
  sessionFlags: {
    promptShown: boolean;
    dismissed: boolean;
    reloaded: boolean;
  };
}

interface SWUpdateOptions {
  onUpdate?: (hasUpdate: boolean) => void;
  debug?: boolean;
}

class SWUpdateManager {
  private registration: ServiceWorkerRegistration | null = null;
  private state: SWUpdateState;
  private options: SWUpdateOptions;
  private isInitialized = false;
  private updateCheckInterval: number | null = null;

  constructor() {
    this.state = {
      buildId: null,
      isUpdating: false,
      lastPromptTime: 0,
      sessionFlags: {
        promptShown: false,
        dismissed: false,
        reloaded: false
      }
    };
    this.options = {};
    this.initializeFromStorage();
  }

  private get buildId(): string {
    return import.meta.env.VITE_BUILD_ID || `${import.meta.env.MODE}-${Date.now().toString(36)}`;
  }

  private get isIOSPWA(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    );
  }

  private initializeFromStorage(): void {
    try {
      const currentBuildId = this.buildId;
      const stored = sessionStorage.getItem(`sw:state:${currentBuildId}`);
      
      if (stored) {
        const parsedState = JSON.parse(stored);
        this.state = { ...this.state, ...parsedState };
      }
      
      this.state.buildId = currentBuildId;
      this.saveState();
    } catch (error) {
      console.warn('[SW-UPDATE] Failed to load state from storage:', error);
    }
  }

  private saveState(): void {
    try {
      const key = `sw:state:${this.state.buildId}`;
      sessionStorage.setItem(key, JSON.stringify(this.state));
    } catch (error) {
      console.warn('[SW-UPDATE] Failed to save state:', error);
    }
  }

  private log(message: string, data?: any): void {
    if (this.options.debug || !import.meta.env.PROD) {
      console.info(`[SW-UPDATE] ${message}`, data || '');
    }
  }

  private async iosOptimizedReload(): Promise<void> {
    this.log('Performing iOS-optimized reload');
    
    if (this.isIOSPWA) {
      // Use replace to avoid BFCache issues in iOS PWA
      const url = `${location.pathname}${location.search}`;
      location.replace(url);
    } else {
      location.reload();
    }
  }

  private shouldShowPrompt(): boolean {
    const { sessionFlags, buildId } = this.state;
    
    // Guard: already shown for this build
    if (sessionFlags.promptShown) {
      this.log('Prompt already shown for this build');
      return false;
    }
    
    // Guard: already dismissed for this build
    if (sessionFlags.dismissed) {
      this.log('Update dismissed for this build');
      return false;
    }
    
    // Guard: already reloaded for this build
    if (sessionFlags.reloaded) {
      this.log('Already reloaded for this build');
      return false;
    }
    
    // Guard: currently updating
    if (this.state.isUpdating) {
      this.log('Update in progress, skipping prompt');
      return false;
    }
    
    // Guard: cooldown period (prevent spam)
    const timeSinceLastPrompt = Date.now() - this.state.lastPromptTime;
    if (timeSinceLastPrompt < 5000) { // 5 second cooldown
      this.log('Within cooldown period, skipping prompt');
      return false;
    }
    
    return true;
  }

  private async showUpdatePrompt(): Promise<boolean> {
    if (!this.shouldShowPrompt()) {
      return false;
    }
    
    // Mark prompt as shown before showing
    this.state.sessionFlags.promptShown = true;
    this.state.lastPromptTime = Date.now();
    this.saveState();
    
    const userWantsUpdate = confirm(
      '🔄 Una nuova versione di M1SSION™ è disponibile.\n\nAggiornare ora?'
    );
    
    if (!userWantsUpdate) {
      this.state.sessionFlags.dismissed = true;
      this.saveState();
      this.log('User dismissed update');
      return false;
    }
    
    return true;
  }

  private async executeUpdate(waitingWorker: ServiceWorker): Promise<void> {
    if (this.state.isUpdating) {
      this.log('Update already in progress');
      return;
    }
    
    this.state.isUpdating = true;
    this.state.sessionFlags.reloaded = true;
    this.saveState();
    
    this.log('Executing one-shot update');
    
    try {
      // Send skip waiting message - corrected message type
      waitingWorker.postMessage({ type: 'SW_SKIP_WAITING' });
      
      // Wait for controller change with timeout
      const controllerChangePromise = new Promise<void>((resolve) => {
        const handleChange = () => {
          navigator.serviceWorker.removeEventListener('controllerchange', handleChange);
          resolve();
        };
        navigator.serviceWorker.addEventListener('controllerchange', handleChange);
      });
      
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(resolve, 5000); // 5 second timeout
      });
      
      await Promise.race([controllerChangePromise, timeoutPromise]);
      
      this.log('Controller change detected, reloading...');
      
      // Small delay for state stability
      setTimeout(() => {
        this.iosOptimizedReload();
      }, 300);
      
    } catch (error) {
      console.error('[SW-UPDATE] Update execution failed:', error);
      this.state.isUpdating = false;
      this.saveState();
    }
  }

  private handleUpdateFound(registration: ServiceWorkerRegistration): void {
    const newWorker = registration.installing;
    if (!newWorker) return;
    
    this.log('New worker installing...');
    
    newWorker.addEventListener('statechange', async () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.log('New worker installed and waiting');
        
        const shouldUpdate = await this.showUpdatePrompt();
        if (shouldUpdate) {
          await this.executeUpdate(newWorker);
        }
        
        this.options.onUpdate?.(true);
      }
    });
  }

  private addUpdateListeners(): void {
    if (!this.registration) return;
    
    this.registration.addEventListener('updatefound', () => {
      this.handleUpdateFound(this.registration!);
    });
    
    this.log('Update listeners added');
  }

  async init(options: SWUpdateOptions = {}): Promise<ServiceWorkerRegistration | null> {
    if (this.isInitialized) {
      this.log('Already initialized');
      return this.registration;
    }
    
    if (!('serviceWorker' in navigator)) {
      console.warn('[SW-UPDATE] Service Worker not supported');
      return null;
    }
    
    this.options = options;
    this.log('Initializing SW Update Manager', {
      buildId: this.buildId,
      isIOSPWA: this.isIOSPWA,
      state: this.state
    });
    
    try {
      // Clean up old session flags on fresh start
      this.cleanupOldSessions();
      
      // Register or get existing registration
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
      if (registration.waiting && navigator.serviceWorker.controller) {
        this.log('Found waiting worker on init');
        const shouldUpdate = await this.showUpdatePrompt();
        if (shouldUpdate) {
          await this.executeUpdate(registration.waiting);
        }
      }
      
      // Set up periodic update checks (every 6 hours)
      this.setupPeriodicUpdates();
      
      this.isInitialized = true;
      this.log('SW Update Manager initialized successfully');
      
      return registration;
      
    } catch (error) {
      console.error('[SW-UPDATE] Initialization failed:', error);
      return null;
    }
  }

  private cleanupOldSessions(): void {
    try {
      const currentBuildId = this.buildId;
      const keys = Object.keys(sessionStorage);
      
      keys.forEach(key => {
        if (key.startsWith('sw:state:') && !key.includes(currentBuildId)) {
          sessionStorage.removeItem(key);
        }
      });
      
      this.log('Cleaned up old session data');
    } catch (error) {
      console.warn('[SW-UPDATE] Failed to cleanup old sessions:', error);
    }
  }

  private setupPeriodicUpdates(): void {
    // Clear existing interval
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
    
    // Check for updates every 6 hours
    this.updateCheckInterval = window.setInterval(() => {
      this.checkForUpdate();
    }, 6 * 60 * 60 * 1000);
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.registration) {
      this.log('No registration available for update check');
      return false;
    }
    
    try {
      await this.registration.update();
      
      if (this.registration.waiting && navigator.serviceWorker.controller) {
        this.log('Update available');
        const shouldUpdate = await this.showUpdatePrompt();
        if (shouldUpdate) {
          await this.executeUpdate(this.registration.waiting);
          return true;
        }
      } else {
        this.log('No update available');
      }
      
      return false;
    } catch (error) {
      console.error('[SW-UPDATE] Update check failed:', error);
      return false;
    }
  }

  getDiagnostics() {
    return {
      buildId: this.buildId,
      hasController: !!navigator.serviceWorker?.controller,
      regState: this.registration?.active?.state || 'unknown',
      isIOSPWA: this.isIOSPWA,
      state: this.state,
      isInitialized: this.isInitialized,
      timestamp: Date.now()
    };
  }

  clearFlags(): void {
    this.state.sessionFlags = {
      promptShown: false,
      dismissed: false,
      reloaded: false
    };
    this.saveState();
    this.log('Session flags cleared');
  }

  destroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
    this.isInitialized = false;
    this.log('SW Update Manager destroyed');
  }
}

// Singleton instance
const swUpdateManager = new SWUpdateManager();

// Public API
export const initSWUpdateManager = (options?: SWUpdateOptions) => swUpdateManager.init(options);
export const checkForSWUpdate = () => swUpdateManager.checkForUpdate();
export const getSWDiagnostics = () => swUpdateManager.getDiagnostics();
export const clearSWFlags = () => swUpdateManager.clearFlags();

// Global diagnostics (debug only)
if (typeof window !== 'undefined' && !import.meta.env.PROD) {
  (window as any).__M1_SW_UPDATE__ = {
    get: getSWDiagnostics,
    check: checkForSWUpdate,
    clear: clearSWFlags,
    manager: swUpdateManager
  };
  console.info('🔧 SW Update diagnostics: window.__M1_SW_UPDATE__');
}