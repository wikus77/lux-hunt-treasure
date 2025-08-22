// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
// Firebase Cloud Messaging HTTP v1 API Push Notification Sender

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Firebase configuration
const FIREBASE_PROJECT_ID = "lux-hunt-treasure";

// Get Firebase Admin credentials with proper base64 decoding
const getFirebaseCredentials = () => {
  try {
    const serviceAccountB64 = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_B64');
    
    if (!serviceAccountB64) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_B64 environment variable not set');
    }

    console.log('🔄 FCM-PUSH: Decoding Firebase service account...');
    
    // Proper base64 decoding for JSON
    const serviceAccountJson = atob(serviceAccountB64);
    
    // Normalize escaped newlines in private key
    const normalizedJson = serviceAccountJson.replace(/\\n/g, '\n');
    
    const serviceAccount = JSON.parse(normalizedJson);
    
    // Validate required fields
    if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
      throw new Error('Invalid service account: missing required fields');
    }
    
    console.log('✅ FCM-PUSH: Firebase credentials loaded and validated');
    return serviceAccount;
  } catch (error) {
    console.error('❌ FCM-PUSH: Failed to load Firebase credentials:', error);
    throw error;
  }
};

// Get OAuth2 access token for Firebase
const getAccessToken = async (serviceAccount: any): Promise<string> => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = {
      alg: "RS256",
      typ: "JWT"
    };

    const jwtPayload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    };

    // Create JWT for Google OAuth2
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(jwtHeader)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const unsignedToken = `${headerB64}.${payloadB64}`;
    
    // Import private key for signing
    const privateKeyPem = serviceAccount.private_key;
    const pemContents = privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----|\n|-----END PRIVATE KEY-----/g, '');
    const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the JWT
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      encoder.encode(unsignedToken)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const jwt = `${unsignedToken}.${signatureB64}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`OAuth2 token request failed: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ FCM-PUSH: OAuth2 access token obtained');
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ FCM-PUSH: Failed to get access token:', error);
    throw error;
  }
};

// Get FCM tokens for user(s)
const getTokensForUsers = async (userIds?: string[]): Promise<string[]> => {
  try {
    let query = supabase.from('push_tokens').select('token');
    
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ FCM-PUSH: Database query failed:', error);
      return [];
    }

    const tokens = data?.map(row => row.token) || [];
    console.log(`📊 FCM-PUSH: Found ${tokens.length} tokens`);
    return tokens;
  } catch (error) {
    console.error('❌ FCM-PUSH: Failed to get tokens:', error);
    return [];
  }
};

// Send FCM message using HTTP v1 API
const sendFCMMessage = async (
  accessToken: string,
  tokens: string[],
  title: string,
  body: string,
  clickAction?: string,
  data?: Record<string, any>
) => {
  if (tokens.length === 0) {
    console.warn('⚠️ FCM-PUSH: No tokens to send to');
    return { sent: 0, failures: 0, errors: [] };
  }

  const messages = tokens.map(token => ({
    message: {
      token,
      notification: {
        title,
        body
      },
      data: {
        click_action: clickAction || '/',
        ...data
      },
      webpush: {
        fcm_options: {
          link: clickAction || '/'
        }
      }
    }
  }));

  let sent = 0;
  let failures = 0;
  const errors: any[] = [];

  // Send messages (FCM allows batch sending but we'll send individually for better error handling)
  for (const messageData of messages) {
    try {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        }
      );

      if (response.ok) {
        sent++;
        console.log('✅ FCM-PUSH: Message sent successfully');
      } else {
        failures++;
        const errorData = await response.text();
        console.error('❌ FCM-PUSH: Message send failed:', errorData);
        errors.push({ token: messageData.message.token, error: errorData });
      }
    } catch (error) {
      failures++;
      console.error('❌ FCM-PUSH: Network error:', error);
      errors.push({ token: messageData.message.token, error: error.message });
    }
  }

  return { sent, failures, errors };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 FCM-PUSH: Processing push notification request...');

    // Parse request body
    const requestBody = await req.json();
    const { 
      title, 
      body, 
      click_action, 
      data, 
      user_id, 
      user_ids, 
      token: directToken,
      broadcast = false 
    } = requestBody;

    console.log('📋 FCM-PUSH: Request details:', {
      title: title?.substring(0, 50),
      body: body?.substring(0, 50),
      user_id,
      user_ids: user_ids?.length,
      directToken: directToken?.substring(0, 20),
      broadcast
    });

    // Validate required fields
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Firebase credentials and access token
    const serviceAccount = getFirebaseCredentials();
    const accessToken = await getAccessToken(serviceAccount);

    // Determine tokens to send to
    let tokens: string[] = [];
    
    if (directToken) {
      tokens = [directToken];
    } else if (user_id) {
      tokens = await getTokensForUsers([user_id]);
    } else if (user_ids && user_ids.length > 0) {
      tokens = await getTokensForUsers(user_ids);
    } else if (broadcast) {
      tokens = await getTokensForUsers(); // Get all tokens
    }

    if (tokens.length === 0) {
      console.warn('⚠️ FCM-PUSH: No FCM tokens found for specified criteria');
      return new Response(
        JSON.stringify({ 
          success: true, 
          sent: 0, 
          failures: 0,
          total_tokens: 0,
          reason: 'No tokens found for specified criteria' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send FCM messages
    const result = await sendFCMMessage(
      accessToken,
      tokens,
      title,
      body,
      click_action,
      data
    );

    console.log(`📊 FCM-PUSH: Completed - Sent: ${result.sent}, Failed: ${result.failures}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: result.sent,
        failures: result.failures,
        total_tokens: tokens.length,
        errors: result.errors.length > 0 ? result.errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ FCM-PUSH: Function failed:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});