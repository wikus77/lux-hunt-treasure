/**
 * Diagnostic Utilities - Non-Invasive System Health
 * M1SSION™ - System Monitoring
 */

interface DiagnosticInfo {
  version: string;
  commit?: string;
  buildTime?: string;
  environment: 'development' | 'production';
  serviceWorker: {
    supported: boolean;
    registered: boolean;
    controller: boolean;
    updateAvailable: boolean;
  };
  platform: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    standalone: boolean;
    pwa: boolean;
  };
  performance: {
    memory?: {
      used: number;
      total: number;
      limit: number;
    };
    connection?: {
      type: string;
      effectiveType: string;
      downlink: number;
    };
  };
  features: {
    geolocation: boolean;
    notifications: boolean;
    localStorage: boolean;
    serviceWorker: boolean;
    webGL: boolean;
  };
  flags: Record<string, boolean>;
}

class DiagnosticMonitor {
  private _info: DiagnosticInfo | null = null;

  /**
   * Get comprehensive diagnostic information
   */
  getInfo(): DiagnosticInfo {
    if (!this._info) {
      this._info = this.collectDiagnosticInfo();
    }
    return this._info;
  }

  /**
   * Refresh diagnostic information
   */
  refresh(): DiagnosticInfo {
    this._info = this.collectDiagnosticInfo();
    return this._info;
  }

  private collectDiagnosticInfo(): DiagnosticInfo {
    return {
      version: import.meta.env.VITE_PWA_VERSION || '1.0.0',
      commit: import.meta.env.VITE_GIT_COMMIT?.slice(0, 8),
      buildTime: import.meta.env.VITE_BUILD_TIME,
      environment: import.meta.env.PROD ? 'production' : 'development',
      serviceWorker: this.getServiceWorkerInfo(),
      platform: this.getPlatformInfo(),
      performance: this.getPerformanceInfo(),
      features: this.getFeatureSupport(),
      flags: this.getActiveFlags(),
    };
  }

  private getServiceWorkerInfo() {
    const supported = 'serviceWorker' in navigator;
    
    return {
      supported,
      registered: supported && !!navigator.serviceWorker.controller,
      controller: supported && !!navigator.serviceWorker.controller,
      updateAvailable: false, // This would be updated by SW event listeners
    };
  }

  private getPlatformInfo() {
    const userAgent = navigator.userAgent;
    
    // Basic platform detection
    const isStandalone = (window.navigator as any).standalone === true ||
                        window.matchMedia('(display-mode: standalone)').matches;
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
    
    // OS detection
    let os = 'Unknown';
    if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Mac/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';

    // Browser detection
    let browser = 'Unknown';
    if (/Chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/Safari/i.test(userAgent)) browser = 'Safari';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Edge/i.test(userAgent)) browser = 'Edge';

    return {
      type: (isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop')) as 'desktop' | 'mobile' | 'tablet',
      os,
      browser,
      standalone: isStandalone,
      pwa: isStandalone,
    };
  }

  private getPerformanceInfo() {
    const info: DiagnosticInfo['performance'] = {};

    // Memory info (Chrome only)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      info.memory = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }

    // Network info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      info.connection = {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
      };
    }

    return info;
  }

  private getFeatureSupport() {
    return {
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      localStorage: (() => {
        try {
          return typeof localStorage !== 'undefined';
        } catch {
          return false;
        }
      })(),
      serviceWorker: 'serviceWorker' in navigator,
      webGL: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })(),
    };
  }

  private getActiveFlags() {
    return {
      qaMode: import.meta.env.VITE_QA_MODE === '1',
      bundleAnalyze: import.meta.env.VITE_BUNDLE_ANALYZE === '1',
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
    };
  }

  /**
   * Export diagnostic info as JSON for support
   */
  exportForSupport(): string {
    const info = this.getInfo();
    return JSON.stringify(info, null, 2);
  }

  /**
   * Log diagnostic summary to console (dev only)
   */
  logSummary(): void {
    if (!import.meta.env.DEV) return;

    const info = this.getInfo();
    console.group('🔍 M1SSION™ Diagnostics');
    console.log('Version:', info.version);
    console.log('Environment:', info.environment);
    console.log('Platform:', `${info.platform.type} (${info.platform.os})`);
    console.log('Browser:', info.platform.browser);
    console.log('PWA Mode:', info.platform.pwa);
    console.log('Service Worker:', info.serviceWorker.registered ? '✅' : '❌');
    console.log('Features:', info.features);
    console.log('Active Flags:', info.flags);
    console.groupEnd();
  }
}

// Global diagnostics instance
export const diagnostics = new DiagnosticMonitor();

// Expose to window for debugging (dev only)
if (import.meta.env.DEV) {
  (window as any).__M1_DIAG__ = {
    get info() { return diagnostics.getInfo(); },
    refresh: () => diagnostics.refresh(),
    export: () => diagnostics.exportForSupport(),
    log: () => diagnostics.logSummary(),
  };
}