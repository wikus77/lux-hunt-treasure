// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Push notification request started');
    
    // 🔑 Controllo autorizzazione con Service Role Key  
    const authHeader = req.headers.get("authorization") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log('🔐 Auth check:', {
      hasAuthHeader: !!authHeader,
      hasServiceKey: !!serviceKey,
      authHeaderLength: authHeader.length
    });

    if (!authHeader.includes(serviceKey)) {
      console.error('❌ Authorization failed');
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders
      });
    }
    
    console.log('✅ Authorization successful');

    // 📩 Lettura payload JSON
    const requestBody = await req.json();
    const { user_id, title, body, target_user_id } = requestBody;
    
    console.log('📩 Request payload:', {
      user_id,
      title,
      body,
      target_user_id,
      fullPayload: requestBody
    });
    
    console.log(`📲 Sending OneSignal push notification: ${title} - ${body}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OneSignal config from environment
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID') || "50cb75f7-f065-4626-9a63-ce5692fa7e70";
    const oneSignalRestApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    console.log('🔑 OneSignal Config:', {
      appId: oneSignalAppId,
      hasRestApiKey: !!oneSignalRestApiKey,
      restApiKeyLength: oneSignalRestApiKey?.length || 0
    });

    if (!oneSignalRestApiKey) {
      console.error('❌ OneSignal REST API Key not configured');
      return new Response(JSON.stringify({ error: "OneSignal not configured" }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Get device tokens for OneSignal
    let deviceQuery = supabase
      .from('device_tokens')
      .select('token')
      .eq('device_type', 'onesignal');

    // Filter by specific user if provided
    if (target_user_id) {
      deviceQuery = deviceQuery.eq('user_id', target_user_id);
    }

    const { data: devices, error: deviceError } = await deviceQuery;

    if (deviceError) {
      console.error('❌ Error fetching device tokens:', deviceError);
      return new Response(JSON.stringify({ error: deviceError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (!devices || devices.length === 0) {
      console.log('⚠️ No OneSignal device tokens found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No devices to send to",
        sent: 0,
        total: 0 
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // Extract player IDs
    const playerIds = devices.map(device => device.token);
    console.log(`📱 Found ${playerIds.length} OneSignal player IDs`);

    // Send OneSignal notification with enhanced logging
    const oneSignalPayload = {
      app_id: oneSignalAppId,
      include_player_ids: playerIds,
      contents: { "en": body || "Nuova notifica M1SSION™" },
      headings: { "en": title || "M1SSION™" },
      data: {
        url: "/notifications",
        mission: "true"
      }
    };

    console.log('🔔 Sending to OneSignal API...');
    console.log('📤 OneSignal payload:', JSON.stringify(oneSignalPayload, null, 2));
    
    let oneSignalResponse;
    let oneSignalResult;
    
    try {
      oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${oneSignalRestApiKey}`
        },
        body: JSON.stringify(oneSignalPayload)
      });

      console.log('📡 OneSignal HTTP status:', oneSignalResponse.status);
      oneSignalResult = await oneSignalResponse.json();
      console.log('🔔 OneSignal response:', oneSignalResult);
    } catch (fetchError) {
      console.error('❌ OneSignal fetch error:', fetchError);
      throw new Error(`OneSignal request failed: ${fetchError.message}`);
    }
    
    // Check for OneSignal errors
    if (!oneSignalResponse.ok) {
      console.error('❌ OneSignal API error:', oneSignalResponse.status, oneSignalResult);
      return new Response(JSON.stringify({ 
        error: `OneSignal API error: ${oneSignalResponse.status}`,
        details: oneSignalResult 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Save notification to database
    if (target_user_id) {
      const { error: notifError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: target_user_id,
          title: title || "M1SSION™",
          message: body || "Nuova notifica",
          notification_type: "push",
          metadata: { oneSignalId: oneSignalResult.id }
        });

      if (notifError) {
        console.error('❌ Error saving notification:', notifError);
      }
    }

    // 🟢 Risposta OK
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "OneSignal notification sent",
        sent: oneSignalResult.recipients || 0,
        total: playerIds.length,
        oneSignalId: oneSignalResult.id
      }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('❌ Error sending OneSignal notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
});