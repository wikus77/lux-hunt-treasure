// M1SSION™ minimal public loader (ESM, no TS)
// Single source of truth: /vapid-public.txt

export async function loadVAPIDPublicKey() {
  const res = await fetch('/vapid-public.txt', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.text()).trim();
}

export function urlBase64ToUint8Array(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const b64 = (base64url + pad)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  if (out.length !== 65 || out[0] !== 0x04) {
    throw new TypeError(`VAPID non valida: len=${out.length}, first=0x${out[0].toString(16)}`);
  }
  return out;
}
