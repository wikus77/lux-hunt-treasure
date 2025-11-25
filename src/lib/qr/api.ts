import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/clientUtils';

// URL e chiavi dalla configurazione centralizzata
export const BASE = getSupabaseUrl();
export const ANON = getSupabaseAnonKey();

// Helper comodi (se servono)
export const functionsUrl = (path: string) =>
  `${BASE}/functions/v1/${String(path).replace(/^\/+/, '')}`;

export const restUrl = (path: string) =>
  `${BASE}/rest/v1/${String(path).replace(/^\/+/, '')}`;
