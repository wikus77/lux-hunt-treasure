// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('🚀 M1SSION™ SIMPLIFIED PUSH START');
    
    // Parse request
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const { title, body, user_id, target_user_id } = requestBody;
    
    console.log('📩 PAYLOAD:', { title, body, user_id, target_user_id });

    // Get OneSignal config - SIMPLIFIED
    const ONESIGNAL_APP_ID = "50cb75f7-f065-4626-9a63-ce5692fa7e70";
    const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

    console.log('🔑 Config Check:', {
      appId: ONESIGNAL_APP_ID,
      hasApiKey: !!ONESIGNAL_API_KEY,
      apiKeyLength: ONESIGNAL_API_KEY?.length || 0,
      apiKeyPrefix: ONESIGNAL_API_KEY?.substring(0, 10) || 'MISSING'
    });

    if (!ONESIGNAL_API_KEY) {
      console.error('❌ MISSING API KEY');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OneSignal API Key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Simple OneSignal payload - BROADCAST to all users
    const payload = {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"],
      contents: { "en": body || "🔔 M1SSION™ Test Notification" },
      headings: { "en": title || "M1SSION™" }
    };

    console.log('📡 OneSignal Payload:', payload);

    // Make OneSignal API call
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    console.log('🔔 OneSignal Response:', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // Return result
    const finalResult = {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Notification sent successfully' : 'OneSignal API error',
      oneSignalId: result.id,
      recipients: result.recipients || 0,
      errors: result.errors || null,
      timestamp: new Date().toISOString()
    };

    console.log('📋 FINAL RESULT:', finalResult);

    return new Response(JSON.stringify(finalResult), {
      status: response.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    
    const errorResult = {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});