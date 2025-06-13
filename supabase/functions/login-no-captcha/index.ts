
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
    
    // Verifica variabili d'ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('📋 ENV CHECK:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
      hasAnonKey: !!anonKey,
      urlValue: supabaseUrl
    });
    
    if (!supabaseUrl || !serviceKey || !anonKey) {
      console.error('❌ Missing environment variables');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing environment variables',
        details: `URL: ${!!supabaseUrl}, ServiceKey: ${!!serviceKey}, AnonKey: ${!!anonKey}`
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const supabaseClient = createClient(supabaseUrl, anonKey);

    console.log('🔍 Looking for developer user...');
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'wikus77@hotmail.it');

    if (fetchError || !users || users.length === 0) {
      console.error('❌ Error fetching user or user not found:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Developer user not found',
        details: fetchError?.message
      }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const developerUser = users[0];
    console.log('✅ Developer user found, updating password...');
    const tempPassword = 'DevLogin2025!';
    
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(developerUser.id, {
      email_confirm: true,
      email_confirmed_at: new Date().toISOString(),
      password: tempPassword
    });
    
    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Cannot update user',
        details: updateError.message
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    console.log('🔑 Attempting sign in...');
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: 'wikus77@hotmail.it',
      password: tempPassword
    });

    if (signInError || !signInData.session) {
      console.error('❌ Sign in failed:', signInError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Sign in failed',
        details: signInError?.message || 'No session created'
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    console.log('✅ AUTO-LOGIN COMPLETATO');
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
    console.error('CRITICAL ERROR STACK:', error.stack || error);
    console.error('CRITICAL ERROR MESSAGE:', error.message || error.toString());
    return new Response(JSON.stringify({
      success: false,
      error: 'Developer auto-login failed',
      details: error.message || error.toString(),
      stack: error.stack || 'No stack trace available',
      timestamp: new Date().toISOString()
    }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
