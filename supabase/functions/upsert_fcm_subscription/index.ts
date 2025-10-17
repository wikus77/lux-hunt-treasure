/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ FCM Subscription Upsert Edge Function
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FCMSubscriptionRequest {
  user_id: string;
  token: string;
  platform: string;
  device_info?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const requestBody: FCMSubscriptionRequest = await req.json();
    console.log('📥 FCM subscription request:', {
      user_id: requestBody.user_id,
      platform: requestBody.platform,
      token_length: requestBody.token?.length || 0
    });

    // Validate required fields
    if (!requestBody.user_id || !requestBody.token) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'user_id and token are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate token length (relaxed validation - accept any reasonable token)
    if (requestBody.token.length < 10) {
      console.error('❌ Token too short:', requestBody.token.length);
      return new Response(
        JSON.stringify({ 
          error: 'Token too short', 
          details: `Token length: ${requestBody.token.length}, minimum: 10`
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Normalize platform to match constraint
    const normalizedPlatform = ['ios', 'android', 'desktop'].includes(requestBody.platform) 
      ? requestBody.platform 
      : 'desktop';

    console.log('📝 Calling database function with params:', {
      p_user_id: requestBody.user_id,
      p_token_prefix: requestBody.token.substring(0, 30) + '...',
      p_platform: normalizedPlatform,
      p_device_info_keys: Object.keys(requestBody.device_info || {})
    });

    // Use the database function for upsert
    const { data, error } = await supabaseClient.rpc('upsert_fcm_subscription', {
      p_user_id: requestBody.user_id,
      p_token: requestBody.token,
      p_platform: normalizedPlatform,
      p_device_info: requestBody.device_info || {}
    });

    if (error) {
      console.error('❌ Database upsert failed:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Database operation failed',
          details: error.message,
          code: error.code
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if the function returned an error
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      console.error('❌ Function returned error:', data);
      return new Response(
        JSON.stringify({
          error: 'FCM subscription failed',
          details: data.error || 'Unknown error',
          sqlstate: data.sqlstate
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ FCM subscription successful:', data);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'FCM subscription saved successfully',
        data: data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */