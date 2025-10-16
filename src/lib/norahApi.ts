/**
 * Norah API Configuration - Centralized endpoint URLs
 * NO hardcoded project refs or secrets
 */

const fromEnv = import.meta.env.VITE_NORAH_BASE_URL?.trim();

// Use env var or throw error in production
export const NORAH_BASE = fromEnv || (() => {
  if (import.meta.env.PROD) {
    throw new Error('VITE_NORAH_BASE_URL must be set in production');
  }
  // Dev fallback - requires local proxy or env var
  console.warn('⚠️ VITE_NORAH_BASE_URL not set - using placeholder');
  return '';
})();

export const NORAH_ROUTES = {
  ingest: `${NORAH_BASE}/norah-ingest`,
  embed: `${NORAH_BASE}/norah-embed`,
  rag: `${NORAH_BASE}/norah-rag-search`,
  kpis: `${NORAH_BASE}/norah-kpis`,
} as const;

export type NorahRoute = keyof typeof NORAH_ROUTES;
