import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogEntry {
  id: string;
  timestamp: string;
  event_message: string;
  function_id: string;
  level: string;
  metadata?: any;
}

interface ParsedNotification {
  execution_id: string;
  timestamp: string;
  sent_by: string | null;
  provider: string | null;
  status_code: number | null;
  title: string | null;
  body: string | null;
  url: string | null;
  endpoint: string | null;
  project_ref: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify admin access
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response('Forbidden - Admin access required', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    const url = new URL(req.url);
    const sinceParam = url.searchParams.get('since');
    
    // Get last sync timestamp or default to 24h ago
    let sinceTimestamp: string;
    
    if (sinceParam) {
      sinceTimestamp = sinceParam;
    } else {
      const { data: watermark } = await supabase
        .from('mirror_push.sync_watermarks')
        .select('last_sync_timestamp')
        .eq('source_name', 'webpush-admin-broadcast')
        .single();
      
      if (watermark?.last_sync_timestamp) {
        sinceTimestamp = watermark.last_sync_timestamp;
      } else {
        // Default to 24h ago
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);
        sinceTimestamp = yesterday.toISOString();
      }
    }

    console.log(`🔍 [HARVESTER] Starting harvest since: ${sinceTimestamp}`);

    const notifications: ParsedNotification[] = [];
    const processedExecutions = new Set<string>();

    // 1. Query edge function logs for webpush-admin-broadcast using analytics query
    try {
      const { data: edgeLogs, error: logsError } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT id, function_edge_logs.timestamp, event_message, 
                   response.status_code, request.method, m.function_id, 
                   m.execution_time_ms, m.deployment_id, m.version
            FROM function_edge_logs
            CROSS JOIN unnest(metadata) as m
            CROSS JOIN unnest(m.response) as response
            CROSS JOIN unnest(m.request) as request
            WHERE event_message LIKE '%webpush-admin-broadcast%'
            AND function_edge_logs.timestamp >= '${sinceTimestamp}'
            ORDER BY function_edge_logs.timestamp DESC
            LIMIT 500
          `
        });

      if (!logsError && edgeLogs) {
        console.log(`📊 [HARVESTER] Found ${edgeLogs.length} edge function logs`);
        
        for (const log of edgeLogs) {
          const executionId = log.deployment_id || log.id;
          if (processedExecutions.has(executionId)) continue;
          processedExecutions.add(executionId);

          // Extract basic metadata from edge function logs
          let title = null, body = null, url = null, endpoint = null;
          let sentBy = null, provider = null;

          // Try to parse event_message for notification details
          if (log.event_message) {
            try {
              const jsonMatch = log.event_message.match(/\{.*\}/s);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                title = parsed.title || parsed.notification?.title;
                body = parsed.body || parsed.notification?.body; 
                url = parsed.url || parsed.notification?.url;
              }
            } catch (e) {
              // Extract from text patterns
              const titleMatch = log.event_message.match(/title[:\s]*["']([^"']+)["']/i);
              const bodyMatch = log.event_message.match(/body[:\s]*["']([^"']+)["']/i);
              if (titleMatch) title = titleMatch[1];
              if (bodyMatch) body = bodyMatch[1];
            }
          }

          notifications.push({
            execution_id: executionId,
            timestamp: log.timestamp,
            sent_by: sentBy, // Not available in edge logs
            provider: provider,
            status_code: log.status_code,
            title: title,
            body: body,
            url: url,
            endpoint: endpoint,
            project_ref: 'vkjrqirvdvjbemsfzxof'
          });
        }
      }
    } catch (error) {
      console.error('❌ [HARVESTER] Error fetching edge logs:', error);
    }

    // 2. Query public.push_notification_logs table
    try {
      const { data: pushLogs, error: pushLogsError } = await supabase
        .from('push_notification_logs')
        .select('*')
        .gte('created_at', sinceTimestamp)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!pushLogsError && pushLogs) {
        console.log(`📊 [HARVESTER] Found ${pushLogs.length} push notification logs`);
        
        for (const log of pushLogs) {
          const executionId = `push_log_${log.id}`;
          if (processedExecutions.has(executionId)) continue;
          processedExecutions.add(executionId);

          // Determine provider from endpoint
          let provider = null;
          if (log.endpoint) {
            if (log.endpoint.includes('fcm.googleapis.com')) provider = 'fcm';
            else if (log.endpoint.includes('web.push.apple.com')) provider = 'apns';
            else if (log.endpoint.includes('push.mozilla.org')) provider = 'mozilla';
          }

          notifications.push({
            execution_id: executionId,
            timestamp: log.created_at,
            sent_by: log.user_id, // Use user_id as sent_by
            provider: provider,
            status_code: log.success ? 200 : 500,
            title: log.title,
            body: log.body,
            url: log.url,
            endpoint: log.endpoint ? (log.endpoint.length > 100 ? log.endpoint.substring(0, 100) + '...' : log.endpoint) : null,
            project_ref: 'vkjrqirvdvjbemsfzxof'
          });
        }
      }
    } catch (error) {
      console.error('❌ [HARVESTER] Error fetching push logs:', error);
    }

    // 3. Query public.user_notifications table
    try {
      const { data: userNotifications, error: userNotificationsError } = await supabase
        .from('user_notifications')
        .select('*')
        .gte('created_at', sinceTimestamp)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!userNotificationsError && userNotifications) {
        console.log(`📊 [HARVESTER] Found ${userNotifications.length} user notifications`);
        
        for (const notification of userNotifications) {
          const executionId = `user_notif_${notification.id}`;
          if (processedExecutions.has(executionId)) continue;
          processedExecutions.add(executionId);

          notifications.push({
            execution_id: executionId,
            timestamp: notification.created_at,
            sent_by: notification.created_by || null,
            provider: null, // Not available in user_notifications
            status_code: null, // Not available
            title: notification.title,
            body: notification.message,
            url: notification.action_url,
            endpoint: null,
            project_ref: 'vkjrqirvdvjbemsfzxof'
          });
        }
      }
    } catch (error) {
      console.error('❌ [HARVESTER] Error fetching user notifications:', error);
    }

    console.log(`🔄 [HARVESTER] Parsed ${notifications.length} notification records`);

    // Insert notifications (avoiding duplicates)
    let insertedCount = 0;
    for (const notification of notifications) {
      const { error: insertError } = await supabase
        .from('mirror_push.notification_logs')
        .upsert(notification, {
          onConflict: 'execution_id,timestamp',
          ignoreDuplicates: true
        });

      if (!insertError) {
        insertedCount++;
      } else {
        console.error('❌ [HARVESTER] Insert error:', insertError);
      }
    }

    // Update sync watermark
    const latestTimestamp = notifications.length > 0 
      ? Math.max(...notifications.map(n => new Date(n.timestamp).getTime()))
      : new Date().getTime();

    await supabase
      .from('mirror_push.sync_watermarks')
      .upsert({
        source_name: 'webpush-admin-broadcast',
        last_sync_timestamp: new Date(latestTimestamp).toISOString()
      }, {
        onConflict: 'source_name'
      });

    console.log(`✅ [HARVESTER] Completed: ${insertedCount} new records inserted`);

    return new Response(JSON.stringify({
      success: true,
      processed: notifications.length,
      inserted: insertedCount,
      since: sinceTimestamp,
      latest_timestamp: new Date(latestTimestamp).toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ [HARVESTER] Fatal error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});