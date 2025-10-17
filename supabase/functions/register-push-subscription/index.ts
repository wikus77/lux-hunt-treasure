/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Subscription Registration
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionRequest {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  device_info?: Record<string, any>;
}

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
    console.log('🔔 [REGISTER-PUSH-SUBSCRIPTION] Processing subscription...');

    // Parse request body
    const body: SubscriptionRequest = await req.json();
    const { subscription, device_info } = body;

    // Validate subscription data
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      console.error('❌ Invalid subscription data:', subscription);
      return Response.json(
        { error: 'Invalid subscription data' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client with user auth
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Authentication failed:', userError);
      return Response.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    // Classify endpoint type
    const endpointType = classifyEndpoint(subscription.endpoint);
    console.log(`🎯 Endpoint type: ${endpointType} (${subscription.endpoint.substring(0, 50)}...)`);

    // Prepare row data
    const tokenData = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      device_info: {
        ...device_info,
        endpoint_type: endpointType,
        registered_at: new Date().toISOString()
      },
      updated_at: new Date().toISOString(),
    };

    // Upsert to push_tokens table (unique on endpoint)
    const { data, error } = await supabase
      .from('push_tokens')
      .upsert(tokenData, { onConflict: 'endpoint' })
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return Response.json(
        { error: 'Database error: ' + error.message }, 
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('✅ Subscription registered successfully:', {
      user_id: user.id,
      endpoint_type: endpointType,
      endpoint_preview: subscription.endpoint.substring(0, 50) + '...'
    });

    return Response.json(
      { 
        success: true, 
        endpoint_type: endpointType,
        registered_at: new Date().toISOString()
      }, 
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
});

/**
 * Classify push endpoint type for proper handling
 */
function classifyEndpoint(endpoint: string): string {
  if (endpoint.includes('fcm.googleapis.com')) {
    return 'fcm'; // Desktop Chrome, Android
  }
  if (endpoint.includes('web.push.apple.com')) {
    return 'apns'; // iOS Safari PWA
  }
  if (endpoint.includes('wns.notify.windows.com')) {
    return 'wns'; // Windows Edge
  }
  return 'unknown';
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */