// Guard-safe: usa SOLO il loader canonico per l'applicationServerKey
export async function registerPush(reg: ServiceWorkerRegistration): Promise<PushSubscription> {
  if (!reg?.pushManager) {
    throw new Error('PushManager non disponibile');
  }
  const mod = await import('@/lib/vapid-loader');
  const loadVAPIDPublicKey = (mod as any).loadVAPIDPublicKey ?? mod.default;
  const urlBase64ToUint8Array = (mod as any).urlBase64ToUint8Array;

  const publicKey = await loadVAPIDPublicKey();
  const applicationServerKey =
    typeof publicKey === 'string' ? urlBase64ToUint8Array(publicKey) : publicKey;

  // Se esiste già, ritorna la subscription corrente
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });
}

export async function hasSubscription(reg: ServiceWorkerRegistration): Promise<boolean> {
  try {
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}
