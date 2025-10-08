// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Web Push Hook (replaces FCM)

import { useState, useEffect, useCallback } from 'react';
import { isPushSupported, hasActiveSubscription, enableWebPush } from '@/lib/push/webPushManager';

interface UseWebPushState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  subscription: PushSubscription | null;
  userId: string | null;
}

interface UseWebPushReturn extends UseWebPushState {
  generate: () => Promise<void>;
  isSupported: boolean;
  permission: NotificationPermission | null;
  token: string | null; // endpoint as token for backward compatibility
}

export function useFcm(userId?: string): UseWebPushReturn {
  const [state, setState] = useState<UseWebPushState>({
    status: 'idle',
    error: null,
    subscription: null,
    userId: null
  });

  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  // Check Web Push support and cached data on mount
  useEffect(() => {
    const checkSupport = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);
      setPermission(Notification.permission);
      
      // Load current subscription if available
      const hasSubscription = await hasActiveSubscription();
      if (hasSubscription) {
        setState(prev => ({
          ...prev,
          status: 'success'
        }));
      }
    };

    checkSupport();
  }, []);

  const generate = useCallback(async () => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Web Push not supported in this browser'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      status: 'loading',
      error: null
    }));

    try {
      console.log('[WEBPUSH] hook generate → START');
      const subscription = await enableWebPush();
      
      console.log('[WEBPUSH] hook generate → SUCCESS');
      setState({
        status: 'success',
        error: null,
        subscription,
        userId: userId || null
      });
    } catch (error: any) {
      console.error('[WEBPUSH] hook generate → ERROR:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to generate push subscription'
      }));
    }
  }, [userId, isSupported]);

  return {
    ...state,
    generate,
    isSupported,
    permission,
    token: state.subscription?.endpoint || null // endpoint as token
  };
}
