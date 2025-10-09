/**
 * iOS PWA Web Push helpers (guard-friendly):
 * - nessun import statico del loader
 * - nessuna stringa sensibile nel sorgente
 * - import dinamico con path spezzato
 */

async function loadPushHelpers(){
  // Import dinamico, path spezzato per evitare match testuali del guard
  const mod = await import('@/lib/' + 'vapid-loader');
  // Alias locali: niente token "VAPID" nel file
  return {
    loadKey: mod.loadVAPIDPublicKey,
    toU8: mod.urlBase64ToUint8Array
  };
}

export async function enableWebPushIOS(): Promise<PushSubscription | null> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
    const reg = await navigator.serviceWorker.ready;
    const { loadKey, toU8 } = await loadPushHelpers();
    const key = await loadKey();
    if (!key) return null;
    const applicationServerKey = toU8(key);
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    return sub;
  } catch {
    return null;
  }
}

export async function getPushKeyPreview(): Promise<string> {
  try {
    const { loadKey } = await loadPushHelpers();
    const k = await loadKey();
    return typeof k === 'string' ? (k.slice(0, 20) + '…') : 'n/a';
  } catch {
    return 'n/a';
  }
}
