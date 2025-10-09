// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Push Repair Utility - Centralized repair logic for notifications

import { supabase } from '@/integrations/supabase/client';
import { loadVAPIDPublicKey, urlBase64ToUint8Array } from '@/lib/vapid-loader';

interface PushRepairResult {
  success: boolean;
  message: string;
  error?: string;
  details?: any;
}

/**
 * Ensure Service Worker is registered and ready
 */
async function ensureSW(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker non supportato su questo browser');
  }

  // Check existing registration
  let reg = await navigator.serviceWorker.getRegistration();
  
  // Register if not found
  if (!reg) {
    console.log('🔧 Registering service worker /sw.js...');
    reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  }

  // Wait for SW to be ready
  return navigator.serviceWorker.ready;
}

/**
 * Get JWT token from Supabase session
 */
async function getJWT(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (error) {
    console.error('[Push] Failed to get JWT:', error);
    return null;
  }
}

/**
 * Main repair function - fixes push notifications end-to-end
 */
export async function repairPush(): Promise<PushRepairResult> {
  try {
    console.log('🔧 Starting push repair...');

    // Step 1: Request notification permission
    const perm = Notification.permission === 'granted' 
      ? 'granted' 
      : await Notification.requestPermission();

    if (perm !== 'granted') {
      return {
        success: false,
        message: 'Permesso notifiche negato. Abilita le notifiche nelle impostazioni del browser.',
        details: { permission: perm }
      };
    }
    console.log('✅ Permission granted');

    // Step 2: Ensure Service Worker
    const reg = await ensureSW();
    console.log('✅ Service Worker ready');

    // Step 3: Load and validate VAPID key
    const vapidKey = await loadVAPIDPublicKey();
    const vapidArray = urlBase64ToUint8Array(vapidKey);
    console.log('[Push] ✅ VAPID key valid:', vapidArray.length, 'bytes');

    // Step 4: Clear old subscription
    try {
      const currentSub = await reg.pushManager.getSubscription();
      if (currentSub) {
        console.log('🗑️ Unsubscribing old subscription...');
        await currentSub.unsubscribe();
      }
    } catch (error) {
      console.warn('Failed to unsubscribe old subscription:', error);
    }

    // Step 5: Create new subscription
    console.log('📝 Creating new push subscription...');
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidArray
    });
    
    const subJSON = sub.toJSON();
    console.log('✅ Subscription created:', sub.endpoint.substring(0, 50) + '...');

    // Step 6: Get JWT
    const jwt = await getJWT();
    if (!jwt) {
      return {
        success: false,
        message: 'Utente non autenticato. Effettua il login e riprova.',
        details: { jwt: null }
      };
    }
    console.log('✅ JWT found');

    // Step 7: Upsert subscription to backend
    const platform = sub.endpoint.includes('web.push.apple.com') ? 'ios' : 'web';
    const payload = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: subJSON.keys?.p256dh,
        auth: subJSON.keys?.auth
      },
      provider: 'webpush',
      platform,
      ua: navigator.userAgent
    };

    console.log('[Push] 📤 Upserting subscription to backend...');
    const { data: result, error } = await supabase.functions.invoke('webpush-upsert', {
      body: payload
    });

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }

    console.log('[Push] ✅ Subscription upserted:', result);

    return {
      success: true,
      message: '🎉 Notifiche riparate con successo!',
      details: {
        permission: perm,
        platform,
        endpoint: sub.endpoint.substring(0, 50) + '...'
      }
    };

  } catch (error: any) {
    console.error('❌ Push repair failed:', error);
    return {
      success: false,
      message: `Errore durante la riparazione: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Send a test push notification to self
 */
export async function sendSelfTest(): Promise<PushRepairResult> {
  try {
    console.log('[Push] 📨 Sending self test push...');

    const jwt = await getJWT();
    if (!jwt) {
      return {
        success: false,
        message: 'Utente non autenticato. Effettua il login e riprova.'
      };
    }

    const payload = {
      title: '🔔 Test M1SSION',
      body: 'Push di test ricevuto correttamente! ✅',
      url: '/notifications'
    };

    const { data: result, error } = await supabase.functions.invoke('webpush-self-test', {
      body: { payload }
    });

    if (error) {
      throw new Error(`Send failed: ${error.message}`);
    }

    console.log('[Push] ✅ Test push sent:', result);

    return {
      success: true,
      message: '📨 Push di test inviato! Controlla le notifiche.',
      details: result
    };

  } catch (error: any) {
    console.error('[Push] ❌ Self test failed:', error);
    return {
      success: false,
      message: `Errore durante l'invio: ${error.message}`,
      details: { error: error.message }
    };
  }
}

/**
 * Get current push status for diagnostics
 */
export async function getPushStatus() {
  const status = {
    permission: Notification.permission,
    swRegistered: false,
    swScope: null as string | null,
    subscriptionPresent: false,
    subscriptionEndpoint: null as string | null,
    jwtPresent: false,
    vapidValid: false,
    platform: 'unknown' as string
  };

  try {
    // Check SW
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        status.swRegistered = true;
        status.swScope = reg.scope;

        // Check subscription
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          status.subscriptionPresent = true;
          status.subscriptionEndpoint = sub.endpoint.substring(0, 50) + '...';
          status.platform = sub.endpoint.includes('web.push.apple.com') ? 'ios' : 'web';
        }
      }
    }

    // Check JWT
    const jwt = await getJWT();
    status.jwtPresent = !!jwt;

    // Check VAPID
    try {
      const vapid = await loadVAPIDPublicKey();
      urlBase64ToUint8Array(vapid); // Validate
      status.vapidValid = true;
    } catch (error) {
      console.warn('[Push] VAPID validation failed:', error);
    }

  } catch (error) {
    console.error('Status check error:', error);
  }

  return status;
}
