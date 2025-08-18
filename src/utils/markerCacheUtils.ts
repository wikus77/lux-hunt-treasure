// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
/**
 * Marker Cache Management Utilities
 * Prevents service worker from caching marker data that should always be fresh
 */

/**
 * Clear any cached marker data to ensure fresh fetches
 */
export const invalidateMarkerCache = async (): Promise<void> => {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          // Clear any Supabase marker-related endpoints
          if (request.url.includes('/rest/v1/markers') || 
              request.url.includes('from=markers') ||
              request.url.includes('markers?')) {
            await cache.delete(request);
            console.log('🧹 M1MARK-TRACE: Cleared cached marker request:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to clear marker cache:', error);
  }
};

/**
 * Check if navigator is online and refresh markers if just came online
 */
export const setupOnlineRefresh = (refreshCallback: () => void): (() => void) => {
  const handleOnline = () => {
    console.log('🌐 M1MARK-TRACE: Network back online, refreshing markers');
    invalidateMarkerCache();
    refreshCallback();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('👁️ M1MARK-TRACE: Page visible, refreshing markers');
      refreshCallback();
    }
  };

  window.addEventListener('online', handleOnline);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};