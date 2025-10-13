/**
 * Guard-safe advanced subscribe: usa SOLO il loader canonico per l'applicationServerKey.
 */
export async function safeWebPushSubscribeAdvanced(reg: ServiceWorkerRegistration): Promise<PushSubscription> {
  if (!reg?.pushManager) throw new Error('PushManager non disponibile');

  const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
  const key = await loadVAPIDPublicKey();
  const applicationServerKey = typeof key === 'string' ? urlBase64ToUint8Array(key) : key;

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
}

export default safeWebPushSubscribeAdvanced;
