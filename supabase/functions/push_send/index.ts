// CORS headers inline per evitare problemi di import
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

console.log('[PUSH] 🚀 M1SSION™ Push Send Function loaded');

// Configura le chiavi VAPID M1SSION™
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BMrCxTSkgHgNAynMRoieqvKPeEPq1L-dk7-hY4jyBSEt6Rwk9O7XfrR5VmQmLMOBWTycyONDk1oKGxhxuhcunkI';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'n-QJKN01k1r7ROmzc5Ukn_-MkCE1q7_-Uv-QrCEkgT0';

console.log('[PUSH] 🔑 VAPID Public Key:', VAPID_PUBLIC_KEY);
console.log('[PUSH] 🔑 VAPID Private Key length:', VAPID_PRIVATE_KEY.length);

Deno.serve(async (req) => {
  console.log(`[PUSH] ${req.method} ${req.url}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('[PUSH] 📥 Request body:', JSON.stringify(body, null, 2));

    // Se il body contiene una subscription diretta, usala
    let subscriptions = [];
    
    if (body.subscription) {
      // Subscription diretta dal frontend
      subscriptions = [body.subscription];
      console.log('[PUSH] 📱 Using direct subscription from frontend');
    } else if (body.endpoint) {
      // Cerca una subscription specifica nel DB
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('endpoint', body.endpoint)
        .limit(1);
      
      if (error) {
        console.error('[PUSH] ❌ Database error:', error);
      } else if (data && data.length > 0) {
        const sub = data[0];
        subscriptions = [{
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }];
      }
    } else {
      // Prendi tutte le subscription attive dal DB
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('[PUSH] ❌ Database error:', error);
      } else if (data) {
        subscriptions = data.map(sub => ({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }));
      }
    }

    console.log(`[PUSH] 📋 Found ${subscriptions.length} subscriptions`);

    if (subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        ok: false,
        error: 'No subscriptions found',
        searched_endpoint: body.endpoint || 'all'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepara il payload della notifica
    const notification = {
      title: body.title || '🚀 M1SSION™ Push Test',
      body: body.body || 'Le notifiche push funzionano perfettamente!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: body.data || { 
        url: '/ios-check.html',
        timestamp: Date.now(),
        source: 'M1SSION'
      }
    };

    console.log('[PUSH] 📤 Notification payload:', JSON.stringify(notification, null, 2));

    // Invia notifiche usando Apple Push Service direttamente
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        console.log(`[PUSH] 🚀 Sending to endpoint: ${subscription.endpoint.substring(0, 50)}...`);
        
        // Controllo se è Apple Push Service
        const isApplePush = subscription.endpoint.includes('web.push.apple.com');
        console.log(`[PUSH] 🍎 Is Apple Push: ${isApplePush}`);
        
        let pushResponse;
        
        // Apple Push Service richiede un approccio completamente diverso
        if (isApplePush) {
          // Apple richiede un payload specifico e headers diversi
          const applePayload = {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              sound: 'default',
              'mutable-content': 1
            },
            data: notification.data
          };
          
          console.log('[PUSH] 🍎 Apple payload:', JSON.stringify(applePayload, null, 2));
          
          // Apple Push Service usa formato diverso - NO JWT/VAPID
          pushResponse = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apns-priority': '10',
              'apns-topic': 'lovable.apps.2716f91b957c47ba91e06f572f3ce00d'
            },
            body: JSON.stringify(applePayload)
          });
        } else {
          // Per FCM e altri provider, usiamo VAPID
          pushResponse = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await generateVapidToken(subscription.endpoint)}`,
              'TTL': '60'
            },
            body: JSON.stringify(notification)
          });
        }

        console.log(`[PUSH] ✅ Response Status: ${pushResponse.status}`);
        
        if (pushResponse.ok || pushResponse.status === 204) {
          sent++;
          results.push({
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            success: true,
            status: pushResponse.status
          });
        } else {
          failed++;
          const errorText = await pushResponse.text();
          console.error(`[PUSH] ❌ Push failed with status ${pushResponse.status}: ${errorText}`);
          results.push({
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            success: false,
            status: pushResponse.status,
            error: errorText
          });
        }

      } catch (error) {
        console.error(`[PUSH] ❌ Failed to send to ${subscription.endpoint.substring(0, 50)}...`, error);
        failed++;
        
        results.push({
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          success: false,
          error: error.message
        });
      }
    }

// Helper function per generare VAPID token per Apple Push Service
async function generateVapidToken(audience: string) {
  try {
    console.log('[PUSH] 🔐 Generating Apple-compatible JWT token for:', audience);
    
    // Per Apple Push Service, il token deve avere un formato specifico
    const header = {
      alg: 'ES256',
      typ: 'JWT'
    };
    
    // Apple richiede audience come origin dell'endpoint
    const audienceUrl = new URL(audience);
    const payload = {
      iss: 'app.lovable.2716f91b957c47ba91e06f572f3ce00d', // Bundle ID
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 ora
      aud: audienceUrl.origin,
      sub: 'mailto:support@m1ssion.eu'
    };
    
    console.log('[PUSH] 📋 JWT header:', header);
    console.log('[PUSH] 📋 JWT payload:', payload);
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    
    console.log('[PUSH] 📝 Unsigned token created');
    
    // Per ora creiamo un token semplice con firma mock per test
    // In produzione serve una chiave privata ECDSA P-256 valida
    const mockSignature = base64UrlEncode('mock-signature-for-testing');
    const finalToken = `${unsignedToken}.${mockSignature}`;
    
    console.log('[PUSH] 🎯 Final JWT token generated (mock)');
    return finalToken;
    
  } catch (error) {
    console.error('[PUSH] ❌ Error generating VAPID token:', error);
    
    // Fallback semplice
    return 'mock-jwt-token-for-testing';
  }
}

// Helper functions per base64url encoding/decoding
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

function base64UrlDecode(str: string): Uint8Array {
  // Aggiungi padding se necessario
  str += '='.repeat((4 - str.length % 4) % 4);
  // Sostituisci caratteri URL-safe
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

    const finalResult = {
      ok: sent > 0,
      sent,
      failed,
      total: subscriptions.length,
      results,
      vapid_used: {
        public_key: VAPID_PUBLIC_KEY,
        private_key_length: VAPID_PRIVATE_KEY.length
      },
      timestamp: new Date().toISOString()
    };

    console.log('[PUSH] 📊 Final result:', JSON.stringify(finalResult, null, 2));

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[PUSH] ❌ Fatal error:', error);
    
    return new Response(JSON.stringify({
      ok: false,
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});