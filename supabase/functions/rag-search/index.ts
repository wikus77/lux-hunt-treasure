// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: rag-search
// Semantic search over ai_docs using pgvector

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, k = 6, embedding } = await req.json();

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 1536) {
      return new Response(
        JSON.stringify({ error: 'Invalid embedding: must be array of 1536 floats' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Call RPC function for semantic search
    const { data, error } = await supabaseClient.rpc('ai_rag_search', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: k
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        query, 
        results: data || [],
        count: data?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[rag-search] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
