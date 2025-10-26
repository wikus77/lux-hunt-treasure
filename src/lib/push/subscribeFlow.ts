// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
/**
 * Unified Push Subscribe Flow - Idempotent Pipeline
 * Used by: Toggle, Ripara, Riesegui, Onboarding
 * Reuses the exact same webpush-upsert endpoint as PushDiagnosi
 */

import { supabase } from '@/integrations/supabase/client';

export type SubscribeFlowStatus = 'ready' | 'permission_denied' | 'error';

export interface SubscribeFlowResult {
  ok: boolean;
  status: SubscribeFlowStatus;
  endpoint?: string;
  message?: string;
  error?: string;
}

/**
 * STEP 1: Ensure Service Worker is registered and ready
 */
async function ensureServiceWorkerReady(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker non supportato');
  }

  const regs = await navigator.serviceWorker.getRegistrations();
  const hasMain = regs.some(r => r.active?.scriptURL.includes('/sw.js'));
  
  if (!hasMain) {
    console.log('[SubscribeFlow] Registering /sw.js...');
    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  }

  return navigator.serviceWorker.ready;
}

/**
 * STEP 2: Ensure notification permission is granted
 */
async function ensurePermissionGranted(): Promise<boolean> {
  if (!('Notification' in window)) {
    throw new Error('Notification API non supportata');
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  if (Notification.permission === 'default') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  return true;
}

/**
 * STEP 3: Ensure push subscription exists (or create it)
 */
async function ensurePushSubscription(
  reg: ServiceWorkerRegistration
): Promise<PushSubscription> {
  const current = await reg.pushManager.getSubscription();
  if (current) {
    console.log('[SubscribeFlow] Subscription già esistente');
    return current;
  }

  console.log('[SubscribeFlow] Creazione nuova subscription...');
  const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
  
  const vapidKey = await loadVAPIDPublicKey();
  const applicationServerKey = typeof vapidKey === 'string'
    ? urlBase64ToUint8Array(vapidKey)
    : vapidKey;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey as unknown as BufferSource
  });

  console.log('[SubscribeFlow] Subscription creata');
  return sub;
}

/**
 * STEP 4: Upsert subscription to backend (CRITICAL!)
 * Uses the SAME endpoint and payload as PushDiagnosi
 */
async function upsertBackend(sub: PushSubscription): Promise<void> {
  console.log('[SubscribeFlow] Salvando subscription al backend...');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Sessione scaduta: effettua il login');
  }

  const json = sub.toJSON() as any;
  const keys = json?.keys || {};
  
  if (!keys.p256dh || !keys.auth) {
    throw new Error('Chiavi subscription mancanti');
  }

  // ✅ Use safe platform detection
  const { detectPlatformSafe } = await import('@/utils/pushPlatform');
  const platform = detectPlatformSafe();

  // ✅ SAME ENDPOINT AS DIAGNOSI (line 222 in PushDiagnosi.tsx)
  const { error } = await supabase.functions.invoke('webpush-upsert', {
    body: {
      endpoint: sub.endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
      provider: 'webpush',
      platform,
      ua: navigator.userAgent
    }
  });

  if (error) {
    console.error('[SubscribeFlow] Upsert failed:', error);
    throw new Error(error.message || 'Upsert fallito');
  }

  console.log('[SubscribeFlow] Backend upsert SUCCESS');
}

/**
 * MAIN FLOW: Idempotent subscription pipeline
 * Returns final state with detailed status
 */
export async function subscribeFlow(): Promise<SubscribeFlowResult> {
  const t0 = performance.now();

  try {
    console.log('[SubscribeFlow] Starting...');

    // STEP 1: Service Worker
    const reg = await ensureServiceWorkerReady();
    console.log('[SubscribeFlow] Step 1/4: SW ready');

    // STEP 2: Permission
    const hasPermission = await ensurePermissionGranted();
    if (!hasPermission) {
      return {
        ok: false,
        status: 'permission_denied',
        message: 'Permesso notifiche negato'
      };
    }
    console.log('[SubscribeFlow] Step 2/4: Permission granted');

    // STEP 3: Subscription
    const sub = await ensurePushSubscription(reg);
    console.log('[SubscribeFlow] Step 3/4: Subscription ready');

    // STEP 4: Backend Upsert (CRITICAL!)
    await upsertBackend(sub);
    console.log('[SubscribeFlow] Step 4/4: Backend saved');

    const elapsed = Math.round(performance.now() - t0);
    console.log(`[SubscribeFlow] COMPLETE in ${elapsed}ms`);

    return {
      ok: true,
      status: 'ready',
      endpoint: sub.endpoint,
      message: `Ready in ${elapsed}ms`
    };

  } catch (error: any) {
    const elapsed = Math.round(performance.now() - t0);
    console.error(`[SubscribeFlow] FAILED after ${elapsed}ms:`, error);

    return {
      ok: false,
      status: 'error',
      error: error?.message || 'Errore sconosciuto',
      message: `Failed after ${elapsed}ms`
    };
  }
}
