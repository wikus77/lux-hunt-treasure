// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// PWA Push Notifications Hook (replaces Capacitor implementation)

import { useState, useEffect } from 'react';
import { useAndroidPushNotifications } from './useAndroidPushNotifications';
import { useIOSPushNotifications } from './useIOSPushNotifications';

interface UnifiedPushState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: 'granted' | 'denied' | 'prompt' | null;
  isLoading: boolean;
  error: string | null;
  platform: 'ios' | 'android' | 'web' | null;
}

export const useNativePushNotifications = () => {
  // Detect platform using user agent since we're in PWA mode
  const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 
                  /Android/i.test(navigator.userAgent) ? 'android' : 'web';
  
  const androidPush = useAndroidPushNotifications();
  const iosPush = useIOSPushNotifications();

  const [unifiedState, setUnifiedState] = useState<UnifiedPushState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: null,
    isLoading: false,
    error: null,
    platform: platform as 'ios' | 'android' | 'web'
  });

  useEffect(() => {
    if (platform === 'android') {
      setUnifiedState({
        isSupported: androidPush.isSupported,
        isRegistered: androidPush.isRegistered,
        token: androidPush.token,
        permission: androidPush.permission === 'default' ? 'prompt' : androidPush.permission as 'granted' | 'denied' | 'prompt',
        isLoading: androidPush.isLoading,
        error: androidPush.error,
        platform: 'android'
      });
    } else if (platform === 'ios') {
      setUnifiedState({
        isSupported: iosPush.isSupported,
        isRegistered: iosPush.isRegistered,
        token: iosPush.token,
        permission: iosPush.permission === 'default' ? 'prompt' : iosPush.permission as 'granted' | 'denied' | 'prompt',
        isLoading: iosPush.isLoading,
        error: iosPush.error,
        platform: 'ios'
      });
    } else {
      // Web platform - PWA push support
      setUnifiedState({
        isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
        isRegistered: false,
        token: null,
        permission: null,
        isLoading: false,
        error: null,
        platform: 'web'
      });
    }
  }, [
    platform,
    // Only depend on primitive values to prevent infinite loops
    androidPush.isSupported, androidPush.isRegistered, androidPush.token, 
    androidPush.permission, androidPush.isLoading, androidPush.error,
    iosPush.isSupported, iosPush.isRegistered, iosPush.token,
    iosPush.permission, iosPush.isLoading, iosPush.error
  ]);

  const requestPermissionAndRegister = async () => {
    if (platform === 'android') {
      return await androidPush.requestPermissionAndRegister();
    } else if (platform === 'ios') {
      return await iosPush.requestPermissionAndRegister();
    }
    return false;
  };

  return {
    ...unifiedState,
    requestPermissionAndRegister,
    // Platform specific data
    android: androidPush,
    ios: iosPush
  };
};