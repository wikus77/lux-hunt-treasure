/**
 * Web Push enabler – usa esclusivamente il loader canonico.
 * Nessun accesso diretto a chiavi/env, niente helper custom.
 */
export async function enableWebPush(): Promise<PushSubscription> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push not supported in this browser');
  }

  // SW deve essere già registrato altrove (vite/pwa setup). Aspettiamo che sia pronto.
  const reg = await navigator.serviceWorker.ready;

  // Se esiste già una subscription, riusala.
  let sub = await reg.pushManager.getSubscription();
  if (sub) return sub;

  // Carica chiave pubblica tramite il loader canonico
  const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
  const key = await loadVAPIDPublicKey(); // stringa base64url
  const applicationServerKey = urlBase64ToUint8Array(key);

  // Crea nuova subscription
  sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });

  return sub;
}

/** Alias compatibile, se altrove veniva importato con nome diverso. */
export const ensureWebPushSubscription = enableWebPush;
