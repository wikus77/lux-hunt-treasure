// M1SSION™ VAPID Client Library - Legacy compatibility wrapper
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// 
// NOTE: This file is deprecated. Use @/lib/vapid-loader instead.
// Kept for backward compatibility only.

import { loadVAPIDPublicKey as _loadKey, urlBase64ToUint8Array as _urlB64 } from '@/lib/vapid-loader';

let _cachedKey: string | null = null;

async function _ensureLoaded(): Promise<string> {
  if (!_cachedKey) _cachedKey = await _loadKey();
  return _cachedKey;
}

export const VAPID_PUBLIC_KEY = 'DEPRECATED_USE_loadVAPIDPublicKey_INSTEAD';

/**
 * @deprecated Use urlBase64ToUint8Array from @/lib/vapid-loader instead
 */
export function urlB64ToUint8Array(base64String: string): Uint8Array {
  return _urlB64(base64String);
}

/**
 * @deprecated Use loadVAPIDPublicKey from @/lib/vapid-loader instead
 */
export async function getAppServerKey(): Promise<Uint8Array> {
  const key = await _ensureLoaded();
  return _urlB64(key);
}

/**
 * @deprecated Use loadVAPIDPublicKey from @/lib/vapid-loader instead
 */
export async function isVAPIDKeyValid(): Promise<boolean> {
  try {
    await getAppServerKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * @deprecated Use loadVAPIDPublicKey from @/lib/vapid-loader instead
 */
export async function getVAPIDKeyInfo() {
  try {
    const key = await _ensureLoaded();
    const decoded = _urlB64(key);
    return {
      valid: true,
      length: decoded.length,
      firstByte: '0x' + decoded[0].toString(16),
      keyPreview: key.substring(0, 20) + '...',
      fullLength: key.length
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      keyPreview: 'ERROR',
      fullLength: 0
    };
  }
}