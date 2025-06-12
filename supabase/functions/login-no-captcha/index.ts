
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

    // Step 2: Use admin.generateLink to create a proper session link
    console.log('🔧 Generating session link...');
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: developerUser.email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`
      }
    });

    if (linkError || !linkData) {
      console.error('❌ Link generation failed:', linkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Link generation failed',
          details: linkError?.message || 'No link data'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Link generated successfully');

    // Step 3: Extract tokens from the action link
    let access_token = '';
    let refresh_token = '';
    
    if (linkData.properties?.action_link) {
      const url = new URL(linkData.properties.action_link);
      const urlTokens = {
        access: url.searchParams.get('access_token'),
        refresh: url.searchParams.get('refresh_token'),
        type: url.searchParams.get('type')
      };
      
      console.log('🔍 URL analysis:', {
        hasActionLink: true,
        urlParams: Array.from(url.searchParams.keys()),
        hasAccess: !!urlTokens.access,
        hasRefresh: !!urlTokens.refresh,
        type: urlTokens.type
      });
      
      if (urlTokens.access) {
        access_token = urlTokens.access;
        refresh_token = urlTokens.refresh || '';
      }
    }

    // Step 4: If no tokens from URL, use the alternative approach
    if (!access_token) {
      console.log('⚠️ No tokens in URL, using alternative approach...');
      
      // Use admin.inviteUserByEmail which can generate valid tokens
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        developerUser.email,
        {
          redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`,
          data: {
            developer_auto_login: true,
            bypass_confirmation: true
          }
        }
      );

      if (inviteError) {
        console.error('❌ Invite failed:', inviteError);
      } else if (inviteData?.user) {
        console.log('✅ Invite created for existing user');
        
        // Generate a session token using a different approach
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email: developerUser.email,
          password: 'temp-developer-bypass',
          options: {
            redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`,
            data: {
              developer_auto_login: true
            }
          }
        });

        if (!sessionError && sessionData?.properties?.action_link) {
          const sessionUrl = new URL(sessionData.properties.action_link);
          access_token = sessionUrl.searchParams.get('access_token') || '';
          refresh_token = sessionUrl.searchParams.get('refresh_token') || '';
          
          console.log('🔧 Alternative tokens extracted:', {
            hasAccess: !!access_token,
            hasRefresh: !!refresh_token,
            accessLength: access_token.length
          });
        }
      }
    }

    // Step 5: Final validation and response
    if (!access_token) {
      console.error('❌ No valid tokens generated through any method');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid tokens generated',
          debug: {
            userFound: !!developerUser,
            linkGenerated: !!linkData,
            alternativeAttempted: true
          }
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create successful response
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
        email_confirmed_at: developerUser.email_confirmed_at,
        created_at: developerUser.created_at,
        updated_at: developerUser.updated_at,
        app_metadata: developerUser.app_metadata || {},
        user_metadata: {
          ...developerUser.user_metadata,
          developer_auto_login: true
        }
      },
      method: 'admin_link_extraction',
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
