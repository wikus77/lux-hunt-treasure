/**
 * M1SSION™ Push Registration - Unified flow for Safari + Chrome
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { supabase } from '@/integrations/supabase/client';
import { loadVAPIDPublicKey, urlBase64ToUint8Array } from '@/lib/vapid-loader';

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
export async function registerPush(userId: string): Promise<{ endpoint: string; provider: string }> {
  // 1) Check support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported in this browser');
  }

  // 2) Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission denied for notifications');
  }

  // 3) Get service worker registration
  const registration = await navigator.serviceWorker.ready;

  // 4) Clean up old subscription
  const oldSubscription = await registration.pushManager.getSubscription();
  if (oldSubscription) {
    try {
      await oldSubscription.unsubscribe();
    } catch (error) {
      console.warn('Failed to unsubscribe old subscription:', error);
    }
  }

  // 5) Load VAPID key from single source of truth and subscribe
  const vapidKey = await loadVAPIDPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(vapidKey);
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey as unknown as BufferSource,
  });

  // 6) Extract keys
  const getKey = (keyName: 'p256dh' | 'auth'): string => {
    const key = subscription.getKey(keyName);
    if (!key) throw new Error(`Missing ${keyName} key`);
    return btoa(String.fromCharCode(...new Uint8Array(key)));
  };

  // 7) Determine provider
  const endpoint = subscription.endpoint;
  const provider = 
    endpoint.includes('web.push.apple.com') ? 'apns' :
    endpoint.includes('googleapis.com') ? 'fcm' : 'webpush';

  // 8) Determine platform
  const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  // 9) Upsert to database via Edge Function
  const { error } = await supabase.functions.invoke('webpush-upsert', {
    body: {
      user_id: userId,
      endpoint,
      provider,
      p256dh: getKey('p256dh'),
      auth: getKey('auth'),
      keys: { 
        p256dh: getKey('p256dh'), 
        auth: getKey('auth') 
      },
      platform,
      is_active: true
    }
  });

  if (error) {
    console.error('Failed to save push subscription:', error);
    throw new Error(`Failed to save push subscription: ${error.message}`);
  }

  console.log('✅ Push subscription registered successfully:', { endpoint: endpoint.substring(0, 50) + '...', provider, platform });

  return { endpoint, provider };
}

/**
 * Unregister push notifications
 */
export async function unregisterPush(userId: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const endpoint = subscription.endpoint;
      
      // Unsubscribe from browser
      await subscription.unsubscribe();
      
      // Mark as inactive in database
      await supabase.functions.invoke('webpush-upsert', {
        body: {
          user_id: userId,
          endpoint,
          provider: endpoint.includes('web.push.apple.com') ? 'apns' : 
                   endpoint.includes('googleapis.com') ? 'fcm' : 'webpush',
          p256dh: '',
          auth: '',
          keys: { p256dh: '', auth: '' },
          platform: 'desktop',
          is_active: false
        }
      });
      
      console.log('✅ Push subscription unregistered successfully');
    }
  } catch (error) {
    console.error('Failed to unregister push subscription:', error);
    throw error;
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