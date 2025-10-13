import { useEffect, useState, useCallback } from 'react';

type PushState = {
  supported: boolean;
  permission: NotificationPermission | null;
  loading: boolean;
  error: string | null;
  subscribed: boolean;
};

async function getAppServerKey(): Promise<Uint8Array | string> {
  const mod = await import('@/lib/push-key-loader');
  return mod.loadpush-keyPublicKey();
}

export default function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    supported: 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window,
    permission: typeof Notification !== 'undefined' ? Notification.permission : null,
    loading: false,
    error: null,
    subscribed: false,
  });

  // helper: determina se esiste già una subscription attiva
  const checkActive = useCallback(async () => {
    try {
      if (!state.supported) return false;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return !!sub;
    } catch {
      return false;
    }
  }, [state.supported]);

  // init
  useEffect(() => {
    (async () => {
      const subscribed = await checkActive();
      setState(s => ({ ...s, subscribed }));
    })();
  }, [checkActive]);

  const requestPermission = useCallback(async () => {
    if (!state.supported) return false;
    const perm = await Notification.requestPermission();
    setState(s => ({ ...s, permission: perm }));
    return perm === 'granted';
  }, [state.supported]);

  const subscribe = useCallback(async () => {
    if (!state.supported) throw new Error('Unsupported');
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      if (Notification.permission !== 'granted') {
        const ok = await requestPermission();
        if (!ok) throw new Error('Permission denied');
      }
      const reg = await navigator.serviceWorker.ready;
      const applicationServerKey = await getAppServerKey(); // loader canonico
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      if (!sub) throw new Error('Subscription failed');
      setState(s => ({ ...s, loading: false, subscribed: true }));
      return sub;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Push subscribe error';
      setState(s => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }, [requestPermission, state.supported]);

  const unsubscribe = useCallback(async () => {
    if (!state.supported) return false;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      const ok = sub ? await sub.unsubscribe() : true;
      setState(s => ({ ...s, loading: false, subscribed: false }));
      return ok;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Push unsubscribe error';
      setState(s => ({ ...s, loading: false, error: msg }));
      return false;
    }
  }, [state.supported]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
