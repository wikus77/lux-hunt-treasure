// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import { supabase } from '@/integrations/supabase/client';

type BroadcastPayload = {
  title: string;
  body: string;
  url?: string;
  target: { all?: boolean; user_ids_csv?: string; user_ids?: string[] };
};

export async function sendAdminBroadcast(payload: BroadcastPayload) {
  // Garantisce che l'Authorization: Bearer <JWT> venga aggiunto in automatico
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const { data, error } = await supabase.functions.invoke('webpush-admin-broadcast', {
    body: payload,
  });

  if (error) throw error;
  return data;
}