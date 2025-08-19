// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, message, data } = await req.json();
    
    if (!user_id || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY')!;
    const oneSignalAppId = "50cb75f7-f065-4626-9a63-ce5692fa7e70";

    console.log(`🔔 M1QR-PUSH: Starting push for user ${user_id}`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OneSignal token for this user
    const { data: deviceTokens, error: tokenError } = await supabase
      .from('device_tokens')
      .select('token')
      .eq('user_id', user_id)
      .eq('device_type', 'onesignal')
      .order('last_used', { ascending: false })
      .limit(1);

    if (tokenError || !deviceTokens || deviceTokens.length === 0) {
      console.error(`🔔 M1QR-PUSH: No OneSignal token found for user ${user_id}:`, tokenError);
      return new Response(
        JSON.stringify({ error: 'No OneSignal token found for user', user_id }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const playerId = deviceTokens[0].token;
    console.log(`🔔 M1QR-PUSH: Found OneSignal token: ${playerId}`);

    // Send OneSignal notification
    const oneSignalPayload = {
      app_id: oneSignalAppId,
      include_external_user_ids: [user_id],
      headings: { en: title, it: title },
      contents: { en: message, it: message },
      data: data || {},
      android_channel_id: "d9ad4ee7-1db8-459b-8db2-02cc0f5f2b83",
      ios_sound: "notification.wav",
      android_sound: "notification",
      web_icon: "/icon-192x192.png",
      chrome_web_icon: "/icon-192x192.png",
      firefox_icon: "/icon-192x192.png"
    };

    console.log(`🔔 M1QR-PUSH: Sending to OneSignal:`, oneSignalPayload);

    const oneSignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${oneSignalApiKey}`,
      },
      body: JSON.stringify(oneSignalPayload),
    });

    const oneSignalResult = await oneSignalResponse.json();
    console.log(`🔔 M1QR-PUSH: OneSignal response:`, oneSignalResult);

    if (!oneSignalResponse.ok) {
      console.error(`🔔 M1QR-PUSH: OneSignal error:`, oneSignalResult);
      return new Response(
        JSON.stringify({ 
          error: 'OneSignal push failed', 
          details: oneSignalResult,
          user_id 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user notification in database to mark as push sent
    const { error: updateError } = await supabase
      .from('user_notifications')
      .update({ 
        metadata: { 
          push_sent: true, 
          onesignal_id: oneSignalResult.id,
          timestamp: new Date().toISOString() 
        } 
      })
      .eq('user_id', user_id)
      .eq('title', title)
      .eq('message', message)
      .gte('created_at', new Date(Date.now() - 5000).toISOString()); // Last 5 seconds

    if (updateError) {
      console.error(`🔔 M1QR-PUSH: Failed to update notification:`, updateError);
    } else {
      console.log(`🔔 M1QR-PUSH: Updated notification metadata`);
    }

    console.log(`🔔 M1QR-PUSH: ✅ SUCCESS - Push sent to user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        onesignal_id: oneSignalResult.id,
        user_id,
        recipients: oneSignalResult.recipients 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('🔔 M1QR-PUSH: ❌ ERROR:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});