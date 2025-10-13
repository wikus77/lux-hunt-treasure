import { createClient } from '@supabase/supabase-js';
import { getProjectRef } from '@/lib/supabase/functionsBase';

/**
 * Ricava l'URL Supabase **senza hardcode**:
 * - preferisce VITE_SUPABASE_URL
 * - fallback dinamico dal project ref (Guard-safe)
 */
function resolveSupabaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL?.trim();
  if (envUrl) return envUrl;
  const ref = getProjectRef();
  return `https://${ref}.supabase.co`;
}

/**
 * La chiave anon **solo** via ENV (mai hardcoded).
 * Se assente, usiamo stringa vuota (lato dev certe call falliranno, ma non rompiamo la build).
 */
const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
