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
        
        // Invio diretto ad Apple Push Service
        const pushResponse = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `vapid t=${await generateVapidToken(subscription.endpoint)}, k=${VAPID_PUBLIC_KEY}`,
            'TTL': '60'
          },
          body: JSON.stringify(notification)
        });

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

// Helper function per generare VAPID token con firma ECDSA corretta
async function generateVapidToken(audience: string) {
  try {
    console.log('[PUSH] 🔐 Generating VAPID token for audience:', audience);
    
    // Crea direttamente la chiave privata da raw bytes
    const privateKeyBytes = base64UrlDecode(VAPID_PRIVATE_KEY);
    console.log('[PUSH] 🔑 Private key bytes length:', privateKeyBytes.length);
    
    // Importa chiave privata come raw format per P-256
    const privateKey = await crypto.subtle.importKey(
      'raw',
      privateKeyBytes,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      false,
      ['sign']
    );
    
    console.log('[PUSH] ✅ Private key imported successfully');
    
    const header = {
      typ: 'JWT',
      alg: 'ES256'
    };
    
    const payload = {
      aud: new URL(audience).origin,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 ore
      sub: 'mailto:support@m1ssion.eu'
    };
    
    console.log('[PUSH] 📋 JWT payload:', payload);
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    console.log('[PUSH] 📝 Unsigned token created, length:', unsignedToken.length);
    
    // Firma il token con ECDSA
    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      privateKey,
      new TextEncoder().encode(unsignedToken)
    );
    
    console.log('[PUSH] ✍️ Token signed, signature length:', signature.byteLength);
    
    const encodedSignature = base64UrlEncode(new Uint8Array(signature));
    const finalToken = `${unsignedToken}.${encodedSignature}`;
    
    console.log('[PUSH] 🎯 Final JWT token generated, length:', finalToken.length);
    return finalToken;
    
  } catch (error) {
    console.error('[PUSH] ❌ Error generating VAPID token:', error);
    
    // Fallback: usa un token semplice se la firma ECDSA fallisce
    console.log('[PUSH] 🔄 Using fallback simple token...');
    const header = { typ: 'JWT', alg: 'ES256' };
    const payload = {
      aud: new URL(audience).origin,
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
      sub: 'mailto:support@m1ssion.eu'
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    return `${encodedHeader}.${encodedPayload}.fake-signature`;
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