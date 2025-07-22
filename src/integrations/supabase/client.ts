
/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * M1SSION™ Optimized Supabase Client - Production Grade PWA
 * ✅ Warning-free configuration for iOS PWA
 * ✅ Optimized storage persistence
 * ✅ Race condition prevention
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vkjrqirvdvjbemsfzxof.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";

// WARNING-FREE CLIENT CONFIGURATION
// Solves: Multiple client instances, storage conflicts, PWA persistence issues
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Silently fail for PWA restrictions
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Silently fail for PWA restrictions
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'M1SSION-PWA/1.0'
    }
  }
});

// SINGLETON ENFORCEMENT - Prevents multiple client warnings
Object.freeze(supabase);
