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

    // Query edge function logs for webpush-admin-broadcast
    const { data: logs, error: logsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT id, function_edge_logs.timestamp, event_message, metadata, 
                 m.function_id, m.execution_time_ms, m.deployment_id, m.version
          FROM function_edge_logs
          CROSS JOIN unnest(metadata) as m
          WHERE m.function_id IN (
            SELECT function_id FROM function_edge_logs 
            CROSS JOIN unnest(metadata) as meta 
            WHERE event_message LIKE '%webpush-admin-broadcast%' 
            OR meta.function_name = 'webpush-admin-broadcast'
            LIMIT 1
          )
          AND function_edge_logs.timestamp >= '${sinceTimestamp}'
          ORDER BY function_edge_logs.timestamp DESC
          LIMIT 1000
        `
      });

    if (logsError) {
      console.error('❌ [HARVESTER] Error fetching logs:', logsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch logs' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 [HARVESTER] Found ${logs?.length || 0} log entries`);

    const notifications: ParsedNotification[] = [];
    const processedExecutions = new Set<string>();

    // Parse logs and extract notification data
    for (const log of logs || []) {
      try {
        const executionId = log.metadata?.[0]?.execution_id || log.id;
        
        // Skip if already processed
        if (processedExecutions.has(executionId)) continue;
        processedExecutions.add(executionId);

        // Parse the log message for notification details
        let title = null, body = null, url = null, endpoint = null;
        let sentBy = null, provider = null, statusCode = null;

        // Extract from event_message if it contains JSON
        if (log.event_message) {
          try {
            // Look for JSON patterns in the message
            const jsonMatch = log.event_message.match(/\{.*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              title = parsed.title || parsed.notification?.title;
              body = parsed.body || parsed.notification?.body;
              url = parsed.url || parsed.notification?.url;
            }
          } catch (e) {
            // Try to extract key-value pairs
            const titleMatch = log.event_message.match(/title[:\s]+"([^"]+)"/i);
            const bodyMatch = log.event_message.match(/body[:\s]+"([^"]+)"/i);
            const urlMatch = log.event_message.match(/url[:\s]+"([^"]+)"/i);
            
            if (titleMatch) title = titleMatch[1];
            if (bodyMatch) body = bodyMatch[1];
            if (urlMatch) url = urlMatch[1];
          }
        }

        // Extract metadata
        const metadata = log.metadata?.[0];
        if (metadata?.response?.status_code) {
          statusCode = metadata.response.status_code;
        }

        // Try to determine provider from endpoint patterns
        if (endpoint) {
          if (endpoint.includes('fcm.googleapis.com')) provider = 'fcm';
          else if (endpoint.includes('web.push.apple.com')) provider = 'apns';
          else if (endpoint.includes('push.mozilla.org')) provider = 'mozilla';
        }

        notifications.push({
          execution_id: executionId,
          timestamp: log.timestamp,
          sent_by: sentBy,
          provider: provider,
          status_code: statusCode,
          title: title,
          body: body,
          url: url,
          endpoint: endpoint ? (endpoint.length > 100 ? endpoint.substring(0, 100) + '...' : endpoint) : null,
          project_ref: 'vkjrqirvdvjbemsfzxof'
        });

      } catch (error) {
        console.error('❌ [HARVESTER] Error parsing log entry:', error);
      }
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