/**
 * © 2025 Joseph MULÉ – M1SSION™ – Supabase Client Utilities
 * 
 * CRITICAL: Single source of truth for Supabase configuration
 * Uses the singleton client from @/integrations/supabase/client
 * which is hardcoded to vkjrqirvdvjbemsfzxof (external project)
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Extract project ref from Supabase URL
 * e.g., "vkjrqirvdvjbemsfzxof" from "https://vkjrqirvdvjbemsfzxof.supabase.co"
 */
export function getProjectRef(): string {
  const url = (supabase as any).supabaseUrl || '';
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] || 'vkjrqirvdvjbemsfzxof'; // Fallback to external project
}

/**
 * Get Supabase base URL
 */
export function getSupabaseUrl(): string {
  return (supabase as any).supabaseUrl || 'https://vkjrqirvdvjbemsfzxof.supabase.co';
}

/**
 * Get Supabase anon key
 * Uses environment variable first, then client, then fallback
 */
export function getSupabaseAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 
         (supabase as any).supabaseKey || 
         '';
}

/**
 * Get functions base URL
 */
export function getFunctionsUrl(): string {
  const baseUrl = getSupabaseUrl();
  return `${baseUrl.replace(/\/$/, '')}/functions/v1`;
}

/**
 * Build auth token key for localStorage
 */
export function getAuthTokenKey(): string {
  return `sb-${getProjectRef()}-auth-token`;
}

/**
 * Get complete Supabase config object (backward compat)
 */
export function getSupabaseConfig() {
  return {
    projectRef: getProjectRef(),
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
    functionsUrl: getFunctionsUrl()
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
