// property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.
// FCM Push Test - Send test notification to specific token

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestPushRequest {
  token: string;
  title?: string;
  body?: string;
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

  // Manual JWT creation (simple approach for Deno)
  const encoder = new TextEncoder();
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
    encoder.encode(unsignedToken)
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

async function sendFCMMessage(token: string, title: string, body: string, data?: Record<string, string>): Promise<boolean> {
  const projectId = Deno.env.get('FCM_PROJECT_ID');
  if (!projectId) {
    throw new Error('FCM_PROJECT_ID not configured');
  }

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
    console.error('FCM send failed:', errorText);
    
    // Handle token cleanup for invalid tokens
    if (errorText.includes('registration-token-not-registered') || 
        errorText.includes('invalid-registration-token')) {
      console.log('Token invalid, should be cleaned up:', token.substring(0, 20) + '...');
    }
    
    throw new Error(`FCM send failed: ${errorText}`);
  }

  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request
    const body: TestPushRequest = await req.json();
    const { token, title = 'M1SSION™ Test', body: messageBody = 'Notifica di test FCM funzionante!', data } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔥 FCM Test: Sending to token ${token.substring(0, 20)}...`);

    // Send notification
    await sendFCMMessage(token, title, messageBody, data);

    console.log('✅ FCM Test: Notification sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test notification sent successfully',
        token: token.substring(0, 20) + '...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ FCM Test Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});