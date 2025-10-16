/**
 * Norah API Configuration - Centralized endpoint URLs
 * NO hardcoded project refs or secrets
 */

const fromEnv = import.meta.env.VITE_NORAH_BASE_URL?.trim();

// Derive from SUPABASE_URL if not explicitly set
const deriveFromSupabase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Neither VITE_NORAH_BASE_URL nor VITE_SUPABASE_URL are set');
    }
    return '';
  }
  // Strip trailing slashes and append /functions/v1
  return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1`;
};

export const NORAH_BASE = fromEnv || deriveFromSupabase();

export const NORAH_ROUTES = {
  ingest: `${NORAH_BASE}/norah-ingest`,
  embed: `${NORAH_BASE}/norah-embed`,
  rag: `${NORAH_BASE}/norah-rag-search`,
  kpis: `${NORAH_BASE}/norah-kpis`,
} as const;

export type NorahRoute = keyof typeof NORAH_ROUTES;
