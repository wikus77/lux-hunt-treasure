
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ - Custom Supabase Client Configuration
// Specialized for M1SSION game mechanics, user management, and real-time features
// Optimized for Capacitor iOS WebView compatibility

import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vkjrqirvdvjbemsfzxof.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";

// Capacitor iOS optimized configuration
const supabaseOptions: SupabaseClientOptions<'public'> = {
  auth: {
    // Enhanced persistence for iOS WebView
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'm1ssion_supabase_auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV ? true : false,
  },
  realtime: {
    // WebView compatibility for real-time features
    params: {
      eventsPerSecond: 5,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000),
  },
  global: {
    // iOS Safari WebView headers optimization
    headers: {
      'X-Client-Info': 'M1SSION-iOS-Capacitor',
      'X-iOS-Version': typeof window !== 'undefined' && (window as any).DeviceInfo?.osVersion || 'unknown',
    },
  },
  db: {
    // Connection stability for mobile
    schema: 'public',
  },
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, supabaseOptions);
