/**
 * Edge Function Invocation Helper
 * Handles JWT auth, CORS, retries, and error formatting
 * Uses Supabase Functions.invoke for proper auth handling
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { supabase } from '@/integrations/supabase/client';

export interface EdgeInvokeOptions {
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
 * Invokes an Edge Function with proper JWT auth, timeout, and retry logic
 * Uses supabase.functions.invoke for automatic JWT handling
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
    body = {},
    timeout = 10000,
    retries = 1
  } = options;

  // Check for active session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return {
      error: {
        message: 'No active session - please log in',
        code: 'NO_SESSION',
        hint: 'Session expired or not authenticated'
      }
    };
  }

  let lastError: any = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Use supabase.functions.invoke with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Use the official Supabase client method
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      clearTimeout(timeoutId);

      // Handle errors
      if (error) {
        lastError = error;
        
        // Parse error details
        const errorData = typeof error === 'object' ? error : { message: String(error) };
        const status = (errorData as any)?.status || 0;
        
        // Don't retry on auth errors (401/403)
        if (status === 401 || status === 403) {
          return {
            error: {
              message: (errorData as any)?.hint || (status === 401 ? 'Unauthorized - session expired' : 'Forbidden - not in admin whitelist'),
              code: (errorData as any)?.code || (status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN'),
              hint: (errorData as any)?.hint || 'Check authentication and admin whitelist'
            }
          };
        }

        // Retry on other errors
        if (attempt < retries && (status === 0 || status >= 500)) {
          const backoff = 400 * (attempt + 1);
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }

        return {
          error: {
            message: (errorData as any)?.hint || (errorData as any)?.message || 'Edge function error',
            code: (errorData as any)?.code || 'EDGE_ERROR',
            hint: (errorData as any)?.hint
          }
        };
      }

      // Check response format for error flag
      if (data && typeof data === 'object' && (data as any).ok === false) {
        return {
          error: {
            message: (data as any).hint || 'Edge function returned error',
            code: (data as any).code || 'EDGE_ERROR',
            hint: (data as any).hint
          }
        };
      }

      // Success
      return { data: data as T };

    } catch (error: any) {
      lastError = error;

      // Handle timeout
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          const backoff = 400 * (attempt + 1);
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

      // Retry on network errors
      if (attempt < retries) {
        const backoff = 400 * (attempt + 1);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
    }
  }

  // All retries exhausted
  return {
    error: {
      message: lastError?.message || 'Unknown error',
      code: lastError?.code || 'RETRY_EXHAUSTED',
      hint: `Failed after ${retries + 1} attempts`
    }
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
