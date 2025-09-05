// supabase/functions/webpush-upsert/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const { user_id, subscription } = await req.json();

    if (!user_id || !subscription) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing user_id or subscription' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (subscription.kind === 'WEBPUSH') {
      // Store in fcm_subscriptions table with special format for Web Push
      const { error } = await supabase.rpc('upsert_fcm_subscription', {
        p_user_id: user_id,
        p_token: subscription.endpoint, // Store endpoint as token
        p_platform: subscription.platform,
        p_device_info: {
          type: 'webpush',
          keys: subscription.keys,
          platform: subscription.platform
        }
      });

      if (error) {
        console.error('❌ [WEBPUSH-UPSERT] Database error:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ [WEBPUSH-UPSERT] Web Push subscription saved');
      return new Response(JSON.stringify({ 
        success: true,
        type: 'webpush'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid subscription type' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [WEBPUSH-UPSERT] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});