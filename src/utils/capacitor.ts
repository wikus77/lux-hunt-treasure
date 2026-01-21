// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// Capacitor Platform Detection Utilities (WRAP LAYER ONLY)

/**
 * Check if app is running inside Capacitor native wrapper (iOS/Android)
 * This function is used to conditionally render/hide web-specific components
 */
export const isCapacitorNative = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Method 0: Check marker injected by ios-post-sync.sh
  if ((window as any).__CAPACITOR_NATIVE__ === true) {
    return true;
  }
  
  // Method 0b: Check HTML data attribute
  if (document.documentElement.dataset.capacitor === 'true') {
    return true;
  }
  
  const cap = (window as any).Capacitor;
  
  // Method 1: Official Capacitor API
  if (cap?.isNativePlatform) {
    try {
      const result = cap.isNativePlatform();
      if (result === true) return true;
    } catch (e) {
      // Fallback to other methods
    }
  }
  
  // Method 2: Check platform directly
  if (cap?.getPlatform) {
    try {
      const platform = cap.getPlatform();
      if (platform === 'ios' || platform === 'android') {
        return true;
      }
    } catch (e) {
      // Fallback
    }
  }
  
  // Method 3: Check for native plugins (iOS-specific)
  if (cap?.Plugins?.Device || cap?.Plugins?.Haptics || cap?.Plugins?.App) {
    return true;
  }
  
  // Method 4: Protocol check (works in some Capacitor versions)
  if (window.location.protocol === 'capacitor:') {
    return true;
  }
  
  // Method 5: User agent check for WKWebView with Capacitor
  const ua = navigator.userAgent;
  if (ua.includes('Capacitor') || 
      (ua.includes('AppleWebKit') && !ua.includes('Safari') && ua.includes('Mobile'))) {
    // WKWebView without Safari indicates a native wrapper
    // But we need Capacitor object to be sure
    if (cap) return true;
  }
  
  return false;
};

/**
 * Get the current Capacitor platform
 * @returns 'ios' | 'android' | 'web'
 */
export const getCapacitorPlatform = (): 'ios' | 'android' | 'web' => {
  if (typeof window === 'undefined') return 'web';
  
  const cap = (window as any).Capacitor;
  
  if (cap?.getPlatform) {
    try {
      const platform = cap.getPlatform();
      if (platform === 'ios' || platform === 'android') {
        return platform;
      }
    } catch (e) {
      // Fallback
    }
  }
  
  // User agent fallback
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && isCapacitorNative()) {
    return 'ios';
  }
  if (/Android/.test(ua) && isCapacitorNative()) {
    return 'android';
  }
  
  return 'web';
};

/**
 * Check if running in iOS Capacitor wrapper
 */
export const isCapacitorIOS = (): boolean => {
  return getCapacitorPlatform() === 'ios';
};

/**
 * Check if running in Android Capacitor wrapper  
 */
export const isCapacitorAndroid = (): boolean => {
  return getCapacitorPlatform() === 'android';
};

/**
 * Check if running as a PWA (standalone mode, not native)
 */
export const isPWAStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Already in Capacitor native = not PWA
  if (isCapacitorNative()) return false;
  
  // Check for standalone display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // iOS Safari standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
};

/**
 * Check if running in any "app-like" environment (Capacitor or PWA)
 */
export const isAppEnvironment = (): boolean => {
  return isCapacitorNative() || isPWAStandalone();
};

// Debug helper - call this from browser console
if (typeof window !== 'undefined') {
  (window as any).__M1_CAPACITOR_DEBUG = () => {
    const cap = (window as any).Capacitor;
    console.log('🔍 M1SSION™ Capacitor Debug:');
    console.log('  - window.Capacitor exists:', !!cap);
    console.log('  - isNativePlatform():', cap?.isNativePlatform?.() ?? 'N/A');
    console.log('  - getPlatform():', cap?.getPlatform?.() ?? 'N/A');
    console.log('  - Plugins:', Object.keys(cap?.Plugins || {}));
    console.log('  - Protocol:', window.location.protocol);
    console.log('  - User Agent:', navigator.userAgent);
    console.log('  - isCapacitorNative():', isCapacitorNative());
    console.log('  - getCapacitorPlatform():', getCapacitorPlatform());
    return {
      isNative: isCapacitorNative(),
      platform: getCapacitorPlatform(),
      isPWA: isPWAStandalone()
    };
  };
}

