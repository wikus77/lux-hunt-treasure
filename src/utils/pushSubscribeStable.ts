// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Stable Push Subscribe for iOS PWA - Race-resistant utility

import { base64UrlToUint8Array } from './vapidHelper';

export interface StableSubscriptionResult {
  sub: PushSubscription;
  endpointHost: string;
  p256dh: string;
  auth: string;
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Isolated and serialized flow: register SW → ready → controller → permission → subscribe
 * Handles iOS PWA race conditions with single reload protection
 */
export async function pushSubscribeStable(): Promise<StableSubscriptionResult> {
  console.info('[STABLE-PUSH] Starting stable subscription flow...');
  
  // Step 1: Register (or reuse) SW on scope "/"
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.info('[STABLE-PUSH] SW registered:', registration.scope);
  } catch (error) {
    console.error('[STABLE-PUSH] SW registration failed:', error);
    throw new Error(`SW registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Step 2: Wait for ready
  const reg = await navigator.serviceWorker.ready;
  console.info('[STABLE-PUSH] SW ready:', reg.scope);
  
  // Step 3: Check controller (iOS race condition handling)
  if (!navigator.serviceWorker.controller) {
    const reloadFlag = sessionStorage.getItem('sw-reloaded-once');
    if (!reloadFlag) {
      console.info('[STABLE-PUSH] No controller, setting reload flag and reloading...');
      sessionStorage.setItem('sw-reloaded-once', 'true');
      location.reload();
      // This will never return
      throw new Error('Page reloaded for SW control');
    } else {
      console.warn('[STABLE-PUSH] Still no controller after reload, proceeding anyway...');
    }
  } else {
    // Clear reload flag on successful controller
    sessionStorage.removeItem('sw-reloaded-once');
    console.info('[STABLE-PUSH] SW controller OK');
  }
  
  // Step 4: Check/request permission
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }
  
  if (Notification.permission !== 'granted') {
    console.info('[STABLE-PUSH] Requesting notification permission...');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }
  }
  
  // Step 5: Get PushManager and check existing subscription
  const pm = reg.pushManager;
  if (!pm) {
    throw new Error('PushManager not available');
  }
  
  let subscription = await pm.getSubscription();
  
  if (subscription) {
    console.info('[STABLE-PUSH] Reusing existing subscription');
  } else {
    // Step 6: Create new subscription
    console.info('[STABLE-PUSH] Creating new subscription...');
    
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID public key not configured');
    }
    
    const applicationServerKey = base64UrlToUint8Array(VAPID_PUBLIC_KEY);
    
    subscription = await pm.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    
    console.info('[STABLE-PUSH] New subscription created');
  }
  
  // Extract keys
  const p256dhKey = subscription.getKey('p256dh');
  const authKey = subscription.getKey('auth');
  
  if (!p256dhKey || !authKey) {
    throw new Error('Failed to get subscription keys');
  }
  
  const p256dh = btoa(String.fromCharCode(...new Uint8Array(p256dhKey)));
  const auth = btoa(String.fromCharCode(...new Uint8Array(authKey)));
  
  // Extract endpoint host
  const endpointHost = (() => {
    try {
      return new URL(subscription.endpoint).host;
    } catch {
      return '';
    }
  })();
  
  console.info('[STABLE-PUSH] ✅ Stable subscription completed', {
    endpointHost,
    keyLengths: { p256dh: p256dh.length, auth: auth.length }
  });
  
  return {
    sub: subscription,
    endpointHost,
    p256dh,
    auth
  };
}