import webpush from 'https://esm.sh/web-push@3.6.7';

// CORS headers inline per evitare problemi di import
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

console.log('[PUSH] 🚀 M1SSION™ Push Send Function loaded');

// Configura web-push con le chiavi VAPID M1SSION™
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BMrCxTSkgHgNAynMRoieqvKPeEPq1L-dk7-hY4jyBSEt6Rwk9O7XfrR5VmQmLMOBWTycyONDk1oKGxhxuhcunkI';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || 'n-QJKN01k1r7ROmzc5Ukn_-MkCE1q7_-Uv-QrCEkgT0';

console.log('[PUSH] 🔑 VAPID Public Key:', VAPID_PUBLIC_KEY);
console.log('[PUSH] 🔑 VAPID Private Key length:', VAPID_PRIVATE_KEY.length);

// Configura la libreria web-push
webpush.setVapidDetails(
  'mailto:support@m1ssion.eu',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

console.log('[PUSH] ✅ Web-push configurato con successo');

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

    // Trova le subscription dal database
    let subscriptions = [];
    
    if (body.endpoint) {
      // Cerca una subscription specifica
      const { data } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('subscription->>endpoint', body.endpoint)
        .limit(1);
      
      if (data && data.length > 0) {
        subscriptions = [data[0].subscription];
      }
    } else {
      // Prendi tutte le subscription attive
      const { data } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (data) {
        subscriptions = data.map(row => row.subscription);
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

    // Invia le notifiche usando web-push
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        console.log(`[PUSH] 🚀 Sending to endpoint: ${subscription.endpoint.substring(0, 50)}...`);
        
        // Usa web-push per inviare la notifica
        const result = await webpush.sendNotification(
          subscription,
          JSON.stringify(notification),
          {
            TTL: 60 // 60 secondi TTL
          }
        );

        console.log(`[PUSH] ✅ Success! Status: ${result.statusCode}, Headers:`, result.headers);
        sent++;
        
        results.push({
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          success: true,
          status: result.statusCode,
          headers: result.headers
        });

      } catch (error) {
        console.error(`[PUSH] ❌ Failed to send to ${subscription.endpoint.substring(0, 50)}...`, error);
        failed++;
        
        results.push({
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          success: false,
          error: error.message,
          statusCode: error.statusCode || 500
        });
      }
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