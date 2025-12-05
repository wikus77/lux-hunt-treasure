import { supabase } from '@/integrations/supabase/client';

// Guard-safe: usa SOLO il loader canonico per l'applicationServerKey
export async function registerPush(reg: ServiceWorkerRegistration): Promise<PushSubscription> {
  if (!reg?.pushManager) {
    throw new Error('PushManager non disponibile');
  }
  const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');

  const publicKey = await loadVAPIDPublicKey();
  const applicationServerKey =
    typeof publicKey === 'string' ? urlBase64ToUint8Array(publicKey) : publicKey;

  // Se esiste già, verifica se è salvata nel DB e ritorna
  let subscription = await reg.pushManager.getSubscription();
  
  if (!subscription) {
    // Crea nuova subscription
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  // CRITICO: Salva subscription al database
  await saveSubscriptionToDatabase(subscription);
  
  return subscription;
}

// Salva la subscription nel database webpush_subscriptions
async function saveSubscriptionToDatabase(subscription: PushSubscription): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.warn('[registerPush] Utente non autenticato, skip save');
      return;
    }

    const payload = subscription.toJSON();
    if (!payload.endpoint || !payload.keys) {
      console.error('[registerPush] Subscription malformata');
      return;
    }

    // Prima verifica se esiste già
    const { data: existing } = await supabase
      .from('webpush_subscriptions')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('endpoint', payload.endpoint)
      .maybeSingle();

    if (existing) {
      // Update esistente
      const { error } = await supabase
        .from('webpush_subscriptions')
        .update({ keys: payload.keys, is_active: true })
        .eq('id', existing.id);
      
      if (error) {
        console.error('[registerPush] Errore update:', error);
      } else {
        console.log('✅ [registerPush] Subscription aggiornata');
      }
    } else {
      // Insert nuova
      const { error } = await supabase
        .from('webpush_subscriptions')
        .insert({
          user_id: session.user.id,
          endpoint: payload.endpoint,
          keys: payload.keys,
          is_active: true
        });

      if (error) {
        console.error('[registerPush] Errore insert:', error);
      } else {
        console.log('✅ [registerPush] Subscription salvata');
      }
    }
  } catch (err) {
    console.error('[registerPush] Exception:', err);
  }
}

export async function hasSubscription(reg: ServiceWorkerRegistration): Promise<boolean> {
  try {
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}
