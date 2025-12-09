// © 2025 Joseph MULÉ – M1SSION™ – Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase Configuration - Environment variable with fallback
// ANON_KEY is safe to include as fallback (it's a public key, not a secret)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vkjrqirvdvjbemsfzxof.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});