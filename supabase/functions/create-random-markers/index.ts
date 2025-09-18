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

function validateLatLng(lat: number, lng: number): boolean {
  // Strict DB constraints alignment: lat [-90,90], lng [-180,180]
  return lat >= -90.0 && lat <= 90.0 && lng >= -180.0 && lng <= 180.0 && 
         !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
}

function generateValidCoordinates(
  bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number },
  rng: () => number,
  maxAttempts: number = 10
): { lat: number; lng: number } | null {
  // Strict DB constraint enforcement: lat [-90,90], lng [-180,180]
  const safeBbox = {
    minLat: Math.max(-90.0, Math.min(90.0, bbox.minLat)),
    maxLat: Math.max(-90.0, Math.min(90.0, bbox.maxLat)),
    minLng: Math.max(-180.0, Math.min(180.0, bbox.minLng)),
    maxLng: Math.max(-180.0, Math.min(180.0, bbox.maxLng))
  };
  
  // Validate bbox makes sense
  if (safeBbox.minLat >= safeBbox.maxLat || safeBbox.minLng >= safeBbox.maxLng) {
    return null;
  }
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const lat = safeBbox.minLat + rng() * (safeBbox.maxLat - safeBbox.minLat);
    const lng = safeBbox.minLng + rng() * (safeBbox.maxLng - safeBbox.minLng);
    
    // Double validation before returning
    if (validateLatLng(lat, lng)) {
      return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
    }
  }
  
  return null; // Failed to generate valid coordinates after maxAttempts
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

    const fullAuthz = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const token = fullAuthz.replace(/^Bearer\s+/i, '');
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user-scoped client that propagates the caller JWT to PostgREST
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";
    const userSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      anonKey,
      { global: { headers: { Authorization: fullAuthz } } }
    );

    // Verify user identity
    const { data: user, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid auth' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve role via profiles (admin/owner), with secure fallbacks
    let role = '';
    let isAllowed = false;

    try {
      const { data: profile } = await userSupabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.user.id)
        .maybeSingle();
      role = (profile?.role || '').toLowerCase();
      isAllowed = role === 'admin' || role === 'owner';
    } catch (_) {
      // ignore
    }

    if (!isAllowed) {
      try {
        const { data: rpcIsAdmin } = await userSupabase.rpc('is_admin_secure');
        isAllowed = rpcIsAdmin === true;
      } catch (_) { /* ignore */ }
    }

    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Admin access required', request_id: requestId }),
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

    // Default bbox to world (strict DB constraints: lat [-90,90], lng [-180,180])
    const bbox = body.bbox || {
      minLat: -89.0,
      minLng: -179.0,
      maxLat: 89.0,
      maxLng: 179.0
    };

    const seed = body.seed || `DROP-${Date.now()}`;
    const rng = generateSeededRandom(seed);

    // Create marker drop record (graceful if table missing)
    let dropId: string | null = null;
    try {
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

      if (!dropError && dropRecord?.id) {
        dropId = dropRecord.id;
      } else if (dropError) {
        // Table might not exist in some environments: continue without drop record
        console.warn(`[${requestId}] marker_drops insert skipped:`, {
          code: dropError.code,
          message: dropError.message,
        });
      }
    } catch (e) {
      console.warn(`[${requestId}] marker_drops insert exception, proceeding without drop record`);
    }

    // Generate markers for each distribution
    const markersToInsert = [] as any[];
    const coordinateFailures: Array<{ type: string; reason: string }> = [];
    const visibleFrom = (body as any).visible_from ?? new Date().toISOString();
    const visibleTo = (body as any).visible_to ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    for (const dist of body.distributions) {
      for (let i = 0; i < dist.count; i++) {
        const coords = generateValidCoordinates(bbox, rng, 10);
        
        if (!coords) {
          coordinateFailures.push({
            type: dist.type,
            reason: `Failed to generate valid coordinates after 10 attempts for ${dist.type}`
          });
          continue; // Skip this marker
        }
        
        // Triple validation before insert preparation
        if (!validateLatLng(coords.lat, coords.lng)) {
          coordinateFailures.push({
            type: dist.type,
            reason: `Generated coordinates failed final validation: lat=${coords.lat}, lng=${coords.lng}`
          });
          continue;
        }
        
        const markerRow: Record<string, any> = {
          title: (dist.payload && (dist.payload.title || dist.payload.name)) || dist.type,
          lat: coords.lat,
          lng: coords.lng,
          active: true,
          reward_type: dist.type,
          reward_payload: dist.payload || {},
          visible_from: visibleFrom,
          visible_to: visibleTo
        };
        if (dropId) markerRow.drop_id = dropId;
        markersToInsert.push(markerRow);
      }
    }
    
    // Log coordinate generation issues
    if (coordinateFailures.length > 0) {
      console.warn(`[${requestId}] Coordinate generation failures:`, coordinateFailures);
    }

    // Add coordinate failures to errors array
    const errors: Array<{
      code: string;
      message: string;
      hint?: string;
      payload_hash: string;
      sqlState?: string;
    }> = [];
    
    coordinateFailures.forEach((failure, index) => {
      errors.push({
        code: 'VALIDATION_FAILED',
        message: failure.reason,
        payload_hash: `COORD_FAIL_${index}`,
        sqlState: 'VALIDATION_FAILED'
      });
    });

    // Enhanced batch insert with detailed error tracking
    let insertedCount = 0;
    const chunkSize = 1000;
    
    console.log(`📦 [${requestId}] Processing ${markersToInsert.length} markers in chunks of ${chunkSize}`);
    
    for (let i = 0; i < markersToInsert.length; i += chunkSize) {
      const chunk = markersToInsert.slice(i, i + chunkSize);
      try {
        const { data: insertedData, error: insertError } = await supabase
          .from('markers')
          .insert(chunk)
          .select('id');

        if (insertError) {
          // Detailed error handling by error type
          const errorDetails = {
            code: insertError.code || 'INSERT_FAILED',
            message: insertError.message || 'Insert failed',
            hint: insertError.hint || undefined,
            payload_hash: `CHUNK_${i}_${chunk.length}`,
            sqlState: insertError.code
          };
          
          console.error('INSERT_FAILED', { 
            request_id: requestId, 
            sqlState: insertError.code, 
            message: insertError.message,
            chunkSize: chunk.length
          });

          // Handle specific constraint violations
          if (insertError.code === '23514') {
            // Constraint violation - don't retry with RPC for coordinate issues
            errors.push({
              ...errorDetails,
              message: `Constraint violation: ${insertError.message} (likely invalid coordinates)`
            });
          } else {
            // Try RPC fallback for other errors (ENUM casting, etc.)
            let rpcInserted = 0;
            try {
              const { data: rpcData, error: rpcErr } = await supabase
                .rpc('fn_markers_bulk_insert', { _rows: chunk, _drop_id: dropId });
              if (rpcErr) {
                errors.push({
                  code: rpcErr.code || 'RPC_FAILED',
                  message: rpcErr.message || 'RPC fallback failed',
                  hint: rpcErr.hint || undefined,
                  payload_hash: `RPC_CHUNK_${i}_${chunk.length}`,
                  sqlState: rpcErr.code
                });
                console.error('RPC_FAILED', { 
                  request_id: requestId, 
                  sqlState: rpcErr.code, 
                  message: rpcErr.message,
                  chunkSize: chunk.length
                });
              } else {
                rpcInserted = rpcData?.length || 0;
                insertedCount += rpcInserted;
                console.log(`✅ [${requestId}] Chunk ${i} RPC fallback success: ${rpcInserted} inserted`);
              }
            } catch (rpcException) {
              errors.push({
                code: 'RPC_EXCEPTION',
                message: rpcException instanceof Error ? rpcException.message : 'Unknown RPC exception',
                payload_hash: `RPC_EXC_${i}_${chunk.length}`,
                sqlState: 'RPC_EXCEPTION'
              });
              console.error(`💥 [${requestId}] Chunk ${i} RPC exception:`, rpcException);
            }
          }
        } else {
          const actualInserted = insertedData?.length || 0;
          insertedCount += actualInserted;
          console.log(`✅ [${requestId}] Chunk ${i} success: ${actualInserted} markers inserted`);
        }
      } catch (chunkError) {
        const errorDetails = {
          code: 'CHUNK_EXCEPTION',
          message: chunkError instanceof Error ? chunkError.message : 'Unknown chunk error',
          payload_hash: `CHUNK_${i}_${chunk.length}`,
          sqlState: 'CHUNK_EXCEPTION'
        };
        errors.push(errorDetails);
        console.error(`💥 [${requestId}] Chunk ${i} exception:`, chunkError);
      }
    }
    
    console.log(`📊 [${requestId}] Final results: ${insertedCount} inserted, ${errors.length} errors`);

    // Update drop record with actual count if present
    if (dropId) {
      await supabase
        .from('marker_drops')
        .update({ created_count: insertedCount })
        .eq('id', dropId);
    }

    console.log(`📋 [${requestId}] Bulk drop completed: ${insertedCount} markers created, ${errors.length} errors`);

    // Determine response based on results
    if (insertedCount === 0 && errors.length > 0) {
      // Complete failure
      const responseBody: any = {
        drop_id: dropId,
        created: insertedCount,
        error: 'INSERT_FAILED',
        request_id: requestId
      };
      
      if (debugMode) {
        responseBody.errors = errors.map(err => ({
          ...err,
          sqlState: err.code
        }));
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
        drop_id: dropId,
        created: insertedCount,
        partial_failures: errors.length,
        request_id: requestId
      };
      
      if (debugMode) {
        responseBody.errors = errors.map(err => ({
          ...err,
          sqlState: err.code
        }));
      }
      
      return new Response(
        JSON.stringify(responseBody),
        { 
          status: 207, // Multi-status
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Complete success - fetch created markers for response
      let createdMarkers: any[] = [];
      if (dropId) {
        try {
          const { data: markersData } = await supabase
            .from('markers')
            .select('id')
            .eq('drop_id', dropId);
          createdMarkers = markersData || [];
        } catch (e) {
          // Continue without markers list
        }
      }
      
      return new Response(
        JSON.stringify({
          drop_id: dropId,
          created: insertedCount,
          markers: createdMarkers,
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