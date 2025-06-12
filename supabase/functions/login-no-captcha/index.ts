
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

    // Step 2: Generate proper session using admin generateLink
    console.log('🔧 Generating developer session with proper Supabase methods...');
    
    try {
      // Use admin generateLink to create a valid session
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: 'wikus77@hotmail.it',
        options: {
          redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('/auth/v1', '')}/auth/v1/callback`
        }
      });

      if (linkError) {
        console.error('❌ Generate link failed:', linkError);
        
        // Fallback: try to create session directly
        console.log('🔄 Attempting direct session creation...');
        
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
          user_id: developerUser.id,
          session: {
            expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
          }
        });

        if (sessionError) {
          console.error('❌ Direct session creation failed:', sessionError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Session creation failed',
              details: sessionError.message
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        console.log('✅ Direct session created successfully');
        
        const sessionResponse = {
          success: true,
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
          expires_at: sessionData.expires_at,
          expires_in: sessionData.expires_in || 3600,
          token_type: 'bearer',
          user: sessionData.user,
          session: sessionData,
          method: 'direct_session_creation'
        };

        return new Response(
          JSON.stringify(sessionResponse),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      console.log('✅ Magic link generated successfully');
      
      // Extract tokens from the magic link URL
      const magicUrl = new URL(linkData.properties.action_link);
      const accessToken = magicUrl.searchParams.get('access_token');
      const refreshToken = magicUrl.searchParams.get('refresh_token');
      const expiresIn = parseInt(magicUrl.searchParams.get('expires_in') || '3600');
      const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

      if (!accessToken || !refreshToken) {
        console.error('❌ No tokens found in magic link');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No tokens in magic link response'
          }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      console.log('✅ Tokens extracted from magic link');
      console.log('📊 Access token length:', accessToken.length);
      console.log('📊 Refresh token length:', refreshToken.length);

      const sessionResponse = {
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        expires_in: expiresIn,
        token_type: 'bearer',
        user: {
          id: developerUser.id,
          email: developerUser.email,
          email_confirmed_at: developerUser.email_confirmed_at,
          confirmed_at: developerUser.confirmed_at,
          app_metadata: developerUser.app_metadata,
          user_metadata: developerUser.user_metadata,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: developerUser.created_at,
          updated_at: developerUser.updated_at
        },
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
          expires_in: expiresIn,
          token_type: 'bearer',
          user: {
            id: developerUser.id,
            email: developerUser.email,
            email_confirmed_at: developerUser.email_confirmed_at,
            confirmed_at: developerUser.confirmed_at,
            app_metadata: developerUser.app_metadata,
            user_metadata: developerUser.user_metadata,
            aud: 'authenticated',
            role: 'authenticated',
            created_at: developerUser.created_at,
            updated_at: developerUser.updated_at
          }
        },
        method: 'magic_link_token_extraction',
        message: 'Developer auto-login successful with valid Supabase tokens'
      };

      console.log('✅ DEVELOPER AUTO-LOGIN SUCCESSFUL');

      return new Response(
        JSON.stringify(sessionResponse),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );

    } catch (tokenError) {
      console.error('❌ Token generation failed:', tokenError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token generation failed',
          details: tokenError.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

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
