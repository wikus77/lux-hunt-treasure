const EDGE = 'https://vkjrqirvdvjbemsfzxof.functions.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';

const b64uToUint8 = (s: string) => {
  const p = '='.repeat((4 - s.length % 4) % 4);
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + p);
  return Uint8Array.from(b, c => c.charCodeAt(0));
};

export async function ensurePushSubscription() {
  if (!('Notification' in window) && !('PushManager' in window)) throw new Error('Web Push non supportato');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error(`Permission ${perm}`);
  
  // Register '/sw.js' if not registered
  const reg = (await navigator.serviceWorker.getRegistration('/')) || (await navigator.serviceWorker.register('/sw.js', { scope: '/' }));
  await navigator.serviceWorker.ready;
  
  // Get VAPID public key from our get-vapid endpoint
  const vapidRes = await fetch('/functions/get-vapid');
  if (!vapidRes.ok) throw new Error(`get-vapid ${vapidRes.status}`);
  const { publicKey } = await vapidRes.json();
  if (!publicKey) throw new Error('VAPID publicKey missing');
  
  const key = b64uToUint8(publicKey);
  const sub = await reg.pushManager.subscribe({ 
    userVisibleOnly: true, 
    applicationServerKey: key as unknown as BufferSource 
  });
  
  // Detect endpoint_type for logging
  const endpoint_type = classifyEndpoint(sub.endpoint);
  console.log(`📱 Created subscription: ${endpoint_type} endpoint`);
  
  // Upsert to table push_subscriptions with endpoint, endpoint_type, ua
  const save = await fetch(`${EDGE}/push_subscribe`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}`, apikey: ANON },
    body: JSON.stringify({ subscription: sub, ua: navigator.userAgent })
  });
  if (!save.ok) throw new Error(`push_subscribe ${save.status}`);
  return { endpoint: sub.endpoint, endpoint_type };
}

export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.getRegistration('/');
  if (!reg) return false;
  
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;
  
  // Unsubscribe from browser
  await sub.unsubscribe();
  
  // DELETE from database
  await fetch(`${EDGE}/push_unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}`, apikey: ANON },
    body: JSON.stringify({ endpoint: sub.endpoint })
  });
  
  return true;
}

export function classifyEndpoint(endpoint: string): string {
  if (endpoint.startsWith('https://web.push.apple.com/')) return 'apns';
  if (endpoint.includes('fcm.googleapis.com')) return 'fcm';
  return 'unknown';
}

export async function getCurrentSubscription() {
  const reg = await navigator.serviceWorker.getRegistration('/');
  if (!reg) return null;
  
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return null;
  
  return {
    endpoint: sub.endpoint,
    endpoint_type: classifyEndpoint(sub.endpoint),
    endpoint_short: sub.endpoint.substring(0, 50) + '...'
  };
}

(window as any).ensurePushSubscription = ensurePushSubscription;