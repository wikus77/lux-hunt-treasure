
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
    const { email, password, fullName, missionPreference } = await req.json();

    console.log('🔓 BYPASS REGISTRATION ATTEMPT:', { email, fullName, missionPreference });

    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use admin privileges to create user - bypasses CAPTCHA
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        mission_preference: missionPreference
      }
    });

    if (createError) {
      console.error('❌ Admin user creation failed:', createError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: createError.message,
          code: 'ADMIN_CREATE_FAILED'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('✅ User created successfully via admin:', user.user?.email);

    // Create a session for the user using regular client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: session, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError);
      // User created but can't sign in immediately - they can try manual login
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: user.user,
          message: 'User created successfully. Please try logging in manually.',
          requireManualLogin: true
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('✅ Session created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: session.user,
        session: session.session,
        message: 'Registration completed successfully via bypass'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('💥 BYPASS REGISTRATION EXCEPTION:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
});
