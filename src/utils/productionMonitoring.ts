/**
 * Production Diagnostics & Monitoring
 * M1SSION™ - Enhanced System Monitoring
 */

import { diagnostics } from '../metrics/interestSignals';

interface ProductionMetrics {
  errors: ErrorMetric[];
  performance: PerformanceMetric[];
  features: FeatureUsage[];
  system: SystemHealth;
}

interface ErrorMetric {
  timestamp: number;
  type: string;
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
}

interface PerformanceMetric {
  timestamp: number;
  metric: string;
  value: number;
  url: string;
}

interface FeatureUsage {
  feature: string;
  timestamp: number;
  userId?: string;
}

interface SystemHealth {
  timestamp: number;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  network?: {
    online: boolean;
    effectiveType: string;
    rtt: number;
  };
  battery?: {
    level: number;
    charging: boolean;
  };
}

class ProductionMonitor {
  private metrics: ProductionMetrics = {
    errors: [],
    performance: [],
    features: [],
    system: {
      timestamp: Date.now()
    }
  };
  
  private maxEntries = 50; // Limit stored metrics
  private reportingInterval = 300000; // 5 minutes

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Setup error monitoring
    this.setupErrorMonitoring();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup system health monitoring
    this.setupSystemHealthMonitoring();
    
    // Start periodic reporting in production
    if (import.meta.env.PROD) {
      this.startPeriodicReporting();
    }
  }

  private setupErrorMonitoring() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.recordError({
        timestamp: Date.now(),
        type: 'javascript_error',
        message: this.sanitizeMessage(event.error?.message || event.message || 'Unknown error'),
        stack: this.sanitizeStack(event.error?.stack),
        userAgent: navigator.userAgent,
        url: this.sanitizeUrl(window.location.href),
        userId: this.getCurrentUserId()
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        timestamp: Date.now(),
        type: 'promise_rejection',
        message: this.sanitizeMessage(event.reason?.message || String(event.reason) || 'Promise rejected'),
        stack: this.sanitizeStack(event.reason?.stack),
        userAgent: navigator.userAgent,
        url: this.sanitizeUrl(window.location.href),
        userId: this.getCurrentUserId()
      });
    });
  }

  private setupPerformanceMonitoring() {
    // Core Web Vitals
    if ('web-vitals' in window) {
      // This would be implemented with web-vitals library if available
    }

    // Navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.recordPerformance('page_load', navigation.loadEventEnd - navigation.fetchStart);
          this.recordPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        }
      }, 1000);
    }
  }

  private setupSystemHealthMonitoring() {
    // Monitor system health every 5 minutes
    const monitorHealth = () => {
      const health: SystemHealth = {
        timestamp: Date.now()
      };

      // Memory info (Chrome only)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        health.memory = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100)
        };
      }

      // Network info
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        health.network = {
          online: navigator.onLine,
          effectiveType: connection.effectiveType || 'unknown',
          rtt: connection.rtt || 0
        };
      }

      // Battery info
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          health.battery = {
            level: Math.round(battery.level * 100),
            charging: battery.charging
          };
        }).catch(() => {
          // Battery API not available
        });
      }

      this.metrics.system = health;
    };

    monitorHealth();
    setInterval(monitorHealth, this.reportingInterval);
  }

  private startPeriodicReporting() {
    setInterval(() => {
      this.sendMetricsToServer();
    }, this.reportingInterval);
  }

  private recordError(error: ErrorMetric) {
    this.metrics.errors.push(error);
    this.limitArray(this.metrics.errors);

    // Log in development
    if (import.meta.env.DEV) {
      console.error('🚨 Production Monitor - Error recorded:', error);
    }
  }

  private recordPerformance(metric: string, value: number) {
    this.metrics.performance.push({
      timestamp: Date.now(),
      metric,
      value,
      url: this.sanitizeUrl(window.location.href)
    });
    this.limitArray(this.metrics.performance);
  }

  private recordFeatureUsage(feature: string) {
    this.metrics.features.push({
      feature,
      timestamp: Date.now(),
      userId: this.getCurrentUserId()
    });
    this.limitArray(this.metrics.features);
  }

  private limitArray<T>(array: T[]) {
    if (array.length > this.maxEntries) {
      array.splice(0, array.length - this.maxEntries);
    }
  }

  private sanitizeMessage(message: string): string {
    // Remove potential sensitive data from error messages
    return message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
      .replace(/\b(?:token|key|secret|password)[\s=:]\S+/gi, '[REDACTED]')
      .substring(0, 500); // Limit length
  }

  private sanitizeStack(stack?: string): string | undefined {
    if (!stack) return undefined;
    return this.sanitizeMessage(stack);
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove query parameters that might contain sensitive data
      urlObj.search = '';
      urlObj.hash = '';
      return urlObj.toString();
    } catch {
      return '[INVALID_URL]';
    }
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from session storage or other safe sources
    try {
      const userId = sessionStorage.getItem('user_id');
      return userId ? userId.substring(0, 8) + '...' : undefined; // Truncate for privacy
    } catch {
      return undefined;
    }
  }

  private async sendMetricsToServer() {
    // DISABLED: /api/metrics endpoint is not implemented on Cloudflare Pages
    // This prevents 405 errors in console. Metrics are stored locally only.
    // To re-enable, implement a proper metrics endpoint or use a third-party service.
    
    if (!import.meta.env.PROD) return;

    // Just clear metrics locally to prevent memory growth
    // No server-side reporting since endpoint doesn't exist
    const hasMetrics = this.metrics.errors.length > 0 || 
                      this.metrics.performance.length > 0 || 
                      this.metrics.features.length > 0;

    if (hasMetrics) {
      // Log to console in debug mode only
      if (import.meta.env.DEV) {
        console.log('[ProductionMonitor] Metrics collected (local only):', {
          errors: this.metrics.errors.length,
          performance: this.metrics.performance.length,
          features: this.metrics.features.length
        });
      }
      
      // Clear metrics to prevent memory buildup
      this.metrics.errors = [];
      this.metrics.performance = [];
      this.metrics.features = [];
    }
  }

  /**
   * Public API for manual tracking
   */
  trackFeature(feature: string) {
    this.recordFeatureUsage(feature);
  }

  trackCustomMetric(metric: string, value: number) {
    this.recordPerformance(metric, value);
  }

  getMetrics(): ProductionMetrics {
    return { ...this.metrics };
  }

  exportMetrics(): string {
    return JSON.stringify({
      ...this.metrics,
      diagnostics: {
        queueSize: diagnostics.queueSize(),
        sessionId: diagnostics.sessionId(),
        lastFlushStatus: diagnostics.lastFlushStatus()
      },
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

// Global production monitor instance
export const productionMonitor = new ProductionMonitor();

// Export public API
export const monitoring = {
  trackFeature: (feature: string) => productionMonitor.trackFeature(feature),
  trackMetric: (metric: string, value: number) => productionMonitor.trackCustomMetric(metric, value),
  getMetrics: () => productionMonitor.getMetrics(),
  export: () => productionMonitor.exportMetrics()
};

// Expose in production for debugging
if (import.meta.env.PROD) {
  (window as any).__M1_MONITOR__ = monitoring;
}