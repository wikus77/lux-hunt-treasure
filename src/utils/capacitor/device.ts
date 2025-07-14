// M1SSION™ - Device Capacitor Utilities
import { preserveFunctionName, detectCapacitorEnvironment } from './core';

// Safe area utilities for iOS
export const getSafeAreaInsets = preserveFunctionName(
  () => {
    if (typeof window === 'undefined') {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
    
    // Get CSS environment variables for safe area
    const getInset = (side: string) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--safe-area-inset-${side}`)
        .trim();
      
      if (value && value !== 'env(safe-area-inset-${side})') {
        return parseInt(value.replace('px', '')) || 0;
      }
      
      // Fallback values for different iOS devices
      if (detectCapacitorEnvironment()) {
        switch (side) {
          case 'top': return 44; // Status bar height
          case 'bottom': return 34; // Home indicator height
          case 'left':
          case 'right': return 0;
          default: return 0;
        }
      }
      
      return 0;
    };
    
    return {
      top: getInset('top'),
      bottom: getInset('bottom'),
      left: getInset('left'),
      right: getInset('right')
    };
  },
  'getSafeAreaInsets'
);

// Device orientation utilities
export const getDeviceOrientation = preserveFunctionName(
  () => {
    if (typeof window === 'undefined') return 'portrait';
    
    // Use screen.orientation if available
    if (window.screen?.orientation) {
      return window.screen.orientation.type;
    }
    
    // Fallback to window orientation
    const orientation = (window as any).orientation;
    if (typeof orientation === 'number') {
      return Math.abs(orientation) === 90 ? 'landscape' : 'portrait';
    }
    
    // Final fallback using window dimensions
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  },
  'getDeviceOrientation'
);

console.log('✅ M1SSION Device Capacitor utilities loaded');