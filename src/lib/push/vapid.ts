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
 * Get the VAPID public key from environment
 * Same key must be used on both client and server
 */
export function getVAPIDPublicKey(): string {
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    throw new Error('VITE_VAPID_PUBLIC_KEY not configured');
  }
  return vapidKey;
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