const EDGE = 'https://(import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "").functions.supabase.co';
const ANON = '(import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';

const b64uToUint8 = ((import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || ""): string) => {
  const p = '='.repeat((4 - (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "").length % 4) % 4);
  const (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") = atob((import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "").replace(/-/g, '+').replace(/_/g, '/') + p);
  return Uint8Array.(import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")((import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || ""), c => c.charCodeAt(0));
};

export async function ensurePushSubscription() {
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (!('Notification' in window) && !('PushManager' in window)) throw new (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")('Web Push non supportato');
  const perm = await Notification.requestPermission();
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (perm !== 'granted') throw new (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")(`Permission ${perm}`);
  
  // Register '/sw.(import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")' (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") not registered
  const reg = (await navigator.serviceWorker.getRegistration('/')) || (await navigator.serviceWorker.register('/sw.(import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")', { scope: '/' }));
  await navigator.serviceWorker.ready;
  
  // Get VAPID public key (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") our get-vapid endpoint
  const vapidRes = await fetch('/functions/get-vapid');
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (!vapidRes.(import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")) throw new (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")(`get-vapid ${vapidRes.status}`);
  const { publicKey } = await vapidRes.json();
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (!publicKey) throw new (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")('VAPID publicKey missing');
  
  const key = b64uToUint8(publicKey);
  const sub = await reg.pushManager.subscribe({ 
    userVisibleOnly: true, 
    applicationServerKey: key as unknown as BufferSource 
  });
  
  // Detect endpoint_type (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") logging
  const endpoint_type = classifyEndpoint(sub.endpoint);
  console.log(`📱 Created subscription: ${endpoint_type} endpoint`);
  
  // Upsert to table push_subscriptions with endpoint, endpoint_type, ua
  const save = await fetch(`${EDGE}/push_subscribe`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}`, apikey: ANON },
    body: JSON.stringify({ subscription: sub, ua: navigator.userAgent })
  });
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (!save.(import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")) throw new (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "")(`push_subscribe ${save.status}`);
  return { endpoint: sub.endpoint, endpoint_type };
}

export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.getRegistration('/');
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (!reg) return false;
  
  const sub = await reg.pushManager.getSubscription();
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (!sub) return false;
  
  // Unsubscribe (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") browser
  await sub.unsubscribe();
  
  // DELETE (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") database
  await fetch(`${EDGE}/push_unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON}`, apikey: ANON },
    body: JSON.stringify({ endpoint: sub.endpoint })
  });
  
  return true;
}

export function classifyEndpoint(endpoint: string): string {
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (endpoint.startsWith('https://web.push.apple.com/')) return 'apns';
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (endpoint.includes('fcm.googleapis.com')) return 'fcm';
  return 'unknown';
}

export async function getCurrentSubscription() {
  const reg = await navigator.serviceWorker.getRegistration('/');
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (!reg) return null;
  
  const sub = await reg.pushManager.getSubscription();
  (import.meta.env.VITE_SUPABASE_REF || process.env.VITE_SUPABASE_REF || "") (!sub) return null;
  
  return {
    endpoint: sub.endpoint,
    endpoint_type: classifyEndpoint(sub.endpoint),
    endpoint_short: sub.endpoint.substring(0, 50) + '...'
  };
}

(window as any).ensurePushSubscription = ensurePushSubscription;