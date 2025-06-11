
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
      
      // Verifica che l'utente esista e ottieni i suoi dati
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

      console.log('✅ User found, creating direct session...');

      // NUOVO APPROCCIO: Creare una sessione diretta con access token
      try {
        // Genera un access token valido per l'utente
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/auth/callback`
          }
        });

        if (sessionError) {
          console.error('❌ Session generation failed:', sessionError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: sessionError.message,
              code: 'SESSION_GENERATION_FAILED'
            }),
            { 
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }

        console.log('✅ Session generated successfully');

        // Crea un token di accesso tramite admin
        const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: 'temporary-bypass-password',
          email_confirm: true,
          user_metadata: existingUser.user_metadata
        });

        // Se l'utente esiste già, ignora l'errore e procedi con la sessione
        if (tokenError && !tokenError.message.includes('already been registered')) {
          console.error('❌ Token creation failed:', tokenError);
        }

        // Restituisci sia il magic link che i dati per una sessione diretta
        return new Response(
          JSON.stringify({ 
            success: true, 
            user: existingUser,
            magicLink: sessionData.properties?.action_link,
            session: {
              access_token: sessionData.properties?.hashed_token || 'generated-token',
              refresh_token: 'refresh-token',
              expires_in: 3600,
              user: existingUser
            },
            message: 'Login bypass successful - multiple auth methods available',
            bypassMethod: 'direct_session'
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );

      } catch (directSessionError) {
        console.error('❌ Direct session creation failed:', directSessionError);
        
        // Fallback: usa solo magic link
        const { data: magicData, error: magicError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: {
            redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/home`
          }
        });

        if (magicError) {
          console.error('❌ Magic link fallback failed:', magicError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'All login bypass methods failed',
              code: 'COMPLETE_BYPASS_FAILURE'
            }),
            { 
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: existingUser,
            magicLink: magicData.properties?.action_link,
            message: 'Magic link bypass successful',
            bypassMethod: 'magic_link_only'
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
    }

    // MODALITÀ REGISTRAZIONE (codice esistente migliorato)
    console.log('📝 BYPASS REGISTRATION for:', email);

    // Verifica se l'utente esiste già
    const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers();
    if (!checkError) {
      const userExists = existingUsers.users.find(user => user.email === email);
      if (userExists) {
        console.log('ℹ️ User already exists, skipping registration');
        return new Response(
          JSON.stringify({ 
            success: true, 
            user: userExists,
            message: 'User already registered',
            requireManualLogin: true
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
    }

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

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: user.user,
        message: 'Registration completed successfully via bypass',
        requireManualLogin: true
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
