/**
 * WebPush manager Guard-safe:
 * - Nessun helper custom né import VAPID non canonico
 * - Unico punto di verità: '@/lib/vapid-loader'
 */

export interface WebPushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  /** opzionale: preview/debug */
  vapidKey?: string;
}
export type UnifiedSubscription = WebPushSubscriptionPayload;

/** Importa on-demand le utility consentite dal loader canonico */
async function loadKeyAndConverter() {
  const mod = await import('@/lib/vapid-loader');
  return {
    loadPublicKey: mod.loadVAPIDPublicKey as () => Promise<string | Uint8Array>,
    toUint8: mod.urlBase64ToUint8Array as (s: string) => Uint8Array,
  };
}

/** Heuristica blanda per riconoscere endpoint web push */
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

/** Stato supporto/permessi lato browser */
export function getNotificationStatus() {
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const permission: NotificationPermission | null = 'Notification' in window ? Notification.permission : null;
  return { supported, permission };
}
export function isPushSupported(): boolean {
  return getNotificationStatus().supported;
}

/** Ritorna true se esiste già una subscription attiva */
export async function hasActiveSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

/** Crea/recupera la subscription e ritorna il payload serializzabile */
export async function subscribeWebPushAndSave(
  reg: ServiceWorkerRegistration
): Promise<WebPushSubscriptionPayload> {
  const { loadPublicKey, toUint8 } = await loadKeyAndConverter();

  // Chiave solo tramite loader canonico
  const publicKey = await loadPublicKey();
  const keyBytes = typeof publicKey === 'string' ? toUint8(publicKey) : publicKey;
  const applicationServerKey = keyBytes as unknown as BufferSource;

  if (!reg?.pushManager) throw new Error('PushManager non disponibile');

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
    vapidKey: typeof publicKey === 'string' ? publicKey : undefined,
  };
}

/** Enable: si appoggia al SW registrato */
export async function enableWebPush(): Promise<WebPushSubscriptionPayload> {
  if (!isPushSupported()) throw new Error('Push non supportato su questo browser');
  const reg = await navigator.serviceWorker.ready;
  return subscribeWebPushAndSave(reg);
}

/** Disable: annulla la subscription corrente (se presente) */
export async function disableWebPush(): Promise<boolean> {
  if (!isPushSupported()) return true;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) await sub.unsubscribe();
  return true;
}

// ---- Compat layer (append-only) ----

export async function getCurrent(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function getStatus(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  enabled: boolean;
  endpoint?: string;
}> {
  const { supported, permission } = getNotificationStatus();
  const sub = await getCurrent();
  return { supported, permission: (permission ?? 'default'), enabled: !!sub, endpoint: sub?.endpoint };
}

export async function enable(): Promise<void> {
  await enableWebPush();
}

export async function disable(): Promise<void> {
  await disableWebPush();
}

export async function subscribe(_userId?: string): Promise<PushSubscription> {
  const reg = await navigator.serviceWorker.ready;
  await subscribeWebPushAndSave(reg);
  const cur = await reg.pushManager.getSubscription();
  if (!cur) throw new Error('Subscription failed');
  return cur;
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function unsubscribe(): Promise<boolean> {
  return disableWebPush();
}

export function isSupported(): boolean {
  return isPushSupported();
}

/** Facade ad oggetto, per i call-site che importano come "webPushManager" */
export const webPushManager = {
  isPushSupported,
  hasActiveSubscription,
  enableWebPush,
  disableWebPush,
  getNotificationStatus,
  looksLikeWebPushEndpoint,
  subscribeWebPushAndSave,
  // alias compat:
  getCurrent,
  getStatus,
  enable,
  disable,
  subscribe,
  unsubscribe,
  isSupported,
};

// Export standalone richiesti da alcuni componenti
export function isWebPushSupported(): boolean { return isPushSupported(); }
export function isPWAMode(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches ||
         (navigator as any).standalone === true;
}
