// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* W3C Web Push + VAPID Implementation */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webPush from "https://esm.sh/web-push@3.6.7";

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

// Base64url decoder per verifiche VAPID
const b64urlToUint8 = (s: string) => {
  const p = '='.repeat((4 - s.length % 4) % 4);
  const b64 = (s + p).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
};

const pubBytes = b64urlToUint8(VAPID_PUBLIC_KEY);
const privBytes = b64urlToUint8(VAPID_PRIVATE_KEY);

console.log('[PUSH] 🔑 VAPID verification:', {
  pub_length: pubBytes.length,
  prv_length: privBytes.length,
  pub_fingerprint: Array.from(pubBytes.slice(0, 8)).map(x => x.toString(16).padStart(2, '0')).join(''),
  prv_fingerprint: Array.from(privBytes.slice(0, 8)).map(x => x.toString(16).padStart(2, '0')).join('')
});

// Verify VAPID key lengths
console.log('[PUSH] 🔑 VAPID key validation:', {
  public_length: pubBytes.length,
  private_length: privBytes.length,
  expected_public: 65,
  expected_private: 32,
  public_valid: pubBytes.length === 65,
  private_valid: privBytes.length === 32
});

if (pubBytes.length !== 65) {
  console.error('[PUSH] ❌ VAPID PUBLIC KEY wrong length:', pubBytes.length, 'expected 65');
}
if (privBytes.length !== 32) {
  console.error('[PUSH] ❌ VAPID PRIVATE KEY wrong length:', privBytes.length, 'expected 32');
}

// Configure web-push with VAPID
webPush.setVapidDetails(
  'mailto:push@m1ssion.eu',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

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

    // Send notifications using web-push library
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        const endpoint = subscription.endpoint;
        console.log(`[PUSH] 🚀 Sending to: ${endpoint.substring(0, 64)}...`);
        
        // Build proper subscription object for web-push
        const pushSubscription = {
          endpoint: endpoint,
          keys: subscription.keys || {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };
        
        console.log(`[PUSH] 📨 Subscription keys:`, { 
          p256dh_length: pushSubscription.keys.p256dh?.length,
          auth_length: pushSubscription.keys.auth?.length 
        });
        
        // Send using web-push library with VAPID
        const pushResult = await webPush.sendNotification(
          pushSubscription,
          JSON.stringify(notification),
          {
            TTL: 60,
            urgency: 'normal',
            topic: 'mission-notification'
          }
        );

        console.log(`[PUSH] ✅ Web-push result:`, pushResult.statusCode);
        
        sent++;
        results.push({
          endpoint: endpoint.substring(0, 64) + '...',
          ok: true,
          status: pushResult.statusCode || 200
        });

      } catch (error) {
        console.error(`[PUSH] ❌ Web-push error:`, error.message);
        failed++;
        
        // Handle specific web-push errors
        if (error.statusCode === 404 || error.statusCode === 410) {
          console.log('[PUSH] 🗑️ Removing invalid subscription...');
          try {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
          } catch (dbError) {
            console.warn('[PUSH] Failed to clean up invalid subscription:', dbError.message);
          }
        }
        
        results.push({
          endpoint: subscription.endpoint?.substring(0, 64) + '...',
          ok: false,
          status: error.statusCode || 500,
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

// Helper function for base64url encoding (not needed with web-push library)
function base64UrlEncode(data: string): string {
  const base64 = btoa(data);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}