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
    await fetch(`https://vkjrqirvdvjbemsfzxof.supabase.co/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`,{
      method:'DELETE',
      headers:{
        'apikey': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk",
        'Authorization': 'Bearer <JWT_RUNTIME>',
        'Prefer':'return=minimal'
      }
    });
  } catch {}
}