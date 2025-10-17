/*
 * M1SSION™ Web Push Send - Standard W3C
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 * 
 * Invia notifiche push usando Web Push puro (no Firebase)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// CORS headers
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
}

// Web Push sender using native fetch
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    // Import web-push library
    const webpush = await import('npm:web-push@3.6.7');
    
    webpush.setVapidDetails(
      'mailto:admin@m1ssion.eu',
      vapidPublicKey,
      vapidPrivateKey
    );

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    await webpush.sendNotification(pushSubscription, payload);
    return { success: true, statusCode: 201 };
  } catch (error: any) {
    console.error('[WEBPUSH-SEND] Error:', error);
    return {
      success: false,
      statusCode: error.statusCode || 500,
      error: error.message || 'Unknown error'
    };
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { user_ids, payload, all_users } = body;

    // Validate payload
    if (!payload?.title || !payload?.body) {
      return new Response(JSON.stringify({ 
        error: 'Missing payload with title and body' 
      }), {
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('[WEBPUSH-SEND] VAPID keys not configured');
      return new Response(JSON.stringify({ 
        error: 'VAPID keys not configured' 
      }), {
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Setup Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get target subscriptions
    let query = supabase
      .from('push_tokens')
      .select('id, user_id, endpoint, p256dh, auth')
      .eq('is_active', true);

    if (!all_users && user_ids?.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('[WEBPUSH-SEND] Database error:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        total: 0,
        sent: 0,
        failed: 0,
        message: 'No active subscriptions found'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send notifications
    const results = [];
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      badge: payload.badge || '/icon-192.png',
      icon: payload.icon || '/icon-512.png'
    });

    console.log(`[WEBPUSH-SEND] Sending to ${subscriptions.length} subscriptions`);

    for (const sub of subscriptions) {
      const result = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        pushPayload,
        vapidPublicKey,
        vapidPrivateKey
      );

      results.push({
        user_id: sub.user_id,
        endpoint: sub.endpoint.substring(0, 50) + '...',
        ...result
      });

      // Log attempt
      await supabase.from('push_logs').insert({
        user_id: sub.user_id,
        endpoint: sub.endpoint,
        status: result.success ? 'success' : 'failure',
        status_code: result.statusCode,
        error_message: result.error,
        payload: payload
      });

      // Handle dead endpoints (410 Gone or 404 Not Found)
      if (!result.success && (result.statusCode === 410 || result.statusCode === 404)) {
        console.log(`[WEBPUSH-SEND] Deactivating dead endpoint: ${sub.endpoint.substring(0, 50)}`);
        await supabase
          .from('push_tokens')
          .update({ is_active: false })
          .eq('id', sub.id);
      }
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`[WEBPUSH-SEND] Completed: ${sent} sent, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      results,
      total: subscriptions.length,
      sent,
      failed
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[WEBPUSH-SEND] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
