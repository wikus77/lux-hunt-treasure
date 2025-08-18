// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ

export const invalidateMarkerCache = () => {
  console.info('M1MARK-TRACE: CACHE_INVALIDATION_START');
  
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      const markerCacheNames = cacheNames.filter(cacheName => 
        cacheName.includes('markers') || 
        cacheName.includes('rest/v1/markers') ||
        cacheName.includes('rest/v1/buzz_map_markers') ||
        cacheName.includes('rest/v1/qr_codes') ||
        cacheName.includes('functions/v1/claim-marker-reward')
      );
      
      if (markerCacheNames.length > 0) {
        console.info('M1MARK-TRACE: CACHE_INVALIDATION_CACHES', { 
          count: markerCacheNames.length, 
          names: markerCacheNames 
        });
        
        return Promise.all(
          markerCacheNames.map(cacheName => {
            console.log('🗑️ Invalidating cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }
    });
  }
  
  // Clear localStorage marker cache with telemetry
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('marker') || key.includes('qr') || key.includes('m1ssion_marker'))) {
      keysToRemove.push(key);
    }
  }
  
  if (keysToRemove.length > 0) {
    console.info('M1MARK-TRACE: CACHE_INVALIDATION_LOCALSTORAGE', { 
      count: keysToRemove.length, 
      keys: keysToRemove 
    });
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ Removed localStorage key:', key);
    });
  }
  
  console.info('M1MARK-TRACE: CACHE_INVALIDATION_COMPLETE');
};

export const setMarkerOnlineRefresh = () => {
  // Force refresh marker data when coming back online
  if (navigator.onLine) {
    invalidateMarkerCache();
    window.dispatchEvent(new CustomEvent('markerCacheInvalidated'));
  }
};

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', setMarkerOnlineRefresh);
}