import { useState, useEffect, useCallback } from 'react';
import { webPushManager } from '@/lib/push/webPushManager';

interface UseUnifiedPushState {
  enabled: boolean;
  loading: boolean;
  error?: string | null;
  permission: NotificationPermission;
  subscriptionEndpoint?: string | null;
}

export function useUnifiedPush() {
  const [state, setState] = useState<UseUnifiedPushState>({
    enabled: false,
    loading: false,
    error: null,
    permission: (typeof Notification !== 'undefined' ? Notification.permission : 'default'),
    subscriptionEndpoint: null,
  });

  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const status = await webPushManager.getStatus();
        if (!mounted) return;
        setState(s => ({
          ...s,
          enabled: !!status.enabled,
          permission: status.permission ?? s.permission,
          subscriptionEndpoint: status.endpoint ?? null,
          error: null,
        }));
        
        // Get actual subscription object
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          setSubscription(sub);
        }
      } catch (err: any) {
        if (!mounted) return;
        setState(s => ({ ...s, error: err?.message ?? 'Push status read failed' }));
      }
    })();
    return () => { mounted = false; };
  }, []);

  const enable = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      await webPushManager.enable();
      const status = await webPushManager.getStatus();
      
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setSubscription(sub);
      }
      
      setState(s => ({
        ...s,
        loading: false,
        enabled: !!status.enabled,
        permission: status.permission ?? s.permission,
        subscriptionEndpoint: status.endpoint ?? null,
      }));
      return true;
    } catch (err: any) {
      setState(s => ({ ...s, loading: false, error: err?.message ?? 'Enable push failed' }));
      return false;
    }
  }, []);

  const disable = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      await webPushManager.disable();
      const status = await webPushManager.getStatus();
      setSubscription(null);
      setState(s => ({
        ...s,
        loading: false,
        enabled: !!status.enabled,
        permission: status.permission ?? s.permission,
        subscriptionEndpoint: status.endpoint ?? null,
      }));
      return true;
    } catch (err: any) {
      setState(s => ({ ...s, loading: false, error: err?.message ?? 'Disable push failed' }));
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const status = await webPushManager.getStatus();
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setSubscription(sub);
      }
      setState(s => ({
        ...s,
        enabled: !!status.enabled,
        permission: status.permission ?? s.permission,
        subscriptionEndpoint: status.endpoint ?? null,
      }));
    } catch (err: any) {
      setState(s => ({ ...s, error: err?.message ?? 'Refresh push status failed' }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false;
    try {
      const perm = await Notification.requestPermission();
      setState(s => ({ ...s, permission: perm }));
      if (perm === 'granted') {
        return await enable();
      }
      return false;
    } catch (err: any) {
      setState(s => ({ ...s, error: err?.message ?? 'Permission request failed' }));
      return false;
    }
  }, [enable]);

  return { 
    ...state, 
    enable, 
    disable, 
    refresh,
    // Compatibility aliases
    isSupported: webPushManager.isPushSupported(),
    subscription,
    webPushSubscription: subscription,
    subscriptionType: subscription ? 'webpush' : null,
    isLoading: state.loading,
    isSubscribed: state.enabled,
    canSubscribe: state.permission === 'granted' || state.permission === 'default',
    subscribe: enable,
    requestPermission,
    unsubscribe: disable,
  };
}

export type { UseUnifiedPushState };
