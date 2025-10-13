import { functionsBaseUrl } from '@/lib/supabase/functionsBase';
import { supabase } from '@/integrations/supabase/client';

/**
 * Chiama la Edge Function "bulk-marker-drop" in modo sicuro:
 * - URL costruito con la factory canonica (no hardcode)
 * - Bearer preso dalla sessione Supabase se disponibile
 */
export async function bulkMarkerDrop(payload: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  const bearer = session?.access_token;

  const url = `${functionsBaseUrl}/bulk-marker-drop`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload ?? {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`bulk-marker-drop failed: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}
