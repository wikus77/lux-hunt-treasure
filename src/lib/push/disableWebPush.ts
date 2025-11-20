// @ts-nocheck
/**
 * Guard-safe: nessun JWT hardcodato, nessuna URL hardcodata.
 * Usiamo il client Supabase per rimuovere la subscription lato DB.
 */
import { supabase } from '@/integrations/supabase/client';

export async function disableWebPush(endpoint: string): Promise<void> {
  if (!endpoint) return;

  try {
    // Rimuove la subscription dal DB usando il client supabase (gestisce lui auth/anon key)
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('[disableWebPush] DB delete failed:', error);
      throw error;
    }
  } catch (err) {
    console.error('[disableWebPush] error:', err);
    // non rilanciamo: vogliamo che la UI continui anche se cleanup DB fallisce
  }

  // Nota: l’eventuale unsubscribe del PushSubscription lato browser
  // viene gestito dove chiami questa funzione (se necessario).
}

export default disableWebPush;
