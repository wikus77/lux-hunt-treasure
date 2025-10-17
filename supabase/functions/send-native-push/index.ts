import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  targetUserId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { title, body, data, targetUserId }: NotificationPayload = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'Title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query push tokens
    let query = supabaseClient
      .from('push_tokens')
      .select('*');

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    } else {
      // Send to current user only
      query = query.eq('user_id', user.id);
    }

    const { data: tokens, error: tokensError } = await query;

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No push tokens found',
          sent: 0 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    for (const tokenData of tokens) {
      try {
        let notificationSent = false;

        if (tokenData.platform === 'android' && tokenData.endpoint_type === 'fcm') {
          // Send FCM notification for Android
          notificationSent = await sendFCMNotification(tokenData.token, title, body, data);
        } else if (tokenData.platform === 'ios' && tokenData.endpoint_type === 'apns') {
          // Send APNs notification for iOS
          notificationSent = await sendAPNSNotification(tokenData.token, title, body, data);
        }

        if (notificationSent) {
          sentCount++;
          // Update last_used_at
          await supabaseClient
            .from('push_tokens')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', tokenData.id);
        } else {
          failedCount++;
        }

        results.push({
          platform: tokenData.platform,
          success: notificationSent
        });

      } catch (error) {
        console.error(`Error sending notification to ${tokenData.platform}:`, error);
        failedCount++;
        results.push({
          platform: tokenData.platform,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`🚀 Native push notifications sent: ${sentCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: tokens.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-native-push:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// FCM notification sender
async function sendFCMNotification(token: string, title: string, body: string, data?: Record<string, any>): Promise<boolean> {
  try {
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      console.error('FCM_SERVER_KEY not configured');
      return false;
    }

    const payload = {
      to: token,
      notification: {
        title,
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      },
      data: data || {}
    };

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${fcmServerKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('FCM send failed:', result);
      return false;
    }

    console.log('✅ FCM notification sent successfully');
    return true;

  } catch (error) {
    console.error('FCM send error:', error);
    return false;
  }
}

// APNs notification sender
async function sendAPNSNotification(token: string, title: string, body: string, data?: Record<string, any>): Promise<boolean> {
  try {
    // For now, we'll just log that APNs would be sent
    // In production, you'd implement APNs HTTP/2 API
    console.log('📱 APNs notification would be sent:', { token: token.substring(0, 20), title, body });
    
    // TODO: Implement actual APNs sending using JWT authentication
    // This requires:
    // - Apple Developer Team ID
    // - APNs Key ID  
    // - APNs Private Key (p8 file)
    // - Bundle ID
    
    return true;

  } catch (error) {
    console.error('APNs send error:', error);
    return false;
  }
}