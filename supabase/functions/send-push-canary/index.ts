// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Send Push Canary - Production VAPID with Correct Headers */

import { generateVapidJWT } from '../_shared/vapid.ts';
import { buildPushHeaders, detectEndpointType } from '../_shared/pushHeaders.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://m1ssion.eu',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin'
};

interface SendPushRequest {
  user_id?: string;
  endpoint?: string;
  title: string;
  body: string;
  link?: string;
  broadcast?: boolean;
}

interface PushResult {
  endpoint_host: string;
  endpoint_type: string;
  status?: string;
  status_code?: number;
  error?: string;
}

Deno.serve(async (req) => {
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

    const body: SendPushRequest = await req.json();
    console.log('🚀 Push canary request:', { 
      user_id: body.user_id, 
      title: body.title, 
      broadcast: body.broadcast 
    });

    // Get VAPID keys and subject
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:wikus77@hotmail.it';

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('VAPID keys not configured in environment');
    }

    console.log('🔑 VAPID configuration:', {
      publicKeyLength: VAPID_PUBLIC_KEY.length,
      privateKeyLength: VAPID_PRIVATE_KEY.length,
      subject: VAPID_SUBJECT
    });

    // Fetch subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    
    if (body.endpoint) {
      query = query.eq('endpoint', body.endpoint);
    } else if (body.user_id && !body.broadcast) {
      query = query.eq('user_id', body.user_id);
    }
    // If broadcast=true, no filter (all subscriptions)

    const { data: subscriptions, error: fetchError } = await query.limit(20);
    
    if (fetchError) {
      throw fetchError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({
        sent: 0,
        failed: 0,
        total_processed: 0,
        results: [],
        message: 'No subscriptions found'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Found ${subscriptions.length} subscriptions to process`);

    // Prepare notification payload
    const notification = {
      title: body.title,
      body: body.body,
      link: body.link || 'https://m1ssion.eu/',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      timestamp: Date.now()
    };

    const results: PushResult[] = [];
    const toDelete: string[] = [];
    let sent = 0;
    let failed = 0;

    // Process each subscription
    for (const sub of subscriptions) {
      try {
        const endpointURL = new URL(sub.endpoint);
        const endpoint_type = detectEndpointType(sub.endpoint);
        const endpoint_host = endpointURL.hostname;
        
        console.log(`🎯 Processing ${endpoint_type} endpoint: ${endpoint_host}`);

        // Generate VAPID JWT with correct audience
        const aud = endpointURL.origin;
        const jwt = await generateVapidJWT(aud, VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
        
        // Build headers for this endpoint type
        const headers = buildPushHeaders(endpointURL, jwt, VAPID_PUBLIC_KEY);
        
        console.log(`🔐 Headers for ${endpoint_type}:`, {
          authorization: headers.authorization?.substring(0, 25) + '...' || '(not set)',
          'crypto-key': headers['Crypto-Key']?.substring(0, 35) + '...' || '(not set)',
          aud
        });

        // Send push notification
        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(notification)
        });

        if (response.ok || response.status === 204) {
          sent++;
          results.push({
            endpoint_host,
            endpoint_type,
            status: 'success',
            status_code: response.status
          });
          console.log(`✅ ${endpoint_type} push sent successfully (${response.status})`);
        } else {
          // Handle expired subscriptions
          if (response.status === 404 || response.status === 410) {
            console.log(`🗑️ Marking expired subscription for deletion: ${endpoint_host}`);
            toDelete.push(sub.endpoint);
          }
          
          const errorText = await response.text().catch(() => 'No response body');
          failed++;
          results.push({
            endpoint_host,
            endpoint_type,
            status: 'failed',
            status_code: response.status,
            error: errorText
          });
          console.error(`❌ ${endpoint_type} push failed (${response.status}): ${errorText}`);
        }

      } catch (error) {
        failed++;
        const endpoint_host = new URL(sub.endpoint).hostname;
        const endpoint_type = detectEndpointType(sub.endpoint);
        
        results.push({
          endpoint_host,
          endpoint_type,
          status: 'error',
          error: error.message
        });
        console.error(`❌ ${endpoint_type} push error:`, error.message);
      }
    }

    // Clean up expired subscriptions
    if (toDelete.length > 0) {
      console.log(`🧹 Deleting ${toDelete.length} expired subscriptions`);
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', toDelete);
      
      if (deleteError) {
        console.error('❌ Error deleting expired subscriptions:', deleteError);
      } else {
        console.log('✅ Expired subscriptions cleaned up');
      }
    }

    // Return results
    const finalResult = {
      sent,
      failed,
      removed: toDelete.length,
      total_processed: subscriptions.length,
      results,
      vapid_keys_used: {
        public_key_length: VAPID_PUBLIC_KEY.length,
        private_key_length: VAPID_PRIVATE_KEY.length,
        subject: VAPID_SUBJECT
      },
      timestamp: new Date().toISOString()
    };

    console.log('📊 Canary results:', {
      sent,
      failed,
      removed: toDelete.length,
      passRate: ((sent / (sent + failed)) * 100).toFixed(1) + '%'
    });

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Send push canary error:', error);
    
    return new Response(JSON.stringify({
      sent: 0,
      failed: 1,
      total_processed: 0,
      results: [],
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});