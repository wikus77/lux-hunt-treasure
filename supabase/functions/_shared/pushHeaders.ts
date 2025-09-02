// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Headers Builder for Different Endpoints */

/**
 * Builds appropriate headers for different push service endpoints
 * @param endpointURL - The push endpoint URL
 * @param vapidJWT - Generated VAPID JWT
 * @param publicKey - VAPID public key (base64url)
 * @returns Headers object for fetch request
 */
export function buildPushHeaders(
  endpointURL: URL, 
  vapidJWT: string, 
  publicKey: string
): Record<string, string> {
  const hostname = endpointURL.hostname;
  
  if (hostname.endsWith('web.push.apple.com')) {
    // Apple Web Push (iOS Safari 16.4+)
    console.log('🍎 Building Apple Web Push headers');
    return {
      'authorization': `vapid t=${vapidJWT}, k=${publicKey}`,
      'Content-Type': 'application/json',
      'TTL': '2419200' // 4 weeks for iOS
    };
  }
  
  if (hostname.endsWith('fcm.googleapis.com')) {
    // Firebase Cloud Messaging
    console.log('🔥 Building FCM Web Push headers');
    return {
      'Authorization': `WebPush ${vapidJWT}`,
      'Crypto-Key': `p256ecdsa=${publicKey}`,
      'Content-Type': 'application/json',
      'TTL': '86400' // 24 hours for FCM
    };
  }
  
  if (hostname.includes('wns.notify.windows.com')) {
    // Windows Push Notification Service
    console.log('🪟 Building WNS headers');
    return {
      'Authorization': `WebPush ${vapidJWT}`,
      'Crypto-Key': `p256ecdsa=${publicKey}`,
      'Content-Type': 'application/json',
      'TTL': '86400'
    };
  }
  
  // Default W3C Web Push (generic)
  console.log('📱 Building generic W3C Web Push headers');
  return {
    'Authorization': `WebPush ${vapidJWT}`,
    'Crypto-Key': `p256ecdsa=${publicKey}`,
    'Content-Type': 'application/json',
    'TTL': '86400'
  };
}

/**
 * Detects endpoint type from URL
 */
export function detectEndpointType(endpoint: string): string {
  if (endpoint.includes('web.push.apple.com')) return 'apns';
  if (endpoint.includes('fcm.googleapis.com')) return 'fcm';
  if (endpoint.includes('wns.notify.windows.com')) return 'wns';
  return 'generic';
}