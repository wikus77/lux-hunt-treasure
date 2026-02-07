// © 2025 Joseph MULÉ – M1SSION™ - Native Push Hook
// React hook wrapper for native push notifications

import { useState, useEffect, useCallback } from 'react';
import { 
  initNativePush, 
  requestPushPermission, 
  getPushState, 
  sendTestPush,
  checkTokenInDatabase,
  isCapacitorNative,
  getPlatform,
  setPushListeners,
  type NativePushState,
  type PushNotificationSchema,
  type ActionPerformed,
} from '@/lib/nativePush';
import { toast } from 'sonner';

export interface UseNativePushReturn {
  // State
  state: NativePushState;
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
  
  // Status checks
  isInitialized: boolean;
  isRegistered: boolean;
  hasPermission: boolean;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  sendTest: () => Promise<{ success: boolean; error?: string }>;
  checkDatabaseToken: () => Promise<{ exists: boolean; token?: any }>;
  refresh: () => void;
  
  // Loading/error
  isLoading: boolean;
  error: string | null;
}

export function useNativePush(): UseNativePushReturn {
  const [state, setState] = useState<NativePushState>(getPushState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsLoading(true);
      try {
        const newState = await initNativePush();
        if (mounted) {
          setState(newState);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    init();

    // Set up listeners for state updates
    setPushListeners({
      registration: (token) => {
        if (mounted) {
          setState(getPushState());
          // 🔇 Toast removed 2026-02-07 (PUSH_FREEZE) - only log in DEV
          if (import.meta.env.DEV) {
            console.log('[useNativePush] ✅ Push token registered');
          }
        }
      },
      registrationError: (err) => {
        if (mounted) {
          setState(getPushState());
          setError(err);
          toast.error(`❌ Push registration failed: ${err}`);
        }
      },
      received: (notification) => {
        if (mounted) {
          setState(getPushState());
          // Show in-app notification
          toast.info(notification.title || 'New notification', {
            description: notification.body,
          });
        }
      },
      actionPerformed: (action) => {
        if (mounted) {
          console.log('[useNativePush] Action performed:', action);
        }
      },
    });

    return () => {
      mounted = false;
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPushPermission();
      setState(getPushState());
      
      if (result.success) {
        toast.success('🔔 Push notifications enabled!');
        return true;
      } else {
        setError(result.error || 'Permission denied');
        toast.error(result.error || 'Permission denied');
        return false;
      }
    } catch (e: any) {
      setError(e.message);
      toast.error(`Error: ${e.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendTest = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await sendTestPush();
      if (result.success) {
        toast.success('🧪 Test push sent!');
      } else {
        toast.error(result.error || 'Failed to send test');
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkDatabaseToken = useCallback(async () => {
    return checkTokenInDatabase();
  }, []);

  const refresh = useCallback(() => {
    setState(getPushState());
  }, []);

  return {
    state,
    isNative: isCapacitorNative(),
    platform: getPlatform(),
    
    isInitialized: state.initialized,
    isRegistered: !!state.token && state.tokenSaved,
    hasPermission: state.permission === 'granted',
    
    requestPermission,
    sendTest,
    checkDatabaseToken,
    refresh,
    
    isLoading,
    error,
  };
}
