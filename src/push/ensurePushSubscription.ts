/**
 * Guard-safe: subscription helper che usa SOLO il loader canonico.
 */
export async function ensurePushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false as const, reason: 'unsupported' };
  }
  try {
    const reg = await navigator.serviceWorker.ready;
    // dynamic import del loader canonico (niente helper VAPID custom)
    const mod = await import('@/lib/vapid-loader');
    const loadVAPIDPublicKey =
      (mod as any).loadVAPIDPublicKey ?? (mod as any).default;
    const toBytes =
      (mod as any).urlBase64ToUint8Array ?? ((k: any) => k);

    const key = await loadVAPIDPublicKey();
    const applicationServerKey =
      typeof key === 'string' ? toBytes(key) : key;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }
    return { ok: true as const, endpoint: sub.endpoint };
  } catch (err) {
    return { ok: false as const, reason: (err as Error)?.message ?? 'error' };
  }
}
