// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { supabase } from '@/integrations/supabase/client';

const SAFE_HEADERS = {
  'Content-Type': 'application/json',
  'X-M1-Dropper-Version': 'v1',
  'X-Client-Info': 'm1ssion-pwa'
} as const;

export interface PushFunctionResponse {
  ok: boolean;
  sent?: number;
  failed?: number;
  error?: string;
  message?: string;
}

export async function invokePushFunction(
  fn: 'push_broadcast' | 'push_admin_broadcast' | 'push_send' | 'push_test', 
  payload: any
): Promise<PushFunctionResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(fn, {
      body: payload,
      headers: SAFE_HEADERS,
    });
    
    if (error) {
      console.error(`[PUSH API] Error calling ${fn}:`, error);
      throw new Error(error.message || `Error calling ${fn}`);
    }
    
    return data as PushFunctionResponse;
  } catch (error: any) {
    console.error(`[PUSH API] Exception calling ${fn}:`, error);
    throw error;
  }
}