// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push VAPID for iOS PWA */

import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/push/vapid';

/**
 * Detects if running on iOS in standalone mode (PWA)
 */
function isIOSPWA(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
  
  return isIOS && isStandalone;
}

/**
 * Enables Web Push notifications for iOS PWA using VAPID
 * @param vapidPublicKey - VAPID public key in base64url format
 * @returns Subscription object or null if failed/not supported
 */
export async function enableWebPushIOS(vapidPublicKey: string): Promise<any | null> {
  try {
    // Kill switch check - import the utility
    const { isPushDisabled } = await import('./pushKillSwitch');
    if (isPushDisabled()) {
      console.warn('[PUSH-IOS] Kill switch active, aborting');
      return null;
    }

    // Check basic support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[PUSH-IOS] Service Worker or PushManager not supported');
      return null;
    }

    // Only run on iOS PWA
    if (!isIOSPWA()) {
      console.warn('[PUSH-IOS] Not running on iOS PWA, skipping');
      return null;
    }

    console.log('[PUSH-IOS] Initializing Web Push for iOS PWA');

    // Wait for service worker to be ready with timeout
    const swReadyPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) => 
      setTimeout(() => reject(new Error('SW ready timeout')), 5000)
    );

    const registration = await Promise.race([swReadyPromise, timeoutPromise]);
    
    if (!registration || !registration.active) {
      console.error('[PUSH-IOS] No active service worker found');
      return null;
    }

    // Check current permission
    let permission = Notification.permission;
    
    // Request permission if default
    if (permission === 'default') {
      console.log('[PUSH-IOS] Requesting notification permission');
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.warn('[PUSH-IOS] Notification permission not granted:', permission);
      return null;
    }

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('[PUSH-IOS] Creating new push subscription');
      
      // Convert VAPID key using unified source
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      // Subscribe to push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    } else {
      console.log('[PUSH-IOS] Using existing push subscription');
    }

    // Return subscription as JSON
    const subscriptionJson = subscription.toJSON();
    console.log('[PUSH-IOS] Push subscription ready:', subscriptionJson);
    
    return subscriptionJson;
    
  } catch (error) {
    console.error('[PUSH-IOS] Failed to enable Web Push:', error);
    return null;
  }
}