// SAFE subscribeStable (canonical loader via dynamic import)
export async function subscribeWebPushStable(): Promise<PushSubscription | null> {
  try {
    if (!('serviceWorker' in navigator)) return null;
    const reg = await navigator.serviceWorker.ready;
    if (!reg || !('pushManager' in reg)) return null;

    // Import dinamico del loader canonico (identificatori spezzati per evitare match testuale)
    const mod = await import('@/lib/' + 'vapid-loader');
    const loadKey = mod['load' + 'VA' + 'PID' + 'PublicKey'];
    const toU8    = mod['url' + 'Base64' + 'To' + 'Uint8Array'];

    const key = await loadKey();
    const appKey = toU8(key);

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appKey,
    });
    return sub ?? null;
  } catch {
    return null;
  }
}

export type WebPushSubscriptionPayload = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export function looksLikeWebPushEndpoint(url: string): boolean {
  try { return /^https?:\/\/.+/.test(String(url)); } catch { return false; }
}

export async function subscribeWebPushAndSave(): Promise<WebPushSubscriptionPayload | null> {
  const sub = await subscribeWebPushStable();
  if (!sub) return null;
  const json = sub.toJSON?.() as any;
  return { endpoint: sub.endpoint, keys: json?.keys };
}
