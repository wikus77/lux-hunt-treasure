// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Push Repair Utility - Centralized repair logic for notifications

import { supabase } from '@/integrations/supabase/client';

async function __appServerKey(): Promise<Uint8Array | CryptoKey> {
  const mod = await import('@/lib/vapid-loader');
  const key = await mod.loadVAPIDPublicKey();
  return typeof key === 'string' ? mod.urlBase64ToUint8Array(key) : key;
}

interface PushRepairResult {
  success: boolean;
  message: string;
  details?: any;
}

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
