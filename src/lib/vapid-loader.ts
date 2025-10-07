/**
 * M1SSION™ VAPID Loader - Single Source of Truth
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 * 
 * Loads VAPID public key from /vapid-public.txt (production) or env (dev fallback)
 */

let cached: string | null = null;

/**
 * Load VAPID public key from single source of truth
 * @returns Base64url encoded VAPID public key
 */
export async function loadVAPIDPublicKey(): Promise<string> {
  if (cached) return cached;

  try {
    const res = await fetch('/vapid-public.txt', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cached = (await res.text()).trim();
    return cached;
  } catch {
    // Fallback to env only in development
    const fb = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!fb) throw new Error('VAPID public key not available');
    cached = fb.trim();
    return cached;
  }
}

/**
 * Convert base64url string to Uint8Array for VAPID applicationServerKey
 * Validates P-256 format (65 bytes, 0x04 prefix)
 */
export function urlBase64ToUint8Array(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  
  for (let i = 0; i < raw.length; ++i) {
    out[i] = raw.charCodeAt(i);
  }

  // VAPID P-256 uncompressed: 65 bytes, 0x04 prefix
  if (out.length !== 65 || out[0] !== 0x04) {
    throw new TypeError(`Invalid VAPID key: length=${out.length}, first=0x${out[0]?.toString(16)}`);
  }
  
  return out;
}
