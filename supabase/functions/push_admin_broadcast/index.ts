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

interface AdminBroadcastRequest {
  title: string;
  body: string;
  image?: string | null;
  deepLink?: string | null;
  badge?: string | null;
  testToken?: string | null;
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

    // Check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'owner'].some(r => profile.role?.toLowerCase?.().includes(r))) {
      return new Response(JSON.stringify({ ok: false, error: 'Admin access required' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    const body: AdminBroadcastRequest = await req.json();
    
    // Validate required fields
    if (!body.title?.trim() || !body.body?.trim()) {
      return new Response(JSON.stringify({ ok: false, error: 'Title and body are required' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    // Get all active device subscriptions
    const { data: devices, error: devicesError } = await supabase
      .from('fcm_subscriptions')
      .select('user_id, token, platform, device_info')
      .eq('is_active', true);

    const { data: webpushSubs, error: webpushError } = await supabase
      .from('webpush_subscriptions')
      .select('user_id, endpoint, keys, platform')
      .eq('is_active', true);

    if (devicesError || webpushError) {
      console.error('Database error:', { devicesError, webpushError });
      return new Response(JSON.stringify({ ok: false, error: 'Database error' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    let sent = 0;
    let failed = 0;

    const payload: PushPayload = {
      title: body.title.trim(),
      body: body.body.trim(),
      image: body.image?.trim() || null,
      deepLink: body.deepLink?.trim() || null,
      badge: body.badge?.trim() || null,
    };

    // Send FCM notifications
    if (fcmServerKey && devices?.length) {
      const fcmUrl = 'https://fcm.googleapis.com/fcm/send';
      
      for (const device of devices) {
        try {
          const fcmPayload = {
            to: device.token,
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
            sent++;
          } else {
            failed++;
            console.log(`FCM failed for token ${device.token.substring(0, 20)}...`);
          }
        } catch (error) {
          failed++;
          console.error('FCM send error:', error);
        }
      }
    }

    // Send WebPush notifications
    if (vapidPrivateKey && vapidPublicKey && vapidContact && webpushSubs?.length) {
      // Import webpush for WebPush API (FIXED)
      const webpush = await import('npm:web-push@3.6.7');
      
      webpush.default.setVapidDetails(
        vapidContact,
        vapidPublicKey,
        vapidPrivateKey
      );

      for (const sub of webpushSubs) {
        try {
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

          await webpush.default.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys  // keys è già JSONB con p256dh e auth
            },
            JSON.stringify(webpushPayload)
          );

          sent++;
        } catch (error) {
          failed++;
          console.error('WebPush send error:', error);
        }
      }
    }

    // Log the broadcast
    await supabase.from('admin_logs').insert({
      event_type: 'push_admin_broadcast',
      user_id: user.id,
      note: `Admin broadcast: "${payload.title}" - ${sent}/${sent + failed} sent`,
      context: 'push_admin_broadcast',
    });

    return new Response(JSON.stringify({ 
      ok: true, 
      sent, 
      failed,
      message: `Broadcast sent to ${sent} devices, ${failed} failed`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(req) },
    });

  } catch (error) {
    console.error('Admin broadcast error:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders(req) },
    });
  }
});