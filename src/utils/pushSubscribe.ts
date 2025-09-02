// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push VAPID Subscription Client */

import { supabase } from '@/integrations/supabase/client';

// VAPID Public Key - From environment with fallback
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q';

interface SubscribeOptions {
  userId?: string;
  onLog?: (message: string) => void;
}

interface SubscribeResult {
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
  data?: any;
}

/**
 * Converts VAPID public key from base64url to Uint8Array with P-256 validation
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  try {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    // Validate P-256 key (65 bytes, starts with 0x04)
    if (outputArray.length !== 65) {
      throw new Error(`Invalid VAPID key length: ${outputArray.length} bytes (expected 65)`);
    }
    
    if (outputArray[0] !== 0x04) {
      throw new Error(`Invalid VAPID key format: first byte is 0x${outputArray[0].toString(16)} (expected 0x04)`);
    }
    
    console.log('✅ VAPID key validation passed:', outputArray.length, 'bytes');
    return outputArray;
  } catch (error) {
    console.error('❌ VAPID key conversion failed:', error);
    throw new Error(`VAPID key validation failed: ${error.message}`);
  }
}

/**
 * Converts ArrayBuffer to base64url string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Detects platform from user agent
 */
function detectPlatform(): string {
  const ua = navigator.userAgent;
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  return 'Unknown';
}

/**
 * Registers service worker and subscribes to push notifications
 */
export async function subscribeToPush(options: SubscribeOptions = {}): Promise<SubscribeResult> {
  const { userId, onLog } = options;
  
  const log = (message: string) => {
    console.log(`[PUSH-SUBSCRIBE] ${message}`);
    onLog?.(message);
  };

  try {
    // Check feature support
    if (!('serviceWorker' in navigator)) {
      throw new Error('ServiceWorker not supported');
    }
    
    if (!('PushManager' in window)) {
      throw new Error('PushManager not supported');
    }
    
    if (!('Notification' in window)) {
      throw new Error('Notification not supported');
    }

    log('🔍 Feature support verified');

    // Register service worker
    let registration: ServiceWorkerRegistration;
    
    try {
      registration = await navigator.serviceWorker.register('/sw.js', { 
        scope: '/',
        updateViaCache: 'none'
      });
      log('✅ SW registration successful');
    } catch (regError) {
      throw new Error(`SW registration failed: ${regError}`);
    }

    // Wait for SW to be ready
    await navigator.serviceWorker.ready;
    log('✅ SW ready');

    // Request notification permission
    let permission = Notification.permission;
    
    if (permission === 'default') {
      log('🔐 Requesting notification permission...');
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      throw new Error(`Notification permission not granted: ${permission}`);
    }

    log('✅ Notification permission granted');

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      log('📝 Creating new push subscription...');
      
      // Convert VAPID key
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      // Subscribe to push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      
      log('✅ Push subscription created');
    } else {
      log('✅ Using existing push subscription');
    }

    // Save subscription to Supabase with UNIFIED payload format
    log('💾 Saving subscription to Supabase...');
    
    const subscriptionJSON = subscription.toJSON();
    const subscriptionData = {
      subscription: subscriptionJSON, // Complete subscription with endpoint and keys
      user_id: userId || null,
      client: 'util',
      ua: navigator.userAgent,
      platform: detectPlatform()
    };

    const { data, error } = await supabase.functions.invoke('push_subscribe', {
      body: subscriptionData
    });

    if (error) {
      throw new Error(`Supabase save failed: ${error.message}`);
    }

    log('✅ Subscription saved to Supabase');

    return {
      success: true,
      subscription,
      data
    };

  } catch (error: any) {
    log(`❌ Subscription failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sends a test push notification
 */
export async function sendTestPush(subscription: PushSubscription, onLog?: (message: string) => void): Promise<SubscribeResult> {
  const log = (message: string) => {
    console.log(`[PUSH-SEND] ${message}`);
    onLog?.(message);
  };

  try {
    log('📤 Sending test push notification...');
    
    const { data, error } = await supabase.functions.invoke('push_send', {
      body: {
        endpoint: subscription.endpoint,
        payload: {
          title: 'M1SSION™ Push Test',
          body: `Test notification sent at ${new Date().toLocaleTimeString()}`,
          data: { url: '/push-health' }
        }
      }
    });

    if (error) {
      throw new Error(`Push send failed: ${error.message}`);
    }

    log('✅ Test push sent successfully');

    return {
      success: true,
      data
    };

  } catch (error: any) {
    log(`❌ Push send failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}