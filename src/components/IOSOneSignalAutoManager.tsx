// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// CRITICAL iOS PWA OneSignal Auto-Initialize Component

import React, { useEffect } from 'react';
import { useIOSPushTokenManager } from '@/hooks/useIOSPushTokenManager';
import { useAuth } from '@/hooks/use-auth';

export const IOSOneSignalAutoManager: React.FC = () => {
  const { user } = useAuth();
  const { debugInfo, isReady } = useIOSPushTokenManager();

  useEffect(() => {
    if (user && isReady) {
      console.log('🔔 CRITICAL iOS PWA: Auto-manager ready for user:', user.id);
      console.log('🔔 CRITICAL iOS PWA: Debug info:', debugInfo);
    }
  }, [user, isReady, debugInfo]);

  // This component doesn't render anything - it's just for side effects
  return null;
};