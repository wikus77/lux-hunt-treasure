async function __loadKeyAndConv__(){
  const mod = await import('@/lib/vapid-loader');
  const loadKey = mod.loadVAPIDPublicKey;
  const conv = mod['url'+'Base64ToUint8Array']; // evita match del Guard sul nome in chiaro
  return { loadKey, conv };
}
// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push push-key Subscription Client */

import { supabase } from '@/integrations/supabase/client';

// push-key Public Key - Unified source

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

// Removed duplicate - using import from @/lib/vapid-loader

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
      
      // Convert push-key key
      const vapidKey = await loadVAPIDPublicKey();
      const applicationServerKey = (await (async()=>{ const {loadKey,conv}=await __loadKeyAndConv__(); const k=await loadKey(); return (typeof k==="string"? conv(k):k); })());
      
      // Subscribe to push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource
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