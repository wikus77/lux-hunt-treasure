// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// VAPID Helper - Single source of truth for VAPID operations

/**
 * Load VAPID public key from /vapid-public.txt
 * @returns {Promise<string>} VAPID public key (base64url)
 */
export async function loadVAPIDPublicKey() {
  try {
    const response = await fetch('/vapid-public.txt', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const key = text.trim();
    
    if (!key || key.length < 40) {
      throw new Error('VAPID key too short or empty');
    }
    
    // Validate format (should be base64url)
    if (!/^[A-Za-z0-9_-]+$/.test(key)) {
      throw new Error('Invalid VAPID key format (not base64url)');
    }
    
    return key;
  } catch (error) {
    console.error('❌ Failed to load VAPID public key:', error);
    throw new Error(`VAPID load failed: ${error.message}`);
  }
}

/**
 * Convert base64url string to Uint8Array for VAPID subscription
 * Validates P-256 format (65 bytes, starts with 0x04)
 * @param {string} base64String - Base64url encoded string
 * @returns {Uint8Array} - Binary array for applicationServerKey
 */
export function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    throw new Error('VAPID key is required');
  }

  try {
    // Add padding if needed
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    // Validate P-256 ECDSA key format
    if (outputArray.length !== 65) {
      throw new Error(`Invalid P-256 key length: ${outputArray.length} bytes (expected 65)`);
    }

    if (outputArray[0] !== 0x04) {
      throw new Error(`Invalid P-256 key format: starts with 0x${outputArray[0].toString(16)} (expected 0x04)`);
    }

    return outputArray;
  } catch (error) {
    console.error('❌ VAPID conversion failed:', error);
    throw new Error(`Invalid VAPID key: ${error.message}`);
  }
}

/**
 * Test VAPID key validity (format and conversion)
 * @param {string} key - Base64url VAPID key
 * @returns {Promise<boolean>} - True if valid
 */
export async function testVAPIDKey(key) {
  try {
    const array = urlBase64ToUint8Array(key);
    console.log('✅ VAPID key valid:', array.length, 'bytes, format P-256');
    return true;
  } catch (error) {
    console.error('❌ VAPID key invalid:', error.message);
    return false;
  }
}
