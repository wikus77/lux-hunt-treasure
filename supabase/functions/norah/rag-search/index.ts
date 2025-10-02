// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI RAG Search
// Server-side embedding + semantic search

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

  const traceId = crypto.randomUUID();
  console.log(`[rag-search] traceId:${traceId} start`);

  try {
    const { query, k = 6 } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid "query" parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Generate embedding server-side using Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`[rag-search] traceId:${traceId} generating embedding for: "${query.substring(0, 50)}..."`);

    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query
      })
    });

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      console.error(`[rag-search] traceId:${traceId} embedding error:`, errText);
      throw new Error(`Embedding API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData?.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 1536) {
      throw new Error('Invalid embedding response');
    }

    // 2. Search via RPC
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabaseClient.rpc('ai_rag_search', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: k
    });

    if (error) {
      console.error(`[rag-search] traceId:${traceId} RPC error:`, error);
      throw error;
    }

    console.log(`[rag-search] traceId:${traceId} found ${data?.length || 0} results`);

    return new Response(
      JSON.stringify({ 
        query, 
        results: data || [],
        count: data?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`[rag-search] traceId:${traceId} error:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
