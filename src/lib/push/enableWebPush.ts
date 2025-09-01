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

  const url = "https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/push_subscribe";
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk",
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`,
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