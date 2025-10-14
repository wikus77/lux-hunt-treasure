/**
 * © 2025 Joseph MULÉ – M1SSION™ – Supabase Auth Helpers
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Get current Supabase session bearer token
 * @returns Bearer token or empty string if not available
 */
export async function getSupabaseBearer(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? '';
  } catch {
    return '';
  }
}
