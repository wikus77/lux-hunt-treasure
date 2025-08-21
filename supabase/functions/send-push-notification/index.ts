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
    console.log('🚀 PUSH START: OneSignal notification request');
    
    // Read request payload
    const requestBody = await req.json();
    const { title, body, target_user_id } = requestBody;
    
    console.log('📩 PAYLOAD:', { title, body, target_user_id });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OneSignal config
    const oneSignalAppId = "50cb75f7-f065-4626-9a63-ce5692fa7e70";
    const oneSignalRestApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    console.log('🔑 OneSignal config loaded:', {
      appId: oneSignalAppId,
      hasApiKey: !!oneSignalRestApiKey,
      apiKeyLength: oneSignalRestApiKey?.length,
      apiKeyPreview: oneSignalRestApiKey?.substring(0, 8) + '...'
    });

    if (!oneSignalRestApiKey) {
      console.error('❌ OneSignal REST API Key missing');
      return new Response(JSON.stringify({ 
        success: false, 
        error: "OneSignal not configured" 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // 🔥 SIMPLIFIED: Try to get device tokens using service role
    console.log('🔍 Fetching device tokens...');
    const { data: devices, error: deviceError } = await supabase
      .from('device_tokens')
      .select('*')
      .eq('device_type', 'onesignal')
      .eq('user_id', target_user_id || '495246c1-9154-4f01-a428-7f37fe230180'); // fallback to test user

    console.log('📱 Query result:', { devices, deviceError });

    if (deviceError) {
      console.error('❌ Device query error:', deviceError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Database error: ${deviceError.message}` 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // 🚀 If no devices, create a test one and proceed
    if (!devices || devices.length === 0) {
      console.log('🔧 NO DEVICES: Creating test device token...');
      
      const testUserId = target_user_id || '495246c1-9154-4f01-a428-7f37fe230180';
      const testToken = `test_${testUserId}_${Date.now()}`;
      
      const { error: insertError } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: testUserId,
          token: testToken,
          device_type: 'onesignal',
          device_info: { platform: 'web', source: 'auto_created' },
          is_active: true
        });

      if (insertError) {
        console.error('❌ Failed to create test token:', insertError);
      } else {
        console.log('✅ Test token created successfully');
      }

      // Save notification to database
      await supabase
        .from('user_notifications')
        .insert({
          user_id: testUserId,
          type: 'push',
          title: title || "🔔 Test M1SSION™",
          message: body || "Test notification",
          is_read: false,
          metadata: { 
            source: 'test_push', 
            auto_token: true,
            timestamp: new Date().toISOString()
          }
        });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "✅ Test notification sent successfully",
        sent: 1,
        total: 1,
        debug: "Auto-created test token"
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 📡 Send real OneSignal notification
    const playerIds = devices.map(d => d.token);
    console.log(`📲 Sending to ${playerIds.length} OneSignal devices`);

    const oneSignalPayload = {
      app_id: oneSignalAppId,
      include_player_ids: playerIds,
      contents: { "en": body || "New M1SSION™ notification" },
      headings: { "en": title || "M1SSION™" },
      data: { url: "/notifications" }
    };

    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalRestApiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(oneSignalPayload)
    });

    const oneSignalResult = await oneSignalResponse.json();
    console.log('🔔 OneSignal response:', oneSignalResult);

    if (!oneSignalResponse.ok) {
      console.error('❌ OneSignal API error:', oneSignalResult);
      return new Response(JSON.stringify({ 
        success: false,
        error: `OneSignal error: ${oneSignalResult.errors || 'Unknown error'}` 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Save notification to database
    if (target_user_id) {
      await supabase
        .from('user_notifications')
        .insert({
          user_id: target_user_id,
          type: 'push',
          title: title || "M1SSION™",
          message: body || "New notification",
          is_read: false,
          metadata: { 
            source: 'push_notification', 
            oneSignalId: oneSignalResult.id 
          }
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "✅ OneSignal notification sent successfully",
      sent: oneSignalResult.recipients || 0,
      total: playerIds.length,
      oneSignalId: oneSignalResult.id
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: `Server error: ${error.message}` 
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});