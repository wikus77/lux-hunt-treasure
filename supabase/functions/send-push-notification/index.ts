// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  userId?: string;
  deviceToken?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, deviceToken, title, body, data }: PushNotificationRequest = await req.json();

    console.log('📨 Push notification request:', { userId, deviceToken, title, body });

    let tokens: string[] = [];

    if (deviceToken) {
      // Use specific token if provided
      tokens = [deviceToken];
    } else if (userId) {
      // Get user's device tokens from database
      const { data: deviceTokens, error } = await supabase
        .from('device_tokens')
        .select('token')
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error fetching device tokens:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch device tokens' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      tokens = deviceTokens?.map(dt => dt.token) || [];
    } else {
      return new Response(
        JSON.stringify({ error: 'Either userId or deviceToken must be provided' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (tokens.length === 0) {
      console.log('⚠️ No device tokens found for user');
      return new Response(
        JSON.stringify({ message: 'No device tokens found' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Prepare Firebase Cloud Messaging payload
    const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY');
    
    if (!firebaseServerKey) {
      console.error('❌ Firebase Server Key not configured');
      return new Response(
        JSON.stringify({ error: 'Firebase Server Key not configured' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const results = [];

    // Send notification to each token
    for (const token of tokens) {
      try {
        const fcmPayload = {
          to: token,
          notification: {
            title,
            body,
            icon: '/assets/m1ssion/icon-192.png',
            badge: '/assets/m1ssion/icon-192.png',
            sound: 'default'
          },
          data: data || {},
          priority: 'high',
          content_available: true
        };

        console.log('🚀 Sending FCM request for token:', token.substring(0, 20) + '...');

        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${firebaseServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fcmPayload),
        });

        const fcmResult = await fcmResponse.json();
        
        console.log('📬 FCM Response:', fcmResult);

        results.push({
          token: token.substring(0, 20) + '...',
          success: fcmResponse.ok,
          result: fcmResult
        });

      } catch (error) {
        console.error('❌ Error sending to token:', token, error);
        results.push({
          token: token.substring(0, 20) + '...',
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Push notifications sent',
        results,
        totalTokens: tokens.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);