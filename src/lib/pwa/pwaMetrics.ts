// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA Metrics - Local-only performance tracking (no backend)

/**
 * PWA Metric Types
 */
export type PWAMetricType = 
  | 'pwa-installed'
  | 'sw-activated'
  | 'sw-updated'
  | 'asset-updated'
  | 'cache-hit'
  | 'cache-miss'
  | 'offline-fallback';

export interface PWAMetric {
  type: PWAMetricType;
  timestamp: number;
  data?: Record<string, any>;
}

/**
 * PWA Metrics Logger - Local-only, no network calls
 * Emits console logs and custom events for monitoring
 */
class PWAMetricsLogger {
  private metrics: PWAMetric[] = [];
  private readonly maxMetrics = 100; // Keep last 100 metrics in memory

  /**
   * Log a PWA metric
   */
  log(type: PWAMetricType, data?: Record<string, any>): void {
    const metric: PWAMetric = {
      type,
      timestamp: Date.now(),
      data,
    };

    // Add to memory
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Console log for debugging
    console.log(`[PWA Metrics] ${type}`, data || '');

    // Performance mark (for Chrome DevTools)
    try {
      performance.mark(`m1-${type}`);
    } catch (e) {
      // Ignore if performance API not available
    }

    // Dispatch custom event (for external listeners)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('m1:metric', {
          detail: metric,
        })
      );
    }
  }

  /**
   * Get all logged metrics
   */
  getMetrics(): PWAMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: PWAMetricType): PWAMetric[] {
    return this.metrics.filter(m => m.type === type);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    console.log('[PWA Metrics] Cleared all metrics');
  }

  /**
   * Get metrics summary
   */
  getSummary(): Record<PWAMetricType, number> {
    const summary: Record<string, number> = {};
    
    this.metrics.forEach(m => {
      summary[m.type] = (summary[m.type] || 0) + 1;
    });

    return summary as Record<PWAMetricType, number>;
  }
}

// Singleton instance
export const pwaMetrics = new PWAMetricsLogger();

/**
 * Initialize PWA metrics tracking
 * Call this once in your app entry point
 */
export function initPWAMetrics(): void {
  if (typeof window === 'undefined') return;

  // Track PWA installation
  window.addEventListener('appinstalled', () => {
    pwaMetrics.log('pwa-installed');
  });

  // Track Service Worker messages
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, version, url } = event.data || {};

      switch (type) {
        case 'M1_SW_UPDATE_AVAILABLE':
          pwaMetrics.log('sw-updated', { version });
          break;
        case 'M1_ASSET_UPDATED':
          pwaMetrics.log('asset-updated', { url });
          break;
        default:
          break;
      }
    });

    // Track when SW becomes active
    navigator.serviceWorker.ready.then(registration => {
      pwaMetrics.log('sw-activated', {
        scope: registration.scope,
      });
    });
  }

  console.log('[PWA Metrics] ✅ Initialized (local-only)');
}

/**
 * Estimate cache performance (static assets only)
 * This is a rough estimate based on network timing
 */
export function trackCachePerformance(url: string, fromCache: boolean): void {
  if (fromCache) {
    pwaMetrics.log('cache-hit', { url });
  } else {
    pwaMetrics.log('cache-miss', { url });
  }
}

/**
 * Track offline fallback usage
 */
export function trackOfflineFallback(url: string): void {
  pwaMetrics.log('offline-fallback', { url });
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
