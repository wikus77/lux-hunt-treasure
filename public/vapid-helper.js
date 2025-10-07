// M1SSION™ VAPID Loader - Single Source of Truth: /vapid-public.txt
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// ESM public loader (no TypeScript)

/**
 * Load VAPID public key from /vapid-public.txt
 * @returns {Promise<string>} Base64url encoded VAPID public key
 */
export async function loadVAPIDPublicKey() {
  const res = await fetch('/vapid-public.txt', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.text()).trim();
}

/**
 * Convert base64url string to Uint8Array for VAPID subscription
 * Validates P-256 format (65 bytes, starts with 0x04)
 * @param {string} base64url - Base64url encoded string
 * @returns {Uint8Array} - Binary array for applicationServerKey
 */
export function urlBase64ToUint8Array(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const b64 = (base64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  
  for (let i = 0; i < raw.length; i++) {
    out[i] = raw.charCodeAt(i);
  }
  
  // VAPID P-256 uncompressed: 65 bytes, 0x04 prefix
  if (out.length !== 65 || out[0] !== 0x04) {
    throw new TypeError(`VAPID non valida: len=${out.length}, first=0x${out[0].toString(16)}`);
  }
  
  return out;
}
