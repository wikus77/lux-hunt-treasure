// M1SSION™ VAPID Client Library - Unified Validation & Decoding
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

// Centralized VAPID public key (base64url, 65 bytes expected)
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q';

/**
 * Robust base64url to Uint8Array decoder with P-256 validation
 * @param base64String - base64url encoded string
 * @returns Uint8Array (validated 65 bytes P-256 uncompressed)
 */
export function urlB64ToUint8Array(base64String: string): Uint8Array {
  try {
    // Add padding if needed
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
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
      keyPreview: base64String.substring(0, 20) + '...'
    });
    
    return outputArray;
  } catch (error) {
    console.error('❌ VAPID key validation failed:', error);
    throw error;
  }
}

/**
 * Get validated application server key for push subscription
 * @returns Uint8Array - validated P-256 public key (65 bytes)
 * @throws Error if VAPID key is invalid
 */
export function getAppServerKey(): Uint8Array {
  try {
    const decoded = urlB64ToUint8Array(VAPID_PUBLIC_KEY);
    
    // Double validation log for diagnostics
    console.log('🔑 Application server key validated:', {
      originalLength: VAPID_PUBLIC_KEY.length,
      decodedLength: decoded.length,
      firstSixBytes: Array.from(decoded.slice(0, 6)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')
    });
    
    return decoded;
  } catch (error) {
    const errorMsg = `Chiave pubblica VAPID non valida (P-256 65B): ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('🚨 VAPID validation blocked subscription:', errorMsg);
    throw new Error(errorMsg);
  }
}

/**
 * Test if current VAPID key is valid without throwing
 * @returns boolean indicating if key is valid
 */
export function isVAPIDKeyValid(): boolean {
  try {
    getAppServerKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get VAPID key diagnostic info
 */
export function getVAPIDKeyInfo() {
  try {
    const decoded = getAppServerKey();
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