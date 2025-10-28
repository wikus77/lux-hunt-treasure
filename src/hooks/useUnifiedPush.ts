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

  // M1SSION™ auto-repair guard: await SW ready + backend verification
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // ⭐ Ensure SW ready before reading state
        await navigator.serviceWorker?.ready.catch(() => null);
        
        const status = await webPushManager.getStatus();
        if (!mounted) return;
        
        // M1SSION™ telemetry (dev only)
        if (import.meta.env.DEV) {
          console.debug('[useUnifiedPush:init]', {
            sw_ready: !!navigator.serviceWorker?.controller,
            browser_has_sub: !!status.enabled,
            endpoint_tail: status.endpoint?.slice(-24) || null,
            permission: status.permission
          });
        }
        
        setState(s => ({
          ...s,
          enabled: !!status.enabled,
          permission: status.permission ?? s.permission,
          subscriptionEndpoint: status.endpoint ?? null,
          error: null,
        }));
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

  return {
    ...state,
    enable,
    disable,
    refresh,
    // compat richiesti dai componenti legacy:
    isSupported: webPushManager.isSupported(),
    subscription: null,
    webPushSubscription: state.subscriptionEndpoint,
    subscriptionType: 'webpush' as const,
    isLoading: state.loading,
    isSubscribed: !!state.enabled,
    canSubscribe: !state.enabled && !state.loading,
    subscribe: enable,
    async requestPermission() {
      const perm = await Notification.requestPermission();
      setState(s => ({ ...s, permission: perm }));
      return perm === 'granted';
    },
    unsubscribe: disable,
  };
}

export type { UseUnifiedPushState };
