// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Robust Web Push Enable Function (JWT-safe, VAPID unified) */

import { getVAPIDUint8 } from '@/lib/config/push';

export async function enableWebPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push API non supportata');
  }

  // 1) Ensure SW registration (iOS PWA can race without controller)
  try {
    if (!navigator.serviceWorker.controller) {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
  } catch {
    // Keep going, ready will still resolve if already registered
  }

  // 2) Permission
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Permesso notifiche negato');

  // 3) Ensure session/token ready (iOS PWA race-safe)
  const { supabase } = await import('@/integrations/supabase/client');
  let { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    await new Promise<void>((resolve) => {
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
        if (s) {
          sub.subscription?.unsubscribe();
          resolve();
        }
      });
      // Fallback timeout to avoid hanging forever
      setTimeout(() => {
        sub.subscription?.unsubscribe();
        resolve();
      }, 3000);
    });
    session = (await supabase.auth.getSession()).data.session;
  }
  const token = session?.access_token;
  if (!token) throw new Error('User non autenticato (JWT mancante)');

  // 4) Get active registration and subscription
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  let createdNew = false;
  if (!sub) {
    const appServerKey = getVAPIDUint8();
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey as unknown as BufferSource,
    });
    createdNew = true;
  }

  // 5) Invoke push-subscribe with explicit Authorization header
  const json = sub.toJSON();
  const body = {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    platform: 'web',
    ua: navigator.userAgent,
  };

  const { data, error } = await supabase.functions.invoke('push-subscribe', {
    body,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) {
    if (createdNew) {
      try { await sub.unsubscribe(); } catch {}
    }
    throw new Error(`push-subscribe failed: ${error.message}`);
  }

  return sub;
}
