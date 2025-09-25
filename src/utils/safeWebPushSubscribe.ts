// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Safe Web Push Subscribe for iOS PWA

import { ensureSWControlled } from './swControl';
import { base64UrlToUint8Array } from './vapidHelper';
import { normalizePlatform, endpointHost, type PushPlatform } from './pushPlatform';

export interface WebPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface SafeWebPushResult {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  platform: string;
  user_id?: string;
}

const SAFE = import.meta.env.VITE_PUSH_SAFE_MODE !== '0';
const ENFORCE = import.meta.env.VITE_PUSH_ENFORCE_PLATFORM === '1';

/**
 * Safely subscribe to Web Push with iOS PWA checks and SW control
 */
export async function subscribeWebPush(vapidPublic: string): Promise<WebPushSubscription | null> {
  try {
    console.log('[WEBPUSH-SUBSCRIBE] Starting safe subscription...');

    // 1) iOS PWA check - only allow in standalone mode
    const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || 
                        (navigator as any).standalone === true;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isIOS && !isStandalone) {
      throw new Error('On iOS, push notifications only work in PWA mode (add to home screen)');
    }

    console.log('[WEBPUSH-SUBSCRIBE] Platform check:', { isIOS, isStandalone });

    // 2) Check notification permission
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      console.log('[WEBPUSH-SUBSCRIBE] Requesting notification permission...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    // 3) Ensure SW is controlled (may reload page once)
    console.log('[WEBPUSH-SUBSCRIBE] Ensuring SW control...');
    const controlled = await ensureSWControlled();
    
    if (!controlled) {
      console.log('[WEBPUSH-SUBSCRIBE] Page reloaded for SW control, subscription will retry...');
      return null; // Page reloaded, function will be called again
    }

    // 4) Check PushManager support
    if (!('PushManager' in window)) {
      throw new Error('Push messaging not supported');
    }

    // 5) Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) {
      throw new Error('Push manager not available');
    }

    console.log('[WEBPUSH-SUBSCRIBE] SW ready, getting push manager...');

    // 6) Clear any existing subscription
    try {
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('[WEBPUSH-SUBSCRIBE] Unsubscribing from existing subscription...');
        await existingSubscription.unsubscribe();
      }
    } catch (error) {
      console.warn('[WEBPUSH-SUBSCRIBE] Error clearing existing subscription:', error);
    }

    // 7) Convert VAPID key
    let applicationServerKey: Uint8Array;
    try {
      applicationServerKey = base64UrlToUint8Array(vapidPublic);
      console.log('[WEBPUSH-SUBSCRIBE] VAPID key converted successfully');
    } catch (error) {
      throw new Error(`Invalid VAPID key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 8) Subscribe to push
    console.log('[WEBPUSH-SUBSCRIBE] Creating new push subscription...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as unknown as BufferSource
    });

    // 9) Extract keys and format response
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');

    if (!p256dhKey || !authKey) {
      throw new Error('Failed to get subscription keys');
    }

    const result: WebPushSubscription = {
      endpoint: subscription.endpoint,
      p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
      auth: btoa(String.fromCharCode(...new Uint8Array(authKey)))
    };

    console.log('[WEBPUSH-SUBSCRIBE] ✅ Subscription created successfully');
    console.log('[WEBPUSH-SUBSCRIBE] Endpoint:', result.endpoint.substring(0, 50) + '...');

    return result;

  } catch (error) {
    console.error('[WEBPUSH-SUBSCRIBE] ❌ Error:', error);
    throw error;
  }
}

/**
 * Check if device supports Web Push in current context
 */
export function isWebPushSupported(): {
  supported: boolean;
  reason?: string;
} {
  if (!('serviceWorker' in navigator)) {
    return { supported: false, reason: 'Service Workers not supported' };
  }

  if (!('PushManager' in window)) {
    return { supported: false, reason: 'Push Manager not supported' };
  }

  if (!('Notification' in window)) {
    return { supported: false, reason: 'Notifications not supported' };
  }

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || 
                      (navigator as any).standalone === true;

  if (isIOS && !isStandalone) {
    return { 
      supported: false, 
      reason: 'On iOS, add this app to your home screen first' 
    };
  }

  return { supported: true };
}

/**
 * Get current subscription status
 */
export async function getCurrentSubscription(): Promise<{
  isSubscribed: boolean;
  isControlled: boolean;
  subscription?: PushSubscription;
}> {
  try {
    if (!('serviceWorker' in navigator)) {
      return { isSubscribed: false, isControlled: false };
    }

    const controlled = !!navigator.serviceWorker.controller;
    
    if (!controlled) {
      return { isSubscribed: false, isControlled: false };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return {
      isSubscribed: !!subscription,
      isControlled: controlled,
      subscription: subscription || undefined
    };
  } catch (error) {
    console.error('[WEBPUSH-SUBSCRIBE] Error checking subscription status:', error);
    return { isSubscribed: false, isControlled: false };
  }
}