import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-m1ssion-sig',
};

const AUTHORIZED_EMAIL_HASH = '9e0aefd8ff5e2879549f1bfddb3975372f9f4281ea9f9120ef90278763653c52';

type Distribution =
  | { type: 'message'; count: number; text: string }
  | { type: 'buzz_free'; count: number }
  | { type: 'xp_points'; count: number; points: number };

type Payload = { distributions: Distribution[]; visibilityHours: number };

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Auth check (same as update-mission)
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }
    
    const jwt = authHeader.slice(7);
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(jwt);
    if (userErr || !user?.email) {
      throw new Error('Invalid JWT token');
    }

    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(user.email));
    const emailHash = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2,'0')).join('');
    
    if (emailHash !== AUTHORIZED_EMAIL_HASH) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: Payload = await req.json();
    
    // Validations
    if (!payload.distributions || !Array.isArray(payload.distributions)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing distributions array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!payload.visibilityHours || payload.visibilityHours < 1) {
      return new Response(
        JSON.stringify({ success: false, error: 'visibilityHours must be >= 1' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate each distribution
    for (const dist of payload.distributions) {
      if (dist.count < 1 || dist.count > 100) {
        return new Response(
          JSON.stringify({ success: false, error: 'count must be between 1 and 100' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (dist.type === 'message' && (!dist.text || dist.text.trim().length === 0)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Message type requires non-empty text' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (dist.type === 'xp_points' && (!dist.points || dist.points < 1)) {
        return new Response(
          JSON.stringify({ success: false, error: 'XP Points type requires points >= 1' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create markers in bulk
    const createdMarkers: string[] = [];
    const details: Array<{ type: string; quantity: number }> = [];

    for (const dist of payload.distributions) {
      // Generate random coordinates within a reasonable range (example: around Rome, Italy)
      const markers = [];
      for (let i = 0; i < dist.count; i++) {
        const lat = 41.9028 + (Math.random() - 0.5) * 0.2; // Rome area
        const lng = 12.4964 + (Math.random() - 0.5) * 0.2;
        
        const marker = {
          title: dist.type === 'message' ? dist.text : `${dist.type} marker`,
          lat: lat,
          lng: lng,
          active: true,
          created_at: new Date().toISOString(),
          visible_from: new Date().toISOString(),
          visible_to: new Date(Date.now() + payload.visibilityHours * 60 * 60 * 1000).toISOString(),
          zoom_min: 1,
          zoom_max: 20,
        };
        
        markers.push(marker);
      }

      // Insert markers using service role
      const { data: insertedMarkers, error: insertError } = await supabaseAdmin
        .from('markers')
        .insert(markers)
        .select('id');

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to insert ${dist.type} markers: ${insertError.message}`);
      }

      if (insertedMarkers) {
        createdMarkers.push(...insertedMarkers.map(m => m.id));
        details.push({ type: dist.type, quantity: dist.count });
      }
    }

    // Log action
    await supabaseAdmin.from('admin_logs').insert({
      event_type: 'bulk_marker_created',
      user_id: user.id,
      details: { 
        total_created: createdMarkers.length,
        distributions: details,
        visibility_hours: payload.visibilityHours 
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        created: createdMarkers,
        total: createdMarkers.length,
        details,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (e) {
    console.error('Bulk marker drop error:', e);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: String(e?.message || e),
        stage: 'processing'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});