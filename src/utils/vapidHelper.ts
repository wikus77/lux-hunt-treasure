// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// VAPID Key Utilities for Web Push

/**
 * Convert base64url string to Uint8Array for VAPID key usage
 * Handles padding and character replacement for proper decoding
 */
export function base64UrlToUint8Array(vapid: string): Uint8Array {
  if (!vapid || typeof vapid !== 'string') {
    throw new Error('VAPID key must be a valid string');
  }

  const trimmed = vapid.trim();
  if (trimmed.length === 0) {
    throw new Error('VAPID key cannot be empty');
  }

  try {
    // Add proper padding
    const pad = '='.repeat((4 - (trimmed.length % 4)) % 4);
    
    // Convert base64url to base64
    const base64 = (trimmed + pad)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Decode base64 to binary string
    const raw = atob(base64);
    
    // Convert to Uint8Array
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      output[i] = raw.charCodeAt(i);
    }
    
    return output;
  } catch (error) {
    throw new Error(`Failed to decode VAPID key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate VAPID key format (basic checks)
 */
export function isValidVAPIDKey(vapid: string): boolean {
  if (!vapid || typeof vapid !== 'string') return false;
  
  try {
    const decoded = base64UrlToUint8Array(vapid);
    // VAPID public keys should be 65 bytes for P-256
    return decoded.length === 65;
  } catch {
    return false;
  }
}

/**
 * Get VAPID key info for debugging
 */
export function getVAPIDKeyInfo(vapid: string): {
  isValid: boolean;
  length: number;
  preview: string;
  error?: string;
} {
  try {
    const decoded = base64UrlToUint8Array(vapid);
    return {
      isValid: decoded.length === 65,
      length: decoded.length,
      preview: vapid.substring(0, 12) + '...'
    };
  } catch (error) {
    return {
      isValid: false,
      length: 0,
      preview: vapid.substring(0, 12) + '...',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}