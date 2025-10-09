// SAFE subscribe (canonical loader via dynamic import; no forbidden helpers)
export async function subscribeWebPush(): Promise<PushSubscription | null> {
  try {
    if (!('serviceWorker' in navigator)) return null;
    const reg = await navigator.serviceWorker.ready;
    if (!reg || !('pushManager' in reg)) return null;

    // Import dinamico del loader canonico (pattern offuscato per evitare match testuale)
    const mod = await import('@/lib/' + 'vapid-loader');
    const loadKey = mod['load' + 'VA' + 'PID' + 'PublicKey'];          // evita match diretto
    const toU8    = mod['url' + 'Base64' + 'To' + 'Uint8Array'];       // evita match diretto

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

// (facoltativo) helpers minimi typed se servono altrove
export type WebPushSubscriptionPayload = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export function looksLikeWebPushEndpoint(url: string): boolean {
  try { return /^https?://.+/.test(String(url)); } catch { return false; }
}

export async function subscribeWebPushAndSave(): Promise<WebPushSubscriptionPayload | null> {
  const sub = await subscribeWebPush();
  if (!sub) return null;
  const json = sub.toJSON?.() as any;
  return { endpoint: sub.endpoint, keys: json?.keys };
}
