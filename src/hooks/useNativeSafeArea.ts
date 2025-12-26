// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Native Safe Area Hook - Provides accurate safe area insets across all devices
// With fallback to CSS env() for PWA/browser mode

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Types for safe area insets
export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Default fallback values for common devices
const DEFAULT_INSETS: SafeAreaInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};

// iOS Dynamic Island / Notch approximate values (fallback)
const IOS_FALLBACK_INSETS: SafeAreaInsets = {
  top: 59, // Dynamic Island
  bottom: 34, // Home indicator
  left: 0,
  right: 0
};

/**
 * Detects if running in Capacitor native environment
 */
const isNativeCapacitor = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/**
 * Detects iOS device
 */
const isIOSDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Gets safe area insets from CSS env() - fallback for PWA
 */
const getCSSEnvInsets = (): SafeAreaInsets => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return DEFAULT_INSETS;
  }

  try {
    const style = getComputedStyle(document.documentElement);
    
    const parseInset = (property: string): number => {
      const value = style.getPropertyValue(property).trim();
      if (!value || value === '0px' || value.includes('env(')) {
        return 0;
      }
      return parseInt(value.replace('px', ''), 10) || 0;
    };

    // Try to read from CSS custom properties first (set by native plugin)
    let top = parseInset('--safe-area-inset-top');
    let bottom = parseInset('--safe-area-inset-bottom');
    let left = parseInset('--safe-area-inset-left');
    let right = parseInset('--safe-area-inset-right');

    // If zero, try to compute from env()
    if (top === 0 && bottom === 0) {
      // Create a temporary element to measure env() values
      const testEl = document.createElement('div');
      testEl.style.cssText = `
        position: fixed;
        top: env(safe-area-inset-top, 0px);
        bottom: env(safe-area-inset-bottom, 0px);
        left: env(safe-area-inset-left, 0px);
        right: env(safe-area-inset-right, 0px);
        pointer-events: none;
        visibility: hidden;
      `;
      document.body.appendChild(testEl);
      
      const rect = testEl.getBoundingClientRect();
      top = rect.top;
      bottom = window.innerHeight - rect.bottom;
      left = rect.left;
      right = window.innerWidth - rect.right;
      
      document.body.removeChild(testEl);
    }

    return { top, bottom, left, right };
  } catch (error) {
    console.warn('[useNativeSafeArea] Error reading CSS env():', error);
    return DEFAULT_INSETS;
  }
};

/**
 * Gets safe area insets from Capacitor native plugin
 */
const getNativeInsets = async (): Promise<SafeAreaInsets | null> => {
  if (!isNativeCapacitor()) {
    return null;
  }

  try {
    // Dynamic import to avoid build errors when not in native mode
    const { SafeArea } = await import('capacitor-plugin-safe-area');
    const result = await SafeArea.getSafeAreaInsets();
    
    console.log('[useNativeSafeArea] ✅ Native insets:', result.insets);
    return result.insets;
  } catch (error) {
    console.warn('[useNativeSafeArea] Native plugin not available:', error);
    return null;
  }
};

/**
 * Hook to get safe area insets with automatic fallback
 * Priority: Native Capacitor > CSS env() > iOS fallback > Default
 */
export const useNativeSafeArea = () => {
  const [insets, setInsets] = useState<SafeAreaInsets>(DEFAULT_INSETS);
  const [source, setSource] = useState<'native' | 'css' | 'fallback' | 'default'>('default');
  const [isReady, setIsReady] = useState(false);

  const updateInsets = useCallback(async () => {
    // 1. Try native Capacitor plugin first
    const nativeInsets = await getNativeInsets();
    if (nativeInsets && (nativeInsets.top > 0 || nativeInsets.bottom > 0)) {
      setInsets(nativeInsets);
      setSource('native');
      setIsReady(true);
      console.log('[useNativeSafeArea] 📱 Using NATIVE insets:', nativeInsets);
      return;
    }

    // 2. Try CSS env() values
    const cssInsets = getCSSEnvInsets();
    if (cssInsets.top > 0 || cssInsets.bottom > 0) {
      setInsets(cssInsets);
      setSource('css');
      setIsReady(true);
      console.log('[useNativeSafeArea] 🌐 Using CSS env() insets:', cssInsets);
      return;
    }

    // 3. Use iOS fallback if on iOS device
    if (isIOSDevice()) {
      setInsets(IOS_FALLBACK_INSETS);
      setSource('fallback');
      setIsReady(true);
      console.log('[useNativeSafeArea] 🍎 Using iOS FALLBACK insets:', IOS_FALLBACK_INSETS);
      return;
    }

    // 4. Default (Android without notch, or desktop)
    setInsets(DEFAULT_INSETS);
    setSource('default');
    setIsReady(true);
    console.log('[useNativeSafeArea] 💻 Using DEFAULT insets (no safe area needed)');
  }, []);

  useEffect(() => {
    updateInsets();

    // Listen for orientation changes
    const handleResize = () => {
      setTimeout(updateInsets, 100);
    };

    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateInsets]);

  // Computed values for common use cases
  const headerOffset = insets.top + 72; // Safe area + header height
  const contentOffset = headerOffset + 16; // Header + spacing
  const bottomNavOffset = insets.bottom + 64; // Safe area + nav height

  return {
    insets,
    source,
    isReady,
    // Computed helpers
    headerOffset,
    contentOffset,
    bottomNavOffset,
    // Refresh function
    refresh: updateInsets,
  };
};

export default useNativeSafeArea;


