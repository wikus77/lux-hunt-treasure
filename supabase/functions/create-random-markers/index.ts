// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Distribution {
  type: 'BUZZ_FREE' | 'MESSAGE' | 'XP_POINTS' | 'EVENT_TICKET' | 'BADGE';
  count: number;
  payload?: Record<string, any>;
}

interface BulkMarkerRequest {
  seed?: string;
  bbox?: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  };
  distributions: Distribution[];
  visibilityPreset?: string;
}

function generateSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return function() {
    hash = ((hash * 9301) + 49297) % 233280;
    return hash / 233280;
  };
}

function generateRandomCoordinates(
  bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  rng: () => number
): { lat: number; lng: number } {
  const lat = bbox.minLat + rng() * (bbox.maxLat - bbox.minLat);
  const lng = bbox.minLng + rng() * (bbox.maxLng - bbox.minLng);
  return { lat, lng };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const url = new URL(req.url);
  const debugMode = url.searchParams.get('debug') === '1';

  try {
    // Initialize Supabase with Service Role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user client for auth verification
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify user is admin
    const { data: user, error: userError } = await userSupabase.auth.getUser(authHeader);
    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid auth' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await userSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: BulkMarkerRequest = await req.json();
    console.log(`🚀 [${requestId}] Starting bulk marker creation: ${JSON.stringify({
      distributions: body.distributions?.length || 0,
      totalRequested: body.distributions?.reduce((sum, d) => sum + d.count, 0) || 0,
      debugMode
    })}`);;
    
    // Validate input
    if (!body.distributions || !Array.isArray(body.distributions)) {
      return new Response(
        JSON.stringify({ error: 'distributions array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const totalCount = body.distributions.reduce((sum, d) => sum + d.count, 0);
    if (totalCount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Total count must be > 0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default bbox to world
    const bbox = body.bbox || {
      minLat: -85,
      minLng: -180,
      maxLat: 85,
      maxLng: 180
    };

    const seed = body.seed || `DROP-${Date.now()}`;
    const rng = generateSeededRandom(seed);

    // Create marker drop record
    const { data: dropRecord, error: dropError } = await supabase
      .from('marker_drops')
      .insert({
        created_by: user.user.id,
        seed,
        bbox,
        summary: body.distributions
      })
      .select('id')
      .single();

    if (dropError || !dropRecord) {
      console.error('Drop creation error:', dropError);
      return new Response(
        JSON.stringify({ error: 'Failed to create drop record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate markers for each distribution
    const markersToInsert = [];
    
    for (const dist of body.distributions) {
      for (let i = 0; i < dist.count; i++) {
        const coords = generateRandomCoordinates(bbox, rng);
        
        markersToInsert.push({
          title: (dist.payload && (dist.payload.title || dist.payload.name)) || dist.type,
          lat: coords.lat,
          lng: coords.lng,
          active: true,
          reward_type: dist.type,
          reward_payload: dist.payload || {},
          drop_id: dropRecord.id,
          // Use existing marker defaults for visibility
          visible_from: new Date().toISOString(),
          visible_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });
      }
    }

    // Enhanced batch insert with detailed error tracking
    let insertedCount = 0;
    const chunkSize = 1000;
    const errors: Array<{
      code: string;
      message: string;
      hint?: string;
      payload_hash: string;
    }> = [];
    
    console.log(`📦 [${requestId}] Processing ${markersToInsert.length} markers in chunks of ${chunkSize}`);
    
    for (let i = 0; i < markersToInsert.length; i += chunkSize) {
      const chunk = markersToInsert.slice(i, i + chunkSize);
      
      try {
        const { data: insertedData, error: insertError } = await supabase
          .from('markers')
          .insert(chunk)
          .select('id');
          
        if (insertError) {
          const errorDetails = {
            code: insertError.code || 'UNKNOWN_ERROR',
            message: insertError.message || 'Unknown insertion error',
            hint: insertError.hint || undefined,
            payload_hash: `CHUNK_${i}_${chunk.length}`
          };
          errors.push(errorDetails);
          console.error(`❌ [${requestId}] Chunk ${i} failed:`, {
            code: errorDetails.code,
            message: errorDetails.message,
            chunkSize: chunk.length
          });
        } else {
          const actualInserted = insertedData?.length || 0;
          insertedCount += actualInserted;
          console.log(`✅ [${requestId}] Chunk ${i} success: ${actualInserted} markers inserted`);
        }
      } catch (chunkError) {
        const errorDetails = {
          code: 'CHUNK_EXCEPTION',
          message: chunkError instanceof Error ? chunkError.message : 'Unknown chunk error',
          payload_hash: `CHUNK_${i}_${chunk.length}`
        };
        errors.push(errorDetails);
        console.error(`💥 [${requestId}] Chunk ${i} exception:`, chunkError);
      }
    }
    
    console.log(`📊 [${requestId}] Final results: ${insertedCount} inserted, ${errors.length} errors`);

    // Update drop record with actual count
    await supabase
      .from('marker_drops')
      .update({ created_count: insertedCount })
      .eq('id', dropRecord.id);

    console.log(`📋 [${requestId}] Bulk drop completed: ${insertedCount} markers created, ${errors.length} errors`);

    // Determine response based on results
    if (insertedCount === 0 && errors.length > 0) {
      // Complete failure
      const responseBody: any = {
        drop_id: dropRecord.id,
        created: insertedCount,
        error: 'INSERT_FAILED',
        request_id: requestId
      };
      
      if (debugMode) {
        responseBody.errors = errors;
        responseBody.details = `All ${markersToInsert.length} markers failed to insert`;
      }
      
      return new Response(
        JSON.stringify(responseBody),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else if (insertedCount > 0 && errors.length > 0) {
      // Partial success
      const responseBody: any = {
        drop_id: dropRecord.id,
        created: insertedCount,
        partial_failures: errors.length,
        request_id: requestId
      };
      
      if (debugMode) {
        responseBody.errors = errors;
      }
      
      return new Response(
        JSON.stringify(responseBody),
        { 
          status: 207, // Multi-status
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Complete success
      return new Response(
        JSON.stringify({
          drop_id: dropRecord.id,
          created: insertedCount,
          request_id: requestId
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error(`💥 [${requestId}] Function error:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        request_id: requestId,
        details: debugMode ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});