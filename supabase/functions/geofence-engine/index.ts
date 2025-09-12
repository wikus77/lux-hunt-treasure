// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Geofence Engine - Standalone Push Orchestrator for M1SSION™

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EngineConfig {
  enabled: boolean;
  default_radius_m: number;
  hysteresis_m: number;
  cooldown_hours: number;
  quiet_hours: {
    start: string;
    end: string;
    timezone: string;
  };
  daily_cap: number;
  title_template: string;
  body_template: string;
  click_url: string;
}

interface UserPosition {
  user_id: string;
  lat: number;
  lng: number;
  updated_at: string;
}

interface Marker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  active: boolean;
}

interface DeliveryState {
  user_id: string;
  marker_id: string;
  last_enter_at: string | null;
  last_sent_at: string | null;
  enter_count: number;
  sent_count: number;
}

// Haversine distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Check if current time is in quiet hours
function isQuietHours(config: EngineConfig): boolean {
  try {
    const now = new Date();
    const rome = new Intl.DateTimeFormat('en-US', {
      timeZone: config.quiet_hours.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);
    
    const currentTime = rome.replace(':', '');
    const startTime = config.quiet_hours.start.replace(':', '');
    const endTime = config.quiet_hours.end.replace(':', '');
    
    // Handle overnight quiet hours (22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    return currentTime >= startTime && currentTime <= endTime;
  } catch (error) {
    console.warn('Error checking quiet hours:', error);
    return false;
  }
}

// Template replacement
function processTemplate(template: string, marker: Marker): string {
  return template.replace(/\{\{marker_name\}\}/g, marker.title);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('🚀 Geofence Engine started');

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vkjrqirvdvjbemsfzxof.supabase.co";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");
    
    if (!SERVICE_ROLE_KEY) {
      throw new Error("Missing SERVICE_ROLE_KEY");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    const { dry } = await req.json().catch(() => ({ dry: false }));
    const isDryRun = dry === true || req.url.includes('dry=1');
    
    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No actual notifications will be sent');
    }

    // 1. Load engine configuration
    const { data: configData, error: configError } = await supabase
      .schema('geo_push')
      .from('settings')
      .select('value')
      .eq('key', 'engine')
      .single();

    if (configError || !configData) {
      throw new Error(`Failed to load engine config: ${configError?.message}`);
    }

    const config: EngineConfig = configData.value as EngineConfig;
    
    if (!config.enabled) {
      console.log('⏹️ Engine disabled in config');
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0, 
        message: 'Engine disabled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Get recent user positions (last 15 minutes)
    const recentThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: positions, error: positionsError } = await supabase
      .from('geo_radar_coordinates')
      .select('user_id, lat, lng, updated_at')
      .gte('updated_at', recentThreshold)
      .not('lat', 'is', null)
      .not('lng', 'is', null);

    if (positionsError) {
      throw new Error(`Failed to fetch positions: ${positionsError.message}`);
    }

    // 3. Get active markers
    const { data: markers, error: markersError } = await supabase
      .from('markers')
      .select('id, title, lat, lng, active')
      .eq('active', true);

    if (markersError) {
      throw new Error(`Failed to fetch markers: ${markersError.message}`);
    }

    console.log(`📍 Processing ${positions?.length || 0} positions and ${markers?.length || 0} markers`);

    if (!positions?.length || !markers?.length) {
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0, 
        message: 'No positions or markers to process' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. Check quiet hours
    const inQuietHours = isQuietHours(config);
    if (inQuietHours) {
      console.log('🔇 In quiet hours - logging only, no sends');
    }

    let processedCount = 0;
    let sentCount = 0;

    // 5. Process each user position against each marker
    for (const position of positions as UserPosition[]) {
      // Get daily count for this user
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const { data: todayLogs } = await supabase
        .schema('geo_push')
        .from('delivery_log')
        .select('id')
        .eq('user_id', position.user_id)
        .eq('sent', true)
        .gte('created_at', todayStart.toISOString());

      const dailyCount = todayLogs?.length || 0;
      
      if (dailyCount >= config.daily_cap) {
        // Log daily cap reached
        await supabase
          .schema('geo_push')
          .from('delivery_log')
          .insert({
            user_id: position.user_id,
            marker_id: markers[0].id, // Use first marker as placeholder
            distance_m: 0,
            reason: 'DAILY_CAP',
            sent: false
          });
        continue;
      }

      for (const marker of markers as Marker[]) {
        const distance = calculateDistance(
          position.lat, 
          position.lng, 
          marker.lat, 
          marker.lng
        );

        const radius = config.default_radius_m; // Could be extended to per-marker radius
        
        if (distance <= radius) {
          // User is within geofence
          
          // Get existing state
          const { data: existingState } = await supabase
            .schema('geo_push')
            .from('delivery_state')
            .select('*')
            .eq('user_id', position.user_id)
            .eq('marker_id', marker.id)
            .single();

          const state = existingState as DeliveryState | null;
          
          // Check cooldown
          if (state?.last_sent_at) {
            const lastSent = new Date(state.last_sent_at);
            const cooldownEnd = new Date(lastSent.getTime() + config.cooldown_hours * 60 * 60 * 1000);
            
            if (new Date() < cooldownEnd) {
              // Still in cooldown
              await supabase
                .schema('geo_push')
                .from('delivery_log')
                .insert({
                  user_id: position.user_id,
                  marker_id: marker.id,
                  distance_m: distance,
                  reason: 'COOLDOWN',
                  sent: false
                });
              continue;
            }
          }

          // Check hysteresis (if recently entered, don't re-enter until exit)
          if (state?.last_enter_at) {
            const lastEnter = new Date(state.last_enter_at);
            const timeSinceEnter = Date.now() - lastEnter.getTime();
            
            // If entered recently (within hysteresis time) and distance is still close, skip
            if (timeSinceEnter < 5 * 60 * 1000 && distance <= radius - config.hysteresis_m) {
              await supabase
                .schema('geo_push')
                .from('delivery_log')
                .insert({
                  user_id: position.user_id,
                  marker_id: marker.id,
                  distance_m: distance,
                  reason: 'HYSTERESIS_SKIP',
                  sent: false
                });
              continue;
            }
          }

          // Process templates
          const title = processTemplate(config.title_template, marker);
          const body = processTemplate(config.body_template, marker);
          
          const payload = {
            title,
            body,
            url: config.click_url,
            target: {
              user_ids_csv: position.user_id
            }
          };

          let reason = 'ENTER';
          let sent = false;
          let response = null;

          // Send notification (unless in quiet hours or dry run)
          if (!inQuietHours && !isDryRun) {
            try {
              console.log(`📤 Sending notification to user ${position.user_id} for marker ${marker.title}`);
              
              const pushResponse = await fetch(`${SUPABASE_URL}/functions/v1/webpush-admin-broadcast`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify(payload)
              });

              response = {
                status: pushResponse.status,
                statusText: pushResponse.statusText,
                body: await pushResponse.text().catch(() => 'No response body')
              };

              if (pushResponse.ok) {
                reason = 'SENT';
                sent = true;
                sentCount++;
              } else {
                reason = `SEND_ERROR_${pushResponse.status}`;
              }

            } catch (error) {
              console.error('Error sending push:', error);
              reason = 'SEND_ERROR';
              response = { error: error.message };
            }
          } else if (inQuietHours) {
            reason = 'QUIET_HOURS';
          } else {
            reason = 'DRY_RUN';
          }

          // Log the event
          await supabase
            .schema('geo_push')
            .from('delivery_log')
            .insert({
              user_id: position.user_id,
              marker_id: marker.id,
              distance_m: distance,
              reason,
              title,
              body,
              payload,
              sent,
              provider: 'webpush-admin-broadcast',
              response
            });

          // Update delivery state
          await supabase
            .schema('geo_push')
            .from('delivery_state')
            .upsert({
              user_id: position.user_id,
              marker_id: marker.id,
              last_enter_at: new Date().toISOString(),
              last_sent_at: sent ? new Date().toISOString() : state?.last_sent_at,
              enter_count: (state?.enter_count || 0) + 1,
              sent_count: (state?.sent_count || 0) + (sent ? 1 : 0)
            });

          processedCount++;
        }
      }
    }

    // Update watermark
    await supabase
      .schema('geo_push')
      .from('watermarks')
      .update({ last_run_at: new Date().toISOString() })
      .eq('name', 'geofence_engine');

    const duration = Date.now() - startTime;
    console.log(`✅ Geofence engine completed in ${duration}ms - processed: ${processedCount}, sent: ${sentCount}`);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      sent: sentCount,
      dry_run: isDryRun,
      quiet_hours: inQuietHours,
      duration_ms: duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Geofence engine error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      duration_ms: Date.now() - startTime
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});