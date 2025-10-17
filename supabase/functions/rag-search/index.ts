// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Edge Function: rag-search
// Semantic search over ai_docs using pgvector

import { createClient } from 'https://esm.sh/v135/@supabase/supabase-js@2.45.4?target=deno';
import { preflight, json, error } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    if (req.method !== 'POST') {
      return error(req, 'Only POST allowed', 405);
    }

    const { query, k = 6, embedding } = await req.json();

    if (!embedding || !Array.isArray(embedding) || embedding.length !== 1536) {
      return error(req, 'Invalid embedding: must be array of 1536 floats', 400);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Call RPC function for semantic search
    const { data, error: dbError } = await supabaseClient.rpc('ai_rag_search', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: k
    });

    if (dbError) throw dbError;

    return json(req, { 
      query, 
      results: data || [],
      count: data?.length || 0 
    });
  } catch (e: any) {
    console.error('[rag-search] Error:', e);
    return error(req, String(e?.message || e), 500);
  }
});

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
