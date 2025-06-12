
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

    // Step 2: Generate magic link with proper token extraction
    console.log('🔧 Generating magic link for token extraction...');
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: developerUser.email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`
      }
    });

    if (linkError) {
      console.error('❌ Magic link generation failed:', linkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Magic link generation failed',
          details: linkError.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Magic link generated successfully');

    // Step 3: Extract tokens from magic link
    let access_token = '';
    let refresh_token = '';
    
    if (linkData?.properties?.action_link) {
      const url = new URL(linkData.properties.action_link);
      access_token = url.searchParams.get('access_token') || '';
      refresh_token = url.searchParams.get('refresh_token') || '';
      
      console.log('📊 Tokens extracted from magic link:', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        accessTokenLength: access_token.length,
        refreshTokenLength: refresh_token.length
      });
    }

    // Step 4: Fallback - Create manual session if tokens not found
    if (!access_token || !refresh_token) {
      console.log('⚠️ No tokens in magic link, creating manual session...');
      
      // Generate manual JWT tokens using the correct Supabase user structure
      const now = Math.floor(Date.now() / 1000);
      const exp = now + 3600; // 1 hour from now
      
      // Create a proper JWT header and payload
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };
      
      const payload = {
        aud: 'authenticated',
        exp: exp,
        iat: now,
        iss: `https://${Deno.env.get('SUPABASE_URL')?.replace('https://', '')}`,
        sub: developerUser.id,
        email: developerUser.email,
        phone: '',
        app_metadata: {
          provider: 'developer_bypass',
          providers: ['developer_bypass']
        },
        user_metadata: {
          developer_auto_login: true
        },
        role: 'authenticated',
        aal: 'aal1',
        amr: [{ method: 'developer_bypass', timestamp: now }],
        session_id: crypto.randomUUID()
      };

      // Encode to base64url (not base64)
      const base64UrlEncode = (obj: any) => {
        return btoa(JSON.stringify(obj))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const headerEncoded = base64UrlEncode(header);
      const payloadEncoded = base64UrlEncode(payload);
      
      // Create signature using JWT_SECRET (if available) or fallback
      const secret = Deno.env.get('SUPABASE_JWT_SECRET') || Deno.env.get('JWT_SECRET') || 'fallback-secret';
      const data = `${headerEncoded}.${payloadEncoded}`;
      
      // Simple HMAC-SHA256 signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
      const signatureBase64Url = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      access_token = `${data}.${signatureBase64Url}`;
      refresh_token = crypto.randomUUID();
      
      console.log('✅ Manual tokens created:', {
        accessTokenLength: access_token.length,
        refreshTokenLength: refresh_token.length,
        expiresAt: new Date(exp * 1000).toISOString()
      });
    }

    if (!access_token || !refresh_token) {
      console.error('❌ No valid tokens generated');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid tokens generated'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Step 5: Return properly formatted session response
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
        app_metadata: {
          provider: 'developer_bypass',
          providers: ['developer_bypass']
        },
        user_metadata: {
          developer_auto_login: true
        }
      },
      method: 'developer_magic_link_bypass',
      message: 'Developer auto-login successful with valid tokens'
    };

    console.log('✅ DEVELOPER AUTO-LOGIN SUCCESSFUL');
    console.log('📊 Final token validation:', {
      accessTokenFormat: access_token.split('.').length === 3 ? 'Valid JWT' : 'Invalid format',
      refreshTokenPresent: !!refresh_token,
      userPresent: !!sessionResponse.user,
      expiresAt: new Date(sessionResponse.expires_at * 1000).toISOString()
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
