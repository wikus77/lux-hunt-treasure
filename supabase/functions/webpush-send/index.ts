/*
 * M1SSION™ Web Push Send
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://m1ssion.eu',
    /^https:\/\/.*\.m1ssion\.pages\.dev$/,
    /^https:\/\/.*\.lovable\.dev$/
  ];
  
  let allowOrigin = 'https://m1ssion.eu';
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    );
    if (isAllowed) allowOrigin = origin;
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-mi-dropper-version',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { subscriptions, audience, payload } = body;

    if (!payload?.title || !payload?.body) {
      return new Response(JSON.stringify({ 
        error: 'Missing payload with title and body' 
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Setup VAPID
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidContact = Deno.env.get('VAPID_CONTACT') || 'mailto:admin@m1ssion.eu';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ 
        error: 'VAPID keys not configured' 
      }), {
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    webpush.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey);

    // Determina destinatari
    let targets = [];

    if (subscriptions?.length > 0) {
      targets = subscriptions;
    } else if (audience) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: dbSubs, error } = await supabase
        .from('webpush_subscriptions')
        .select('endpoint, provider, p256dh, auth')
        .eq('is_active', true);

      if (error) throw error;

      targets = dbSubs.map(sub => ({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }));
    }

    // Invia notifiche
    const results = [];
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/'
    });

    for (const target of targets) {
      try {
        await webpush.sendNotification(target, pushPayload);
        results.push({
          endpoint: target.endpoint?.substring(0, 50) + '...',
          success: true,
          status: 201
        });
      } catch (error) {
        results.push({
          endpoint: target.endpoint?.substring(0, 50) + '...',
          success: false,
          error: error?.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[WEBPUSH-SEND] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});