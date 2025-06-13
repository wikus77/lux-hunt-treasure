
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 DEVELOPER AUTO-LOGIN REQUEST - START');
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');

    console.log('🔍 Looking for developer user...');
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cannot retrieve users',
        details: userError.message
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const developerUser = userData.users.find((user) => user.email === 'wikus77@hotmail.it');
    if (!developerUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Developer user not found'
      }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const tempPassword = 'DevLogin2025!';
    await supabaseAdmin.auth.admin.updateUserById(developerUser.id, {
      email_confirm: true,
      email_confirmed_at: new Date().toISOString(),
      password: tempPassword
    });

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: 'wikus77@hotmail.it',
      password: tempPassword
    });

    if (signInError || !signInData.session) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sign in failed',
        details: signInError?.message || 'No session created'
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    return new Response(JSON.stringify({
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
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Developer auto-login failed',
      details: error.message || error.toString(),
      timestamp: new Date().toISOString()
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
