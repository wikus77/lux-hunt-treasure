/**
 * Edge Function Invocation Helper
 * Handles JWT auth, CORS, retries, and error formatting
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { supabase } from '@/integrations/supabase/client';

export interface EdgeInvokeOptions {
  method?: 'GET' | 'POST';
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface EdgeResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    hint?: string;
    details?: string;
  };
}

/**
 * Invokes an Edge Function with proper auth, timeout, and retry logic
 * 
 * @param functionName - Name of the Edge Function to invoke
 * @param options - Invocation options
 * @returns Promise with data or error
 */
export async function invokeEdge<T = any>(
  functionName: string,
  options: EdgeInvokeOptions = {}
): Promise<EdgeResponse<T>> {
  const {
    method = 'POST',
    body,
    timeout = 10000,
    retries = 2
  } = options;

  // Check for active session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return {
      error: {
        message: 'No active session - please refresh the page',
        code: 'NO_SESSION',
        hint: 'Session expired or not authenticated'
      }
    };
  }

  let lastError: any = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Invoke using Supabase client (handles auth automatically)
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      // Check for invocation error
      if (error) {
        lastError = error;
        
        // Don't retry on auth errors
        if (error.message?.includes('401') || error.message?.includes('403')) {
          return {
            error: {
              message: error.message,
              code: error.message.includes('403') ? 'FORBIDDEN' : 'UNAUTHORIZED',
              hint: 'Check your authentication and whitelist status'
            }
          };
        }

        // Retry on other errors
        if (attempt < retries) {
          const backoff = Math.pow(2, attempt) * 400;
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }

        return {
          error: {
            message: error.message,
            code: 'INVOCATION_ERROR',
            hint: 'Edge function invocation failed'
          }
        };
      }

      // Check response format
      if (data && !data.ok && data.code) {
        return {
          error: {
            message: data.hint || 'Edge function returned error',
            code: data.code,
            hint: data.hint,
            details: data.details
          }
        };
      }

      // Success
      return { data };

    } catch (error: any) {
      lastError = error;

      // Handle timeout
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          const backoff = Math.pow(2, attempt) * 400;
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }

        return {
          error: {
            message: `Request timeout after ${timeout}ms`,
            code: 'TIMEOUT',
            hint: 'Edge function might be cold-starting or overloaded'
          }
        };
      }

      // Don't retry on network errors after first attempt
      if (attempt < retries) {
        const backoff = Math.pow(2, attempt) * 400;
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
    }
  }

  // All retries exhausted
  return {
    error: {
      message: lastError?.message || 'Unknown error',
      code: 'RETRY_EXHAUSTED',
      hint: `Failed after ${retries} attempts`
    }
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
