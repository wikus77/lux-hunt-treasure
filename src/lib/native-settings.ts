// © 2026 M1SSION™ — NIYVORA KFT — Joseph MULÉ
// Native Settings Bridge - WRAP-ONLY utility for opening system settings
// This file provides native bridge functionality for Capacitor wrapped apps

/**
 * Opens the app's system settings page on iOS/Android.
 * Falls back to alert with instructions on web/PWA.
 * 
 * @returns Promise<boolean> - true if settings were opened, false otherwise
 */
export async function openAppSettings(): Promise<boolean> {
  // Check if we're in Capacitor environment
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
  
  if (isCapacitor) {
    try {
      // Dynamically import @capacitor/app to avoid bundle issues in PWA
      const { App } = await import('@capacitor/app');
      
      // On iOS, this opens the app-specific settings page
      // On Android, this opens the app info page
      const platform = (window as any).Capacitor.getPlatform();
      
      if (platform === 'ios') {
        // iOS: UIApplication.openSettingsURLString
        await App.openUrl({ url: 'app-settings:' });
        console.log('✅ M1SSION™ WRAP: Opened iOS Settings');
        return true;
      } else if (platform === 'android') {
        // Android: Open app details settings
        const appInfo = await App.getInfo();
        await App.openUrl({ 
          url: `package:${appInfo.id}` 
        });
        console.log('✅ M1SSION™ WRAP: Opened Android Settings');
        return true;
      }
    } catch (error) {
      console.error('❌ M1SSION™ WRAP: Failed to open settings:', error);
    }
  }
  
  // Fallback for PWA/web
  console.log('ℹ️ M1SSION™: Not in Capacitor, cannot open native settings');
  return false;
}

/**
 * Checks if the app is running in native Capacitor context
 */
export function isNativeApp(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Gets the current platform (ios, android, or web)
 */
export function getNativePlatform(): 'ios' | 'android' | 'web' {
  if ((window as any).Capacitor?.isNativePlatform?.()) {
    return (window as any).Capacitor.getPlatform() as 'ios' | 'android';
  }
  return 'web';
}

