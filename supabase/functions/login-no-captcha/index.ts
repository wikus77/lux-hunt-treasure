
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('🔐 DEVELOPER AUTO-LOGIN REQUEST');

    // Get developer user by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error listing users:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot retrieve users' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const developerUser = userData.users.find(user => user.email === 'wikus77@hotmail.it');
    
    if (!developerUser) {
      console.error('❌ Developer user not found');
      return new Response(
        JSON.stringify({ success: false, error: 'Developer user not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Developer user found:', developerUser.email);

    // Create session for developer
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 3600; // 1 hour

    // Generate tokens for the session
    const accessToken = `sb-developer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const refreshToken = `sb-refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: developerUser
    };

    console.log('✅ DEVELOPER SESSION CREATED SUCCESSFULLY');

    return new Response(
      JSON.stringify({ 
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        user: developerUser,
        session: session,
        message: 'Developer auto-login successful'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('💥 DEVELOPER AUTO-LOGIN ERROR:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Developer auto-login failed'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
