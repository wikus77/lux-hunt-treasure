
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

    // Step 2: Use admin.updateUser to force email confirmation if needed
    console.log('🔧 Ensuring user is confirmed...');
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      developerUser.id,
      { 
        email_confirm: true,
        email_confirmed_at: new Date().toISOString()
      }
    );

    if (updateError) {
      console.log('⚠️ Update user failed (but continuing):', updateError.message);
    } else {
      console.log('✅ User confirmed successfully');
    }

    // Step 3: Generate a password reset link (which contains valid tokens)
    console.log('🔧 Generating password reset link for token extraction...');
    
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: developerUser.email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`
      }
    });

    if (resetError || !resetData) {
      console.error('❌ Reset link generation failed:', resetError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Reset link generation failed',
          details: resetError?.message || 'No reset data'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Reset link generated successfully');

    let access_token = '';
    let refresh_token = '';
    
    // Step 4: Extract tokens from the action link
    if (resetData.properties?.action_link) {
      const url = new URL(resetData.properties.action_link);
      access_token = url.searchParams.get('access_token') || '';
      refresh_token = url.searchParams.get('refresh_token') || '';
      
      console.log('🔍 Token extraction from reset link:', {
        hasActionLink: true,
        hasAccess: !!access_token,
        hasRefresh: !!refresh_token,
        accessLength: access_token.length,
        refreshLength: refresh_token.length
      });
    }

    // Step 5: If no tokens from reset link, try magic link approach
    if (!access_token) {
      console.log('🔄 Trying magic link approach...');
      
      const { data: magicData, error: magicError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: developerUser.email,
        options: {
          redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`
        }
      });

      if (!magicError && magicData?.properties?.action_link) {
        const magicUrl = new URL(magicData.properties.action_link);
        access_token = magicUrl.searchParams.get('access_token') || '';
        refresh_token = magicUrl.searchParams.get('refresh_token') || '';
        
        console.log('🔍 Token extraction from magic link:', {
          hasAccess: !!access_token,
          hasRefresh: !!refresh_token,
          accessLength: access_token.length,
          refreshLength: refresh_token.length
        });
      }
    }

    // Step 6: If still no tokens, try direct user invitation
    if (!access_token) {
      console.log('🔄 Trying user invitation approach...');
      
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        developerUser.email,
        {
          redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`,
          data: {
            developer_auto_login: true
          }
        }
      );

      if (!inviteError && inviteData?.user) {
        console.log('✅ User invitation successful');
        
        // Try to generate another link after invitation
        const { data: postInviteData, error: postInviteError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: developerUser.email,
          options: {
            redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`
          }
        });

        if (!postInviteError && postInviteData?.properties?.action_link) {
          const postInviteUrl = new URL(postInviteData.properties.action_link);
          access_token = postInviteUrl.searchParams.get('access_token') || '';
          refresh_token = postInviteUrl.searchParams.get('refresh_token') || '';
          
          console.log('🔍 Token extraction post-invite:', {
            hasAccess: !!access_token,
            hasRefresh: !!refresh_token,
            accessLength: access_token.length,
            refreshLength: refresh_token.length
          });
        }
      }
    }

    // Step 7: Create a valid session response if we have tokens
    if (access_token && access_token.length > 0) {
      console.log('✅ VALID TOKENS FOUND - Creating session response');
      
      // Verify the token is properly formatted
      try {
        const tokenParts = access_token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        // Decode the payload to verify it's valid
        const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
        console.log('🔍 Token payload verification:', {
          sub: payload.sub,
          email: payload.email,
          exp: payload.exp,
          aud: payload.aud
        });
        
      } catch (parseError) {
        console.error('❌ Token validation failed:', parseError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Generated token is invalid',
            details: parseError.message
          }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const sessionResponse = {
        success: true,
        access_token: access_token,
        refresh_token: refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        token_type: 'bearer',
        user: {
          id: developerUser.id,
          email: developerUser.email,
          email_confirmed_at: developerUser.email_confirmed_at || new Date().toISOString(),
          created_at: developerUser.created_at,
          updated_at: developerUser.updated_at,
          app_metadata: developerUser.app_metadata || {},
          user_metadata: {
            ...developerUser.user_metadata,
            developer_auto_login: true
          }
        },
        method: 'admin_token_extraction',
        message: 'Developer auto-login successful'
      };

      console.log('✅ DEVELOPER AUTO-LOGIN SUCCESSFUL');
      console.log('📊 Final response validation:', {
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
    }

    // If we reach here, no tokens were generated by any method
    console.error('❌ NO VALID TOKENS GENERATED BY ANY METHOD');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'No valid tokens generated by any method',
        debug: {
          userFound: !!developerUser,
          resetLinkTried: true,
          magicLinkTried: true,
          invitationTried: true,
          finalTokenLength: access_token.length
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
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
