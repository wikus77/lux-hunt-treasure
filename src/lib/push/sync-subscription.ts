// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SYNC SUBSCRIPTION - Sincronizza subscription browser con DB al login
// NOTA: NON modifica la logica esistente, solo aggiunge sync

import { supabase } from '@/integrations/supabase/client';

/**
 * Sincronizza la subscription push esistente nel browser con il database
 * Chiamata al login per garantire che la subscription sia sempre aggiornata
 * NON crea nuove subscription, solo sincronizza quelle esistenti
 */
export async function syncExistingSubscription(): Promise<boolean> {
  try {
    // 1. Verifica supporto
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    // 2. Verifica utente autenticato
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return false;
    }

    // 3. Ottieni registration esistente
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration?.active) {
      return false;
    }

    // 4. Ottieni subscription esistente (NON ne crea una nuova)
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return false;
    }

    // 5. Estrai dati subscription
    const payload = subscription.toJSON();
    if (!payload.endpoint || !payload.keys) {
      return false;
    }

    // 6. Verifica se esiste già nel DB
    const { data: existing } = await supabase
      .from('webpush_subscriptions')
      .select('id, is_active')
      .eq('user_id', session.user.id)
      .eq('endpoint', payload.endpoint)
      .maybeSingle();

    if (existing) {
      // Aggiorna solo se non attiva
      if (!existing.is_active) {
        await supabase
          .from('webpush_subscriptions')
          .update({ is_active: true, keys: payload.keys })
          .eq('id', existing.id);
        console.log('✅ [syncSubscription] Subscription riattivata');
      }
    } else {
      // Inserisci nuova (subscription browser esisteva ma non nel DB per questo user)
      await supabase
        .from('webpush_subscriptions')
        .insert({
          user_id: session.user.id,
          endpoint: payload.endpoint,
          keys: payload.keys,
          is_active: true
        });
      console.log('✅ [syncSubscription] Subscription sincronizzata al DB');
    }

    return true;
  } catch (error) {
    // Silenzioso - non critico
    console.warn('[syncSubscription] Non-critical error:', error);
    return false;
  }
}

/**
 * Mantiene il Service Worker attivo con un ping periodico
 * Chiamata ogni 5 minuti per evitare che il browser termini il SW
 */
export function startServiceWorkerKeepAlive(): () => void {
  const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minuti

  const keepAlive = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;
      
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration?.active) {
        // Ping al SW per tenerlo attivo
        registration.active.postMessage({ type: 'KEEP_ALIVE', timestamp: Date.now() });
      }
    } catch {
      // Silenzioso
    }
  };

  // Esegui subito
  keepAlive();

  // Poi ogni 5 minuti
  const intervalId = setInterval(keepAlive, KEEP_ALIVE_INTERVAL);

  // Ritorna cleanup function
  return () => clearInterval(intervalId);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™




