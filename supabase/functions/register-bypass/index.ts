
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 REGISTER BYPASS FUNCTION CALLED');
    
    // Initialize Supabase with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { email, password, fullName, missionPreference } = await req.json();
    
    console.log('📧 Registration request for:', email);
    console.log('🎯 Mission preference:', missionPreference);

    // Validate input data
    if (!email || !password || !fullName) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email, password e nome sono obbligatori' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('⚠️ User already exists:', email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Utente già registrato con questa email',
          requireManualLogin: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409 
        }
      );
    }

    console.log('🔄 Creating user via admin API...');
    
    // Create user using Supabase Admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email to bypass verification
      user_metadata: {
        full_name: fullName,
        mission_preference: missionPreference || null,
        registration_source: 'bypass_function',
        created_via: 'register_bypass'
      }
    });

    if (createError) {
      console.error('❌ User creation failed:', createError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Errore durante la creazione dell'account: ${createError.message}`,
          requireManualLogin: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('✅ User created successfully:', newUser.user?.id);

    // Create profile record
    if (newUser.user) {
      console.log('📝 Creating profile record...');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: email,
          full_name: fullName,
          mission_preference: missionPreference || null,
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('⚠️ Profile creation failed but user exists:', profileError);
        // Don't fail the entire registration, user can still login
      } else {
        console.log('✅ Profile created successfully');
      }
    }

    // Attempt automatic login for seamless UX
    console.log('🔐 Attempting automatic login...');
    
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (!loginError && loginData.session) {
        console.log('✅ Auto-login successful');
        return new Response(
          JSON.stringify({ 
            success: true,
            requireManualLogin: false,
            session: loginData.session,
            user: loginData.user,
            message: 'Registrazione e login completati con successo!'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } else {
        console.log('⚠️ Auto-login failed, requiring manual login:', loginError?.message);
        return new Response(
          JSON.stringify({ 
            success: true,
            requireManualLogin: true,
            message: 'Account creato con successo. Effettua il login manualmente.'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    } catch (autoLoginError) {
      console.error('❌ Auto-login exception:', autoLoginError);
      return new Response(
        JSON.stringify({ 
          success: true,
          requireManualLogin: true,
          message: 'Account creato con successo. Effettua il login manualmente.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

  } catch (error) {
    console.error('💥 REGISTER BYPASS CRITICAL ERROR:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Errore interno del server durante la registrazione',
        requireManualLogin: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
