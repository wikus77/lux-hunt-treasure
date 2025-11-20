import { SUPABASE_CONFIG } from '@/lib/supabase/config';

// URL e chiavi dalla configurazione centralizzata
export const BASE = SUPABASE_CONFIG.url;
export const ANON = SUPABASE_CONFIG.anonKey;

// Helper comodi (se servono)
export const functionsUrl = (path: string) =>
  `${BASE}/functions/v1/${String(path).replace(/^\/+/, '')}`;

export const restUrl = (path: string) =>
  `${BASE}/rest/v1/${String(path).replace(/^\/+/, '')}`;
