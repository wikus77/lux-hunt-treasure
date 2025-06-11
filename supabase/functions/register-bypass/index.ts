
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
    const body = await req.json();
    const { email, password, fullName, missionPreference, action } = body;

    console.log('🔓 BYPASS REQUEST:', { email, action: action || 'register' });

    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // MODALITÀ LOGIN BYPASS
    if (action === 'login') {
      console.log('🔐 BYPASS LOGIN ATTEMPT for:', email);
      
      // Verifica che l'utente esista
      const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
      if (getUserError) {
        console.error('❌ Error listing users:', getUserError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Cannot verify user existence',
            code: 'USER_VERIFICATION_FAILED'
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      const existingUser = users.users.find(user => user.email === email);
      if (!existingUser) {
        console.error('❌ User not found:', email);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      // Crea una sessione di accesso tramite admin (BYPASS COMPLETO CAPTCHA)
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/auth`
        }
      });

      if (sessionError) {
        console.error('❌ Magic link generation failed:', sessionError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: sessionError.message,
            code: 'MAGIC_LINK_FAILED'
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }

      console.log('✅ Magic link generated successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: existingUser,
          magicLink: sessionData.properties?.action_link,
          message: 'Login bypass successful - use magic link',
          bypassMethod: 'magic_link'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // MODALITÀ REGISTRAZIONE (codice esistente)
    console.log('📝 BYPASS REGISTRATION for:', email);

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
    console.error('💥 BYPASS EXCEPTION:', error);
    
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
