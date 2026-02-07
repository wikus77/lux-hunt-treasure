// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Native Push Permission Trigger - NO UI, just triggers iOS/Android native dialog after login

import React, { useEffect, useRef } from 'react';
import { useNativePush } from '@/hooks/useNativePush';
import { useAuth } from '@/hooks/use-auth';
import { Capacitor } from '@capacitor/core';

/**
 * This component has NO UI - it simply triggers the native iOS/Android 
 * push notification permission dialog after the user logs in.
 * 
 * The native dialog looks like:
 * iOS: "M1SSION vorrebbe inviarti delle notifiche" with Consenti/Non consentire
 * Android: Standard notification permission dialog
 * 
 * IMPORTANTE: Il popup iOS appare SOLO se:
 * 1. L'utente non ha MAI concesso/negato i permessi prima
 * 2. Se l'utente ha già concesso, iOS non mostra più il popup (è già granted)
 * 3. Se l'utente ha negato, deve andare in Impostazioni iOS per riabilitare
 */
export const NativePushPermissionTrigger: React.FC = () => {
  const { user } = useAuth();
  const hasTriggered = useRef(false);
  const previousUserId = useRef<string | null>(null);
  
  const {
    hasPermission,
    isRegistered,
    requestPermission,
    isLoading,
    state,
  } = useNativePush();

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('🔔 [NativePushPermissionTrigger] Not native platform, skipping');
      return;
    }
    
    // Don't run if no user logged in
    if (!user) {
      console.log('🔔 [NativePushPermissionTrigger] No user, resetting trigger');
      hasTriggered.current = false;
      previousUserId.current = null;
      return;
    }
    
    // Detect new login (different user or re-login)
    const isNewLogin = previousUserId.current !== user.id;
    if (isNewLogin) {
      console.log('🔔 [NativePushPermissionTrigger] New login detected, resetting trigger');
      hasTriggered.current = false;
      previousUserId.current = user.id;
    }
    
    // Don't run if already triggered in this component instance
    if (hasTriggered.current) {
      return;
    }
    
    // Don't run while loading
    if (isLoading) {
      console.log('🔔 [NativePushPermissionTrigger] Still loading, waiting...');
      return;
    }
    
    // Log current state
    console.log('🔔 [NativePushPermissionTrigger] State:', {
      hasPermission,
      isRegistered,
      permission: state.permission,
      token: state.token ? 'yes' : 'no',
    });
    
    // SEMPRE richiedi permesso dopo login (iOS mostrerà popup solo se non già granted/denied)
    // Mark as triggered
    hasTriggered.current = true;
    
    // Small delay to let the app settle after login
    const timer = setTimeout(async () => {
      console.log('🔔 [NativePushPermissionTrigger] Requesting native push permission...');
      console.log('🔔 [NativePushPermissionTrigger] Current permission:', state.permission);
      
      try {
        const result = await requestPermission();
        console.log('🔔 [NativePushPermissionTrigger] Permission result:', result);
      } catch (error) {
        console.error('🔔 [NativePushPermissionTrigger] Permission error:', error);
      }
    }, 2500); // 2.5 second delay after login
    
    return () => clearTimeout(timer);
  }, [user, isLoading, requestPermission, hasPermission, isRegistered, state]);

  // This component renders NOTHING - it's just a trigger
  return null;
};

export default NativePushPermissionTrigger;
