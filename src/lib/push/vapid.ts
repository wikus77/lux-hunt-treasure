/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ VAPID Utility Library - Unified Push Support
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

/**
 * Convert base64url string to Uint8Array for VAPID key usage
 * Handles padding and character replacement for proper decoding
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

/**
 * Get the VAPID public key - hardcoded for M1SSION™
 * Same key must be used on both client and server
 */
export function getVAPIDPublicKey(): string {
  return 'BLT_uexaFBpPEX-VqzPy9U-7zMW-vVUGOajLUbL6Ny9eXOhO6Y1nMOaWgJCEKCZzG8X2z6WzXPFOA5MxzJ7Q-o8';
}

/**
 * Get the application server key as Uint8Array for push subscription
 */
export function getApplicationServerKey(): Uint8Array {
  const vapidKey = getVAPIDPublicKey();
  return urlBase64ToUint8Array(vapidKey);
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */