
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

    // Use regular client for sign in
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Step 1: Check if developer user exists
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

    // Step 2: Ensure user is confirmed and has a password
    console.log('🔧 Ensuring user is confirmed and setting temporary password...');
    
    // Set a known password for the developer user
    const tempPassword = 'DevLogin2025!';
    
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      developerUser.id,
      { 
        email_confirm: true,
        email_confirmed_at: new Date().toISOString(),
        password: tempPassword
      }
    );

    if (updateError) {
      console.log('⚠️ Update user failed:', updateError.message);
    } else {
      console.log('✅ User confirmed and password set');
    }

    // Step 3: Use regular sign in with known credentials
    console.log('🔧 Attempting sign in with password...');
    
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: 'wikus77@hotmail.it',
      password: tempPassword
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Sign in failed',
          details: signInError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!signInData.session) {
      console.error('❌ No session created');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No session created'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ SIGN IN SUCCESS - Valid session created');

    // Step 4: Return the valid session
    const sessionResponse = {
      success: true,
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (signInData.session.expires_in || 3600),
      expires_in: signInData.session.expires_in || 3600,
      token_type: 'bearer',
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
        email_confirmed_at: signInData.user.email_confirmed_at,
        created_at: signInData.user.created_at,
        updated_at: signInData.user.updated_at,
        app_metadata: signInData.user.app_metadata || {},
        user_metadata: {
          ...signInData.user.user_metadata,
          developer_auto_login: true
        }
      },
      method: 'password_signin',
      message: 'Developer auto-login successful via password'
    };

    console.log('✅ DEVELOPER AUTO-LOGIN SUCCESSFUL');
    console.log('📊 Session validation:', {
      hasAccessToken: !!sessionResponse.access_token,
      hasRefreshToken: !!sessionResponse.refresh_token,
      hasUser: !!sessionResponse.user,
      tokenLength: sessionResponse.access_token.length,
      method: sessionResponse.method
    });

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
        error: 'Developer auto-login failed',
        details: error.message || error.toString(),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
