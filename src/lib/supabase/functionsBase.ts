// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI Functions Base URL
// Centralizes Supabase Functions base URL to prevent 404 HTML responses

import { supabase } from '@/integrations/supabase/client';

/**
 * Get the correct base URL for Supabase Edge Functions
 * Handles both preview (.lovable.app) and production (m1ssion.eu) environments
 */
export function getFunctionsBase(): string {
  // Primary: use client URL + /functions/v1
  const clientUrl = (supabase as any).supabaseUrl;
  if (clientUrl) {
    return `${clientUrl}/functions/v1`;
  }

  // Fallback: detect from performance entries
  try {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const entry = entries.find(e => e.name.includes('.supabase.co'));
    if (entry) {
      const url = new URL(entry.name);
      const projectRef = url.hostname.split('.')[0];
      return `https://${projectRef}.supabase.co/functions/v1`;
    }
  } catch (e) {
    console.warn('[NORAH] Could not detect Functions base from performance entries:', e);
  }

  // Ultimate fallback: use known project ref
  return (import.meta.env.VITE_SUPABASE_FUNCTIONS_BASE ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_REF}.functions.supabase.co`.replace(/\/$/, "") + "/functions/v1");
}

/**
 * Invoke a Supabase Edge Function with proper error handling
 */
export async function invokeFunctionRaw<T = any>(
  functionName: string,
  body?: any,
  options: RequestInit = {}
): Promise<{ data: T | null; error: any }> {
  const base = getFunctionsBase();
  const url = `${base}/${functionName}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[NORAH] Function ${functionName} failed:`, response.status, text);
      return { data: null, error: { status: response.status, message: text } };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`[NORAH] Function ${functionName} error:`, error);
    return { data: null, error };
  }
}
