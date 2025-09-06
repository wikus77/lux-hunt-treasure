// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// M1SSION™ Web Push Subscription with Auto-Repair

import { VAPID_PUBLIC_KEY, getApplicationServerKey } from './vapid';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string;
  vapidKey: string;
}

let isSubscribing = false; // Prevent concurrent subscriptions

/**
 * Enhanced Web Push subscription with auto-repair for VAPID key conflicts
 * Handles existing subscriptions with different keys and auto-recreates them
 */
export async function ensureWebPushSubscription(): Promise<PushSubscription | null> {
  if (isSubscribing) {
    console.log('⏳ Subscribe already in progress, skipping...');
    return null;
  }

  try {
    isSubscribing = true;
    
    console.log('🚀 Starting Web Push subscription process...');
    
    // 1. Check browser support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Web Push not supported in this browser');
    }

    // 2. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error(`Notification permission ${permission}`);
    }

    // 3. Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker ready:', registration.scope);

    // 4. Check for existing subscription and validate VAPID key
    let existingSubscription = await registration.pushManager.getSubscription();
    const applicationServerKey = getApplicationServerKey();
    
    if (existingSubscription) {
      console.log('🔍 Found existing subscription:', {
        endpoint: existingSubscription.endpoint.substring(0, 80) + '...',
        hasKeys: !!(existingSubscription as any).keys
      });

      // Check if existing subscription uses different VAPID key
      try {
        // Try to extract applicationServerKey from existing subscription
        const existingOptions = (existingSubscription as any).options;
        if (existingOptions?.applicationServerKey) {
          const existingKey = new Uint8Array(existingOptions.applicationServerKey);
          const currentKey = applicationServerKey;
          
          // Compare keys
          const keysMatch = existingKey.length === currentKey.length && 
            existingKey.every((byte, index) => byte === currentKey[index]);
          
          if (!keysMatch) {
            console.log('🔄 VAPID key mismatch detected, unsubscribing old subscription...');
            await existingSubscription.unsubscribe();
            existingSubscription = null;
          } else {
            console.log('✅ Existing subscription uses correct VAPID key');
            return existingSubscription;
          }
        }
      } catch (keyCheckError) {
        console.log('⚠️ Could not verify existing key, will attempt resubscribe:', keyCheckError);
      }
    }

    // 5. Subscribe with current VAPID key (with retry logic)
    let subscription: PushSubscription;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 Attempting subscription (attempt ${retryCount + 1}/${maxRetries})...`);
        console.log('🔑 Using VAPID key:', VAPID_PUBLIC_KEY.substring(0, 12) + '...' + VAPID_PUBLIC_KEY.slice(-8));
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
        
        console.log('✅ Successfully subscribed to Web Push!');
        break;
        
      } catch (subscribeError: any) {
        console.error(`❌ Subscribe attempt ${retryCount + 1} failed:`, subscribeError);
        
        // Handle specific VAPID key errors
        if (subscribeError.message?.includes('applicationServerKey') || 
            subscribeError.message?.includes('different applicationServerKey') ||
            subscribeError.name === 'InvalidStateError') {
          
          console.log('🔄 VAPID key conflict detected, attempting cleanup...');
          
          // Try to unsubscribe any remaining subscription
          try {
            const conflictSubscription = await registration.pushManager.getSubscription();
            if (conflictSubscription) {
              console.log('🗑️ Unsubscribing conflicting subscription...');
              await conflictSubscription.unsubscribe();
            }
          } catch (cleanupError) {
            console.log('⚠️ Cleanup error (continuing):', cleanupError);
          }
          
          retryCount++;
          if (retryCount < maxRetries) {
            console.log('⏳ Waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
        
        throw subscribeError;
      }
    }

    if (!subscription!) {
      throw new Error('Failed to create subscription after all retries');
    }

    // 6. Save subscription to database (if user is authenticated)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await saveSubscriptionToDatabase(subscription);
        console.log('✅ Subscription saved to database');
      } else {
        console.log('ℹ️ User not authenticated, subscription not saved to database');
      }
    } catch (dbError) {
      console.error('⚠️ Failed to save subscription to database:', dbError);
      // Don't fail the whole process if DB save fails
    }

    return subscription;

  } catch (error) {
    console.error('❌ Web Push subscription failed:', error);
    throw error;
  } finally {
    isSubscribing = false;
  }
}

/**
 * Save subscription to database via Supabase Edge Function
 */
async function saveSubscriptionToDatabase(subscription: PushSubscription): Promise<void> {
  const keys = subscription.getKey ? {
    p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
    auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : ''
  } : { p256dh: '', auth: '' };

  const payload: SubscriptionPayload = {
    endpoint: subscription.endpoint,
    keys,
    userAgent: navigator.userAgent,
    vapidKey: VAPID_PUBLIC_KEY
  };

  console.log('💾 Saving subscription to database:', {
    endpoint: payload.endpoint.substring(0, 80) + '...',
    hasP256dh: !!payload.keys.p256dh,
    hasAuth: !!payload.keys.auth,
    vapidKey: VAPID_PUBLIC_KEY.substring(0, 12) + '...' + VAPID_PUBLIC_KEY.slice(-8)
  });

  const { data, error } = await supabase.functions.invoke('webpush-upsert', {
    body: payload
  });

  if (error) {
    throw new Error(`Database save failed: ${error.message}`);
  }

  console.log('✅ Subscription saved successfully:', data);
}

/**
 * Unsubscribe from Web Push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    console.log('🗑️ Starting Web Push unsubscribe...');
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const success = await subscription.unsubscribe();
      console.log(success ? '✅ Successfully unsubscribed' : '⚠️ Unsubscribe returned false');
      
      // TODO: Remove subscription from database
      // await removeSubscriptionFromDatabase(subscription.endpoint);
      
      return success;
    } else {
      console.log('ℹ️ No subscription found to unsubscribe');
      return true;
    }
  } catch (error) {
    console.error('❌ Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Get current push subscription status and details
 */
export async function getPushSubscriptionInfo() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { 
        supported: false, 
        subscribed: false, 
        error: 'Web Push not supported' 
      };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const keys = subscription.getKey ? {
        p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))).substring(0, 16) + '...' : 'missing',
        auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))).substring(0, 16) + '...' : 'missing'
      } : { p256dh: 'unavailable', auth: 'unavailable' };

      return {
        supported: true,
        subscribed: true,
        subscription: {
          endpoint: subscription.endpoint.substring(0, 80) + '...',
          keys,
          type: 'WEBPUSH'
        }
      };
    } else {
      return {
        supported: true,
        subscribed: false
      };
    }
  } catch (error) {
    return {
      supported: false,
      subscribed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ