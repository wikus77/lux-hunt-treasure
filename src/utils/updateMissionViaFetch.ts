import type { SupabaseClient } from '@supabase/supabase-js';

export type MissionData = {
  city: string; country: string; street: string; street_number: string;
  prize_type: string; prize_color: string; prize_material: string; prize_category: string;
};

export async function updateMissionViaFetch(supabase: SupabaseClient, missionData: MissionData) {
  // 1) session fresca
  let { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Nessuna sessione attiva');

  // refresh se sta per scadere
  const secLeft = (session.expires_at ?? 0) - Math.floor(Date.now()/1000);
  if (secLeft < 60) {
    const r = await supabase.auth.refreshSession();
    session = r.data.session ?? session;
  }

  const accessToken = session.access_token;
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-mission`;

  // La funzione accetta sia payload "wrappato" sia "flat".
  // Inviamo il flat per semplicità e compatibilità con la tua patch.
  const payload = missionData;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // authed come utente (NON anon key)
      'authorization': `Bearer ${accessToken}`,
      // opzionale, di solito non serve:
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let body: any = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw:text }; }

  if (!res.ok) {
    const msg = body?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body; // { success:true, missionId, missionData, ... }
}
export default updateMissionViaFetch;
