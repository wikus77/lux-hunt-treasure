// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - PWA Stub Functions (replacements for Capacitor functions)

// PWA-compatible function to preserve names (simplified)
export const preserveFunctionName = <T extends (...args: any[]) => any>(fn: T, name: string): T => {
  return fn;
};

// PWA environment detection
export const detectPWAEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // M1SSION™ WRAP FIX: Include Capacitor native detection
  const cap = (window as any).Capacitor;
  
  // Check Capacitor FIRST (native app)
  if (cap?.isNativePlatform?.() || 
      ['ios', 'android'].includes(cap?.getPlatform?.() || '') ||
      window.location.protocol === 'capacitor:' ||
      (window as any).__CAPACITOR_NATIVE__ === true) {
    return true;
  }
  
  // Then check PWA standalone mode
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');
};

// PWA navigation handler (simplified)
export const pwaNavigationHandler = (path: string, navigate: any) => {
  console.log('🧭 PWA navigation to:', path);
  navigate(path);
};

// PWA safe area insets
export const getPWASafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  
  const getInset = (side: string) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--safe-area-inset-${side}`)
      .trim();
    
    if (value && value !== `env(safe-area-inset-${side})`) {
      return parseInt(value.replace('px', '')) || 0;
    }
    
    return 0;
  };
  
  return {
    top: getInset('top'),
    bottom: getInset('bottom'),
    left: getInset('left'),
    right: getInset('right')
  };
};

// PWA device orientation
export const getPWADeviceOrientation = () => {
  if (typeof window === 'undefined') return 'portrait';
  
  if (window.screen?.orientation) {
    return window.screen.orientation.type;
  }
  
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
};

// Backward compatibility aliases
export const detectCapacitorEnvironment = detectPWAEnvironment;
export const explicitNavigationHandler = pwaNavigationHandler;
export const getSafeAreaInsets = getPWASafeAreaInsets;
export const getDeviceOrientation = getPWADeviceOrientation;

console.log('✅ M1SSION PWA stubs loaded');