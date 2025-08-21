import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { title = "M1SSION™", body: message = "Test notification", user_id = "495246c1-9154-4f01-a428-7f37fe230180" } = body;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const oneSignalPayload = {
      app_id: "50cb75f7-f065-4626-9a63-ce5692fa7e70",
      included_segments: ["Subscribed Users"],
      contents: { "en": message },
      headings: { "en": title }
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Deno.env.get('ONESIGNAL_REST_API_KEY')}`,
      },
      body: JSON.stringify(oneSignalPayload)
    });

    const result = await response.json();

    // SEMPRE salva notifica nel database locale - INDIPENDENTEMENTE da OneSignal
    try {
      await supabase
        .from('user_notifications')
        .insert({
          user_id: user_id,
          type: 'push',
          title: title,
          message: message,
          is_read: false,
          metadata: { 
            source: 'push_test', 
            oneSignalId: result.id || null,
            recipients: result.recipients || 0,
            timestamp: new Date().toISOString()
          }
        });
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      result: result,
      saved_to_db: true
    }), {
      status: response.ok ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});