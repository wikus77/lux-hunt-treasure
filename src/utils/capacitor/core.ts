// M1SSION™ - Core Capacitor Utilities

// Critical: Preserve function names for iOS minification compatibility
export const preserveFunctionName = <T extends (...args: any[]) => any>(
  fn: T, 
  name: string
): T => {
  Object.defineProperty(fn, 'name', { value: name, configurable: true });
  return fn;
};

// Capacitor environment detection with explicit function name
export const detectCapacitorEnvironment = preserveFunctionName(
  (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Multiple detection methods for reliability
    const hasCapacitor = !!(window as any).Capacitor;
    const isCapacitorProtocol = window.location.protocol === 'capacitor:';
    const hasCapacitorGlobal = typeof (window as any).Capacitor !== 'undefined';
    
    const isCapacitor = hasCapacitor || isCapacitorProtocol || hasCapacitorGlobal;
    
    console.log('📱 Capacitor Environment Detection:', {
      hasCapacitor,
      isCapacitorProtocol,
      hasCapacitorGlobal,
      result: isCapacitor,
      userAgent: navigator.userAgent
    });
    
    return isCapacitor;
  },
  'detectCapacitorEnvironment'
);

console.log('✅ M1SSION Core Capacitor utilities loaded');