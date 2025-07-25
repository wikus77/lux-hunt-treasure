/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * Build Optimization Utilities
 */

// Remove all console statements in production
export const setupProductionLogging = () => {
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    // Store original methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Override console methods
    console.log = (...args: any[]) => {
      // Only show CRITICAL logs in production
      if (args[0]?.includes('CRITICAL') || args[0]?.includes('SECURITY')) {
        originalLog.apply(console, args);
      }
    };
    
    console.warn = originalWarn; // Keep warnings
    console.error = originalError; // Keep errors
    
    // Disable debug methods
    console.debug = () => {};
    console.info = () => {};
    console.trace = () => {};
  }
};

// Bundle size analysis
export const getBundleInfo = () => {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.log('📦 Bundle Analysis:', {
      scripts: scripts.length,
      styles: styles.length,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance monitoring
export const monitorPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (import.meta.env.DEV) {
      console.log('⚡ Performance Metrics:', {
        loadTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
        firstPaint: Math.round(performance.getEntriesByType('paint')[0]?.startTime || 0),
      });
    }
    
    return {
      loadTime: perfData.loadEventEnd - perfData.fetchStart,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
    };
  }
  
  return null;
};

// Safe logging for production
export const safeLog = (...args: any[]) => {
  if (import.meta.env.DEV || args[0]?.includes('CRITICAL') || args[0]?.includes('SECURITY')) {
    console.log(...args);
  }
};

// Production readiness check
export const isProductionReady = () => {
  const checks = {
    serviceWorker: 'serviceWorker' in navigator,
    webPush: 'PushManager' in window,
    notifications: 'Notification' in window,
    localStorage: typeof Storage !== 'undefined',
  };
  
  const ready = Object.values(checks).every(Boolean);
  
  if (import.meta.env.DEV) {
    console.log('🔍 Production Readiness Check:', checks);
  }
  
  return ready;
};