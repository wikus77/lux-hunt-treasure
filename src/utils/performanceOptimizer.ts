// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Performance Optimization Utilities

// Remove all console.log statements in production
export const removeProductionLogs = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    // Keep console.error for critical debugging
  }
};

// Optimized image loading - REMOVED icon preload to avoid console warnings
// Icons are not critical for initial render and cause "preload not used" warnings
export const optimizeImageLoading = () => {
  // PWA icons are loaded via manifest.webmanifest, no need for preload
  // This prevents console warnings: "resource was preloaded but not used"
};

// Service Worker registration now handled by dedicated swUpdater.ts
// Removed to prevent multiple registrations and iOS PWA loops

// Prefetch critical routes
export const prefetchCriticalRoutes = () => {
  const routes = ['/home', '/map', '/profile'];
  
  routes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
};

// Memory optimization for large data sets
export const optimizeMemoryUsage = () => {
  // Clear unused localStorage entries
  const protectedKeys = ['profileImage', 'user-preferences', 'auth-token'];
  Object.keys(localStorage).forEach(key => {
    if (!protectedKeys.some(protectedKey => key.includes(protectedKey))) {
      // Remove old or unused entries
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove malformed entries
          localStorage.removeItem(key);
        }
      }
    }
  });
};

// Initialize all performance optimizations
export const initPerformanceOptimizations = () => {
  removeProductionLogs();
  optimizeImageLoading();
  // registerServiceWorker() - now handled by swUpdater.ts
  prefetchCriticalRoutes();
  optimizeMemoryUsage();
};
