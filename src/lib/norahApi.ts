/**
 * Norah API Configuration - Centralized endpoint URLs
 * Uses centralized Supabase configuration
 */

import { SUPABASE_CONFIG } from './supabase/config';

const fromEnv = import.meta.env.VITE_NORAH_BASE_URL?.trim();

export const NORAH_BASE = fromEnv || `${SUPABASE_CONFIG.url}/functions/v1`;

export const NORAH_ROUTES = {
  ingest: `${NORAH_BASE}/norah-ingest`,
  embed: `${NORAH_BASE}/norah-embed`,
  rag: `${NORAH_BASE}/norah-rag-search`,
  kpis: `${NORAH_BASE}/norah-kpis`,
} as const;

export type NorahRoute = keyof typeof NORAH_ROUTES;
