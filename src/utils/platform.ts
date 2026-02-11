// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Unified Platform Detection Utility
 * 
 * Provides consistent platform detection across the app without
 * depending on native ios/ or android/ code.
 */

import { Capacitor } from '@capacitor/core';

/**
 * Check if running on iOS (any context: browser, PWA, or native)
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if running on Android (any context: browser, PWA, or native)
 */
export function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

/**
 * Check if running inside a native Capacitor app (iOS or Android)
 */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Check if running as Android native app (Capacitor wrapper)
 */
export function isAndroidNative(): boolean {
  return isAndroid() && isNativeApp();
}

/**
 * Check if running as iOS native app (Capacitor wrapper)
 */
export function isIOSNative(): boolean {
  return isIOS() && isNativeApp();
}

/**
 * Check if running as PWA (standalone mode)
 */
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Check if running as iOS PWA specifically
 */
export function isIOSPWA(): boolean {
  return isIOS() && isPWA() && !isNativeApp();
}

/**
 * Get current platform identifier
 */
export type Platform = 'ios-native' | 'android-native' | 'ios-pwa' | 'android-pwa' | 'ios-web' | 'android-web' | 'desktop';

export function getPlatform(): Platform {
  if (isIOSNative()) return 'ios-native';
  if (isAndroidNative()) return 'android-native';
  if (isIOSPWA()) return 'ios-pwa';
  if (isIOS()) return 'ios-web';
  if (isAndroid() && isPWA()) return 'android-pwa';
  if (isAndroid()) return 'android-web';
  return 'desktop';
}

/**
 * Check if assets should be loaded from remote CDN
 * 
 * Android Native: YES (AAB has excluded heavy assets)
 * iOS Native: NO (IPA has all assets locally)
 * Web/PWA: YES (CDN is faster)
 */
export function shouldUseRemoteAssets(): boolean {
  // iOS native has all assets locally - use local
  if (isIOSNative()) return false;
  
  // Android native needs remote due to AAB exclusions
  if (isAndroidNative()) return true;
  
  // Web/PWA can use remote for better CDN caching
  return true;
}

/**
 * Log platform info (debug helper)
 */
export function logPlatformInfo(): void {
  console.log('[Platform]', {
    platform: getPlatform(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isNativeApp: isNativeApp(),
    isIOSNative: isIOSNative(),
    isAndroidNative: isAndroidNative(),
    isPWA: isPWA(),
    shouldUseRemoteAssets: shouldUseRemoteAssets(),
    userAgent: navigator.userAgent.substring(0, 100)
  });
}
