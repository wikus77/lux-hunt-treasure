// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// CRITICAL iOS PWA Push Token Manager - Complete Flow Verification

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import OneSignal from 'react-onesignal';

interface IOSPushDebugInfo {
  isIOS: boolean;
  isPWA: boolean;
  oneSignalReady: boolean;
  playerId: string | null;
  permission: string | null;
  serviceWorkerActive: boolean;
  tokenSaved: boolean;
  lastError: string | null;
  subscriptionState: string | null;
}

export const useIOSPushTokenManager = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<IOSPushDebugInfo>({
    isIOS: false,
    isPWA: false,
    oneSignalReady: false,
    playerId: null,
    permission: null,
    serviceWorkerActive: false,
    tokenSaved: false,
    lastError: null,
    subscriptionState: null
  });

  const tokenCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const initAttempted = useRef(false);

  // Comprehensive iOS PWA environment detection
  const checkEnvironment = useCallback(() => {
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isPWAMode = window.navigator.standalone === true;
    const serviceWorkerSupported = 'serviceWorker' in navigator;
    
    console.log('🔔 CRITICAL iOS PWA: Environment Check:', {
      isIOS: isIOSDevice,
      isPWA: isPWAMode,
      serviceWorkerSupported,
      userAgent: userAgent,
      location: window.location.href
    });

    setDebugInfo(prev => ({
      ...prev,
      isIOS: isIOSDevice,
      isPWA: isPWAMode
    }));

    return { isIOSDevice, isPWAMode, serviceWorkerSupported };
  }, []);

  // Enhanced OneSignal Player ID retrieval with multiple strategies
  const getPlayerIdWithRetry = useCallback(async (maxAttempts: number = 15): Promise<string | null> => {
    console.log('🔔 CRITICAL iOS PWA: Starting Player ID retrieval with', maxAttempts, 'attempts');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔔 CRITICAL iOS PWA: Player ID attempt ${attempt}/${maxAttempts}`);
        
        // Strategy 1: Direct API access
        const directId = await OneSignal.User.PushSubscription.id;
        if (directId && directId !== 'undefined' && directId.length > 10) {
          console.log('✅ CRITICAL iOS PWA: Player ID obtained via direct API:', directId);
          return directId;
        }

        // Strategy 2: Check subscription state
        const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
        console.log(`🔔 CRITICAL iOS PWA: Attempt ${attempt} - Opted in:`, isOptedIn);
        
        if (isOptedIn) {
          // Wait a bit more for ID generation
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryId = await OneSignal.User.PushSubscription.id;
          if (retryId && retryId !== 'undefined' && retryId.length > 10) {
            console.log('✅ CRITICAL iOS PWA: Player ID obtained after opt-in check:', retryId);
            return retryId;
          }
        }

        // Strategy 3: Debug through window object
        if ((window as any).M1SSIONOneSignalDebug) {
          const debugId = await (window as any).M1SSIONOneSignalDebug.getPlayerId();
          if (debugId && debugId !== 'undefined' && debugId.length > 10) {
            console.log('✅ CRITICAL iOS PWA: Player ID obtained via debug utils:', debugId);
            return debugId;
          }
        }

        // Wait before next attempt
        if (attempt < maxAttempts) {
          const delay = Math.min(1000 * attempt, 5000); // Progressive delay up to 5s
          console.log(`🔔 CRITICAL iOS PWA: Waiting ${delay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        console.error(`🔔 CRITICAL iOS PWA: Player ID attempt ${attempt} failed:`, error);
        setDebugInfo(prev => ({ ...prev, lastError: error.message }));
      }
    }

    console.error('❌ CRITICAL iOS PWA: Failed to get Player ID after all attempts');
    return null;
  }, []);

  // Enhanced token saving with comprehensive validation
  const saveTokenToDatabase = useCallback(async (playerId: string, userId: string): Promise<boolean> => {
    if (!playerId || !userId || playerId === 'undefined' || playerId.length < 10) {
      console.error('❌ CRITICAL iOS PWA: Invalid token or user ID:', { playerId, userId });
      return false;
    }

    try {
      console.log('🔐 CRITICAL iOS PWA: Saving token to database...', {
        playerId: playerId.substring(0, 20) + '...',
        userId,
        timestamp: new Date().toISOString()
      });

      // Enhanced upsert with detailed logging
      const { data, error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: userId,
          token: playerId,
          device_type: 'onesignal',
          last_used: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_type'
        })
        .select();

      if (error) {
        console.error('❌ CRITICAL iOS PWA: Database save error:', error);
        
        // Log detailed error to admin_logs
        await supabase
          .from('admin_logs')
          .insert({
            event_type: 'ios_pwa_token_save_error',
            user_id: userId,
            note: 'Failed to save iOS PWA OneSignal token',
            context: 'ios_push_token_manager',
            details: {
              error: error.message,
              playerId: playerId.substring(0, 20) + '...',
              isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
              isPWA: window.navigator.standalone === true,
              timestamp: new Date().toISOString()
            }
          });

        setDebugInfo(prev => ({ ...prev, lastError: error.message, tokenSaved: false }));
        return false;
      }

      console.log('✅ CRITICAL iOS PWA: Token saved successfully to database:', data);
      
      // Log success to admin_logs  
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'ios_pwa_token_saved_success',
          user_id: userId,
          note: 'iOS PWA OneSignal token saved successfully',
          context: 'ios_push_token_manager',
          details: {
            playerId: playerId.substring(0, 20) + '...',
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isPWA: window.navigator.standalone === true,
            tokenLength: playerId.length,
            timestamp: new Date().toISOString()
          }
        });

      setDebugInfo(prev => ({ ...prev, tokenSaved: true, lastError: null }));
      
      toast.success('✅ Token iOS PWA salvato!', {
        description: 'Le notifiche push sono ora attive',
        duration: 5000
      });

      return true;

    } catch (error) {
      console.error('❌ CRITICAL iOS PWA: Exception during token save:', error);
      setDebugInfo(prev => ({ ...prev, lastError: error.message, tokenSaved: false }));
      return false;
    }
  }, []);

  // Main token management flow
  const processTokenRegistration = useCallback(async (forceRefresh: boolean = false) => {
    if (!user || (!forceRefresh && debugInfo.tokenSaved)) {
      console.log('🔔 CRITICAL iOS PWA: Skipping token registration - no user or already saved');
      return;
    }

    const { isIOSDevice, isPWAMode } = checkEnvironment();
    
    if (!isIOSDevice) {
      console.log('🔔 CRITICAL iOS PWA: Not iOS device, skipping iOS-specific token management');
      return;
    }

    try {
      // Check OneSignal readiness
      const oneSignalReady = (window as any).M1SSIONOneSignalDebug !== undefined;
      setDebugInfo(prev => ({ ...prev, oneSignalReady }));

      if (!oneSignalReady) {
        console.log('🔔 CRITICAL iOS PWA: OneSignal not ready yet, waiting...');
        setTimeout(() => processTokenRegistration(forceRefresh), 2000);
        return;
      }

      // Check permission status
      const permission = await OneSignal.Notifications.permission;
      const isOptedIn = await OneSignal.User.PushSubscription.optedIn;
      
      console.log('🔔 CRITICAL iOS PWA: Permission check:', {
        permission,
        isOptedIn,
        isPWA: isPWAMode
      });

      setDebugInfo(prev => ({ 
        ...prev, 
        permission: permission ? 'granted' : 'denied',
        subscriptionState: isOptedIn ? 'opted_in' : 'not_opted_in'
      }));

      if (!permission || !isOptedIn) {
        console.log('🔔 CRITICAL iOS PWA: No permission or not opted in, cannot get token');
        setDebugInfo(prev => ({ ...prev, lastError: 'Permission denied or not opted in' }));
        return;
      }

      // Get Player ID with enhanced retry logic
      const playerId = await getPlayerIdWithRetry(15);
      
      if (!playerId) {
        console.error('❌ CRITICAL iOS PWA: Failed to obtain Player ID');
        setDebugInfo(prev => ({ ...prev, lastError: 'Failed to obtain Player ID after 15 attempts' }));
        return;
      }

      setDebugInfo(prev => ({ ...prev, playerId }));

      // Enhanced OneSignal user configuration
      try {
        await OneSignal.User.addAlias('external_id', user.id);
        await OneSignal.User.addTag('ios_pwa_active', 'true');
        await OneSignal.User.addTag('token_manager_version', '2.0');
        await OneSignal.User.addTag('registration_timestamp', new Date().toISOString());
        console.log('✅ CRITICAL iOS PWA: OneSignal user configuration complete');
      } catch (configError) {
        console.warn('🔔 WARNING iOS PWA: User configuration failed:', configError);
      }

      // Save token to database
      const saveSuccess = await saveTokenToDatabase(playerId, user.id);
      
      if (saveSuccess) {
        console.log('🎯 CRITICAL iOS PWA: Complete token registration flow SUCCESS');
      } else {
        console.error('❌ CRITICAL iOS PWA: Token registration flow FAILED at database save');
      }

    } catch (error) {
      console.error('❌ CRITICAL iOS PWA: Token registration process failed:', error);
      setDebugInfo(prev => ({ 
        ...prev, 
        lastError: `Registration failed: ${error.message}` 
      }));
    }
  }, [user, debugInfo.tokenSaved, checkEnvironment, getPlayerIdWithRetry, saveTokenToDatabase]);

  // Automatic token checking and registration
  useEffect(() => {
    if (!user || initAttempted.current) return;
    
    initAttempted.current = true;
    console.log('🔔 CRITICAL iOS PWA: Starting automatic token registration for user:', user.id);

    // Initial registration attempt
    setTimeout(() => processTokenRegistration(false), 3000);

    // Periodic checks for token registration
    tokenCheckInterval.current = setInterval(() => {
      if (!debugInfo.tokenSaved && debugInfo.oneSignalReady) {
        console.log('🔔 CRITICAL iOS PWA: Periodic token check - attempting registration...');
        processTokenRegistration(false);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
      }
    };
  }, [user, processTokenRegistration]);

  // Manual registration function for user-triggered attempts
  const manualRegistration = useCallback(async () => {
    console.log('🔔 CRITICAL iOS PWA: Manual token registration requested');
    await processTokenRegistration(true);
  }, [processTokenRegistration]);

  return {
    debugInfo,
    manualRegistration,
    checkEnvironment,
    isReady: debugInfo.oneSignalReady && debugInfo.isIOS
  };
};