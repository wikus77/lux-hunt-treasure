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
  
  // 2) Check existing subscription - only unsubscribe if endpoint differs
  const existingSubscription = await registration.pushManager.getSubscription();
  
  // 3) Create new subscription with backend VAPID public key
  const VAPID_PUBLIC_KEY = getVAPIDPublicKey();
  console.log('🔑 Using VAPID public key for subscription:', VAPID_PUBLIC_KEY.substring(0, 20) + '...');
  
  // If existing subscription with same config, don't recreate
  if (existingSubscription) {
    try {
      const existingKeys = extractSubscriptionKeys(existingSubscription);
      const existingProvider = detectPushProvider(existingSubscription.endpoint);
      
      // Test if we can reuse existing subscription
      console.log('🔄 Found existing subscription, checking if reusable...');
      
      // For now, always create new to ensure proper backend sync
      console.log('🧹 Unsubscribing from existing push subscription for fresh setup');
      await existingSubscription.unsubscribe();
    } catch (error) {
      console.warn('⚠️ Error checking existing subscription:', error);
      await existingSubscription.unsubscribe();
    }
  }
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // 4) Extract and normalize subscription data - always extract p256dh/auth as base64url strings
  const endpoint = subscription.endpoint;
  const keys = extractSubscriptionKeys(subscription);
  const provider = detectPushProvider(endpoint);

  console.log('📱 Push subscription created:', {
    provider,
    endpointHost: new URL(endpoint).hostname,
    hasKeys: !!(keys.p256dh && keys.auth),
    keyLengths: { p256dh: keys.p256dh?.length, auth: keys.auth?.length }
  });

  // 5) Save to backend via webpush-upsert endpoint with 5 required top-level fields
  const payload = {
    user_id: userId,      // REQUIRED
    endpoint,             // REQUIRED  
    provider,             // REQUIRED: 'apns'|'fcm'|'webpush'
    p256dh: keys.p256dh,  // REQUIRED: base64url string
    auth: keys.auth,      // REQUIRED: base64url string
    keys                  // OPTIONAL: nested object
  };

  // Get current user session for Authorization header (NOT Service Role Key)
  const response = await fetch(`https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/webpush-upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getSessionToken()}`, // User JWT, not SRK
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    let errorMessage = `Push registration failed: ${response.status}`;
    
    try {
      const errorJson = JSON.parse(errorData);
      if (errorJson.missing_fields) {
        errorMessage += ` - Missing fields: ${errorJson.missing_fields.join(', ')}`;
      } else if (errorJson.error) {
        errorMessage += ` - ${errorJson.error}`;
      }
    } catch {
      errorMessage += ` - ${errorData}`;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('✅ Push subscription saved to backend:', result);

  return subscription;
}

/**
 * Get session token for authenticated requests
 */
async function getSessionToken(): Promise<string> {
  try {
    // This should be imported from your Supabase client
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No active session found');
    }
    
    return session.access_token;
  } catch (error) {
    console.error('❌ Error getting session token:', error);
    throw new Error('Authentication required for push registration');
  }
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