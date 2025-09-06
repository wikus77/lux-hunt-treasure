// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// M1SSION™ VAPID Configuration - Single Source of Truth

/**
 * M1SSION™ VAPID Public Key - P-256 ECDSA Key (65 bytes when decoded)
 * DO NOT CHANGE - Would invalidate all existing subscriptions
 * Base64url encoded, 87 characters, starts with 'B' (uncompressed point indicator)
 */
export const VAPID_PUBLIC_KEY = "BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A";

/**
 * Convert base64url string to Uint8Array for VAPID applicationServerKey
 * Handles proper padding and character replacement for P-256 keys
 * @param base64String - base64url encoded VAPID public key
 * @returns Uint8Array (65 bytes for P-256 uncompressed)
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  try {
    // Add proper padding
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    
    // Convert base64url to base64
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Decode base64 to binary string
    const rawData = atob(base64);
    
    // Convert to Uint8Array
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    // Validate P-256 format (65 bytes, starts with 0x04)
    if (outputArray.length !== 65) {
      throw new Error(`Invalid VAPID key length: ${outputArray.length} bytes (expected 65)`);
    }
    
    if (outputArray[0] !== 0x04) {
      throw new Error(`Invalid VAPID key format: first byte 0x${outputArray[0].toString(16)} (expected 0x04)`);
    }
    
    console.log('✅ VAPID key validated:', {
      length: outputArray.length,
      firstByte: '0x' + outputArray[0].toString(16),
      keyPreview: base64String.substring(0, 12) + '...' + base64String.substring(-8)
    });
    
    return outputArray;
  } catch (error) {
    const errorMsg = `VAPID key validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('❌ VAPID Error:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Get validated application server key for push subscription
 * @returns Uint8Array - validated P-256 public key (65 bytes)
 */
export function getApplicationServerKey(): Uint8Array {
  return urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
}

/**
 * Get VAPID key info for debugging
 */
export function getVAPIDKeyInfo() {
  try {
    const decoded = getApplicationServerKey();
    return {
      valid: true,
      key: VAPID_PUBLIC_KEY,
      keyPreview: VAPID_PUBLIC_KEY.substring(0, 12) + '...' + VAPID_PUBLIC_KEY.substring(-8),
      length: decoded.length,
      firstByte: '0x' + decoded[0].toString(16),
      fullLength: VAPID_PUBLIC_KEY.length
    };
  } catch (error) {
    return {
      valid: false,
      key: VAPID_PUBLIC_KEY,
      keyPreview: VAPID_PUBLIC_KEY.substring(0, 12) + '...' + VAPID_PUBLIC_KEY.substring(-8),
      error: error instanceof Error ? error.message : 'Unknown error',
      fullLength: VAPID_PUBLIC_KEY.length
    };
  }
}

/**
 * Test if current VAPID key is valid without throwing
 */
export function isVAPIDKeyValid(): boolean {
  try {
    getApplicationServerKey();
    return true;
  } catch {
    return false;
  }
}

// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ