// © 2025 Joseph MULÉ – M1SSION™ – Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase Configuration - Environment variable with fallback
// ANON_KEY is safe to include as fallback (it's a public key, not a secret)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vkjrqirvdvjbemsfzxof.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";

// Legacy alias for backwards compatibility
const SUPABASE_PUBLISHABLE_KEY = SUPABASE_ANON_KEY;

// ---------------------------------------------------------------------------
// iOS WKWebView: disable Navigator LockManager to avoid "Acquiring an exclusive
// Navigator LockManager lock ... timed out waiting 10000ms" (supabase/supabase-js#936).
// Pass a no-op lock so auth-js never uses navigator.locks; session/refresh unchanged.
// ---------------------------------------------------------------------------
const lockNoOp: (name: string, acquireTimeout: number, fn: () => Promise<unknown>) => Promise<unknown> = async (_name, _acquireTimeout, fn) => {
  if (typeof console !== 'undefined') console.log('[AUTH-LOCK-TRACE] lock requested (no-op)', _name);
  const result = await fn();
  if (typeof console !== 'undefined') console.log('[AUTH-LOCK-TRACE] lock released', _name);
  return result;
};

// Diagnostic: log once when client module loads (iOS forensics)
if (typeof navigator !== 'undefined' && typeof console !== 'undefined') {
  console.log('[SUPABASE-LOCK] navigator.locks:', !!(navigator as { locks?: unknown }).locks);
  console.log('[SUPABASE-LOCK] platform:', navigator.userAgent);
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    lock: lockNoOp,
  },
  global: {
    headers: {
      'x-client-info': 'm1sson-ios-wkwebview',
    },
  },
});