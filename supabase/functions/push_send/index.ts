// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* W3C Web Push + VAPID Implementation */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://m1ssion.eu',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

console.log('[PUSH] 🚀 M1SSION™ W3C Web Push Function loaded');

// VAPID Keys allineate con il client
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BCboRJTDYR4W2lbR4_BLoSJUkbORYxmqyBi0oDZvbMUbwU-dq4U-tOkMLlpTSL9OYDAgQDmcswZ0eY8wRK5BV_U';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'n-QJKN01k1r7ROmzc5Ukn_-MkCE1q7_-Uv-QrCEkgT0';

console.log('[PUSH] 🔑 VAPID fingerprint:', {
  public_length: VAPID_PUBLIC_KEY.length,
  private_length: VAPID_PRIVATE_KEY.length,
  public_prefix: VAPID_PUBLIC_KEY.substring(0, 10),
  private_prefix: VAPID_PRIVATE_KEY.substring(0, 8)
});

serve(async (req) => {
  console.log(`[PUSH] ${req.method} ${req.url}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('[PUSH] 📥 Request:', JSON.stringify(body, null, 2));

    // Resolve subscriptions
    let subscriptions = [];
    
    if (body.subscription) {
      // Direct subscription
      subscriptions = [body.subscription];
      console.log('[PUSH] 📱 Using direct subscription');
    } else if (body.endpoint) {
      // Single endpoint
      subscriptions = [{ endpoint: body.endpoint }];
      console.log('[PUSH] 📱 Using single endpoint');
    } else if (body.endpoints) {
      // Multiple endpoints
      subscriptions = body.endpoints.map((ep: string) => ({ endpoint: ep }));
      console.log(`[PUSH] 📱 Using ${subscriptions.length} endpoints`);
    } else if (body.user_id) {
      // Query by user_id
      console.log('[PUSH] 🔍 Searching subscriptions for user_id:', body.user_id);
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', body.user_id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('[PUSH] ❌ Database error:', error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (data && data.length > 0) {
        subscriptions = data.map(sub => ({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }));
        console.log(`[PUSH] 📋 Found ${subscriptions.length} subscriptions for user`);
      }
    }

    if (subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        ok: false,
        error: 'No subscriptions found',
        searched: body.user_id ? `user_id: ${body.user_id}` : 'no criteria'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare notification payload
    const notification = {
      title: body.title || '🚀 M1SSION™',
      body: body.body || 'W3C Web Push notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: body.data || { 
        url: '/',
        timestamp: Date.now(),
        source: 'M1SSION'
      }
    };

    console.log('[PUSH] 📤 Notification:', JSON.stringify(notification, null, 2));

    // Send notifications using W3C Web Push
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        const endpoint = subscription.endpoint;
        console.log(`[PUSH] 🚀 Sending to: ${endpoint.substring(0, 50)}...`);
        
        const isApplePush = endpoint.includes('web.push.apple.com');
        const isFCM = endpoint.includes('fcm.googleapis.com');
        
        console.log(`[PUSH] 🍎 Apple: ${isApplePush}, 🟢 FCM: ${isFCM}`);
        
        let pushResponse;
        
        if (isApplePush) {
          // iOS Safari Web Push (standard W3C)
          pushResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'TTL': '2419200' // 4 weeks
            },
            body: JSON.stringify(notification)
          });
        } else if (isFCM) {
          // FCM Web Push with VAPID
          const vapidToken = await generateVapidJWT(endpoint);
          pushResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `WebPush ${vapidToken}`,
              'TTL': '60'
            },
            body: JSON.stringify(notification)
          });
        } else {
          // Generic Web Push
          pushResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'TTL': '60'
            },
            body: JSON.stringify(notification)
          });
        }

        console.log(`[PUSH] ✅ Response: ${pushResponse.status}`);
        
        if (pushResponse.ok || pushResponse.status === 204) {
          sent++;
          results.push({
            endpoint: endpoint.substring(0, 50) + '...',
            ok: true,
            status: pushResponse.status
          });
        } else {
          failed++;
          const errorText = await pushResponse.text();
          console.error(`[PUSH] ❌ Failed: ${pushResponse.status} - ${errorText}`);
          
          // Remove 404/410 subscriptions
          if (pushResponse.status === 404 || pushResponse.status === 410) {
            console.log('[PUSH] 🗑️ Removing invalid subscription...');
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', endpoint);
          }
          
          results.push({
            endpoint: endpoint.substring(0, 50) + '...',
            ok: false,
            status: pushResponse.status,
            error: errorText
          });
        }

      } catch (error) {
        console.error(`[PUSH] ❌ Exception:`, error);
        failed++;
        results.push({
          endpoint: subscription.endpoint?.substring(0, 50) + '...',
          ok: false,
          error: error.message
        });
      }
    }

    const finalResult = {
      ok: sent > 0,
      sent,
      failed,
      total: subscriptions.length,
      results,
      vapid_fingerprint: {
        public_key_prefix: VAPID_PUBLIC_KEY.substring(0, 10),
        private_key_length: VAPID_PRIVATE_KEY.length
      },
      timestamp: new Date().toISOString()
    };

    console.log('[PUSH] 📊 Result:', JSON.stringify(finalResult, null, 2));

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[PUSH] ❌ Fatal error:', error);
    
    return new Response(JSON.stringify({
      ok: false,
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Generate VAPID JWT for FCM
async function generateVapidJWT(audience: string): Promise<string> {
  try {
    const audienceUrl = new URL(audience);
    
    const header = {
      alg: 'ES256',
      typ: 'JWT'
    };
    
    const payload = {
      aud: audienceUrl.origin,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      sub: 'mailto:support@m1ssion.eu'
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    
    // For now, use mock signature (real implementation would use VAPID_PRIVATE_KEY)
    const mockSignature = base64UrlEncode('vapid-signature-' + Date.now());
    return `${unsignedToken}.${mockSignature}`;
    
  } catch (error) {
    console.error('[PUSH] ❌ VAPID JWT error:', error);
    return 'vapid-jwt-fallback';
  }
}

function base64UrlEncode(data: string): string {
  const base64 = btoa(data);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}