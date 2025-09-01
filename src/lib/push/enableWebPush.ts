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
  const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;
  if (!vapid) throw new Error('VITE_VAPID_PUBLIC_KEY mancante');

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: b64ToUint8Array(vapid),
  });

  const body = await (async () => {
    const json = JSON.parse(JSON.stringify(sub));
    const { endpoint, keys } = json;
    return {
      endpoint,
      p256dh: keys?.p256dh,
      auth: keys?.auth,
      ua: navigator.userAgent,
    };
  })();

  const url = `${import.meta.env.VITE_SUPA_URL}/functions/v1/push_subscribe`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPA_ANON_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPA_ANON_KEY}`,
      'Origin': window.location.origin,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    await sub.unsubscribe().catch(()=>{});
    throw new Error(`push_subscribe failed: ${res.status}`);
  }
  return sub;
}