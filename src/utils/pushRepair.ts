// SAFE push repair (canonical loader via dynamic import)
export async function repairPush(): Promise<{ ok: boolean; success?: boolean; message?: string; endpoint?: string; reason?: string; details?: any }> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg || !('pushManager' in reg)) return { ok: false, success: false, message: 'ServiceWorker non disponibile', reason: 'no-sw' };

    // Import dinamico del loader
    const mod = await import('@/lib/vapid-loader');
    const loadKey = mod.loadVAPIDPublicKey;
    const toU8 = mod.urlBase64ToUint8Array;

    const key = await loadKey();
    const appKey = toU8(key);

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appKey,
    });

    return { 
      ok: true, 
      success: true,
      message: 'Subscription riparata con successo',
      endpoint: sub?.endpoint 
    };
  } catch (e: any) {
    return { 
      ok: false, 
      success: false,
      message: e?.message || 'Errore durante la riparazione',
      reason: e?.message || 'error' 
    };
  }
}

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

export async function sendSelfTest(): Promise<{ ok: boolean; success?: boolean; message: string; details?: any }> {
  try {
    if (typeof window === 'undefined') return { ok: false, success: false, message: 'No window (SSR)' };
    if (!('serviceWorker' in navigator)) return { ok: false, success: false, message: 'No ServiceWorker' };

    const supaRef =
      (import.meta as any)?.env?.VITE_SUPABASE_REF ||
      (typeof process !== 'undefined' ? (process as any).env?.VITE_SUPABASE_REF : '');

    if (!supaRef) return { ok: false, success: false, message: 'Missing VITE_SUPABASE_REF' };

    const url = `https://${supaRef}.supabase.co/functions/v1/webpush-self-test`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payload: { title: 'Test M1SSION', body: 'Push test' } })
    });

    if (!res.ok) return { ok: false, success: false, message: `HTTP ${res.status}` };
    const data = await res.json().catch(() => ({}));
    return { ok: true, success: true, message: data?.message ?? 'Self-test sent' };
  } catch (err: any) {
    return { ok: false, success: false, message: err?.message || 'Self-test failed' };
  }
}
