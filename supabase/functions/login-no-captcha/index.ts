
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
    console.log('🔐 DEVELOPER AUTO-LOGIN REQUEST - START');

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

    // Step 1: Get developer user by email
    console.log('🔍 Looking for developer user...');
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error listing users:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot retrieve users',
          details: userError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const developerUser = userData.users.find(user => user.email === 'wikus77@hotmail.it');
    
    if (!developerUser) {
      console.error('❌ Developer user not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Developer user not found' 
        }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Developer user found:', developerUser.email);

    // Step 2: Create admin session directly
    console.log('🔧 Creating admin session for developer...');
    
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: developerUser.id
    });

    if (sessionError) {
      console.error('❌ Admin session creation failed:', sessionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Admin session creation failed',
          details: sessionError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!sessionData?.access_token || !sessionData?.refresh_token) {
      console.error('❌ Session created but no valid tokens received');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid tokens in admin session'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Admin session created successfully');
    console.log('📊 Access token length:', sessionData.access_token.length);
    console.log('📊 Refresh token length:', sessionData.refresh_token.length);
    console.log('📊 Token expires at:', new Date(sessionData.expires_at * 1000).toISOString());

    // Step 3: Return properly formatted session response
    const sessionResponse = {
      success: true,
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      expires_at: sessionData.expires_at,
      expires_in: sessionData.expires_in || 3600,
      token_type: 'bearer',
      user: sessionData.user,
      session: sessionData,
      method: 'admin_create_session',
      message: 'Developer auto-login successful with valid admin tokens'
    };

    console.log('✅ DEVELOPER AUTO-LOGIN SUCCESSFUL');
    console.log('📊 Response structure validated');

    return new Response(
      JSON.stringify(sessionResponse),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('💥 DEVELOPER AUTO-LOGIN CRITICAL ERROR:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Developer auto-login failed',
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
