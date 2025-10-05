// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* W3C Web Push Enable Function */

function b64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64Safe);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function enableWebPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push API non supportata');
  }
  const reg = await navigator.serviceWorker.ready;
  if (Notification.permission !== 'granted') {
    const p = await Notification.requestPermission();
    if (p !== 'granted') throw new Error('permesso negato');
  }
  const vapid = "BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o";
  if (!vapid) throw new Error('VAPID key mancante');

  const key = b64ToUint8Array(vapid);
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: key as unknown as BufferSource,
  });

  const body = await (async () => {
    const json = JSON.parse(JSON.stringify(sub));
    const { endpoint, keys } = json;
    return {
      endpoint,
      keys: { p256dh: keys?.p256dh, auth: keys?.auth },
      ua: navigator.userAgent,
      platform: 'web',
    };
  })();

  // Get auth token from Supabase
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('User not authenticated');
  }

  // Invoke Supabase Edge Function with automatic headers (Authorization + apikey)
  const { data, error } = await supabase.functions.invoke('push-subscribe', {
    body,
  });

  if (error) {
    await sub.unsubscribe().catch(() => {});
    throw new Error(`push-subscribe failed: ${error.message}`);
  }
  return sub;
}