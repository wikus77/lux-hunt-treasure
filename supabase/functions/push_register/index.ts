/*
 * M1SSION™ Push Registration - Standard VAPID
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterRequest {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  user_agent?: string;
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
    console.log('📝 [PUSH-REGISTER] Processing subscription...');

    // Parse request body
    const body: RegisterRequest = await req.json();
    const { subscription, user_agent, device_info } = body;

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

    // Prepare subscription data for upsert
    const subscriptionData = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      keys: subscription.keys,
      user_agent: user_agent || null,
      device_info: {
        ...device_info,
        registered_at: new Date().toISOString()
      },
      updated_at: new Date().toISOString(),
    };

    // Upsert to push_subscriptions table (unique on endpoint)
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(subscriptionData, { onConflict: 'endpoint' })
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
      endpoint_type: data.endpoint_type,
      endpoint_preview: subscription.endpoint.substring(0, 50) + '...'
    });

    return Response.json(
      { 
        ok: true, 
        endpoint: subscription.endpoint,
        endpoint_type: data.endpoint_type,
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

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */