// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const ALLOWED_ORIGINS = [
  "https://m1ssion.eu",
  "https://www.m1ssion.eu", 
  "https://m1ssion.pages.dev",
  "http://localhost:8788",
];

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, X-M1-Dropper-Version",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

function handleOptions(req: Request) {
  return new Response("ok", { status: 200, headers: corsHeaders(req) });
}

interface PushPayload {
  title: string;
  body: string;
  image?: string | null;
  deepLink?: string | null;
  badge?: string | null;
}

interface PushTestRequest {
  token: string;
  payload: PushPayload;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
const vapidContact = Deno.env.get('VAPID_CONTACT');

serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions(req);

  try {
    // Check for required header
    const version = req.headers.get('X-M1-Dropper-Version');
    if (!version || version !== 'v1') {
      return new Response(JSON.stringify({ 
        error: 'Missing or invalid X-M1-Dropper-Version header',
        request_id: crypto.randomUUID()
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }
    // Auth check
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing authorization' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid token' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    const body: PushTestRequest = await req.json();
    
    // Validate required fields
    if (!body.token?.trim() || !body.payload?.title?.trim() || !body.payload?.body?.trim()) {
      return new Response(JSON.stringify({ ok: false, error: 'Token, title and body are required' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    const payload = body.payload;
    const testToken = body.token.trim();

    let success = false;
    let errorMessage = '';

    // Determine if it's an FCM token or WebPush endpoint
    const isWebPushEndpoint = testToken.startsWith('https://');

    if (isWebPushEndpoint) {
      // Handle WebPush
      if (!vapidPrivateKey || !vapidPublicKey || !vapidContact) {
        return new Response(JSON.stringify({ ok: false, error: 'WebPush not configured' }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders(req) },
        });
      }

      try {
        // Import webpush for WebPush API (FIXED)
        const webpush = await import('npm:web-push@3.6.7');
        
        webpush.default.setVapidDetails(
          vapidContact,
          vapidPublicKey,
          vapidPrivateKey
        );

        // For test, we need to parse endpoint if it contains keys
        // For simplicity, assume the token is just the endpoint and we have the keys stored
        // In a real scenario, you'd extract p256dh and auth from the provided data
        
        const webpushPayload = {
          title: payload.title,
          body: payload.body,
          icon: payload.image || '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: {
            deepLink: payload.deepLink || '/',
            timestamp: new Date().toISOString(),
          }
        };

        // Note: For a real test, you would need the full subscription object with keys
        // This is a simplified version
        await webpush.default.sendNotification(
          {
            endpoint: testToken,
            keys: {
              p256dh: 'test-p256dh', // These would need to be provided in the request
              auth: 'test-auth',
            }
          },
          JSON.stringify(webpushPayload)
        );

        success = true;
      } catch (error) {
        errorMessage = `WebPush error: ${error.message}`;
        console.error('WebPush test error:', error);
      }
    } else {
      // Handle FCM
      if (!fcmServerKey) {
        return new Response(JSON.stringify({ ok: false, error: 'FCM not configured' }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders(req) },
        });
      }

      try {
        const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
        
        const fcmPayload = {
          to: testToken,
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.image || '/icon-192x192.png',
            badge: payload.badge || '1',
          },
          data: {
            deepLink: payload.deepLink || '/',
            timestamp: new Date().toISOString(),
          }
        };

        const fcmResponse = await fetch(fcmUrl, {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fcmPayload),
        });

        if (fcmResponse.ok) {
          success = true;
        } else {
          const fcmError = await fcmResponse.text();
          errorMessage = `FCM error: ${fcmResponse.status} ${fcmError}`;
        }
      } catch (error) {
        errorMessage = `FCM error: ${error.message}`;
        console.error('FCM test error:', error);
      }
    }

    // Log the test
    await supabase.from('admin_logs').insert({
      event_type: 'push_test',
      user_id: user.id,
      note: `Push test: "${payload.title}" to ${testToken.substring(0, 20)}... - ${success ? 'SUCCESS' : 'FAILED'}`,
      context: 'push_test',
    });

    if (success) {
      return new Response(JSON.stringify({ 
        ok: true, 
        message: 'Test notification sent successfully'
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    } else {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: errorMessage || 'Test failed'
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

  } catch (error) {
    console.error('Push test error:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(req) },
    });
  }
});