// © 2025 M1SSION™ – Stripe Mode Detection Hook

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StripeMode = 'live' | 'test' | 'unknown';

interface StripeModeResponse {
  mode: StripeMode;
  keyPrefix?: string;
  hasKey?: boolean;
  timestamp?: string;
}

interface UseStripeModeResult {
  mode: StripeMode;
  loading: boolean;
  error: string | null;
  keyPrefix?: string;
  hasKey?: boolean;
  refresh: () => Promise<void>;
}

export function useStripeMode(): UseStripeModeResult {
  const [mode, setMode] = useState<StripeMode>('unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyPrefix, setKeyPrefix] = useState<string>();
  const [hasKey, setHasKey] = useState<boolean>();

  const fetchStripeMode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.info('🔍 [useStripeMode] Fetching Stripe mode from server...');
      
      const { data, error: supabaseError } = await supabase.functions.invoke('stripe-mode', {
        method: 'POST'
      });

      if (supabaseError) {
        console.error('❌ [useStripeMode] Supabase error:', supabaseError);
        setError(supabaseError.message);
        setMode('unknown');
        return;
      }

      const response = data as StripeModeResponse;
      console.info('✅ [useStripeMode] Server response:', response);
      
      setMode(response.mode || 'unknown');
      setKeyPrefix(response.keyPrefix);
      setHasKey(response.hasKey);
      
    } catch (err) {
      console.error('❌ [useStripeMode] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMode('unknown');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStripeMode();
  }, []);

  return {
    mode,
    loading,
    error,
    keyPrefix,
    hasKey,
    refresh: fetchStripeMode
  };
}

export function getPublishableKeyForMode(mode: StripeMode): string {
  // Always use LIVE publishable key as requested
  const liveKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  
  // Ensure we're using LIVE key (pk_live_...)
  if (liveKey && !liveKey.startsWith('pk_live_')) {
    console.warn('⚠️ VITE_STRIPE_PUBLISHABLE_KEY is not a LIVE key:', liveKey.substring(0, 10) + '...');
  }
  
  return liveKey;
}