/* M1SSION™ AG-X0197 */
// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// FCM React Hook

import { useState, useEffect, useCallback } from 'react';
import { getAndSaveFcmToken, getCachedToken, getCachedUserId } from '@/lib/fcm';

interface UseFcmState {
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  token: string | null;
  userId: string | null;
}

interface UseFcmReturn extends UseFcmState {
  generate: () => Promise<void>;
  isSupported: boolean;
  permission: NotificationPermission | null;
}

export function useFcm(userId?: string): UseFcmReturn {
  const [state, setState] = useState<UseFcmState>({
    status: 'idle',
    error: null,
    token: null,
    userId: null
  });

  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  // Check FCM support and cached data on mount
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 
                       'Notification' in window && 
                       'PushManager' in window;
      setIsSupported(supported);
      setPermission(Notification.permission);
    };

    checkSupport();

    // Load cached token if available
    const cachedToken = getCachedToken();
    const cachedUserId = getCachedUserId();
    
    if (cachedToken) {
      setState(prev => ({
        ...prev,
        token: cachedToken,
        userId: cachedUserId,
        status: 'success'
      }));
    }
  }, []);

  const generate = useCallback(async () => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'FCM not supported in this browser'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      status: 'loading',
      error: null
    }));

    try {
      console.log('[M1SSION FCM] hook generate → START');
      const finalUserId = userId || getCachedUserId();
      const token = await getAndSaveFcmToken(finalUserId || undefined);
      
      console.log('[M1SSION FCM] hook generate → SUCCESS');
      setState({
        status: 'success',
        error: null,
        token,
        userId: finalUserId
      });
    } catch (error: any) {
      console.error('[M1SSION FCM] hook generate → ERROR:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to generate FCM token'
      }));
    }
  }, [userId, isSupported]);

  return {
    ...state,
    generate,
    isSupported,
    permission
  };
}