/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Subscription - FCM & APNs Support
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { urlBase64ToUint8Array } from './base64url';
import { supabase } from '@/integrations/supabase/client';

const PUSH_BOUND_KEY = 'm1_push_bound';

/**
 * Unified Web Push subscription with VAPID
 * Handles permission, service worker, and subscription registration
 * Prevents multiple subscriptions per session
 */
export async function ensureWebPushSubscription(): Promise<PushSubscription | null> {
  // Check browser support
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    console.warn('❌ Web Push not supported in this browser');
    return null;
  }

  // Prevent multiple subscriptions per session
  if (sessionStorage.getItem(PUSH_BOUND_KEY)) {
    console.log('✓ Push subscription already established this session');
    
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('❌ Failed to get existing subscription:', error);
      return null;
    }
  }

  // Handle permission - only request if default, proceed only if granted
  if (Notification.permission === 'default') {
    console.log('📢 Requesting notification permission...');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('❌ Notification permission denied');
      return null;
    }
  }

  if (Notification.permission !== 'granted') {
    console.warn('❌ Notification permission not granted');
    return null;
  }

  try {
    // Ensure service worker is ready
    const registration = await navigator.serviceWorker.ready;
    console.log('✅ Service worker ready');

    // Get VAPID public key from environment (using hardcoded for now)
    const vapidKey = 'BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q';
    if (!vapidKey?.trim()) {
      console.error('❌ VAPID_PUBLIC_KEY missing');
      return null;
    }

    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidKey.trim());
    console.log('🔑 VAPID key converted successfully');

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('📝 Creating new push subscription...');
      
      // Create new subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });
      
      console.log('✅ Push subscription created');
    } else {
      console.log('✅ Using existing push subscription');
    }

    // Register with our backend (only if authenticated)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await saveSubscriptionToDatabase(subscription);
      
      // Mark as bound for this session
      sessionStorage.setItem(PUSH_BOUND_KEY, '1');
      console.log('✅ Push subscription bound for session');
    } else {
      console.log('⚠️ User not authenticated - subscription not saved to backend');
    }

    return subscription;
  } catch (error) {
    console.error('❌ Web Push subscription failed:', error);
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

    // Call registration function
    const { error } = await supabase.functions.invoke('upsert_fcm_subscription', {
      body: {
        user_id: session.user.id,
        token: subscription.endpoint,
        platform: 'desktop',
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