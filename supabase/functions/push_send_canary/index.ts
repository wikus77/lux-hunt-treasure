// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Supabase Edge Function - Push Send Canary with Real Web Push */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dynamic CORS headers based on request origin
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://m1ssion.eu',
    'https://lovable.dev',
    /^https:\/\/.*\.lovable\.dev$/,
    /^https:\/\/.*\.sandbox\.lovable\.dev$/
  ];
  
  let allowOrigin = 'https://m1ssion.eu'; // default fallback
  
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      return allowed.test(origin);
    });
    if (isAllowed) allowOrigin = origin;
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

console.log('[PUSH-SEND-CANARY] 🚀 M1SSION™ Push Send Canary Function loaded');

serve(async (req) => {
  console.log(`[PUSH-SEND-CANARY] ${req.method} ${req.url}`);
  
  const corsHeaders = getCorsHeaders(req);

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
    // Get VAPID keys from secrets - CRITICAL: Must match frontend
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('[PUSH-SEND-CANARY] ❌ Missing VAPID keys in environment');
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'VAPID keys not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Log key lengths for verification (NOT the actual keys)
    console.log('[PUSH-SEND-CANARY] 🔑 VAPID key lengths:', {
      publicKeyLength: VAPID_PUBLIC_KEY.length,
      privateKeyLength: VAPID_PRIVATE_KEY.length
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('[PUSH-SEND-CANARY] 📥 Request body:', {
      hasUserId: !!body.user_id,
      title: body.title,
      body: body.body?.substring(0, 50)
    });

    const { user_id, title, body: messageBody, data: customData } = body;
    
    // Allow null user_id for anonymous/test calls
    const finalUserId = user_id || null;

    if (!title || !messageBody) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'title and body are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Lookup subscriptions - handle both user_id and null user_id for testing
    let query = supabase.from('push_subscriptions').select('*');
    
    if (finalUserId) {
      query = query.eq('user_id', finalUserId);
    } else {
      // For testing, get recent subscriptions without user_id
      query = query.is('user_id', null).order('created_at', { ascending: false }).limit(20);
    }
    
    const { data: subscriptions, error: dbError } = await query;

    if (dbError) {
      console.error('[PUSH-SEND-CANARY] Database error:', dbError);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Database query failed' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'No subscriptions found for user' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[PUSH-SEND-CANARY] Found ${subscriptions.length} subscriptions for user`);

    // Prepare notification payload
    const notificationPayload = {
      title,
      body: messageBody,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: 'https://m1ssion.eu',
        timestamp: Date.now(),
        ...customData
      },
      actions: [
        {
          action: 'open',
          title: 'Apri M1SSION™',
          icon: '/icon-192x192.png'
        }
      ]
    };

    const results = {
      sent: [],
      failed: [],
      to_delete: []
    };

    // Send push notifications using real web-push implementation
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        // Use Web Push API with real VAPID signing
        const response = await sendWebPushNotification(
          pushSubscription,
          JSON.stringify(notificationPayload),
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );

        if (response.ok) {
          results.sent.push({
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            endpoint_type: subscription.endpoint_type,
            status: response.status
          });
          console.log(`[PUSH-SEND-CANARY] ✅ Sent to ${subscription.endpoint_type}`);
        } else {
          const errorStatus = response.status;
          results.failed.push({
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            endpoint_type: subscription.endpoint_type,
            status: errorStatus,
            error: await response.text()
          });
          
          // Mark for deletion if expired (404/410)
          if (errorStatus === 404 || errorStatus === 410) {
            results.to_delete.push({
              endpoint: subscription.endpoint.substring(0, 50) + '...',
              id: subscription.id
            });
          }
          
          console.log(`[PUSH-SEND-CANARY] ❌ Failed to send to ${subscription.endpoint_type}: ${errorStatus}`);
        }
      } catch (error) {
        results.failed.push({
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          endpoint_type: subscription.endpoint_type,
          error: error.message
        });
        console.error(`[PUSH-SEND-CANARY] ❌ Exception sending to ${subscription.endpoint_type}:`, error);
      }
    }

    console.log('[PUSH-SEND-CANARY] 📊 Results:', {
      sent: results.sent.length,
      failed: results.failed.length,
      to_delete: results.to_delete.length
    });

    return new Response(JSON.stringify({
      ok: true,
      ...results,
      total_subscriptions: subscriptions.length,
      sent_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[PUSH-SEND-CANARY] ❌ Unexpected error:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Real Web Push implementation with VAPID signing
async function sendWebPushNotification(
  subscription: any,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const url = new URL(subscription.endpoint);
  
  // Generate VAPID JWT
  const vapidToken = await generateVAPIDToken(
    url.origin,
    vapidPublicKey,
    vapidPrivateKey
  );
  
  // Prepare headers based on endpoint type
  const headers: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
    'TTL': '86400'
  };
  
  // Different header formats for different push services
  if (subscription.endpoint.includes('fcm.googleapis.com')) {
    // FCM requires WebPush format
    headers['Authorization'] = `WebPush ${vapidToken}`;
    headers['Crypto-Key'] = `p256ecdsa=${vapidPublicKey}`;
  } else if (subscription.endpoint.includes('web.push.apple.com')) {
    // Apple WebPush uses VAPID format
    headers['Authorization'] = `vapid t=${vapidToken}, k=${vapidPublicKey}`;
  } else {
    // Default VAPID format for other services
    headers['Authorization'] = `vapid t=${vapidToken}, k=${vapidPublicKey}`;
    headers['Crypto-Key'] = `p256ecdsa=${vapidPublicKey}`;
  }
  
  console.log(`[PUSH-SEND-CANARY] 🔐 Headers for ${url.origin}:`, {
    endpointType: subscription.endpoint.includes('fcm.googleapis.com') ? 'FCM' : 
                  subscription.endpoint.includes('web.push.apple.com') ? 'APNS' : 'OTHER',
    hasAuth: !!headers.Authorization,
    hasCryptoKey: !!headers['Crypto-Key'],
    authFormat: headers.Authorization?.substring(0, 20) + '...',
    cryptoKeyFormat: headers['Crypto-Key']?.substring(0, 30) + '...'
  });
  
  // Send the actual push notification
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers,
    body: payload
  });
  
  return response;
}

// Generate real VAPID JWT token
async function generateVAPIDToken(
  audience: string,
  publicKey: string,
  privateKey: string
): Promise<string> {
  try {
    // Import the private key for signing
    const privateKeyBytes = base64UrlDecode(privateKey);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      privateKeyBytes,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
    
    // Create JWT header
    const header = {
      typ: 'JWT',
      alg: 'ES256'
    };
    
    // Create JWT payload
    const payload = {
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      sub: 'mailto:wikus77@hotmail.it'
    };
    
    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    
    // Sign the token
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );
    
    const encodedSignature = base64UrlEncode(new Uint8Array(signature));
    return `${unsignedToken}.${encodedSignature}`;
    
  } catch (error) {
    console.error('[PUSH-SEND-CANARY] ❌ Error generating VAPID token:', error);
    throw new Error('Failed to generate VAPID token');
  }
}

// Helper functions for base64url encoding/decoding
function base64UrlEncode(data: string | Uint8Array): string {
  let base64: string;
  if (typeof data === 'string') {
    base64 = btoa(data);
  } else {
    const binary = String.fromCharCode(...data);
    base64 = btoa(binary);
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(data: string): Uint8Array {
  const padding = '='.repeat((4 - data.length % 4) % 4);
  const base64 = (data + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return new Uint8Array(binary.split('').map(char => char.charCodeAt(0)));
}