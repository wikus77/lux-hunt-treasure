// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Minimal, safe shim to satisfy imports and keep behavior.
// Delegates to existing enable/disable logic and canonical VAPID loader.
// No backend or supabase/functions changes.

import { loadVAPIDPublicKey, urlBase64ToUint8Array } from '@/lib/vapid-loader';
import { enableWebPush as coreEnable } from './enableWebPush';
import { disableWebPush as coreDisable } from './disableWebPush';

export type WebPushSubscriptionPayload = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

export type UnifiedSubscription =
  | ({ kind: 'webpush' } & WebPushSubscriptionPayload)
  | ({ kind: 'fcm'; token: string });

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    if (!isPushSupported()) return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
};

// Heuristic used by callers; keep it simple and safe.
export const looksLikeWebPushEndpoint = (endpoint: string): boolean =>
  typeof endpoint === 'string' &&
  endpoint.length > 20 &&
  /^https?:\/\//i.test(endpoint);

// Subscribe using the canonical VAPID loader; return a minimal payload.
// Saving to backend (if any) should already happen in called code paths.
export async function subscribeWebPushAndSave(): Promise<WebPushSubscriptionPayload | null> {
  if (!isPushSupported()) return null;
  const vapid = await loadVAPIDPublicKey();
  const appServerKey = urlBase64ToUint8Array(vapid);

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: appServerKey as unknown as BufferSource,
  });

  return {
    endpoint: sub.endpoint,
    // Some browsers expose keys; guard access to be safe
    keys: {
      p256dh: (sub as any).toJSON?.().keys?.p256dh,
      auth: (sub as any).toJSON?.().keys?.auth,
    },
  };
}

// Re-export core enable/disable for existing callers
export const enableWebPush = coreEnable;
export const disableWebPush = coreDisable;
