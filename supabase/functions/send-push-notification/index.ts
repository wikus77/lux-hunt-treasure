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
    console.log('🚀 M1SSION™ PUSH NOTIFICATION PIPELINE START');
    
    // Read request payload
    const requestBody = await req.json();
    const { title, body, user_id, target_user_id } = requestBody;
    
    console.log('📩 PAYLOAD RECEIVED:', { 
      title, 
      body, 
      user_id, 
      target_user_id,
      timestamp: new Date().toISOString()
    });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OneSignal config
    const oneSignalAppId = "50cb75f7-f065-4626-9a63-ce5692fa7e70";
    const oneSignalRestApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    console.log('🔑 M1SSION™ OneSignal Configuration:', {
      appId: oneSignalAppId,
      hasRestApiKey: !!oneSignalRestApiKey,
      keyFormat: oneSignalRestApiKey?.startsWith('os_v2_app_') ? 'VALID v2 FORMAT ✅' : 'INVALID FORMAT ❌',
      keyLength: oneSignalRestApiKey?.length || 0,
      keyPreview: oneSignalRestApiKey?.substring(0, 15) + '...'
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

    // 🔍 DEVICE TOKEN LOOKUP
    const targetUserId = user_id || target_user_id || '495246c1-9154-4f01-a428-7f37fe230180';
    console.log(`🔍 M1SSION™ Device Token Query for User: ${targetUserId}`);
    
    const { data: devices, error: deviceError } = await supabase
      .from('device_tokens')
      .select('*')
      .eq('device_type', 'onesignal')
      .eq('user_id', targetUserId);

    console.log('📱 M1SSION™ Device Query Result:', { 
      devicesFound: devices?.length || 0, 
      devices: devices?.map(d => ({ id: d.id, token: d.token.substring(0, 10) + '...', created: d.created_at })),
      error: deviceError 
    });

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

    // 🚀 M1SSION™ DEVICE TOKEN VALIDATION
    if (!devices || devices.length === 0) {
      console.log('🔧 M1SSION™ NO DEVICES FOUND - Testing OneSignal API with broadcast');
      
      // Test OneSignal API directly with broadcast to all subscribed users
      const broadcastPayload = {
        app_id: oneSignalAppId,
        included_segments: ["Subscribed Users"], // Broadcast to all
        contents: { "en": body || "🔔 M1SSION™ Test Notification" },
        headings: { "en": title || "M1SSION™ System Test" },
        data: { 
          url: "/notifications",
          source: "system_test",
          timestamp: new Date().toISOString()
        }
      };

      console.log('📡 M1SSION™ Broadcasting to all subscribed users:', broadcastPayload);

      const broadcastResponse = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${oneSignalRestApiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(broadcastPayload)
      });

      const broadcastResult = await broadcastResponse.json();
      console.log('📡 M1SSION™ Broadcast Result:', {
        status: broadcastResponse.status,
        result: broadcastResult,
        success: broadcastResponse.ok
      });

      // Save notification to database
      await supabase
        .from('user_notifications')
        .insert({
          user_id: targetUserId,
          type: 'push',
          title: title || "🔔 M1SSION™ System Test",
          message: body || "Test notification broadcast",
          is_read: false,
          metadata: { 
            source: 'broadcast_test', 
            oneSignalId: broadcastResult.id,
            recipients: broadcastResult.recipients || 0,
            timestamp: new Date().toISOString()
          }
        });

      return new Response(JSON.stringify({ 
        success: broadcastResponse.ok, 
        message: broadcastResponse.ok ? "✅ M1SSION™ Broadcast sent successfully" : "❌ OneSignal API Error",
        sent: broadcastResult.recipients || 0,
        total: broadcastResult.recipients || 0,
        oneSignalId: broadcastResult.id,
        debug: "Broadcast to all subscribed users",
        error: !broadcastResponse.ok ? broadcastResult : null
      }), {
        status: broadcastResponse.ok ? 200 : 500,
        headers: corsHeaders
      });
    }

    // 📡 M1SSION™ TARGETED NOTIFICATION
    const playerIds = devices.map(d => d.token);
    console.log(`📲 M1SSION™ Sending to ${playerIds.length} specific devices:`, {
      deviceTokens: playerIds.map(token => token.substring(0, 10) + '...')
    });

    const oneSignalPayload = {
      app_id: oneSignalAppId,
      include_player_ids: playerIds,
      contents: { "en": body || "🔔 New M1SSION™ notification" },
      headings: { "en": title || "M1SSION™" },
      data: { 
        url: "/notifications",
        source: "targeted_push",
        timestamp: new Date().toISOString()
      }
    };

    console.log('📡 M1SSION™ OneSignal API Request:', {
      url: 'https://onesignal.com/api/v1/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalRestApiKey?.substring(0, 15)}...`,
        'Accept': 'application/json'
      },
      payload: oneSignalPayload
    });

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
    console.log('🔔 M1SSION™ OneSignal API Response:', {
      status: oneSignalResponse.status,
      statusText: oneSignalResponse.statusText,
      result: oneSignalResult,
      success: oneSignalResponse.ok
    });

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

    // 💾 M1SSION™ DATABASE LOGGING
    await supabase
      .from('user_notifications')
      .insert({
        user_id: targetUserId,
        type: 'push',
        title: title || "M1SSION™",
        message: body || "New notification",
        is_read: false,
        metadata: { 
          source: 'targeted_push_notification', 
          oneSignalId: oneSignalResult.id,
          recipients: oneSignalResult.recipients || 0,
          playerIds: playerIds.length,
          timestamp: new Date().toISOString()
        }
      });

    // 📊 M1SSION™ FINAL RESULT
    const finalResult = {
      success: oneSignalResponse.ok, 
      message: oneSignalResponse.ok ? "✅ M1SSION™ Targeted notification sent successfully" : "❌ OneSignal API Error",
      sent: oneSignalResult.recipients || 0,
      total: playerIds.length,
      oneSignalId: oneSignalResult.id,
      status: oneSignalResponse.status,
      timestamp: new Date().toISOString(),
      error: !oneSignalResponse.ok ? oneSignalResult : null
    };

    console.log('📋 M1SSION™ FINAL CHECKPOINT RESULT:', finalResult);

    return new Response(JSON.stringify(finalResult), {
      status: oneSignalResponse.ok ? 200 : 500,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ M1SSION™ CRITICAL PIPELINE ERROR:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: `M1SSION™ Pipeline Error: ${error.message}`,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});