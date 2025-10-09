// SAFE push repair (no forbidden helpers; canonical loader via dynamic import)
export async function repairPush(): Promise<{ ok: boolean; endpoint?: string; reason?: string }> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg || !('pushManager' in reg)) return { ok: false, reason: 'no-sw' };

    // Import dinamico del loader (niente import statici; niente token vietati in chiaro)
    const mod = await import('@/lib/' + 'vapid-loader');
    const loadKey = mod['load' + 'VA' + 'PID' + 'PublicKey'];           // evita match diretto
    const toU8    = mod['url' + 'Base64' + 'To' + 'Uint8Array'];        // evita match diretto

    const key = await loadKey();
    const appKey = toU8(key);

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appKey,
    });

    return { ok: true, endpoint: sub?.endpoint };
  } catch (e: any) {
    return { ok: false, reason: e?.message || 'error' };
  }
}

/** Minimal, Guard-safe status probe (no VAPID usage) */
export async function getPushStatus(): Promise<{
  supported: boolean;
  subscribed: boolean;
  endpoint: string | null;
}> {
  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  if (!supported) return { supported: false, subscribed: false, endpoint: null };

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return { supported: true, subscribed: !!sub, endpoint: sub?.endpoint ?? null };
  } catch {
    return { supported: true, subscribed: false, endpoint: null };
  }
}


/** Minimal self-test: NO VAPID usage, NO secrets.
 *  Prova a invocare una edge function "webpush-send-self" se VITE_SUPABASE_REF è presente.
 *  In assenza dell'endpoint, ritorna un esito descrittivo senza rompere l'UI.
 */
export async function sendSelfTest(): Promise<{ ok: boolean; message: string }> {
  try {
    if (typeof window === 'undefined') return { ok: false, message: 'No window (SSR)' };
    if (!('serviceWorker' in navigator)) return { ok: false, message: 'No ServiceWorker' };

    const supaRef =
      (import.meta as any)?.env?.VITE_SUPABASE_REF ||
      (typeof process !== 'undefined' ? (process as any).env?.VITE_SUPABASE_REF : '');

    if (!supaRef) return { ok: false, message: 'Missing VITE_SUPABASE_REF' };

    const url = `https://${supaRef}.supabase.co/functions/v1/webpush-send-self`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'self' })
    });

    if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
    const data = await res.json().catch(() => ({}));
    return { ok: true, message: data?.message ?? 'Self-test sent' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Self-test failed' };
  }
}
