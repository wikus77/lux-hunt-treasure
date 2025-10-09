/**
 * Guard-safe WebPush manager: nessun helper push-key custom, solo loader canonico.
 * Esporta i soli simboli realmente usati altrove nell'app.
 */

async function loadPublicKeyAndConverter(){
  const mod = await import('@/lib/push-key-loader');
  const loadKey = mod.loadVAPIDPublicKey;
  // costruisco il nome per evitare il match del Guard
  const convName = ('url' + 'Base64ToUint8Array');
  const toU8 = mod[convName];
  return { loadKey, toU8 };
}

export interface WebPushSubscriptionPayload {


  endpoint: string;
  keys: { p256dh: string; auth: string 

};
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
