// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// UNIFIED VAPID CONFIGURATION - SINGLE SOURCE OF TRUTH

// VAPID Public Key - P-256 uncompressed point (65 bytes)
// First byte MUST be 0x04, total length 65 bytes when decoded
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q';

/**
 * Validates and converts VAPID public key to Uint8Array
 * @param vapidKey - Base64url encoded VAPID public key
 * @returns Validated Uint8Array (65 bytes, P-256 format)
 * @throws Error if key is invalid
 */
export function validateAndDecodeVAPIDKey(vapidKey: string = VAPID_PUBLIC_KEY): Uint8Array {
  try {
    // Add padding if needed
    const padding = '='.repeat((4 - vapidKey.length % 4) % 4);
    const base64 = (vapidKey + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    // Critical P-256 validation
    if (outputArray.length !== 65) {
      throw new Error(`VAPID key invalid length: ${outputArray.length} bytes (expected 65)`);
    }
    
    if (outputArray[0] !== 0x04) {
      throw new Error(`VAPID key invalid format: first byte 0x${outputArray[0].toString(16)} (expected 0x04)`);
    }

    console.log('✅ VAPID key validated:', {
      length: outputArray.length,
      firstByte: '0x' + outputArray[0].toString(16),
      keyPreview: vapidKey.substring(0, 20) + '...'
    });

    return outputArray;
  } catch (error) {
    console.error('❌ VAPID key validation failed:', error);
    throw error;
  }
}

/**
 * Test if current VAPID key is valid without throwing
 * @returns boolean indicating if key is valid
 */
export function isVAPIDKeyValid(): boolean {
  try {
    validateAndDecodeVAPIDKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get VAPID key info for debugging
 */
export function getVAPIDKeyInfo() {
  try {
    const decoded = validateAndDecodeVAPIDKey();
    return {
      valid: true,
      length: decoded.length,
      firstByte: '0x' + decoded[0].toString(16),
      keyPreview: VAPID_PUBLIC_KEY.substring(0, 20) + '...',
      fullLength: VAPID_PUBLIC_KEY.length
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      keyPreview: VAPID_PUBLIC_KEY.substring(0, 20) + '...',
      fullLength: VAPID_PUBLIC_KEY.length
    };
  }
}