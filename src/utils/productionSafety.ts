/**
 * © 2025 Joseph MULÉ – M1SSION™
 * Production Safety Utilities - Console Log Management
 */

// Production console override
export const setupProductionConsole = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Override console methods in production
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.log = (...args: any[]) => {
      // Only show critical logs in production
      if (args[0]?.includes('CRITICAL') || args[0]?.includes('ERROR')) {
        originalLog.apply(console, args);
      }
    };
    
    console.warn = originalWarn; // Keep warnings
    console.error = originalError; // Keep errors
    
    // Performance optimization
    console.debug = () => {};
    console.info = () => {};
  }
};

// Service Worker optimization
export const optimizeServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Clean up old service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      const oldRegistrations = registrations.filter(reg => 
        reg.scope.includes('firebase') || 
        reg.scope.includes('workbox') ||
        !reg.active
      );
      
      for (const registration of oldRegistrations) {
        await registration.unregister();
      }
      
      // Register our optimized service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker optimization failed:', error);
    }
  }
};

// Bundle size optimization
export const enableProductionOptimizations = () => {
  // Disable dev tools in production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
      value: { isDisabled: true }
    });
  }
};