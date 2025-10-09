/**
 * Shim compat per vecchi import "@/lib/vapid".
 * Delega al loader unificato di /vapid-public.txt.
 */
let _cache: string | null = null;

export async function loadVAPIDPublicKey(): Promise<string> {
  if (_cache) return _cache;
  try {
    const res = await fetch('/vapid-public.txt', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cache = (await res.text()).trim();
    return _cache;
  } catch (e) {
    const fb = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!fb) throw e;
    _cache = fb.trim();
    return _cache;
  }
}

export function urlBase64ToUint8Array(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  if (out.length !== 65 || out[0] !== 0x04) {
    throw new TypeError(`VAPID non valida: len=${out.length}, first=0x${out[0].toString(16)}`);
  }
  return out;
}

// legacy helpers
export async function getAppServerKey(): Promise<Uint8Array> {
  return urlBase64ToUint8Array(await loadVAPIDPublicKey());
}
// Evita uso di const string hardcoded
export const VAPID_PUBLIC_KEY: never = undefined as never;
