/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Admin Delete User Edge Function
 * Securely deletes users from both auth.users and public.profiles
 * Only accessible by verified administrators
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Same authorized email hash as update-mission for consistency
const AUTHORIZED_EMAIL_HASH = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Authentication check - identical to update-mission pattern
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing or invalid authorization header' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const jwt = authHeader.slice(7);
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(jwt);
    
    if (userErr || !user?.email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JWT token' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Verify admin authorization using SHA-256 hash
    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(user.email));
    const emailHash = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (emailHash !== AUTHORIZED_EMAIL_HASH) {
      console.warn(`🚨 UNAUTHORIZED ACCESS ATTEMPT: ${user.email} (hash: ${emailHash})`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized - insufficient privileges' 
      }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Validate request body
    const { user_id } = await req.json();
    if (!user_id || typeof user_id !== 'string') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing or invalid user_id' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`🗑️ Admin ${user.email} deleting user: ${user_id}`);

    // 1) Delete from auth.users (using service role)
    const authDeleteResult = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (authDeleteResult.error) {
      console.error('Auth delete error:', authDeleteResult.error);
      throw new Error(`Failed to delete from auth: ${authDeleteResult.error.message}`);
    }

    // 2) Delete from public.profiles (CASCADE will handle related tables)
    const profileDeleteResult = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user_id);
    
    if (profileDeleteResult.error) {
      console.error('Profile delete error:', profileDeleteResult.error);
      throw new Error(`Failed to delete profile: ${profileDeleteResult.error.message}`);
    }

    console.log(`✅ User ${user_id} successfully deleted by admin ${user.email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'User deleted successfully'
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('🚨 Admin delete user error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});