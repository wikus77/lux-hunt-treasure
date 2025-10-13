import { useEffect, useState, useCallback } from 'react';
import { subscribeWebPushAndSave } from '@/lib/push/webPushManager';

type Status = 'idle' | 'unsupported' | 'blocked' | 'ready' | 'subscribed' | 'error';

interface UsePushNotifications {
  status: Status;
  permission: NotificationPermission | null;
  isSupported: boolean;
  hasSubscription: boolean;
  enable: () => Promise<void>;
  error: string | null;
}

export default function usePushNotifications(): UsePushNotifications {
  const [status, setStatus] = useState<Status>('idle');
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    const p = 'Notification' in window ? Notification.permission : null;
    setPermission(p);

    if (!supported) {
      setStatus('unsupported');
      return;
    }

    if (p === 'denied') setStatus('blocked');
    else if (p === 'granted') setStatus('ready');
    else setStatus('idle');

    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setHasSubscription(!!sub);
        if (sub) setStatus('subscribed');
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const enable = useCallback(async () => {
    try {
      setError(null);

      if (!isSupported) {
        setStatus('unsupported');
        return;
      }

      // chiedi permessi se servono
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') {
          setStatus(perm === 'denied' ? 'blocked' : 'idle');
          return;
        }
      }

      const reg = await navigator.serviceWorker.ready;
      await subscribeWebPushAndSave(reg); // chiave caricata dal loader canonico, dentro il manager
      setHasSubscription(true);
      setStatus('subscribed');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus('error');
      console.error('[usePushNotifications] enable error:', msg);
    }
  }, [isSupported]);

  return { status, permission, isSupported, hasSubscription, enable, error };
}
