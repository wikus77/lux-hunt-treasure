// Mirror Push Log Harvester - Extract push logs and save to mirror_push.notification_logs
import { corsHeaders } from '../_shared/cors.ts';

interface RequestPayload {
  title: string;
  body: string;
  url?: string | null;
  target: 'all' | { userIds: string[] };
}

interface ResponsePayload {
  status: string;
  success: number;
  failed: number;
  deactivated: number;
  total: number;
  details?: Array<{
    user_id?: string;
    code?: number;
    endpoint?: string;
    status?: string;
  }>;
}

function getProviderFromEndpoint(endpoint: string): string {
  if (!endpoint) return 'UNKNOWN';
  if (endpoint.includes('web.push.apple.com')) return 'APPLE';
  if (endpoint.includes('fcm.googleapis.com')) return 'FCM';
  return 'UNKNOWN';
}

function extractAuthUserId(headers: Record<string, string>): string | null {
  const authHeader = headers['authorization'] || headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  try {
    // Simple JWT decode (just the payload part)
    const token = authHeader.substring(7);
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Create Supabase client with service role for database operations
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.4');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🚀 Mirror Push Log Harvester started');

    // Get the last harvest timestamp
    const { data: watermark, error: watermarkError } = await supabase
      .schema('mirror_push')
      .from('sync_watermarks')
      .select('last_run_at')
      .eq('name', 'harvester')
      .single();

    if (watermarkError) {
      console.error('❌ Error fetching watermark:', watermarkError);
      throw new Error('Failed to fetch watermark');
    }

    const lastHarvestTime = watermark?.last_run_at || '1970-01-01T00:00:00Z';
    console.log('📅 Last harvest time:', lastHarvestTime);

    // Use Supabase Analytics query to get function logs
    const { data: logs, error: logsError } = await supabase.rpc('supabase_analytics_query', {
      query: `
        select id, function_edge_logs.timestamp, event_message, m.function_id, m.execution_time_ms, m.deployment_id, m.version, request, response
        from function_edge_logs
        cross join unnest(metadata) as m
        cross join unnest(m.request) as request  
        cross join unnest(m.response) as response
        where m.function_name = 'webpush-admin-broadcast'
          and response.status_code = 200
          and function_edge_logs.timestamp > '${lastHarvestTime}'
        order by timestamp asc
        limit 100
      `
    });

    if (logsError) {
      console.error('❌ Error fetching logs:', logsError);
      console.log('⚠️ No analytics access, using fallback from public.push_notification_logs');

      // Fallback: ingest incremental deltas from panel logs
      const { data: panelLogs, error: panelError } = await supabase
        .from('push_notification_logs')
        .select('id, created_at, sent_at, admin_user_id, target_user_id, title, message, status')
        .or(`created_at.gt.${lastHarvestTime},sent_at.gt.${lastHarvestTime}`)
        .order('created_at', { ascending: true })
        .limit(200);

      if (panelError) {
        console.error('❌ Fallback error fetching panel logs:', panelError);
        return new Response(JSON.stringify({ 
          success: false, 
          processed: 0, 
          message: 'Fallback failed: cannot read public.push_notification_logs',
          error: panelError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let processedCount = 0;
      let latestTs = lastHarvestTime as string;
      const notifications: any[] = [];

      for (const row of panelLogs ?? []) {
        notifications.push({
          created_at: row.created_at || row.sent_at || new Date().toISOString(),
          sent_at: row.sent_at || row.created_at,
          sent_by: row.admin_user_id,
          provider: 'PANEL',
          status_code: row.status === 'sent' ? 200 : row.status === 'failed' ? 500 : 202,
          title: row.title,
          body: row.message,
          url: null,
          endpoint: null,
          project_ref: 'vkjrqirvdvjbemsfzxof',
          user_id: row.target_user_id || null,
          invocation_id: `panel:${row.id}`,
          metadata: { source: 'panel' }
        });

        const cand = row.sent_at || row.created_at;
        if (cand && cand > latestTs) latestTs = cand;
        processedCount++;
      }

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .schema('mirror_push')
          .from('notification_logs')
          .insert(notifications);
        if (insertError) {
          console.error('❌ Error inserting fallback notifications:', insertError);
          return new Response(JSON.stringify({ 
            success: false, 
            processed: processedCount, 
            message: 'Insert failed in fallback',
            error: insertError.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { error: updateError } = await supabase
          .schema('mirror_push')
          .from('sync_watermarks')
          .update({ last_run_at: latestTs })
          .eq('name', 'harvester');
        if (updateError) {
          console.error('❌ Error updating watermark (fallback):', updateError);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        processed: processedCount, 
        inserted: notifications.length,
        latest_timestamp: latestTs,
        path: 'fallback_panel'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Found ${logs?.length || 0} log entries to process`);

    if (!logs || logs.length === 0) {
      console.log('✅ No new logs to process');
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0, 
        message: 'No new logs to process' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let processedCount = 0;
    let latestTimestamp = lastHarvestTime;
    const notifications = [];

    // Process each log entry
    for (const log of logs) {
      try {
        console.log(`🔄 Processing log ${log.id} from ${log.timestamp}`);

        let requestPayload: RequestPayload | null = null;
        let responsePayload: ResponsePayload | null = null;
        let authUserId: string | null = null;

        // Parse request body
        if (log.request?.body) {
          try {
            requestPayload = JSON.parse(log.request.body);
          } catch (e) {
            console.warn(`⚠️ Failed to parse request body for log ${log.id}:`, e);
          }
        }

        // Parse response body
        if (log.response?.body) {
          try {
            responsePayload = JSON.parse(log.response.body);
          } catch (e) {
            console.warn(`⚠️ Failed to parse response body for log ${log.id}:`, e);
          }
        }

        // Extract auth user ID from request headers
        if (log.request?.headers) {
          authUserId = extractAuthUserId(log.request.headers);
        }

        // If we have response details, create individual records
        if (responsePayload?.details && responsePayload.details.length > 0) {
          for (const detail of responsePayload.details) {
            const provider = getProviderFromEndpoint(detail.endpoint || '');
            
            notifications.push({
              created_at: new Date().toISOString(),
              sent_at: log.timestamp,
              sent_by: authUserId,
              provider: provider,
              status_code: detail.code || log.response?.status_code || 200,
              title: requestPayload?.title || null,
              body: requestPayload?.body || null,
              url: requestPayload?.url || null,
              endpoint: detail.endpoint || null,
              project_ref: 'vkjrqirvdvjbemsfzxof',
              user_id: detail.user_id || null,
              invocation_id: log.id,
              metadata: {
                execution_id: log.id,
                target: requestPayload?.target || null,
                response_status: detail.status || 'sent'
              }
            });
          }
        } else {
          // Create aggregate record for the invocation
          notifications.push({
            created_at: new Date().toISOString(),
            sent_at: log.timestamp,
            sent_by: authUserId,
            provider: 'HARVESTER',
            status_code: log.response?.status_code || 200,
            title: requestPayload?.title || null,
            body: requestPayload?.body || null,
            url: requestPayload?.url || null,
            endpoint: null,
            project_ref: 'vkjrqirvdvjbemsfzxof',
            user_id: null,
            invocation_id: log.id,
            metadata: {
              execution_id: log.id,
              target: requestPayload?.target || null,
              total_sent: responsePayload?.total || 0,
              success_count: responsePayload?.success || 0,
              failed_count: responsePayload?.failed || 0,
              deactivated_count: responsePayload?.deactivated || 0
            }
          });
        }

        processedCount++;
        latestTimestamp = log.timestamp;

      } catch (error) {
        console.error(`❌ Error processing log ${log.id}:`, error);
      }
    }

    // Batch insert notifications
    if (notifications.length > 0) {
      console.log(`💾 Inserting ${notifications.length} notification records`);
      
      const { error: insertError } = await supabase
        .schema('mirror_push')
        .from('notification_logs')
        .insert(notifications);

      if (insertError) {
        console.error('❌ Error inserting notifications:', insertError);
        throw new Error('Failed to insert notification logs');
      }
    }

    // Update watermark
    const { error: updateError } = await supabase
      .schema('mirror_push')
      .from('sync_watermarks')
      .update({ last_run_at: latestTimestamp })
      .eq('name', 'harvester');

    if (updateError) {
      console.error('❌ Error updating watermark:', updateError);
      throw new Error('Failed to update watermark');
    }

    console.log('✅ Harvesting completed successfully');
    console.log(`📈 Processed: ${processedCount} logs, Inserted: ${notifications.length} notifications`);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      inserted: notifications.length,
      latest_timestamp: latestTimestamp
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Harvester error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});