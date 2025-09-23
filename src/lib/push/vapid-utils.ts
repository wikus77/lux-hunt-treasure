/**
 * M1SSION™ VAPID Utilities - Common functions for Web Push
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

/**
 * Convert URL-safe base64 string to Uint8Array for VAPID applicationServerKey
 * Handles proper padding and character replacement for Web Push subscriptions
 * @param base64url - base64url encoded string
 * @returns Uint8Array (typically 65 bytes for P-256 uncompressed keys)
 */
export function urlB64ToUint8Array(base64url: string): Uint8Array {
  // Add proper padding
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  
  // Convert base64url to base64
  const base64 = (base64url + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Decode base64 to binary string
  const rawData = atob(base64);
  
  // Convert to Uint8Array
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Extract and convert Web Push subscription keys to base64 strings
 * @param subscription - PushSubscription object
 * @returns Object with p256dh and auth keys as base64 strings
 */
export function extractSubscriptionKeys(subscription: PushSubscription): { p256dh: string; auth: string } {
  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');
  
  if (!p256dhKey || !authKey) {
    throw new Error('Missing subscription keys (p256dh or auth)');
  }
  
  return {
    p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
    auth: btoa(String.fromCharCode(...new Uint8Array(authKey)))
  };
}

/**
 * Determine push provider based on endpoint URL
 * @param endpoint - Web Push endpoint URL
 * @returns Provider string ('apns', 'fcm', 'webpush')
 */
export function detectPushProvider(endpoint: string): 'apns' | 'fcm' | 'webpush' {
  if (endpoint.includes('web.push.apple.com')) {
    return 'apns';
  }
  if (endpoint.includes('googleapis.com')) {
    return 'fcm';
  }
  return 'webpush';
}

/**
 * Get VAPID public key for Web Push subscriptions
 * Uses the backend VAPID key, NOT Firebase FCM key
 */
export function getVAPIDPublicKey(): string {
  // This should be set by the backend or build process
  // NOT the Firebase VAPID key which is only for FCM
  return import.meta.env.VITE_VAPID_PUBLIC_KEY || 
         'BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A';
}