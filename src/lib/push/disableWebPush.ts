// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* W3C Web Push Disable Function */

export async function disableWebPush() {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  const endpoint = (JSON.parse(JSON.stringify(sub)) as any).endpoint;
  await sub.unsubscribe().catch(()=>{});

  // opzionale: cancella anche da Supabase
  try {
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,{
      method:'DELETE',
      headers:{
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': 'Bearer <JWT_RUNTIME>',
        'Prefer':'return=minimal'
      }
    });
  } catch {}
}