// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

// M1SSION™ Edge Function: Secure Bulk Marker Drop
// Hardened with header validation, admin gate, and audit trail

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DistributionRequest {
  type: string;
  count: number;
}

interface BulkDropRequest {
  distributions: DistributionRequest[];
  visibility?: { hours: number };
  bbox?: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  };
}

const ALLOWED_ORIGINS = [
  'https://m1ssion.eu',
  'https://www.m1ssion.eu', 
  'https://m1ssion.pages.dev',
  'http://localhost:3000',
  'https://localhost:3000'
];

const validateSecurityHeaders = (req: Request): { valid: boolean; error?: string } => {
  const version = req.headers.get('X-M1-Dropper-Version');
  const codeHash = req.headers.get('X-M1-Code-Hash');
  const origin = req.headers.get('Origin');
  
  if (version !== 'v1') {
    return { valid: false, error: 'Missing or invalid X-M1-Dropper-Version header' };
  }
  
  if (!codeHash || !/^[a-f0-9]{64}$/.test(codeHash)) {
    return { valid: false, error: 'Missing or invalid X-M1-Code-Hash header' };
  }
  
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return { valid: false, error: 'Origin not in allowlist' };
  }
  
  return { valid: true };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-m1-dropper-version, x-m1-code-hash',
};

function generateSeededRandom(seed?: string): () => number {
  if (!seed) return Math.random;
  
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
  // Strict DB constraints: lat [-90,90], lng [-180,180]
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
    
    // Triple validation before returning
    if (validateLatLng(lat, lng)) {
      return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
    }
  }
  
  return null;
}

serve(async (req) => {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`🚀 [${requestId}] Starting secure bulk marker creation`);

    // Security: Validate required headers first
    const headerValidation = validateSecurityHeaders(req);
    if (!headerValidation.valid) {
      console.log(`❌ [${requestId}] Header validation failed: ${headerValidation.error}`);
      return new Response(
        JSON.stringify({ 
          error: headerValidation.error, 
          request_id: requestId 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const body: BulkDropRequest = await req.json();
    const debugMode = new URL(req.url).searchParams.get('debug') === '1';

    console.log(`📊 [${requestId}] Request details:`, {
      distributions: body.distributions?.length || 0,
      totalRequested: body.distributions?.reduce((sum, d) => sum + d.count, 0) || 0,
      debugMode
    });

    // Validate distributions
    if (!body.distributions || !Array.isArray(body.distributions) || body.distributions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'distributions array is required and must not be empty', 
          request_id: requestId 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const totalRequested = body.distributions.reduce((sum, d) => sum + (d.count || 0), 0);
    if (totalRequested <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Total marker count must be greater than 0', 
          request_id: requestId 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with auth propagation
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`❌ [${requestId}] Missing environment variables`);
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error', 
          request_id: requestId 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' }
      }
    });

    // Security gate: validate admin/owner role
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      console.log(`❌ [${requestId}] Authentication failed`);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required', 
          request_id: requestId 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use secure RPC to check admin role
    const { data: isAdminResult, error: adminError } = await supabase
      .rpc('is_admin_secure', { p_uid: authUser.user.id });

    if (adminError || !isAdminResult) {
      console.log(`❌ [${requestId}] Admin check failed:`, adminError);
      return new Response(
        JSON.stringify({ 
          error: 'Admin or Owner role required', 
          request_id: requestId 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Default bbox with strict constraints
    const bbox = body.bbox || {
      minLat: -89.0,
      minLng: -179.0,
      maxLat: 89.0,
      maxLng: 179.0
    };

    // Create drop record (optional audit trail)
    let dropId: string | null = null;
    try {
      const { data: dropRecord, error: dropError } = await supabase
        .from('marker_drops')
        .insert({
          created_by: authUser.user.id,
          bbox,
          summary: body.distributions
        })
        .select('id')
        .single();

      if (!dropError && dropRecord?.id) {
        dropId = dropRecord.id;
        
        // Audit the drop request
        await supabase.rpc('audit_drop_request', {
          p_drop_id: dropId,
          p_payload: {
            distributions: body.distributions,
            bbox,
            request_id: requestId,
            headers: {
              version: req.headers.get('X-M1-Dropper-Version'),
              codeHash: req.headers.get('X-M1-Code-Hash')?.substring(0, 12)
            }
          }
        });
      }
    } catch (e) {
      console.warn(`[${requestId}] Drop record creation failed:`, e);
    }

    // Generate markers using secure RPC
    const rng = generateSeededRandom(body.visibility?.hours?.toString());
    let insertedCount = 0;
    let partialFailures = 0;
    const errors: any[] = [];

    for (const dist of body.distributions) {
      for (let i = 0; i < dist.count; i++) {
        const coords = generateValidCoordinates(bbox, rng, 10);
        
        if (!coords) {
          partialFailures++;
          errors.push({
            type: dist.type,
            reason: `Failed to generate valid coordinates after 10 attempts`,
            code: 'VALIDATION_FAILED'
          });
          continue;
        }
        
        // Final validation before RPC call
        if (!validateLatLng(coords.lat, coords.lng)) {
          partialFailures++;
          errors.push({
            type: dist.type,
            reason: `Generated coordinates failed final validation: lat=${coords.lat}, lng=${coords.lng}`,
            code: 'VALIDATION_FAILED'
          });
          continue;
        }

        try {
          // Use secure RPC for marker insertion
          const { data: markerId, error: insertError } = await supabase
            .rpc('fn_markers_secure_insert', {
              p_drop_id: dropId,
              p_title: `${dist.type} Marker`,
              p_lat: coords.lat,
              p_lng: coords.lng,
              p_reward_type: dist.type as any,
              p_reward_payload: {}
            });

          if (insertError) {
            console.error(`❌ [${requestId}] RPC insert failed:`, insertError);
            partialFailures++;
            errors.push({
              type: dist.type,
              reason: insertError.message,
              code: insertError.code || 'RPC_FAILED',
              sqlState: insertError.details || 'unknown'
            });
          } else {
            insertedCount++;
            console.log(`✅ [${requestId}] Marker inserted: ${markerId}`);
          }
        } catch (e) {
          partialFailures++;
          errors.push({
            type: dist.type,
            reason: e instanceof Error ? e.message : 'Unknown RPC error',
            code: 'RPC_EXCEPTION'
          });
        }
      }
    }

    // Update drop record with results
    if (dropId) {
      await supabase
        .from('marker_drops')
        .update({ created_count: insertedCount })
        .eq('id', dropId);
    }

    console.log(`📋 [${requestId}] Bulk drop completed: ${insertedCount} markers created, ${errors.length} errors`);

    // Build response
    const responseData: any = {
      created: insertedCount,
      drop_id: dropId,
      request_id: requestId
    };

    // Handle partial success
    if (partialFailures > 0) {
      responseData.partial_failures = partialFailures;
      if (debugMode) {
        responseData.errors = errors.slice(0, 10); // Limit error details in debug mode
      }
      
      return new Response(
        JSON.stringify(responseData),
        { 
          status: 207, // Multi-Status
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Request-ID': requestId
          } 
        }
      );
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        } 
      }
    );

  } catch (error) {
    console.error(`💥 [${requestId}] Unhandled error:`, error);
    
    const errorResponse: any = {
      error: 'Internal server error',
      request_id: requestId
    };
    
    // Include error details only in debug mode
    const debugMode = new URL(req.url).searchParams.get('debug') === '1';
    if (debugMode) {
      errorResponse.details = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        } 
      }
    );
  }
});