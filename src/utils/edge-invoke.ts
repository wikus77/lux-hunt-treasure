/**
 * Edge Function Invocation Helper
 * Handles JWT auth, CORS, retries, and error formatting
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
 * Always uses POST method (no GET with body)
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

  // Check for active session and get JWT token
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
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Direct fetch with JWT token in Authorization header
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST', // Always POST (no GET with body)
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit'
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Handle HTTP errors
      if (!response.ok) {
        lastError = { status: response.status, data };
        
        // Don't retry on auth errors (401/403)
        if (response.status === 401 || response.status === 403) {
          return {
            error: {
              message: data.hint || `${response.status === 401 ? 'Unauthorized' : 'Forbidden'} - check whitelist`,
              code: data.code || (response.status === 401 ? 'AUTH_MISSING' : 'ADMIN_REQUIRED'),
              hint: data.hint || 'Check your authentication and admin whitelist status'
            }
          };
        }

        // Retry on other errors
        if (attempt < retries) {
          const backoff = 400 * (attempt + 1);
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }

        return {
          error: {
            message: data.hint || `HTTP ${response.status}`,
            code: data.code || 'HTTP_ERROR',
            hint: data.hint
          }
        };
      }

      // Check response format for error flag
      if (data && data.ok === false) {
        return {
          error: {
            message: data.hint || 'Edge function returned error',
            code: data.code || 'EDGE_ERROR',
            hint: data.hint
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
      message: lastError?.message || lastError?.data?.hint || 'Unknown error',
      code: lastError?.data?.code || 'RETRY_EXHAUSTED',
      hint: `Failed after ${retries + 1} attempts`
    }
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
