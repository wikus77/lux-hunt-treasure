/**
 * M1SSION™ Push Registration - Unified flow for Safari + Chrome
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { urlB64ToUint8Array, extractSubscriptionKeys, detectPushProvider, getVAPIDPublicKey } from './vapid-utils';

export interface PushRegistrationPayload {
  user_id: string;
  endpoint: string;
  provider: 'apns' | 'fcm' | 'webpush';
  p256dh: string;
  auth: string;
  keys: { p256dh: string; auth: string };
  is_active: boolean;
}

/**
 * Register push notifications for the current user
 * Handles Safari APNs and Chrome FCM with proper VAPID keys
 * @param userId - Current authenticated user ID
 * @returns PushSubscription object if successful
 */
export async function registerPush(userId: string): Promise<PushSubscription> {
  // 1) Get service worker registration
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported in this browser');
  }

  const registration = await navigator.serviceWorker.ready;
  
  // 2) Clean up any existing subscription to avoid duplicates
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    console.log('🧹 Unsubscribing from existing push subscription');
    await existingSubscription.unsubscribe();
  }

  // 3) Create new subscription with backend VAPID public key
  const VAPID_PUBLIC_KEY = getVAPIDPublicKey();
  console.log('🔑 Using VAPID public key for subscription:', VAPID_PUBLIC_KEY.substring(0, 20) + '...');
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // 4) Extract and normalize subscription data
  const endpoint = subscription.endpoint;
  const keys = extractSubscriptionKeys(subscription);
  const provider = detectPushProvider(endpoint);

  console.log('📱 Push subscription created:', {
    provider,
    endpointHost: new URL(endpoint).hostname,
    hasKeys: !!(keys.p256dh && keys.auth)
  });

  // 5) Save to backend via upsert endpoint
  const payload: PushRegistrationPayload = {
    user_id: userId,
    endpoint,
    provider,
    p256dh: keys.p256dh,
    auth: keys.auth,
    keys,
    is_active: true
  };

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webpush-upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Push registration failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Push subscription saved to backend:', result);

  return subscription;
}

/**
 * Check if push notifications are supported and permission status
 */
export function checkPushSupport() {
  const canUseNotif = typeof window !== 'undefined' && 'Notification' in window;
  const canUseSW = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  
  return {
    supported: canUseNotif && canUseSW,
    permission: canUseNotif ? Notification.permission : 'denied',
    isPWA: typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
  };
}

/**
 * Request notification permission with user-friendly flow
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    throw new Error('Notifications are blocked. Please enable them in browser settings.');
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission;
}