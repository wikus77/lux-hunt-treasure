// URL e chiavi dagli env, nessun backtick annidato
export const BASE =
  import.meta.env.VITE_SUPABASE_URL ??
  `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.supabase.co`;

export const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Helper comodi (se servono)
export const functionsUrl = (path: string) =>
  `${BASE}/functions/v1/${String(path).replace(/^\/+/, '')}`;

export const restUrl = (path: string) =>
  `${BASE}/rest/v1/${String(path).replace(/^\/+/, '')}`;
