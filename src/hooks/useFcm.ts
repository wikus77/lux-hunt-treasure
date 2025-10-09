import { useState, useEffect, useCallback } from 'react';
import { subscribeWebPushAndSave, type WebPushSubscriptionPayload } from '@/lib/push/webPushManager';

interface UseWebPushState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isLoading: boolean;
  error: string | null;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  savedPayload: WebPushSubscriptionPayload | null;
}

export function useFcm() {
  const [state, setState] = useState<UseWebPushState>({
    isSupported: false,
    permission: null,
    isLoading: false,
    error: null,
    isSubscribed: false,
    subscription: null,
    savedPayload: null,
  });

  const checkSupport = useCallback(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    const permission = supported ? Notification.permission : null;
    setState(s => ({ ...s, isSupported: supported, permission }));
    return supported;
  }, []);

  const getActiveSubscription = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      return await reg.pushManager.getSubscription();
    } catch {
      return null;
    }
  }, []);

  const refreshSubscriptionState = useCallback(async () => {
    const sub = await getActiveSubscription();
    setState(s => ({ ...s, isSubscribed: !!sub, subscription: sub }));
  }, [getActiveSubscription]);

  const enable = useCallback(async () => {
    if (!checkSupport()) {
      setState(s => ({ ...s, error: 'Push non supportato' }));
      throw new Error('Push non supportato');
    }
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const reg = await navigator.serviceWorker.ready;
      const payload = await subscribeWebPushAndSave(reg);
      const sub = await reg.pushManager.getSubscription();
      setState(s => ({
        ...s,
        isLoading: false,
        isSubscribed: !!sub,
        subscription: sub,
        savedPayload: payload,
      }));
      return payload;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Enable push failed';
      setState(s => ({ ...s, isLoading: false, error: msg }));
      throw err;
    }
  }, [checkSupport]);

  useEffect(() => {
    checkSupport();
    void refreshSubscriptionState();
  }, [checkSupport, refreshSubscriptionState]);

  return {
    ...state,
    enable,
    generate: enable, // alias for compatibility
    status: state.isLoading ? 'loading' : state.error ? 'error' : state.isSubscribed ? 'success' : 'idle',
    token: state.savedPayload?.endpoint || null,
    hasActiveSubscription: async () => !!(await getActiveSubscription()),
    isPushSupported: state.isSupported,
  };
}

export default useFcm;
