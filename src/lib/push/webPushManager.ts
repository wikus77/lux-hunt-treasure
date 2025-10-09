/**
 * Guard-safe WebPush manager: nessun helper push-key custom, solo loader canonico.
 * Esporta i soli simboli realmente usati altrove nell'app.
 */

async function loadPublicKeyAndConverter(){
  const mod = await import('@/lib/vapid-loader');
  const loadKey = mod.loadVAPIDPublicKey;
  const toU8 = mod.urlBase64ToUint8Array;
  return { loadKey, toU8 };
}

export interface WebPushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  pushKey?: string;
}

export type UnifiedSubscription = WebPushSubscriptionPayload;

/** Heuristica blanda per riconoscere endpoint web-push */
export function looksLikeWebPushEndpoint(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol.startsWith('http') && (
      u.hostname.includes('fcm') ||
      u.pathname.toLowerCase().includes('push') ||
      u.pathname.toLowerCase().includes('send')
    );
  } catch {
    return false;
  }
}

/**
 * Crea/recupera la subscription tramite ServiceWorkerRegistration
 * e ritorna il payload serializzabile. Nessun salvataggio lato server qui.
 */
export async function subscribeWebPushAndSave(
  reg: ServiceWorkerRegistration
): Promise<WebPushSubscriptionPayload> {
  if (!reg?.pushManager) {
    throw new Error('PushManager non disponibile');
  }

  // Carica la chiave pubblica SOLO tramite il loader canonico (dynamic import, token-safe)
  const { loadKey, toU8 } = await loadPublicKeyAndConverter();
  const publicKey = await loadKey();
  const applicationServerKey = (typeof publicKey === 'string') ? toU8(publicKey) : publicKey;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  const raw = sub.toJSON() as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };

  if (!raw?.endpoint || !raw?.keys?.p256dh || !raw?.keys?.auth) {
    throw new Error('Subscription incompleta');
  }

  return {
    endpoint: raw.endpoint,
    keys: { p256dh: raw.keys.p256dh, auth: raw.keys.auth },
    pushKey: typeof publicKey === 'string' ? publicKey : undefined,
  };
}

/** Check if push notifications are supported */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 
         'serviceWorker' in navigator && 
         'PushManager' in window;
}

/** Check if there's an active subscription */
export async function hasActiveSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

/** Get notification permission status */
export async function getNotificationStatus() {
  const permission = typeof window !== 'undefined' ? Notification.permission : 'default';
  const enabled = await hasActiveSubscription();
  const endpoint = enabled ? (await navigator.serviceWorker.ready.then(r => r.pushManager.getSubscription())).endpoint : null;
  
  return {
    permission: permission as NotificationPermission,
    enabled,
    endpoint
  };
}

/** Enable web push notifications */
export async function enableWebPush(): Promise<PushSubscription> {
  if (!isPushSupported()) {
    throw new Error('Push not supported in this browser');
  }

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (sub) return sub;

  const { loadKey, toU8 } = await loadPublicKeyAndConverter();
  const key = await loadKey();
  const applicationServerKey = toU8(key);

  sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });

  return sub;
}

/** Disable web push notifications */
export async function disableWebPush(): Promise<void> {
  if (!isPushSupported()) return;
  
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await sub.unsubscribe();
}

/** WebPush manager facade */
export const webPushManager = {
  isPushSupported,
  hasActiveSubscription,
  getNotificationStatus,
  enable: enableWebPush,
  disable: disableWebPush,
  getStatus: getNotificationStatus,
  subscribeAndSave: subscribeWebPushAndSave
};
