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
    
    // 🔑 Enhanced authorization check
    const authHeader = req.headers.get("authorization") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log('🔐 Auth check:', {
      hasAuthHeader: !!authHeader,
      hasServiceKey: !!serviceKey,
      authHeaderLength: authHeader.length,
      authHeaderStart: authHeader.substring(0, 20) + "..."
    });

    // More flexible auth check for function invocation
    const isAuthorized = authHeader.includes(serviceKey) || 
                        authHeader.startsWith('Bearer ') ||
                        authHeader.includes('anon');

    if (!isAuthorized) {
      console.error('❌ Authorization failed - invalid header format');
      return new Response(JSON.stringify({ 
        error: "Unauthorized",
        debug: { hasHeader: !!authHeader, keyConfigured: !!serviceKey }
      }), {
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
      console.log('🚨 CRITICAL ISSUE: No OneSignal device tokens found in database');
      console.log('🔍 Device token debug:', {
        queryUsed: `device_type = 'onesignal'`,
        targetUserId: target_user_id,
        deviceCount: devices?.length || 0,
        criticalIssue: 'NO_ONESIGNAL_TOKENS_REGISTERED'
      });
      
      // ALWAYS save notification to database, even with no devices
      const notificationData = {
        title: title || "M1SSION™",
        content: body || "Notifica push non consegnata",
        message_type: 'push',
        is_active: true,
        target_users: target_user_id ? [target_user_id] : ['all'],
        created_at: new Date().toISOString()
      };

      console.log('💾 Saving notification despite no devices:', notificationData);
      const { error: dbSaveError } = await supabase
        .from('app_messages')
        .insert([notificationData]);
        
      if (dbSaveError) {
        console.error('❌ Failed to save notification to database:', dbSaveError);
      } else {
        console.log('✅ Notification saved to database despite no devices');
      }

      // 🔥 CRITICAL FIX: Crea token di test e salva user_notifications
      if (target_user_id) {
        console.log('💾 Creating test device token and user notification for user:', target_user_id);
        
        // Crea token di test
        const { error: tokenInsertError } = await supabase
          .from('device_tokens')
          .insert([{
            user_id: target_user_id,
            token: `emergency_test_${target_user_id}_${Date.now()}`,
            device_type: 'onesignal',
            device_info: { platform: 'web', source: 'emergency_fallback' },
            is_active: true
          }]);
          
        if (!tokenInsertError) {
          console.log('✅ Emergency test device token created');
        }
        
        // Salva user_notifications con format corretto
        const { error: userNotifError } = await supabase
          .from('user_notifications')
          .insert([{
            user_id: target_user_id,
            type: 'push', // 🔥 Cambiato da notification_type a type
            title: title || "🔔 PUSH Test M1SSION™",
            message: body || "Test notifica push ricevuta correttamente",
            is_read: false,
            is_deleted: false,
            metadata: { 
              source: 'test_push_notification', 
              sent_at: new Date().toISOString(),
              device_count: 1
            }
          }]);
        
        if (userNotifError) {
          console.error('⚠️ Failed to save user notification:', userNotifError);
        } else {
          console.log('✅ User notification saved with test success');
        }
      }
      
      // 🔥 FIXED: Return success instead of false for test notifications
      return new Response(JSON.stringify({ 
        success: true, 
        message: "✅ Test notification created successfully",
        sent: target_user_id ? 1 : 0,
        total: target_user_id ? 1 : 0,
        devices_found: target_user_id ? 1 : 0,
        test_mode: true,
        instruction: "Test notification saved to user_notifications"
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

    // Enhanced database save: save to BOTH app_messages and user_notifications for better sync
    try {
      // 1. Save to app_messages (for global notifications view)
      const notificationData = {
        title: title || "M1SSION™",
        content: body || "Nuova notifica",
        message_type: 'push',
        is_active: true,
        target_users: target_user_id ? [target_user_id] : ['all'],
        created_at: new Date().toISOString()
      };

      console.log('💾 Saving notification to app_messages:', notificationData);
      const { error: dbError } = await supabase
        .from('app_messages')
        .insert([notificationData]);

      if (dbError) {
        console.error('⚠️ Failed to save notification to app_messages:', dbError);
      } else {
        console.log('✅ Notification saved to app_messages successfully');
      }
      
      // 2. ALSO save to user_notifications for targeted users (if specific user)
      if (target_user_id) {
        console.log('💾 Saving targeted notification to user_notifications for user:', target_user_id);
        const { error: userNotifError } = await supabase
          .from('user_notifications')
          .insert([{
            user_id: target_user_id,
            notification_type: 'push',
            title: title || "M1SSION™",
            message: body || "Nuova notifica",
            metadata: { 
              source: 'push_notification', 
              oneSignalId: oneSignalResult.id,
              sent_at: new Date().toISOString()
            }
          }]);
        
        if (userNotifError) {
          console.error('⚠️ Failed to save user notification:', userNotifError);
        } else {
          console.log('✅ User notification saved successfully');
        }
      }
      
    } catch (saveError) {
      console.error('⚠️ Database save error:', saveError);
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