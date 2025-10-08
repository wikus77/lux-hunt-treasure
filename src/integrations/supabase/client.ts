
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - Custom Supabase Client Configuration
// Specialized for M1SSION game mechanics, user management, and real-time features

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// M1SSION Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("M1QR-TRACE", { step: 'env:missing:client', SUPABASE_URL: !!SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY: !!SUPABASE_PUBLISHABLE_KEY });
  throw new Error('missing_env');
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
