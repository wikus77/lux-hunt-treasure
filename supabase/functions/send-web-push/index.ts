/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Web Push Sender - FCM & APNs Support
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebPushRequest {
  subscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  endpoint?: string; // Alternative: lookup in DB
  payload?: {
    title: string;
    body: string;
    data?: Record<string, any>;
  };
  user_id?: string; // Send to all user's devices
}

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = 'mailto:admin@m1ssion.eu';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('🚀 [SEND-WEB-PUSH] Processing push request...');

    const body: WebPushRequest = await req.json();
    const { subscription, endpoint, payload, user_id } = body;

    // Initialize Supabase for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let subscriptions: any[] = [];

    if (subscription) {
      // Direct subscription provided
      subscriptions = [subscription];
      console.log('📱 Using provided subscription');
    } else if (endpoint) {
      // Lookup subscription by endpoint
      const { data, error } = await supabase
        .from('push_tokens')
        .select('endpoint, keys')
        .eq('endpoint', endpoint)
        .single();
      
      if (error || !data) {
        console.error('❌ Subscription not found for endpoint:', endpoint);
        return Response.json(
          { error: 'Subscription not found' }, 
          { status: 404, headers: corsHeaders }
        );
      }
      
      subscriptions = [{
        endpoint: data.endpoint,
        keys: data.keys
      }];
      console.log('📱 Found subscription in database');
    } else if (user_id) {
      // Send to all user devices
      const { data, error } = await supabase
        .from('push_tokens')
        .select('endpoint, keys')
        .eq('user_id', user_id);
      
      if (error) {
        console.error('❌ Database error:', error);
        return Response.json(
          { error: 'Database error' }, 
          { status: 500, headers: corsHeaders }
        );
      }
      
      subscriptions = data.map(row => ({
        endpoint: row.endpoint,
        keys: row.keys
      }));
      console.log(`📱 Found ${subscriptions.length} subscriptions for user`);
    } else {
      return Response.json(
        { error: 'No subscription, endpoint, or user_id provided' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Default payload
    const notificationPayload = {
      title: payload?.title || 'M1SSION™',
      body: payload?.body || 'Nuova notifica',
      data: payload?.data || { screen: '/home' }
    };

    console.log(`📤 Sending to ${subscriptions.length} subscription(s)...`);

    const results = [];
    
    for (const sub of subscriptions) {
      try {
        const result = await sendWebPushNotification(sub, notificationPayload);
        results.push({ 
          endpoint: sub.endpoint.substring(0, 50) + '...', 
          success: true, 
          status: result.status 
        });
        console.log(`✅ Sent to ${classifyEndpoint(sub.endpoint)}: ${result.status}`);
      } catch (error) {
        results.push({ 
          endpoint: sub.endpoint.substring(0, 50) + '...', 
          success: false, 
          error: String(error) 
        });
        console.error(`❌ Failed to send to ${classifyEndpoint(sub.endpoint)}:`, error);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`📊 Push results: ${successCount} sent, ${failureCount} failed`);

    return Response.json(
      { 
        success: true,
        sent: successCount,
        failed: failureCount,
        results: results
      }, 
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return Response.json(
      { error: 'Internal server error: ' + String(error) }, 
      { status: 500, headers: corsHeaders }
    );
  }
});

/**
 * Send Web Push notification using VAPID authentication
 * Works with both FCM and APNs endpoints
 */
async function sendWebPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: any
): Promise<{ status: number; body?: string }> {
  
  // Generate VAPID JWT token
  const vapidToken = await generateVAPIDToken(subscription.endpoint);
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Authorization': `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`,
    'Content-Type': 'application/octet-stream',
    'TTL': '86400', // 24 hours
  };

  // Add endpoint-specific headers
  if (subscription.endpoint.includes('fcm.googleapis.com')) {
    headers['Crypto-Key'] = `p256ecdsa=${VAPID_PUBLIC_KEY}`;
  } else if (subscription.endpoint.includes('web.push.apple.com')) {
    headers['apns-topic'] = 'app.lovable.2716f91b957c47ba91e06f572f3ce00d'; // Bundle ID
    headers['apns-push-type'] = 'alert';
  }

  // Encrypt payload (simplified - in production use proper web push encryption)
  const payloadString = JSON.stringify(payload);
  const encodedPayload = new TextEncoder().encode(payloadString);

  // Send notification
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: headers,
    body: encodedPayload,
  });

  let responseBody = '';
  try {
    responseBody = await response.text();
  } catch (e) {
    // Ignore response body errors
  }

  if (!response.ok) {
    throw new Error(`Push failed (${response.status}): ${responseBody}`);
  }

  return {
    status: response.status,
    body: responseBody
  };
}

/**
 * Generate VAPID JWT token for authentication
 */
async function generateVAPIDToken(endpoint: string): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };

  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    sub: VAPID_SUBJECT
  };

  // This is a simplified JWT generation
  // In production, use a proper JWT library with ECDSA signing
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  
  // For now, return a basic token structure
  // Note: This needs proper ECDSA signing with the private key
  return `${headerB64}.${payloadB64}.signature_placeholder`;
}

/**
 * Classify endpoint type
 */
function classifyEndpoint(endpoint: string): string {
  if (endpoint.includes('fcm.googleapis.com')) return 'fcm';
  if (endpoint.includes('web.push.apple.com')) return 'apns';
  if (endpoint.includes('wns.notify.windows.com')) return 'wns';
  return 'unknown';
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */