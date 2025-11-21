import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getProjectRef } from '@/lib/supabase/functionsBase';
import type { Database } from './types';
import { incSupabaseInstanceCount } from '@/lib/supabase/diag';

// ⚠️ SINGLETON HARDENING — DO NOT create multiple Supabase clients!
// Always import { supabase } or { sb } from this file.

declare global {
  interface Window { __SUPABASE_CLIENT__?: SupabaseClient<Database>; }
}

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
 * Inizializza il client Supabase con le credenziali da ENV.
 */
function initSupabaseClient(): SupabaseClient<Database> {
  const SUPABASE_URL = resolveSupabaseUrl();
  const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? '';
  
  // ENV Assert: verificare presenza in preview
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[NORAH2] Missing SUPABASE envs in preview', { 
      url: SUPABASE_URL, 
      keyPresent: !!SUPABASE_ANON_KEY 
    });
  }
  
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  
  // Track instance creation for diagnostics
  incSupabaseInstanceCount();
  
  return client;
}

/**
 * Singleton accessor - HMR-safe in dev, static in prod
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (import.meta.env.DEV) {
    // In dev, attach to window to survive HMR
    if (!window.__SUPABASE_CLIENT__) {
      window.__SUPABASE_CLIENT__ = initSupabaseClient();
    }
    return window.__SUPABASE_CLIENT__;
  } else {
    // In prod, use module-level singleton
    if (!_supabaseInstance) {
      _supabaseInstance = initSupabaseClient();
    }
    return _supabaseInstance;
  }
}

let _supabaseInstance: SupabaseClient<Database> | undefined;

// Export singleton
export const supabase = getSupabaseClient();
export const sb = supabase; // alias
export default supabase;

// HMR: prevent recreation on hot reload
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    // Keep singleton warm across HMR
  });
}

// -- Realtime WS token sync (fallback ANON)
client.auth.onAuthStateChange((_event, session) => {
  const token = session?.access_token ?? SUPABASE_ANON_KEY;
  client.realtime.setAuth(token);
});

if (import.meta?.env?.DEV) {
  // @ts-ignore
  (globalThis as any).supabase = client;
  // console.log('🔧 DEV: window.supabase exposed');
}
