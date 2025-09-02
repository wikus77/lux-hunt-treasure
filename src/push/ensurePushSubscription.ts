const EDGE = `https://vkjrqirvdvjbemsfzxof.functions.supabase.co`;
const ANON = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`;

function b64uToUint8(s: string) {
  const p = '='.repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + p), c => c.charCodeAt(0));
}

export async function ensurePushSubscription() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Web Push non supportato');
  }
  
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error(`Permission ${perm}`);
  
  const reg = (await navigator.serviceWorker.getRegistration('/')) || 
               (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));
  await navigator.serviceWorker.ready; // assicura attivo
  
  // VAPID dall'edge
  const r = await fetch(`${EDGE}/get-vapid`, { 
    headers: { 
      Authorization: `Bearer ${ANON}`, 
      apikey: ANON 
    } 
  });
  if (!r.ok) throw new Error(`get-vapid ${r.status}`);
  const { publicKey } = await r.json();
  if (!publicKey) throw new Error('VAPID publicKey mancante');
  
  // subscribe
  const sub = await reg.pushManager.subscribe({ 
    userVisibleOnly: true, 
    applicationServerKey: b64uToUint8(publicKey) 
  });
  
  // invio a edge
  const resp = await fetch(`${EDGE}/push_subscribe`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      Authorization: `Bearer ${ANON}`, 
      apikey: ANON 
    },
    body: JSON.stringify({ subscription: sub, ua: navigator.userAgent })
  });
  if (!resp.ok) throw new Error(`push_subscribe ${resp.status}`);
  
  return { sub: await resp.json() };
}