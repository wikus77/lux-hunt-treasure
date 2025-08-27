import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FCMNotificationRequest {
  token: string;
  title?: string;
  body?: string;
  link?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get Firebase Service Account JSON from secrets
    const firebaseSAJSON = Deno.env.get('FIREBASE_SA_JSON');
    if (!firebaseSAJSON) {
      console.error('FIREBASE_SA_JSON secret not configured');
      return new Response(
        JSON.stringify({ ok: false, error: 'Firebase Service Account not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the service account
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(firebaseSAJSON);
    } catch (error) {
      console.error('Failed to parse FIREBASE_SA_JSON:', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid Firebase Service Account format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const projectId = serviceAccount.project_id;
    if (!projectId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Project ID not found in service account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { token, title, body, link }: FCMNotificationRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate JWT for FCM authentication
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600
    };

    // Create JWT header and payload
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const jwtPayload = btoa(JSON.stringify(payload));
    const unsignedToken = `${header}.${jwtPayload}`;

    // Import private key for signing
    const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
    const keyData = privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // Sign the JWT
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    const jwt = `${unsignedToken}.${signatureBase64}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to get access token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Prepare FCM message
    const fcmMessage = {
      message: {
        token: token,
        notification: {
          title: title || '🚀 M1SSION™',
          body: body || 'Test da diagnostica FCM'
        },
        webpush: {
          headers: {
            'Urgency': 'high'
          },
          fcm_options: {
            link: link || 'https://m1ssion.eu/notifications'
          }
        }
      }
    };

    // Send FCM notification
    const fcmResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fcmMessage),
      }
    );

    const fcmResult = await fcmResponse.json();

    if (!fcmResponse.ok) {
      console.error('FCM send failed:', fcmResult);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: fcmResult.error?.message || 'Failed to send notification',
          details: fcmResult
        }),
        { status: fcmResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('FCM notification sent successfully:', fcmResult.name);

    return new Response(
      JSON.stringify({
        ok: true,
        fcmId: fcmResult.name,
        message: 'Notification sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('FCM test send error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});