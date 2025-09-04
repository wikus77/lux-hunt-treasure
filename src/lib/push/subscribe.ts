/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Subscription - FCM & APNs Support
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { getApplicationServerKey } from "./vapid";
import { supabase } from "@/integrations/supabase/client";

/**
 * Unified push subscription for both FCM (desktop/Android) and APNs (iOS Safari)
 * Stores complete PushSubscription in database for server-side sending
 */
export async function ensureSubscription(): Promise<PushSubscription | null> {
  console.log('🔔 Starting unified push subscription process...');

  // Check browser support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('❌ Push notifications not supported in this browser');
    return null;
  }

  // Request permission if needed
  if (Notification.permission === 'default') {
    console.log('📢 Requesting notification permission...');
    await Notification.requestPermission();
  }

  if (Notification.permission !== 'granted') {
    console.warn('❌ Notification permission denied');
    return null;
  }

  console.log('✅ Notification permission granted');

  try {
    // Ensure service worker is ready
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready');

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('📝 Creating new push subscription...');
      
      // Create new subscription with unified VAPID key
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: getApplicationServerKey(),
      });
      
      console.log('✅ Push subscription created');
    } else {
      console.log('✅ Using existing push subscription');
    }

    // Detect platform/endpoint type
    const endpointType = classifyEndpoint(subscription.endpoint);
    console.log(`🎯 Endpoint type detected: ${endpointType}`);

    // Save to Supabase unified push_tokens table
    await saveSubscriptionToDatabase(subscription);

    return subscription;
  } catch (error) {
    console.error('❌ Push subscription failed:', error);
    return null;
  }
}

/**
 * Save complete PushSubscription to database
 */
async function saveSubscriptionToDatabase(subscription: PushSubscription): Promise<void> {
  try {
    console.log('💾 Saving subscription to database...');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('❌ User not authenticated, cannot save subscription');
      return;
    }

    // Prepare device info
    const deviceInfo = {
      ua: navigator.userAgent,
      lang: navigator.language,
      platform: navigator.platform,
      isPWA: (window.matchMedia?.('(display-mode: standalone)').matches) || 
             (navigator as any).standalone === true,
      endpointType: classifyEndpoint(subscription.endpoint)
    };

    // Call unified registration function
    const { error } = await supabase.functions.invoke('register-push-subscription', {
      body: {
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: arrayBufferToBase64(subscription.getKey('auth'))
          }
        },
        device_info: deviceInfo
      }
    });

    if (error) {
      console.error('❌ Failed to save subscription to database:', error);
      throw error;
    }

    console.log('✅ Subscription saved to database successfully');
  } catch (error) {
    console.error('❌ Database save error:', error);
    throw error;
  }
}

/**
 * Classify endpoint type for logging and debugging
 */
function classifyEndpoint(endpoint: string): string {
  if (endpoint.includes('fcm.googleapis.com')) {
    return 'fcm'; // Desktop Chrome, Android
  }
  if (endpoint.includes('web.push.apple.com')) {
    return 'apns'; // iOS Safari PWA
  }
  if (endpoint.includes('wns.notify.windows.com')) {
    return 'wns'; // Windows Edge
  }
  return 'unknown';
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    // Unsubscribe from browser
    await subscription.unsubscribe();
    console.log('✅ Unsubscribed from push notifications');

    // TODO: Remove from database via edge function
    
    return true;
  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    return false;
  }
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */