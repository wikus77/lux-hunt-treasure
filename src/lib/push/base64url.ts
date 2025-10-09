/*
 * M1SSION™ Base64 URL Utilities - VAPID Compatible
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

/**
 * Convert base64url string to Uint8Array for VAPID key usage
 * Handles padding and character replacement for proper decoding
 * @param base64url - base64url encoded string
 * @returns Uint8Array for use with Web Push API
 */
export function urlBase64ToUint8Array(base64url: string): Uint8Array {
  const s = (base64url || '').trim();
  
  if (!s) {
    throw new Error('Empty base64url string provided');
  }
  
  // Add proper padding
  const padding = '='.repeat((4 - (s.length % 4)) % 4);
  
  // Convert base64url to base64
  const base64 = (s + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  try {
    const raw = atob(base64);
    return Uint8Array.from({ length: raw.length }, (_, i) => raw.charCodeAt(i));
  } catch (error) {
    throw new Error(`Failed to decode base64url string: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */