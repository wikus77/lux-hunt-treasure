// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Advanced Safe Web Push Subscribe with platform normalization

import { ensureSWControlled } from './swControl';
import { base64UrlToUint8Array } from './vapidHelper';
import { normalizePlatform, endpointHost, type PushPlatform } from './pushPlatform';

export interface SafeWebPushInput {
  vapidPublic: string;
  platform?: PushPlatform;
  user_id?: string;
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
 * Advanced safe subscription with platform normalization and diagnostics
 */
export async function safeWebPushSubscribe(input: SafeWebPushInput): Promise<SafeWebPushResult | null> {
  try {
    if (SAFE) {
      console.log('[PUSH][SAFE] Starting advanced subscription...', {
        platform: input.platform,
        enforce: ENFORCE,
        hasUserId: !!input.user_id
      });
    }

    // 1) iOS PWA check - only allow in standalone mode
    const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || 
                        (navigator as any).standalone === true;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isIOS && !isStandalone) {
      throw new Error('On iOS, push notifications only work in PWA mode (add to home screen)');
    }

    // 2) Check notification permission
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    // 3) Ensure SW is controlled (may reload page once)
    const controlled = await ensureSWControlled();
    
    if (!controlled) {
      if (SAFE) {
        console.log('[PUSH][SAFE] Page reloaded for SW control, subscription will retry...');
      }
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

    // 6) Clear any existing subscription
    try {
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }
    } catch (error) {
      console.warn('[PUSH][SAFE] Error clearing existing subscription:', error);
    }

    // 7) Convert VAPID key
    let applicationServerKey: Uint8Array;
    try {
      applicationServerKey = base64UrlToUint8Array(input.vapidPublic);
    } catch (error) {
      throw new Error(`Invalid VAPID key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 8) Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    // 9) Extract keys
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');

    if (!p256dhKey || !authKey) {
      throw new Error('Failed to get subscription keys');
    }

    const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

    // 10) Platform normalization and diagnostics
    const host = endpointHost(subscription.endpoint);
    const platformResolved = normalizePlatform(subscription.endpoint, input.platform);

    if (SAFE) {
      console.info('[PUSH][diag]', {
        controller: !!navigator.serviceWorker.controller,
        host,
        platformHint: input.platform,
        platformResolved,
        enforce: ENFORCE
      });
    }

    const platformToSend = ENFORCE ? platformResolved : (input.platform ?? platformResolved);

    const result: SafeWebPushResult = {
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: b64(p256dhKey),
          auth: b64(authKey)
        }
      },
      platform: platformToSend,
      user_id: input.user_id
    };

    if (SAFE) {
      console.log('[PUSH][SAFE] ✅ Subscription created successfully', {
        endpointHost: host,
        platformSent: platformToSend,
        hasUserId: !!result.user_id
      });
    }

    return result;

  } catch (error) {
    console.error('[PUSH][SAFE] ❌ Error:', error);
    throw error;
  }
}