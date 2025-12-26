// © 2025 Joseph MULÉ – M1SSION™ – PUSH DIAGNOSTIC
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const results: Record<string, any> = {};
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    results['timestamp'] = new Date().toISOString();

    // Check VAPID configuration
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidEmail = Deno.env.get('VAPID_EMAIL');
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');

    results['vapid_config'] = {
      public_key_set: !!vapidPublicKey,
      public_key_length: vapidPublicKey?.length || 0,
      private_key_set: !!vapidPrivateKey,
      private_key_length: vapidPrivateKey?.length || 0,
      email_set: !!vapidEmail,
      fcm_key_set: !!fcmServerKey,
    };

    // Check ALL push-related tables
    const pushTables = [
      'push_subscriptions',
      'fcm_subscriptions',
      'webpush_subscriptions',
    ];

    for (const tableName of pushTables) {
      try {
        const { data, count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(5);

        if (error) {
          results[tableName] = { error: error.message, exists: false };
        } else {
          results[tableName] = {
            exists: true,
            total_count: count || 0,
            sample_columns: data && data.length > 0 ? Object.keys(data[0]) : [],
            sample_data: data?.map((d: any) => ({
              id: d.id,
              user_id: d.user_id?.slice(-8),
              platform: d.platform,
              is_active: d.is_active,
              created_at: d.created_at,
            })),
          };
        }
      } catch (e: any) {
        results[tableName] = { error: e.message };
      }
    }

    // Try to invoke send-push to see what happens
    try {
      const { data: pushResult, error: pushError } = await supabase.functions.invoke('send-push', {
        body: {
          title: '🧪 Test Push',
          body: 'Diagnostica push notification',
          all_users: true,
        },
      });

      results['send_push_test'] = {
        success: !pushError,
        result: pushResult,
        error: pushError?.message,
      };
    } catch (e: any) {
      results['send_push_test'] = { error: e.message };
    }

    // Try push-broadcast
    try {
      const { data: broadcastResult, error: broadcastError } = await supabase.functions.invoke('push-broadcast', {
        body: {
          title: '🧪 Test Broadcast',
          body: 'Diagnostica push broadcast',
        },
      });

      results['push_broadcast_test'] = {
        success: !broadcastError,
        result: broadcastResult,
        error: broadcastError?.message,
      };
    } catch (e: any) {
      results['push_broadcast_test'] = { error: e.message };
    }

    return new Response(
      JSON.stringify({ success: true, diagnostic: results }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message, partial_results: results }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});




