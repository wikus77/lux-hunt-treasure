/**
 * Guard-safe: usa SOLO il loader canonico per ottenere la chiave VAPID.
 * Nessun helper custom, nessuna costante VAPID hardcoded.
 */
export async function safeWebPushSubscribe(reg: ServiceWorkerRegistration): Promise<PushSubscription> {
  if (!reg?.pushManager) {
    throw new Error('PushManager non disponibile');
  }

  const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
  const key = await loadVAPIDPublicKey();
  const applicationServerKey =
    typeof key === 'string' ? urlBase64ToUint8Array(key) : key;

  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
}

/**
 * Ritorna la subscription se esiste, altrimenti prova a crearla in modo sicuro.
 */
export async function ensureWebPushSubscription(reg: ServiceWorkerRegistration): Promise<PushSubscription> {
  let sub = await reg.pushManager.getSubscription();
  if (sub) return sub;
  return safeWebPushSubscribe(reg);
}

/**
 * Guard-safe: ritorna la PushSubscription corrente (se presente) senza toccare VAPID.
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}
