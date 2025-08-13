
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - Custom Supabase Client Configuration
// Specialized for M1SSION game mechanics, user management, and real-time features

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Prefer environment variables; fallback to defaults only if missing (with warning)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vkjrqirvdvjbemsfzxof.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("M1QR-TRACE", { step: 'env:missing:client', usingFallback: true });
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
