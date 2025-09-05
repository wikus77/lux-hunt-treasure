// property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.
// FCM Push Send - Send notifications to multiple tokens/users

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendPushRequest {
  tokens?: string[];
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

async function generateAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON');
  if (!serviceAccountJson) {
    throw new Error('FCM_SERVICE_ACCOUNT_JSON not configured');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  const projectId = Deno.env.get('FCM_PROJECT_ID') || serviceAccount.project_id;

  // Create JWT header and payload
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  // Manual JWT creation for Deno
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Import private key for signing
  const privateKeyPem = serviceAccount.private_key.replace(/\\n/g, '\n');
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get access token: ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function sendFCMMessage(token: string, title: string, body: string, data?: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  const projectId = Deno.env.get('FCM_PROJECT_ID');
  if (!projectId) {
    throw new Error('FCM_PROJECT_ID not configured');
  }

  try {
    const accessToken = await generateAccessToken();
    
    const message = {
      message: {
        token,
        notification: { title, body },
        ...(data && { data })
      }
    };

    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FCM send failed for token ${token.substring(0, 20)}...:`, errorText);
      
      return { 
        success: false, 
        error: errorText.includes('registration-token-not-registered') ? 'TOKEN_INVALID' : 'FCM_ERROR'
      };
    }

    return { success: true };

  } catch (error) {
    console.error(`FCM send error for token ${token.substring(0, 20)}...:`, error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const body: SendPushRequest = await req.json();
    const { tokens, userIds, title, body: messageBody, data } = body;

    if (!title || !messageBody) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let targetTokens: string[] = [];

    // Collect tokens from direct input
    if (tokens && tokens.length > 0) {
      targetTokens.push(...tokens);
    }

    // Collect tokens from user IDs
    if (userIds && userIds.length > 0) {
      const { data: subscriptions, error } = await supabase
        .from('fcm_subscriptions')
        .select('token')
        .in('user_id', userIds)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching tokens for users:', error);
      } else if (subscriptions) {
        targetTokens.push(...subscriptions.map(sub => sub.token));
      }
    }

    if (targetTokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tokens found to send to' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔥 FCM Send: Sending to ${targetTokens.length} tokens`);

    // Send to all tokens
    const results = await Promise.all(
      targetTokens.map(token => sendFCMMessage(token, title, messageBody, data))
    );

    // Process results and clean up invalid tokens
    const successCount = results.filter(r => r.success).length;
    const invalidTokens = targetTokens.filter((token, index) => 
      results[index].error === 'TOKEN_INVALID'
    );

    // Clean up invalid tokens from database
    if (invalidTokens.length > 0) {
      console.log(`🧹 Cleaning up ${invalidTokens.length} invalid tokens`);
      
      const { error: cleanupError } = await supabase
        .from('fcm_subscriptions')
        .delete()
        .in('token', invalidTokens);

      if (cleanupError) {
        console.error('Error cleaning up invalid tokens:', cleanupError);
      }
    }

    console.log(`✅ FCM Send: ${successCount}/${targetTokens.length} notifications sent successfully`);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successCount,
        total: targetTokens.length,
        invalidTokensRemoved: invalidTokens.length,
        results: results.map((result, index) => ({
          token: targetTokens[index].substring(0, 20) + '...',
          success: result.success,
          error: result.error
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ FCM Send Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});