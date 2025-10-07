// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Push Repair Utility - Centralized repair logic for notifications

const SB_URL = 'https://vkjrqirvdvjbemsfzxof.supabase.co';
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';

interface PushRepairResult {
  success: boolean;
  message: string;
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
 * Get JWT token from Supabase session or localStorage
 */
async function getJWT(): Promise<string | null> {
  // Try window.supabase first
  if ((window as any).supabase?.auth?.getSession) {
    try {
      const { data } = await (window as any).supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        console.log('✅ JWT from window.supabase');
        return token;
      }
    } catch (error) {
      console.warn('Failed to get JWT from window.supabase:', error);
    }
  }

  // Fallback to localStorage
  const host = location.host.split(':')[0] || '';
  const key = `${host}-auth-token`;
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw);
    const token = parsed?.currentSession?.access_token;
    
    if (token) {
      console.log('✅ JWT from localStorage');
      return token;
    }
  } catch (error) {
    console.warn('Failed to parse localStorage token:', error);
  }

  return null;
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
    const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
    const vapidKey = await loadVAPIDPublicKey();
    const vapidArray = urlBase64ToUint8Array(vapidKey);
    console.log('✅ VAPID key valid:', vapidArray.length, 'bytes');

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

    console.log('📤 Upserting subscription to backend...');
    const response = await fetch(`${SB_URL}/functions/v1/webpush-upsert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
        'apikey': SB_ANON_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upsert failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Subscription upserted:', result);

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
    console.log('📨 Sending self test push...');

    const jwt = await getJWT();
    if (!jwt) {
      return {
        success: false,
        message: 'Utente non autenticato. Effettua il login e riprova.'
      };
    }

    const body = {
      audience: 'self',
      payload: {
        title: '🔔 Test M1SSION',
        body: 'Push di test ricevuto correttamente! ✅',
        url: '/notifications'
      }
    };

    const response = await fetch(`${SB_URL}/functions/v1/webpush-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
        'apikey': SB_ANON_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Send failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Test push sent:', result);

    return {
      success: true,
      message: '📨 Push di test inviato! Controlla le notifiche.',
      details: result
    };

  } catch (error: any) {
    console.error('❌ Self test failed:', error);
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
      const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
      const vapid = await loadVAPIDPublicKey();
      urlBase64ToUint8Array(vapid); // Validate
      status.vapidValid = true;
    } catch (error) {
      console.warn('VAPID validation failed:', error);
    }

  } catch (error) {
    console.error('Status check error:', error);
  }

  return status;
}
