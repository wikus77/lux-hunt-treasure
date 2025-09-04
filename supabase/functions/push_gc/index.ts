/*
 * M1SSION™ Push GC - Garbage Collection for Stale Endpoints
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GCRequest {
  endpoint?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint (no authorization required)
  if (req.method === 'GET' && req.url.endsWith('/health')) {
    return Response.json({ ok: true }, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    console.log('🧹 [PUSH-GC] Starting garbage collection...');

    // Verify Service Role Key for security
    const authHeader = req.headers.get('Authorization') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader.includes(serviceRoleKey || 'invalid')) {
      console.error('❌ Unauthorized: Service Role Key required');
      return Response.json(
        { error: 'Unauthorized - Service Role Key required' }, 
        { status: 403, headers: corsHeaders }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: GCRequest = await req.json();
    const { endpoint } = body;

    let deletedCount = 0;

    if (endpoint) {
      // Single endpoint cleanup
      console.log(`🗑️ Cleaning up specific endpoint: ${endpoint.substring(0, 50)}...`);
      
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint);

      if (error) {
        console.error('❌ Failed to delete endpoint:', error);
        throw new Error(`Database deletion failed: ${error.message}`);
      }

      deletedCount = 1;
      console.log(`✅ Deleted stale endpoint from database`);
    } else {
      // Bulk cleanup - this would require additional logic to test endpoints
      // For now, just return success for future implementation
      console.log('📋 Bulk GC not implemented yet - use specific endpoint');
    }

    return Response.json(
      { 
        ok: true,
        deleted: deletedCount,
        message: endpoint ? 'Specific endpoint cleaned' : 'Bulk GC pending implementation'
      }, 
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Push GC error:', error);
    return Response.json(
      { 
        ok: false,
        deleted: 0,
        error: String(error) 
      }, 
      { status: 500, headers: corsHeaders }
    );
  }
});

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */