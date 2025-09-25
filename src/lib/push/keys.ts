// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Utility functions for Web Push key conversion

/**
 * Safely cast Uint8Array to BufferSource for Web Push API
 */
export const toBufferSource = (u8: Uint8Array): BufferSource => {
  return u8 as unknown as BufferSource;
};

/**
 * Convert base64url string to Uint8Array and cast to BufferSource
 */
export const vapidKeyToBufferSource = (base64String: string): BufferSource => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return toBufferSource(outputArray);
};