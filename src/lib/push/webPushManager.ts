
// Guard-safe: ottiene la chiave VAPID e la converte in Uint8Array in runtime
async function getAppServerKey(): Promise<Uint8Array> {
  const key = await loadVAPIDPublicKey();
  return urlBase64ToUint8Array(key);
}


export type WebPushSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type UnifiedSubscription = {
  type: 'webpush';
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export function looksLikeWebPushEndpoint(endpoint: string): boolean {
  return typeof endpoint === 'string' && endpoint.startsWith('https://') && endpoint.includes('push');
}

export async function subscribeWebPushAndSave(userId?: string): Promise<WebPushSubscriptionPayload | null> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[webPushManager] Push non supportato in questo browser');
      return null;
    }

    const reg = await navigator.serviceWorker.ready;
    const vapid = await loadVAPIDPublicKey();
    const appKey = urlBase64ToUint8Array(vapid);

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appKey as unknown as BufferSource,
    });

    const payload: WebPushSubscriptionPayload = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: (sub.getKey && sub.getKey('p256dh') ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey('p256dh')!)))) : ''),
        auth:   (sub.getKey && sub.getKey('auth')   ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(sub.getKey('auth')!))))   : ''),
      },
    };

    // Salva lato backend via Edge Function standard (env-ified)
    const SB_URL  = (import.meta as any).env?.VITE_SUPABASE_URL  || '';
    const ANON    = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    if (!SB_URL || !ANON) {
      console.warn('[webPushManager] Env mancanti: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
      return payload; // ritorna comunque la sub, chi ci chiama può decidere cosa fare
    }

    const res = await fetch(`${SB_URL}/functions/v1/webpush-upsert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON}`,
        'apikey': ANON,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription: payload,
        userId: userId || null
      })
    });

    if (!res.ok) {
      console.warn('[webPushManager] upsert fallito:', res.status, await res.text());
    }

    return payload;
  } catch (e) {
    console.error('[webPushManager] subscribeWebPushAndSave errore:', e);
    return null;
  }
}


/**
 * Compatibility shim per import legacy:
 *   import { webPushManager } from '@/lib/push/webPushManager'
 * Raggruppa le API già esportate singolarmente.
 */
export const webPushManager = {
  enableWebPush,
  disableWebPush,
  isPushSupported,
  hasActiveSubscription,
  looksLikeWebPushEndpoint,
  subscribeWebPushAndSave,
};
