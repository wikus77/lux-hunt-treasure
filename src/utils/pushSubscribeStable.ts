// Stable subscribe helper — canonical loader via dynamic import, no sensitive tokens
export async function pushSubscribeStable(): Promise<PushSubscription> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('ServiceWorker not supported');
  }
  const reg = await navigator.serviceWorker.ready;

  // opzionale: pulizia eventuale
  const existing = await reg.pushManager.getSubscription();
  if (existing) { try { await existing.unsubscribe(); } catch {} }

  // carichiamo solo qui gli helper ufficiali (no import static)
  const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
  const pub = await loadVAPIDPublicKey();
  const appKey = urlBase64ToUint8Array(pub);

  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: appKey,
  });
}

export async function getExistingSubscriptionStable(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export default pushSubscribeStable;
