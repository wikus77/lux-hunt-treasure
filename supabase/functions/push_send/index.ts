// CORS headers inline per evitare problemi di import
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

console.log('[PUSH] 🚀 M1SSION™ Push Send Function loaded');

// Configura le chiavi VAPID M1SSION™ per FCM/browser push (NON per Apple)
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BCboRJTDYR4W2lbR4_BLoSJUkbORYxmqyBi0oDZvbMUbwU-dq4U-tOkMLlpTSL9OYDAgQDmcswZ0eY8wRK5BV_U';
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
    } else if (body.user_id) {
      // CRITICO: Cerca per user_id invece di endpoint
      console.log('[PUSH] 🔍 Searching subscriptions for user_id:', body.user_id);
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', body.user_id)  // Cerca per USER_ID
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('[PUSH] ❌ Database error:', error);
      } else if (data && data.length > 0) {
        subscriptions = data.map(sub => ({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }));
        console.log(`[PUSH] 📋 Found ${subscriptions.length} subscriptions for user`);
      }
    } else {
      // Fallback: prendi tutte le subscription attive (per admin)
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .order('created_at', { ascending: false })
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
        console.log(`[PUSH] 📋 Found ${subscriptions.length} subscriptions (admin mode)`);
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

    // Invia notifiche
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
        
        // Apple Push Service - Per iOS Safari 16.4+ usa Web Push standard
        if (isApplePush) {
          console.log('[PUSH] 🍎 iOS Safari Web Push - using standard Web Push API');
          
          // iOS Safari 16.4+ supporta Web Push standard senza VAPID custom
          pushResponse = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'TTL': '2419200' // 4 settimane per iOS
            },
            body: JSON.stringify(notification)
          });
          
          console.log('[PUSH] 🍎 iOS response status:', pushResponse.status);
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

    // Risultato finale
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

// Helper function per generare VAPID token per FCM
async function generateVapidToken(audience: string) {
  try {
    console.log('[PUSH] 🔐 Generating VAPID token for FCM:', audience);
    
    const header = {
      alg: 'ES256',
      typ: 'JWT'
    };
    
    const audienceUrl = new URL(audience);
    const payload = {
      aud: audienceUrl.origin,
      exp: Math.floor(Date.now() / 1000) + 3600,
      sub: 'mailto:support@m1ssion.eu'
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    
    // Per ora creiamo un token mock per test
    const mockSignature = base64UrlEncode('fcm-vapid-signature');
    const finalToken = `${unsignedToken}.${mockSignature}`;
    
    console.log('[PUSH] 🎯 VAPID token generated for FCM');
    return finalToken;
    
  } catch (error) {
    console.error('[PUSH] ❌ Error generating VAPID token:', error);
    return 'mock-vapid-token';
  }
}

// Helper functions per base64url encoding
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