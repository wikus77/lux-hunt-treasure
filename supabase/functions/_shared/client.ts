/**
 * Supabase Client Factory for Edge Functions
 * Provides dual-client pattern: user client for auth, admin client for operations
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

/**
 * Creates a user-scoped client using the Authorization header from the request
 * Use this for auth verification and whitelist checks
 */
export function makeUserClient(req: Request): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { 
      headers: { 
        Authorization: authHeader 
      } 
    },
    auth: { 
      persistSession: false,
      autoRefreshToken: false 
    }
  });
}

/**
 * Creates an admin client with service_role key
 * Use this for database operations, RPC calls, and Realtime broadcasts
 */
export function makeAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Validates JWT and checks admin whitelist
 * @returns { user, error } - User object if authorized, error object if not
 */
export async function validateAdmin(req: Request): Promise<{ user: any; error?: { code: string; hint: string; status: number } }> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      user: null,
      error: {
        code: 'auth',
        hint: 'Sign-in required - Authorization header missing',
        status: 401
      }
    };
  }

  const userClient = makeUserClient(req);
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  
  if (authError || !user) {
    return {
      user: null,
      error: {
        code: 'auth',
        hint: authError?.message || 'Invalid or expired token',
        status: 401
      }
    };
  }

  // Check admin whitelist
  const whitelist = (Deno.env.get('ADMIN_WHITELIST') || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  
  const userEmail = (user.email || '').toLowerCase().trim();
  const isAdmin = whitelist.includes(userEmail);
  
  if (!isAdmin) {
    return {
      user: null,
      error: {
        code: 'FORBIDDEN',
        hint: 'Admin whitelist required',
        status: 403
      }
    };
  }

  return { user };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
