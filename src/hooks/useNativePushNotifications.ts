// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Unified Native Push Notifications Hook (iOS + Android)

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
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
  const platform = Capacitor.getPlatform();
  
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
        permission: androidPush.permission,
        isLoading: androidPush.isLoading,
        error: androidPush.error,
        platform: 'android'
      });
    } else if (platform === 'ios') {
      setUnifiedState({
        isSupported: iosPush.isSupported,
        isRegistered: iosPush.isRegistered,
        token: iosPush.token,
        permission: iosPush.permission,
        isLoading: iosPush.isLoading,
        error: iosPush.error,
        platform: 'ios'
      });
    } else {
      // Web platform - no native push support
      setUnifiedState({
        isSupported: false,
        isRegistered: false,
        token: null,
        permission: null,
        isLoading: false,
        error: null,
        platform: 'web'
      });
    }
  }, [platform, androidPush, iosPush]);

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