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

  try {
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

    // Verify user is admin
    const { data: user, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid auth' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: BulkMarkerRequest = await req.json();
    
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

    // Batch insert markers (chunk by 1000)
    let insertedCount = 0;
    const chunkSize = 1000;
    
    for (let i = 0; i < markersToInsert.length; i += chunkSize) {
      const chunk = markersToInsert.slice(i, i + chunkSize);
      const { error: insertError } = await supabase
        .from('markers')
        .insert(chunk);
        
      if (insertError) {
        console.error('Marker insert error:', insertError);
        continue;
      }
      
      insertedCount += chunk.length;
    }

    // Update drop record with actual count
    await supabase
      .from('marker_drops')
      .update({ created_count: insertedCount })
      .eq('id', dropRecord.id);

    console.log(`✅ Bulk drop completed: ${insertedCount} markers created`);

    return new Response(
      JSON.stringify({
        drop_id: dropRecord.id,
        created: insertedCount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});